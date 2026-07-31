import React from "react";

//internal import
import PageHeader from "@components/header/PageHeader";
import CMSkeletonTwo from "@components/preloader/CMSkeleton";
import { getCustomizationSettings } from "@lib/actions/settings.actions";

export const metadata = {
  title: "Terms and Conditions",
  description:
    "Read our terms and conditions to understand your rights and obligations.",
  keywords: ["terms", "conditions", "user rights", "legal"],
};

const TermsAndConditions = async () => {
  const { storeCustomizationSetting, error } = await getCustomizationSettings();

  const terms_and_conditions = storeCustomizationSetting?.term_and_condition;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        headerBg={terms_and_conditions?.header_bg}
        title={terms_and_conditions?.title}
      />

      <div className="relative z-10 mt-4 bg-background text-foreground">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-10">
          <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
            <CMSkeletonTwo
              html
              count={15}
              height={15}
              error={error}
              loading={false}
              data={terms_and_conditions?.description}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
