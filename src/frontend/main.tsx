import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/app.css";

function installPressFeedback() {
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element
      ? event.target.closest<HTMLButtonElement | HTMLAnchorElement>("button, .button-link")
      : null;

    if (!target || target instanceof HTMLButtonElement && target.disabled) return;

    target.classList.remove("is-clicked");
    window.requestAnimationFrame(() => target.classList.add("is-clicked"));
    window.setTimeout(() => target.classList.remove("is-clicked"), 700);
  });
}

installPressFeedback();

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
