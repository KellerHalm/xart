import { defineStore, type PiniaPluginContext } from "pinia";

type PreferencesState = {
  _hasHydrated: boolean;
  flags: {
    saveWatchHistory: boolean;
    showChangelog: boolean;
    showFifthButton: null | string;
    theme: "light" | "dark";
  };
  params: {
    isFirstLaunch: boolean;
    version: string;
    skipToCategory: {
      enabled: boolean;
      homeCategory: string;
      bookmarksCategory: string;
    };
    experimental: {
      newPlayer: boolean;
    };
  };
};

export const usePreferencesStore = defineStore("preferences", {
  state: (): PreferencesState => ({
    _hasHydrated: false,
    flags: {
      saveWatchHistory: true,
      showChangelog: true,
      showFifthButton: "discovery",
      theme: "dark",
    },
    params: {
      isFirstLaunch: true,
      version: "3.0.0",
      skipToCategory: {
        enabled: false,
        homeCategory: "last",
        bookmarksCategory: "watching",
      },
      experimental: {
        newPlayer: false,
      },
    },
  }),
  actions: {
    setHasHydrated(state: boolean) {
      this._hasHydrated = state;
    },
    setFlags(flags: Partial<PreferencesState["flags"]>) {
      this.flags = { ...this.flags, ...flags };
    },
    setParams(params: Partial<PreferencesState["params"]>) {
      this.params = { ...this.params, ...params };
    },
  },
  persist: {
    key: "preferences",
    storage: localStorage,
    afterHydrate: (context: PiniaPluginContext) => {
      context.store.setHasHydrated(true);
    },
  },
});
