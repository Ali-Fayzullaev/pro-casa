"use client";

import { useForm, useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { CreateSellerValues, createSellerSchema } from "@/lib/schemas";
import api from "@/lib/api-client";
import { toast } from "sonner";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Clock, DollarSign, Home, MessageSquare, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriceInput } from "@/components/ui/price-input";

interface CreateSellerFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Partial<CreateSellerValues> & { id?: string };
    onSuccess?: () => void;
    activeFunnelId?: string | null;
}

const REASONS = [
    { value: "SIZE_CHANGE", label: "РЈР»СѓС‡С€РµРЅРёРµ/СЃРјРµРЅР° Р¶РёР»СЊСЏ" },
    { value: "RELOCATION", label: "РџРµСЂРµРµР·Рґ" },
    { value: "INVESTMENT", label: "РРЅРІРµСЃС‚РёС†РёРѕРЅРЅР°СЏ РїСЂРѕРґР°Р¶Р°" },
    { value: "DIVORCE", label: "Р Р°Р·РІРѕРґ" },
    { value: "INHERITANCE", label: "РќР°СЃР»РµРґСЃС‚РІРѕ" },
    { value: "FINANCIAL_NEED", label: "Р¤РёРЅР°РЅСЃРѕРІР°СЏ РЅРµРѕР±С…РѕРґРёРјРѕСЃС‚СЊ" },
    { value: "OTHER", label: "Р”СЂСѓРіРѕРµ" },
];

const DEADLINES = [
    { value: "URGENT_30_DAYS", label: "РЎСЂРѕС‡РЅРѕ (РґРѕ 1 РјРµСЃСЏС†Р°)" },
    { value: "NORMAL_90_DAYS", label: "1-3 РјРµСЃСЏС†Р°" },
    { value: "FLEXIBLE_180_DAYS", label: "Р‘РѕР»РµРµ 3 РјРµСЃСЏС†РµРІ" },
    { value: "NO_RUSH", label: "РќРµ СЃРїРµС€Сѓ" },
];

const MARKET_ASSESSMENTS = [
    { value: "ADEQUATE", label: "РђРґРµРєРІР°С‚РЅР°СЏ" },
    { value: "OVERPRICED", label: "Р—Р°РІС‹С€РµРЅРЅР°СЏ" },
    { value: "UNCERTAIN", label: "РќРµ Р·РЅР°СЋ СЂС‹РЅРѕРє" },
];

const PURCHASE_FORMATS = [
    { value: "NEW_BUILDING", label: "РќРѕРІРѕСЃС‚СЂРѕР№РєР°" },
    { value: "SECONDARY", label: "Р’С‚РѕСЂРёС‡РєР°" },
    { value: "HOUSE", label: "Р”РѕРј" },
    { value: "NOT_DECIDED", label: "РќРµ РѕРїСЂРµРґРµР»РёР»СЃСЏ" },
];

const INCOME_SOURCES = [
    { value: "EMPLOYMENT", label: "РќР°РµРјРЅС‹Р№ СЂР°Р±РѕС‚РЅРёРє" },
    { value: "BUSINESS", label: "Р‘РёР·РЅРµСЃ" },
    { value: "RENTAL_INCOME", label: "Р РµРЅС‚Р°" },
    { value: "PENSION", label: "РџРµРЅСЃРёСЏ" },
    { value: "OTHER", label: "Р”СЂСѓРіРѕРµ" },
];

const COMMUNICATION_CHANNELS = [
    { value: "CALL", label: "Р—РІРѕРЅРѕРє" },
    { value: "WHATSAPP", label: "WhatsApp" },
    { value: "TELEGRAM", label: "Telegram" },
];

const SOURCES = [
    { value: "INSTAGRAM", label: "Instagram" },
    { value: "WHATSAPP", label: "WhatsApp" },
    { value: "REFERRAL", label: "Р РµРєРѕРјРµРЅРґР°С†РёСЏ" },
    { value: "WEBSITE", label: "РЎР°Р№С‚" },
    { value: "OTHER", label: "Р”СЂСѓРіРѕРµ" },
];

export function CreateSellerForm({ open, onOpenChange, initialData, onSuccess, activeFunnelId }: CreateSellerFormProps) {
    const props = { open, onOpenChange, initialData, onSuccess, activeFunnelId }; // Capture for usage in mutation
    const queryClient = useQueryClient();
    const isEditMode = !!initialData?.id;

    const [expandedSections, setExpandedSections] = useState<string[]>(["basic", "reason", "price", "plans", "communication"]);

    // Phone duplicate check state
    const [phoneCheckResult, setPhoneCheckResult] = useState<{
        exists: boolean;
        seller?: {
            id: string;
            name: string;
            firstName?: string;
            lastName?: string;
            middleName?: string;
        }
    } | null>(null);
    const [isCheckingPhone, setIsCheckingPhone] = useState(false);

    const form = useForm<CreateSellerValues>({
        resolver: zodResolver(createSellerSchema) as any,
        defaultValues: {
            firstName: initialData?.firstName || "",
            lastName: initialData?.lastName || "",
            phone: initialData?.phone || "+7",
            city: initialData?.city || "",
            source: initialData?.source || "",
            managerComment: initialData?.managerComment || "",
            readyToNegotiate: initialData?.readyToNegotiate ?? true,
            plansToPurchase: initialData?.plansToPurchase ?? false,
            hasDebts: initialData?.hasDebts ?? false,
            trustLevel: initialData?.trustLevel ?? 3,
            // Pre-fill other fields if they exist in initialData
            reason: initialData?.reason as any,
            deadline: initialData?.deadline as any,
            expectedPrice: initialData?.expectedPrice,
            minPrice: initialData?.minPrice,
            marketAssessment: initialData?.marketAssessment as any,
            nextPurchaseFormat: initialData?.nextPurchaseFormat as any,
            purchaseBudget: initialData?.purchaseBudget,
            loanPaymentAmount: initialData?.loanPaymentAmount,
            communicationChannel: initialData?.communicationChannel || "",
            preferredTime: initialData?.preferredTime || "",
            reasonOther: initialData?.reasonOther || "",
            customStageId: initialData?.customStageId || "",
            projectId: initialData?.projectId || "",
            apartmentId: initialData?.apartmentId || "",
        },
    });

    const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            const res = await api.get("/projects");
            return res.data;
        },
    });
    const projects = projectsData?.projects || [];

    // Reset form when initialData changes (or sheet opens)
    // This is crucial for the "Pre-fill" requirement when reusing the form component.
    useEffect(() => {
        if (open && initialData) {
            form.reset({
                firstName: initialData.firstName || "",
                lastName: initialData.lastName || "",
                phone: initialData.phone || "+7",
                city: initialData.city || "",
                source: initialData.source || "",
                managerComment: initialData.managerComment || "",
                readyToNegotiate: initialData.readyToNegotiate ?? true,
                plansToPurchase: initialData.plansToPurchase ?? false,
                hasDebts: initialData.hasDebts ?? false,
                trustLevel: initialData.trustLevel ?? 3,
                reason: initialData.reason as any,
                deadline: initialData.deadline as any,
                expectedPrice: initialData.expectedPrice ?? undefined,
                minPrice: initialData.minPrice ?? undefined,
                marketAssessment: initialData.marketAssessment as any,
                nextPurchaseFormat: initialData.nextPurchaseFormat as any,
                purchaseBudget: initialData.purchaseBudget ?? undefined,
                loanPaymentAmount: initialData.loanPaymentAmount ?? undefined,
                communicationChannel: initialData.communicationChannel || "",
                preferredTime: initialData.preferredTime || "",
                reasonOther: initialData.reasonOther || "",
                customStageId: initialData.customStageId || "",
                projectId: initialData.projectId || "",
                apartmentId: initialData.apartmentId || "",
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData, open]);

    // Watch for conditional fields
    const plansToPurchase = useWatch({ control: form.control, name: "plansToPurchase" });
    const phoneValue = useWatch({ control: form.control, name: "phone" });

    // Debounced phone check
    useEffect(() => {
        if (!phoneValue || phoneValue.length < 12 || isEditMode) {
            setPhoneCheckResult(null);
            return;
        }

        const timer = setTimeout(async () => {
            setIsCheckingPhone(true);
            try {
                const res = await api.get('/sellers/check-phone', { params: { phone: phoneValue } });
                setPhoneCheckResult(res.data);
            } catch (error) {
                console.error('Phone check error:', error);
                setPhoneCheckResult(null);
            } finally {
                setIsCheckingPhone(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [phoneValue, isEditMode]);
    const hasDebts = useWatch({ control: form.control, name: "hasDebts" });
    const reason = useWatch({ control: form.control, name: "reason" });

    const mutation = useMutation({
        mutationFn: async (data: CreateSellerValues) => {
            if (isEditMode && initialData?.id) {
                return api.put(`/sellers/${initialData.id}`, data);
            }
            return api.post("/sellers", { ...data, funnelId: activeFunnelId || undefined });
        },
        onSuccess: () => {
            toast.success(isEditMode ? "РџСЂРѕРґР°РІРµС† РѕР±РЅРѕРІР»РµРЅ" : "РџСЂРѕРґР°РІРµС† СѓСЃРїРµС€РЅРѕ СЃРѕР·РґР°РЅ");
            queryClient.invalidateQueries({ queryKey: ["sellers"] });
            onOpenChange(false);
            if (!isEditMode) form.reset();
            if (props.onSuccess) props.onSuccess();
        },
        onError: (error: any) => {
            const errorData = error.response?.data;
            const errorMessage = errorData?.error || errorData?.message || "РћС€РёР±РєР° СЃРѕС…СЂР°РЅРµРЅРёСЏ";

            // If validation details exist, show the first one
            if (errorData?.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
                toast.error(`${errorMessage}: ${errorData.details[0].message} (${errorData.details[0].field})`);
            } else {
                toast.error(errorMessage);
            }
        },
    });

    function onInvalid(errors: any) {
        console.error("Form validation errors:", errors);

        // 1. Identify Sections with Errors
        const sectionsToOpen = new Set(expandedSections);
        const errorKeys = Object.keys(errors);

        errorKeys.forEach(key => {
            if (["firstName", "lastName", "phone", "city", "source", "managerComment"].includes(key)) sectionsToOpen.add("basic");
            if (["reason", "deadline", "reasonOther"].includes(key)) sectionsToOpen.add("reason");
            if (["expectedPrice", "minPrice", "readyToNegotiate", "marketAssessment"].includes(key)) sectionsToOpen.add("price");
            if (["plansToPurchase", "nextPurchaseFormat", "purchaseBudget", "hasDebts", "loanPaymentAmount"].includes(key)) sectionsToOpen.add("plans");
            if (["communicationChannel", "preferredTime"].includes(key)) sectionsToOpen.add("communication");
        });

        setExpandedSections(Array.from(sectionsToOpen));

        // 2. Format Error Messages
        const missingFields = errorKeys.map(field => {
            const map: Record<string, string> = {
                firstName: "РРјСЏ",
                lastName: "Р¤Р°РјРёР»РёСЏ",
                phone: "РўРµР»РµС„РѕРЅ",
                source: "РСЃС‚РѕС‡РЅРёРє",
                reason: "РџСЂРёС‡РёРЅР° РїСЂРѕРґР°Р¶Рё",
                deadline: "РЎСЂРѕС‡РЅРѕСЃС‚СЊ",
                expectedPrice: "Р–РµР»Р°РµРјР°СЏ С†РµРЅР°",
                minPrice: "РњРёРЅРёРјР°Р»СЊРЅР°СЏ С†РµРЅР°",
                purchaseBudget: "Р‘СЋРґР¶РµС‚ РїРѕРєСѓРїРєРё",
                communicationChannel: "РљР°РЅР°Р» СЃРІСЏР·Рё",
                preferredTime: "РЈРґРѕР±РЅРѕРµ РІСЂРµРјСЏ",
                reasonOther: "РЈС‚РѕС‡РЅРµРЅРёРµ РїСЂРёС‡РёРЅС‹",
                managerComment: "РљРѕРјРјРµРЅС‚СЂР°РёР№"
            };
            // Use translation or fallback to field name (and show specific error message from Zod if available)
            const label = map[field] || field;
            const msg = errors[field]?.message;
            return msg ? `${label} (${msg})` : label;
        });

        toast.error(`РСЃРїСЂР°РІСЊС‚Рµ РѕС€РёР±РєРё (${missingFields.length}):`, {
            description: missingFields.join(", "),
            duration: 6000,
        });
    }

    function onSubmit(data: CreateSellerValues) {
        mutation.mutate(data);
    }

    // Calculate progress
    const watchedValues = useWatch({ control: form.control });
    const progress = calculateProgress(watchedValues);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-3xl bg-gray-50 p-0 gap-0 overflow-hidden">
                <div className="p-6 bg-white border-b shrink-0 z-20 shadow-sm">
                    <SheetHeader>
                        <SheetTitle>
                            {isEditMode ? "Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ РїСЂРѕРґР°РІС†Р°" : "РќРѕРІС‹Р№ РїСЂРѕРґР°РІРµС†"}
                        </SheetTitle>
                        <SheetDescription>
                            {isEditMode
                                ? "РћР±РЅРѕРІРёС‚Рµ РґР°РЅРЅС‹Рµ РґР»СЏ Р°РєС‚СѓР°Р»РёР·Р°С†РёРё СЃС‚СЂР°С‚РµРіРёРё."
                                : "Р—Р°РїРѕР»РЅРёС‚Рµ РѕСЃРЅРѕРІРЅС‹Рµ РґР°РЅРЅС‹Рµ Рѕ РєР»РёРµРЅС‚Рµ Рё РµРіРѕ Р·Р°РїСЂРѕСЃРµ."}
                        </SheetDescription>
                    </SheetHeader>

                    {/* Progress Bar (Only in Edit Mode) */}
                    {isEditMode && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                                <span>Р—Р°РїРѕР»РЅРµРЅРѕ: {progress.completed} РёР· {progress.total} Р±Р»РѕРєРѕРІ</span>
                                <span>{Math.round((progress.completed / progress.total) * 100)}%</span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 scroll-smooth min-h-0">
                    <Form {...form}>
                        <form id="create-seller-form" onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-4 pb-6">

                            {/* NEW SELLER: Simple Flat Form (Old Style) */}
                            {!isEditMode && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>РРјСЏ</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="РРјСЏ" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Р¤Р°РјРёР»РёСЏ</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Р¤Р°РјРёР»РёСЏ" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>РўРµР»РµС„РѕРЅ</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="+7 (700) 000-00-00"
                                                            {...field}
                                                            maxLength={18}
                                                            className={phoneCheckResult?.exists ? "border-amber-500 focus-visible:ring-amber-500" : ""}
                                                            onChange={(e) => {
                                                                let val = e.target.value.replace(/\D/g, '');
                                                                if (val.startsWith('7')) val = val.substring(1);

                                                                let formatted = '+7';
                                                                if (val.length > 0) formatted += ' (' + val.substring(0, 3);
                                                                if (val.length >= 4) formatted += ') ' + val.substring(3, 6);
                                                                if (val.length >= 7) formatted += '-' + val.substring(6, 8);
                                                                if (val.length >= 9) formatted += '-' + val.substring(8, 10);

                                                                field.onChange(formatted);
                                                            }}
                                                        />
                                                    </FormControl>
                                                    {isCheckingPhone && (
                                                        <p className="text-sm text-muted-foreground">РџСЂРѕРІРµСЂСЏРµРј РЅРѕРјРµСЂ...</p>
                                                    )}
                                                    {!isCheckingPhone && phoneCheckResult?.exists && (
                                                        <div className="flex flex-col gap-2 mt-2">
                                                            <p className="text-sm text-amber-600 font-medium">
                                                                вљ пёЏ РљР»РёРµРЅС‚ СЃ С‚Р°РєРёРј РЅРѕРјРµСЂРѕРј СѓР¶Рµ РµСЃС‚СЊ: {phoneCheckResult.seller?.name}
                                                            </p>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full text-amber-600 border-amber-200 hover:bg-amber-50"
                                                                onClick={() => {
                                                                    if (phoneCheckResult.seller) {
                                                                        form.setValue("firstName", phoneCheckResult.seller.firstName || "");
                                                                        form.setValue("lastName", phoneCheckResult.seller.lastName || "");
                                                                        // If we had middleName field in form, we'd set it too
                                                                        toast.info("Р”Р°РЅРЅС‹Рµ РєР»РёРµРЅС‚Р° Р·Р°РїРѕР»РЅРµРЅС‹");
                                                                    }
                                                                }}
                                                            >
                                                                Р—Р°РїРѕР»РЅРёС‚СЊ РґР°РЅРЅС‹Рµ РєР»РёРµРЅС‚Р°
                                                            </Button>
                                                        </div>
                                                    )}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="reason"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Р’РѕРїСЂРѕСЃ / РўРµРјР° (РџСЂРёС‡РёРЅР°)</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Р’С‹Р±РµСЂРёС‚Рµ РїСЂРёС‡РёРЅСѓ" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {REASONS.map((r) => (
                                                                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="nextPurchaseFormat"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>РРЅС‚РµСЂРµСЃ (Р’С‚РѕСЂРёС‡РєР°/РќРѕРІРѕСЃС‚СЂРѕР№РєР°)</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="РўРёРї РЅРµРґРІРёР¶РёРјРѕСЃС‚Рё" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {PURCHASE_FORMATS.map((p) => (
                                                                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="purchaseBudget"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Р‘СЋРґР¶РµС‚ РїРѕРєСѓРїРєРё (в‚ё)</FormLabel>
                                                    <FormControl>
                                                        <PriceInput
                                                            placeholder="60 000 000"
                                                            value={field.value ?? ""}
                                                            onChange={(v) => field.onChange(v ? Number(v) : undefined)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="source"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>РСЃС‚РѕС‡РЅРёРє</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="РСЃС‚РѕС‡РЅРёРє РєРѕРЅС‚Р°РєС‚Р°" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {SOURCES.map((s) => (
                                                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="managerComment"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>РљРѕРјРјРµРЅС‚Р°СЂРёР№</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Р—Р°РјРµС‚РєРё..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {form.watch("nextPurchaseFormat") === "NEW_BUILDING" && (
                                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-4 animate-in fade-in slide-in-from-top-2">
                                            <FormField
                                                control={form.control}
                                                name="projectId"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <Home className="h-4 w-4 text-orange-600" />
                                                            Р’С‹Р±РµСЂРёС‚Рµ Р–Рљ (РЁР°С…РјР°С‚РєР°)
                                                        </FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                                            <FormControl>
                                                                <SelectTrigger className="bg-white">
                                                                    <SelectValue placeholder={isLoadingProjects ? "Р—Р°РіСЂСѓР·РєР° РїСЂРѕРµРєС‚РѕРІ..." : "Р’С‹Р±РµСЂРёС‚Рµ РїСЂРѕРµРєС‚ РґР»СЏ РїСЂРёРІСЏР·РєРё"} />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {projects.map((p: any) => (
                                                                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.city})</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormDescription>
                                                            РЎРґРµР»РєР° Р±СѓРґРµС‚ СЃРІСЏР·Р°РЅР° СЃ РІС‹Р±СЂР°РЅРЅС‹Рј Р¶РёР»С‹Рј РєРѕРјРїР»РµРєСЃРѕРј.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* EDIT MODE: Full Accordion Form */}
                            {isEditMode && (
                                <Accordion
                                    type="multiple"
                                    value={expandedSections}
                                    onValueChange={setExpandedSections}
                                    className="space-y-3"
                                >
                                    {/* 1. РћСЃРЅРѕРІРЅР°СЏ РёРЅС„РѕСЂРјР°С†РёСЏ */}
                                    <AccordionItem value="basic" className="border rounded-lg px-4">
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-center gap-3">
                                                <User className="h-5 w-5 text-primary" />
                                                <span className="font-medium">РћСЃРЅРѕРІРЅР°СЏ РёРЅС„РѕСЂРјР°С†РёСЏ Рѕ РїСЂРѕРґР°РІС†Рµ</span>
                                                {progress.sections.basic && (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                )}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-4 pb-2">
                                            <p className="text-sm text-muted-foreground mb-4">
                                                РљРѕРЅС‚Р°РєС‚РЅС‹Рµ РґР°РЅРЅС‹Рµ Рё Р±Р°Р·РѕРІР°СЏ РёРґРµРЅС‚РёС„РёРєР°С†РёСЏ РєР»РёРµРЅС‚Р°.
                                            </p>

                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="firstName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>РљР°Рє Рє РІР°Рј РѕР±СЂР°С‰Р°С‚СЊСЃСЏ?</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="РРјСЏ" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="lastName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Р¤Р°РјРёР»РёСЏ</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Р¤Р°РјРёР»РёСЏ" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <FormField
                                                    control={form.control}
                                                    name="phone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>РўРµР»РµС„РѕРЅ</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="+7 (700) 000-00-00"
                                                                    {...field}
                                                                    maxLength={18}
                                                                    onChange={(e) => {
                                                                        let val = e.target.value.replace(/\D/g, '');
                                                                        if (val.startsWith('7')) val = val.substring(1);

                                                                        let formatted = '+7';
                                                                        if (val.length > 0) formatted += ' (' + val.substring(0, 3);
                                                                        if (val.length >= 4) formatted += ') ' + val.substring(3, 6);
                                                                        if (val.length >= 7) formatted += '-' + val.substring(6, 8);
                                                                        if (val.length >= 9) formatted += '-' + val.substring(8, 10);

                                                                        field.onChange(formatted);
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="city"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Р“РѕСЂРѕРґ РїСЂРѕР¶РёРІР°РЅРёСЏ</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="РђСЃС‚Р°РЅР°" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <FormField
                                                    control={form.control}
                                                    name="source"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>РСЃС‚РѕС‡РЅРёРє РєРѕРЅС‚Р°РєС‚Р°</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value || ""}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Р’С‹Р±РµСЂРёС‚Рµ РёСЃС‚РѕС‡РЅРёРє" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {SOURCES.map((s) => (
                                                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="managerComment"
                                                render={({ field }) => (
                                                    <FormItem className="mt-4">
                                                        <FormLabel>РљРѕРјРјРµРЅС‚Р°СЂРёР№ РґР»СЏ РєРѕРјР°РЅРґС‹ Casa (РЅРµРѕР±СЏР·Р°С‚РµР»СЊРЅРѕ)</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Р—Р°РјРµС‚РєРё, РѕСЃРѕР±РµРЅРЅРѕСЃС‚Рё РєР»РёРµРЅС‚Р°..."
                                                                className="resize-none"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* 2. РџСЂРёС‡РёРЅР° РїСЂРѕРґР°Р¶Рё Рё СЃСЂРѕС‡РЅРѕСЃС‚СЊ */}
                                    <AccordionItem value="reason" className="border rounded-lg px-4">
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-center gap-3">
                                                <Clock className="h-5 w-5 text-orange-500" />
                                                <span className="font-medium">РџСЂРёС‡РёРЅР° РїСЂРѕРґР°Р¶Рё Рё СЃСЂРѕС‡РЅРѕСЃС‚СЊ</span>
                                                {progress.sections.reason && (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                )}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-4 pb-2">
                                            <p className="text-sm text-muted-foreground mb-4">
                                                РџСЂРёС‡РёРЅР° Рё СЃСЂРѕРєРё РЅР°РїСЂСЏРјСѓСЋ РІР»РёСЏСЋС‚ РЅР° СЃС‚СЂР°С‚РµРіРёСЋ Рё С†РµРЅСѓ.
                                                <br />
                                                <span className="text-xs">Casa РёСЃРїРѕР»СЊР·СѓРµС‚ СЌС‚Рё РґР°РЅРЅС‹Рµ РїСЂРё РІС‹Р±РѕСЂРµ С„РѕСЂРјР°С‚Р° РїСЂРѕРґР°Р¶Рё.</span>
                                            </p>

                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="reason"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>РџСЂРёС‡РёРЅР° РїСЂРѕРґР°Р¶Рё</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value || ""}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Р’С‹Р±РµСЂРёС‚Рµ РїСЂРёС‡РёРЅСѓ" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {REASONS.map((r) => (
                                                                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="deadline"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>РЎСЂРѕС‡РЅРѕСЃС‚СЊ</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value || ""}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Р’С‹Р±РµСЂРёС‚Рµ СЃСЂРѕРє" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {DEADLINES.map((d) => (
                                                                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {reason === "OTHER" && (
                                                <FormField
                                                    control={form.control}
                                                    name="reasonOther"
                                                    render={({ field }) => (
                                                        <FormItem className="mt-4">
                                                            <FormLabel>РЈС‚РѕС‡РЅРёС‚Рµ РїСЂРёС‡РёРЅСѓ</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="РћРїРёС€РёС‚Рµ РїСЂРёС‡РёРЅСѓ..." {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* 3. Р¦РµРЅРѕРІС‹Рµ РѕР¶РёРґР°РЅРёСЏ */}
                                    <AccordionItem value="price" className="border rounded-lg px-4">
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-center gap-3">
                                                <DollarSign className="h-5 w-5 text-green-500" />
                                                <span className="font-medium">Р¦РµРЅРѕРІС‹Рµ РѕР¶РёРґР°РЅРёСЏ</span>
                                                {progress.sections.price && (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                )}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-4 pb-2">
                                            <p className="text-sm text-muted-foreground mb-4">
                                                РџРѕРЅРёРјР°РЅРёРµ С†РµРЅРѕРІС‹С… РѕР¶РёРґР°РЅРёР№ РїРѕРјРѕРіР°РµС‚ РІС‹СЃС‚СЂРѕРёС‚СЊ РїСЂР°РІРёР»СЊРЅСѓСЋ СЃС‚СЂР°С‚РµРіРёСЋ.
                                            </p>

                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="expectedPrice"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Р–РµР»Р°РµРјР°СЏ С†РµРЅР° (в‚ё)</FormLabel>
                                                            <FormControl>
                                                                <PriceInput
                                                                    placeholder="50 000 000"
                                                                    value={field.value ?? ""}
                                                                    onChange={(v) => field.onChange(v ? Number(v) : undefined)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="minPrice"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>РњРёРЅРёРјР°Р»СЊРЅР°СЏ С†РµРЅР° (в‚ё)</FormLabel>
                                                            <FormControl>
                                                                <PriceInput
                                                                    placeholder="45 000 000"
                                                                    value={field.value ?? ""}
                                                                    onChange={(v) => field.onChange(v ? Number(v) : undefined)}
                                                                />
                                                            </FormControl>
                                                            <FormDescription>РќРёР¶Рµ РєРѕС‚РѕСЂРѕР№ РЅРµ РіРѕС‚РѕРІ РѕРїСѓСЃРєР°С‚СЊСЃСЏ</FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <FormField
                                                    control={form.control}
                                                    name="readyToNegotiate"
                                                    render={({ field }) => (
                                                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                                            <div className="space-y-0.5">
                                                                <FormLabel>Р“РѕС‚РѕРІ РѕР±СЃСѓР¶РґР°С‚СЊ С†РµРЅСѓ</FormLabel>
                                                                <FormDescription>РљР»РёРµРЅС‚ РѕС‚РєСЂС‹С‚ Рє С‚РѕСЂРіСѓ</FormDescription>
                                                            </div>
                                                            <FormControl>
                                                                <Switch
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="marketAssessment"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>РћС†РµРЅРєР° СЂС‹РЅРєР° РїСЂРѕРґР°РІС†РѕРј</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value || ""}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="РљР°Рє РѕС†РµРЅРёРІР°РµС‚ С†РµРЅС‹?" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {MARKET_ASSESSMENTS.map((m) => (
                                                                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* 4. РџР»Р°РЅС‹ Рё Р¤РёРЅР°РЅСЃС‹ */}
                                    <AccordionItem value="plans" className="border rounded-lg px-4">
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-center gap-3">
                                                <Home className="h-5 w-5 text-blue-500" />
                                                <span className="font-medium">РџР»Р°РЅС‹ Рё Р¤РёРЅР°РЅСЃС‹</span>
                                                {progress.sections.plans && (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                )}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-4 pb-2">
                                            <p className="text-sm text-muted-foreground mb-4">
                                                РџРѕРЅРёРјР°РЅРёРµ С„РёРЅР°РЅСЃРѕРІРѕР№ СЃРёС‚СѓР°С†РёРё РїРѕРјРѕРіР°РµС‚ РїРѕРґРѕР±СЂР°С‚СЊ РѕРїС‚РёРјР°Р»СЊРЅСѓСЋ СЃС‚СЂР°С‚РµРіРёСЋ.
                                            </p>

                                            <FormField
                                                control={form.control}
                                                name="plansToPurchase"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center justify-between rounded-lg border p-3 mb-4">
                                                        <div className="space-y-0.5">
                                                            <FormLabel>РџР»Р°РЅРёСЂСѓРµС‚ РїРѕРєСѓРїРєСѓ РІР·Р°РјРµРЅ?</FormLabel>
                                                            <FormDescription>РљР»РёРµРЅС‚ С…РѕС‡РµС‚ РєСѓРїРёС‚СЊ РґСЂСѓРіСѓСЋ РЅРµРґРІРёР¶РёРјРѕСЃС‚СЊ</FormDescription>
                                                        </div>
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            {plansToPurchase && (
                                                <div className="grid grid-cols-2 gap-4 mb-4 pl-4 border-l-2 border-primary/20">
                                                    <FormField
                                                        control={form.control}
                                                        name="nextPurchaseFormat"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Р¤РѕСЂРјР°С‚ РїРѕРєСѓРїРєРё</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Р§С‚Рѕ РїР»Р°РЅРёСЂСѓРµС‚ РєСѓРїРёС‚СЊ?" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {PURCHASE_FORMATS.map((p) => (
                                                                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="purchaseBudget"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Р‘СЋРґР¶РµС‚ РЅР° РїРѕРєСѓРїРєСѓ (в‚ё)</FormLabel>
                                                                <FormControl>
                                                                    <PriceInput
                                                                        placeholder="60 000 000"
                                                                        value={field.value ?? ""}
                                                                        onChange={(v) => field.onChange(v ? Number(v) : undefined)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            )}

                                            <FormField
                                                control={form.control}
                                                name="hasDebts"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center justify-between rounded-lg border p-3 mt-4">
                                                        <div className="space-y-0.5">
                                                            <FormLabel>Р•СЃС‚СЊ РєСЂРµРґРёС‚РЅС‹Рµ РѕР±СЏР·Р°С‚РµР»СЊСЃС‚РІР°?</FormLabel>
                                                            <FormDescription>РўРµРєСѓС‰РёРµ РєСЂРµРґРёС‚С‹, РёРїРѕС‚РµРєР°</FormDescription>
                                                        </div>
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            {hasDebts && (
                                                <div className="mt-4 pl-4 border-l-2 border-primary/20">
                                                    <FormField
                                                        control={form.control}
                                                        name="loanPaymentAmount"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Р•Р¶РµРјРµСЃСЏС‡РЅС‹Р№ РїР»Р°С‚РµР¶ (в‚ё)</FormLabel>
                                                                <FormControl>
                                                                    <PriceInput
                                                                        placeholder="150 000"
                                                                        value={field.value ?? ""}
                                                                        onChange={(v) => field.onChange(v ? Number(v) : undefined)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* 5. РљРѕРјРјСѓРЅРёРєР°С†РёСЏ */}
                                    <AccordionItem value="communication" className="border rounded-lg px-4">
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-center gap-3">
                                                <MessageSquare className="h-5 w-5 text-purple-500" />
                                                <span className="font-medium">РљРѕРјРјСѓРЅРёРєР°С†РёСЏ</span>
                                                {progress.sections.communication && (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                )}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-4 pb-2">
                                            <p className="text-sm text-muted-foreground mb-4">
                                                РљР°Рє Рё РєРѕРіРґР° Р»СѓС‡С€Рµ СЃРІСЏР·С‹РІР°С‚СЊСЃСЏ СЃ РєР»РёРµРЅС‚РѕРј.
                                            </p>

                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="communicationChannel"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>РџСЂРµРґРїРѕС‡С‚РёС‚РµР»СЊРЅС‹Р№ РєР°РЅР°Р» СЃРІСЏР·Рё</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value || ""}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Р’С‹Р±РµСЂРёС‚Рµ РєР°РЅР°Р»" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {COMMUNICATION_CHANNELS.map((c) => (
                                                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="preferredTime"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>РЈРґРѕР±РЅРѕРµ РІСЂРµРјСЏ РґР»СЏ СЃРІСЏР·Рё</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="РЈС‚СЂРѕРј РґРѕ 10:00" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            )}
                        </form>
                    </Form>
                </div>

                {/* Fixed Footer */}
                <div className="p-4 bg-white border-t shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <Button type="submit" form="create-seller-form" className="w-full" disabled={mutation.isPending}>
                        {mutation.isPending
                            ? "РЎРѕС…СЂР°РЅРµРЅРёРµ..."
                            : (isEditMode ? "РЎРѕС…СЂР°РЅРёС‚СЊ РёРЅС„РѕСЂРјР°С†РёСЋ Рѕ РїСЂРѕРґР°РІС†Рµ" : "РЎРѕР·РґР°С‚СЊ РїСЂРѕРґР°РІС†Р°")
                        }
                    </Button>
                </div>
            </SheetContent >
        </Sheet >
    );
}

// Progress calculation helper
function calculateProgress(values: Partial<CreateSellerValues>) {
    const sections = {
        basic: Boolean(values.firstName && values.lastName && values.phone && values.phone.length > 3),
        reason: Boolean(values.reason || values.deadline),
        price: Boolean(values.expectedPrice || values.minPrice),
        plans: Boolean(values.plansToPurchase || values.hasDebts),
        communication: Boolean(values.communicationChannel || values.preferredTime),
    };

    const completed = Object.values(sections).filter(Boolean).length;

    return {
        sections,
        completed,
        total: 5,
    };
}
