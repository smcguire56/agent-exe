/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          '"Consolas"',
          '"Courier New"',
          "monospace",
        ],
        sans: ['"Inter"', '"Segoe UI"', "system-ui", "sans-serif"],
      },
      colors: {
        shell: {
          bg: "#0a0e14",
          panel: "#11161d",
          panel2: "#161c25",
          border: "#2a3340",
          borderLight: "#3a4554",
          text: "#c5d0dc",
          dim: "#6b7886",
          accent: "#39ff14",
          cyan: "#00e5ff",
          warn: "#ffcc00",
          danger: "#ff3860",
          good: "#39ff14",
        },
      },
      boxShadow: {
        chunky:
          "inset -2px -2px 0 0 #0a0e14, inset 2px 2px 0 0 #3a4554",
        chunkyIn:
          "inset 2px 2px 0 0 #0a0e14, inset -2px -2px 0 0 #3a4554",
      },
      keyframes: {
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
      animation: {
        blink: "blink 1s steps(1) infinite",
        scanline: "scanline 8s linear infinite",
      },
    },
  },
  plugins: [],
};
