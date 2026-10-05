/** React Router table. The graph is `/`; anything else is not found. */

import { createBrowserRouter } from "react-router";
import { Layout } from "@/components/layout";
import { GraphPage } from "@/pages/graph";
import { NotFoundPage } from "@/pages/not_found";

export function createAppRouter() {
    return createBrowserRouter([
        {
            element: <Layout />,
            children: [
                { path: "/", Component: GraphPage },
                { path: "*", Component: NotFoundPage },
            ],
        },
    ]);
}
