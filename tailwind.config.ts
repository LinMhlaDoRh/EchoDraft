import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FFFFFF",
        surface: "#F9F8F7",
        "surface-2": "#F0EFED",
        border: "#E6E5E3",
        "primary-text": "#2C2C2B",
        "secondary-text": "#7D7A75",
        "accent-blue": "#2783DE",
        "accent-blue-soft": "#E5F2FC",
        "accent-green": "#46A171",
        "accent-green-soft": "#E8F1EC",
        "accent-orange": "#D5803B",
        "accent-orange-soft": "#FBEBDE",
        "accent-red": "#E56458",
        "accent-red-soft": "#FCE9E7",
      },
    },
  },
  plugins: [],
};

export default config;
