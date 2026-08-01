import PageHeader from "@components/header/PageHeader";
import PolicyPageLayout from "@components/policy/PolicyPageLayout";

export const metadata = {
  title: "Shipping Policy",
  description: "Learn about our shipping policy, delivery times, and costs.",
  keywords: ["shipping policy", "delivery", "shipping"],
};

const SHIPPING_POLICY_HTML = `
  <p>Delivery will be concluded between 3&ndash;7 working days from Monday to Friday (excluding public holidays), subject to payment and order confirmation before 12h00. Depending on origin and destination, a further delay of up to 24 hours may be experienced on shipments to outlying areas. Additional shipping costs may arise if you are more than 15km from the nearest collection point.</p>

  <h3>What Will The Delivery Cost?</h3>
  <p>Orders above $100 are eligible for free shipping. Orders below $100 attract a shipping fee of $10.</p>

  <h3>When Will Delivery Take Place?</h3>
  <ol>
    <li>Delivery service will commence upon payment confirmation being received.</li>
    <li>Deliveries will generally be made within the time frame of the selected delivery type after collection from the point of dispatch, and between major centres from Monday to Friday.</li>
    <li>We deliver from Monday to Friday, from 08h00 to 17h00, to both business and residential addresses.</li>
    <li>No deliveries will be made on weekends or public holidays.</li>
  </ol>

  <h3>What If I Miss My Delivery?</h3>
  <p>We will notify you of a failed delivery, i.e. when no one can be reached at the specified delivery address to receive and sign for the goods at the scheduled time. We will reschedule the delivery as soon as possible.</p>

  <h3>What If My Items Are Damaged, Faulty Or Incorrectly Delivered?</h3>
  <p>In the regrettable event that you receive a damaged product, please notify us within 24 hours of receipt of delivery at <a href="mailto:support@onestopstore.co.zw">support@onestopstore.co.zw</a>. We will do our utmost to have the damaged product collected and a new product delivered to you within 3 business days.</p>

  <h3>What If I Receive The Incorrect Items Or Quantity Of Products?</h3>
  <p>Should the incorrect items or quantity of items be delivered to you, please notify us immediately at <a href="mailto:support@onestopstore.co.zw">support@onestopstore.co.zw</a> so that we can rectify the situation. Our team will collect the incorrect items and replace them as soon as possible.</p>

  <h3>Returns &amp; Refunds Process</h3>
  <p>We offer a full returns and exchanges policy &mdash; see our <a href="/return-policy">Return Policy</a> for details. You may return or exchange goods subject to producing the original receipt and ensuring the product is in its original packaging and condition. Should the product not be in its original packaging, a handling fee of up to 20% of the product&rsquo;s value may be charged, as permitted under the Consumer Protection Act.</p>
  <p>Refunds can take up to 10 days to reflect in your bank account. Should you not receive your refund within 10 days, please contact us at <a href="mailto:support@onestopstore.co.zw">support@onestopstore.co.zw</a>.</p>
`;

const ShippingPolicy = async () => {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={{ en: "Shipping Policy" }} />
      <PolicyPageLayout>
        <div dangerouslySetInnerHTML={{ __html: SHIPPING_POLICY_HTML }} />
      </PolicyPageLayout>
    </div>
  );
};

export default ShippingPolicy;
