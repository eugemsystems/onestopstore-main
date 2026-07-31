import PageHeader from "@components/header/PageHeader";

export const metadata = {
  title: "Return Policy",
  description: "Learn about our return policy and how to request a return.",
  keywords: ["return policy", "returns", "refunds"],
};

const RETURN_POLICY_HTML = `
  <p>Goods may only be returned in terms of the Consumer Protection Act, Act 68 of 2008 (&ldquo;the CPA&rdquo;). If you are entitled in law to return goods, then in line with the CPA, a handling fee of up to 20% of the value of the goods may be charged when the product/packaging is not returned in its original purchase condition.</p>

  <h4>1. Non-Returnable / Non-Refundable Items</h4>
  <ol>
    <li>A product which has been personalised for you or made to your specifications.</li>
    <li>Any flat-pack furniture assembled after delivery cannot be returned and will be inspected first in the event of a potential manufacturing fault.</li>
    <li>Due to copyright law, licensed software and games cannot be returned or refunded.</li>
    <li>Pre-paid cards, digital or physical vouchers may not be returned for a refund or credit.</li>
    <li>Nursing or maternity and infant feeding products, including (but not limited to) breast pumps, bottles, teats, soothers, pacifiers, formula, maternity underwear, nappies and wipes.</li>
    <li>Delivery and/or installation costs.</li>
    <li>Any damaged or abused items.</li>
    <li>Intimate products, lingerie, swimwear, bodysuits or underwear.</li>
    <li>Piercing jewellery.</li>
    <li>Toiletries, personal beauty products or fragrances.</li>
    <li>Foodstuff, beverages or other products intended for consumption.</li>
    <li>Other specified non-returnable/non-refundable items.</li>
  </ol>

  <p>Under no circumstances will we accept returned goods where the consumer has been allowed to inspect the goods before collection and subsequently changed their mind about the goods; they have damaged the goods through negligence; or the goods have been disassembled, permanently installed, physically altered, used or installed contrary to our own or the manufacturer&rsquo;s instructions, and/or have been subjected to misuse or abuse.</p>

  <p>We sell goods for domestic use only and for the purpose for which we manufactured or sourced them. This excludes normal wear and tear. If you want to return alleged defective goods in terms of a warranty, we or the manufacturer will assess the goods to determine the reason for the defect.</p>

  <h4>2. Your Rights Under The CPA</h4>
  <p>Subject to these terms, all goods carry an implied warranty in terms of the Consumer Protection Act 68 of 2008 (&ldquo;CPA&rdquo;), which gives the consumer the right to return defective goods in terms of section 20, read together with section 56 of the CPA. Our goods also carry a manufacturer&rsquo;s warranty where applicable, which runs concurrently with any warranty in terms of the law. The implied warranty on goods supplied places an obligation on One Stop Store to accept the return of unsafe or defective goods within six months of delivery. In the event of the goods not complying with requirements and standards contemplated in section 55 of the CPA, the consumer has the right to return goods to One Stop Store if:</p>
  <ol>
    <li>the consumer finds within 5 days that the goods are unsuitable for a particular purpose for which the consumer has expressed an intention to use the goods, as contemplated in s55(3);</li>
    <li>the consumer did not examine the goods and rejected delivery of the goods for any reasons contemplated in section 19(5); or</li>
    <li>the consumer has refused delivery of those goods because they were mixed with items that were not ordered, as contemplated in section 19(8).</li>
  </ol>

  <p>You are entitled to cancel any sale concluded on this website (online sales) within 5 days after receipt of the goods and to get a refund. You may also cancel a sale where delivery is delayed beyond the stipulated delivery date/timeframe (or where none is specified, beyond 30 days from the order date).</p>

  <p>In the unfortunate event that your purchased goods become defective, you may opt to take them to any One Stop Store location or contact support to arrange a return. You are entitled to the following options, as per the CPA, once the goods have been inspected and assessed:</p>
  <ol>
    <li>have such goods repaired;</li>
    <li>have the goods replaced; or</li>
    <li>be refunded the price paid.</li>
  </ol>

  <p>If we find the goods not to be faulty, you will be liable for all handling and shipping charges for the collection and re-delivery of the product to you, and for any damage or fault caused by misuse, abuse or negligence.</p>

  <h4>3. Warranty Exclusions</h4>
  <p>The warranty does not cover any defects caused by foreign objects, connection errors, or circumstances that are not part of the appliance itself, including but not limited to:</p>
  <ol>
    <li>use other than domestic use by the customer or their immediate resident family at the declared delivery address;</li>
    <li>failure by the customer or any other person to comply with the manufacturer&rsquo;s instructions for installation, maintenance or use;</li>
    <li>the use of accessories which have not been approved by the manufacturer;</li>
    <li>the application and/or use of any incorrect or abnormal electrical or water supply to the appliance;</li>
    <li>any defect in wiring, electrical connections or plumbing which does not form part of the appliance at the time of the original purchase;</li>
    <li>the presence in the appliance of objects it is not intended to cope with, such as hairpins, coins and buttons in washing machines, hot food in fridges, and chewing gum or wax crayons in tumble dryers;</li>
    <li>neglect, misuse, or wilful abuse of the appliance;</li>
    <li>cosmetic issues that do not, in One Stop Store&rsquo;s sole opinion, prevent the appliance from working adequately, including discolouring, paint peeling, or cracked/broken handles, plates, hinges, wheels, panels, shelves or glass parts;</li>
    <li>rust or the effects of rust;</li>
    <li>repairs or attempted repairs by any person other than One Stop Store or its authorised repairers;</li>
    <li>any modification of the appliance by any person other than One Stop Store or its authorised repairers;</li>
    <li>parts or items expected to wear out before the extended warranty period expires, including batteries, filters, disposable bags, rubber or plastic hose pipes, drive or fan belts, fuses and/or light bulbs, cartridges, toners or ribbons;</li>
    <li>fire, flood, war, civil disturbance, industrial action, acts of God or any other cause beyond the reasonable control of One Stop Store;</li>
    <li>any defect arising out of the design of the appliance;</li>
    <li>any defect caused by a lightning strike or power surge;</li>
    <li>blown or damaged speakers arising from misuse;</li>
    <li>any damage caused by the use of generic or refilled cartridges; or</li>
    <li>loss, destruction or damage caused by ionizing radiation, contamination by radioactivity, or nuclear weapons material.</li>
  </ol>

  <p>For cameras, the warranty does not apply to accessories, batteries, chargers, attachable lenses or other additions which do not make up the main body of the camera. For TVs, Hi-Fi&rsquo;s, VCRs or DVD players, remote controls are not covered.</p>

  <h4>4. What We Won&rsquo;t Cover</h4>
  <p>One Stop Store will not be liable for the costs of:</p>
  <ol>
    <li>maintenance, including cleaning, clearing of blockages and overhaul, insect infestation or paper jams;</li>
    <li>work covered by the manufacturer&rsquo;s recall of the appliance;</li>
    <li>call-out charges where the breakdown is not covered by the extended warranty; or</li>
    <li>materials or labour recoverable from the manufacturer or any other party responsible under a separate guarantee or warranty.</li>
  </ol>

  <p>One Stop Store will not, in any circumstances, be liable for any consequential loss or damages suffered by the customer, whether directly or indirectly related to a defect in the appliance, to the extent permissible by law.</p>

  <h4>5. Repairs And Assessment</h4>
  <ol>
    <li>Repairs may not be effected without prior authorisation from One Stop Store.</li>
    <li>Where an authorised repairer is called out for a fault covered by the warranty, we will pay the repairer for all labour and materials supplied in terms of the warranty, while the customer is liable to pay the repairer for all other charges, including the call-out charge should no defect be found in the appliance.</li>
    <li>Repairs carried out in terms of the warranty are limited to a reasonable service radius from the appointed service agent&rsquo;s premises. Should the repairer be required to travel beyond this radius, we may charge the customer at the prevailing rate per kilometre.</li>
    <li>Our authorised repairers reserve the right to decline house calls in areas where their safety may be at risk.</li>
    <li>Certain products carry their own supplier warranty; we advise you to keep this and refer to it for any differences from the terms above.</li>
    <li>One Stop Store reserves the right to inspect the goods before a return is approved. Under no circumstances will direct exchanges be conducted before assessment and approval has been completed.</li>
  </ol>

  <p>Questions about returns can be sent to <a href="mailto:support@onestopstore.co.zw">support@onestopstore.co.zw</a>.</p>
`;

const ReturnPolicy = async () => {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={{ en: "Return Policy" }} />
      <div className="relative z-10 mt-4 bg-background text-foreground">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-10 py-6">
          <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: RETURN_POLICY_HTML }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
