import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("❌ root element를 찾을 수 없습니다.");
}

ReactDOM.createRoot(rootElement as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
