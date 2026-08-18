import * as React from "react";
import { cn } from "../ui/utils";

type TypographyProps<T extends React.ElementType> = {
    as?: T;
    className?: string;
    children: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

// --- DISPLAY (Títulos Principales / Branding) ---
export function DisplayLG({ as: Component = "h1", className, children, ...props }: TypographyProps<"h1">) {
    return (
        <Component className={cn("text-[32px] leading-[40px] font-bold tracking-tight text-[#1c1b1b]", className)} {...props}>
            {children}
        </Component>
    );
}

export function DisplayMD({ as: Component = "h2", className, children, ...props }: TypographyProps<"h2">) {
    return (
        <Component className={cn("text-[26px] leading-[32px] font-bold tracking-tight text-[#1c1b1b]", className)} {...props}>
            {children}
        </Component>
    );
}

export function DisplayXS({ as: Component = "h3", className, children, ...props }: TypographyProps<"h3">) {
    return (
        <Component className={cn("text-[20px] leading-[26px] font-bold tracking-tight text-[#1c1b1b]", className)} {...props}>
            {children}
        </Component>
    );
}

// --- HEADING (Subtítulos y Secciones) ---
export function HeadingMD({ as: Component = "h4", className, children, ...props }: TypographyProps<"h4">) {
    return (
        <Component className={cn("text-[16px] leading-[22px] font-bold text-[#1c1b1b]", className)} {...props}>
            {children}
        </Component>
    );
}

export function HeadingSM({ as: Component = "h5", className, children, ...props }: TypographyProps<"h5">) {
    return (
        <Component className={cn("text-[14px] leading-[20px] font-semibold text-[#1c1b1b]", className)} {...props}>
            {children}
        </Component>
    );
}

// --- BODY (Textos Generales y Contenido) ---
export function BodyLG({ as: Component = "p", className, children, ...props }: TypographyProps<"p">) {
    return (
        <Component className={cn("text-[16px] leading-[24px] font-normal text-[#1c1b1b]", className)} {...props}>
            {children}
        </Component>
    );
}

export function BodyMD({ as: Component = "p", className, children, ...props }: TypographyProps<"p">) {
    return (
        <Component className={cn("text-[14px] leading-[21px] font-normal text-[#1c1b1b]", className)} {...props}>
            {children}
        </Component>
    );
}

export function BodySM({ as: Component = "p", className, children, ...props }: TypographyProps<"p">) {
    return (
        <Component className={cn("text-[13px] leading-[18px] font-normal text-[#636363]", className)} {...props}>
            {children}
        </Component>
    );
}

// --- CAPTION (Descripciones y Textos Secundarios) ---
export function CaptionMD({ as: Component = "p", className, children, ...props }: TypographyProps<"p">) {
    return (
        <Component className={cn("text-[12px] leading-[16px] font-medium text-[#636363]", className)} {...props}>
            {children}
        </Component>
    );
}

export function CaptionSM({ as: Component = "span", className, children, ...props }: TypographyProps<"span">) {
    return (
        <Component className={cn("text-[11px] leading-[15px] font-normal text-[#757575]", className)} {...props}>
            {children}
        </Component>
    );
}

// --- LABELS & BADGES (Etiquetas, Botones y Rótulos) ---
export function LabelMD({ as: Component = "span", className, children, ...props }: TypographyProps<"span">) {
    return (
        <Component className={cn("text-[13px] leading-[18px] font-bold uppercase tracking-wider text-[#636363]", className)} {...props}>
            {children}
        </Component>
    );
}

export function LabelXS({ as: Component = "span", className, children, ...props }: TypographyProps<"span">) {
    return (
        <Component className={cn("text-[11px] leading-[14px] font-bold uppercase tracking-wider text-[#636363]", className)} {...props}>
            {children}
        </Component>
    );
}