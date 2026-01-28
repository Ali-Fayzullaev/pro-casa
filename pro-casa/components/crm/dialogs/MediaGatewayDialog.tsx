"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";

interface MediaGatewayDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    propertyId: string;
    imageCount: number;
    requiredCount?: number;
    onSuccess: () => void;
}

export function MediaGatewayDialog({
    open,
    onOpenChange,
    propertyId,
    imageCount,
    requiredCount = 3,
    onSuccess,
}: MediaGatewayDialogProps) {
    const [currentCount, setCurrentCount] = useState(imageCount);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset count when dialog opens with new property
    useEffect(() => {
        if (open) {
            setCurrentCount(imageCount);
        }
    }, [open, imageCount]);

    const handleImagesChange = (urls: string[]) => {
        setCurrentCount(urls.length);
    };

    const handleContinue = async () => {
        if (currentCount < requiredCount) {
            toast.error(`Необходимо минимум ${requiredCount} фото. Сейчас: ${currentCount}`);
            return;
        }

        setIsSubmitting(true);
        try {
            // Call onSuccess which will trigger the stage move
            onSuccess();
            onOpenChange(false);
            toast.success("Объект переведён на этап Подготовки");
        } catch (error) {
            toast.error("Ошибка при сохранении");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-600">
                        <AlertCircle className="h-5 w-5" />
                        Подготовка Объекта
                    </DialogTitle>
                    <DialogDescription>
                        Для перехода на этап "Подготовка" необходимо загрузить качественные фото (минимум {requiredCount}).
                        <br />
                        Сейчас загружено: <b className={currentCount >= requiredCount ? "text-green-600" : "text-amber-600"}>{currentCount}</b>.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2">
                    <div className="text-xs text-muted-foreground mb-2 text-center">
                        Загрузите фото ниже.
                    </div>

                    <ImageUploader
                        propertyId={propertyId}
                        onImagesChange={handleImagesChange}
                    />
                </div>

                <DialogFooter className="flex row justify-between sm:justify-between items-center">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} type="button">
                        Отмена
                    </Button>
                    <Button
                        onClick={handleContinue}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                        disabled={isSubmitting || currentCount < requiredCount}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Готово, продолжить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

