import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-border/60 pb-6 mb-6",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-semibold leading-tight">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground text-sm max-w-2xl">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
