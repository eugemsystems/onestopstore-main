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
          <div
            className="prose prose-sm sm:prose-base max-w-none dark:prose-invert
              prose-headings:font-bold prose-headings:text-foreground
              prose-h1:mt-10 prose-h1:mb-3 prose-h1:text-xl prose-h1:first:mt-0
              prose-h1:border-b prose-h1:border-primary/20 prose-h1:pb-2
              prose-h2:mt-10 prose-h2:mb-3 prose-h2:text-lg
              prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-base prose-h3:text-primary
              prose-h4:mt-8 prose-h4:mb-3 prose-h4:text-base prose-h4:text-primary
              prose-strong:font-bold prose-strong:text-foreground
              prose-p:leading-relaxed prose-p:my-3
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-li:my-1 prose-ol:my-3 prose-ul:my-3"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPageLayout;
