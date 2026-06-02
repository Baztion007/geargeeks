'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { Separator } from '@/components/ui/separator';
import { FileText, Scale, AlertTriangle, ShoppingCart } from 'lucide-react';

export function TermsPage() {
  return (
    <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: 'Terms of Service' }]} />

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#131921] to-[#37475a] p-8 md:p-12 text-white">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-10 h-10 text-[#febd69]" />
              <h1 className="text-3xl md:text-4xl font-bold">Terms of Service</h1>
            </div>
            <p className="text-lg text-gray-300 max-w-3xl">
              Please read these terms carefully before using BrewHub Reviews. By accessing our
              site, you agree to these terms.
            </p>
            <p className="text-sm text-gray-400 mt-3">Last updated: March 1, 2026</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
          {/* Introduction */}
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Welcome to BrewHub Reviews (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms of Service
            (&quot;Terms&quot;) govern your use of brewhubreviews.com (the &quot;Site&quot;). By accessing or using the
            Site, you agree to be bound by these Terms. If you disagree with any part of these Terms,
            you may not access the Site.
          </p>

          <Separator className="my-8" />

          {/* Use of Site */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-[#007185]" />
              <h2 className="text-2xl font-bold text-gray-900">1. Use of the Site</h2>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-3">Permitted Use</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              You may use the Site for personal, non-commercial purposes to read reviews, compare
              products, and access our content. You agree to use the Site only for lawful purposes
              and in a way that does not infringe on the rights of others.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Prohibited Use</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
              <li>Use the Site in any way that violates applicable laws or regulations</li>
              <li>Copy, reproduce, or redistribute our content without prior written permission</li>
              <li>Use automated systems (bots, scrapers) to access the Site</li>
              <li>Attempt to interfere with the proper functioning of the Site</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Submit false or misleading information through contact forms</li>
              <li>Use the Site to transmit malware or other harmful code</li>
              <li>Frame or embed our content on other websites without permission</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Intellectual Property</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              All content on this Site, including but not limited to text, graphics, logos, images,
              reviews, and software, is the property of BrewHub Reviews and is protected by copyright,
              trademark, and other intellectual property laws. You may not reproduce, distribute,
              modify, or create derivative works from our content without our express written consent.
            </p>
          </section>

          <Separator className="my-8" />

          {/* Affiliate Disclosure */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingCart className="w-6 h-6 text-[#007185]" />
              <h2 className="text-2xl font-bold text-gray-900">2. Affiliate Disclosure</h2>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> BrewHub Reviews is a participant in the Amazon Services
                LLC Associates Program, an affiliate advertising program designed to provide a means
                for sites to earn advertising fees by advertising and linking to Amazon.com.
              </p>
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Our Site contains affiliate links to Amazon.com. When you click on an affiliate link
              and make a purchase, we may receive a commission at no additional cost to you. This
              affiliate relationship is disclosed in accordance with the Federal Trade Commission&apos;s
              guidelines on endorsements and testimonials (16 CFR Part 255).
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">How Affiliate Links Work</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
              <li>When you click an affiliate link, a cookie is placed on your browser</li>
              <li>If you make a qualifying purchase on Amazon within 24 hours, we may receive a small commission</li>
              <li>The price you pay is exactly the same whether you use our link or go directly to Amazon</li>
              <li>Affiliate commissions do not influence our product ratings or recommendations</li>
              <li>We clearly mark affiliate links with &quot;Check Price on Amazon&quot; buttons</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Other Affiliate Programs</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              From time to time, we may participate in other affiliate programs. Any such
              relationships will be clearly disclosed on the relevant pages. The same editorial
              independence standards apply to all affiliate programs.
            </p>
          </section>

          <Separator className="my-8" />

          {/* Product Information */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-[#007185]" />
              <h2 className="text-2xl font-bold text-gray-900">3. Product Information</h2>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-3">Accuracy of Information</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              While we strive to provide accurate and up-to-date information about products, we make
              no warranties or guarantees about the completeness, reliability, or accuracy of this
              information. Product specifications, prices, and availability are subject to change
              without notice.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Product Prices</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Product prices displayed on our Site are approximate and may not reflect the current
              price on Amazon or other retailers. Always verify the price on the retailer&apos;s website
              before making a purchase. We are not responsible for pricing discrepancies.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Product Reviews and Ratings</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Our reviews and ratings represent the opinions of our authors based on their testing
              and experience with the products. Individual experiences may vary. We do not guarantee
              that you will have the same experience with any product we review. Reviews are based
              on the specific model and version tested; manufacturers may change product specifications
              without notice.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Not Professional Advice</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The content on our Site is for informational purposes only and should not be considered
              professional advice. We are not responsible for any decisions you make based on the
              information provided on our Site. Always do your own research before making a purchase.
            </p>
          </section>

          <Separator className="my-8" />

          {/* Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Limitation of Liability</h2>

            <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-3">Disclaimer of Warranties</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              THE SITE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES
              OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES
              OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Limitation of Liability</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              IN NO EVENT SHALL BREWHUB REVIEWS, ITS AUTHORS, OR ITS AFFILIATES BE LIABLE FOR ANY
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR
              RELATING TO YOUR USE OF THE SITE, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF
              PROFITS, DATA, OR OTHER INTANGIBLE LOSSES, EVEN IF WE HAVE BEEN ADVISED OF THE
              POSSIBILITY OF SUCH DAMAGES.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Third-Party Links</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Our Site contains links to third-party websites, including Amazon.com. We are not
              responsible for the content, privacy policies, or practices of any third-party websites.
              Accessing third-party links is at your own risk, and you should review the terms and
              privacy policies of any third-party sites you visit.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Indemnification</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              You agree to defend, indemnify, and hold harmless BrewHub Reviews and its authors from
              and against any and all claims, damages, obligations, losses, liabilities, costs, or
              debt arising from your use of the Site or violation of these Terms.
            </p>
          </section>

          <Separator className="my-8" />

          {/* Additional Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. General Provisions</h2>

            <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-3">Changes to Terms</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We reserve the right to modify or replace these Terms at any time. Material changes
              will be posted on this page with an updated &quot;Last Updated&quot; date. Your continued use
              of the Site after any changes constitutes acceptance of the new Terms.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Governing Law</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the
              United States, without regard to conflict of law provisions.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Severability</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              If any provision of these Terms is held to be unenforceable or invalid, such provision
              will be changed and interpreted to accomplish its objectives to the greatest extent
              possible under applicable law, and the remaining provisions will continue in full force.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Contact</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If you have any questions about these Terms, please contact us at:{' '}
              <a
                href="mailto:legal@brewhubreviews.com"
                className="text-[#007185] hover:text-[#c7511f] hover:underline"
              >
                legal@brewhubreviews.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
