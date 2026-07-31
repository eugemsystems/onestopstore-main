import { notFound } from "next/navigation";
import { getAuctionByIdAction } from "@lib/actions/auction.actions";
import { getStoreSettings } from "@lib/actions/settings.actions";
import AuctionDetailView from "./_components/AuctionDetailView";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { auction } = await getAuctionByIdAction(id);
  return {
    title: auction?.title ? `${auction.title} - Auction` : "Auction",
    description: "Bid on discounted, refurbished and clearance items.",
  };
}

const AuctionDetailPage = async ({ params }) => {
  const { id } = await params;
  const [{ auction, error }, { storeSetting }] = await Promise.all([
    getAuctionByIdAction(id),
    getStoreSettings(),
  ]);

  if (error || !auction?.id) {
    notFound();
  }

  // Auction payments: exclude offline/COD-style methods, same restriction
  // the legacy frontend's DepositModal applies.
  const paymentMethods = (storeSetting?.payment_methods || []).filter((m) => {
    const k = String(m?.name || "").toLowerCase().replace(/[\s_-]/g, "");
    return (
      !k.includes("yoco") &&
      !k.includes("yoko") &&
      !k.includes("banktransfer") &&
      !k.includes("cod") &&
      !k.includes("cashondelivery")
    );
  });

  return <AuctionDetailView auction={auction} paymentMethods={paymentMethods} />;
};

export default AuctionDetailPage;
