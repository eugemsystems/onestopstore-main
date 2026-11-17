//internal import
import PageHeader from "@components/header/PageHeader";

export const metadata = {
  title: "About Us",
  description:
    "OneStopStore is Zimbabwe's online marketplace for appliances, electronics and everyday goods, with fast delivery in Harare and nationwide shipping.",
  keywords: ["about", "our story", "OneStopStore", "Zimbabwe online store"],
};

const AboutUs = () => {
  return (
    <div className="bg-background">
      <PageHeader title={{ en: "About Us" }} />

      <div className="bg-background text-foreground">
        <div className="max-w-screen-2xl mx-auto lg:py-20 py-10 px-4 sm:px-10">
          <div className="grid grid-flow-row gap-4 lg:gap-16 items-center">
            <div>
              <h3 className="text-xl lg:text-3xl mb-2 font-semibold text-foreground">
                Your one-stop shop for everything you need
              </h3>
              <div className="mt-3 text-base text-muted-foreground leading-7">
                <p>
                  OneStopStore is an online marketplace serving customers
                  across Zimbabwe. From home appliances and electronics to
                  everyday household goods, we bring together a wide range of
                  products in one place so you don&rsquo;t have to shop
                  around — hence the name.
                </p>
                <p className="mt-4">
                  We&rsquo;re based in Harare, with same-day dispatch on
                  in-stock items across Harare, and delivery
                  nationwide. Whether you&rsquo;re furnishing a new home,
                  replacing a broken appliance, or just looking for a good
                  deal, our goal is to make it simple, affordable and
                  reliable.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6 lg:grid-cols-2 xl:gap-6 mt-8">
                <div className="p-8 bg-primary/5 dark:bg-primary/10 border border-primary/10 shadow-sm rounded-xl">
                  <span className="text-3xl block font-extrabold mb-4 text-primary">
                    01
                  </span>
                  <h4 className="text-lg font-bold mb-1 text-foreground">
                    Wide Selection
                  </h4>
                  <p className="mb-0 text-muted-foreground leading-7">
                    Appliances, electronics, furniture and everyday
                    essentials — new stock added weekly so there&rsquo;s
                    always something new to discover.
                  </p>
                </div>
                <div className="p-8 bg-primary/5 dark:bg-primary/10 border border-primary/10 shadow-sm rounded-xl">
                  <span className="text-3xl block font-extrabold mb-4 text-primary">
                    02
                  </span>
                  <h4 className="text-lg font-bold mb-1 text-foreground">
                    Fast, Reliable Delivery
                  </h4>
                  <p className="mb-0 text-muted-foreground leading-7">
                    Same-day dispatch on in-stock items in Harare,
                    with nationwide delivery across Zimbabwe.
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-10 lg:mt-16 text-base text-muted-foreground leading-7">
            <p>
              We started OneStopStore to solve a simple problem: finding
              everything you need for your home in one trustworthy place,
              at a fair price, without the runaround. Today that means
              carrying everything from TVs and fridges to gaming gear and
              household essentials, backed by real customer support and a
              straightforward return policy.
            </p>
            <p className="mt-4">
              We&rsquo;re still growing, and every order helps us stock more
              of what Zimbabwean shoppers are actually looking for. Thank
              you for shopping with us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
