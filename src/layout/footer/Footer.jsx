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

//internal imports

import CMSkeletonTwo from "@components/preloader/CMSkeletonTwo";
import { getUserServerSession } from "@lib/auth-server";

const Footer = async ({ error, storeCustomizationSetting, globalSetting }) => {
  const footer = storeCustomizationSetting?.footer;
  const navbarLogo = storeCustomizationSetting?.navbar?.logo;
  const userInfo = await getUserServerSession();

  // console.log("userInfo", userInfo);

  return (
    <div className="dark pb-16 lg:pb-0 xl:pb-0 bg-background text-foreground">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
        <div className="grid grid-cols-1 md:grid-cols-7 xl:grid-cols-12 gap-5 sm:gap-9 lg:gap-11 xl:gap-7 py-10 lg:py-16 justify-between">
          {/* Help Center — admin-editable via /themeOptions, mirrors the
              legacy frontend's FooterQuickPage, replacing the old static
              "Quick Links" block */}
          {globalSetting?.footer_help_center?.length > 0 && (
            <div className="pb-3.5 sm:pb-0 col-span-1 md:col-span-2 lg:col-span-3">
              <h3 className="text-md lg:leading-7 font-medium mb-4 sm:mb-5 lg:mb-6 pb-0.5">
                Help Center
              </h3>
              <ul className="text-sm flex flex-col space-y-3">
                {globalSetting.footer_help_center.map((item) => (
                  <li key={item.id ?? item.value} className="flex items-baseline">
                    <Link
                      href={`/${item.value}`}
                      className="text-muted-foreground inline-block w-full hover:text-primary capitalize"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {footer?.block2_status && (
            <div className="pb-3.5 sm:pb-0 col-span-1 md:col-span-2 lg:col-span-3">
              <h3 className="text-md lg:leading-7 font-medium mb-4 sm:mb-5 lg:mb-6 pb-0.5">
                <CMSkeletonTwo
                  count={1}
                  height={20}
                  // error={error}
                  loading={false}
                  data={footer?.block2_title}
                />
              </h3>
              <ul className="text-sm lg:text-15px flex flex-col space-y-3">
                <li className="flex items-baseline">
                  <Link
                    href={`${footer?.block2_sub_link1}`}
                    className="text-muted-foreground inline-block w-full hover:text-primary"
                  >
                    <CMSkeletonTwo
                      count={1}
                      height={10}
                      // error={error}
                      loading={false}
                      data={footer?.block2_sub_title1}
                    />
                  </Link>
                </li>

                <li className="flex items-baseline">
                  <Link
                    href={`${footer?.block2_sub_link2}`}
                    className="text-muted-foreground inline-block w-full hover:text-primary"
                  >
                    <CMSkeletonTwo
                      count={1}
                      height={10}
                      // error={error}
                      loading={false}
                      data={footer?.block2_sub_title2}
                    />
                  </Link>
                </li>
                <li className="flex items-baseline">
                  <Link
                    href={`${footer?.block2_sub_link3}`}
                    className="text-muted-foreground inline-block w-full hover:text-primary"
                  >
                    <CMSkeletonTwo
                      count={1}
                      height={10}
                      // error={error}
                      loading={false}
                      data={footer?.block2_sub_title3}
                    />
                  </Link>
                </li>
                <li className="flex items-baseline">
                  <Link
                    href={`${footer?.block2_sub_link4}`}
                    className="text-muted-foreground inline-block w-full hover:text-primary"
                  >
                    <CMSkeletonTwo
                      count={1}
                      height={10}
                      // error={error}
                      loading={false}
                      data={footer?.block2_sub_title4}
                    />
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {footer?.block3_status && (
            <div className="pb-3.5 sm:pb-0 col-span-1 md:col-span-2 lg:col-span-3">
              <h3 className="text-md lg:leading-7 font-medium mb-4 sm:mb-5 lg:mb-6 pb-0.5">
                <CMSkeletonTwo
                  count={1}
                  height={20}
                  // error={error}
                  loading={false}
                  data={footer?.block3_title}
                />
              </h3>
              <ul className="text-sm lg:text-15px flex flex-col space-y-3">
                <li className="flex items-baseline">
                  <Link
                    href={`${userInfo?.email ? footer?.block3_sub_link1 : "#"}`}
                    className="text-muted-foreground inline-block w-full hover:text-primary"
                  >
                    <CMSkeletonTwo
                      count={1}
                      height={10}
                      // error={error}
                      loading={false}
                      data={footer?.block3_sub_title1}
                    />
                  </Link>
                </li>
                <li className="flex items-baseline">
                  <Link
                    href={`${userInfo?.email ? footer?.block3_sub_link2 : "#"}`}
                    className="text-muted-foreground inline-block w-full hover:text-primary"
                  >
                    <CMSkeletonTwo
                      count={1}
                      height={10}
                      // error={error}
                      loading={false}
                      data={footer?.block3_sub_title2}
                    />
                  </Link>
                </li>
                <li className="flex items-baseline">
                  <Link
                    href={`${userInfo?.email ? footer?.block3_sub_link3 : "#"}`}
                    className="text-muted-foreground inline-block w-full hover:text-primary"
                  >
                    <CMSkeletonTwo
                      count={1}
                      height={10}
                      // error={error}
                      loading={false}
                      data={footer?.block3_sub_title3}
                    />
                  </Link>
                </li>
                <li className="flex items-baseline">
                  <Link
                    href={`${userInfo?.email ? footer?.block3_sub_link4 : "#"}`}
                    className="text-muted-foreground inline-block w-full hover:text-primary"
                  >
                    <CMSkeletonTwo
                      count={1}
                      height={10}
                      // error={error}
                      loading={false}
                      data={footer?.block3_sub_title4}
                    />
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {footer?.block4_status && (
            <div className="pb-3.5 sm:pb-0 col-span-1 md:col-span-2 lg:col-span-3">
              <Link
                href="/"
                className="mr-3 lg:mr-12 xl:mr-12 inline-block"
                rel="noreferrer"
              >
                <Image
                  width={140}
                  height={40}
                  className="h-8 w-auto max-w-[160px] object-contain"
                  src={footer?.block4_logo || "/logo/logo-color.svg"}
                  alt="logo"
                />
              </Link>
              {globalSetting?.footer_about && (
                <p className="leading-6 font-sans text-sm text-muted-foreground mt-3">
                  {globalSetting.footer_about}
                </p>
              )}
              <p className="leading-7 font-sans text-sm text-muted-foreground mt-3">
                {globalSetting?.address || footer?.block4_address ? (
                  <>
                    {globalSetting?.address || (
                      <CMSkeletonTwo
                        count={1}
                        height={10}
                        loading={false}
                        data={footer?.block4_address}
                      />
                    )}
                    <br />
                  </>
                ) : null}
                {(globalSetting?.contact || footer?.block4_phone) && (
                  <>
                    <span> Tel : {globalSetting?.contact || footer?.block4_phone}</span>
                    <br />
                  </>
                )}
                {(globalSetting?.email || footer?.block4_email) && (
                  <span> Email : {globalSetting?.email || footer?.block4_email}</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Multi-branch addresses — admin-editable via /themeOptions */}
        {globalSetting?.footer_addresses?.filter((a) => a?.address || a?.phones?.length || a?.email).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
            {globalSetting.footer_addresses
              .filter((a) => a?.address || a?.phones?.length || a?.email)
              .map((branch, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-card p-4">
                  <p className="font-semibold text-foreground text-sm mb-1.5">
                    {branch.location || "Branch"}
                  </p>
                  {branch.address && (
                    <p className="text-sm text-muted-foreground">{branch.address}</p>
                  )}
                  {Array.isArray(branch.phones) &&
                    branch.phones.map((phone, i) => (
                      <p key={i} className="text-sm text-muted-foreground">
                        {phone}
                      </p>
                    ))}
                  {branch.email && (
                    <p className="text-sm text-muted-foreground">{branch.email}</p>
                  )}
                </div>
              ))}
          </div>
        )}

        <hr className="hr-line"></hr>

        <div className="mx-auto max-w-screen-2xl px-4 sm:px-10 bg-muted shadow-sm border border-border rounded-lg flex flex-col items-center py-8 gap-6 text-center">
          {/* Payment methods — full-width centered strip, same layout as the legacy footer's SubFooter */}
          {footer?.payment_method_status && (
            <Image
              width={1000}
              height={150}
              className="w-full max-w-2xl h-auto"
              src={footer?.payment_method_img || "/payment-method/payment-logo.png"}
              alt="payment methods"
            />
          )}

          {/* Call us */}
          {footer?.bottom_contact_status && (globalSetting?.contact || footer?.bottom_contact) && (
            <div>
              <p className="text-base leading-7 font-medium">Call Us</p>
              <h5 className="text-2xl font-bold text-primary leading-7">
                {globalSetting?.contact || footer?.bottom_contact}
              </h5>
            </div>
          )}

          {/* Trademark / copyright — matches the legacy footer's reserved-rights block */}
          <div className="max-w-3xl">
            <p className="text-xs text-muted-foreground leading-6">
              The trademark &ldquo;{globalSetting?.company_name || globalSetting?.shop_name}&rdquo; is a registered
              mark of its owner. All content, including but not limited to text, graphics, logos, and images, is
              the exclusive property of {globalSetting?.company_name || globalSetting?.shop_name} and is protected
              under applicable copyright and intellectual property laws. All rights are expressly reserved. No
              portion of this website may be reproduced, duplicated, or distributed in any form without prior
              written consent.
            </p>
            <p className="text-sm font-medium text-foreground mt-2">
              {globalSetting?.copyright_text ||
                `Copyright ${new Date().getFullYear()} @ All rights reserved.`}
            </p>
          </div>

          {/* Social links */}
          {(footer?.social_links_status || globalSetting?.footer_social?.enabled) && (
            <div>
              {(footer?.social_facebook ||
                footer?.social_twitter ||
                footer?.social_pinterest ||
                footer?.social_linkedin ||
                footer?.social_whatsapp ||
                globalSetting?.footer_social?.facebook ||
                globalSetting?.footer_social?.twitter ||
                globalSetting?.footer_social?.pinterest ||
                globalSetting?.footer_social?.instagram) && (
                <span className="text-base leading-7 font-medium block mb-2 pb-0.5">
                  Follow Us
                </span>
              )}
              <ul className="text-sm flex justify-center">
                {(footer?.social_facebook || globalSetting?.footer_social?.facebook) && (
                  <li className="flex items-center mr-3 transition ease-in-out duration-500">
                    <Link
                      href={`${footer?.social_facebook || globalSetting?.footer_social?.facebook}`}
                      aria-label="Social Link"
                      rel="noreferrer"
                      target="_blank"
                      className="block text-center mx-auto text-muted-foreground hover:text-white"
                    >
                      <FacebookIcon size={34} round />
                    </Link>
                  </li>
                )}
                {(footer?.social_twitter || globalSetting?.footer_social?.twitter) && (
                  <li className="flex items-center  mr-3 transition ease-in-out duration-500">
                    <Link
                      href={`${footer?.social_twitter || globalSetting?.footer_social?.twitter}`}
                      aria-label="Social Link"
                      rel="noreferrer"
                      target="_blank"
                      className="block text-center mx-auto text-muted-foreground hover:text-white"
                    >
                      <XIcon size={34} round />
                    </Link>
                  </li>
                )}
                {(footer?.social_pinterest || globalSetting?.footer_social?.pinterest) && (
                  <li className="flex items-center mr-3 transition ease-in-out duration-500">
                    <Link
                      href={`${footer?.social_pinterest || globalSetting?.footer_social?.pinterest}`}
                      aria-label="Social Link"
                      rel="noreferrer"
                      target="_blank"
                      className="block text-center mx-auto text-muted-foreground hover:text-white"
                    >
                      <PinterestIcon size={34} round />
                    </Link>
                  </li>
                )}
                {footer?.social_linkedin && (
                  <li className="flex items-center  mr-3 transition ease-in-out duration-500">
                    <Link
                      href={`${footer?.social_linkedin}`}
                      aria-label="Social Link"
                      rel="noreferrer"
                      target="_blank"
                      className="block text-center mx-auto text-muted-foreground hover:text-white"
                    >
                      <LinkedinIcon size={34} round />
                    </Link>
                  </li>
                )}
                {footer?.social_whatsapp && (
                  <li className="flex items-center  mr-3 transition ease-in-out duration-500">
                    <Link
                      href={`${footer?.social_whatsapp}`}
                      aria-label="Social Link"
                      rel="noreferrer"
                      target="_blank"
                      className="block text-center mx-auto text-muted-foreground hover:text-white"
                    >
                      <WhatsappIcon size={34} round />
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Footer;
