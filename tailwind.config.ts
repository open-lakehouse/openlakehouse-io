import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "InterVariable",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        // Brand ramps (SPARK / UNITY / FLOW / STEEL) — use for pixel motifs & accents
        flow: {
          100: "hsl(var(--flow-100))", 200: "hsl(var(--flow-200))", 300: "hsl(var(--flow-300))",
          400: "hsl(var(--flow-400))", 500: "hsl(var(--flow-500))", 600: "hsl(var(--flow-600))",
          700: "hsl(var(--flow-700))", 800: "hsl(var(--flow-800))", 900: "hsl(var(--flow-900))",
        },
        spark: {
          100: "hsl(var(--spark-100))", 200: "hsl(var(--spark-200))", 300: "hsl(var(--spark-300))",
          400: "hsl(var(--spark-400))", 500: "hsl(var(--spark-500))", 600: "hsl(var(--spark-600))",
          700: "hsl(var(--spark-700))", 800: "hsl(var(--spark-800))", 900: "hsl(var(--spark-900))",
        },
        unity: {
          100: "hsl(var(--unity-100))", 200: "hsl(var(--unity-200))", 300: "hsl(var(--unity-300))",
          400: "hsl(var(--unity-400))", 500: "hsl(var(--unity-500))", 600: "hsl(var(--unity-600))",
          700: "hsl(var(--unity-700))", 800: "hsl(var(--unity-800))", 900: "hsl(var(--unity-900))",
        },
        steel: {
          100: "hsl(var(--steel-100))", 200: "hsl(var(--steel-200))", 300: "hsl(var(--steel-300))",
          400: "hsl(var(--steel-400))", 500: "hsl(var(--steel-500))", 600: "hsl(var(--steel-600))",
          700: "hsl(var(--steel-700))", 800: "hsl(var(--steel-800))", 900: "hsl(var(--steel-900))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
