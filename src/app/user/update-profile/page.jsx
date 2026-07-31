//internal import
import UpdateProfile from "./UpdateProfile";
import { getCustomizationSettings } from "@lib/actions/settings.actions";

// Force dynamic rendering - don't cache this page
export const dynamic = "force-dynamic";

const UpdateProfileRoot = async () => {
  const { storeCustomizationSetting } = await getCustomizationSettings();

  return (
    <>
      <UpdateProfile storeCustomizationSetting={storeCustomizationSetting} />
    </>
  );
};

export default UpdateProfileRoot;
