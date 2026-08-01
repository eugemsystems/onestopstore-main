/**
 * Shared "neat and nice" container for the policy pages (Terms &
 * Conditions, Privacy Policy, Return Policy, Shipping Policy) — all four
 * previously rendered as a bare wall of prose text with no visual
 * container. This wraps that same content in a centered card, consistent
 * across all four.
 */
const PolicyPageLayout = ({ children }) => {
  return (
    <div className="relative z-10 mt-4 bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-3 sm:px-10 py-8 sm:py-12">
        <div className="rounded-2xl border border-border bg-card shadow-sm p-6 sm:p-10">
          <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert prose-headings:font-semibold prose-h4:mt-8 prose-h4:mb-3 prose-h4:text-base prose-h4:text-primary prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-li:my-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPageLayout;
