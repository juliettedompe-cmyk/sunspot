import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sunny: "#F59E0B",  // amber-400
        shady: "#6B7280",  // gray-500
      },
    },
  },
  plugins: [],
};

export default config;
