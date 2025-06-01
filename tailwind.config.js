// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // 👈 định nghĩa lại font-sans thành Poppins
      },
    },
  },
  plugins: [],
};
