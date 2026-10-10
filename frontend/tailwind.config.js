/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1116",
        panel: "#161B22",
        line: "#232A34",
        mint: "#3DDC97",
        rose: "#F2545B",
        sand: "#C9A227",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
