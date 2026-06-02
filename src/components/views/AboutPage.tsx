'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { Disclosure, EditorialIndependence } from '@/components/affiliate/Disclosure';
import { authors } from '@/data/authors';
import { useRouterStore } from '@/lib/router';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Coffee,
  Shield,
  Search,
  Heart,
  Award,
  Users,
  BookOpen,
  Target,
  ExternalLink,
  Twitter,
  Linkedin,
} from 'lucide-react';

export function AboutPage() {
  const navigate = useRouterStore((s) => s.navigate);
  const goToAuthor = useRouterStore((s) => s.goToAuthor);

  return (
    <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: 'About' }]} />

        {/* Hero Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#131921] to-[#37475a] p-8 md:p-12 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Coffee className="w-10 h-10 text-[#febd69]" />
              <h1 className="text-3xl md:text-4xl font-bold">About BrewHub Reviews</h1>
            </div>
            <p className="text-lg text-gray-300 max-w-3xl">
              Your trusted source for honest, in-depth coffee equipment reviews. We help coffee
              enthusiasts make informed purchasing decisions through rigorous testing and expert analysis.
            </p>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-[#c7511f]" />
            <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            At BrewHub Reviews, we believe everyone deserves great coffee at home. Our mission is to cut
            through the marketing noise and provide honest, evidence-based reviews that help you find the
            right equipment for your needs and budget.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            We purchase and test every product we review. Our team of certified coffee professionals
            spends weeks with each piece of equipment before publishing their findings. We don&apos;t
            accept payment for positive reviews, and we never recommend products we wouldn&apos;t use
            ourselves.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {[
              {
                icon: Search,
                title: 'Research-Driven',
                desc: 'Every recommendation backed by hands-on testing and expert evaluation.',
              },
              {
                icon: Shield,
                title: 'Editorially Independent',
                desc: 'Affiliate commissions never influence our rankings or recommendations.',
              },
              {
                icon: Heart,
                title: 'Community-Focused',
                desc: 'Built by coffee lovers, for coffee lovers. Your trust is our priority.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-100 dark:border-gray-600"
              >
                <item.icon className="w-8 h-8 text-[#007185] mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Affiliate Disclosure */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900">Affiliate Disclosure</h2>
          </div>
          <Disclosure />
          <div className="mt-4 space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              BrewHub Reviews is a participant in the Amazon Services LLC Associates Program, an
              affiliate advertising program designed to provide a means for sites to earn advertising
              fees by advertising and linking to Amazon.com.
            </p>
            <p>
              When you click on one of our affiliate links and make a purchase, we may receive a small
              commission at no additional cost to you. These commissions help us maintain our website,
              purchase products for testing, and continue producing high-quality content.
            </p>
            <p>
              We want to be completely transparent about this relationship. Our editorial team operates
              independently from our business team, and affiliate partnerships never influence which
              products we review or how we rate them.
            </p>
          </div>
          <EditorialIndependence />
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Amazon Disclaimer:</strong> Certain content that appears on BrewHub Reviews comes
              from Amazon Services LLC. This content is provided &apos;as is&apos; and is subject to change or
              removal at any time. Product prices and availability are accurate as of the date/time
              indicated and are subject to change. Any price and availability information displayed on
              Amazon.com at the time of purchase will apply to the purchase of this product.
            </p>
          </div>
        </div>

        {/* Team / Authors Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-[#007185]" />
            <h2 className="text-2xl font-bold text-gray-900">Our Team</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Our reviews are written by experienced coffee professionals who are passionate about
            helping you find the best equipment. Each reviewer brings unique expertise and years
            of hands-on experience.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {authors.map((author) => (
              <Card
                key={author.slug}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
              >
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Author photo placeholder */}
                    <div
                      className="w-20 h-20 shrink-0 rounded-full bg-gradient-to-br from-[#131921] to-[#37475a] flex items-center justify-center text-white text-2xl font-bold"
                      onClick={() => goToAuthor(author.slug)}
                    >
                      {author.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-lg font-bold text-gray-900 hover:text-[#c7511f] cursor-pointer"
                        onClick={() => goToAuthor(author.slug)}
                      >
                        {author.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 mb-2">
                        <Badge variant="secondary" className="text-xs bg-[#febd69]/20 text-[#131921]">
                          <BookOpen size={10} className="mr-1" />
                          {author.reviewCount} Reviews
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                        {author.bio.substring(0, 150)}...
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {author.expertise.map((exp) => (
                          <Badge
                            key={exp}
                            variant="outline"
                            className="text-xs text-[#007185] border-[#007185]/30"
                          >
                            {exp}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        {author.socialLinks?.twitter && (
                          <a
                            href={author.socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-[#1da1f2] transition-colors"
                          >
                            <Twitter size={16} />
                          </a>
                        )}
                        {author.socialLinks?.linkedin && (
                          <a
                            href={author.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-[#0077b5] transition-colors"
                          >
                            <Linkedin size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Editorial Standards */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Editorial Standards</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            We hold ourselves to the highest editorial standards to ensure our readers can trust
            every recommendation we make. Here are the principles that guide our work:
          </p>

          <div className="space-y-4">
            {[
              {
                title: 'Hands-On Testing',
                desc: 'Every product we review is purchased and tested by our team. We spend at least two weeks with each product before publishing our findings.',
              },
              {
                title: 'No Paid Reviews',
                desc: 'We never accept payment in exchange for positive reviews. Manufacturers cannot pay to influence our ratings or rankings.',
              },
              {
                title: 'Full Transparency',
                desc: 'We clearly disclose our affiliate relationships and always identify when a link earns us a commission. No hidden agendas.',
              },
              {
                title: 'Regular Updates',
                desc: 'Our reviews are living documents. We re-test products after firmware updates, price changes, and when new competitors enter the market.',
              },
              {
                title: 'Balanced Coverage',
                desc: 'We highlight both pros and cons. No product is perfect, and we won\'t pretend otherwise. Our readers deserve the complete picture.',
              },
              {
                title: 'Reader-First Approach',
                desc: 'We write for you, not for manufacturers. Our recommendations are based on what\'s best for our readers, not what generates the most revenue.',
              },
            ].map((item, index) => (
              <React.Fragment key={item.title}>
                <div className="flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                {index < 5 && <Separator className="ml-12" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#131921] to-[#37475a] rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Have Questions?</h2>
          <p className="text-gray-300 mb-6">
            We&apos;re always happy to help you find the perfect coffee equipment.
          </p>
          <button
            onClick={() => navigate({ page: 'contact' } as any)}
            className="inline-flex items-center gap-2 bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-bold px-8 py-3 rounded-lg transition-all hover:shadow-lg"
          >
            Get in Touch
            <ExternalLink size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
