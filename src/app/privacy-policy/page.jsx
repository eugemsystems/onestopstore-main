import React from "react";

//internal import

import PageHeader from "@components/header/PageHeader";
import CMSkeletonTwo from "@components/preloader/CMSkeleton";
import PolicyPageLayout from "@components/policy/PolicyPageLayout";
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
      <PolicyPageLayout>
        <CMSkeletonTwo
          html
          count={15}
          height={15}
          error={error}
          loading={false}
          data={privacy_policy?.description}
        />
      </PolicyPageLayout>
    </div>
  );
};

export default PrivacyPolicy;
