import { getTicketsAction } from "@lib/actions/account-extras.actions";
import TicketsList from "./TicketsList";

export const metadata = {
  title: "Support Tickets",
  description: "View and create support tickets.",
};

const TicketsPage = async ({ searchParams }) => {
  const { page } = await searchParams;
  const { data, error } = await getTicketsAction(Number(page || 1));

  return (
    <div className="overflow-hidden">
      <TicketsList data={data} error={error} />
    </div>
  );
};

export default TicketsPage;
