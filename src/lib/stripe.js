import { loadStripe } from "@stripe/stripe-js";

let stripePromise = null;
const getStripe = (stripeKey) => {
  if (!stripePromise && stripeKey) {
    stripePromise = loadStripe(stripeKey);
  }
  return stripePromise;
};

export default getStripe;
