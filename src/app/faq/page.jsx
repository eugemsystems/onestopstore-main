import React from "react";
import Image from "next/image";
import { cookies } from "next/headers";

//internal import
import PageHeader from "@components/header/PageHeader";
import FaqContent from "@components/faq/FaqContent";
import { getCustomizationSettings } from "@lib/actions/settings.actions";
import { getFaqs } from "@lib/actions/pages.actions";

export const metadata = {
  title: "FAQ",
  description:
    "Find answers to frequently asked questions about our products, shipping, and policies.",
  keywords: ["faq", "frequently asked questions", "help", "support"],
};

const Faq = async () => {
  const [{ storeCustomizationSetting, error }, { faqs: apiFaqs }] = await Promise.all([
    getCustomizationSettings(),
    getFaqs(),
  ]);

  const cookiesStore = await cookies();
  const lang = cookiesStore.get("_lang")?.value;
  const showingTranslateValue = (data) => {
    const updatedData =
      data !== undefined && Object?.keys(data).includes(lang)
        ? data[lang]
        : data?.en;
    return updatedData;
  };

  // Admin-managed FAQs (Settings > FAQ) take priority; the built-in
  // fallback list only shows while none have been published yet.
  const localFallbackFaqs = [
    {
      question: showingTranslateValue(storeCustomizationSetting?.faq?.faq_one),
      answer: showingTranslateValue(
        storeCustomizationSetting?.faq?.description_one,
      ),
    },
    {
      question: showingTranslateValue(storeCustomizationSetting?.faq?.faq_two),
      answer: showingTranslateValue(
        storeCustomizationSetting?.faq?.description_two,
      ),
    },
    {
      question: showingTranslateValue(
        storeCustomizationSetting?.faq?.faq_three,
      ),
      answer: showingTranslateValue(
        storeCustomizationSetting?.faq?.description_three,
      ),
    },
    {
      question: showingTranslateValue(storeCustomizationSetting?.faq?.faq_four),
      answer: showingTranslateValue(
        storeCustomizationSetting?.faq?.description_four,
      ),
    },
    {
      question: showingTranslateValue(storeCustomizationSetting?.faq?.faq_five),
      answer: showingTranslateValue(
        storeCustomizationSetting?.faq?.description_five,
      ),
    },
    {
      question: showingTranslateValue(storeCustomizationSetting?.faq?.faq_six),
      answer: showingTranslateValue(
        storeCustomizationSetting?.faq?.description_six,
      ),
    },
    {
      question: showingTranslateValue(
        storeCustomizationSetting?.faq?.faq_seven,
      ),
      answer: showingTranslateValue(
        storeCustomizationSetting?.faq?.description_seven,
      ),
    },
    {
      question: showingTranslateValue(
        storeCustomizationSetting?.faq?.faq_eight,
      ),
      answer: showingTranslateValue(
        storeCustomizationSetting?.faq?.description_eight,
      ),
    },
  ];

  const faqs =
    apiFaqs?.length > 0
      ? apiFaqs.map((f) => ({ question: f.title, answer: f.description }))
      : localFallbackFaqs;

  return (
    <div className="bg-background">
      <PageHeader
        headerBg={storeCustomizationSetting?.faq?.header_bg}
        title={storeCustomizationSetting?.faq?.title}
      />

      <div className="relative z-10 -mt-4 sm:-mt-6 bg-background">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-10 py-10 lg:py-12">
          <div className="grid gap-4 lg:mb-8 items-center md:grid-cols-2 xl:grid-cols-2">
            <div className="pr-16">
              <Image
                width={720}
                height={550}
                src={storeCustomizationSetting?.faq?.left_img || "/faq.svg"}
                alt="logo"
              />
            </div>
            <dl className="mt-10 space-y-6 divide-y divide-border">
              {faqs.map((faq, index) => (
                <FaqContent key={index + 1} faq={faq} />
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;
