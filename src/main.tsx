import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import DocsPortal from "./DocsPortal";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {window.location.pathname.startsWith("/docs") ? <DocsPortal /> : <App />}
  </React.StrictMode>,
);
