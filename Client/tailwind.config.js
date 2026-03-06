export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:   '#00b8a9',
        'primary-dark': '#009e91',
        'primary-light': '#e0f7f5',
        dark:      '#1a1a2e',
        muted:     '#6b7280',
        'bg-main': '#f8f9fa',
        'bg-card': '#ffffff',
        'border-c':'#e5e7eb',
        error:     '#ef4444',
        success:   '#10b981',
      },
      fontFamily: {
        head: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}