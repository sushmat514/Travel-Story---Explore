/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    fontFamily: {
      display: ["Poppins", "Sans-serif"],
      josefin: ['"Josefin Sans"', "cursive"],
    },
    extend: {
      colors: {
        primary: "#05B6D3",
        secondary: "#EF863E",
      },
      backgroundImage: {
        "login-url": 'url("assets/LoginImage.png")',
        "signup-url": 'url("assets/SignUpImg.png")',
      },
    },
  },
  plugins: [],
};
