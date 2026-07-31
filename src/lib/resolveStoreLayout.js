import { cookies } from "next/headers";
import {
  isLocalStorePreview,
  STORE_LAYOUT_COOKIE,
} from "@utils/localStorePreview";

/**
 * Resolve store layout.
 * - Production: always from admin globalSetting.store_layout
 * - Development: cookie / query param can override for local preview
 */
export async function resolveStoreLayout(
  globalSetting,
  searchParams,
  { allowQuery = true } = {},
) {
  const apiLayout = globalSetting?.store_layout || "default";

  if (!isLocalStorePreview) {
    return apiLayout;
  }

  const cookieStore = await cookies();
  const cookieLayout = cookieStore.get(STORE_LAYOUT_COOKIE)?.value;
  const queryLayout = allowQuery ? searchParams?.layout : undefined;

  return cookieLayout || queryLayout || apiLayout;
}
