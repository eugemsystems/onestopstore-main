import { getWalletAction } from "@lib/actions/account-extras.actions";
import WalletView from "./WalletView";

export const metadata = {
  title: "My Wallet",
  description: "View your wallet balance and transaction history.",
};

const WalletPage = async ({ searchParams }) => {
  const { page } = await searchParams;
  const { data, error } = await getWalletAction(Number(page || 1));

  return (
    <div className="overflow-hidden">
      <WalletView data={data} error={error} />
    </div>
  );
};

export default WalletPage;
