import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gray900: "#1A2128",
        gray700: "#505C66",
        gray600: "#6D7882",
        gray500: "#8E98A0",
        gray300: "#CFD5D9",
        gray100: "#F2F4F6",
        primary: "#00AFFF",
        "primary-bg": "#E0F5FF",
        danger: "#F84848",
        "danger-bg": "#FEECEC",
        "line-subtle": "rgba(26, 33, 40, 0.06)",
        dim: "rgba(0, 0, 0, 0.7)",
      },
      fontFamily: {
        sans: ["Pretendard", "system-ui", "sans-serif"],
      },
      fontSize: {
        h3: ["20px", "28px"],
        h4: ["18px", "26px"],
        t1: ["16px", "24px"],
        t2: ["15px", "22px"],
        t3: ["14px", "21px"],
        b2: ["14px", "22px"],
      },
      maxWidth: {
        mobile: "360px",
      },
    },
  },
  plugins: [],
};

export default config;
