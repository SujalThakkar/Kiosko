/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Official Somaiya Vidyavihar University brand palette
        "power-red": "#B7202E", // primary brand red
        "vitality-red": "#ED1C24", // accent / CTA / alert red
        "trust-blue": "#004A9C", // secondary brand blue
        "link-blue": "#006699",
        "deep-blue": "#004466",
        "ink": "#231F20", // primary text
        "slate": "#58595B", // secondary text
        "mist": "#F4F5F7", // panel background
        "paper": "#FFFFFF",
      },
      fontFamily: {
        display: ["Marcellus", "serif"],
        body: ["Fira Sans", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(35,31,32,0.06), 0 4px 16px rgba(35,31,32,0.06)",
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
