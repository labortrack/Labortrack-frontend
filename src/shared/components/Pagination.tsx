import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, totalElements, disabled, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex flex-col gap-3 border-t border-border bg-subtle px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-foreground-muted"><strong className="text-foreground">{totalElements}</strong> resultados · Página <strong className="text-foreground">{page + 1}</strong> de <strong className="text-foreground">{totalPages}</strong></p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={disabled || page === 0} onClick={() => onPageChange(page - 1)}><ChevronLeft />Anterior</Button>
        <Button variant="outline" size="sm" disabled={disabled || page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>Siguiente<ChevronRight /></Button>
      </div>
    </div>
  );
}
