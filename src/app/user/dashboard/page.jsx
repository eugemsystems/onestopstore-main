import { Suspense } from "react";
import Link from "next/link";
import { FiCheck, FiRefreshCw, FiShoppingCart, FiTruck, FiCreditCard, FiGift } from "react-icons/fi";

// Server Actions from lib
import { getCustomerOrders } from "@lib/actions/order.actions";
import { getCustomizationSettings } from "@lib/actions/settings.actions";
import { isAuthenticated } from "@lib/actions/auth.actions";
import { getPointsAction, getWalletAction } from "@lib/actions/account-extras.actions";

// Components
import Card from "@components/order-card/Card";
import RecentOrder from "@components/order/RecentOrder";
import { showingTranslateValue } from "@lib/translate";

export const metadata = {
  title: "Dashboard",
  description: "View your order history and account overview.",
};

// Force dynamic rendering - don't cache this page
export const dynamic = "force-dynamic";

const Dashboard = async ({ searchParams }) => {
  // Verify authentication
  const authenticated = await isAuthenticated();

  const { page } = await searchParams;
  const currentPage = Number(page || 1);

  // Fetch data in parallel
  const [
    { storeCustomizationSetting },
    { data, error },
    { data: walletData },
    { data: pointsData },
  ] = await Promise.all([
    getCustomizationSettings(),
    authenticated
      ? getCustomerOrders({ page: currentPage, limit: 10 })
      : { data: null, error: "Not authenticated" },
    authenticated ? getWalletAction() : { data: null },
    authenticated ? getPointsAction() : { data: null },
  ]);

  const dashboard = storeCustomizationSetting?.dashboard;
  const walletBalance =
    Number(walletData?.balance ?? 0) + Number(walletData?.non_cashable_balance ?? 0);
  const pointsBalance = Number(pointsData?.balance ?? 0);

  return (
    <>
      <div className="overflow-hidden border-0">
        <h2 className="text-xl font-semibold mb-5">
          {showingTranslateValue(dashboard?.dashboard_title)}
        </h2>
        <div className="grid gap-4 mb-8 md:grid-cols-2 xl:grid-cols-4">
          <Card
            title={showingTranslateValue(dashboard?.total_order)}
            Icon={FiShoppingCart}
            quantity={data?.totalDoc}
            className="text-red-600  bg-red-200"
          />
          <Card
            title={showingTranslateValue(dashboard?.pending_order)}
            Icon={FiRefreshCw}
            quantity={data?.pending}
            className="text-orange-600 bg-orange-200"
          />
          <Card
            title={showingTranslateValue(dashboard?.processing_order)}
            Icon={FiTruck}
            quantity={data?.processing}
            className="text-indigo-600 bg-indigo-200"
          />
          <Card
            title={showingTranslateValue(dashboard?.complete_order)}
            Icon={FiCheck}
            quantity={data?.delivered}
            className="text-primary bg-accent"
          />
        </div>
        {authenticated && (
          <div className="grid gap-4 mb-8 md:grid-cols-2">
            <Link href="/user/wallet">
              <Card
                title="Wallet Balance"
                Icon={FiCreditCard}
                quantity={`$${walletBalance.toFixed(2)}`}
                className="text-emerald-600 bg-emerald-100"
              />
            </Link>
            <Link href="/user/points">
              <Card
                title="Reward Points"
                Icon={FiGift}
                quantity={pointsBalance}
                className="text-purple-600 bg-purple-100"
              />
            </Link>
          </div>
        )}
        <RecentOrder
          data={data}
          error={error}
          title={dashboard?.recent_order}
        />
      </div>
    </>
  );
};

export default Dashboard;
