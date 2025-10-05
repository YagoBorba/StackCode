import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Remove the initial loading banner injected by the extension HTML
const loadingEl = document.getElementById("loading");
if (loadingEl && loadingEl.parentElement) {
  try {
    loadingEl.parentElement.removeChild(loadingEl);
  } catch {
    // ignore
  }
}
