import { createFileRoute } from "@tanstack/react-router";
import { ConceptGraphView } from "@/components/concept-graph";

export const Route = createFileRoute("/faculty/knowledge-graph")({
  component: FacultyKnowledgeGraph,
});

function FacultyKnowledgeGraph() {
  return <ConceptGraphView />;
}
