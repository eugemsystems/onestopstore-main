import { getPointsAction } from "@lib/actions/account-extras.actions";
import PointsList from "./PointsList";

export const metadata = {
  title: "Reward Points",
  description: "View your reward points balance and history.",
};

const PointsPage = async ({ searchParams }) => {
  const { page } = await searchParams;
  const { data, error } = await getPointsAction(Number(page || 1));

  return (
    <div className="overflow-hidden">
      <PointsList data={data} error={error} />
    </div>
  );
};

export default PointsPage;
