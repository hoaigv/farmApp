/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  // Cập nhật đường dẫn để bao gồm tất cả các file .tsx trong thư mục app và các thư mục con
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./context/**/*.{js,jsx,ts,tsx}",
    "./utils/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#166534",
        secondary: "#f3f4f6",
        accent: "#4ade80",
        danger: "#dc2626",
      },

      fontSize: {
        display: ["48px", { lineHeight: "56px", fontWeight: "700" }],
        headline: ["36px", { lineHeight: "44px", fontWeight: "700" }],
        title: ["24px", { lineHeight: "32px", fontWeight: "700" }],
        body: ["16px", { lineHeight: "24px", fontWeight: "400" }],
      },
    },
  },
  plugins: [],
};
