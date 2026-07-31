import { getGlobalSettings } from "@lib/actions/settings.actions";

export default async function manifest() {
  const { globalSetting } = await getGlobalSettings();

  const shopName = globalSetting?.shop_name || "Online Store";
  const siteDescription =
    globalSetting?.site_description || `${shopName} - E-commerce Store`;

  return {
    theme_color: "#CD0F0F",
    background_color: "#ffffff",
    display: "standalone",
    orientation: "portrait",
    scope: "/",
    start_url: "/",
    id: "/",
    short_name: shopName,
    name: siteDescription,
    description: siteDescription,
    icons: [
      {
        src: globalSetting?.favicon || "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-256x256.png",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: "/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
