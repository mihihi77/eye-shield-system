module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // 👈 để Tailwind quét toàn bộ component React
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // 👈 sử dụng Poppins làm font chính
      },
    },
  },
  plugins: [],
}
