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
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "flash-green": {
          "0%": { color: "#39ff14", textShadow: "0 0 8px #39ff14" },
          "100%": { color: "inherit", textShadow: "none" },
        },
        "flash-red": {
          "0%": { backgroundColor: "rgba(255, 56, 96, 0.3)" },
          "100%": { backgroundColor: "transparent" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "suspicion-pulse": {
          "0%, 100%": { textShadow: "none" },
          "50%": { textShadow: "0 0 8px #ff3860" },
        },
        "meltdown-flash": {
          "0%, 100%": { color: "#ff3860", textShadow: "0 0 12px #ff3860" },
          "50%": { color: "#ff8c42", textShadow: "0 0 12px #ff8c42" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-2px)" },
          "40%": { transform: "translateX(2px)" },
          "60%": { transform: "translateX(-1px)" },
          "80%": { transform: "translateX(1px)" },
        },
      },
      animation: {
        blink: "blink 1s steps(1) infinite",
        scanline: "scanline 8s linear infinite",
        "slide-in": "slide-in 0.3s ease-out",
        "flash-green": "flash-green 0.6s ease-out",
        "flash-red": "flash-red 0.5s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "suspicion-pulse": "suspicion-pulse 1s ease-in-out infinite",
        "meltdown-flash": "meltdown-flash 0.4s ease-in-out infinite",
        shake: "shake 0.3s ease-in-out",
      },
    },
  },
  plugins: [],
};
