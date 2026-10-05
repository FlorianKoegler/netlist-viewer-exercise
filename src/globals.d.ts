/** Build-time `window` flags from `ui_min/esbuild.mjs`. */
export {};

declare global {
    interface Window {
        DEV_MODE: boolean;
        PROJECT_NAME: string;
        PROJECT_VERSION: string;
    }
}
