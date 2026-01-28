import { KanbanBoard } from "@/components/crm/kanban-board";
import { Separator } from "@/components/ui/separator";

export default function CRMPage() {
  return (
    <div className="h-full flex flex-col p-4 md:p-8 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">CRM</h2>
          <p className="text-muted-foreground">
            Управление сделками (Канбан)
          </p>
        </div>
      </div>
      <Separator />

      <div className="flex-1 overflow-hidden h-full">
        <KanbanBoard />
      </div>
    </div>
  );
}
