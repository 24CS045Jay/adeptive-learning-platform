import { createFileRoute } from "@tanstack/react-router";
import { ConceptGraphView } from "@/components/concept-graph";

export const Route = createFileRoute("/student/concept-map")({
  component: StudentConceptMap,
});

function StudentConceptMap() {
  return <ConceptGraphView />;
}
