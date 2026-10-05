import esbuild from "esbuild";
import copyStaticFiles from "esbuild-copy-static-files";
import tailwindPlugin from "esbuild-plugin-tailwindcss";
import { existsSync } from "fs";
import { resolve } from "path";
import PROJECT from "./package.json" with { type: "json" };

const SRC_ROOT = resolve("src");
const SOURCE_EXTS = ["", ".tsx", ".ts", ".jsx", ".js", ".json"];

function resolveSource(specifier) {
    const base = resolve(SRC_ROOT, specifier);
    for (const ext of SOURCE_EXTS) {
        const candidate = base + ext;
        if (existsSync(candidate)) {
            return candidate;
        }
    }
    for (const ext of [".tsx", ".ts", ".jsx", ".js"]) {
        const index = resolve(base, "index" + ext);
        if (existsSync(index)) {
            return index;
        }
    }
    return null;
}

const DEV = process.argv.includes("--dev");
const PORT = 8082;

/** @type {esbuild.BuildOptions} **/
const buildOptions = {
    format: "esm",
    entryPoints: [resolve("src/index.tsx"), resolve("src/stylesheets/index.css")],
    entryNames: "app",
    outdir: resolve("build/"),
    bundle: true,
    splitting: true,
    minify: !DEV,
    sourcemap: DEV,
    jsx: "automatic",
    treeShaking: true,
    define: {
        "window.DEV_MODE": DEV ? "true" : "false",
        "window.PROJECT_NAME": `"${PROJECT.name}"`,
        "window.PROJECT_VERSION": `"${PROJECT.version}"`,
    },
    plugins: [
        {
            name: "alias-at",
            setup(build) {
                build.onResolve({ filter: /^@\// }, (args) => {
                    const path = resolveSource(args.path.slice(2));
                    return path === null ? null : { path };
                });
            },
        },
        tailwindPlugin(),
        copyStaticFiles({
            src: "src/static",
            dest: "build/",
            recursive: true,
        }),
    ],
};

/** @type {esbuild.ServeOptions} **/
const serveOptions = {
    servedir: resolve("build/"),
    port: PORT,
    fallback: resolve("build/index.html"),
};

(async () => {
    if (DEV) {
        const ctx = await esbuild.context(buildOptions);
        await ctx.watch();
        await ctx.serve(serveOptions);
        console.log(`Listening at http://127.0.0.1:${PORT}...`);
        process.on("exit", ctx.dispose);
    } else {
        await esbuild.build(buildOptions);
    }
})();
