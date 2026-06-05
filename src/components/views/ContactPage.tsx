'use client';

import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MessageSquare, HelpCircle, Send, CheckCircle2 } from 'lucide-react';

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: 'Contact' }]} />

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#131921] to-[#37475a] p-8 md:p-12 text-white">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-10 h-10 text-[#febd69]" />
              <h1 className="text-3xl md:text-4xl font-bold">Contact Us</h1>
            </div>
            <p className="text-lg text-gray-300 max-w-3xl">
              Have a question about a review, need product advice, or want to share feedback?
              We&apos;d love to hear from you.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Send className="w-5 h-5 text-[#c7511f]" />
                Send Us a Message
              </h2>

              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Message Received!</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Thank you for reaching out. We'll get back to you as soon as possible.
                  </p>
                  <Button
                    onClick={() => setSubmitted(false)}
                    variant="outline"
                    className="border-[#131921] text-[#131921] dark:border-gray-600 dark:text-gray-300"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        required
                        className="border-gray-300 focus:border-[#007185] focus:ring-[#007185]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        className="border-gray-300 focus:border-[#007185] focus:ring-[#007185]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="What's this about?"
                      className="border-gray-300 focus:border-[#007185] focus:ring-[#007185]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us what's on your mind..."
                      rows={6}
                      required
                      className="border-gray-300 focus:border-[#007185] focus:ring-[#007185] resize-none"
                    />
                  </div>

                  <p className="text-xs text-gray-500">
                    Fields marked with * are required. We&apos;ll never share your information with third parties.
                  </p>

                  <Button
                    type="submit"
                    className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-bold px-8"
                  >
                    <Send size={16} className="mr-2" />
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <HelpCircle className="w-5 h-5 text-[#007185]" />
                  <h3 className="font-bold text-gray-900 dark:text-white">Quick Answers</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Many common questions are answered in our FAQ section below. Check there first for
                  the fastest response.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-[#c7511f]" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {[
              {
                q: 'How do you choose which products to review?',
                a: 'We select products based on popularity, reader interest, innovation, and market relevance. We also accept reader suggestions — if there\'s a product you\'d like us to review, let us know!',
              },
              {
                q: 'Can I suggest a product for review?',
                a: 'Absolutely! Use the contact form above to submit your suggestion. We prioritize products that multiple readers request, so your suggestion really does matter.',
              },
              {
                q: 'Do you accept sponsored reviews?',
                a: 'No. We never accept payment for positive reviews. Manufacturers may send us products for evaluation, but this never influences our ratings. We always disclose when a product was provided by the manufacturer.',
              },
              {
                q: 'How often do you update your reviews?',
                a: 'We review and update our content regularly. Major reviews are revisited at least every 6 months, and we update availability information more frequently. Each review shows its last update date.',
              },
              {
                q: 'Why do you use affiliate links?',
                a: 'Affiliate commissions help us cover the costs of purchasing products, maintaining our website, and producing quality content. Using our links costs you nothing extra and helps keep our reviews free for everyone.',
              },
              {
                q: 'I found an error in a review. How can I report it?',
                a: 'We take accuracy very seriously. If you spot an error, please contact us through the form above with the details. We\'ll investigate and correct any mistakes promptly.',
              },
              {
                q: 'What product categories do you cover?',
                a: 'GearScope covers travel gear, tech gadgets, home office equipment, fitness devices, outdoor equipment, audio gear, and electronics. We focus on products where our expertise can provide the most value to readers.',
              },
              {
                q: 'Can I use your content on my website or social media?',
                a: 'Our content is copyrighted. You may quote brief excerpts with proper attribution and a link back to the original article. For extended use, please contact us for permission.',
              },
            ].map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 data-[state=open]:bg-gray-50 dark:data-[state=open]:bg-gray-700/50"
              >
                <AccordionTrigger className="text-left text-sm font-semibold text-gray-900 dark:text-white hover:text-[#c7511f] hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
