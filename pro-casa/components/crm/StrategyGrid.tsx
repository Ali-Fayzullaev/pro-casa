import { StrategyDescriptions } from "@/lib/translations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface StrategyGridProps {
    selectedStrategy?: string | null;
    onSelect?: (strategy: string) => void;
    readOnly?: boolean;
}

export function StrategyGrid({ selectedStrategy, onSelect, readOnly = false }: StrategyGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(StrategyDescriptions).map(([key, strat]) => {
                const isSelected = selectedStrategy === key;
                return (
                    <div
                        key={key}
                        onClick={() => !readOnly && onSelect && onSelect(key)}
                        className={cn(
                            "relative flex flex-col p-4 rounded-xl border-2 transition-all hover:shadow-md",
                            !readOnly && "cursor-pointer",
                            isSelected
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-transparent bg-white hover:border-indigo-100"
                        )}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <Badge variant={isSelected ? "default" : "outline"} className="font-mono">
                                {strat.code}
                            </Badge>
                            <TooltipProvider>
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2 text-muted-foreground">
                                            <Info className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-sm p-4 bg-popover text-popover-foreground border shadow-xl z-50">
                                        <div className="space-y-3">
                                            <div>
                                                <h4 className="font-bold text-base flex items-center gap-2">
                                                    {strat.name}
                                                    <Badge variant="secondary" className="text-[10px]">{strat.type}</Badge>
                                                </h4>
                                                <p className="text-sm mt-1">{strat.description}</p>
                                            </div>

                                            <div>
                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Применяется если:</span>
                                                <ul className="list-disc list-inside text-xs mt-1 space-y-0.5">
                                                    {strat.applies.map((item, i) => (
                                                        <li key={i}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                                                <div>
                                                    <span className="text-[10px] uppercase text-muted-foreground font-bold">Цель</span>
                                                    <p className="text-xs font-medium">{strat.goal}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase text-muted-foreground font-bold">Срок</span>
                                                    <p className="text-xs font-medium">{strat.duration}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        <h3 className="font-semibold text-sm mb-1 line-clamp-1" title={strat.name}>
                            {strat.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                            {strat.description}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
