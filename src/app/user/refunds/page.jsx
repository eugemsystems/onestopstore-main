import { getRefundsAction } from "@lib/actions/account-extras.actions";
import RefundsList from "./RefundsList";

export const metadata = {
  title: "My Refunds",
  description: "Track your refund requests.",
};

const RefundsPage = async ({ searchParams }) => {
  const { page } = await searchParams;
  const { data, error } = await getRefundsAction(Number(page || 1));

  return (
    <div className="overflow-hidden">
      <RefundsList data={data} error={error} />
    </div>
  );
};

export default RefundsPage;
