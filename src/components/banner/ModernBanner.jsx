import { showingTranslateValue } from "@lib/translate";
import AuthAwareLink from "@components/common/AuthAwareLink";

const DEFAULT_CARDS = [
  {
    title: "ENJOY 10% OFF YOUR FIRST ORDER",
    description:
      "Sign up today and get instant savings on your first grocery purchase.",
    image:
      "https://i.ibb.co.com/dsqXkPxK/Gemini-Generated-Image-s5sx55s5sx55s5sx-2.png",
    link: "/auth/signup",
    bg: "#dcfce7",
  },
  {
    title: "FREE DELIVERY ON ORDERS OVER $50",
    description:
      "Stock up on your weekly groceries and save more with zero delivery charges.",
    image:
      "https://i.ibb.co.com/dsqXkPxK/Gemini-Generated-Image-s5sx55s5sx55s5sx-2.png",
    link: "/search",
    bg: "#ffe4e6",
  },
  {
    title: "FRESH GROCERIES FOR YOUR FAMILY.",
    description: "We deliver everything you need straight to your door.",
    image:
      "https://i.ibb.co.com/dsqXkPxK/Gemini-Generated-Image-s5sx55s5sx55s5sx-2.png",
    link: "/search",
    bg: "#fef9c3",
  },
];

const ModernBanner = async ({ storeCustomizationSetting }) => {
  const home = storeCustomizationSetting?.home;

  if (home?.modern_promo_status === false) return null;

  const cards = [
    {
      title: await showingTranslateValue(home?.modern_promo_card_one_title),
      description: await showingTranslateValue(
        home?.modern_promo_card_one_description,
      ),
      image: home?.modern_promo_card_one_image,
      link: home?.modern_promo_card_one_link,
      bg: home?.modern_promo_card_one_bg,
    },
    {
      title: await showingTranslateValue(home?.modern_promo_card_two_title),
      description: await showingTranslateValue(
        home?.modern_promo_card_two_description,
      ),
      image: home?.modern_promo_card_two_image,
      link: home?.modern_promo_card_two_link,
      bg: home?.modern_promo_card_two_bg,
    },
    {
      title: await showingTranslateValue(home?.modern_promo_card_three_title),
      description: await showingTranslateValue(
        home?.modern_promo_card_three_description,
      ),
      image: home?.modern_promo_card_three_image,
      link: home?.modern_promo_card_three_link,
      bg: home?.modern_promo_card_three_bg,
    },
  ].map((card, index) => ({
    title: card.title || DEFAULT_CARDS[index].title,
    description: card.description || DEFAULT_CARDS[index].description,
    image: card.image || DEFAULT_CARDS[index].image,
    link: card.link || DEFAULT_CARDS[index].link,
    bg: card.bg || DEFAULT_CARDS[index].bg,
  }));

  return (
    <div className="bg-background pt-0 pb-10">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className="group relative flex flex-col justify-between w-full rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 p-5 lg:p-6 border border-border/30 min-h-[260px]"
              style={{
                background: `linear-gradient(to bottom, ${card.bg}, var(--background, #ffffff))`,
              }}
            >
              <div className="flex flex-col items-center text-center z-10 w-full mb-4">
                <h3 className="text-base lg:text-md font-bold text-gray-800 dark:text-gray-100 leading-tight mb-2 uppercase tracking-wide">
                  {card.title}
                </h3>

                {card.image && (
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-auto transition-transform duration-500 rounded-lg group-hover:scale-104 my-2"
                  />
                )}
              </div>

              <div className="flex items-end justify-between w-full z-10">
                <p className="text-gray-600 dark:text-gray-300 font-medium text-xs sm:text-sm max-w-[70%]">
                  {card.description}
                </p>
                <AuthAwareLink
                  href={card.link || "/search"}
                  className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center transition-colors shrink-0 flex-none shadow-lg cursor-pointer pointer-events-auto"
                  style={{ backgroundColor: "#111827" }}
                >
                  <svg
                    className="w-4 h-4 text-white ml-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </AuthAwareLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModernBanner;
