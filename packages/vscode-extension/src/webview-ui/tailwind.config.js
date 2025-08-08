/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores que podem ser usadas para mimetizar o tema do VS Code
        vscode: {
          background: 'var(--vscode-editor-background)',
          foreground: 'var(--vscode-editor-foreground)',
          // ... outras cores que você definiu
        }
      }
    },
  },
  plugins: [],
}