'use client';

import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (result.success) {
        setSubmitted(true);
      } else {
        setSubmitError(result.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Contact Form — full width */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
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
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-200">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your name"
                    required
                    className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 focus:border-[#007185] focus:ring-[#007185]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 focus:border-[#007185] focus:ring-[#007185]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-gray-700 dark:text-gray-200">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="What's this about?"
                  className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 focus:border-[#007185] focus:ring-[#007185]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-700 dark:text-gray-200">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us what's on your mind..."
                  rows={8}
                  required
                  className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 focus:border-[#007185] focus:ring-[#007185] resize-none"
                />
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Fields marked with * are required. We&apos;ll never share your information with third parties.
              </p>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-bold px-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>Sending...</>
                ) : (
                  <><Send size={16} className="mr-2" />Send Message</>
                )}
              </Button>

              {submitError && (
                <p className="text-red-500 text-sm mt-2">{submitError}</p>
              )}
            </form>
          )}
        </div>


      </div>
    </div>
  );
}
