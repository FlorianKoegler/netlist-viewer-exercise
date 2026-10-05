/** App entry: mount React Router. Live-reload in `npm run serve`. */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { createAppRouter } from "./router";

const root = document.getElementById("root");

if (root === null) {
    throw new Error("Missing #root element");
}

createRoot(root).render(
    <StrictMode>
        <RouterProvider router={createAppRouter()} />
    </StrictMode>,
);

if (window.DEV_MODE) {
    new EventSource("/esbuild").addEventListener("change", () => location.reload());
}
