import { getLaybysAction } from "@lib/actions/account-extras.actions";
import LaybysList from "./LaybysList";

export const metadata = {
  title: "My Laybys",
  description: "Track your layby applications and payments.",
};

const LaybysPage = async ({ searchParams }) => {
  const { page } = await searchParams;
  const { data, error } = await getLaybysAction(Number(page || 1));

  return (
    <div className="overflow-hidden">
      <LaybysList data={data} error={error} />
    </div>
  );
};

export default LaybysPage;
