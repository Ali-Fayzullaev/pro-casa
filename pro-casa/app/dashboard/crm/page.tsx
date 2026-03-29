import { KanbanBoard } from "@/components/crm/kanban-board";
import { Separator } from "@/components/ui/separator";

export default function CRMPage() {
  return (
    <div className="h-[calc(100vh-80px)] flex flex-col p-4 md:p-6 pt-4 space-y-3 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">CRM</h2>
          <p className="text-sm text-muted-foreground">
            Управление сделками (Канбан)
          </p>
        </div>
      </div>
      <Separator className="shrink-0" />

      <div className="flex-1 min-h-0 overflow-hidden">
        <KanbanBoard />
      </div>
    </div>
  );
}
