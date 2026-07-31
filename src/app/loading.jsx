import HomeSkeleton from "@components/preloader/HomeSkeleton";
import { getGlobalSettings } from "@lib/actions/settings.actions";
import { resolveStoreLayout } from "@lib/resolveStoreLayout";

export default async function Loading() {
  let layout = "default";
  try {
    const { globalSetting } = await getGlobalSettings();
    layout = await resolveStoreLayout(globalSetting);
  } catch {
    // keep default layout
  }

  return <HomeSkeleton layout={layout} />;
}
