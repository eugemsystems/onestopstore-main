import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Facebook, Twitter, Youtube, ShoppingBag } from "lucide-react";
import NewsletterForm from "./NewsletterForm";

import { cookies } from "next/headers";
import { getUserServerSession } from "@lib/auth-server";

const FooterModern = async ({
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
  const home = storeCustomizationSetting?.home;
  const userInfo = await getUserServerSession();

  return (
    <footer className="text-gray-800 font-sans border-t border-gray-100">
      {/* Main Footer Content */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-4 lg:border-r border-gray-200 lg:pr-8 flex flex-col space-y-10">

            {/* Newsletter */}
            <div>
              <h3 className="text-[22px] font-bold text-slate-800 leading-snug mb-5">
                Get early discount offers, updates subscribe to our newsletter
              </h3>
              <NewsletterForm />
            </div>

            {/* Phone */}
            {footer?.block4_phone && (
              <div className="flex items-center space-x-4 my-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-800 tracking-tight">
                    {footer.block4_phone}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    Working 8:00 - 22:00
                  </div>
                </div>
              </div>
            )}

            {/* App Download */}
            <div>
              <h4 className="text-base font-bold text-slate-800 mb-4">
                Download our app
              </h4>
              <div className="flex flex-wrap gap-3">
                {/* Google Play */}
                <Link
                  href={home?.daily_need_google_link || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-black hover:bg-gray-800 transition text-white px-3 py-2 rounded-md flex items-center space-x-2"
                >
                  {home?.button2_img ? (
                    <Image
                      src={home.button2_img}
                      alt="Google Play"
                      width={120}
                      height={36}
                      className="h-9 w-auto object-contain"
                    />
                  ) : (
                    <>
                      <svg viewBox="0 0 512 512" className="w-6 h-6 flex-shrink-0" fill="currentColor">
                        <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" fill="url(#ps-grad)" />
                        <defs>
                          <linearGradient id="ps-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00f076" />
                            <stop offset="100%" stopColor="#0079ff" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="text-left">
                        <div className="text-[10px] uppercase tracking-wider leading-none text-gray-300">GET IT ON</div>
                        <div className="text-sm font-semibold leading-tight">Google Play</div>
                      </div>
                    </>
                  )}
                </Link>

                {/* App Store */}
                <Link
                  href={home?.daily_need_app_link || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-black hover:bg-gray-800 transition text-white px-3 py-2 rounded-md flex items-center space-x-2"
                >
                  {home?.button1_img ? (
                    <Image
                      src={home.button1_img}
                      alt="App Store"
                      width={120}
                      height={36}
                      className="h-9 w-auto object-contain"
                    />
                  ) : (
                    <>
                      <svg viewBox="0 0 384 512" className="w-6 h-6 flex-shrink-0" fill="currentColor">
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                      </svg>
                      <div className="text-left">
                        <div className="text-[10px] uppercase tracking-wider leading-none text-gray-300">Download on the</div>
                        <div className="text-sm font-semibold leading-tight">App Store</div>
                      </div>
                    </>
                  )}
                </Link>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-8 lg:pl-6 flex flex-col justify-between">

            {/* Top row: Logo (left) + Social (right) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-8 mb-8">
              {/* Logo */}
              <Link href="/" className="flex-shrink-0">
                {footer?.block4_logo ? (
                  <Image
                    width={130}
                    height={40}
                    className="h-9 w-auto object-contain"
                    src={footer.block4_logo}
                    alt="logo"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="h-7 w-7 text-[#00a859]" fill="#00a859" />
                    <span className="text-2xl font-bold tracking-tight text-slate-800">
                      {globalSetting?.store_name || "Store"}
                    </span>
                  </div>
                )}
              </Link>

              {/* Social icons */}
              {footer?.social_links_status && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600 mr-2">
                    Follow us on social media
                  </span>
                  {footer?.social_facebook && (
                    <Link
                      href={footer.social_facebook}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Facebook"
                      className="w-8 h-8 rounded-sm bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
                    >
                      <Facebook className="h-4 w-4" />
                    </Link>
                  )}
                  {footer?.social_twitter && (
                    <Link
                      href={footer.social_twitter}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Twitter"
                      className="w-8 h-8 rounded-sm bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
                    >
                      <Twitter className="h-4 w-4" />
                    </Link>
                  )}
                  {footer?.social_whatsapp && (
                    <Link
                      href={footer.social_whatsapp}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Youtube"
                      className="w-8 h-8 rounded-sm bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
                    >
                      <Youtube className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* 4 Link Columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

              {/* Block 1 */}
              {footer?.block1_status && (
                <div>
                  <h4 className="text-[15px] font-bold text-slate-800 mb-5">
                    {showingTranslateValue(footer?.block1_title) || "Useful links"}
                  </h4>
                  <ul className="space-y-1.5">
                    {[
                      { title: footer?.block1_sub_title1, link: footer?.block1_sub_link1 },
                      { title: footer?.block1_sub_title2, link: footer?.block1_sub_link2 },
                      { title: footer?.block1_sub_title3, link: footer?.block1_sub_link3 },
                      { title: footer?.block1_sub_title4, link: footer?.block1_sub_link4 },
                    ].map(
                      (item, i) =>
                        item.title && (
                          <li key={i}>
                            <Link href={item.link || "#"} className="block text-sm text-gray-500 hover:text-primary hover:ml-2 transition-all duration-300">
                              {showingTranslateValue(item.title)}
                            </Link>
                          </li>
                        )
                    )}
                    <li>
                      <Link
                        href="/track"
                        className="block text-sm text-gray-500 hover:text-primary hover:ml-2 transition-all duration-300"
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
                  <h4 className="text-[15px] font-bold text-slate-800 mb-5">
                    {showingTranslateValue(footer?.block2_title) || "Shop category"}
                  </h4>
                  <ul className="space-y-1.5">
                    {[
                      { title: footer?.block2_sub_title1, link: footer?.block2_sub_link1 },
                      { title: footer?.block2_sub_title2, link: footer?.block2_sub_link2 },
                      { title: footer?.block2_sub_title3, link: footer?.block2_sub_link3 },
                      { title: footer?.block2_sub_title4, link: footer?.block2_sub_link4 },
                    ].map(
                      (item, i) =>
                        item.title && (
                          <li key={i}>
                            <Link href={item.link || "#"} className="block text-sm text-gray-500 hover:text-primary hover:ml-2 transition-all duration-300">
                              {showingTranslateValue(item.title)}
                            </Link>
                          </li>
                        )
                    )}
                  </ul>
                </div>
              )}

              {/* Block 3 */}
              {footer?.block3_status && (
                <div>
                  <h4 className="text-[15px] font-bold text-slate-800 mb-5">
                    {showingTranslateValue(footer?.block3_title) || "Let us help you"}
                  </h4>
                  <ul className="space-y-1.5">
                    {[
                      { title: footer?.block3_sub_title1, link: footer?.block3_sub_link1 },
                      { title: footer?.block3_sub_title2, link: footer?.block3_sub_link2 },
                      { title: footer?.block3_sub_title3, link: footer?.block3_sub_link3 },
                      { title: footer?.block3_sub_title4, link: footer?.block3_sub_link4 },
                    ].map(
                      (item, i) =>
                        item.title && (
                          <li key={i}>
                            <Link
                              href={userInfo?.email ? item.link || "#" : "#"}
                              className="block text-sm text-gray-500 hover:text-primary hover:ml-2 transition-all duration-300"
                            >
                              {showingTranslateValue(item.title)}
                            </Link>
                          </li>
                        )
                    )}
                  </ul>
                </div>
              )}

              {/* Block 4 – Get to know us */}
              <div>
                <h4 className="text-[15px] font-bold text-slate-800 mb-5">
                  Get to know us
                </h4>
                <ul className="space-y-1.5">
                  <li>
                    <Link href="/about-us" className="block text-sm text-gray-500 hover:text-primary hover:ml-2 transition-all duration-300">
                      About us
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="flex items-center text-sm text-gray-500 hover:text-primary hover:ml-2 transition-all duration-300">
                      Careers
                      <span className="ml-2 bg-[#3bb0e5] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                        Open
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="block text-sm text-gray-500 hover:text-primary hover:ml-2 transition-all duration-300">
                      Customer reviews
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy-policy" className="block text-sm text-gray-500 hover:text-primary hover:ml-2 transition-all duration-300">
                      Privacy policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Payment strip */}
            {footer?.payment_method_status && (
              <div className="mt-8 border-t border-gray-100 pt-6">
                <h4 className="text-[15px] font-bold text-slate-800 mb-3">
                  We accepted payment
                </h4>
                <ul className="flex items-center flex-wrap gap-2.5">
                  <li className="bg-white px-2 py-1 hover:border-emerald-500 hover:shadow-md transition-all border border-gray-200 rounded flex items-center justify-center h-[34px] w-[64px]">
                    <Image src="/app/visa-icon.svg" width={46} height={24} alt="Visa" className="object-contain" />
                  </li>
                  <li className="bg-white px-2 py-1 hover:border-emerald-500 hover:shadow-md transition-all border border-gray-200 rounded flex items-center justify-center h-[34px] w-[64px]">
                    <Image src="/app/mastercard-icon.svg" width={46} height={24} alt="Mastercard" className="object-contain" />
                  </li>
                  <li className="bg-white px-2 py-1 hover:border-emerald-500 hover:shadow-md transition-all border border-gray-200 rounded flex items-center justify-center h-[34px] w-[64px]">
                    <Image src="/app/paypal-icon.svg" width={46} height={24} alt="PayPal" className="object-contain" />
                  </li>
                  <li className="bg-white px-2 py-1 hover:border-emerald-500 hover:shadow-md transition-all border border-gray-200 rounded flex items-center justify-center h-[34px] w-[64px]">
                    <Image src="/app/skrill-icon.svg" width={46} height={24} alt="Skrill" className="object-contain" />
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-50 py-3 border-t border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-gray-500 mb-4 md:mb-0">
            {globalSetting?.copyright_text || (
              <>© All rights reserved. Made by <span className="text-gray-400">ThemeTags</span></>
            )}
          </p>
          <div className="flex space-x-6">
            <Link href="/terms-and-conditions" className="text-gray-500 hover:text-emerald-500 transition-colors">
              Terms &amp; conditions
            </Link>
            <Link href="/privacy-policy" className="text-gray-500 hover:text-emerald-500 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterModern;