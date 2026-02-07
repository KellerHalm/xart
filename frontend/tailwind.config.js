const { addIconSelectors } = require("@iconify/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "class",
  plugins: [
    addIconSelectors([
      "mdi",
      "material-symbols",
      "twemoji",
      "fa6-brands",
      "solar",
    ]),
    require("tailwind-scrollbar"),
  ],
  theme: {
    extend: {
      animation: {
        bg_zoom: "bg_zoom 150ms linear",
        bg_zoom_rev: "bg_zoom_rev 150ms linear",
      },
      keyframes: {
        bg_zoom: {
          "0%": {
            "background-size": "100% auto",
          },
          "100%": {
            "background-size": "110% auto",
          },
        },
        bg_zoom_rev: {
          "0%": {
            "background-size": "110% auto",
          },
          "100%": {
            "background-size": "100% auto",
          },
        },
      },
    },
  },
};
