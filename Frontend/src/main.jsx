import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";  // Usar BrowserRouter aquí

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>  {/* Usar BrowserRouter en lugar de Router */}
        <App />
    </BrowserRouter>
  </StrictMode>
);
