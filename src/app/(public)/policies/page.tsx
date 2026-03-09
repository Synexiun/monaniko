"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";

const sectionFade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true as const },
  transition: { duration: 0.5 },
};

export default function PoliciesPage() {
  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative py-32 md:py-40 bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/95" />
        <div className="relative z-10 container-gallery text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[11px] tracking-[0.3em] uppercase text-gold mb-6"
          >
            Legal
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-serif text-4xl md:text-6xl lg:text-7xl text-white font-medium tracking-[-0.02em]"
          >
            Policies
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 text-base md:text-lg text-white/60 max-w-xl mx-auto leading-relaxed"
          >
            Shipping, returns, and privacy information for your peace of mind.
          </motion.p>
        </div>
      </section>

      {/* ─── Policies Content ─────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery max-w-3xl">
          {/* ─ Quick Navigation ─ */}
          <motion.div {...sectionFade} className="mb-16 bg-cream-dark p-6 md:p-8">
            <p className="text-[11px] tracking-[0.15em] uppercase text-charcoal-light mb-4">
              On This Page
            </p>
            <div className="flex flex-wrap gap-3">
              {["Shipping Policy", "Returns Policy", "Privacy Policy"].map(
                (item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm text-charcoal hover:text-gold transition-colors underline underline-offset-4 decoration-warm-gray hover:decoration-gold"
                  >
                    {item}
                  </a>
                )
              )}
            </div>
          </motion.div>

          {/* ─ Shipping Policy ─ */}
          <motion.div {...sectionFade} id="shipping-policy" className="mb-20 scroll-mt-32">
            <h2 className="font-serif text-2xl md:text-3xl text-black mb-4">
              Shipping Policy
            </h2>
            <div className="divider-gold mb-8" />
            <div className="space-y-5 text-[15px] text-charcoal-light leading-[1.8]">
              <h3 className="font-serif text-lg text-black mt-8 mb-3">
                Domestic Shipping (United States)
              </h3>
              <p>
                All artworks are professionally packaged using museum-grade
                materials to ensure safe transit. Original paintings are shipped
                in custom-built wooden crates with foam-lined interiors. Prints
                and smaller works are shipped flat in rigid, reinforced mailers.
              </p>
              <ul className="space-y-2 pl-5">
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1.5">&#8226;</span>
                  <span>
                    <strong className="text-charcoal">Standard Shipping:</strong>{" "}
                    5-10 business days. Complimentary for orders over $500.
                    Otherwise, $25-$75 depending on size.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1.5">&#8226;</span>
                  <span>
                    <strong className="text-charcoal">Expedited Shipping:</strong>{" "}
                    2-5 business days. Available for an additional fee quoted at
                    checkout.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1.5">&#8226;</span>
                  <span>
                    <strong className="text-charcoal">White Glove Delivery:</strong>{" "}
                    Available for original artworks in select metropolitan areas.
                    Includes professional uncrating and placement. Quoted upon
                    request.
                  </span>
                </li>
              </ul>

              <h3 className="font-serif text-lg text-black mt-8 mb-3">
                International Shipping
              </h3>
              <p>
                We ship worldwide through specialized fine art carriers.
                International shipping costs are calculated based on size,
                weight, and destination. Customs duties, import taxes, and
                brokerage fees are the responsibility of the buyer and are not
                included in the shipping price.
              </p>
              <p>
                International delivery typically takes 10-21 business days
                depending on destination and customs processing times.
              </p>

              <h3 className="font-serif text-lg text-black mt-8 mb-3">
                Insurance
              </h3>
              <p>
                All shipments are fully insured for the purchase value of the
                artwork. In the unlikely event of damage during transit, please
                contact us within 48 hours of delivery with photographs of the
                damage and packaging.
              </p>
            </div>
          </motion.div>

          {/* ─ Returns Policy ─ */}
          <motion.div {...sectionFade} id="returns-policy" className="mb-20 scroll-mt-32">
            <h2 className="font-serif text-2xl md:text-3xl text-black mb-4">
              Returns Policy
            </h2>
            <div className="divider-gold mb-8" />
            <div className="space-y-5 text-[15px] text-charcoal-light leading-[1.8]">
              <p>
                We want you to love your art. If for any reason you are not
                completely satisfied with your purchase, we offer a 14-day
                return policy from the date of delivery.
              </p>

              <h3 className="font-serif text-lg text-black mt-8 mb-3">
                Eligibility
              </h3>
              <ul className="space-y-2 pl-5">
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1.5">&#8226;</span>
                  <span>
                    The artwork must be returned in its original packaging and
                    condition, free from damage.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1.5">&#8226;</span>
                  <span>
                    Return requests must be initiated within 14 days of delivery
                    by contacting us via email.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1.5">&#8226;</span>
                  <span>
                    Return shipping costs are the responsibility of the buyer
                    unless the return is due to a defect or error on our part.
                  </span>
                </li>
              </ul>

              <h3 className="font-serif text-lg text-black mt-8 mb-3">
                Non-Returnable Items
              </h3>
              <ul className="space-y-2 pl-5">
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1.5">&#8226;</span>
                  <span>Custom commissions and personalized artworks</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1.5">&#8226;</span>
                  <span>Workshop registrations (separate cancellation policy applies)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1.5">&#8226;</span>
                  <span>Gift cards and digital products</span>
                </li>
              </ul>

              <h3 className="font-serif text-lg text-black mt-8 mb-3">
                Refund Process
              </h3>
              <p>
                Once we receive and inspect the returned artwork, we will
                process your refund within 5-7 business days to the original
                payment method. You will receive an email confirmation when the
                refund has been issued.
              </p>
            </div>
          </motion.div>

          {/* ─ Privacy Policy ─ */}
          <motion.div {...sectionFade} id="privacy-policy" className="scroll-mt-32">
            <h2 className="font-serif text-2xl md:text-3xl text-black mb-4">
              Privacy Policy
            </h2>
            <div className="divider-gold mb-8" />
            <div className="space-y-5 text-[15px] text-charcoal-light leading-[1.8]">
              <p>
                Mona Niko Gallery (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
                &ldquo;our&rdquo;) respects your privacy and is committed to
                protecting your personal information. This privacy policy
                explains how we collect, use, and safeguard your data when you
                visit our website or make a purchase.
              </p>

              <h3 className="font-serif text-lg text-black mt-8 mb-3">
                Information We Collect
              </h3>
              <p>
                We may collect personal information that you voluntarily provide
                when you make a purchase, submit an inquiry form, subscribe to
                our newsletter, or register for a workshop. This may include
                your name, email address, phone number, shipping address, and
                payment information.
              </p>

              <h3 className="font-serif text-lg text-black mt-8 mb-3">
                How We Use Your Information
              </h3>
              <ul className="space-y-2 pl-5">
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1.5">&#8226;</span>
                  <span>To process and fulfill your orders</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1.5">&#8226;</span>
                  <span>
                    To communicate with you about your purchases, inquiries, and
                    workshop registrations
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1.5">&#8226;</span>
                  <span>
                    To send you newsletter updates and marketing communications
                    (with your consent)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold mt-1.5">&#8226;</span>
                  <span>To improve our website and customer experience</span>
                </li>
              </ul>

              <h3 className="font-serif text-lg text-black mt-8 mb-3">
                Data Security
              </h3>
              <p>
                We implement appropriate technical and organizational measures
                to protect your personal information against unauthorized access,
                alteration, disclosure, or destruction. Payment information is
                processed through secure, PCI-compliant payment processors and
                is never stored on our servers.
              </p>

              <h3 className="font-serif text-lg text-black mt-8 mb-3">
                Your Rights
              </h3>
              <p>
                You have the right to access, correct, or delete your personal
                information at any time. You may also unsubscribe from marketing
                communications by clicking the unsubscribe link in any email.
                For data requests, please contact us at{" "}
                <a
                  href="mailto:privacy@monaniko.com"
                  className="text-gold hover:text-gold-dark transition-colors"
                >
                  privacy@monaniko.com
                </a>
                .
              </p>

              <h3 className="font-serif text-lg text-black mt-8 mb-3">
                Cookies
              </h3>
              <p>
                Our website uses cookies to enhance your browsing experience and
                analyze site traffic. You can manage your cookie preferences
                through your browser settings. Essential cookies required for
                site functionality cannot be disabled.
              </p>

              <p className="text-sm text-charcoal-light mt-10 pt-6 border-t border-warm-gray">
                This policy was last updated on January 1, 2025. We reserve the
                right to update this policy at any time. Changes will be posted
                on this page with an updated revision date.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Questions CTA ────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-cream-dark">
        <div className="container-gallery text-center">
          <motion.div {...sectionFade}>
            <h2 className="font-serif text-2xl md:text-3xl text-black font-medium mb-4">
              Have Questions About Our Policies?
            </h2>
            <div className="divider-gold mx-auto mb-8" />
            <p className="text-charcoal-light max-w-lg mx-auto mb-10">
              We are happy to clarify anything. Reach out and we will respond
              promptly.
            </p>
            <Link href="/contact">
              <Button variant="gold" size="lg">
                Contact Us
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
