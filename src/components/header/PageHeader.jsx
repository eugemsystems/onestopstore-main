import React from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

const PageHeader = async ({ title, headerBg }) => {
  const cookiesStore = await cookies();
  const lang = cookiesStore.get("_lang")?.value;
  const showingTranslateValue = (data) => {
    const updatedData =
      data !== undefined && Object?.keys(data).includes(lang)
        ? data[lang]
        : data?.en;
    return updatedData;
  };

  const displayTitle = showingTranslateValue(title);

  return (
    <div className="bg-muted/50 border-b border-border">
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-10 py-4 lg:py-12">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
          {displayTitle}
        </h1>
        <nav className="flex items-center gap-1.5 mt-3 text-sm text-muted-foreground">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">{displayTitle}</span>
        </nav>
      </div>
    </div>
  );
};

export default PageHeader;
