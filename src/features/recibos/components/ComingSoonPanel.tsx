import { Construction } from "lucide-react";
import { Card } from "@/shared/ui";

export function ComingSoonPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-muted">
        <Construction className="size-5 text-foreground-muted" />
      </span>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="mt-1 max-w-md text-sm text-foreground-muted">
          {description}
        </p>
      </div>
    </Card>
  );
}
