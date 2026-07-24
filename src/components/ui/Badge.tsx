import { cn } from "@/lib/utils";

const variants = {
  pending: "bg-amber-50 text-amber-700 ring-amber-100",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  archived: "bg-slate-100 text-slate-600 ring-slate-200",
  blue: "bg-sky-50 text-kera-blue ring-sky-100",
  amber: "bg-orange-50 text-orange-700 ring-orange-100",
};

export function Badge({
  children,
  variant = "blue",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
