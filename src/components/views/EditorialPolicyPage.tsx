'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { EditorialIndependence } from '@/components/affiliate/Disclosure';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  PenTool,
  Target,
  BarChart3,
  ListChecks,
  ShieldCheck,
  Eye,
  Star,
  FlaskConical,
  Users,
  Lightbulb,
  Scale,
  Package,
  Hammer,
} from 'lucide-react';

export function EditorialPolicyPage() {
  return (
    <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: 'Editorial Policy' }]} />

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#131921] to-[#37475a] p-8 md:p-12 text-white">
            <div className="flex items-center gap-3 mb-4">
              <PenTool className="w-10 h-10 text-[#febd69]" />
              <h1 className="text-3xl md:text-4xl font-bold">Editorial Policy</h1>
            </div>
            <p className="text-lg text-gray-300 max-w-3xl">
              Our commitment to honest, unbiased reviews. Learn how we select, test, and recommend
              products across travel, tech, fitness, and outdoor categories.
            </p>
          </div>
        </div>

        {/* Product Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-[#c7511f]" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How We Select Products</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            We carefully curate every product that appears on GearGeekz. Our selection process
            is driven by reader interest, market relevance, and our commitment to covering a diverse
            range of products across all categories.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: Eye,
                title: 'Reader Demand',
                desc: 'We prioritize products that our readers ask about most. Your questions and suggestions directly shape our review pipeline.',
              },
              {
                icon: Lightbulb,
                title: 'Innovation',
                desc: 'New and innovative products that push the boundaries of their categories always get our attention.',
              },
              {
                icon: Scale,
                title: 'Market Coverage',
                desc: 'We aim to cover products across all ranges — from budget-friendly options to premium equipment — so every reader finds relevant recommendations.',
              },
              {
                icon: Star,
                title: 'Proven Track Record',
                desc: 'Established products with strong reputations in their communities are regularly reviewed and compared against newer alternatives.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-100 dark:border-gray-600"
              >
                <item.icon className="w-7 h-7 text-[#007185] mb-3" />
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Important:</strong> Manufacturers cannot pay to have their products reviewed
              on our site. Product selection is solely at the discretion of our editorial team.
            </p>
          </div>
        </div>

        {/* Review Methodology */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FlaskConical className="w-6 h-6 text-[#c7511f]" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Review Methodology</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Every product we review goes through a rigorous, standardized testing process designed
            to evaluate real-world performance, not just specifications on paper.
          </p>

          <div className="space-y-6">
            {[
              {
                step: '1',
                title: 'Product Acquisition',
                desc: 'We purchase products at retail price whenever possible. If a manufacturer provides a sample, we clearly disclose this in the review. Free samples do not influence our ratings.',
              },
              {
                step: '2',
                title: 'Initial Setup & First Impressions',
                desc: 'We document the unboxing experience, build quality, and initial setup process. How easy is it to get started? Are the instructions clear? Does the product feel well-made?',
              },
              {
                step: '3',
                title: 'Extended Testing Period',
                desc: 'We use each product daily for a minimum of two weeks — often longer for complex products like standing desks or fitness equipment. This ensures we evaluate performance over time, not just out of the box.',
              },
              {
                step: '4',
                title: 'Comparative Testing',
                desc: 'Where possible, we test products side-by-side with direct competitors under the same conditions. This gives us the most meaningful performance comparisons.',
              },
              {
                step: '5',
                title: 'Data Collection & Analysis',
                desc: 'We measure relevant metrics when applicable — battery life, charging speed, noise levels, durability, and more. Subjective assessments are always balanced with objective data.',
              },
              {
                step: '6',
                title: 'Review & Publication',
                desc: 'Our reviews are peer-reviewed by at least one other team member before publication. We fact-check specifications and verify all claims before publishing.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="w-10 h-10 shrink-0 rounded-full bg-[#131921] text-[#febd69] flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Criteria */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-[#c7511f]" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Rating Criteria</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Every product is rated across six key categories on a scale of 1.0 to 5.0. Our overall
            rating is a weighted average that reflects what matters most to gear enthusiasts.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: Star,
                label: 'Overall Rating',
                weight: 'Primary',
                desc: 'A weighted composite of all categories below, reflecting the complete product experience.',
                color: 'bg-amber-100 text-amber-700',
              },
              {
                icon: FlaskConical,
                label: 'Performance',
                weight: '25%',
                desc: 'How well does the product perform its primary function? Does it deliver on its core promise consistently?',
                color: 'bg-emerald-100 text-emerald-700',
              },
              {
                icon: Users,
                label: 'Ease of Use',
                weight: '20%',
                desc: 'How intuitive is the product to operate? We consider the learning curve, interface design, and day-to-day usability for all experience levels.',
                color: 'bg-sky-100 text-sky-700',
              },
              {
                icon: Package,
                label: 'Value',
                weight: '20%',
                desc: 'Does the product deliver good value relative to its competition? We compare performance and features against similarly positioned alternatives.',
                color: 'bg-green-100 text-green-700',
              },
              {
                icon: Hammer,
                label: 'Build Quality',
                weight: '20%',
                desc: 'How well is the product constructed? We evaluate materials, fit and finish, durability, and long-term reliability based on our testing.',
                color: 'bg-purple-100 text-purple-700',
              },
              {
                icon: ListChecks,
                label: 'Features',
                weight: '15%',
                desc: 'Does the product offer a compelling feature set? We assess both the quantity and quality of features, and whether they add genuine value.',
                color: 'bg-orange-100 text-orange-700',
              },
            ].map((item) => (
              <Card key={item.label} className="border border-gray-200 dark:border-gray-700 overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 shrink-0 rounded-lg ${item.color} flex items-center justify-center`}>
                      <item.icon size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">{item.label}</h3>
                        <Badge variant="outline" className="text-xs">
                          {item.weight}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How Recommendations Are Made */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <ListChecks className="w-6 h-6 text-[#c7511f]" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How We Make Recommendations</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Our product recommendations are never influenced by affiliate commissions or
            manufacturer relationships. Here&apos;s how we decide what to recommend:
          </p>

          <div className="space-y-4">
            {[
              'We only recommend products we have personally tested and would use ourselves.',
              'Recommendations are based on how well a product serves its intended audience, not its absolute score.',
              'A mid-range product that excels in its category can be a better recommendation than a premium product with minor advantages.',
              'We always explain who a product is best for and who should look elsewhere, so you can make the right decision for your situation.',
              'Our &quot;Best For&quot; labels reflect genuine use cases, not marketing copy.',
              'When multiple products score similarly, we consider long-term reliability, customer support, and community feedback.',
            ].map((item, index) => (
              <div key={index} className="flex gap-3">
                <div className="w-6 h-6 shrink-0 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                  ✓
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Affiliate Disclosure Practices */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-6 h-6 text-[#c7511f]" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Affiliate Disclosure Practices</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            We believe complete transparency about our affiliate relationships is essential to
            maintaining your trust. Here are our disclosure practices:
          </p>

          <div className="space-y-3 mb-6">
            {[
              'Every page containing affiliate links includes a clear disclosure statement.',
              'Affiliate links are clearly labeled with "Check Price" or "View Latest Price" buttons.',
              'We disclose all affiliate program relationships on our About page and in site-wide disclosures.',
              'Product rankings are never adjusted to favor higher-commission items or retailers.',
              'We comply with the FTC\'s guidelines on endorsements and testimonials (16 CFR Part 255).',
              'We do not use link shorteners or redirects that hide the destination of affiliate links.',
            ].map((item, index) => (
              <div key={index} className="flex gap-3">
                <div className="w-6 h-6 shrink-0 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                  {index + 1}
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>

          <EditorialIndependence />
        </div>

        {/* Commitment to Editorial Independence */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Commitment to Editorial Independence</h2>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 mb-6">
            <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
              &quot;Our editorial team operates with complete independence. No manufacturer, advertiser,
              or affiliate partner can influence our reviews, ratings, or recommendations. We would
              rather lose an affiliate partnership than compromise our integrity.&quot;
            </p>
            <p className="text-emerald-700 dark:text-emerald-400 text-sm mt-3">— The GearGeekz Team</p>
          </div>

          <div className="space-y-4">
            {[
              {
                title: 'Separation of Teams',
                desc: 'Our editorial team operates independently from any business or partnerships team. Reviewers do not have access to affiliate revenue data and cannot see which products or retailers generate the most commission.',
              },
              {
                title: 'No Paid Placements',
                desc: 'We never accept payment for positive reviews, preferential rankings, or product placement. "Sponsored" content does not exist on GearGeekz.',
              },
              {
                title: 'Honest Criticism',
                desc: 'When a product doesn\'t meet our standards, we say so — even if it\'s from a major brand. Our readers trust us because we\'re honest about both pros and cons.',
              },
              {
                title: 'Corrections Policy',
                desc: 'If we make a mistake, we correct it promptly and transparently. Corrections are noted at the bottom of the relevant article with the date and nature of the change.',
              },
            ].map((item, index) => (
              <React.Fragment key={item.title}>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.desc}</p>
                </div>
                {index < 3 && <Separator />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
