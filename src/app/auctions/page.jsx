import { getAuctionsAction } from "@lib/actions/auction.actions";
import AuctionCard from "@components/auction/AuctionCard";

export const metadata = {
  title: "Auctions",
  description: "Bid on discounted, refurbished and clearance items.",
};

const AuctionsPage = async () => {
  const { auctions } = await getAuctionsAction();

  return (
    <div className="mx-auto max-w-screen-2xl px-3 py-10 sm:px-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Auctions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bid on discounted, refurbished and clearance items.
        </p>
      </div>

      {auctions?.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {auctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
          <span className="text-4xl">🔨</span>
          <p className="text-sm text-muted-foreground">
            No live auctions right now — check back soon!
          </p>
        </div>
      )}
    </div>
  );
};

export default AuctionsPage;
