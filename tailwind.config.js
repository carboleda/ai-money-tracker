import { nextui } from "@nextui-org/theme";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./interfaces/**/*.{js,ts}",
    "./hooks/**/*.{js,ts}",
    "./config/**/*.{js,ts}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/components/(autocomplete|chip|code|date-picker|dropdown|image|input|link|modal|navbar|progress|skeleton|toggle|table|button|ripple|spinner|listbox|divider|popover|scroll-shadow|calendar|date-input|menu|checkbox|spacer).js",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [nextui()],
};
