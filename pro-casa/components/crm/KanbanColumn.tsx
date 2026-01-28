import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
    id: string;
    title: string;
    count?: number;
    children: React.ReactNode;
}

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface KanbanColumnProps {
    id: string;
    title: string;
    count?: number;
    description?: string; // New prop
    children: React.ReactNode;
}

export function KanbanColumn({ id, title, count = 0, description, children }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id,
    });

    return (
        <div className="flex flex-col h-full min-w-[280px] w-[300px] border-r border-border/20 last:border-r-0">
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-foreground/80 uppercase tracking-wide">
                        {title}
                    </h3>
                    {description && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="w-3 h-3 text-muted-foreground/50 hover:text-primary transition-colors cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-[200px] text-xs">
                                    {description}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    {count}
                </span>
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 rounded-xl p-2 transition-all overflow-y-auto space-y-3",
                    isOver && "bg-primary/5"
                )}
            >
                {/* Drop placeholder when dragging over */}
                {isOver && (
                    <div className="h-16 mb-2 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 flex items-center justify-center transition-all animate-in fade-in duration-200">
                        <span className="text-xs text-muted-foreground">Отпустите здесь</span>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
