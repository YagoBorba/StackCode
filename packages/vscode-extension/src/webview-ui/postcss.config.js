// packages/vscode-extension/src/webview-ui/postcss.config.js

export default {
  plugins: {
    // CORREÇÃO: Usamos o novo pacote aqui.
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
