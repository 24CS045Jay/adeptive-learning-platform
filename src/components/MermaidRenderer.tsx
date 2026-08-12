import { useEffect, useRef, useState, useId } from "react";
import mermaid from "mermaid";

// Initialize mermaid once with clean modern theme configuration
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    fontFamily: "Inter, sans-serif",
    fontSize: "13px",
    primaryColor: "#7c3aed",
    primaryTextColor: "#ffffff",
    primaryBorderColor: "#9d72f7",
    lineColor: "#a78bfa",
    secondaryColor: "#3b82f6",
    tertiaryColor: "#1e1b4b",
  },
  securityLevel: "loose",
});

interface MermaidRendererProps {
  chart: string;
  className?: string;
}

export function MermaidRenderer({ chart, className = "" }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const uniqueId = `mermaid-${useId().replace(/:/g, "_")}`;

  useEffect(() => {
    let isMounted = true;

    async function renderChart() {
      if (!chart?.trim()) return;
      try {
        setError(null);
        // Ensure clean string formatting
        const cleanedChart = chart.trim();
        const { svg } = await mermaid.render(uniqueId, cleanedChart);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        console.warn("[MermaidRenderer] Render failed:", err);
        if (isMounted) {
          setError(err?.message || "Failed to render visual diagram.");
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, uniqueId]);

  if (error) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
        <span className="font-semibold">Visual Diagram Preview:</span>
        <pre className="mt-1 overflow-x-auto rounded bg-black/20 p-2 font-mono text-[11px] text-foreground">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`my-3 overflow-x-auto rounded-xl border border-violet/20 bg-card p-4 shadow-sm ${className}`}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
