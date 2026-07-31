/**
 * Raines store defaults.
 * The Laravel backend has no KachaBazar-style settings endpoints, so store
 * identity, section toggles and copy are served from this module. Both the
 * server actions (lib/actions/settings.actions.js) and the legacy services
 * (services/SettingServices.js) read from here so they stay in sync.
 */

export const RAINES_CUSTOMIZATION = {
  home: {
    featured_status: true,
    feature_title: { en: "Shop by Category" },
    feature_description: {
      en: "Browse our most-loved departments and find what you need.",
    },
    popular_products_status: true,
    popular_title: { en: "Popular Products" },
    popular_description: {
      en: "Customer favourites, restocked and ready to ship.",
    },
    popular_product_limit: 18,
    discount_product_status: true,
    discount_title: { en: "Latest Offers" },
    latest_discount_title: { en: "Latest Deals" },
    latest_discount_description: {
      en: "Grab these deals before they're gone.",
    },
    latest_discount_product_limit: 18,
    campaign_home_status: false,
    modern_hero_status: true,
    delivery_status: true,

    promotion_title: { en: "Free delivery in Harare & Bulawayo" },
    promotion_description: {
      en: "Same-day dispatch on in-stock appliances and electronics.",
    },
    promotion_button_name: { en: "Learn More" },
    promotion_button_link: "/about-us",
  },

  // Hero carousel (MainCarousel.jsx reads storeCustomizationSetting.slider,
  // NOT .home — a sibling top-level key). Images are on-brand generated
  // banners (public/slider/*.jpg) until real promo banners are supplied.
  slider: {
    bottom_dots: true,
    left_right_arrow: true,

    first_img: "/slider/slider-1.jpg",
    first_title: { en: "Today's Hot Deals" },
    first_description: {
      en: "Limited time offers on appliances, electronics and more. Don't miss out!",
    },
    first_button: { en: "Shop Now" },
    first_link: "/search?query=",

    second_img: "/slider/slider-2.jpg",
    second_title: { en: "Fresh Arrivals, Fair Prices" },
    second_description: {
      en: "New stock landing weekly — TVs, fridges, and more.",
    },
    second_button: { en: "Browse Collections" },
    second_link: "/search?query=",

    third_img: "/slider/slider-3.jpg",
    third_title: { en: "Fast, Reliable Delivery" },
    third_description: {
      en: "Shop online and get it delivered across Zimbabwe.",
    },
    third_button: { en: "Start Shopping" },
    third_link: "/search?query=",
  },

  // Cart / checkout labels — read via showingTranslateValue(checkout?.xxx)
  // across CheckoutCartScreen.jsx and the checkout form. Left unset these
  // all render as blank text (a real, easy-to-miss bug: the labels simply
  // disappear rather than erroring).
  checkout: {
    order_summary: { en: "Order Summary" },
    sub_total: { en: "Subtotal" },
    discount: { en: "Discount" },
    shipping_cost: { en: "Shipping" },
    total_cost: { en: "Total" },
    apply_button: { en: "Apply" },
    continue_button: { en: "Continue Shopping" },
    confirm_button: { en: "Place Order" },

    personal_details: { en: "Personal Details" },
    first_name: { en: "First Name" },
    last_name: { en: "Last Name" },
    email_address: { en: "Email Address" },
    checkout_phone: { en: "Phone Number" },

    shipping_details: { en: "Shipping Details" },
    street_address: { en: "Street Address" },
    city: { en: "City" },
    country: { en: "Country" },
    zip_code: { en: "Zip Code" },

    payment_method: { en: "Payment Method" },

    shipping_one_desc: { en: "Standard Delivery" },
    shipping_one_cost: 0,
    shipping_name_two: { en: "Express Delivery" },
    shipping_two_desc: { en: "Express Delivery" },
    shipping_two_cost: 20,
  },

  // Account dashboard labels — same blank-text issue as `checkout` above.
  dashboard: {
    dashboard_title: { en: "Dashboard" },
    full_name: { en: "Full Name" },
    user_email: { en: "Email" },
    user_phone: { en: "Phone" },
    update_profile: { en: "Update Profile" },
    update_button: { en: "Update" },
    change_password: { en: "Change Password" },
    current_password: { en: "Current Password" },
    new_password: { en: "New Password" },
    address: { en: "Address" },
    my_order: { en: "My Orders" },
    recent_order: { en: "Recent Orders" },
    total_order: { en: "Total Orders" },
    pending_order: { en: "Pending" },
    processing_order: { en: "Processing" },
    complete_order: { en: "Completed" },
    print_button: { en: "Print Invoice" },
    invoice_message_first: { en: "Thank you for shopping with us." },
    invoice_message_last: { en: "This is a computer-generated invoice." },
  },

  navbar: {
    logo: "/logo/raines-light.png",
    help_text: { en: "We're here to help" },
    categories_status: true,
    about_menu_status: true,
    contact_menu_status: true,
    offers_menu_status: true,
    term_and_condition_status: true,
    privacy_policy_status: true,
    faq_status: true,
  },
  // Real footer content — the component (Footer.jsx) reads every one of
  // these title/link fields directly with no fallback text, so leaving them
  // unset (as the old defaults did — only the block*_status flags existed)
  // renders each column as blank text over a blank "undefined" href. Filled
  // in with real, working links (mirrors the old site's footer sections:
  // FooterQuickPage's Help Center list, FooterAddresses' HQ contact,
  // FooterLogoContent's address/phone/email), just on our own routes.
  footer: {
    block1_status: true,
    block1_title: { en: "Quick Links" },
    block1_sub_link1: "/",
    block1_sub_title1: { en: "Home" },
    block1_sub_link2: "/about-us",
    block1_sub_title2: { en: "About Us" },
    block1_sub_link3: "/contact-us",
    block1_sub_title3: { en: "Contact Us" },
    block1_sub_link4: "/faq",
    block1_sub_title4: { en: "FAQ" },

    block2_status: true,
    block2_title: { en: "Legal" },
    block2_sub_link1: "/terms-and-conditions",
    block2_sub_title1: { en: "Terms & Conditions" },
    block2_sub_link2: "/privacy-policy",
    block2_sub_title2: { en: "Privacy Policy" },
    block2_sub_link3: "/auctions",
    block2_sub_title3: { en: "Auctions" },
    block2_sub_link4: "/compare",
    block2_sub_title4: { en: "Compare" },

    block3_status: true,
    block3_title: { en: "My Account" },
    block3_sub_link1: "/user/dashboard",
    block3_sub_title1: { en: "Dashboard" },
    block3_sub_link2: "/user/my-orders",
    block3_sub_title2: { en: "My Orders" },
    block3_sub_link3: "/wishlist",
    block3_sub_title3: { en: "Wishlist" },
    block3_sub_link4: "/user/my-reviews",
    block3_sub_title4: { en: "My Reviews" },

    block4_status: true,
    block4_logo: "/logo/raines-color.png",
    block4_address: {
      en: "Shop No. 6 Rhodesville Shops, No 32 Rhodesville Avenue, Greendale, Harare",
    },
    block4_phone: "+263 77 320 7758",
    block4_email: "support@onestopstore.co.zw",

    payment_method_status: true,
    bottom_contact_status: true,
    bottom_contact: "",
    social_links_status: true,
    shipping_card: { en: "Nationwide Delivery Across Zimbabwe" },
    support_card: { en: "Call Support, Available Daily" },
    payment_card: { en: "Secure Checkout, Multiple Options" },
    offer_card: { en: "Layby Available on Eligible Items" },
  },

  // Real legal text — sourced from raines.africa's live Privacy Policy /
  // Terms & Conditions pages (same parent company/backend), rebranded from
  // "Raines Africa" to "One Stop Store" and onto our own domain.
  privacy_policy: {
    title: { en: "Privacy Policy" },
    description: {
      en: `
        <h3>One Stop Store – Privacy Policy</h3>
        <p><strong>Effective Date:</strong> 12-11-2025</p>

        <h4>A. Who We Are</h4>
        <p>The purpose of this Privacy Policy is to explain how, why, and when One Stop Store (Pty) Ltd, including its subsidiaries and business units operating in South Africa, Zimbabwe, and Zambia (collectively referred to as &ldquo;One Stop Store&rdquo;), collects, uses, and processes your Personal Information in compliance with the Protection of Personal Information Act 4 of 2013 (&ldquo;POPIA&rdquo;).</p>
        <p>We respect your privacy and take the protection of Personal Information seriously. To provide you with efficient service&mdash;whether through our e-commerce stores, export services, logistics, or customer support&mdash;we may need to process certain Personal Information.</p>
        <p>By using our websites, platforms, or services (collectively &ldquo;Platforms&rdquo;), you agree to the processing of your Personal Information as described in this Privacy Policy.</p>
        <p>Please read this Privacy Policy together with any other terms, conditions, or notices One Stop Store may provide when collecting or processing your Personal Information.</p>
        <p><strong>Important Notice</strong> &mdash; certain clauses in this Privacy Policy appear in bold because they:</p>
        <ul>
          <li>may limit the risk or liability of One Stop Store or a third party;</li>
          <li>may create risk or liability for you;</li>
          <li>may require you to indemnify One Stop Store or a third party; or</li>
          <li>serve as your acknowledgment of a fact.</li>
        </ul>
        <p>This Privacy Policy applies to all users of our Platforms. In this Privacy Policy: &ldquo;Personal Information&rdquo; and &ldquo;process/processing&rdquo; have the meanings given in POPIA; &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo; refers to One Stop Store; &ldquo;you&rdquo; refers to every person accessing or using our Platforms; &ldquo;user&rdquo; refers to anyone who registers on our Platforms or interacts with us digitally; &ldquo;Platforms&rdquo; refer to One Stop Store&rsquo;s websites, mobile applications, and online systems.</p>

        <h4>B. What Personal Information We Collect And Receive</h4>
        <p>One Stop Store processes Personal Information in a reasonable, adequate, relevant, and purpose-specific manner. We may receive information directly from you, your devices, trusted third parties, and public sources.</p>
        <p>You provide Personal Information when you: register or purchase goods on our Platforms; contact us through our customer service channels; interact with us on social media; engage with third-party partners we work with (logistics, payment providers, regulators); make your information publicly available online.</p>
        <p>The Personal Information we may collect includes, but is not limited to: full name and surname; email address; phone number; physical/delivery address; identification number (e.g., ID/passport); gender (optional); date of birth; online identifiers; location data; social media profiles; payment and billing details; information voluntarily submitted when contacting support.</p>
        <p>You warrant that the information you provide is accurate, current, true, and does not impersonate any other person.</p>
        <p><strong>Information from using the Platforms</strong> &mdash; when you access our Platforms, we automatically receive information such as: log data (usage times, pages viewed, browsing activity); device and browser information; IP address; geolocation (GPS, cell towers, WiFi networks, if enabled); recorded customer service communications (calls, emails, chats).</p>

        <h4>C. Why We Process Your Personal Information</h4>
        <p>One Stop Store processes Personal Information primarily to provide our e-commerce, export, and logistics services. We may lawfully process your information to: identify and verify you; provide access to our Platforms and services; process and deliver orders; process payments; communicate updates and service notifications; comply with legal and tax obligations; secure our systems and detect fraud; develop and improve our products and business operations; conduct research, analytics, and statistical reporting (not identifiable to you).</p>
        <p>We may process your Personal Information where necessary to protect or pursue legitimate interests, such as: business and operational management; improving our products and services; fraud detection and prevention; business continuity and security; enforcing our rights; tailoring user experiences; conducting internal analytics and audits; sending marketing communications (unless you opt out).</p>

        <h4>D. Direct Marketing</h4>
        <p>We may use your Personal Information to send you marketing content about products, promotions, or services we believe may interest you, through Email, WhatsApp, SMS, Phone, Social media, and Online advertising.</p>
        <p>If you are not a registered user, we will send electronic marketing only if you give consent. You may opt out of marketing at any time.</p>

        <h4>E. User Tracking And Cookies</h4>
        <p>We use cookies and tracking technologies to: enhance and personalise your shopping experience; analyse user behaviour and platform performance; prevent fraud; deliver relevant advertising. By using our Platforms, you consent to our use of cookies.</p>

        <h4>F. Who We Share Your Personal Information With</h4>
        <p>We do not sell your Personal Information. We may share your information with third parties only when: you provide consent; required to fulfil a contract (e.g., delivery partners); required by law; necessary to protect legitimate interests.</p>
        <p>These third parties may include: employees and authorised personnel; logistics and courier partners; payment gateways and banks; IT and cloud service providers; fraud prevention and security agencies; regulators and law enforcement; business partners or affiliates.</p>
        <p>We require third parties to maintain strict confidentiality and comply with POPIA. Our Platforms may contain third-party links. We are not responsible for their privacy practices.</p>

        <h4>G. Retention Of Records</h4>
        <p>We retain your Personal Information only for: as long as necessary to provide services; as required by law; our internal policies; the duration of your consent; the period required to protect our legal interests. Once no longer required, information is securely deleted.</p>

        <h4>H. Transfer Of Personal Information Outside South Africa</h4>
        <p>Because One Stop Store operates across South Africa, Zimbabwe, and Zambia, and uses international service providers, we may transfer Personal Information outside South Africa for: cloud services; storage and backups; payment processing; operational support. Such transfers are done in compliance with POPIA. By using our Platforms, you consent to international data transfers as outlined.</p>

        <h4>I. Securing Your Personal Information</h4>
        <p>We implement appropriate technical and organisational measures to safeguard your Personal Information, including: secure data storage and encryption; physical and network security; strict access control; monitoring and auditing; secure disposal of records; confidentiality agreements with third parties; incident and breach response procedures.</p>
        <p>If you disclose your information to a third party that is not One Stop Store, we cannot be held liable for misuse outside our control.</p>

        <h4>J. Responsible AI Use Statement</h4>
        <p>One Stop Store uses Artificial Intelligence (AI) technologies responsibly and ethically. Our guiding principles include: beneficial use with human oversight; technical excellence and robust standards; fairness and minimising bias; accountability and transparency; privacy and data security in line with POPIA.</p>

        <h4>K. Your Rights</h4>
        <p>You may exercise the following rights under POPIA once adequate proof of identity is provided: request access to your Personal Information; request correction, deletion, or updating of your data; withdraw consent (subject to service limitations); request the identity of third parties who accessed your data; object to certain types of processing; request restrictions on processing; lodge complaints with the Information Regulator; request evidence of our POPIA compliance.</p>
        <p>Withdrawal of consent may affect your ability to use our services.</p>

        <h4>L. Complaints &mdash; Information Regulator</h4>
        <p>If you believe One Stop Store is not complying with POPIA, you may lodge a complaint with the Information Regulator. Visit justice.gov.za/inforeg for contact details.</p>

        <h4>M. Changes To This Privacy Policy</h4>
        <p>This Privacy Policy replaces previous versions. Updates may occur from time to time. The version displayed on our Platforms applies to you.</p>

        <p>Questions about this Privacy Policy can be sent to <a href="mailto:support@onestopstore.co.zw">support@onestopstore.co.zw</a>.</p>
      `,
    },
  },

  term_and_condition: {
    title: { en: "Terms & Conditions" },
    description: {
      en: `
        <h3>One Stop Store – Terms &amp; Conditions</h3>

        <h4>1. Introduction</h4>
        <ol>
          <li>This website, accessible at www.onestopstore.co.zw, as well as related mobile sites and software applications (the &ldquo;Website&rdquo;), is owned and operated by One Stop Store Online (RF) (Proprietary) Limited, referred to as &ldquo;One Stop Store,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; and &ldquo;our.&rdquo;</li>
          <li>These &ldquo;Website Terms and Conditions&rdquo; govern the process of ordering, selling, and delivering products (&ldquo;Goods&rdquo;) and the use of the Website.</li>
          <li>These Terms and Conditions are legally binding and applicable to anyone accessing or using this Website, including every user who registers as described below (a &ldquo;registered user&rdquo;). By using the Website and clicking the &ldquo;Register Now&rdquo; button, if applicable, you acknowledge that you have read and agree to be bound by these Terms and Conditions.</li>
          <li>The Website allows you to shop online for a wide range of products, including sports equipment, home and kitchenware, baby and toddler items, electronics, health and beauty products, movies, gaming, books, music, toys, pet supplies, and more (&ldquo;Goods&rdquo;).</li>
          <li>One Stop Store also permits third-party sellers to list and sell their Goods on the Website (each a &ldquo;Third Party Seller&rdquo;). These Terms and Conditions contain specific terms that apply to purchases from Third Party Sellers, while others apply only to purchases from One Stop Store. These distinctions will be clearly stated in the relevant sections.</li>
        </ol>

        <h4>2. Important Notice</h4>
        <ol>
          <li>These Terms and Conditions apply to users who are consumers under the Consumer Protection Act, 68 of 2008 (the &ldquo;CPA&rdquo;).</li>
          <li>These Terms and Conditions include provisions that may limit the risk or liability of One Stop Store or third parties, create risk or liability for users, compel users to indemnify One Stop Store or third parties, and acknowledge certain facts.</li>
          <li>These Terms and Conditions are crucial, and your attention is drawn to them. If you do not understand any provision in these Terms and Conditions, it is your responsibility to seek clarification from One Stop Store before accepting the Terms and Conditions or continuing to use the Website.</li>
          <li>These Terms and Conditions are not intended to unlawfully restrict, limit, or avoid any rights or obligations created for you or One Stop Store under the CPA.</li>
          <li>Your use of this Website is permitted under these Terms and Conditions. By using the Website in any manner, you are considered to have unconditionally accepted all the Terms and Conditions. If you do not agree with the Terms and Conditions, you should refrain from using this Website.</li>
        </ol>

        <h4>3. Returns</h4>
        <p>For detailed information about returning products, including refunds, replacements, or repairs, please refer to our Returns Policy. The Returns Policy is considered a part of these Terms and Conditions.</p>

        <h4>4. Registration And Use Of The Website</h4>
        <ol>
          <li>Only registered users are allowed to place orders for Goods on the Website.</li>
          <li>To become a registered user, you must create a unique username and password and provide specific information and personal details to One Stop Store. Your unique username and password are necessary for accessing the Website and making purchases.</li>
          <li>You confirm that your username and password will be for personal use only and will not be shared with any third party.</li>
          <li>You agree to enter the correct username and password for ordering Goods, and failing to do so will result in denied access.</li>
          <li>You accept responsibility for any order placed using your username and password, even if the use is unauthorized or fraudulent, unless you cancel the order in accordance with these Terms and Conditions.</li>
          <li>You agree to promptly inform One Stop Store if you suspect any unauthorized access or use of your username and password and take measures to mitigate any potential loss or harm.</li>
          <li>By using the Website, you confirm that you are at least 18 years old and possess full legal capacity. If you are under 18 or not legally permitted to enter into binding agreements, you may only use the Website under the supervision of your parent or legal guardian, who will be bound by these Terms and Conditions.</li>
        </ol>

        <h4>5. Conclusion Of Sales And Availability Of Stock</h4>
        <ol>
          <li>Registered users can place orders for Goods, subject to acceptance or rejection by One Stop Store or the Third Party Seller. Acceptance depends on the availability of Goods, accuracy of information about the Goods (including price), and receipt of payment or payment authorization by One Stop Store.</li>
          <li>The acceptance of your order occurs when the Goods are delivered to you or made available for collection. Only at this point does the sale agreement between you and One Stop Store or the Third Party Seller come into effect.</li>
          <li>You have the right to cancel an order at any time before receiving a dispatch or delivery notice. After receiving the Goods, returns are subject to the Returns Policy.</li>
          <li>Adding items to your wishlist or shopping basket does not constitute an order for those items. They may be removed if stock is no longer available or if the price changes without notice.</li>
          <li>One Stop Store will make reasonable efforts to monitor and manage stock levels for Goods it offers. However, stock availability is not guaranteed. If Goods become unavailable after you place an order, One Stop Store will notify you and provide a refund for any payments made.</li>
          <li>For Goods sold by Third Party Sellers, One Stop Store relies on the inventory information provided by the Third Party Seller and is not responsible for inaccuracies in that information. Disputes related to out-of-stock items from Third Party Sellers are to be resolved between the user and the relevant Third Party Seller.</li>
          <li>Certain Goods may not be purchased for resale. One Stop Store reserves the right to cancel orders suspected of being intended for resale.</li>
        </ol>

        <h4>6. Payment</h4>
        <ol>
          <li>We are committed to providing secure online payment facilities, encrypting all transactions using appropriate encryption technology.</li>
          <li>Payment for Goods, whether sold by One Stop Store or a Third Party Seller, can be made using various methods, depending on availability and eligibility. These methods include debit cards, credit cards, direct bank deposit, electronic funds transfer, and Instant EFT.</li>
          <li>More details about payment options are available in our Help Centre.</li>
          <li>You can request a full payment record through our Help Centre, and we will also send you email communications regarding your order and payment.</li>
        </ol>

        <h4>7. Delivery Of Goods</h4>
        <ol>
          <li>One Stop Store offers two delivery methods: courier and self-collection. Additional information on delivery can be found in our Help Centre.</li>
          <li>Delivery charges are subject to change without prior notice, so please check our Help Centre for the latest information. Delivery charges will be visible in your cart during checkout.</li>
          <li>One Stop Store or the Third Party Seller will deliver the Goods to you within 30 days of receiving your payment. If delivery is not possible within this period, you will have the option to cancel your order and receive a refund.</li>
          <li>One Stop Store&rsquo;s delivery obligation is fulfilled when the product is delivered to the address you specified. After delivery, One Stop Store is not responsible for any loss or unauthorized use of the product.</li>
        </ol>

        <h4>8. Errors</h4>
        <ol>
          <li>We strive to accurately present the description, availability, purchase price, and delivery charges of Goods on the Website. However, we are not liable for any loss or expenses related to transactions based on errors on the Website unless those errors result from our gross negligence.</li>
          <li>One Stop Store is not bound by incorrect information about our Goods displayed on third-party websites.</li>
        </ol>

        <h4>9. Daily Deals And Other Discounted Goods</h4>
        <ol>
          <li>Periodically, we may offer certain Goods at discounted prices as part of Daily Deals, App Only Deals, Bundle Deals, or other temporary deals. These deals are subject to specific conditions described in these Terms and on the Website.</li>
          <li>When you purchase a product within the scope of a Deal, you pay the discounted price (Deal Price). Products outside the scope of a Deal are priced at the Normal Price.</li>
          <li>Daily Deals are available from 7 am to 11:59 pm on weekdays and from 9 am to 11:59 pm on weekends. Daily Deals have limited quantities and may expire earlier if stock runs out.</li>
          <li>One Stop Store does not guarantee a specific saving, and the extent of the discount is at its discretion.</li>
          <li>App Only Deals are only available for purchase using the One Stop Store mobile application and may have different prices than the normal selling prices on the website.</li>
          <li>Bundle Deals may be offered from time to time and consist of two or more products bundled together. Savings or discounts may be applied individually to component products at One Stop Store&rsquo;s discretion.</li>
        </ol>

        <h4>10. Vaping Products</h4>
        <p>When purchasing certain vaping products, age verification and ID document presentation upon delivery may be required.</p>

        <h4>11. For Further Assistance</h4>
        <p>Please refer to our Help Centre under &ldquo;Product and Stock,&rdquo; which is incorporated by reference.</p>

        <p>Questions about these Terms &amp; Conditions can be sent to <a href="mailto:support@onestopstore.co.zw">support@onestopstore.co.zw</a>.</p>
      `,
    },
  },
};

export const RAINES_GLOBAL = {
  shop_name: "One Stop Store",
  company_name: "One Stop Store",
  store_layout: "default",
  default_currency: "$",
  copyright_text: `© ${new Date().getFullYear()} One Stop Store. All rights reserved.`,
  site_description: "Shop appliances, electronics and more across Africa.",
  meta_title: "One Stop Store — Online Shopping",
  website: "https://onestopstore.co.zw",
  meta_url: "https://onestopstore.co.zw",
  address: "Harare, Zimbabwe",
  contact: "",
  email: "support@onestopstore.co.zw",
  logo: "/logo/raines-color.png",
  invoice_logo: "/logo/raines-color.png",
  vat_number: "",
};
