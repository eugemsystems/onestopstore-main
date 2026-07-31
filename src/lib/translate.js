"use server";
import { cookies } from "next/headers";

const showingTranslateValue = async (data) => {
  const cookieStore = await cookies(); // `cookies()` itself is a sync call, returns cookies store
  const lang = cookieStore.get("_lang")?.value || "en";

  // console.log("data", data);

  const updatedData =
    data !== undefined && Object?.keys(data).includes(lang)
      ? data[lang]
      : data?.en;
  //   console.log("updatedData", updatedData);
  return updatedData;
};

export { showingTranslateValue };
