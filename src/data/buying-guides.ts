import { BuyingGuide } from '@/lib/types';

export const buyingGuides: BuyingGuide[] = [
  {
    id: '1',
    slug: 'best-espresso-machine',
    title: 'Best Espresso Machine for 2026: Our Top Picks',
    excerpt: 'Our comprehensive guide to finding the perfect espresso machine for your home, budget, and brewing style.',
    image: '/images/guide-espresso.jpg',
    category: 'Espresso Machines',
    categorySlug: 'espresso-machines',
    introduction: `Choosing the right espresso machine can feel overwhelming with the sheer number of options available. Whether you're a complete beginner looking for your first machine or an experienced home barista ready to upgrade, this guide will help you find the perfect match.

We've spent hundreds of hours testing espresso machines across every price range and skill level. Our recommendations are based on real-world performance, not just specs on paper. Every machine on this list has been used daily for at least two weeks before we form our final opinion.`,
    recommendedProducts: ['breville-barista-express', 'delonghi-la-specialista', 'breville-barista-touch', 'nicos-presso'],
    comparisonData: [
      { feature: 'Price', values: { 'Barista Express': '$699', 'La Specialista': '$600', 'Barista Touch': '$999', "Nico's Presso": '$150' } },
      { feature: 'Built-in Grinder', values: { 'Barista Express': 'Yes', 'La Specialista': 'Yes', 'Barista Touch': 'Yes', "Nico's Presso": 'No' } },
      { feature: 'Milk Frothing', values: { 'Barista Express': 'Manual', 'La Specialista': 'Manual', 'Barista Touch': 'Automatic', "Nico's Presso": 'None' } },
      { feature: 'Ease of Use', values: { 'Barista Express': 'Medium', 'La Specialista': 'Easy', 'Barista Touch': 'Very Easy', "Nico's Presso": 'Hard' } },
      { feature: 'Counter Space', values: { 'Barista Express': 'Large', 'La Specialista': 'Medium', 'Barista Touch': 'Large', "Nico's Presso": 'Small' } },
      { feature: 'Best For', values: { 'Barista Express': 'All-around', 'La Specialista': 'Beginners', 'Barista Touch': 'Convenience', "Nico's Presso": 'Travel' } },
    ],
    decisionGuide: [
      {
        useCase: 'First espresso machine, want to learn',
        recommendation: 'Breville Barista Express',
        reason: 'The built-in grinder and clear controls make it the best learning platform. You can grow into it.',
      },
      {
        useCase: 'Want great espresso with minimal effort',
        recommendation: 'Breville Barista Touch',
        reason: 'Touchscreen and automatic milk frothing mean café-quality drinks with almost no learning curve.',
      },
      {
        useCase: 'On a tight budget',
        recommendation: "Nico's Presso + Baratza Encore",
        reason: 'Manual espresso maker paired with a reliable entry-level grinder gives you great shots for under $300.',
      },
      {
        useCase: 'Small kitchen or limited counter space',
        recommendation: "De'Longhi La Specialista",
        reason: 'More compact than the Breville options with smart tamping that reduces the skill needed.',
      },
      {
        useCase: 'Travel or camping',
        recommendation: "Nico's Presso",
        reason: 'No electricity needed, compact, and produces surprisingly good espresso on the go.',
      },
    ],
    faq: [
      {
        question: 'Do I need a built-in grinder?',
        answer: "A built-in grinder is convenient and saves counter space, but separate grinders often deliver better consistency. If budget allows, a dedicated grinder like the Fellow Ode or Baratza Encore paired with a machine without a grinder can produce superior results.",
      },
      {
        question: "What's the difference between semi-automatic and automatic?",
        answer: 'Semi-automatic machines require you to start and stop the extraction, giving you more control. Automatic machines stop the shot at a preset volume. Super-automatic machines handle everything from grinding to brewing at the push of a button.',
      },
      {
        question: 'How much should I spend on my first espresso machine?',
        answer: "We recommend spending at least $300-500 for a quality entry-level machine. Cheaper machines often produce inconsistent results and can be frustrating. If you're serious about espresso, the $500-1000 range offers the best balance of quality and value.",
      },
      {
        question: 'Can I make latte art with these machines?',
        answer: 'Yes, all the machines in this guide except the Nico\'s Presso have steam wands capable of producing microfoam for latte art. The Barista Touch makes it easiest with automatic milk texturing.',
      },
    ],
    updatedAt: '2026-02-01',
    authorSlug: 'sarah-mitchell',
  },
  {
    id: '2',
    slug: 'best-coffee-grinder',
    title: 'Best Coffee Grinder for 2026: Burr Grinders Ranked',
    excerpt: 'A great grinder is the most important investment in your coffee setup. Here are our top picks for every budget.',
    image: '/images/guide-grinders.jpg',
    category: 'Coffee Grinders',
    categorySlug: 'coffee-grinders',
    introduction: `If there's one piece of coffee equipment worth investing in, it's your grinder. A good grinder has more impact on cup quality than any other single piece of equipment — even the coffee maker itself.

The difference between pre-ground coffee and freshly ground beans is night and day. And within fresh grinding, the consistency of your grind determines how evenly your coffee extracts, which directly affects flavor.

We've tested over 20 grinders across every price range to find the best options for every type of coffee drinker.`,
    recommendedProducts: ['fellow-ode-grinder', 'baratza-encore', 'breville-smart-grinder'],
    comparisonData: [
      { feature: 'Price', values: { 'Fellow Ode Gen 2': '$299', 'Baratza Encore': '$149', 'Smart Grinder Pro': '$200' } },
      { feature: 'Burr Type', values: { 'Fellow Ode Gen 2': '64mm Flat (SSP)', 'Baratza Encore': '40mm Conical', 'Smart Grinder Pro': '40mm Conical' } },
      { feature: 'Grind Settings', values: { 'Fellow Ode Gen 2': '31+', 'Baratza Encore': '40', 'Smart Grinder Pro': '60' } },
      { feature: 'Espresso Capable', values: { 'Fellow Ode Gen 2': 'No', 'Baratza Encore': 'Partial', 'Smart Grinder Pro': 'Yes' } },
      { feature: 'Anti-Static', values: { 'Fellow Ode Gen 2': 'Yes', 'Baratza Encore': 'No', 'Smart Grinder Pro': 'No' } },
      { feature: 'Best For', values: { 'Fellow Ode Gen 2': 'Pour-over/Brew', 'Baratza Encore': 'Entry-level', 'Smart Grinder Pro': 'All-around' } },
    ],
    decisionGuide: [
      {
        useCase: 'Only brew pour-over or drip',
        recommendation: 'Fellow Ode Gen 2',
        reason: 'The best brew-only grinder in its class with 64mm SSP burrs and anti-static technology.',
      },
      {
        useCase: 'First burr grinder on a budget',
        recommendation: 'Baratza Encore',
        reason: 'Proven reliability and consistent grinds at the most accessible price point.',
      },
      {
        useCase: 'Use multiple brew methods including espresso',
        recommendation: 'Breville Smart Grinder Pro',
        reason: '60 settings from espresso to French press with digital dosing.',
      },
    ],
    faq: [
      {
        question: 'Why are burr grinders better than blade grinders?',
        answer: 'Burr grinders crush beans between two surfaces for consistent particle size, while blade grinders chop beans randomly, creating uneven particles that extract at different rates. This uneven extraction leads to bitter, sour, or muddy-tasting coffee.',
      },
      {
        question: 'Do I need an espresso-grade grinder?',
        answer: "Only if you make espresso. Espresso requires very fine, very consistent grounds. If you primarily brew pour-over, drip, or French press, a brew-focused grinder like the Fellow Ode will serve you better at a lower price.",
      },
      {
        question: 'How often should I clean my grinder?',
        answer: 'Light cleaning (brushing out retained grounds) should be done weekly. Deep cleaning with grinder cleaning pellets or disassembly should be done every 1-3 months depending on usage.',
      },
    ],
    updatedAt: '2026-01-25',
    authorSlug: 'sarah-mitchell',
  },
  {
    id: '3',
    slug: 'best-pour-over-setup',
    title: 'Best Pour-Over Coffee Setup for 2026',
    excerpt: 'Build the perfect pour-over coffee station with our expert-curated setup guide, from drippers to kettles and grinders.',
    image: '/images/guide-best-pour-over-setup.jpg',
    category: 'Pour-Over & Drip',
    categorySlug: 'pour-over-drip',
    introduction: `Pour-over coffee is more than just a brewing method — it's a ritual. The slow, deliberate process of heating water, grinding fresh beans, and carefully pouring in concentric circles produces some of the cleanest, most nuanced coffee you can make at home. But to get the best results, you need the right equipment working together.

A great pour-over setup isn't just about buying the most expensive dripper. It's about how your grinder, kettle, and dripper work together to produce an even extraction. The wrong grinder can create uneven particles that lead to bitter or sour cups, and a standard kettle makes it nearly impossible to control your pour rate.

We've tested dozens of combinations to find the setups that produce the best cups across different budgets and skill levels. Whether you're just getting started with pour-over or looking to upgrade your entire station, this guide will help you build the perfect setup.`,
    recommendedProducts: ['chemex-classic', 'hario-v60', 'fellow-ode-grinder', 'fellow-stagg-ekettle'],
    comparisonData: [
      { feature: 'Brew Method', values: { 'Chemex Classic': 'Full immersion pour-over', 'Hario V60': 'Continuous pour-over', 'Fellow Ode Gen 2': 'N/A (Grinder)', 'Fellow Stagg EKG': 'N/A (Kettle)' } },
      { feature: 'Filter Type', values: { 'Chemex Classic': 'Proprietary bonded paper', 'Hario V60': 'Standard V60 paper', 'Fellow Ode Gen 2': 'N/A', 'Fellow Stagg EKG': 'N/A' } },
      { feature: 'Capacity', values: { 'Chemex Classic': '8 cups / 40 oz', 'Hario V60': '1-4 cups', 'Fellow Ode Gen 2': '80g hopper', 'Fellow Stagg EKG': '30 oz / 0.9L' } },
      { feature: 'Skill Level', values: { 'Chemex Classic': 'Beginner-Intermediate', 'Hario V60': 'Intermediate-Advanced', 'Fellow Ode Gen 2': 'All levels', 'Fellow Stagg EKG': 'All levels' } },
      { feature: 'Brew Time', values: { 'Chemex Classic': '4-5 minutes', 'Hario V60': '2-3 minutes', 'Fellow Ode Gen 2': 'N/A', 'Fellow Stagg EKG': 'N/A' } },
      { feature: 'Price Range', values: { 'Chemex Classic': '$45-$55', 'Hario V60': '$20-$30', 'Fellow Ode Gen 2': '$299', 'Fellow Stagg EKG': '$195' } },
    ],
    decisionGuide: [
      {
        useCase: 'Best for beginners',
        recommendation: 'Hario V60',
        reason: 'The Hario V60 is affordable, forgiving, and has endless tutorial resources online. At under $25, it\'s the lowest-risk way to start your pour-over journey.',
      },
      {
        useCase: 'Best for serving guests',
        recommendation: 'Chemex Classic',
        reason: 'The Chemex brews up to 8 cups at once and doubles as a beautiful serving carafe. Your guests will be impressed by both the coffee and the presentation.',
      },
      {
        useCase: 'Best for precise control',
        recommendation: 'Hario V60 + Fellow Stagg EKG',
        reason: 'The V60\'s spiral ridges and the Stagg EKG\'s gooseneck spout give you maximum control over pour rate and extraction. This is the competition barista\'s choice.',
      },
      {
        useCase: 'Best budget setup',
        recommendation: 'Hario V60 + Baratza Encore',
        reason: 'For under $175 total, you get a great dripper and a reliable entry-level grinder. The Encore produces consistent enough grounds for excellent pour-over, and the V60 is unbeatable at its price.',
      },
      {
        useCase: 'Best premium setup',
        recommendation: 'Chemex + Fellow Ode + Fellow Stagg',
        reason: 'The ultimate pour-over station. The Ode Gen 2\'s 64mm SSP burrs produce the most uniform grounds, the Stagg EKG gives you degree-perfect temperature control, and the Chemex delivers the cleanest cup possible.',
      },
    ],
    faq: [
      {
        question: 'Do I really need a gooseneck kettle for pour-over?',
        answer: 'While you can technically brew pour-over with any kettle, a gooseneck kettle gives you the precise flow control needed for even extraction. Standard kettles pour too fast, causing channeling and uneven brewing. If you\'re serious about pour-over, a gooseneck is essential.',
      },
      {
        question: 'What\'s the ideal water temperature for pour-over coffee?',
        answer: 'The sweet spot is 195-205°F (90-96°C), which is just below boiling. Light roasts benefit from the higher end of this range, while darker roasts do better at the lower end. A variable temperature kettle like the Fellow Stagg EKG lets you dial this in precisely.',
      },
      {
        question: 'How fine should I grind for pour-over coffee?',
        answer: 'Pour-over works best with a medium-fine grind — about the consistency of sea salt. Too fine and the water drains too slowly, causing over-extraction and bitterness. Too coarse and the water runs through too quickly, producing weak, sour coffee.',
      },
      {
        question: 'Chemex vs Hario V60: Which should I choose?',
        answer: 'It depends on your needs. The Chemex uses thicker filters that produce a cleaner, brighter cup and brews multiple servings. The V60 is better for single cups and offers more control over extraction. Many coffee enthusiasts own both for different occasions.',
      },
      {
        question: 'How much coffee should I use per cup?',
        answer: 'We recommend a 1:15 to 1:17 coffee-to-water ratio by weight. For a single 12oz cup, that\'s about 22g of coffee to 340g of water. Investing in a small kitchen scale will dramatically improve your consistency.',
      },
    ],
    updatedAt: '2026-02-10',
    authorSlug: 'james-carter',
  },
  {
    id: '4',
    slug: 'best-grinder-brew-method',
    title: 'Best Coffee Grinder for Your Brew Method in 2026',
    excerpt: 'Not all grinders are created equal. Find the perfect grinder matched to how you actually brew your coffee.',
    image: '/images/guide-best-grinder-brew-method.jpg',
    category: 'Coffee Grinders',
    categorySlug: 'coffee-grinders',
    introduction: `Choosing a coffee grinder isn't just about picking the highest-rated model — it's about finding the right tool for how you brew. A grinder that's perfect for espresso might be overkill (and underperforming) for French press, and a budget grinder might surprise you with how well it handles pour-over.

The key factor is grind consistency at the size you need most. Espresso requires extremely fine, uniform particles. Pour-over needs medium-fine consistency. French press demands even coarse grounds. No single grinder does everything equally well, which is why matching your grinder to your primary brew method is so important.

We've evaluated the top grinders specifically in the context of different brew methods. Our recommendations consider not just grind quality, but also ease of use, retention, static, and overall value for each brewing style.`,
    recommendedProducts: ['fellow-ode-grinder', 'baratza-encore', 'breville-smart-grinder', 'oxo-brew-grinder'],
    comparisonData: [
      { feature: 'Burr Type', values: { 'Fellow Ode Gen 2': '64mm Flat (SSP)', 'Baratza Encore': '40mm Conical', 'Breville Smart Grinder Pro': '40mm Conical (SS)', 'OXO Brew Grinder': '40mm Conical (SS)' } },
      { feature: 'Grind Settings', values: { 'Fellow Ode Gen 2': '31+ steps', 'Baratza Encore': '40 steps', 'Breville Smart Grinder Pro': '60 steps', 'OXO Brew Grinder': '15 steps + micro' } },
      { feature: 'Bean Hopper', values: { 'Fellow Ode Gen 2': '80g (single dose)', 'Baratza Encore': '227g', 'Breville Smart Grinder Pro': '450g', 'OXO Brew Grinder': '340g' } },
      { feature: 'Wattage', values: { 'Fellow Ode Gen 2': '140W', 'Baratza Encore': '130W', 'Breville Smart Grinder Pro': '165W', 'OXO Brew Grinder': '140W' } },
      { feature: 'Best For', values: { 'Fellow Ode Gen 2': 'Pour-over / Brew', 'Baratza Encore': 'Entry-level all-around', 'Breville Smart Grinder Pro': 'Multi-method / Espresso', 'OXO Brew Grinder': 'Value all-around' } },
      { feature: 'Price', values: { 'Fellow Ode Gen 2': '$299', 'Baratza Encore': '$149', 'Breville Smart Grinder Pro': '$200', 'OXO Brew Grinder': '$100' } },
    ],
    decisionGuide: [
      {
        useCase: 'Pour-over specialist',
        recommendation: 'Fellow Ode Gen 2',
        reason: 'The 64mm SSP flat burrs produce the most uniform medium-fine grounds of any grinder in this lineup. Anti-static technology means less mess, and the single-dose design eliminates stale coffee retention.',
      },
      {
        useCase: 'Budget first grinder',
        recommendation: 'Baratza Encore',
        reason: 'Proven reliability, consistent results, and excellent customer support make the Encore the safest first grinder purchase. It handles all brew methods respectably and costs less than $150.',
      },
      {
        useCase: 'Multi-method brewer',
        recommendation: 'Breville Smart Grinder Pro',
        reason: 'With 60 grind settings spanning espresso to French press and digital dosing, the Smart Grinder Pro is the most versatile option. One grinder for every brew method in your kitchen.',
      },
      {
        useCase: 'Best value for money',
        recommendation: 'OXO Brew Grinder',
        reason: 'At $100, the OXO delivers surprisingly consistent grinds with stainless steel conical burrs and a convenient one-touch start. It punches well above its price class for pour-over and drip brewing.',
      },
      {
        useCase: 'Espresso enthusiast',
        recommendation: 'Breville Smart Grinder Pro',
        reason: 'The only grinder in this lineup with enough fine adjustment for espresso. While not as precise as dedicated espresso grinders costing $400+, it produces acceptable espresso grounds for home use.',
      },
    ],
    faq: [
      {
        question: 'Why does brew method matter when choosing a grinder?',
        answer: 'Different brew methods require different grind sizes and levels of consistency. Espresso needs extremely fine, uniform grounds for proper extraction under pressure. French press needs coarse, even grounds to avoid over-extraction and sludge. A grinder optimized for one may not excel at another.',
      },
      {
        question: 'Can one grinder handle all brew methods?',
        answer: 'The Breville Smart Grinder Pro comes closest with 60 settings from espresso to French press. However, grinders that try to do everything often sacrifice consistency at any one size. If you primarily brew one method, a specialized grinder will give you better results.',
      },
      {
        question: 'Is a more expensive grinder always better?',
        answer: 'Not necessarily. The OXO Brew Grinder at $100 produces very good results for pour-over and drip. The law of diminishing returns kicks in hard with grinders — the jump from a blade grinder to the OXO is enormous, while the jump from the OXO to the Fellow Ode is noticeable but smaller.',
      },
      {
        question: 'What is "grind retention" and why does it matter?',
        answer: 'Grind retention refers to coffee grounds that stay inside the grinder chute after grinding. These stale grounds can mix with fresh grounds, affecting flavor. The Fellow Ode Gen 2 minimizes retention with its single-dose design, while the Baratza Encore has moderate retention that requires periodic purging.',
      },
      {
        question: 'How often should I replace my grinder burrs?',
        answer: 'Steel burrs typically last 500-1000 lbs of coffee (3-5 years of home use). The Fellow Ode\'s SSP burrs are rated for significantly longer. Dull burrs produce inconsistent grinds and more fines, so replacing them when you notice declining quality is important.',
      },
    ],
    updatedAt: '2026-02-05',
    authorSlug: 'sarah-mitchell',
  },
  {
    id: '5',
    slug: 'best-manual-brewing-kit',
    title: 'Best Manual Coffee Brewing Kit for 2026',
    excerpt: 'From French press to AeroPress, discover the best manual brewing methods that deliver incredible coffee without electricity.',
    image: '/images/guide-best-manual-brewing-kit.jpg',
    category: 'French Press',
    categorySlug: 'french-press',
    introduction: `There's something deeply satisfying about manual coffee brewing. No electricity, no complicated settings — just you, hot water, and great coffee. Manual brewing methods are not only more affordable than electric machines, but they also give you a deeper connection to the brewing process and a better understanding of how each variable affects your cup.

Manual brewers are also incredibly versatile. The AeroPress can make everything from espresso-like shots to cold brew in under two minutes. The French press produces rich, full-bodied coffee that no electric drip machine can match. And the Hario V60 offers competition-level precision for a fraction of the cost of an espresso setup.

Whether you're building a travel kit, simplifying your morning routine, or just want to experience coffee in its purest form, this guide covers the best manual brewing options and helps you choose the right one for your lifestyle.`,
    recommendedProducts: ['french-press-bodum', 'aeropress-original', 'nicos-presso', 'hario-v60'],
    comparisonData: [
      { feature: 'Brew Method', values: { 'Bodum French Press': 'Immersion', 'AeroPress Original': 'Pressure/Immersion', "Nico's Presso": 'Manual Espresso', 'Hario V60': 'Pour-over' } },
      { feature: 'Portability', values: { 'Bodum French Press': 'Low (fragile glass)', 'AeroPress Original': 'Excellent', "Nico's Presso": 'Very Good', 'Hario V60': 'Good' } },
      { feature: 'Brew Time', values: { 'Bodum French Press': '4 minutes', 'AeroPress Original': '1-2 minutes', "Nico's Presso": '2-3 minutes', 'Hario V60': '2-3 minutes' } },
      { feature: 'Skill Level', values: { 'Bodum French Press': 'Easy', 'AeroPress Original': 'Easy-Intermediate', "Nico's Presso": 'Advanced', 'Hario V60': 'Intermediate' } },
      { feature: 'Clean Up', values: { 'Bodum French Press': 'Moderate', 'AeroPress Original': 'Very Easy', "Nico's Presso": 'Easy', 'Hario V60': 'Easy' } },
      { feature: 'Price', values: { 'Bodum French Press': '$35', 'AeroPress Original': '$40', "Nico's Presso": '$150', 'Hario V60': '$23' } },
    ],
    decisionGuide: [
      {
        useCase: 'Best for camping/travel',
        recommendation: 'AeroPress',
        reason: 'The AeroPress is nearly indestructible, requires minimal cleanup, and brews everything from strong shots to smooth cups in under 2 minutes. It\'s the gold standard for coffee on the go.',
      },
      {
        useCase: 'Best for rich, full-bodied coffee',
        recommendation: 'Bodum French Press',
        reason: 'No other manual method produces the thick, syrupy body of a French press. The metal mesh filter allows natural coffee oils to pass through, creating a cup with unmatched mouthfeel and richness.',
      },
      {
        useCase: 'Best for espresso purists',
        recommendation: "Nico's Presso",
        reason: 'The Nico\'s Presso is the only manual option here that produces genuine espresso with crema. The lever mechanism gives you full control over pressure and pre-infusion for shots that rival electric machines.',
      },
      {
        useCase: 'Best for single-cup precision',
        recommendation: 'Hario V60',
        reason: 'The V60 gives you complete control over every variable — water temperature, pour rate, brew time, and ratio. It\'s the choice of world championship baristas for a reason.',
      },
      {
        useCase: 'Best overall manual kit',
        recommendation: 'AeroPress + French Press combo',
        reason: 'These two brewers complement each other perfectly. The AeroPress handles quick, clean single cups and travel, while the French Press delivers rich, full pots for weekends and guests. Together they cover every manual brewing need for under $75.',
      },
    ],
    faq: [
      {
        question: 'Do I need a gooseneck kettle for manual brewing?',
        answer: 'It depends on the method. For the Hario V60, a gooseneck kettle is strongly recommended for pour control. For French press and AeroPress, any kettle works fine since you\'re pouring all the water in at once. The Nico\'s Presso also doesn\'t require a gooseneck.',
      },
      {
        question: 'Can I make espresso with manual brewers?',
        answer: 'True espresso requires 9 bars of pressure, which most manual brewers can\'t achieve. The Nico\'s Presso is the exception — it can generate up to 10 bars of pressure manually. The AeroPress produces a strong, concentrated coffee that\'s espresso-like but not technically espresso.',
      },
      {
        question: 'Which manual brewer is easiest to clean?',
        answer: 'The AeroPress wins hands down. Just pop the puck of grounds and rinse — the entire cleanup takes about 10 seconds. The French press requires more disassembly and careful washing of the mesh filter. The V60 simply requires removing and discarding the paper filter.',
      },
      {
        question: 'Is manual brewing better than electric machines?',
        answer: '"Better" depends on what you value. Manual brewing gives you more control, costs less, and can produce exceptional coffee. Electric machines offer convenience and consistency. Many coffee enthusiasts use both — manual for weekends and special cups, electric for busy mornings.',
      },
      {
        question: 'What grind size should I use for each method?',
        answer: 'French press: coarse (like raw sugar). AeroPress: medium-fine to fine (depending on recipe). Hario V60: medium-fine (like table salt). Nico\'s Presso: fine (like powdered sugar, similar to espresso). Always grind fresh for the best results.',
      },
    ],
    updatedAt: '2026-01-28',
    authorSlug: 'james-carter',
  },
];

export function getBuyingGuideBySlug(slug: string): BuyingGuide | undefined {
  return buyingGuides.find(g => g.slug === slug);
}

export function getBuyingGuidesByCategory(categorySlug: string): BuyingGuide[] {
  return buyingGuides.filter(g => g.categorySlug === categorySlug);
}
