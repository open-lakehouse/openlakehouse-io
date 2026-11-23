import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App.tsx";
import { preloadFor } from "./lazyPages";
import "./index.css";

const mount = () =>
  createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
      <SpeedInsights />
      <App />
    </HelmetProvider>,
  );

preloadFor(window.location.pathname).then(mount, mount);
