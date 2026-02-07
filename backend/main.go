package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"bytes"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"
)

const (
	CurrentAppVersion = "3.9.2"
	DefaultAPIURL     = "https://api-s.anixsekai.com"
	DefaultUserAgent  = "AnixartApp/9.0 BETA 5-25062213 (Android 9; SDK 28; arm64-v8a; samsung SM-G975N; en)"
)

type Config struct {
	Port         string
	APIURL       string
	ChangelogDir string
	CORSOrigin   string
}

func main() {
	cfg := loadConfig()

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", handleHealthz)
	mux.HandleFunc("/api/version", withCORS(cfg, handleVersion(cfg)))
	mux.HandleFunc("/api/version/", withCORS(cfg, handleVersion(cfg)))
	mux.HandleFunc("/api/proxy/", withCORS(cfg, handleProxy(cfg)))

	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      loggingMiddleware(mux),
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("xart backend listening on :%s", cfg.Port)
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("server error: %v", err)
	}
}

func loadConfig() Config {
	port := getenv("PORT", "8080")
	apiURL := getenv("API_URL", DefaultAPIURL)
	changelogDir := getenv("CHANGELOG_DIR", filepath.FromSlash("../frontend/public/changelog"))
	corsOrigin := getenv("CORS_ORIGIN", "*")

	return Config{
		Port:         port,
		APIURL:       strings.TrimRight(apiURL, "/"),
		ChangelogDir: changelogDir,
		CORSOrigin:   corsOrigin,
	}
}

func handleHealthz(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func handleVersion(cfg Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		files, err := os.ReadDir(cfg.ChangelogDir)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{
				"error": fmt.Sprintf("failed to read changelog dir: %v", err),
			})
			return
		}

		previous := make([]string, 0, len(files))
		for _, file := range files {
			if file.IsDir() {
				continue
			}
			name := file.Name()
			if !strings.HasSuffix(name, ".md") {
				continue
			}
			version := strings.TrimSuffix(name, ".md")
			if version == CurrentAppVersion {
				continue
			}
			previous = append(previous, version)
		}

		sort.Slice(previous, func(i, j int) bool {
			return compareVersions(previous[i], previous[j]) > 0
		})

		writeJSON(w, http.StatusOK, map[string]any{
			"version":  CurrentAppVersion,
			"previous": previous,
		})
	}
}

func handleProxy(cfg Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		path := strings.TrimPrefix(r.URL.Path, "/api/proxy/")
		if path == "" {
			http.NotFound(w, r)
			return
		}

		query := r.URL.Query()
		apiVersion := ""
		if query.Get("API-Version") == "v2" {
			apiVersion = "v2"
			query.Del("API-Version")
		}
		if apiVersion == "" {
			if r.Header.Get("api-version") == "v2" || r.Header.Get("API-Version") == "v2" {
				apiVersion = "v2"
			}
		}

		target := fmt.Sprintf("%s/%s", cfg.APIURL, path)
		if encoded := query.Encode(); encoded != "" {
			target = target + "?" + encoded
		}

		req, err := newProxyRequest(r, target)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{
				"error": err.Error(),
			})
			return
		}

		req.Header.Set("User-Agent", DefaultUserAgent)
		if apiVersion == "v2" {
			req.Header.Set("API-Version", "v2")
		}

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{
				"error": err.Error(),
			})
			return
		}
		defer resp.Body.Close()

		copyHeaders(w.Header(), resp.Header)
		w.WriteHeader(resp.StatusCode)
		if _, err := io.Copy(w, resp.Body); err != nil {
			log.Printf("proxy response copy error: %v", err)
		}
	}
}

func newProxyRequest(r *http.Request, target string) (*http.Request, error) {
	u, err := url.Parse(target)
	if err != nil {
		return nil, fmt.Errorf("invalid target url: %w", err)
	}

	var body io.Reader
	if r.Body != nil {
		defer r.Body.Close()
		raw, err := io.ReadAll(r.Body)
		if err != nil {
			return nil, fmt.Errorf("failed to read request body: %w", err)
		}
		body = bytes.NewReader(raw)
	}

	req, err := http.NewRequest(r.Method, u.String(), body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	for _, key := range []string{"Content-Type", "Accept", "Sign"} {
		if value := r.Header.Get(key); value != "" {
			req.Header.Set(key, value)
		}
	}
	if r.Method == http.MethodPost && req.Header.Get("Content-Type") == "" {
		req.Header.Set("Content-Type", "application/json; charset=UTF-8")
	}

	return req, nil
}

func compareVersions(a, b string) int {
	aParts := versionParts(a)
	bParts := versionParts(b)
	maxLen := len(aParts)
	if len(bParts) > maxLen {
		maxLen = len(bParts)
	}
	for i := 0; i < maxLen; i++ {
		var av, bv int
		if i < len(aParts) {
			av = aParts[i]
		}
		if i < len(bParts) {
			bv = bParts[i]
		}
		if av == bv {
			continue
		}
		if av > bv {
			return 1
		}
		return -1
	}
	return 0
}

func versionParts(value string) []int {
	parts := strings.Split(value, ".")
	out := make([]int, 0, len(parts))
	for _, part := range parts {
		if part == "" {
			out = append(out, 0)
			continue
		}
		num, err := strconv.Atoi(part)
		if err != nil {
			out = append(out, 0)
			continue
		}
		out = append(out, num)
	}
	return out
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	enc := json.NewEncoder(w)
	if err := enc.Encode(payload); err != nil {
		log.Printf("json encode error: %v", err)
	}
}

func copyHeaders(dst, src http.Header) {
	for key, values := range src {
		for _, value := range values {
			dst.Add(key, value)
		}
	}
}

func withCORS(cfg Config, handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", cfg.CORSOrigin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, API-Version, Api-Version, Sign")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		handler(w, r)
	}
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start))
	})
}

func getenv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
