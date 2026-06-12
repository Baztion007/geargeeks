import { BuyingGuide } from '@/lib/types';
import { assetUrl } from '@/lib/utils';

export const buyingGuides: BuyingGuide[] = [
  {
    id: '1',
    slug: 'best-travel-gadgets-2026',
    title: 'Best Travel Gadgets of 2026',
    excerpt: 'Our comprehensive guide to the tech essentials every traveler needs, from portable chargers to smart trackers and international adapters.',
    image: assetUrl('/images/guide-travel-gadgets.png'),
    category: 'Travel Gadgets',
    categorySlug: 'travel-gadgets',
    guideType: 'best-products',
    introduction: `Traveling without the right tech gear is like going on a road trip without a spare tire — you might be fine, but when things go wrong, you'll wish you'd prepared better. The right travel gadgets can mean the difference between a dead phone at a critical moment and a seamless, connected journey.

We've spent the past year testing travel tech across dozens of trips — short-haul business flights, week-long international vacations, rugged camping excursions, and everything in between. Every product in this guide has been evaluated in real travel conditions, not just on a lab bench.

The travel gadget landscape has evolved significantly. USB-C Power Delivery has made it possible to charge laptops from portable batteries, smart trackers leverage vast device networks for luggage tracking, and universal adapters now include fast USB-C charging. Here are the travel gadgets we actually pack on every trip.`,
    recommendedProducts: ['anker-737-power-bank', 'epicka-universal-adapter', 'apple-airtag-4-pack', 'glocalme-g4-hotspot', 'anker-523-powerport'],
    comparisonData: [
      { feature: 'Category', values: { 'Anker 737': 'Power Bank', 'Epicka Adapter': 'Wall Adapter', 'AirTag': 'Tracker', 'GlocalMe G4': 'Hotspot', 'Anker 523': 'Charger' } },
      { feature: 'Weight', values: { 'Anker 737': '1.4 lbs', 'Epicka Adapter': '0.25 lbs', 'AirTag': '0.39 oz', 'GlocalMe G4': '0.4 lbs', 'Anker 523': '0.35 lbs' } },
      { feature: 'Essential For', values: { 'Anker 737': 'Long flights', 'Epicka Adapter': 'International', 'AirTag': 'Checked bags', 'GlocalMe G4': 'No-WiFi zones', 'Anker 523': 'Daily charging' } },
      { feature: 'Flight Friendly', values: { 'Anker 737': 'Check airline', 'Epicka Adapter': 'Yes', 'AirTag': 'Yes', 'GlocalMe G4': 'Yes', 'Anker 523': 'Yes' } },
    ],
    decisionGuide: [
      {
        useCase: 'Long-haul flights with laptop work',
        recommendation: 'Anker 737 Power Bank',
        reason: 'The 24,000 mAh capacity and 140W output can fast-charge your laptop through an entire international flight, plus top off your phone afterward.',
      },
      {
        useCase: 'International multi-country trip',
        recommendation: 'Epicka Universal Travel Adapter',
        reason: 'One adapter covers 150+ countries with dual USB-C PD ports. Pair it with the Anker 523 for a complete charging setup.',
      },
      {
        useCase: 'Checking luggage regularly',
        recommendation: 'Apple AirTag 4-Pack',
        reason: 'Drop one in each checked bag and track them through the Find My network. Peace of mind for a minimal investment.',
      },
      {
        useCase: 'Working remotely abroad',
        recommendation: 'GlocalMe G4 Pro + Anker 737',
        reason: 'Reliable internet anywhere plus enough battery to keep your laptop running through a full workday without wall power.',
      },
      {
        useCase: 'Minimalist carry-on only',
        recommendation: 'Anker 523 PowerPort + Epicka Adapter',
        reason: 'One charger for all devices plus one adapter for all countries — two items replace five and keep your bag light.',
      },
    ],
    faq: [
      {
        question: 'Can I take the Anker 737 on a plane?',
        answer: 'The Anker 737 has a capacity of 86.4Wh, which is under the FAA limit of 100Wh for carry-on batteries. However, some international airlines have stricter limits. Always check with your specific airline before flying. It must be in your carry-on bag, never checked luggage.',
      },
      {
        question: 'Do I really need a travel-specific adapter?',
        answer: 'If you\'re traveling internationally, yes. Plug shapes differ across regions (US, UK, EU, AU types), and a universal adapter ensures you can plug in anywhere. The Epicka\'s built-in USB ports also eliminate the need for separate wall chargers for phones and tablets.',
      },
      {
        question: 'Are AirTags better than Tile for luggage tracking?',
        answer: 'For iPhone users, AirTags are significantly better because they leverage Apple\'s Find My network of hundreds of millions of devices. Tile\'s network is much smaller. For Android users, Tile or Samsung SmartTags are the better choice since AirTags don\'t work with Android.',
      },
    ],
    updatedAt: '2026-02-20',
    authorSlug: 'alex-rivera',
    readingTime: 12,
  },
  {
    id: '2',
    slug: 'best-carry-on-luggage',
    title: 'Best Carry-On Luggage for 2026',
    excerpt: 'Find the perfect carry-on for your travel style, from hardshell spinners to travel backpacks, with our tested and ranked recommendations.',
    image: assetUrl('/images/guide-best-carry-on-luggage.jpg'),
    category: 'Luggage',
    categorySlug: 'luggage',
    guideType: 'best-products',
    introduction: `Your carry-on luggage is arguably the most important travel purchase you'll make. It needs to survive airport handling, fit in overhead bins, organize your belongings, and ideally look good doing it. The wrong carry-on can turn a smooth trip into a frustrating ordeal of broken zippers, stuck wheels, and overweight fees.

We've tested over 30 carry-on options across thousands of travel miles, from budget spinners to premium hardshell cases and one-bag travel backpacks. Our recommendations cover different travel styles, budgets, and priorities.

The carry-on market has shifted significantly toward hardshell polycarbonate designs, which offer better protection and durability than softside alternatives. Meanwhile, the one-bag travel movement has popularized expandable travel backpacks that eliminate checked luggage entirely. Both approaches have merit, and we cover the best of each.`,
    recommendedProducts: ['samsonite-freeform-carry-on', 'monos-carry-on-plus', 'peak-design-travel-backpack'],
    comparisonData: [
      { feature: 'Type', values: { 'Samsonite Freeform': 'Hardshell Spinner', 'Monos Carry-On Plus': 'Hardshell Spinner', 'Peak Design 45L': 'Travel Backpack' } },
      { feature: 'Material', values: { 'Samsonite Freeform': 'Polycarbonate', 'Monos Carry-On Plus': 'Aerospace-Grade Polycarbonate', 'Peak Design 45L': 'Nylon Canvas + DWR' } },
      { feature: 'Weight', values: { 'Samsonite Freeform': '6.5 lbs', 'Monos Carry-On Plus': '7.5 lbs', 'Peak Design 45L': '3.8 lbs' } },
      { feature: 'Capacity', values: { 'Samsonite Freeform': '~38L', 'Monos Carry-On Plus': '~43L', 'Peak Design 45L': '35–45L' } },
      { feature: 'Best For', values: { 'Samsonite Freeform': 'All-around travel', 'Monos Carry-On Plus': 'Style + space', 'Peak Design 45L': 'One-bag travel' } },
    ],
    decisionGuide: [
      {
        useCase: 'Traditional air travel with overhead bin storage',
        recommendation: 'Samsonite Freeform Carry-On',
        reason: 'The lightest spinner in our lineup with proven durability, smooth wheels, and a built-in TSA lock. The best balance of features and value.',
      },
      {
        useCase: 'Longer trips needing maximum carry-on capacity',
        recommendation: 'Monos Carry-On Plus',
        reason: 'Slightly larger than standard carry-ons with antibacterial lining and premium Hinomoto wheels. Best for 5-7 day trips without checking a bag.',
      },
      {
        useCase: 'One-bag travel or multi-modal trips',
        recommendation: 'Peak Design Travel Backpack 45L',
        reason: 'The most versatile option — expandable for carry-on, compressible for under-seat, and comfortable to carry on trains, buses, and cobblestone streets where wheels fail.',
      },
    ],
    faq: [
      {
        question: 'What size carry-on is allowed on airlines?',
        answer: 'Most US domestic airlines allow carry-ons up to 22" x 14" x 9". International carriers are often smaller, typically around 21.6" x 15.7" x 7.8". Always check your specific airline\'s dimensions before flying, as fees for oversized carry-ons can be steep.',
      },
      {
        question: 'Hardshell or softside carry-on?',
        answer: 'Hardshell (polycarbonate) cases offer better protection for fragile items and are more water-resistant. Softside cases have exterior pockets for quick access and can squeeze into tight overhead bins more easily. For most travelers, we recommend hardshell for the superior durability.',
      },
      {
        question: 'Is a travel backpack better than a spinner suitcase?',
        answer: 'It depends on your travel style. Backpacks are better for multi-modal travel (trains, buses, walking), stairs, and uneven terrain. Spinners are better for airport-heavy travel with smooth floors. Many experienced travelers own both and choose based on the trip.',
      },
    ],
    updatedAt: '2026-02-15',
    authorSlug: 'alex-rivera',
    readingTime: 10,
  },
  {
    id: '3',
    slug: 'best-noise-cancelling-headphones',
    title: 'Best Noise Cancelling Headphones of 2026',
    excerpt: 'Our expert-tested guide to the best ANC headphones for travel, work, and everyday life, from Bose to Sony and beyond.',
    image: assetUrl('/images/guide-best-noise-cancelling-headphones.jpg'),
    category: 'Electronics',
    categorySlug: 'electronics',
    guideType: 'best-products',
    introduction: `Noise-cancelling headphones have become essential travel and work companions. Whether you're trying to sleep on a red-eye flight, focus in an open office, or simply enjoy your music without the world intruding, the right pair of ANC headphones can transform your daily experience.

The ANC headphone market has matured significantly. The gap between the top contenders has narrowed, and choosing between them now comes down to specific priorities: comfort, sound quality, noise cancellation strength, battery life, or ecosystem compatibility.

We've lived with the top noise-cancelling headphones for months, using them on flights, in offices, at home, and on commutes. Our recommendations reflect real-world performance, not just spec sheet comparisons.`,
    recommendedProducts: ['bose-qc-ultra-headphones', 'sony-wf1000xm5'],
    comparisonData: [
      { feature: 'Form Factor', values: { 'Bose QC Ultra': 'Over-Ear', 'Sony WF-1000XM5': 'True Wireless Earbuds' } },
      { feature: 'ANC Strength', values: { 'Bose QC Ultra': 'Best in Class', 'Sony WF-1000XM5': 'Best in Earbuds' } },
      { feature: 'Battery', values: { 'Bose QC Ultra': '24 Hours', 'Sony WF-1000XM5': '8h + 16h Case' } },
      { feature: 'Comfort', values: { 'Bose QC Ultra': 'Exceptional', 'Sony WF-1000XM5': 'Very Good' } },
      { feature: 'Sound Quality', values: { 'Bose QC Ultra': 'Warm, Smooth', 'Sony WF-1000XM5': 'Detailed, Bright' } },
      { feature: 'Portability', values: { 'Bose QC Ultra': 'Moderate (Folds)', 'Sony WF-1000XM5': 'Excellent (Pocket)' } },
    ],
    decisionGuide: [
      {
        useCase: 'Long-haul flights and all-day office use',
        recommendation: 'Bose QuietComfort Ultra',
        reason: 'The QC Ultra\'s unmatched comfort and best-in-class over-ear ANC make it ideal for extended wear. You can sleep in these on a plane, then wear them for a full workday without fatigue.',
      },
      {
        useCase: 'Commuting and everyday portability',
        recommendation: 'Sony WF-1000XM5',
        reason: 'The XM5 earbuds deliver outstanding ANC in a pocketable form factor. Perfect for commuters who don\'t want to carry a full-size headphone but still want premium noise cancellation.',
      },
      {
        useCase: 'Maximum noise cancellation regardless of form',
        recommendation: 'Bose QuietComfort Ultra',
        reason: 'Over-ear design inherently blocks more noise than earbuds, and Bose\'s ANC algorithms are the most effective we\'ve tested. For pure noise elimination, the QC Ultra wins.',
      },
    ],
    faq: [
      {
        question: 'Are noise-cancelling headphones worth it for travel?',
        answer: 'Absolutely. The reduction in fatigue from constant engine noise, cabin pressure, and passenger chatter is dramatic. Studies show that noise-cancelling headphones significantly reduce travel-related stress and improve sleep quality on flights. They\'re one of the best travel investments you can make.',
      },
      {
        question: 'Earbuds or over-ear for noise cancellation?',
        answer: 'Over-ear headphones provide stronger ANC because the ear cups physically block sound in addition to electronic cancellation. Earbuds are more portable and convenient. If ANC strength is your top priority, go over-ear. If portability matters more, high-end ANC earbuds like the Sony XM5 are surprisingly effective.',
      },
      {
        question: 'Can noise-cancelling headphones damage hearing?',
        answer: 'No. In fact, they can protect your hearing because you don\'t need to turn up the volume as high to overcome background noise. The ANC itself works by producing anti-noise waves that cancel out ambient sound — this is completely safe for your ears.',
      },
    ],
    updatedAt: '2026-02-18',
    authorSlug: 'alex-rivera',
    readingTime: 9,
  },
  {
    id: '4',
    slug: 'sony-vs-bose-headphones',
    title: 'Sony vs Bose: Which Headphones Are Better?',
    excerpt: 'The ultimate showdown between the two giants of noise-cancelling audio. We compare the Sony WF-1000XM5 and Bose QC Ultra across every metric.',
    image: assetUrl('/images/guide-sony-vs-bose-headphones.jpg'),
    category: 'Electronics',
    categorySlug: 'electronics',
    guideType: 'comparison',
    introduction: `Sony and Bose have been battling for noise-cancelling supremacy for nearly a decade. Each generation of their flagship products leapfrogs the other, and the current crop — Sony's WF-1000XM5 earbuds and Bose's QuietComfort Ultra headphones — represents the best each company has to offer.

But here's the thing: comparing these two is slightly apples-to-oranges because they're different form factors. The Sony XM5 are true wireless earbuds, while the Bose QC Ultra are over-ear headphones. However, many shoppers are deciding between these specific products because they represent the pinnacle of each form factor.

We've used both extensively — on flights, in offices, on commutes, and at home. Here's our detailed breakdown of where each excels and which one deserves your money.`,
    recommendedProducts: ['sony-wf1000xm5', 'bose-qc-ultra-headphones'],
    comparisonData: [
      { feature: 'ANC Strength', values: { 'Sony WF-1000XM5': '9/10 (earbuds)', 'Bose QC Ultra': '10/10 (over-ear)' } },
      { feature: 'Sound Quality', values: { 'Sony WF-1000XM5': '9.5/10', 'Bose QC Ultra': '8.5/10' } },
      { feature: 'Comfort (8h+)', values: { 'Sony WF-1000XM5': '7/10', 'Bose QC Ultra': '10/10' } },
      { feature: 'Portability', values: { 'Sony WF-1000XM5': '10/10', 'Bose QC Ultra': '6/10' } },
      { feature: 'Battery Life', values: { 'Sony WF-1000XM5': '8h + 16h', 'Bose QC Ultra': '24h' } },
      { feature: 'Call Quality', values: { 'Sony WF-1000XM5': '8/10', 'Bose QC Ultra': '7/10' } },
    ],
    decisionGuide: [
      {
        useCase: 'You prioritize sound quality above all else',
        recommendation: 'Sony WF-1000XM5',
        reason: 'Sony\'s LDAC codec support and the Dynamic Driver X produce more detailed, nuanced audio. If you listen to music critically, the Sony wins.',
      },
      {
        useCase: 'You prioritize comfort and ANC strength',
        recommendation: 'Bose QuietComfort Ultra',
        reason: 'The QC Ultra\'s featherlight clamping force and best-in-class over-ear ANC make it the comfort and silence champion. Nothing else comes close.',
      },
      {
        useCase: 'You commute and need pocketable audio',
        recommendation: 'Sony WF-1000XM5',
        reason: 'Earbuds fit in any pocket and are always with you. The Bose requires a dedicated bag or around-the-neck carry when not in use.',
      },
    ],
    faq: [
      {
        question: 'Which has better noise cancellation?',
        answer: 'The Bose QC Ultra has stronger overall noise cancellation because over-ear cups provide physical isolation that earbuds can\'t match. However, the Sony XM5 has the best ANC of any earbud available. For pure noise blocking, Bose wins. For ANC in a pocketable form, Sony is unmatched.',
      },
      {
        question: 'Can I use both and switch between them?',
        answer: 'Absolutely — many audio enthusiasts own both. Use the Bose for flights and all-day office work, and the Sony for commuting, exercise, and quick errands. Both support multipoint, so switching between phone and laptop is seamless with either.',
      },
      {
        question: 'Which lasts longer?',
        answer: 'The Bose has a longer single-charge battery life (24h vs 8h), but earbud batteries degrade faster over years of use due to the tiny cell size. The Bose should maintain good battery health for 3-4 years; the Sony earbuds may show degradation after 2-3 years of heavy use.',
      },
    ],
    updatedAt: '2026-02-12',
    authorSlug: 'alex-rivera',
    readingTime: 11,
  },
  {
    id: '5',
    slug: 'how-to-choose-travel-backpack',
    title: 'How to Choose a Travel Backpack',
    excerpt: 'Everything you need to know about choosing the right travel backpack, from capacity and carry-on compliance to materials and organization.',
    image: assetUrl('/images/guide-travel-backpack.jpg'),
    category: 'Travel Gear',
    categorySlug: 'travel-gear',
    guideType: 'category-guide',
    introduction: `Choosing a travel backpack is one of the most personal gear decisions you'll make. Unlike luggage, which mostly sits in overhead bins and hotel rooms, a travel backpack is with you every moment — on your back through airports, on trains, up stairs, and through crowded streets. The wrong backpack can make travel miserable; the right one makes you forget it's there.

The travel backpack market has exploded in recent years, with options ranging from $40 budget bags to $300+ premium designs. The sheer number of choices can be overwhelming, but the decision really comes down to a few key factors: capacity, carry-on compliance, comfort, and organization.

This guide walks you through each consideration with practical advice based on years of testing and real travel experience. Whether you're a weekend warrior or a full-time digital nomad, we'll help you find the right backpack for your travel style.`,
    recommendedProducts: ['peak-design-travel-backpack', 'bellroy-tech-kit'],
    comparisonData: [
      { feature: 'Category', values: { 'Peak Design 45L': 'Full Travel Backpack', 'Bellroy Tech Kit': 'Accessory Organizer' } },
      { feature: 'Capacity', values: { 'Peak Design 45L': '35–45L', 'Bellroy Tech Kit': '~2L' } },
      { feature: 'Best For', values: { 'Peak Design 45L': 'One-bag travel', 'Bellroy Tech Kit': 'Cable/charger organization' } },
      { feature: 'Use Together', values: { 'Peak Design 45L': 'Carries the Tech Kit inside', 'Bellroy Tech Kit': 'Organizes tech within the backpack' } },
    ],
    decisionGuide: [
      {
        useCase: 'Weekend trips (2-3 days)',
        recommendation: '30-40L backpack',
        reason: 'A 30-40L pack holds 2-3 days of clothing plus tech without being too large for carry-on. The Peak Design 45L at its compressed 35L setting is ideal.',
      },
      {
        useCase: 'Extended travel (1-2 weeks)',
        recommendation: '40-45L expandable backpack',
        reason: 'An expandable pack like the Peak Design 45L gives you flexibility — compressed for carry-on, expanded for longer trips. Pair with packing cubes for maximum efficiency.',
      },
      {
        useCase: 'Business travel with tech focus',
        recommendation: 'Laptop-focused travel pack + Tech Kit',
        reason: 'If you primarily carry a laptop and tech gear, prioritize laptop protection and organization. The Bellroy Tech Kit paired with any laptop-friendly pack keeps cables managed.',
      },
    ],
    faq: [
      {
        question: 'What capacity do I need for one-bag travel?',
        answer: 'For most travelers, 40-45L is the sweet spot for one-bag travel. This capacity fits carry-on size restrictions while holding enough for a week-long trip with proper packing. Under 35L is challenging for trips over a few days. Over 45L may exceed carry-on limits.',
      },
      {
        question: 'Should I get a front-loading or top-loading backpack?',
        answer: 'Front-loading (clamshell) is almost always better for travel. It opens like a suitcase, giving you full access to all your belongings at once. Top-loading packs are better for hiking but frustrating for travel because items at the bottom are hard to reach.',
      },
      {
        question: 'Is a travel backpack better than a suitcase?',
        answer: 'It depends on your travel style. Backpacks excel for multi-modal travel (flights + trains + walking), stairs, and cobblestone streets. Suitcases are better for resort vacations, heavy packers, and anyone with back issues. Many travelers use both depending on the trip.',
      },
    ],
    updatedAt: '2026-02-10',
    authorSlug: 'alex-rivera',
    readingTime: 8,
  },
  {
    id: '6',
    slug: 'is-anker-worth-it',
    title: 'Is Anker Worth It? A Brand Deep Dive',
    excerpt: 'We examine whether Anker\'s premium charging products live up to the hype and the price, from power banks to GaN chargers.',
    image: assetUrl('/images/guide-anker-brand.jpg'),
    category: 'Travel Gadgets',
    categorySlug: 'travel-gadgets',
    guideType: 'brand-review',
    introduction: `Anker has become the default recommendation for charging accessories, and for good reason — they make consistently good products at reasonable prices. But with growing competition from brands like Ugreen, Baseus, and Belkin, is Anker still worth the premium? We take a deep dive into two of their most popular products to find out.

Anker's rise has been remarkable. Starting with replacement laptop batteries on Amazon in 2011, the company has grown into a consumer electronics powerhouse. Their charging products — power banks, wall chargers, cables — are consistently among the best-selling and highest-rated in their categories on Amazon.

But best-selling doesn't always mean best. We've been testing Anker products alongside their competitors for years, and our assessment is nuanced. Anker is very good, but the value proposition depends on what you're buying and what alternatives you're considering.`,
    recommendedProducts: ['anker-737-power-bank', 'anker-523-powerport'],
    comparisonData: [
      { feature: 'Category', values: { 'Anker 737': 'Power Bank', 'Anker 523': 'Wall Charger' } },
      { feature: 'Output', values: { 'Anker 737': '140W USB-C', 'Anker 523': '65W USB-C' } },
      { feature: 'Technology', values: { 'Anker 737': 'Standard Li-Ion', 'Anker 523': 'GaN II' } },
      { feature: 'Best For', values: { 'Anker 737': 'Laptop charging on the go', 'Anker 523': 'One-charger travel setup' } },
    ],
    decisionGuide: [
      {
        useCase: 'You need to charge a laptop away from outlets',
        recommendation: 'Anker 737 Power Bank',
        reason: 'The 140W output is one of the highest available in a portable power bank. It can fast-charge MacBook Pros and other power-hungry laptops that cheaper banks simply can\'t handle.',
      },
      {
        useCase: 'You want one charger for all your devices',
        recommendation: 'Anker 523 PowerPort Cube',
        reason: 'The 65W GaN II charger replaces your laptop brick, phone charger, and tablet charger in one compact, foldable device. It\'s the only wall charger you need to pack.',
      },
      {
        useCase: 'Budget is your primary concern',
        recommendation: 'Consider Ugreen or Baseus alternatives',
        reason: 'Anker charges a brand premium of roughly 10-20%. Ugreen and Baseus offer similar specifications for less. The gap in quality and reliability has narrowed significantly.',
      },
    ],
    faq: [
      {
        question: 'Is Anker better than Ugreen?',
        answer: 'Anker has a slight edge in build quality, customer service, and brand reliability. Ugreen often matches or beats Anker on specifications at a lower price. For critical gear like power banks that you rely on while traveling, the Anker premium may be worth it. For a spare wall charger, Ugreen is perfectly fine.',
      },
      {
        question: 'How long do Anker power banks last?',
        answer: 'With regular use (charging 2-3 times per week), Anker power banks typically maintain good capacity for 2-3 years. The internal lithium batteries degrade over time regardless of brand. Anker\'s PowerCore series has a strong track record for longevity.',
      },
      {
        question: 'Is GaN really better than traditional chargers?',
        answer: 'Yes, GaN (Gallium Nitride) chargers are significantly smaller, run cooler, and are more efficient than traditional silicon-based chargers. The Anker 523\'s GaN II technology delivers 65W in a package that\'s less than half the size of older 60W laptop chargers. It\'s a genuine improvement, not just marketing.',
      },
    ],
    updatedAt: '2026-01-30',
    authorSlug: 'alex-rivera',
    readingTime: 7,
  },
];

export function getBuyingGuideBySlug(slug: string): BuyingGuide | undefined {
  return buyingGuides.find((g) => g.slug === slug);
}

export function getBuyingGuidesByCategory(categorySlug: string): BuyingGuide[] {
  return buyingGuides.filter((g) => g.categorySlug === categorySlug);
}
