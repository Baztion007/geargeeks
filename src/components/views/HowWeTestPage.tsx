'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { EditorialIndependence } from '@/components/affiliate/Disclosure';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Microscope,
  GitCompare,
  ListChecks,
  Gauge,
  BadgeDollarSign,
  Wrench,
  UserCheck,
  ShieldCheck,
  BookOpen,
  Thermometer,
  Timer,
  Coffee,
  Award,
} from 'lucide-react';

export function HowWeTestPage() {
  return (
    <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: 'How We Test' }]} />

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#131921] to-[#37475a] p-8 md:p-12 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Microscope className="w-10 h-10 text-[#febd69]" />
              <h1 className="text-3xl md:text-4xl font-bold">How We Test</h1>
            </div>
            <p className="text-lg text-gray-300 max-w-3xl">
              A detailed look at our rigorous testing methodology. Every recommendation is backed by
              hands-on evaluation, comparative analysis, and expert judgment.
            </p>
          </div>
        </div>

        {/* Trust Banner */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border-l-4 border-emerald-500">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Our Testing Promise</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                We purchase every product we review at retail price whenever possible. Each product
                is tested for a minimum of two weeks of daily use before we publish our findings.
                Our testing process is standardized across all products in a category, ensuring fair
                and consistent comparisons.
              </p>
            </div>
          </div>
        </div>

        {/* Research Process */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-[#c7511f]" />
            <h2 className="text-2xl font-bold text-gray-900">Research Process</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Before we even unbox a product, we invest significant time in research to understand
            the landscape and set fair expectations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              {
                icon: BookOpen,
                title: 'Market Research',
                desc: 'We study the product category, identify the leading competitors, and understand what features and specifications matter most to consumers.',
              },
              {
                icon: UserCheck,
                title: 'User Feedback Analysis',
                desc: 'We analyze verified customer reviews, forum discussions, and community feedback to understand real-world experiences and common issues.',
              },
              {
                icon: Microscope,
                title: 'Technical Deep-Dive',
                desc: 'We review manufacturer specifications, technical documentation, and compare design choices against industry best practices.',
              },
            ].map((item) => (
              <Card key={item.title} className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-5">
                  <item.icon className="w-8 h-8 text-[#007185] mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            {[
              'We compile a list of the most important features and performance metrics for the product category.',
              'We establish baseline expectations based on price point and intended audience.',
              'We identify potential design compromises or trade-offs based on the product\'s specifications.',
              'We create a standardized testing protocol specific to the product category.',
            ].map((item, index) => (
              <div key={index} className="flex gap-3">
                <div className="w-6 h-6 shrink-0 rounded-full bg-[#131921] text-[#febd69] flex items-center justify-center text-xs font-bold mt-0.5">
                  {index + 1}
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Product Comparison Framework */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <GitCompare className="w-6 h-6 text-[#c7511f]" />
            <h2 className="text-2xl font-bold text-gray-900">Product Comparison Framework</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            No product exists in a vacuum. We evaluate every product against its direct competitors
            to give you the most useful comparisons possible.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Side-by-Side Testing',
                desc: 'Whenever possible, we test products simultaneously using the same beans, water, and environmental conditions for the fairest comparison.',
                icon: GitCompare,
              },
              {
                title: 'Price-Tier Grouping',
                desc: 'We compare products within the same price range. A $200 grinder is evaluated against other $200 grinders, not against a $600 model.',
                icon: BadgeDollarSign,
              },
              {
                title: 'Category Benchmarks',
                desc: 'We maintain category benchmarks that every product is measured against. These represent the minimum acceptable performance for the price.',
                icon: Gauge,
              },
              {
                title: 'Cross-Category Context',
                desc: 'When relevant, we provide cross-category context — explaining when a slightly more expensive product from another category might be a better choice.',
                icon: Coffee,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-100 dark:border-gray-600 flex items-start gap-4"
              >
                <div className="w-10 h-10 shrink-0 rounded-lg bg-[#131921] text-[#febd69] flex items-center justify-center">
                  <item.icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation Criteria */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <ListChecks className="w-6 h-6 text-[#c7511f]" />
            <h2 className="text-2xl font-bold text-gray-900">Evaluation Criteria</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Our evaluation goes beyond specs on paper. We test the things that actually matter
            in daily use.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Thermometer,
                title: 'Temperature Consistency',
                desc: 'We measure water temperature at the group head and steam wand using calibrated thermometers and thermocouples.',
              },
              {
                icon: Coffee,
                title: 'Extraction Quality',
                desc: 'For espresso machines, we measure extraction yield using refractometers. For brewers, we evaluate cup quality using standardized cupping protocols.',
              },
              {
                icon: Timer,
                title: 'Speed & Efficiency',
                desc: 'We time heat-up, extraction, and cleanup. How does the product fit into a busy morning routine?',
              },
              {
                icon: Wrench,
                title: 'Maintenance',
                desc: 'We evaluate cleaning difficulty, descaling requirements, and long-term maintenance needs after extended use.',
              },
              {
                icon: Microscope,
                title: 'Grind Consistency',
                desc: 'For grinders, we use sieve analysis to measure particle size distribution and evaluate grind consistency across settings.',
              },
              {
                icon: UserCheck,
                title: 'Beginner Friendliness',
                desc: 'We have both experienced users and newcomers test each product to evaluate the learning curve and documentation quality.',
              },
            ].map((item) => (
              <Card key={item.title} className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-5">
                  <item.icon className="w-8 h-8 text-[#007185] mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Performance Scoring */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Gauge className="w-6 h-6 text-[#c7511f]" />
            <h2 className="text-2xl font-bold text-gray-900">Performance Scoring</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Our performance score is the heart of every review. It reflects how well a product
            delivers on its primary promise.
          </p>

          <div className="space-y-4 mb-6">
            {[
              {
                range: '4.5 – 5.0',
                label: 'Outstanding',
                desc: 'Exceptional performance that sets the standard in its category. Few or no compromises.',
                color: 'bg-emerald-500',
              },
              {
                range: '4.0 – 4.4',
                label: 'Excellent',
                desc: 'Very strong performance with minor shortcomings. Easy to recommend.',
                color: 'bg-emerald-400',
              },
              {
                range: '3.5 – 3.9',
                label: 'Good',
                desc: 'Solid performance with noticeable trade-offs. Best for specific use cases or budgets.',
                color: 'bg-amber-400',
              },
              {
                range: '3.0 – 3.4',
                label: 'Average',
                desc: 'Adequate performance but outperformed by competitors. Consider alternatives first.',
                color: 'bg-orange-400',
              },
              {
                range: 'Below 3.0',
                label: 'Below Average',
                desc: 'Significant issues that affect the core experience. We generally do not recommend products in this range.',
                color: 'bg-red-400',
              },
            ].map((item) => (
              <div key={item.range} className="flex items-center gap-4">
                <div className={`w-3 h-3 shrink-0 rounded-full ${item.color}`} />
                <span className="font-mono font-bold text-gray-900 w-24">{item.range}</span>
                <span className="font-semibold text-gray-700 w-28">{item.label}</span>
                <span className="text-sm text-gray-600">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Value-for-Money Scoring */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <BadgeDollarSign className="w-6 h-6 text-[#c7511f]" />
            <h2 className="text-2xl font-bold text-gray-900">Value-for-Money Scoring</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            A high-end product with outstanding performance isn&apos;t always the best recommendation.
            Our value score considers what you get relative to what you pay.
          </p>

          <div className="space-y-4">
            {[
              'We compare each product against the best available alternative at the same price point.',
              'Products that deliver 90% of the performance at 50% of the price score higher on value.',
              'We factor in long-term costs: filter replacements, maintenance, and energy consumption.',
              'Price drops and frequent sales are considered — a product that\'s often discounted may offer better real-world value.',
              'We clearly state when spending more gets you meaningfully better results and when it doesn\'t.',
            ].map((item, index) => (
              <div key={index} className="flex gap-3">
                <div className="w-6 h-6 shrink-0 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold mt-0.5">
                  {index + 1}
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Durability Considerations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Wrench className="w-6 h-6 text-[#c7511f]" />
            <h2 className="text-2xl font-bold text-gray-900">Durability Considerations</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Coffee equipment is an investment. We evaluate long-term durability and reliability
            to help you choose products that last.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Material Quality',
                desc: 'We assess the quality of materials used — stainless steel vs. plastic, glass thickness, rubber gasket quality, and overall construction heft.',
              },
              {
                title: 'Wear & Tear Testing',
                desc: 'During our extended testing period, we look for signs of premature wear: loose fittings, degraded gaskets, fading markings, and mechanical issues.',
              },
              {
                title: 'Parts Availability',
                desc: 'We check whether replacement parts are readily available and reasonably priced. A machine that can be repaired is better than one that must be replaced.',
              },
              {
                title: 'Warranty Coverage',
                desc: 'We evaluate warranty terms and the manufacturer\'s reputation for honoring them. Longer warranties and responsive customer service factor into our assessment.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-100 dark:border-gray-600"
              >
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* User Experience Considerations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <UserCheck className="w-6 h-6 text-[#c7511f]" />
            <h2 className="text-2xl font-bold text-gray-900">User Experience Considerations</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Great specs don&apos;t matter if a product is frustrating to use. Our UX evaluation
            covers the full ownership experience.
          </p>

          <div className="space-y-6">
            {[
              {
                title: 'Setup & First Use',
                desc: 'How easy is it to go from unboxing to your first cup? We evaluate the out-of-box experience, including instruction quality, initial calibration, and any required assembly.',
              },
              {
                title: 'Daily Routine',
                desc: 'What\'s it like to use this product every morning? We assess workflow efficiency, ergonomics, noise levels, and how the product fits into a realistic morning routine.',
              },
              {
                title: 'Cleaning & Maintenance',
                desc: 'Cleaning is a crucial but often overlooked aspect of ownership. We evaluate how easy each product is to clean, how often maintenance is required, and what tools are needed.',
              },
              {
                title: 'Learning Curve',
                desc: 'Some products require significant skill to get the best results. We document the learning process and assess how quickly a beginner can achieve consistent, good results.',
              },
              {
                title: 'Storage & Footprint',
                desc: 'Counter space is precious. We measure actual dimensions (not just listed specs) and evaluate how easily the product can be stored when not in use.',
              },
            ].map((item, index) => (
              <div key={item.title}>
                <div className="flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-[#007185] text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                {index < 4 && <Separator className="ml-12 my-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Editorial Independence */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Our Testing Standards</h2>
          </div>
          <EditorialIndependence />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                number: '2+',
                label: 'Weeks of Daily Testing',
              },
              {
                number: '6',
                label: 'Rating Categories',
              },
              {
                number: '100%',
                label: 'Editorial Independence',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="text-3xl font-bold text-[#131921] mb-1">{item.number}</div>
                <div className="text-sm text-gray-600">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
