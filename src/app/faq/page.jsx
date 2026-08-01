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

  // Admin-managed FAQs (Settings > FAQ) take priority; this hardcoded list
  // is the fallback whenever none have been published yet — real
  // OneStopStore content, not generic/empty CMS placeholder fields.
  const localFallbackFaqs = [
    {
      question: "How long does shipping take?",
      answer:
        "We offer same-day dispatch in Harare and Bulawayo for in-stock appliances and electronics. Delivery generally takes 3-7 working days Monday to Friday, subject to payment confirmation before 12h00 — see our Shipping Policy for full details.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer a 30-day return policy from the delivery date under the Consumer Protection Act. Items must be unused and in their original packaging. See our Return Policy page for the full terms, including non-returnable items and warranty details.",
    },
    {
      question: "How do I track my order?",
      answer:
        "Once your order ships you'll receive updates via email, and you can track it anytime by logging into your account and visiting your Order History.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept major cards and a range of local and regional payment options. All payments are processed securely at checkout.",
    },
    {
      question: "Do you deliver outside Harare and Bulawayo?",
      answer:
        "Yes — we deliver nationwide across Zimbabwe. Delivery timeframes may be longer outside our main hubs; free delivery applies within Harare and Bulawayo, see our Shipping Policy for details.",
    },
    {
      question: "Can I change or cancel my order?",
      answer:
        "Orders can be modified or cancelled shortly after placement, before they enter processing. Contact our customer service team as soon as possible if you need to make a change.",
    },
    {
      question: "How do I create an account?",
      answer:
        "Click 'Sign Up' in the top navigation, enter your email address and create a password. You can also create an account during checkout.",
    },
    {
      question: "What if I receive a damaged or faulty item?",
      answer:
        "Contact us within 24-48 hours of delivery with photos of the damaged item and packaging, and we'll arrange a repair, replacement, or refund in line with your rights under the Consumer Protection Act.",
    },
    {
      question: "How do I contact customer service?",
      answer:
        "Reach us by phone at +263 77 941 1028, by email at support@onestopstore.co.zw, or through live chat on the website.",
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
