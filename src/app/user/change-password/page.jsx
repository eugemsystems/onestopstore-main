//internal imports

import ChangePassword from "./ChangePassword";
import { getCustomizationSettings } from "@lib/actions/settings.actions";

// Force dynamic rendering - don't cache this page
export const dynamic = "force-dynamic";

const ChangePasswordRoot = async () => {
  const { storeCustomizationSetting } = await getCustomizationSettings();

  return (
    <>
      <ChangePassword storeCustomizationSetting={storeCustomizationSetting} />
    </>
  );
};

export default ChangePasswordRoot;
