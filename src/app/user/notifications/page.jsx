import { getCustomerNotifications } from "@lib/actions/notification.actions";
import NotificationsList from "./NotificationsList";

export const metadata = {
  title: "Notifications",
  description: "View your order notifications and delivery updates.",
};

const NotificationsPage = async ({ searchParams }) => {
  const { page } = await searchParams;
  const { data, error } = await getCustomerNotifications({
    page: Number(page || 1),
    limit: 20,
  });

  return (
    <div className="overflow-hidden">
      <NotificationsList data={data} error={error} />
    </div>
  );
};

export default NotificationsPage;
