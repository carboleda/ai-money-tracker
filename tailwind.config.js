import { nextui } from "@nextui-org/theme";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/interfaces/**/*.{js,ts}",
    "./src/hooks/**/*.{js,ts}",
    "./src/config/**/*.{js,ts}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/components/(autocomplete|chip|code|date-picker|dropdown|image|input|link|modal|navbar|progress|skeleton|toggle|table|button|ripple|spinner|listbox|divider|popover|scroll-shadow|calendar|date-input|menu|checkbox|spacer).js",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [nextui()],
};
