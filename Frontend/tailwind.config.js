/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: { poppins: ["Poppins", "sans-serif"] },
      colors: {
        gabik: {
          50: "#F3FBF3",
          100: "#E3F7E5",
          300: "#A9E6B4",
          500: "#4FCB6E",
          700: "#1E9E4A",
          teal: "#2FBF9E",
          lime: "#CFEA3A",
          red: "#F4544D",
          "red-bg": "#FDEAE9",
          amber: "#F0B429",
          "amber-bg": "#FCF3D9",
          blue: "#3E8EF7",
          "blue-bg": "#E8F1FE",
          ink: "#0E1F14",
          "ink-muted": "#5A6B5F",
          surface: "#FFFFFF",
          border: "#D6EFDA",
        },
      },
      borderRadius: { card: "16px", control: "10px" },
      boxShadow: {
        card: "0 4px 16px rgba(30,158,74,0.08)",
      },
    },
  },
  plugins: [],
};
