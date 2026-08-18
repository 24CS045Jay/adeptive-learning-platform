import { createFileRoute } from "@tanstack/react-router";
import { ConceptGraphView } from "@/components/concept-graph";

export const Route = createFileRoute("/admin/graph")({
  component: AdminGraph,
});

function AdminGraph() {
  return <ConceptGraphView />;
}
