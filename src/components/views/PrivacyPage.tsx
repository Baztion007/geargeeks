'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { Separator } from '@/components/ui/separator';
import { Shield, Eye, Cookie, Database, Lock, ExternalLink } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#131921] to-[#37475a] p-8 md:p-12 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-10 h-10 text-[#febd69]" />
              <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-lg text-gray-300 max-w-3xl">
              Your privacy is important to us. This policy explains how BrewHub Reviews collects,
              uses, and protects your information.
            </p>
            <p className="text-sm text-gray-400 mt-3">Last updated: March 1, 2026</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 mb-6">
          {/* Introduction */}
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            BrewHub Reviews (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information
            when you visit our website brewhubreviews.com (the &quot;Site&quot;). Please read this policy
            carefully. If you do not agree with the terms of this privacy policy, please do not
            access the Site.
          </p>

          <Separator className="my-8" />

          {/* Information Collection */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-[#007185]" />
              <h2 className="text-2xl font-bold text-gray-900">1. Information We Collect</h2>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Personal Information</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We may collect personal information that you voluntarily provide to us when you:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
              <li>Fill out a contact form on our Site</li>
              <li>Subscribe to our newsletter</li>
              <li>Leave a comment or review</li>
              <li>Participate in surveys or promotions</li>
              <li>Communicate with us via email or other channels</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              This information may include your name, email address, phone number, and any other
              information you choose to provide.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Automatically Collected Information</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              When you visit our Site, we may automatically collect certain information about your
              device and usage, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
              <li>IP address and approximate geographic location</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Referring website addresses</li>
              <li>Pages visited and time spent on each page</li>
              <li>Links clicked and products viewed</li>
              <li>Date and time of visits</li>
            </ul>
          </section>

          <Separator className="my-8" />

          {/* Use of Information */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-[#007185]" />
              <h2 className="text-2xl font-bold text-gray-900">2. How We Use Your Information</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
              <li>To respond to your inquiries and provide customer support</li>
              <li>To send you newsletters and marketing communications (with your consent)</li>
              <li>To improve our website, content, and user experience</li>
              <li>To analyze usage trends and optimize our Site&apos;s performance</li>
              <li>To detect, prevent, and address technical issues and security threats</li>
              <li>To comply with legal obligations</li>
              <li>To personalize your experience and deliver relevant content</li>
            </ul>
          </section>

          <Separator className="my-8" />

          {/* Cookies */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="w-6 h-6 text-[#007185]" />
              <h2 className="text-2xl font-bold text-gray-900">3. Cookies and Tracking Technologies</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to track activity on our Site and
              hold certain information. Cookies are small data files stored on your device. We use
              the following types of cookies:
            </p>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-100 dark:border-gray-600">
                <h4 className="font-semibold text-gray-900 mb-1">Essential Cookies</h4>
                <p className="text-sm text-gray-600">
                  Required for the Site to function properly. These cannot be disabled.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-100 dark:border-gray-600">
                <h4 className="font-semibold text-gray-900 mb-1">Analytics Cookies</h4>
                <p className="text-sm text-gray-600">
                  Help us understand how visitors interact with our Site by collecting and reporting
                  information anonymously. We use Google Analytics to collect this data.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-100 dark:border-gray-600">
                <h4 className="font-semibold text-gray-900 mb-1">Affiliate Cookies</h4>
                <p className="text-sm text-gray-600">
                  When you click on an Amazon affiliate link, a cookie is set on your device to track
                  any purchases you make. This allows us to receive a commission at no extra cost to
                  you. Amazon&apos;s cookie typically lasts 24 hours.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-100 dark:border-gray-600">
                <h4 className="font-semibold text-gray-900 mb-1">Advertising Cookies</h4>
                <p className="text-sm text-gray-600">
                  Used to deliver advertisements that are relevant to you. These cookies may be set
                  by third-party advertising partners.
                </p>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is
              being sent. However, if you do not accept cookies, some portions of our Site may not
              function properly.
            </p>
          </section>

          <Separator className="my-8" />

          {/* Third-Party Services */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <ExternalLink className="w-6 h-6 text-[#007185]" />
              <h2 className="text-2xl font-bold text-gray-900">4. Third-Party Services</h2>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-3">Amazon Associates Program</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              BrewHub Reviews participates in the Amazon Services LLC Associates Program. When you
              click on an Amazon affiliate link on our Site, you will be redirected to Amazon.com.
              Amazon may set cookies on your device and collect information about your browsing and
              purchasing behavior. Please refer to{' '}
              <a
                href="https://www.amazon.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#007185] hover:text-[#c7511f] hover:underline inline-flex items-center gap-1"
              >
                Amazon&apos;s Privacy Notice
                <ExternalLink size={12} />
              </a>{' '}
              for more information about their data practices.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Google Analytics</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We use Google Analytics to analyze website traffic and usage patterns. Google Analytics
              collects information anonymously and reports website trends without identifying
              individual visitors. For more information, see{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#007185] hover:text-[#c7511f] hover:underline inline-flex items-center gap-1"
              >
                Google&apos;s Privacy Policy
                <ExternalLink size={12} />
              </a>
              .
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Other Third-Party Services</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We may use other third-party services that collect, monitor, and analyze data. These
              may include email service providers, advertising networks, and social media platforms.
              Each third-party service has its own privacy policy, and we encourage you to review
              their policies.
            </p>
          </section>

          <Separator className="my-8" />

          {/* Data Protection */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-[#007185]" />
              <h2 className="text-2xl font-bold text-gray-900">5. Data Protection</h2>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-3">Data Security</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We implement appropriate technical and organizational security measures to protect your
              personal information against unauthorized access, alteration, disclosure, or destruction.
              However, no method of transmission over the Internet or method of electronic storage is
              100% secure.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Data Retention</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We retain your personal information only for as long as necessary to fulfill the purposes
              outlined in this Privacy Policy, unless a longer retention period is required by law.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Your Rights</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
              <li>The right to access your personal data</li>
              <li>The right to rectify inaccurate personal data</li>
              <li>The right to erasure (&quot;right to be forgotten&quot;)</li>
              <li>The right to restrict processing</li>
              <li>The right to data portability</li>
              <li>The right to object to processing</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              To exercise any of these rights, please contact us at{' '}
              <a
                href="mailto:privacy@brewhubreviews.com"
                className="text-[#007185] hover:text-[#c7511f] hover:underline"
              >
                privacy@brewhubreviews.com
              </a>
              .
            </p>
          </section>

          <Separator className="my-8" />

          {/* Additional Sections */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Children&apos;s Privacy</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              Our Site is not intended for children under the age of 13. We do not knowingly collect
              personal information from children under 13. If we become aware that we have collected
              personal information from a child under 13 without verification of parental consent,
              we will take steps to remove that information.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Changes to This Policy</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              We may update this Privacy Policy from time to time. The updated version will be
              indicated by an updated &quot;Last Updated&quot; date. We encourage you to review this Privacy
              Policy periodically for any changes.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If you have any questions or concerns about this Privacy Policy, please contact us at:{' '}
              <a
                href="mailto:privacy@brewhubreviews.com"
                className="text-[#007185] hover:text-[#c7511f] hover:underline"
              >
                privacy@brewhubreviews.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
