import { cn } from "@lib/utils";

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground aria-invalid:ring-destructive/20 aria-invalid:border-destructive focus-visible:border-ring focus-visible:ring-ring/40 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-0 focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "placeholder:text-sm",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
