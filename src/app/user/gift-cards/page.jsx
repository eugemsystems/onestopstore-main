import { getVouchersAction } from "@lib/actions/account-extras.actions";
import GiftCardsView from "./GiftCardsView";

export const metadata = {
  title: "My Gift Cards",
  description: "View and redeem your gift cards.",
};

const GiftCardsPage = async () => {
  const { data, error } = await getVouchersAction();
  const vouchers = data?.data?.vouchers || [];

  return (
    <div className="overflow-hidden">
      <GiftCardsView vouchers={vouchers} error={error} />
    </div>
  );
};

export default GiftCardsPage;
