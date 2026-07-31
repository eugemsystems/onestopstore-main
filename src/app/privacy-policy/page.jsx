import React from "react";

//internal import

import PageHeader from "@components/header/PageHeader";
import CMSkeletonTwo from "@components/preloader/CMSkeleton";
import { getCustomizationSettings } from "@lib/actions/settings.actions";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Learn about our privacy practices and how we protect your information.",
  keywords: ["privacy", "policy", "data protection", "user rights"],
};

const PrivacyPolicy = async () => {
  const { storeCustomizationSetting, error } = await getCustomizationSettings();

  const privacy_policy = storeCustomizationSetting?.privacy_policy;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        headerBg={privacy_policy?.header_bg}
        title={privacy_policy?.title}
      />
      <div className="relative z-10 mt-4 bg-background text-foreground">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-10">
          <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
            <CMSkeletonTwo
              html
              count={15}
              height={15}
              error={error}
              loading={false}
              data={privacy_policy?.description}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
