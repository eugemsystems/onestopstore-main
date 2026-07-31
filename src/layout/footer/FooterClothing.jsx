import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  XIcon,
  FacebookIcon,
  LinkedinIcon,
  PinterestIcon,
  WhatsappIcon,
} from "react-share";

import { cookies } from "next/headers";
import { getUserServerSession } from "@lib/auth-server";

const FooterClothing = async ({
  error,
  storeCustomizationSetting,
  globalSetting,
}) => {
  const cookieStore = await cookies();
  const lang = cookieStore.get("_lang")?.value || "en";
  const showingTranslateValue = (data) => {
    if (!data) return "";
    return data !== undefined && Object?.keys(data).includes(lang)
      ? data[lang]
      : data?.en || "";
  };
  const footer = storeCustomizationSetting?.footer;
  const userInfo = await getUserServerSession();

  return (
    <div className="pb-16 lg:pb-0 xl:pb-0 bg-neutral-900 text-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-14 lg:py-20">
          {/* Brand Column */}
          {footer?.block4_status && (
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="inline-block mb-6">
                <Image
                  width={140}
                  height={40}
                  className="h-8 w-auto max-w-[160px] object-contain"
                  src={footer?.block4_logo || "/logo/logo-color.svg"}
                  alt="logo"
                />
              </Link>
              <p className="text-sm leading-relaxed text-neutral-400 max-w-xs">
                {showingTranslateValue(footer?.block4_address) ||
                  "Curated fashion for the modern wardrobe."}
              </p>
              {footer?.block4_phone && (
                <p className="mt-3 text-xs text-neutral-500">
                  Tel: {footer.block4_phone}
                </p>
              )}
              {footer?.block4_email && (
                <p className="text-xs text-neutral-500">
                  Email: {footer.block4_email}
                </p>
              )}
            </div>
          )}

          {/* Block 1 */}
          {footer?.block1_status && (
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500 mb-5">
                {showingTranslateValue(footer?.block1_title) || "Shop"}
              </h4>
              <ul className="space-y-3">
                {[
                  {
                    title: footer?.block1_sub_title1,
                    link: footer?.block1_sub_link1,
                  },
                  {
                    title: footer?.block1_sub_title2,
                    link: footer?.block1_sub_link2,
                  },
                  {
                    title: footer?.block1_sub_title3,
                    link: footer?.block1_sub_link3,
                  },
                  {
                    title: footer?.block1_sub_title4,
                    link: footer?.block1_sub_link4,
                  },
                ].map(
                  (item, i) =>
                    item.title && (
                      <li key={i}>
                        <Link
                          href={item.link || "#"}
                          className="text-sm text-neutral-400 hover:text-white transition-colors"
                        >
                          {showingTranslateValue(item.title)}
                        </Link>
                      </li>
                    ),
                )}
                <li>
                  <Link
                    href="/track"
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    Track Order
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Block 2 */}
          {footer?.block2_status && (
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500 mb-5">
                {showingTranslateValue(footer?.block2_title) || "Help"}
              </h4>
              <ul className="space-y-3">
                {[
                  {
                    title: footer?.block2_sub_title1,
                    link: footer?.block2_sub_link1,
                  },
                  {
                    title: footer?.block2_sub_title2,
                    link: footer?.block2_sub_link2,
                  },
                  {
                    title: footer?.block2_sub_title3,
                    link: footer?.block2_sub_link3,
                  },
                  {
                    title: footer?.block2_sub_title4,
                    link: footer?.block2_sub_link4,
                  },
                ].map(
                  (item, i) =>
                    item.title && (
                      <li key={i}>
                        <Link
                          href={item.link || "#"}
                          className="text-sm text-neutral-400 hover:text-white transition-colors"
                        >
                          {showingTranslateValue(item.title)}
                        </Link>
                      </li>
                    ),
                )}
              </ul>
            </div>
          )}

          {/* Block 3 */}
          {footer?.block3_status && (
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500 mb-5">
                {showingTranslateValue(footer?.block3_title) || "Account"}
              </h4>
              <ul className="space-y-3">
                {[
                  {
                    title: footer?.block3_sub_title1,
                    link: footer?.block3_sub_link1,
                  },
                  {
                    title: footer?.block3_sub_title2,
                    link: footer?.block3_sub_link2,
                  },
                  {
                    title: footer?.block3_sub_title3,
                    link: footer?.block3_sub_link3,
                  },
                  {
                    title: footer?.block3_sub_title4,
                    link: footer?.block3_sub_link4,
                  },
                ].map(
                  (item, i) =>
                    item.title && (
                      <li key={i}>
                        <Link
                          href={userInfo?.email ? item.link || "#" : "#"}
                          className="text-sm text-neutral-400 hover:text-white transition-colors"
                        >
                          {showingTranslateValue(item.title)}
                        </Link>
                      </li>
                    ),
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">
            {globalSetting?.copyright_text ||
              "© " + new Date().getFullYear() + " All rights reserved."}
          </p>

          {footer?.social_links_status && (
            <div className="flex items-center gap-3">
              {footer?.social_facebook && (
                <Link
                  href={footer.social_facebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                >
                  <FacebookIcon size={28} round />
                </Link>
              )}
              {footer?.social_twitter && (
                <Link
                  href={footer.social_twitter}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter"
                >
                  <XIcon size={28} round />
                </Link>
              )}
              {footer?.social_pinterest && (
                <Link
                  href={footer.social_pinterest}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Pinterest"
                >
                  <PinterestIcon size={28} round />
                </Link>
              )}
              {footer?.social_linkedin && (
                <Link
                  href={footer.social_linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon size={28} round />
                </Link>
              )}
              {footer?.social_whatsapp && (
                <Link
                  href={footer.social_whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                >
                  <WhatsappIcon size={28} round />
                </Link>
              )}
            </div>
          )}

          {footer?.payment_method_status && (
            <div>
              <Image
                width={200}
                height={50}
                className="opacity-60"
                src={
                  footer?.payment_method_img ||
                  "/payment-method/payment-logo.png"
                }
                alt="payment"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FooterClothing;
