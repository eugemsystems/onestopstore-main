import { getMyBidsAction, getMyWinsAction } from "@lib/actions/auction.actions";
import AuctionsAccountView from "./AuctionsAccountView";

export const metadata = {
  title: "My Auctions",
  description: "Track the auctions you've bid on and won.",
};

const MyAuctionsPage = async () => {
  const [{ bids }, { wins, isBanned, banReason }] = await Promise.all([
    getMyBidsAction(),
    getMyWinsAction(),
  ]);

  return (
    <AuctionsAccountView bids={bids} wins={wins} isBanned={isBanned} banReason={banReason} />
  );
};

export default MyAuctionsPage;
