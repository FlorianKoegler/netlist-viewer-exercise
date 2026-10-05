/** Theme helpers. `cn()` lives in `lib/utils.ts`. */

const cssVarCache = new Map<string, string>();
let cssVarProbe: HTMLSpanElement | null = null;

/** Theme color as `rgb()` so Canvas2D can paint it. */
export function cssVar(property: string): string {
    const cached = cssVarCache.get(property);
    if (cached !== undefined) {
        return cached;
    }
    if (typeof document === "undefined" || document.body === null) {
        return "";
    }
    if (cssVarProbe === null) {
        cssVarProbe = document.createElement("span");
        cssVarProbe.setAttribute("aria-hidden", "true");
        cssVarProbe.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
        document.body.appendChild(cssVarProbe);
    }
    cssVarProbe.style.color = `var(${property})`;
    const value = rgbColor(getComputedStyle(cssVarProbe).color);
    cssVarCache.set(property, value);
    return value;
}

/** Canvas2D rejects some `oklch()` strings. Read back a filled pixel as `rgba()`. */
function rgbColor(color: string): string {
    if (color.startsWith("rgb")) {
        return color;
    }
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (context === null) {
        return color;
    }
    context.fillStyle = "#010203";
    context.fillStyle = color;
    if (context.fillStyle === "#010203") {
        return color;
    }
    context.fillRect(0, 0, 1, 1);
    const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
    return `rgba(${red}, ${green}, ${blue}, ${(alpha / 255).toFixed(3)})`;
}

export function clearCssVarCache(): void {
    cssVarCache.clear();
}

/** Flip light/dark, persist `themeMode`, and notify the canvas. */
export function toggleTheme(): void {
    const dark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", dark);
    try {
        localStorage.setItem("themeMode", dark ? "dark" : "light");
    } catch {
        /* private mode */
    }
    clearCssVarCache();
    window.dispatchEvent(new Event("themechange"));
}
