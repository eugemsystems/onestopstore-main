import { loadStripe } from "@stripe/stripe-js";
import { getStoreSetting } from "@services/SettingServices";

let stripePromise;

const getStripe = async () => {
  const storeSetting = await getStoreSetting();
  // console.log("res", storeSetting);
  if (!stripePromise) {
    // stripePromise = loadStripe(`${process.env.NEXT_PUBLIC_STRIPE_KEY}` || null);
    stripePromise = loadStripe(
      storeSetting?.stripe_key || process.env.NEXT_PUBLIC_STRIPE_KEY
    );
  }

  return stripePromise;
};

export default getStripe;
