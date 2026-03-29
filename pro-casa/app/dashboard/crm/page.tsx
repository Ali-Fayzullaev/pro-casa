import { KanbanBoard } from "@/components/crm/kanban-board";

export default function CRMPage() {
  return (
    <div className="h-[calc(100vh-56px)] md:h-screen flex flex-col overflow-hidden">
      <KanbanBoard />
    </div>
  );
}
