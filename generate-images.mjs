import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = '/home/z/my-project/public/images';
const DELAY_MS = 3000; // 3 second delay between requests

const images = [
  // === REMAINING CATEGORY IMAGES ===
  { filename: 'category-fitness.jpg', prompt: 'Flat lay arrangement of fitness equipment including smart fitness tracker watch, massage gun, dumbbells, resistance bands, and water bottle, clean white background, professional product photography style, organized layout', size: '1344x768' },
  { filename: 'category-outdoor.jpg', prompt: 'Flat lay arrangement of outdoor and camping gear including portable camp stove, headlamp, water filter, multi-tool, and carabiner, clean white background, professional product photography style, organized layout', size: '1344x768' },
  { filename: 'category-audio.jpg', prompt: 'Flat lay arrangement of audio equipment including Bluetooth speaker, over-ear headphones, wireless earbuds, and DAC amplifier, clean white background, professional product photography style, organized layout, studio lighting', size: '1344x768' },
  { filename: 'category-luggage.jpg', prompt: 'Flat lay arrangement of premium carry-on luggage, packing cubes, luggage tag, and travel organizer, clean white background, professional product photography style, organized layout, bright even lighting', size: '1344x768' },

  // === BLOG IMAGES ===
  { filename: 'blog-ultimate-travel-tech-packing-list.jpg', prompt: 'Editorial lifestyle photo of travel tech packing scene with open suitcase revealing neatly organized gadgets cables and devices, warm lighting, premium magazine quality, shallow depth of field, inviting atmosphere', size: '1344x768' },
  { filename: 'blog-how-to-build-perfect-home-office.jpg', prompt: 'Editorial lifestyle photo of a perfect modern home office setup with large monitor ergonomic chair desk plants warm desk lamp and minimal decor, warm natural lighting from window, premium magazine quality, inviting workspace', size: '1344x768' },
  { filename: 'blog-earbuds-vs-headphones.jpg', prompt: 'Editorial lifestyle photo of wireless earbuds and over-ear headphones side by side for comparison, on a clean wooden desk with soft lighting, premium magazine quality, warm tones, shallow depth of field', size: '1344x768' },
  { filename: 'blog-5-recovery-tools-every-athlete.jpg', prompt: 'Editorial lifestyle photo of fitness recovery tools including foam roller massage gun compression sleeves and ice pack arranged artfully, warm lighting, premium magazine quality, athletic wellness aesthetic', size: '1344x768' },

  // === AUTHOR IMAGES ===
  { filename: 'author-alex.jpg', prompt: 'Professional headshot portrait photo of a young man in his 30s tech reviewer wearing casual smart outfit slight smile, clean light gray background, editorial style, soft studio lighting, confident and approachable look', size: '1024x1024' },
  { filename: 'author-maya.jpg', prompt: 'Professional headshot portrait photo of a young woman in her late 20s fitness and wellness reviewer wearing athletic casual outfit warm smile, clean light gray background, editorial style, soft studio lighting, friendly and energetic look', size: '1024x1024' },

  // === GUIDE IMAGES ===
  { filename: 'guide-best-travel-gadgets-2026.jpg', prompt: 'Flat lay arrangement of the best travel gadgets for 2026 including noise-cancelling earbuds portable charger travel adapter e-reader and smart luggage tag, clean white background, professional product photography style, organized collage layout', size: '1344x768' },
  { filename: 'guide-best-carry-on-luggage.jpg', prompt: 'Flat lay arrangement of premium carry-on luggage collection showing different styles hard-shell and soft-shell suitcases, clean white background, professional product photography style, organized layout, bright studio lighting', size: '1344x768' },
  { filename: 'guide-best-noise-cancelling-headphones.jpg', prompt: 'Flat lay arrangement of premium noise-cancelling headphones collection showing multiple models from different brands, clean white background, professional product photography style, organized layout, studio lighting', size: '1344x768' },
  { filename: 'guide-sony-vs-bose-headphones.jpg', prompt: 'Flat lay arrangement of Sony and Bose noise-cancelling headphones side by side comparison, clean white background, professional product photography style, split composition, studio lighting, e-commerce quality', size: '1344x768' },
  { filename: 'guide-travel-backpack.jpg', prompt: 'Flat lay arrangement of travel backpacks collection showing different sizes and styles with packing cubes and laptop sleeve visible, clean white background, professional product photography style, organized layout', size: '1344x768' },
  { filename: 'guide-anker-brand.jpg', prompt: 'Flat lay arrangement of Anker products including power banks charging cables wireless chargers and earbuds, clean white background, professional product photography style, organized layout, brand showcase, bright even lighting', size: '1344x768' },

  // === KEY PRODUCT IMAGES ===
  { filename: 'samsonite-freeform-carry-on.jpg', prompt: 'Product photography of Samsonite Freeform carry-on suitcase hard-shell spinner luggage in dark blue, isolated on white background, studio lighting, high quality, clean minimalist style, e-commerce product shot, 45 degree angle view', size: '1024x1024' },
  { filename: 'peak-design-travel-backpack.jpg', prompt: 'Product photography of Peak Design Travel Backpack 45L grey and black travel backpack with laptop sleeve, isolated on white background, studio lighting, high quality, clean minimalist style, e-commerce product shot, front view', size: '1024x1024' },
  { filename: 'anker-737-power-bank.jpg', prompt: 'Product photography of Anker 737 Power Bank 24000mAh portable charger sleek black rectangular design, isolated on white background, studio lighting, high quality, clean minimalist style, e-commerce product shot', size: '1024x1024' },
  { filename: 'sony-wf1000xm5.jpg', prompt: 'Product photography of Sony WF-1000XM5 wireless noise-cancelling earbuds with charging case black color, isolated on white background, studio lighting, high quality, clean minimalist style, e-commerce product shot', size: '1024x1024' },
  { filename: 'bose-qc-ultra-headphones.jpg', prompt: 'Product photography of Bose QuietComfort Ultra noise-cancelling over-ear headphones black color with silver accents, isolated on white background, studio lighting, high quality, clean minimalist style, e-commerce product shot', size: '1024x1024' },
  { filename: 'samsung-t7-shield-2tb.jpg', prompt: 'Product photography of Samsung T7 Shield 2TB portable SSD external storage drive rugged black design, isolated on white background, studio lighting, high quality, clean minimalist style, e-commerce product shot', size: '1024x1024' },
  { filename: 'garmin-venu-3.jpg', prompt: 'Product photography of Garmin Venu 3 smart fitness watch displaying watch face black band and silver case, isolated on white background, studio lighting, high quality, clean minimalist style, e-commerce product shot', size: '1024x1024' },
  { filename: 'herman-miller-aeron.jpg', prompt: 'Product photography of Herman Miller Aeron ergonomic office chair black mesh design, isolated on white background, studio lighting, high quality, clean minimalist style, e-commerce product shot, 3/4 angle view', size: '1024x1024' },
  { filename: 'apple-airtag-4-pack.jpg', prompt: 'Product photography of Apple AirTag 4-pack tracking devices with white circular tags, isolated on white background, studio lighting, high quality, clean minimalist style, e-commerce product shot', size: '1024x1024' },
  { filename: 'jbl-charge-5.jpg', prompt: 'Product photography of JBL Charge 5 portable Bluetooth speaker black and teal color, isolated on white background, studio lighting, high quality, clean minimalist style, e-commerce product shot, slight angle', size: '1024x1024' },
  { filename: 'biolite-campstove-2-plus.jpg', prompt: 'Product photography of BioLite CampStove 2 Plus portable wood-burning camp stove with USB charging port, isolated on white background, studio lighting, high quality, clean minimalist style, e-commerce product shot', size: '1024x1024' },
  { filename: 'theragun-pro-plus.jpg', prompt: 'Product photography of Theragun PRO Plus percussion massage gun device black and red design, isolated on white background, studio lighting, high quality, clean minimalist style, e-commerce product shot', size: '1024x1024' },
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateAllImages() {
  const zai = await ZAI.create();
  let successCount = 0;
  let failCount = 0;
  const failed = [];

  // Filter out already existing files
  const toGenerate = images.filter(img => {
    const p = path.join(OUTPUT_DIR, img.filename);
    return !fs.existsSync(p) || fs.statSync(p).size < 10000;
  });

  console.log(`Need to generate ${toGenerate.length} of ${images.length} images\n`);

  for (let i = 0; i < toGenerate.length; i++) {
    const { filename, prompt, size } = toGenerate[i];
    const outputPath = path.join(OUTPUT_DIR, filename);

    console.log(`[${i + 1}/${toGenerate.length}] Generating ${filename}...`);

    let retries = 3;
    let success = false;

    while (retries > 0 && !success) {
      try {
        const response = await zai.images.generations.create({ prompt, size });
        const imageBase64 = response.data[0].base64;
        const buffer = Buffer.from(imageBase64, 'base64');
        fs.writeFileSync(outputPath, buffer);
        const sizeKB = Math.round(buffer.length / 1024);
        console.log(`  ✅ ${filename} (${sizeKB} KB)`);
        successCount++;
        success = true;
      } catch (error) {
        retries--;
        if (error.message && error.message.includes('429')) {
          console.log(`  ⏳ Rate limited, waiting 10s... (${retries} retries left)`);
          await delay(10000);
        } else if (retries > 0) {
          console.log(`  ⚠️ Error: ${error.message}, retrying... (${retries} left)`);
          await delay(5000);
        } else {
          console.log(`  ❌ Failed: ${filename} - ${error.message}`);
          failCount++;
          failed.push(filename);
        }
      }
    }

    // Delay between requests
    if (i < toGenerate.length - 1) {
      await delay(DELAY_MS);
    }
  }

  console.log(`\n📊 Results: ✅ ${successCount} generated, ❌ ${failCount} failed`);
  if (failed.length > 0) {
    console.log('Failed:', failed.join(', '));
  }
}

generateAllImages().catch(console.error);
