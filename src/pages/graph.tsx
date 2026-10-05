/** Force-graph page. `DEMO_GRAPH` is two hardcoded instances and one wire.
 *
 * `mrCoffee` is the synthesized netlist, imported so esbuild bundles it into
 * the page. The canvas still draws `DEMO_GRAPH`.
 */

import { useEffect, useRef } from "react";
import ForceGraph, { type LinkObject, type NodeObject } from "force-graph";
import { cssVar } from "@/utils";
import mrCoffee from "@/netlist/MrCoffee.json";

type CellNode = NodeObject & {
    id: string;
    cell: string;
};

type WireLink = LinkObject<CellNode> & {
    net: string;
};

const DEMO_GRAPH: { nodes: CellNode[]; links: WireLink[] } = {
    nodes: [
        { id: "u_and", cell: "AND2" },
        { id: "u_inv", cell: "INV" },
    ],
    links: [{ source: "u_and", target: "u_inv", net: "n1" }],
};

function isCell(end: WireLink["source"]): end is CellNode {
    return typeof end === "object" && end !== null && "id" in end;
}

export function GraphPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = containerRef.current;
        if (element === null) {
            return;
        }

        const graph = new ForceGraph<CellNode, WireLink>(element)
            .graphData({
                nodes: DEMO_GRAPH.nodes.map((node) => ({ ...node })),
                links: DEMO_GRAPH.links.map((link) => ({ ...link })),
            })
            .width(element.clientWidth)
            .height(element.clientHeight)
            .backgroundColor(cssVar("--graph-background"))
            .nodeRelSize(4)
            .nodeLabel(() => "")
            .linkLabel(() => "")
            .nodeColor(() => cssVar("--graph-node"))
            .linkColor(() => cssVar("--graph-link"))
            .linkDirectionalArrowLength(4)
            .linkDirectionalArrowRelPos(1)
            .linkDirectionalArrowColor(() => cssVar("--graph-link"))
            .nodeCanvasObjectMode(() => "after")
            .nodeCanvasObject((node, ctx, globalScale) => {
                const x = node.x ?? 0;
                const y = node.y ?? 0;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Geist, sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.fillStyle = cssVar("--graph-node-label");
                ctx.fillText(`${node.id}  ${node.cell}`, x, y - 8 / globalScale);
            })
            .linkCanvasObjectMode(() => "after")
            .linkCanvasObject((link, ctx, globalScale) => {
                if (!isCell(link.source) || !isCell(link.target)) {
                    return;
                }
                const x = ((link.source.x ?? 0) + (link.target.x ?? 0)) / 2;
                const y = ((link.source.y ?? 0) + (link.target.y ?? 0)) / 2;
                const fontSize = 11 / globalScale;
                ctx.font = `${fontSize}px Geist, sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.fillStyle = cssVar("--graph-link");
                ctx.fillText(link.net, x, y - 4 / globalScale);
            });

        let fitted = false;
        graph.onEngineStop(() => {
            if (fitted) {
                return;
            }
            fitted = true;
            graph.zoomToFit(200, 80);
        });

        const resize = () => {
            graph.width(element.clientWidth).height(element.clientHeight);
        };
        const observer = new ResizeObserver(resize);
        observer.observe(element);

        const onTheme = () => {
            graph.backgroundColor(cssVar("--graph-background"));
            graph.nodeColor(() => cssVar("--graph-node"));
            graph.linkColor(() => cssVar("--graph-link"));
            graph.linkDirectionalArrowColor(() => cssVar("--graph-link"));
        };
        window.addEventListener("themechange", onTheme);

        return () => {
            window.removeEventListener("themechange", onTheme);
            observer.disconnect();
            graph.pauseAnimation();
            element.replaceChildren();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative min-h-0 flex-1"
            data-netlist={mrCoffee.top}
        />
    );
}
