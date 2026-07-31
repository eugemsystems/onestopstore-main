import React from "react";
import Image from "next/image";

//internal import
import { showingTranslateValue } from "@lib/translate";
import PageHeader from "@components/header/PageHeader";
import CMSkeletonTwo from "@components/preloader/CMSkeleton";
import { getCustomizationSettings } from "@lib/actions/settings.actions";

export const metadata = {
  title: "About Us",
  description:
    "Learn more about our story, mission, and the team behind our store.",
  keywords: ["about", "our story", "team", "mission"],
};

const AboutUs = async ({}) => {
  const { storeCustomizationSetting, error } = await getCustomizationSettings();
  const about_us = storeCustomizationSetting?.about_us;
  // console.log("about_us", about_us);

  return (
    <div className="bg-background">
      <PageHeader headerBg={about_us?.header_bg} title={about_us?.title} />

      <div className="bg-background text-foreground">
        <div className="max-w-screen-2xl mx-auto lg:py-20 py-10 px-4 sm:px-10">
          <div className="grid grid-flow-row lg:grid-cols-2 gap-4 lg:gap-16 items-center">
            <div className="">
              <h3 className="text-xl lg:text-3xl mb-2 font-semibold text-foreground">
                {/* {t("common:about-section-title")} */}

                <CMSkeletonTwo
                  count={1}
                  height={50}
                  error={error}
                  loading={false}
                  data={about_us?.top_title}
                />
              </h3>
              <div className="mt-3 text-base text-muted-foreground leading-7">
                <p>
                  <CMSkeletonTwo
                    count={5}
                    height={20}
                    error={error}
                    loading={false}
                    data={about_us?.top_description}
                  />
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6 lg:grid-cols-2 xl:gap-6 mt-8">
                <div className="p-8 bg-primary/5 dark:bg-primary/10 border border-primary/10 shadow-sm rounded-xl">
                  {error ? (
                    <CMSkeletonTwo
                      count={8}
                      height={20}
                      error={error}
                      loading={false}
                    />
                  ) : (
                    <>
                      <span className="text-3xl block font-extrabold mb-4 text-primary">
                        {showingTranslateValue(about_us?.card_two_title)}
                      </span>
                      <h4 className="text-lg font-bold mb-1 text-foreground">
                        {showingTranslateValue(about_us?.card_two_sub)}
                      </h4>
                      <p className="mb-0 text-muted-foreground leading-7">
                        {showingTranslateValue(
                          storeCustomizationSetting?.about_us
                            ?.card_two_description,
                        )}
                      </p>
                    </>
                  )}
                </div>
                <div className="p-8 bg-indigo-50 shadow-sm rounded-lg">
                  {error ? (
                    <CMSkeletonTwo
                      count={8}
                      height={20}
                      error={error}
                      loading={false}
                    />
                  ) : (
                    <>
                      <span className="text-3xl block font-extrabold mb-4 text-primary">
                        {showingTranslateValue(about_us?.card_one_title)}
                      </span>
                      <h4 className="text-lg font-bold mb-1 text-foreground">
                        {showingTranslateValue(about_us?.card_one_sub)}
                      </h4>
                      <p className="mb-0 text-muted-foreground leading-7">
                        {showingTranslateValue(
                          storeCustomizationSetting?.about_us
                            ?.card_one_description,
                        )}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <Image
                width={920}
                height={750}
                src={about_us?.content_right_img || "/about-us.jpg"}
                alt="logo"
              />
            </div>
          </div>
          <div className="mt-10 lg:mt-16 text-base text-muted-foreground leading-7">
            <p>
              <CMSkeletonTwo
                count={5}
                height={20}
                error={error}
                loading={false}
                data={about_us?.middle_description_one}
              />
            </p>

            <p>
              <CMSkeletonTwo
                count={8}
                height={20}
                error={error}
                loading={false}
                data={about_us?.middle_description_two}
              />
            </p>
          </div>
          <div className="mt-10 lg:mt-12 flex flex-col sm:grid gap-4">
            <Image
              width={1920}
              height={570}
              src={about_us?.content_middle_Img || "/about-banner.jpg"}
              alt="logo"
              className="block rounded-lg"
            />
          </div>
        </div>
        <div className="bg-muted/50 dark:bg-muted/30 lg:py-20 py-10 border-t border-border/50">
          <div className="max-w-screen-2xl mx-auto px-3 sm:px-10">
            <div className="relative flex flex-col sm:flex-row sm:items-end justify-between mb-8">
              <div className="max-w-2xl">
                <h3 className="text-xl lg:text-3xl mb-2 font-semibold">
                  <CMSkeletonTwo
                    count={1}
                    height={50}
                    error={error}
                    loading={false}
                    data={about_us?.founder_title}
                  />
                </h3>
                <p className="mt-2 md:mt-3 font-normal block text-base">
                  <CMSkeletonTwo
                    count={3}
                    height={20}
                    error={error}
                    loading={false}
                    data={about_us?.founder_description}
                  />
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-6 xl:gap-x-8">
              <div className="max-w-sm">
                <Image
                  width={420}
                  height={420}
                  src={about_us?.founder_one_img || "/team/team-1.jpg"}
                  alt="team-1"
                  className="block rounded-lg"
                />
                <div className="py-4">
                  <h5 className="text-lg font-semibold ">
                    {showingTranslateValue(about_us?.founder_one_name)}
                  </h5>
                  <span className="opacity-75 text-sm">
                    {showingTranslateValue(about_us?.founder_one_sub)}
                  </span>
                </div>
              </div>
              <div className="max-w-sm">
                <Image
                  width={420}
                  height={420}
                  src={about_us?.founder_two_img || "/team/team-2.jpg"}
                  alt="team-2"
                  className="block rounded-lg"
                />
                <div className="py-4">
                  <h5 className="text-lg font-semibold ">
                    {showingTranslateValue(about_us?.founder_two_name)}
                  </h5>
                  <span className="opacity-75 text-sm">
                    {showingTranslateValue(about_us?.founder_two_sub)}
                  </span>
                </div>
              </div>
              <div className="max-w-sm">
                <Image
                  width={420}
                  height={420}
                  src={about_us?.founder_three_img || "/team/team-3.jpg"}
                  alt="team-3"
                  className="block rounded-lg"
                />
                <div className="py-4">
                  <h5 className="text-lg font-semibold ">
                    {showingTranslateValue(about_us?.founder_three_name)}
                  </h5>
                  <span className="opacity-75 text-sm">
                    {showingTranslateValue(about_us?.founder_three_sub)}
                  </span>
                </div>
              </div>
              <div className="max-w-sm">
                <Image
                  width={420}
                  height={420}
                  src={about_us?.founder_four_img || "/team/team-4.jpg"}
                  alt="team-4"
                  className="block rounded-lg"
                />
                <div className="py-4">
                  <h5 className="text-lg font-semibold ">
                    {showingTranslateValue(about_us?.founder_four_name)}
                  </h5>
                  <span className="opacity-75 text-sm">
                    {showingTranslateValue(about_us?.founder_four_sub)}
                  </span>
                </div>
              </div>
              <div className="max-w-sm">
                <Image
                  width={420}
                  height={420}
                  src={about_us?.founder_five_img || "/team/team-5.jpg"}
                  alt="team-5"
                  className="block rounded-lg"
                />
                <div className="py-4">
                  <h5 className="text-lg font-semibold ">
                    {showingTranslateValue(about_us?.founder_five_name)}
                  </h5>
                  <span className="opacity-75 text-sm">
                    {showingTranslateValue(about_us?.founder_five_sub)}
                  </span>
                </div>
              </div>
              <div className="max-w-sm">
                <Image
                  width={420}
                  height={420}
                  src={about_us?.founder_six_img || "/team/team-6.jpg"}
                  alt="team-6"
                  className="block rounded-lg"
                />
                <div className="py-4">
                  <h5 className="text-lg font-semibold">
                    {showingTranslateValue(about_us?.founder_six_name)}
                  </h5>
                  <span className="opacity-75 text-sm">
                    {showingTranslateValue(about_us?.founder_six_sub)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
