/** Shell for every route: header and the page outlet. */

import { Outlet } from "react-router";
import { Button } from "@/components/ui/button";
import mrCoffee from "@/netlist/MrCoffee.json";
import { toggleTheme } from "@/utils";

export function Layout() {
    return (
        <main className="flex h-screen w-screen flex-col overflow-clip bg-background text-foreground">
            <header className="flex h-12 shrink-0 items-center justify-between border-b px-3">
                <h1 className="text-sm font-medium">
                    Netlist viewer{" "}
                    <span className="font-normal text-muted-foreground">{mrCoffee.top}</span>
                </h1>
                <Button variant="outline" onPress={toggleTheme}>
                    Toggle theme
                </Button>
            </header>
            <Outlet />
        </main>
    );
}
