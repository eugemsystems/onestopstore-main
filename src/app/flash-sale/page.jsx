import { getAllCampaigns } from "@lib/actions/campaign.actions";
import { getAttributes } from "@lib/actions/attribute.actions";
import { getCustomizationSettings } from "@lib/actions/settings.actions";
import FlashSaleContent from "@components/campaign/FlashSaleContent";
import FlashSaleHero from "@components/campaign/FlashSaleHero";

export const metadata = {
  title: "Flash Sale - Best Deals & Offers",
  description:
    "Discover amazing flash sale deals with limited-time offers and huge discounts. Shop now before they're gone!",
  keywords: [
    "flash sale",
    "deals",
    "discounts",
    "limited time offers",
    "campaigns",
  ],
};

const FlashSale = async () => {
  const [{ campaigns }, { attributes }, { storeCustomizationSetting }] =
    await Promise.all([
      getAllCampaigns(),
      getAttributes(),
      getCustomizationSettings(),
    ]);

  // Compute stats from server data to pass to client hero component
  const now = new Date();
  const activeCampaigns =
    campaigns?.filter((c) => {
      const start = new Date(c.startTime);
      const end = new Date(c.endTime);
      return now >= start && now <= end;
    }) || [];

  const totalProducts =
    campaigns?.reduce((sum, c) => sum + (c.products?.length || 0), 0) || 0;

  const totalSold =
    campaigns?.reduce(
      (sum, c) =>
        sum +
        (c.products?.reduce((ps, p) => ps + (p.product?.sold || 0), 0) || 0),
      0,
    ) || 0;

  return (
    <div className="bg-background min-h-screen">
      <FlashSaleHero
        headerBg={storeCustomizationSetting?.offers?.header_bg}
        totalProducts={totalProducts}
        activeCampaignCount={activeCampaigns.length}
        totalSold={totalSold}
      />

      <div className="relative z-10 -mt-4 sm:-mt-6 mx-auto max-w-screen-2xl px-3 sm:px-10 py-6 sm:py-10 lg:py-16">
        {campaigns && campaigns.length > 0 ? (
          <FlashSaleContent campaigns={campaigns} attributes={attributes} />
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              No Active Campaigns
            </h2>
            <p className="text-muted-foreground">
              Check back later for amazing deals and offers!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashSale;
