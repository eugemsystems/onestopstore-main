import { getTicketAction } from "@lib/actions/account-extras.actions";
import TicketDetailView from "./TicketDetailView";

export const metadata = {
  title: "Support Ticket",
};

const TicketDetailPage = async ({ params }) => {
  const { id } = await params;
  const { data, error } = await getTicketAction(id);

  return (
    <div className="overflow-hidden">
      <TicketDetailView ticket={data?.ticket} error={error} />
    </div>
  );
};

export default TicketDetailPage;
