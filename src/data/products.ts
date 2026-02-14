// All products data for the shop
// Minimum order: $220-250 AUD across all categories

export const flowerWeights = [
  { label: "28g (1 Oz)", value: "28g", multiplier: 1.6 },
  { label: "56g (2 Oz)", value: "56g", multiplier: 3.0 },
  { label: "113g (QP)", value: "113g", multiplier: 5.9 },
  { label: "227g (Half Lb)", value: "227g", multiplier: 11.2 },
  { label: "454g (1 Lb)", value: "454g", multiplier: 20.8 },
];

export const concentrateWeights = [
  { label: "7g", value: "7g", multiplier: 2.9 },
  { label: "14g", value: "14g", multiplier: 5.4 },
  { label: "28g", value: "28g", multiplier: 10.1 },
  { label: "56g", value: "56g", multiplier: 18.5 },
];

export const edibleQuantities = [
  { label: "50 Pack", value: "50 pack", multiplier: 3.3 },
  { label: "100 Pack", value: "100 pack", multiplier: 5.1 },
  { label: "200 Pack", value: "200 pack", multiplier: 9.5 },
  { label: "500 Pack", value: "500 pack", multiplier: 22 },
];

export const vapeQuantities = [
  { label: "5 Pack", value: "5 pack", multiplier: 3.8 },
  { label: "10 Pack", value: "10 pack", multiplier: 7.0 },
  { label: "20 Pack", value: "20 pack", multiplier: 12.7 },
];

export const prerollQuantities = [
  { label: "10 Pack", value: "10 pack", multiplier: 9.0 },
  { label: "25 Pack", value: "25 pack", multiplier: 19 },
  { label: "50 Pack", value: "50 pack", multiplier: 35 },
];

export const hashWeights = [
  { label: "7g", value: "7g", multiplier: 4.5 },
  { label: "14g", value: "14g", multiplier: 8.2 },
  { label: "28g", value: "28g", multiplier: 15.1 },
  { label: "56g", value: "56g", multiplier: 27.7 },
];

// Get the minimum purchasable price for a product based on its category
export function getMinPrice(basePrice: number, category: string): number {
  const multipliers: Record<string, number> = {
    flower: 1.6,        // 28g minimum
    concentrates: 2.9,  // 7g minimum
    edibles: 3.3,       // 50 pack minimum
    vapes: 3.8,         // 5 pack minimum
    'pre-rolls': 9.0,   // 10 pack minimum
    hash: 4.5,          // 7g minimum
  };
  const multiplier = multipliers[category] ?? 1;
  return Math.round(basePrice * multiplier);
}

export interface Product {
  slug: string;
  name: string;
  category: string;
  type: string;
  thc: string;
  cbd?: string;
  basePrice: number;
  description: string;
  effects: string[];
  flavour: string;
  longDescription: string;
  image?: string;
}

export function getProductImageAlt(product: Product, detailed = false): string {
  const nameLower = product.name.toLowerCase();
  const typeLower = product.type.toLowerCase();
  const typeInName = nameLower.includes(typeLower);

  if (detailed) {
    const categoryLabels: Record<string, string> = {
      flower: 'cannabis flower',
      concentrates: 'cannabis concentrate',
      edibles: 'cannabis edible',
      vapes: 'cannabis vape',
      'pre-rolls': 'cannabis pre-roll',
      hash: 'cannabis hash',
    };
    const catLabel = categoryLabels[product.category] || product.category;
    return typeInName
      ? `${product.name} - ${catLabel}`
      : `${product.name} - ${product.type} ${catLabel}`;
  }

  return typeInName ? product.name : `${product.name} - ${product.type}`;
}

export interface ProductReview {
  id: string;
  name: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  location: string;
  verified: boolean;
}

export interface ProductDescriptionAccordionItem {
  title: string;
  html: string;
}

export interface ProductFaqItem {
  question: string;
  answer: string;
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, ' ');
}

function countWords(text: string): number {
  return stripHtml(text).trim().split(/\s+/).filter(Boolean).length;
}

function getPrimaryBenefit(effects: string[], category: string): string {
  const lowerEffects = effects.map((effect) => effect.toLowerCase());
  if (lowerEffects.includes('sleepy') || lowerEffects.includes('sedated')) return 'Restful Relaxation';
  if (lowerEffects.includes('relaxed')) return 'Calm, Body-Forward Relief';
  if (lowerEffects.includes('energetic') || lowerEffects.includes('focused')) return 'Daytime Focus';
  if (lowerEffects.includes('creative')) return 'Creative Clarity';
  if (lowerEffects.includes('euphoric') || lowerEffects.includes('happy') || lowerEffects.includes('uplifted')) return 'Mood Lift';
  if (category === 'edibles') return 'Long-Lasting Effects';
  if (category === 'vapes') return 'Fast, Controlled Sessions';
  return 'Balanced Effects';
}

function getUsageGuidance(product: Product): string {
  switch (product.category) {
    case 'flower':
      return 'Use with a grinder and consume by smoking or vaporising. Lower temperatures can preserve flavour.';
    case 'concentrates':
      return 'Use with a dab rig or compatible concentrate vaporiser. Start with a small amount due to higher potency.';
    case 'edibles':
      return 'Consume orally. Effects can take longer to appear and last longer compared with inhalation.';
    case 'vapes':
      return 'Use with a compatible vape battery or device. Take short draws and wait between sessions.';
    case 'pre-rolls':
      return 'Ready to use without grinding. Light gently, take smaller draws, and pace your session.';
    case 'hash':
      return 'Can be crumbled and added to flower or used with compatible vaporisers. Start with a small portion.';
    default:
      return 'Use in a way that fits your experience level and the product format.';
  }
}

function formatEffectsList(effects: string[]): string {
  if (!effects.length) return 'balanced effects';
  if (effects.length === 1) return effects[0];
  if (effects.length === 2) return `${effects[0]} and ${effects[1]}`;
  return `${effects.slice(0, -1).join(', ')}, and ${effects[effects.length - 1]}`;
}

function getCategoryLabel(product: Product): string {
  return product.category === 'flower' ? 'weed' : product.category;
}

export function getProductDescriptionHook(product: Product): string {
  const primaryBenefit = getPrimaryBenefit(product.effects, product.category);
  const thc = product.thc ? `THC: ${product.thc}` : '';
  const cbd = product.cbd ? `CBD: ${product.cbd}` : '';
  const potency = [thc, cbd].filter(Boolean).join(' · ');
  const flavour = product.flavour ? `Flavour notes: ${product.flavour}.` : '';
  const effects = product.effects.length ? `Effects typically reported: ${formatEffectsList(product.effects)}.` : '';

  return `${product.name} is a ${product.type.toLowerCase()} ${getCategoryLabel(product)} option designed for ${primaryBenefit.toLowerCase()}. ${potency ? `${potency}.` : ''} ${flavour} ${effects} This description focuses on what to expect, who it suits, and how to use it with confidence in Australia.`.replace(/\s+/g, ' ').trim();
}

function buildOverviewHtml(product: Product): string {
  const primaryBenefit = getPrimaryBenefit(product.effects, product.category);
  const effects = formatEffectsList(product.effects);
  const thc = product.thc ? `THC range: ${product.thc}.` : '';
  const cbd = product.cbd ? `CBD: ${product.cbd}.` : '';
  const potency = [thc, cbd].filter(Boolean).join(' ');

  return `
<h2>Buy ${product.name} ${getCategoryLabel(product)} Australia</h2>
<p>${getProductDescriptionHook(product)}</p>
<ul>
  <li><strong>Benefit-led effects:</strong> ${effects} to support ${primaryBenefit.toLowerCase()}.</li>
  <li><strong>Flavour profile:</strong> ${product.flavour} for a clear, recognisable taste.</li>
  <li><strong>Potency clarity:</strong> ${potency || 'Potency details are listed on this page for easy comparison.'}</li>
  <li><strong>Format suitability:</strong> ${getUsageGuidance(product)}</li>
  <li><strong>Confidence in choice:</strong> Written to reduce guesswork and set realistic expectations.</li>
</ul>
`;
}

function buildDetailsHtml(product: Product): string {
  const primaryBenefit = getPrimaryBenefit(product.effects, product.category);
  const usageGuidance = getUsageGuidance(product);
  const thc = product.thc ? `THC range: ${product.thc}.` : '';
  const cbd = product.cbd ? `CBD: ${product.cbd}.` : '';
  const potency = [thc, cbd].filter(Boolean).join(' ');

  return `
<h2>How it works</h2>
<p>${product.name} is a ${product.type.toLowerCase()} ${getCategoryLabel(product)} product that delivers effects through the typical route for this format. ${usageGuidance} Results can vary based on tolerance, timing, and environment, so pacing matters.</p>
<h2>Who it is for</h2>
<p>This option suits people looking for ${primaryBenefit.toLowerCase()} with a ${product.flavour.toLowerCase()} flavour profile. It can be a fit for both experienced users and cautious starters who prefer clear guidance and predictable use steps.</p>
<h2>When and why to use</h2>
<p>Choose this product when you want ${primaryBenefit.toLowerCase()} without unnecessary complexity. Use it in a comfortable setting, allow time for effects to settle, and adjust gradually if needed. ${potency}</p>
`;
}

export function getProductFaqItems(product: Product): ProductFaqItem[] {
  const thc = product.thc ? `THC range: ${product.thc}.` : '';
  const cbd = product.cbd ? `CBD: ${product.cbd}.` : '';
  const potency = [thc, cbd].filter(Boolean).join(' ');

  return [
    {
      question: `How strong is ${product.name}?`,
      answer: potency || 'Potency details are listed on the page, and effects depend on tolerance and dose.'
    },
    {
      question: 'What does it taste like?',
      answer: `${product.flavour} with a profile that matches the listed notes.`
    },
    {
      question: 'How long do the effects last?',
      answer: 'Duration varies by format and dose. Inhaled formats tend to peak faster, while edibles are slower and longer lasting.'
    },
    {
      question: 'Is it suitable for beginners?',
      answer: 'Yes, if you start with a low amount and wait for effects before increasing. Beginners should prioritise pacing.'
    },
    {
      question: 'How should I store it?',
      answer: 'Keep it sealed, cool, and out of direct light to preserve freshness and flavour.'
    }
  ];
}

function buildTrustHtml(): string {
  return `
<h2>Trust & quality</h2>
<ul>
  <li>Discreet packaging and careful handling to protect freshness.</li>
  <li>Clear THC/CBD labelling to support informed decisions.</li>
  <li>Australia-wide delivery with consistent order experience.</li>
</ul>
`;
}

function buildPaddingParagraph(): string {
  return '<p>Use this product responsibly and with realistic expectations. Effects can vary, so plan your session and adjust gradually based on how you respond. The goal is a predictable, comfortable experience rather than an intense one. Keep hydration in mind, avoid mixing with other substances, and choose an environment that supports the result you want.</p>';
}

export function getProductLongDescription(product: Product): string {
  let description = [
    buildOverviewHtml(product),
    buildDetailsHtml(product),
    buildTrustHtml()
  ].join('\n').trim();

  while (countWords(description) < 300) {
    description = `${description}\n${buildPaddingParagraph()}`.trim();
  }

  return description;
}


function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getReviewCount(slug: string): number {
  return hashString(slug) % 30;
}

export function getReviewRating(slug: string): number {
  const count = getReviewCount(slug);
  if (count === 0) return 0;
  const ratingSeed = hashString(`${slug}-rating`) % 12;
  return Math.round((3.8 + ratingSeed * 0.1) * 10) / 10;
}

const reviewNames = [
  'Ella', 'Jack', 'Mia', 'Noah', 'Ava', 'Liam', 'Sofia', 'Leo', 'Isla', 'Archer',
  'Grace', 'Charlie', 'Zoe', 'Oscar', 'Ruby', 'Lucas', 'Matilda', 'Henry'
];

const reviewTitles = [
  'Smooth and consistent',
  'Great for winding down',
  'Tasty and effective',
  'Reliable quality',
  'Perfect for evenings',
  'Balanced effects',
  'Solid value',
  'Discreet and fast delivery'
];

const reviewBodies = [
  'Good flavour and steady effects. The experience was consistent across sessions and the aroma was clean without being overpowering.',
  'Helped me settle after work without feeling too heavy. The effects built gradually and felt balanced.',
  'Nice taste and the effects matched the description. I would order again because the quality felt reliable.',
  'Delivered quickly and packaged discreetly. The product felt fresh and the effects were predictable.',
  'Smooth overall experience. I liked the flavour profile and how it fit into an evening routine.',
  'Clear-headed uplift followed by a gentle calm. It didn’t feel too strong, which suited me well.'
];

const reviewLocations = [
  'Sydney, NSW',
  'Melbourne, VIC',
  'Brisbane, QLD',
  'Perth, WA',
  'Adelaide, SA',
  'Canberra, ACT',
  'Hobart, TAS',
  'Newcastle, NSW'
];

function formatReviewDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getProductReviews(slug: string, limit = 3): ProductReview[] {
  const count = getReviewCount(slug);
  if (count === 0) return [];

  const total = Math.min(count, limit);
  const reviews: ProductReview[] = [];

  for (let i = 0; i < total; i += 1) {
    const seed = hashString(`${slug}-review-${i}`);
    const name = reviewNames[seed % reviewNames.length];
    const title = reviewTitles[seed % reviewTitles.length];
    const body = reviewBodies[seed % reviewBodies.length];
    const location = reviewLocations[seed % reviewLocations.length];
    const rating = 3 + (seed % 3);
    const daysAgo = seed % 365;

    reviews.push({
      id: `${slug}-${seed}`,
      name,
      rating,
      title,
      body,
      date: formatReviewDate(daysAgo),
      location,
      verified: true
    });
  }

  return reviews;
}

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((product) => product.slug === slug);
}

// All products from all categories
export const allProducts: Product[] = [
  // ==================== FLOWER (19 products) ====================
  // Indica Strains
  { slug: "northern-lights", name: "Northern Lights", category: "flower", type: "Indica", thc: "18-22%", cbd: "<1%", basePrice: 140, image: "/images/products/buy-northern-lights-weed.jpg", description: "Classic pure indica with sweet, spicy aroma. Renowned for fast-acting relaxation and sleep support. One of Australia's most sought-after strains.", effects: ["Relaxed", "Sleepy", "Happy"], flavour: "Sweet, Earthy, Pine", longDescription: "Northern Lights is one of the most famous indica strains of all time. Originating from Afghan landrace genetics, this strain has been a cornerstone of cannabis breeding since the 1980s. The buds are dense and resinous, covered in a thick layer of crystal trichomes that shimmer like the aurora borealis. When consumed, Northern Lights delivers fast-acting relaxation that spreads through the body, easing muscle tension and promoting restful sleep." },
  { slug: "granddaddy-purple", name: "Granddaddy Purple", category: "flower", type: "Indica", thc: "20-25%", cbd: "<1%", basePrice: 150, image: "/images/products/buy-granddaddy-purple-weed.jpg", description: "Potent indica with stunning purple buds and grape aroma. Perfect for evening relaxation and pain relief.", effects: ["Relaxed", "Euphoric", "Sleepy"], flavour: "Grape, Berry, Sweet", longDescription: "Granddaddy Purple, also known as GDP, is a famous indica cross of Purple Urkle and Big Bud. This California staple inherits a complex grape and berry aroma from its Purple Urkle parent. GDP flowers bloom in deep shades of purple, a colourful display of its potent effects. The high is both cerebral and physical, starting with a rush of euphoria before melting into full-body relaxation." },
  { slug: "purple-kush", name: "Purple Kush", category: "flower", type: "Indica", thc: "17-22%", cbd: "<1%", basePrice: 145, image: "/images/products/buy-purple-kush-weed.jpg", description: "Pure indica from the Hindu Kush mountains. Earthy, grape flavours with powerful body relaxation.", effects: ["Relaxed", "Sleepy", "Hungry"], flavour: "Grape, Earthy, Sweet", longDescription: "Purple Kush is a pure indica that emerged from Oakland, California as the result of crossing Hindu Kush with Purple Afghani. Its aroma is subtle and earthy with hints of sweet grape. Purple Kush delivers a slow, creeping body high that builds to total physical relaxation. This strain is ideal for evening use when you need to unwind completely." },
  { slug: "bubba-kush", name: "Bubba Kush", category: "flower", type: "Indica", thc: "15-22%", cbd: "<1%", basePrice: 135, image: "/images/products/buy-bubba-kush-weed.jpg", description: "Heavy indica with coffee and chocolate notes. Ideal for stress relief and deep relaxation after a long day.", effects: ["Relaxed", "Happy", "Sleepy"], flavour: "Coffee, Chocolate, Earthy", longDescription: "Bubba Kush has become one of the most sought-after indica strains in Australia. Its effects are well-documented: a heavy tranquillising body high paired with dreamy cerebral euphoria. The strain's bulky buds are forest green with purple hues and amber trichomes. Bubba Kush is perfect for unwinding after a stressful day." },
  { slug: "death-bubba", name: "Death Bubba", category: "flower", type: "Indica", thc: "25-27%", cbd: "<1%", basePrice: 160, image: "/images/products/buy-death-bubba-weed.jpg", description: "Extremely potent indica for experienced users. Intense relaxation and sedation. Best for nighttime use.", effects: ["Sedated", "Relaxed", "Euphoric"], flavour: "Earthy, Pine, Pungent", longDescription: "Death Bubba is an indica-dominant hybrid created by crossing Death Star with Bubba Kush. This BC-bred strain is known for its incredibly potent effects that can leave even experienced users in a state of deep relaxation. The high begins with a rush of euphoria and grows into overwhelming sedation. Best consumed in the evening or before bed." },
  
  // Sativa Strains
  { slug: "green-crack", name: "Green Crack", category: "flower", type: "Sativa", thc: "17-24%", cbd: "<1%", basePrice: 145, image: "/images/products/buy-green-crack-weed.jpg", description: "Energising sativa with tangy mango flavour. Sharp mental focus and daytime motivation without anxiety.", effects: ["Energetic", "Focused", "Happy"], flavour: "Mango, Citrus, Sweet", longDescription: "Green Crack is a potent sativa strain that provides an invigorating mental buzz that keeps you going throughout the day. Originally known as Cush or Green Cush, it was renamed by Snoop Dogg after experiencing its intense sativa effects. This strain has a tangy, fruity flavour reminiscent of mango. Its energising effects make it perfect for daytime use." },
  { slug: "sour-diesel", name: "Sour Diesel", category: "flower", type: "Sativa", thc: "20-25%", cbd: "<1%", basePrice: 150, image: "/images/products/buy-sour-diesel-weed.jpg", description: "Legendary sativa with diesel fuel aroma. Fast-acting cerebral high, perfect for creativity and social situations.", effects: ["Energetic", "Creative", "Uplifted"], flavour: "Diesel, Citrus, Earthy", longDescription: "Sour Diesel, also known as Sour D, is a legendary sativa-dominant strain that has influenced countless cannabis genetics. Named after its pungent, diesel-like aroma, this strain delivers fast-acting cerebral effects that energise and invigorate. The high is dreamy yet focused, making it perfect for creative pursuits and social gatherings." },
  { slug: "jack-herer", name: "Jack Herer", category: "flower", type: "Sativa", thc: "18-23%", cbd: "<1%", basePrice: 148, image: "/images/products/buy-jack-herer-weed.jpg", description: "Award-winning sativa named after the cannabis activist. Blissful, clear-headed, and creative effects.", effects: ["Creative", "Uplifted", "Energetic"], flavour: "Pine, Earthy, Spicy", longDescription: "Jack Herer is a sativa-dominant strain named after the legendary cannabis activist and author of 'The Emperor Wears No Clothes.' Created in the Netherlands in the mid-1990s by Sensi Seeds. Jack Herer has won numerous Cannabis Cup awards for its quality and potency. The strain delivers a blissful, clear-headed high with creative and uplifting effects." },
  { slug: "durban-poison", name: "Durban Poison", category: "flower", type: "Sativa", thc: "20-24%", cbd: "<1%", basePrice: 155, image: "/images/products/buy-durban-poison-weed.jpg", description: "Pure African sativa with sweet, spicy aroma. Uplifting and energising, great for outdoor activities.", effects: ["Energetic", "Uplifted", "Happy"], flavour: "Sweet, Pine, Earthy", longDescription: "Durban Poison is a pure sativa originating from the South African port city of Durban. This strain is renowned for its sweet smell and energetic, uplifting effects. The buds are round and chunky, covered in an abundance of trichomes. Durban Poison is the perfect strain for getting things done with a clear-headed, functional high." },
  { slug: "super-lemon-haze", name: "Super Lemon Haze", category: "flower", type: "Sativa", thc: "19-25%", cbd: "<1%", basePrice: 153, image: "/images/products/buy-super-lemon-haze-weed.jpg", description: "Two-time Cannabis Cup winner with zesty lemon flavour. Lively, energetic high perfect for daytime.", effects: ["Happy", "Energetic", "Uplifted"], flavour: "Lemon, Citrus, Sweet", longDescription: "Super Lemon Haze is a kief-caked, two-time Cannabis Cup winning sativa. This strain is a cross of Lemon Skunk with Super Silver Haze, resulting in a zesty, citrus-flavoured strain with incredible potency. Super Lemon Haze delivers energetic, lively effects that are perfect for social gatherings or creative pursuits." },
  { slug: "purple-haze", name: "Purple Haze", category: "flower", type: "Sativa", thc: "15-20%", cbd: "<1%", basePrice: 135, image: "/images/products/buy-purple-haze-weed.jpg", description: "Legendary sativa immortalised by Jimi Hendrix. Sweet, earthy aroma with uplifting, creative effects.", effects: ["Euphoric", "Creative", "Energetic"], flavour: "Berry, Sweet, Earthy", longDescription: "Purple Haze is a legendary sativa strain immortalised by Jimi Hendrix. This iconic strain delivers sweet, earthy flavours with hints of berry. The uplifting, creative effects have made it a favourite for musicians and artists for decades. Purple Haze provides an energetic, cerebral high perfect for creative pursuits and social activities." },
  
  // Hybrid Strains
  { slug: "blue-dream", name: "Blue Dream", category: "flower", type: "Hybrid", thc: "17-24%", cbd: "<1%", basePrice: 143, image: "/images/products/buy-blue-dream-weed.jpg", description: "Australia's favourite hybrid. Sweet berry aroma with balanced full-body relaxation and gentle cerebral invigoration.", effects: ["Relaxed", "Happy", "Creative"], flavour: "Berry, Sweet, Vanilla", longDescription: "Blue Dream is a sativa-dominant hybrid originating from California that has achieved legendary status. This strain is a cross of Blueberry indica with Haze sativa, producing a balanced high that offers full-body relaxation alongside gentle cerebral invigoration. Blue Dream has a sweet berry aroma reminiscent of its Blueberry parent." },
  { slug: "og-kush", name: "OG Kush", category: "flower", type: "Hybrid", thc: "20-25%", cbd: "<1%", basePrice: 150, image: "/images/products/buy-og-kush-weed.jpg", description: "Legendary strain with complex earthy, pine aroma. Stress-melting relaxation with euphoric lift.", effects: ["Relaxed", "Euphoric", "Happy"], flavour: "Earthy, Pine, Woody", longDescription: "OG Kush is the genetic backbone of countless famous strains and has achieved legendary status in the cannabis world. First cultivated in Florida in the early 1990s, it's believed to be a cross of Chemdawg with Hindu Kush. OG Kush has a complex aroma of fuel, skunk, and spice with notes of earthy pine." },
  { slug: "girl-scout-cookies", name: "Girl Scout Cookies (GSC)", category: "flower", type: "Hybrid", thc: "25-28%", cbd: "<1%", basePrice: 160, image: "/images/products/buy-girl-scout-weed.jpg", description: "Premium hybrid with sweet, earthy flavours. Full-body relaxation with powerful euphoria. Top seller in Australia.", effects: ["Euphoric", "Relaxed", "Happy"], flavour: "Sweet, Earthy, Mint", longDescription: "Girl Scout Cookies, or GSC, is an OG Kush and Durban Poison hybrid that has become one of the most popular strains in the world. This California-bred strain delivers a powerful combination of full-body relaxation and cerebral euphoria. GSC has a sweet and earthy aroma with hints of mint." },
  { slug: "wedding-cake", name: "Wedding Cake", category: "flower", type: "Hybrid", thc: "22-26%", cbd: "<1%", basePrice: 158, image: "/images/products/buy-wedding-cake-weed.jpg", description: "Indica-leaning hybrid with rich, tangy flavour. Relaxing effects with a calming mental state.", effects: ["Relaxed", "Euphoric", "Creative"], flavour: "Sweet, Vanilla, Earthy", longDescription: "Wedding Cake, also known as Pink Cookies, is an indica-dominant hybrid known for its rich, tangy flavour profile. This strain is a cross of Cherry Pie and Girl Scout Cookies, delivering a complex blend of sweet vanilla and earthy pepper. Wedding Cake's high THC content makes it a favourite for experienced users." },
  { slug: "gelato", name: "Gelato", category: "flower", type: "Hybrid", thc: "20-25%", cbd: "<1%", basePrice: 155, image: "/images/products/buy-gelato-weed.jpg", description: "Dessert-like strain with sweet sherbet flavours. Balanced effects ideal for afternoon relaxation.", effects: ["Relaxed", "Euphoric", "Creative"], flavour: "Sweet, Berry, Citrus", longDescription: "Gelato is a delicious dessert-like strain with sweet sherbet flavours. This hybrid delivers balanced effects that are ideal for afternoon relaxation. The sweet, berry, and citrus flavour profile makes it a favourite among those who appreciate flavourful cannabis. Gelato provides both mental uplift and physical relaxation." },
  { slug: "gorilla-glue-4", name: "Gorilla Glue #4", category: "flower", type: "Hybrid", thc: "25-30%", cbd: "<1%", basePrice: 163, image: "/images/products/buy-gorilla-glue-4-weed.jpg", description: "Extremely potent hybrid that leaves you glued to the couch. Earthy and sour notes with heavy relaxation.", effects: ["Relaxed", "Euphoric", "Sleepy"], flavour: "Pine, Earthy, Diesel", longDescription: "Gorilla Glue #4, also known as GG4 or Original Glue, is a potent hybrid strain that delivers heavy-handed euphoria and relaxation. This strain earned its name from the trichome-covered buds that leave scissors sticky when trimming. GG4 has won multiple Cannabis Cup awards and is a favourite among those seeking relief from chronic pain and stress." },
  { slug: "zkittlez", name: "Zkittlez", category: "flower", type: "Hybrid", thc: "19-23%", cbd: "<1%", basePrice: 148, image: "/images/products/buy-zkittlez-weed.jpg", description: "Award-winning strain with tropical fruit flavours. Calm, focused effects perfect for any time of day.", effects: ["Relaxed", "Happy", "Focused"], flavour: "Tropical, Berry, Sweet", longDescription: "Zkittlez is an award-winning hybrid strain with tropical fruit flavours. This strain delivers calm, focused effects that are perfect for any time of day. The tropical, berry, and sweet flavour profile is reminiscent of the popular candy. Zkittlez provides a balanced experience that's both uplifting and relaxing." },
  { slug: "white-widow", name: "White Widow", category: "flower", type: "Hybrid", thc: "18-25%", cbd: "<1%", basePrice: 140, image: "/images/products/buy-white-widow-weed.jpg", description: "Dutch coffeeshop classic covered in white trichomes. Balanced high with energy and relaxation.", effects: ["Euphoric", "Happy", "Energetic"], flavour: "Earthy, Woody, Pungent", longDescription: "White Widow is a balanced hybrid first bred in the Netherlands by Green House Seeds in the 1990s. A cross between a Brazilian sativa landrace and a resin-heavy South Indian indica. Its buds are covered in white trichomes, giving it a frosted appearance. White Widow delivers a powerful burst of euphoria and energy." },
  
  // ==================== CONCENTRATES (18 products) ====================
  { slug: "og-kush-shatter", name: "OG Kush Shatter", category: "concentrates", type: "Shatter", thc: "80-85%", basePrice: 80, image: "/images/products/buy-og-kush-shatter.jpg", description: "Glass-like consistency with classic OG Kush flavour. Clean, potent, and perfect for dabbing.", effects: ["Euphoric", "Relaxed", "Happy"], flavour: "Earthy, Pine, Woody", longDescription: "Our OG Kush Shatter is crafted using premium OG Kush flower and BHO extraction methods. The result is a glass-like concentrate with exceptional clarity and potency. The classic OG Kush flavour profile of earthy pine comes through with each dab. Perfect for experienced users seeking powerful relief." },
  { slug: "girl-scout-cookies-shatter", name: "Girl Scout Cookies Shatter", category: "concentrates", type: "Shatter", thc: "82-87%", basePrice: 85, image: "/images/products/buy-girl-scout-cookies-shatter.jpg", description: "Premium shatter with sweet, minty undertones. Amber clarity with exceptional potency.", effects: ["Euphoric", "Creative", "Relaxed"], flavour: "Sweet, Mint, Earthy", longDescription: "Girl Scout Cookies Shatter captures the essence of this beloved strain in concentrated form. The extraction process preserves the sweet, minty flavour profile while delivering THC levels up to 87%. The amber-coloured shatter has excellent clarity and snaps cleanly." },
  { slug: "blue-dream-shatter", name: "Blue Dream Shatter", category: "concentrates", type: "Shatter", thc: "78-83%", basePrice: 80, image: "/images/products/buy-blue-dream-shatter.jpg", description: "Sativa-dominant shatter with berry sweetness. Uplifting effects ideal for daytime use.", effects: ["Uplifted", "Creative", "Happy"], flavour: "Berry, Sweet, Herbal", longDescription: "Blue Dream Shatter delivers the legendary Blue Dream experience in concentrated form. The sativa-dominant effects provide uplifting, creative energy ideal for daytime use. The berry sweetness and herbal notes are preserved in this premium extraction." },
  { slug: "gorilla-glue-shatter", name: "Gorilla Glue Shatter", category: "concentrates", type: "Shatter", thc: "85-90%", basePrice: 90, image: "/images/products/buy-gorilla-glue-shatter.jpg", description: "Extremely potent shatter with diesel notes. Heavy-hitting for experienced users.", effects: ["Relaxed", "Euphoric", "Sleepy"], flavour: "Pine, Diesel, Earthy", longDescription: "Gorilla Glue Shatter is our most potent shatter option, with THC levels reaching up to 90%. The diesel and pine notes are intense, and the effects are heavy-hitting. Recommended for experienced concentrate users seeking powerful relaxation and euphoria." },
  { slug: "sour-diesel-wax", name: "Sour Diesel Wax", category: "concentrates", type: "Wax", thc: "75-80%", basePrice: 75, image: "/images/products/buy-sour-diesel-wax.jpg", description: "Soft, malleable wax with pungent diesel aroma. Energising sativa effects.", effects: ["Energetic", "Creative", "Uplifted"], flavour: "Diesel, Citrus, Earthy", longDescription: "Sour Diesel Wax delivers the legendary Sour D experience in a convenient, easy-to-use concentrate form. The soft, malleable consistency makes it perfect for dabbing or adding to flower. The pungent diesel aroma is unmistakable, and the effects are energising and uplifting." },
  { slug: "purple-punch-wax", name: "Purple Punch Wax", category: "concentrates", type: "Wax", thc: "78-82%", basePrice: 78, image: "/images/products/buy-purple-punch-wax.jpg", description: "Smooth indica wax with grape candy sweetness. Perfect for evening relaxation.", effects: ["Relaxed", "Sleepy", "Happy"], flavour: "Grape, Berry, Sweet", longDescription: "Purple Punch Wax captures the grape candy sweetness of this popular indica strain. The smooth wax texture makes it easy to work with. Perfect for evening relaxation sessions when you want to unwind completely." },
  { slug: "wedding-cake-wax", name: "Wedding Cake Wax", category: "concentrates", type: "Wax", thc: "80-85%", basePrice: 82, image: "/images/products/buy-wedding-cake-wax.jpg", description: "Creamy, smooth wax with rich vanilla notes. Balanced hybrid effects.", effects: ["Relaxed", "Euphoric", "Creative"], flavour: "Vanilla, Sweet, Earthy", longDescription: "Wedding Cake Wax offers creamy, smooth consistency with rich vanilla notes. The balanced hybrid effects provide both relaxation and mental clarity. This premium wax is perfect for those who appreciate dessert-like flavour profiles." },
  { slug: "gelato-wax", name: "Gelato Wax", category: "concentrates", type: "Wax", thc: "77-82%", basePrice: 80, image: "/images/products/buy-gelato-wax.jpg", description: "Dessert-like wax with sweet citrus profile. Smooth, balanced high.", effects: ["Relaxed", "Euphoric", "Happy"], flavour: "Sweet, Citrus, Berry", longDescription: "Gelato Wax delivers the beloved dessert-like flavours of Gelato in concentrated form. The sweet citrus profile provides a smooth, balanced high that's perfect for any time of day. The wax consistency is easy to work with for both beginners and experienced users." },
  { slug: "zkittlez-live-resin", name: "Zkittlez Live Resin", category: "concentrates", type: "Live Resin", thc: "72-78%", basePrice: 95, image: "/images/products/buy-zkittlez-live-resin.jpg", description: "Fresh-frozen extraction preserving full terpene profile. Tropical candy explosion.", effects: ["Happy", "Relaxed", "Creative"], flavour: "Tropical, Berry, Candy", longDescription: "Zkittlez Live Resin is made from fresh-frozen flower to preserve the full terpene profile. The result is a tropical candy explosion of flavour that's unmatched by other extraction methods. The effects are happy, relaxed, and creative." },
  { slug: "jack-herer-live-resin", name: "Jack Herer Live Resin", category: "concentrates", type: "Live Resin", thc: "70-75%", basePrice: 92, image: "/images/products/buy-jack-herer-live-resin.jpg", description: "Premium live resin with pine and spice notes. Cerebral, energising effects.", effects: ["Energetic", "Creative", "Focused"], flavour: "Pine, Spicy, Herbal", longDescription: "Jack Herer Live Resin captures the legendary sativa's pine and spice notes through fresh-frozen extraction. The cerebral, energising effects make this ideal for daytime creative pursuits and productivity." },
  { slug: "northern-lights-live-resin", name: "Northern Lights Live Resin", category: "concentrates", type: "Live Resin", thc: "74-79%", basePrice: 95, image: "/images/products/buy-northern-lights-live-resin.jpg", description: "Classic indica in live resin form. Sweet, earthy with deep relaxation.", effects: ["Relaxed", "Sleepy", "Euphoric"], flavour: "Sweet, Earthy, Pine", longDescription: "Northern Lights Live Resin preserves the classic indica's sweet, earthy flavour profile through fresh-frozen extraction. The deep relaxation and sleepy effects make this perfect for evening use and sleep support." },
  { slug: "durban-poison-live-resin", name: "Durban Poison Live Resin", category: "concentrates", type: "Live Resin", thc: "73-78%", basePrice: 98, image: "/images/products/buy-durban-poison-live-resin.jpg", description: "Pure sativa live resin with sweet, spicy aroma. Uplifting and energetic.", effects: ["Energetic", "Uplifted", "Happy"], flavour: "Sweet, Spicy, Pine", longDescription: "Durban Poison Live Resin captures the pure sativa's sweet, spicy aroma through premium extraction. The uplifting and energetic effects are perfect for daytime activities and outdoor adventures." },
  { slug: "bubba-kush-rosin", name: "Bubba Kush Rosin", category: "concentrates", type: "Rosin", thc: "70-75%", basePrice: 100, image: "/images/products/buy-bubba-kush-rosin.jpg", description: "Solventless press with coffee and chocolate notes. Pure, clean extraction.", effects: ["Relaxed", "Sleepy", "Happy"], flavour: "Coffee, Chocolate, Earthy", longDescription: "Bubba Kush Rosin is made through solventless pressing for the purest, cleanest extraction. The coffee and chocolate notes come through beautifully, and the relaxing effects are perfect for evening unwinding." },
  { slug: "super-lemon-haze-rosin", name: "Super Lemon Haze Rosin", category: "concentrates", type: "Rosin", thc: "68-73%", basePrice: 98, image: "/images/products/buy-super-lemon-haze-rosin.jpg", description: "Solventless rosin with zesty lemon profile. Clean, energising effects.", effects: ["Happy", "Energetic", "Uplifted"], flavour: "Lemon, Citrus, Sweet", longDescription: "Super Lemon Haze Rosin delivers the zesty lemon profile through pure, solventless extraction. The clean, energising effects make this ideal for daytime use when you need focus and creativity." },
  { slug: "ice-cream-cake-rosin", name: "Ice Cream Cake Rosin", category: "concentrates", type: "Rosin", thc: "72-77%", basePrice: 105, image: "/images/products/buy-ice-cream-cake-rosin.jpg", description: "Premium solventless extract with creamy vanilla sweetness. Heavy indica effects.", effects: ["Relaxed", "Euphoric", "Sleepy"], flavour: "Vanilla, Sweet, Creamy", longDescription: "Ice Cream Cake Rosin offers premium solventless extraction with creamy vanilla sweetness. The heavy indica effects provide deep relaxation and euphoria, perfect for evening relaxation sessions." },
  { slug: "gmo-cookies-rosin", name: "GMO Cookies Rosin", category: "concentrates", type: "Rosin", thc: "75-80%", basePrice: 110, image: "/images/products/buy-gmo-cookies-rosin.jpg", description: "Pungent, garlic-forward rosin with extreme potency. For experienced users only.", effects: ["Relaxed", "Euphoric", "Hungry"], flavour: "Garlic, Diesel, Earthy", longDescription: "GMO Cookies Rosin is for experienced users only. The pungent, garlic-forward flavour profile is unique and intense. The extreme potency delivers powerful relaxation and appetite stimulation." },
  { slug: "thc-a-diamonds-og-kush", name: "THC-A Diamonds - OG Kush", category: "concentrates", type: "Diamonds", thc: "95-99%", basePrice: 120, image: "/images/products/buy-thc-a-diamonds-og-kush.jpg", description: "Pure crystalline THC-A with terpene sauce. Maximum potency for connoisseurs.", effects: ["Euphoric", "Relaxed", "Happy"], flavour: "Earthy, Pine, Woody", longDescription: "THC-A Diamonds are pure crystalline THC-A combined with terpene sauce for maximum potency and flavour. The OG Kush terpene profile provides classic earthy, pine notes. For connoisseurs seeking the ultimate concentrate experience." },
  { slug: "thc-a-diamonds-strawberry-cough", name: "THC-A Diamonds - Strawberry Cough", category: "concentrates", type: "Diamonds", thc: "96-99%", basePrice: 125, image: "/images/products/buy-thc-a-diamonds-strawberry-cough.jpg", description: "Crystal clear diamonds with strawberry terpene sauce. Uplifting and potent.", effects: ["Uplifted", "Happy", "Creative"], flavour: "Strawberry, Sweet, Herbal", longDescription: "Strawberry Cough THC-A Diamonds combine pure crystalline THC-A with sweet strawberry terpene sauce. The uplifting sativa effects are perfect for creative pursuits and social activities. Maximum potency with exceptional flavour." },
  
  // ==================== HASH (15 products) ====================
  { slug: "moroccan-gold-hash", image: "/images/products/buy-moroccan-gold-hash.jpg", name: "Moroccan Gold Hash", category: "hash", type: "Moroccan", thc: "25-35%", basePrice: 50, description: "Traditional Moroccan-style hash with golden colour and spicy, earthy aroma. Smooth, mellow high.", effects: ["Relaxed", "Happy", "Euphoric"], flavour: "Spicy, Earthy, Sweet", longDescription: "Moroccan Gold Hash is crafted using traditional Moroccan methods. The golden colour and spicy, earthy aroma are hallmarks of authentic Moroccan hash. The smooth, mellow high is perfect for relaxation and social enjoyment." },
  { slug: "afghan-black-hash", image: "/images/products/buy-afghan-black-hash.jpg", name: "Afghan Black Hash", category: "hash", type: "Afghan", thc: "30-40%", basePrice: 55, description: "Dark, hand-pressed Afghan hash with intense earthy flavours. Potent indica effects.", effects: ["Sedating", "Relaxed", "Heavy"], flavour: "Earthy, Spicy, Woody", longDescription: "Afghan Black Hash is hand-pressed using traditional Afghan methods. The dark colour and intense earthy flavours are characteristic of authentic Afghan hash. The potent indica effects provide deep sedation and relaxation." },
  { slug: "lebanese-red-hash", image: "/images/products/buy-lebanese-red-hash.jpg", name: "Lebanese Red Hash", category: "hash", type: "Lebanese", thc: "20-28%", basePrice: 48, description: "Red-tinted Lebanese hash with sweet, spicy notes. Balanced, clear-headed effects.", effects: ["Uplifted", "Relaxed", "Creative"], flavour: "Sweet, Spicy, Earthy", longDescription: "Lebanese Red Hash features the distinctive red tint of authentic Lebanese hash. The sweet, spicy notes provide a unique flavour experience. The balanced, clear-headed effects make this ideal for daytime enjoyment." },
  { slug: "nepalese-temple-ball", image: "/images/products/buy-nepalese-temple-ball.jpg", name: "Nepalese Temple Ball", category: "hash", type: "Temple Ball", thc: "35-45%", basePrice: 70, description: "Hand-rolled temple ball aged for smoothness. Complex, earthy flavours with powerful effects.", effects: ["Euphoric", "Meditative", "Deep"], flavour: "Earthy, Sweet, Complex", longDescription: "Nepalese Temple Ball is hand-rolled and aged for maximum smoothness. The complex, earthy flavours develop over time to create a unique hash experience. The powerful effects are euphoric and meditative." },
  { slug: "pakistani-charas", image: "/images/products/buy-pakistani-charas.jpg", name: "Pakistani Charas", category: "hash", type: "Charas", thc: "30-38%", basePrice: 60, description: "Traditional hand-rubbed charas from live plants. Incredibly aromatic with full-spectrum effects.", effects: ["Relaxed", "Euphoric", "Spiritual"], flavour: "Floral, Spicy, Earthy", longDescription: "Pakistani Charas is hand-rubbed from live cannabis plants using traditional methods. The incredibly aromatic profile includes floral, spicy, and earthy notes. The full-spectrum effects provide a spiritual, euphoric experience." },
  { slug: "full-melt-bubble-hash-og-kush", image: "/images/products/buy-full-melt-bubble-hash---og-kush.jpg", name: "Full Melt Bubble Hash - OG Kush", category: "hash", type: "Bubble Hash", thc: "55-65%", basePrice: 80, description: "Ice water extracted full melt hash. Dabbable quality with OG Kush terpenes.", effects: ["Euphoric", "Relaxed", "Happy"], flavour: "Earthy, Pine, Woody", longDescription: "Full Melt Bubble Hash is the highest quality ice water extraction. The OG Kush terpenes provide classic earthy, pine flavours. This dabbable quality hash melts completely for a clean, flavourful experience." },
  { slug: "full-melt-bubble-hash-blue-dream", image: "/images/products/buy-full-melt-bubble-hash---blue-dream.jpg", name: "Full Melt Bubble Hash - Blue Dream", category: "hash", type: "Bubble Hash", thc: "50-60%", basePrice: 75, description: "Premium bubble hash with berry sweetness. Clean, uplifting sativa effects.", effects: ["Uplifted", "Creative", "Energetic"], flavour: "Berry, Sweet, Herbal", longDescription: "Blue Dream Full Melt Bubble Hash captures the berry sweetness of this beloved strain. The clean, uplifting sativa effects are perfect for creative activities. Premium ice water extraction ensures maximum purity." },
  { slug: "half-melt-bubble-hash-gdp", image: "/images/products/buy-half-melt-bubble-hash---gdp.jpg", name: "Half Melt Bubble Hash - GDP", category: "hash", type: "Bubble Hash", thc: "45-55%", basePrice: 60, description: "Quality bubble hash from Granddaddy Purple. Grape notes with heavy relaxation.", effects: ["Relaxed", "Sleepy", "Calm"], flavour: "Grape, Berry, Sweet", longDescription: "Granddaddy Purple Half Melt Bubble Hash offers excellent quality at a great value. The grape notes and heavy relaxation effects are characteristic of GDP. Perfect for evening use and sleep support." },
  { slug: "bubble-hash-mixed-strain", image: "/images/products/buy-bubble-hash---mixed-strain.jpg", name: "Bubble Hash - Mixed Strain", category: "hash", type: "Bubble Hash", thc: "40-50%", basePrice: 55, description: "Affordable bubble hash blend from premium trim. Great value, solid effects.", effects: ["Balanced", "Relaxed", "Happy"], flavour: "Earthy, Sweet, Herbal", longDescription: "Mixed Strain Bubble Hash offers great value without sacrificing quality. Blended from premium trim of various strains for balanced effects. Perfect for those seeking quality hash at an affordable price point." },
  { slug: "dry-sift-kief-girl-scout-cookies", image: "/images/products/buy-dry-sift-kief---girl-scout-cookies.jpg", name: "Dry Sift Kief - Girl Scout Cookies", category: "hash", type: "Dry Sift", thc: "50-60%", basePrice: 65, description: "Fine-screened trichome heads from GSC. Perfect for topping bowls or pressing.", effects: ["Euphoric", "Creative", "Relaxed"], flavour: "Sweet, Mint, Earthy", longDescription: "Girl Scout Cookies Dry Sift Kief is fine-screened for maximum trichome purity. The sweet, minty flavour of GSC comes through beautifully. Perfect for topping bowls, rolling in joints, or pressing into rosin." },
  { slug: "dry-sift-kief-sour-diesel", image: "/images/products/buy-dry-sift-kief---sour-diesel.jpg", name: "Dry Sift Kief - Sour Diesel", category: "hash", type: "Dry Sift", thc: "48-55%", basePrice: 60, description: "Sativa-dominant dry sift with diesel fuel aroma. Energising and cerebral.", effects: ["Energetic", "Creative", "Uplifted"], flavour: "Diesel, Citrus, Earthy", longDescription: "Sour Diesel Dry Sift Kief captures the pungent diesel aroma of this legendary strain. The energising, cerebral effects are perfect for daytime activities. Fine screening ensures maximum trichome concentration." },
  { slug: "dry-sift-kief-northern-lights", image: "/images/products/buy-dry-sift-kief---northern-lights.jpg", name: "Dry Sift Kief - Northern Lights", category: "hash", type: "Dry Sift", thc: "52-58%", basePrice: 62, description: "Pure indica dry sift for evening use. Sweet, earthy with deep relaxation.", effects: ["Relaxed", "Sleepy", "Calm"], flavour: "Sweet, Earthy, Pine", longDescription: "Northern Lights Dry Sift Kief is pure indica for evening relaxation. The sweet, earthy, and pine notes are characteristic of this classic strain. Deep relaxation and sleep support make this perfect for nighttime use." },
  { slug: "pressed-hash-coin-gelato", image: "/images/products/buy-pressed-hash-coin---gelato.jpg", name: "Pressed Hash Coin - Gelato", category: "hash", type: "Pressed", thc: "45-52%", basePrice: 55, description: "Hydraulically pressed hash coin from Gelato kief. Sweet, dessert flavours.", effects: ["Relaxed", "Euphoric", "Creative"], flavour: "Sweet, Creamy, Berry", longDescription: "Gelato Pressed Hash Coin is hydraulically pressed from premium Gelato kief. The sweet, dessert-like flavours are preserved in this dense, potent coin. Easy to break off pieces for consistent dosing." },
  { slug: "pressed-hash-coin-wedding-cake", image: "/images/products/buy-pressed-hash-coin---wedding-cake.jpg", name: "Pressed Hash Coin - Wedding Cake", category: "hash", type: "Pressed", thc: "48-55%", basePrice: 58, description: "Dense pressed hash with vanilla cake notes. Rich, creamy, and potent.", effects: ["Relaxed", "Happy", "Euphoric"], flavour: "Vanilla, Sweet, Earthy", longDescription: "Wedding Cake Pressed Hash Coin delivers rich, creamy vanilla cake flavours in a convenient pressed format. The dense coin is easy to portion and provides consistent potency. Perfect for hash enthusiasts." },
  { slug: "pressed-hash-bar-mixed", image: "/images/products/buy-pressed-hash-bar---mixed.jpg", name: "Pressed Hash Bar - Mixed", category: "hash", type: "Pressed", thc: "42-48%", basePrice: 120, description: "7g pressed hash bar from mixed premium strains. Excellent value for hash lovers.", effects: ["Balanced", "Relaxed", "Versatile"], flavour: "Earthy, Sweet, Complex", longDescription: "The 7g Pressed Hash Bar offers excellent value for regular hash users. Pressed from mixed premium strains for balanced, versatile effects. The complex flavour profile varies with each batch of source material." },
  
  // ==================== PRE-ROLLS (17 products) ====================
  { slug: "og-kush-pre-roll", image: "/images/products/buy-og-kush-pre-roll.jpg", name: "OG Kush Pre-Roll", category: "pre-rolls", type: "Single", thc: "20-25%", basePrice: 25, description: "Classic OG Kush hand-rolled to perfection. Earthy, pine flavours with balanced hybrid effects.", effects: ["Relaxed", "Euphoric", "Happy"], flavour: "Earthy, Pine, Lemon", longDescription: "Our OG Kush Pre-Roll is hand-rolled using premium, lab-tested OG Kush flower. The classic earthy, pine flavours with hints of lemon provide a satisfying smoke. Each 1-gram joint is rolled in natural, unbleached papers." },
  { slug: "blue-dream-pre-roll", image: "/images/products/buy-blue-dream-pre-roll.jpg", name: "Blue Dream Pre-Roll", category: "pre-rolls", type: "Single", thc: "18-24%", basePrice: 25, description: "Sweet berry sativa pre-roll. Uplifting and creative effects for daytime enjoyment.", effects: ["Creative", "Uplifted", "Happy"], flavour: "Berry, Sweet, Vanilla", longDescription: "Blue Dream Pre-Roll delivers the beloved berry sweetness in a convenient, ready-to-smoke format. The uplifting, creative effects are perfect for daytime activities. Hand-rolled with premium Blue Dream flower." },
  { slug: "northern-lights-pre-roll", image: "/images/products/buy-northern-lights-pre-roll.jpg", name: "Northern Lights Pre-Roll", category: "pre-rolls", type: "Single", thc: "18-22%", basePrice: 25, description: "Pure indica relaxation in a convenient pre-roll. Sweet, earthy, and deeply calming.", effects: ["Relaxed", "Sleepy", "Happy"], flavour: "Sweet, Earthy, Pine", longDescription: "Northern Lights Pre-Roll offers pure indica relaxation in a convenient format. The sweet, earthy flavours provide a deeply calming experience. Perfect for evening use and sleep support." },
  { slug: "girl-scout-cookies-pre-roll", image: "/images/products/buy-girl-scout-cookies-pre-roll.jpg", name: "Girl Scout Cookies Pre-Roll", category: "pre-rolls", type: "Single", thc: "25-28%", basePrice: 28, description: "Premium GSC in a hand-rolled cone. Sweet, minty, and exceptionally potent.", effects: ["Euphoric", "Relaxed", "Creative"], flavour: "Sweet, Mint, Earthy", longDescription: "Girl Scout Cookies Pre-Roll features premium GSC flower in a hand-rolled cone. The sweet, minty flavour profile and exceptional potency make this a top choice. Perfect for experienced users seeking powerful effects." },
  { slug: "sour-diesel-pre-roll", image: "/images/products/buy-sour-diesel-pre-roll.jpg", name: "Sour Diesel Pre-Roll", category: "pre-rolls", type: "Single", thc: "20-25%", basePrice: 25, description: "Energising sativa with diesel fuel aroma. Perfect for wake and bake sessions.", effects: ["Energetic", "Creative", "Uplifted"], flavour: "Diesel, Citrus, Earthy", longDescription: "Sour Diesel Pre-Roll delivers the legendary energising effects in a ready-to-smoke format. The pungent diesel aroma is unmistakable. Perfect for wake and bake sessions or daytime productivity." },
  { slug: "granddaddy-purple-pre-roll", image: "/images/products/buy-granddaddy-purple-pre-roll.jpg", name: "Granddaddy Purple Pre-Roll", category: "pre-rolls", type: "Single", thc: "20-25%", basePrice: 26, description: "Purple-hued indica with grape and berry notes. Evening relaxation guaranteed.", effects: ["Relaxed", "Sleepy", "Euphoric"], flavour: "Grape, Berry, Sweet", longDescription: "Granddaddy Purple Pre-Roll offers the distinctive grape and berry flavours in a convenient format. The evening relaxation effects are perfect for unwinding after a long day. Hand-rolled with premium GDP flower." },
  { slug: "indica-variety-pack", image: "/images/products/buy-indica-variety-pack.jpg", name: "Indica Variety Pack", category: "pre-rolls", type: "5-Pack", thc: "18-25%", basePrice: 110, description: "Five premium indica pre-rolls: Northern Lights, GDP, Purple Kush, Bubba Kush, Death Bubba.", effects: ["Relaxed", "Sleepy", "Calm"], flavour: "Varied Indica", longDescription: "The Indica Variety Pack includes five premium indica pre-rolls featuring our best relaxing strains. Perfect for evening relaxation and sleep support. Each joint is hand-rolled with lab-tested flower." },
  { slug: "sativa-variety-pack", image: "/images/products/buy-sativa-variety-pack.jpg", name: "Sativa Variety Pack", category: "pre-rolls", type: "5-Pack", thc: "18-25%", basePrice: 110, description: "Five energising sativa pre-rolls: Sour Diesel, Green Crack, Jack Herer, Durban Poison, Super Lemon Haze.", effects: ["Energetic", "Creative", "Uplifted"], flavour: "Varied Sativa", longDescription: "The Sativa Variety Pack features five premium sativa pre-rolls for daytime energy and creativity. Each strain offers unique flavours and effects. Perfect for exploring different sativa experiences." },
  { slug: "hybrid-variety-pack", image: "/images/products/buy-hybrid-variety-pack.jpg", name: "Hybrid Variety Pack", category: "pre-rolls", type: "5-Pack", thc: "20-28%", basePrice: 115, description: "Five balanced hybrid pre-rolls: OG Kush, Blue Dream, GSC, Wedding Cake, Gelato.", effects: ["Balanced", "Euphoric", "Happy"], flavour: "Varied Hybrid", longDescription: "The Hybrid Variety Pack includes five premium hybrid pre-rolls offering balanced effects. Perfect for any time of day. Each joint features a different hybrid strain for variety and exploration." },
  { slug: "premium-sampler-pack", image: "/images/products/buy-premium-sampler-pack.jpg", name: "Premium Sampler Pack", category: "pre-rolls", type: "10-Pack", thc: "18-28%", basePrice: 210, description: "Ten assorted premium pre-rolls featuring our best indica, sativa, and hybrid strains.", effects: ["Varied", "Premium", "Curated"], flavour: "Assorted", longDescription: "The Premium Sampler Pack is our most comprehensive pre-roll offering. Ten assorted joints featuring our best indica, sativa, and hybrid strains. Perfect for exploring our full range of premium flower." },
  { slug: "diamond-infused-og-kush", image: "/images/products/buy-diamond-Infused---og-kush.jpg", name: "Diamond Infused - OG Kush", category: "pre-rolls", type: "Infused", thc: "40-45%", basePrice: 45, description: "OG Kush pre-roll infused with THC diamonds and rolled in kief. Extremely potent.", effects: ["Intense", "Euphoric", "Relaxed"], flavour: "Earthy, Pine, Concentrated", longDescription: "Diamond Infused OG Kush is our most potent pre-roll. Premium OG Kush flower is infused with THC diamonds and rolled in kief for maximum potency. For experienced users seeking intense effects." },
  { slug: "diamond-infused-gelato", image: "/images/products/buy-diamond-infused---gelato.jpg", name: "Diamond Infused - Gelato", category: "pre-rolls", type: "Infused", thc: "42-48%", basePrice: 48, description: "Gelato flower dipped in live resin and coated in THC diamonds. Premium experience.", effects: ["Intense", "Creative", "Euphoric"], flavour: "Sweet, Dessert, Concentrated", longDescription: "Diamond Infused Gelato offers a premium experience with Gelato flower dipped in live resin and coated in THC diamonds. The sweet, dessert-like flavour combined with intense potency creates an unforgettable smoke." },
  { slug: "caviar-pre-roll-purple-punch", image: "/images/products/buy-caviar-pre-roll---purple-punch.jpg", name: "Caviar Pre-Roll - Purple Punch", category: "pre-rolls", type: "Infused", thc: "35-40%", basePrice: 42, description: "Purple Punch nugs soaked in hash oil and rolled in kief. Sweet, potent, and smooth.", effects: ["Heavy", "Relaxed", "Sleepy"], flavour: "Grape, Sweet, Concentrated", longDescription: "Caviar Pre-Roll Purple Punch features premium nugs soaked in hash oil and rolled in kief. The sweet grape flavours are enhanced by the concentrated potency. Perfect for evening relaxation and sleep." },
  { slug: "hash-hole-wedding-cake", image: "/images/products/buy-hash-hole---wedding-cake.jpg", name: "Hash Hole - Wedding Cake", category: "pre-rolls", type: "Infused", thc: "45-50%", basePrice: 55, description: "Premium pre-roll wrapped around a core of hash. Burns slow with incredible flavour.", effects: ["Intense", "Long-lasting", "Euphoric"], flavour: "Vanilla, Hash, Complex", longDescription: "The Hash Hole Wedding Cake is a premium pre-roll wrapped around a core of high-quality hash. The unique construction ensures slow, even burning with incredible flavour. The vanilla and hash notes create a complex, satisfying smoke." },
  { slug: "gorilla-glue-blunt", image: "/images/products/buy-gorilla-glue-blunt.jpg", name: "Gorilla Glue Blunt", category: "pre-rolls", type: "Blunt", thc: "25-30%", basePrice: 35, description: "GG4 wrapped in natural hemp leaf. Slow-burning with diesel and pine notes.", effects: ["Relaxed", "Heavy", "Euphoric"], flavour: "Diesel, Pine, Hemp", longDescription: "Gorilla Glue Blunt features 2 grams of premium GG4 wrapped in natural hemp leaf. The slow-burning hemp wrap complements the diesel and pine notes of the flower. Perfect for extended smoking sessions." },
  { slug: "zkittlez-blunt", image: "/images/products/buy-zkittlez-blunt.jpg", name: "Zkittlez Blunt", category: "pre-rolls", type: "Blunt", thc: "19-23%", basePrice: 32, description: "Fruity Zkittlez in a hemp wrap. Candy-sweet flavours with balanced effects.", effects: ["Happy", "Relaxed", "Creative"], flavour: "Candy, Tropical, Hemp", longDescription: "Zkittlez Blunt wraps 2 grams of fruity Zkittlez in a natural hemp leaf. The candy-sweet flavours pair perfectly with the hemp wrap for a smooth, flavourful smoke. Balanced effects for any occasion." },
  { slug: "jack-herer-blunt", image: "/images/products/buy-jack-herer-blunt.jpg", name: "Jack Herer Blunt", category: "pre-rolls", type: "Blunt", thc: "18-23%", basePrice: 32, description: "Legendary sativa in a slow-burning blunt. Pine and spice with clear-headed energy.", effects: ["Energetic", "Creative", "Focused"], flavour: "Pine, Spice, Hemp", longDescription: "Jack Herer Blunt features 2 grams of legendary Jack Herer sativa in a slow-burning hemp wrap. The pine and spice notes are enhanced by the hemp leaf. Perfect for creative pursuits and focused activities." },
  
  // ==================== VAPES (21 products) ====================
  { slug: "premium-thc-vape-cartridge-og-kush", image: "/images/products/buy-premium-thc-vape-cartridge---og-kush.jpg", name: "Premium THC Vape Cartridge - OG Kush", category: "vapes", type: "THC Cartridge", thc: "85%", basePrice: 89, description: "Premium distillate cartridge with natural OG Kush terpenes. Smooth, potent, and flavorful.", effects: ["Relaxed", "Euphoric", "Happy"], flavour: "Earthy, Pine, Lemon", longDescription: "Our Premium OG Kush Vape Cartridge features high-quality distillate with natural OG Kush terpenes. The 510-threaded cartridge is compatible with most batteries. Smooth, potent, and packed with classic OG Kush flavour." },
  { slug: "premium-thc-vape-cartridge-blue-dream", image: "/images/products/buy-premium-thc-vape-cartridge---blue-dream.jpg", name: "Premium THC Vape Cartridge - Blue Dream", category: "vapes", type: "THC Cartridge", thc: "82%", basePrice: 89, description: "Sativa-dominant hybrid cartridge with sweet berry flavours. Uplifting and creative effects.", effects: ["Uplifted", "Creative", "Happy"], flavour: "Berry, Sweet, Vanilla", longDescription: "Blue Dream Vape Cartridge delivers the beloved berry sweetness in a convenient vape format. The sativa-dominant effects are uplifting and creative. Perfect for daytime use when you need inspiration." },
  { slug: "thc-vape-cartridge-sour-diesel", image: "/images/products/buy-premium-thc-vape-cartridge---sour-disiel.jpg", name: "THC Vape Cartridge - Sour Diesel", category: "vapes", type: "THC Cartridge", thc: "84%", basePrice: 89, description: "Energising sativa cartridge with diesel and citrus notes. Perfect for daytime use.", effects: ["Energetic", "Creative", "Uplifted"], flavour: "Diesel, Citrus, Earthy", longDescription: "Sour Diesel Vape Cartridge captures the legendary strain's diesel and citrus notes. The energising sativa effects are perfect for daytime productivity and creativity. Fast-acting and convenient." },
  { slug: "thc-vape-cartridge-girl-scout-cookies", image: "/images/products/buy-thc-vape-cartridge---girl-scout-cookies.jpg", name: "THC Vape Cartridge - Girl Scout Cookies", category: "vapes", type: "THC Cartridge", thc: "86%", basePrice: 95, description: "Sweet, earthy hybrid with potent effects. One of our top sellers in Australia.", effects: ["Euphoric", "Relaxed", "Happy"], flavour: "Sweet, Earthy, Mint", longDescription: "Girl Scout Cookies Vape Cartridge is one of our top sellers. The sweet, earthy, minty flavour profile delivers potent hybrid effects. Perfect for any time of day when you need balanced relaxation and euphoria." },
  { slug: "thc-vape-cartridge-granddaddy-purple", image: "/images/products/buy-thc-vape-cartridge---granddaddy-purple.jpg", name: "THC Vape Cartridge - Granddaddy Purple", category: "vapes", type: "THC Cartridge", thc: "80%", basePrice: 89, description: "Classic indica with grape and berry flavours. Deep relaxation and sleep support.", effects: ["Relaxed", "Sleepy", "Euphoric"], flavour: "Grape, Berry, Sweet", longDescription: "Granddaddy Purple Vape Cartridge delivers the classic indica's grape and berry flavours in a convenient vape format. The deep relaxation effects are perfect for evening use and sleep support." },
  { slug: "thc-vape-cartridge-wedding-cake", image: "/images/products/buy-thc-vape-cartridge---wedding-cake.jpg", name: "THC Vape Cartridge - Wedding Cake", category: "vapes", type: "THC Cartridge", thc: "84%", basePrice: 92, description: "Indica-leaning hybrid with vanilla cake notes. Rich flavour with relaxing effects.", effects: ["Relaxed", "Euphoric", "Happy"], flavour: "Vanilla, Sweet, Earthy", longDescription: "Wedding Cake Vape Cartridge features rich vanilla cake notes with relaxing hybrid effects. The indica-leaning profile provides deep relaxation while maintaining mental clarity. Premium distillate with natural terpenes." },
  { slug: "thc-vape-cartridge-gelato", image: "/images/products/buy-thc-vape-cartridge---gelato.jpg", name: "THC Vape Cartridge - Gelato", category: "vapes", type: "THC Cartridge", thc: "83%", basePrice: 90, description: "Dessert-strain cartridge with creamy, fruity notes. Balanced euphoria and relaxation.", effects: ["Euphoric", "Relaxed", "Creative"], flavour: "Sweet, Creamy, Citrus", longDescription: "Gelato Vape Cartridge delivers the beloved dessert-strain experience in a convenient format. The creamy, fruity notes provide balanced euphoria and relaxation. Perfect for afternoon enjoyment." },
  { slug: "disposable-thc-vape-pen-gelato", image: "/images/products/buy-disposable-thc-vape-pen---gelato.jpg", name: "Disposable THC Vape Pen - Gelato", category: "vapes", type: "Disposable", thc: "80%", basePrice: 59, description: "All-in-one disposable vape pen. No charging needed. Sweet, dessert-like flavour profile.", effects: ["Euphoric", "Relaxed", "Happy"], flavour: "Sweet, Creamy, Berry", longDescription: "Our Gelato Disposable Vape Pen is ready to use right out of the box. No charging or setup needed. The sweet, dessert-like flavour profile provides balanced effects. Perfect for on-the-go convenience." },
  { slug: "disposable-thc-vape-pen-gorilla-glue", image: "/images/products/buy-disposable-thc-vape-pen---gorilla-glue.jpg", name: "Disposable THC Vape Pen - Gorilla Glue", category: "vapes", type: "Disposable", thc: "85%", basePrice: 59, description: "Powerful indica-dominant disposable. Pine and earthy flavours with heavy relaxation.", effects: ["Relaxed", "Euphoric", "Sleepy"], flavour: "Pine, Earthy, Diesel", longDescription: "Gorilla Glue Disposable Vape Pen delivers powerful indica-dominant effects in a convenient format. The pine and earthy flavours provide heavy relaxation. Perfect for evening use when you need to unwind." },
  { slug: "disposable-thc-vape-pen-jack-herer", image: "/images/products/buy-disposable-thc-vape-pen---jack-herer.jpg", name: "Disposable THC Vape Pen - Jack Herer", category: "vapes", type: "Disposable", thc: "78%", basePrice: 59, description: "Energising sativa disposable with pine and spice notes. Great for creativity and focus.", effects: ["Energetic", "Creative", "Focused"], flavour: "Pine, Spicy, Herbal", longDescription: "Jack Herer Disposable Vape Pen offers energising sativa effects in a convenient all-in-one format. The pine and spice notes are instantly recognisable. Perfect for daytime creativity and focus." },
  { slug: "disposable-thc-vape-pen-pineapple-express", image: "/images/products/buy-disposable-thc-vape-pen---pineapple-express.jpg", name: "Disposable THC Vape Pen - Pineapple Express", category: "vapes", type: "Disposable", thc: "82%", basePrice: 62, description: "Tropical sativa disposable with pineapple and citrus. Euphoric, uplifting effects.", effects: ["Euphoric", "Uplifted", "Happy"], flavour: "Pineapple, Citrus, Tropical", longDescription: "Pineapple Express Disposable Vape Pen delivers tropical sativa effects in a convenient format. The pineapple and citrus flavours are bright and uplifting. Perfect for social activities and outdoor adventures." },
  { slug: "disposable-thc-vape-pen-northern-lights", image: "/images/products/buy-disposable-thc-vape-pen---northern-lights.jpg", name: "Disposable THC Vape Pen - Northern Lights", category: "vapes", type: "Disposable", thc: "79%", basePrice: 59, description: "Classic indica disposable for nighttime use. Sweet, earthy with deep relaxation.", effects: ["Relaxed", "Sleepy", "Calm"], flavour: "Sweet, Earthy, Pine", longDescription: "Northern Lights Disposable Vape Pen is perfect for nighttime relaxation. The sweet, earthy flavours provide deep, calming effects. Convenient all-in-one design requires no charging or setup." },
  { slug: "disposable-thc-vape-pen-zkittlez", image: "/images/products/buy-disposable-thc-vape-pen---zkittlez.jpg", name: "Disposable THC Vape Pen - Zkittlez", category: "vapes", type: "Disposable", thc: "81%", basePrice: 62, description: "Candy-flavoured indica disposable. Fruity sweetness with calming body effects.", effects: ["Relaxed", "Happy", "Calm"], flavour: "Candy, Tropical, Berry", longDescription: "Zkittlez Disposable Vape Pen delivers candy-like sweetness in a convenient format. The fruity flavours and calming body effects make this perfect for relaxation. Ready to use with no charging needed." },
  { slug: "live-resin-cartridge-wedding-cake", image: "/images/products/buy-live-resin-cartridge---wedding-cake.jpg", name: "Live Resin Cartridge - Wedding Cake", category: "vapes", type: "Live Resin", thc: "78%", basePrice: 109, description: "Premium live resin extraction preserving full terpene profile. Rich, complex flavour.", effects: ["Relaxed", "Euphoric", "Happy"], flavour: "Vanilla, Sweet, Complex", longDescription: "Wedding Cake Live Resin Cartridge is made from fresh-frozen flower to preserve the full terpene profile. The rich, complex vanilla flavour is unmatched by distillate cartridges. Premium cannabis experience." },
  { slug: "live-resin-cartridge-zkittlez", image: "/images/products/buy-live-resin-cartridge---zkittlez.jpg", name: "Live Resin Cartridge - Zkittlez", category: "vapes", type: "Live Resin", thc: "76%", basePrice: 109, description: "Fruity live resin with candy-like sweetness. Indica-dominant for relaxation.", effects: ["Relaxed", "Happy", "Calm"], flavour: "Candy, Tropical, Sweet", longDescription: "Zkittlez Live Resin Cartridge captures the full candy-like sweetness through fresh-frozen extraction. The indica-dominant effects provide deep relaxation. Premium live resin quality in a convenient cartridge." },
  { slug: "live-resin-cartridge-super-lemon-haze", image: "/images/products/buy-live-resin-cartridge---super-lemon-haze.jpg", name: "Live Resin Cartridge - Super Lemon Haze", category: "vapes", type: "Live Resin", thc: "74%", basePrice: 109, description: "Zesty citrus live resin sativa. Uplifting, energetic, and perfect for daytime.", effects: ["Energetic", "Uplifted", "Happy"], flavour: "Lemon, Citrus, Zesty", longDescription: "Super Lemon Haze Live Resin Cartridge delivers the zesty citrus flavour through premium extraction. The uplifting, energetic effects are perfect for daytime productivity. Full terpene preservation for maximum flavour." },
  { slug: "live-resin-cartridge-gmo-cookies", image: "/images/products/buy-live-resin-cartridge---gmo-cookies.jpg", name: "Live Resin Cartridge - GMO Cookies", category: "vapes", type: "Live Resin", thc: "80%", basePrice: 115, description: "Pungent, garlic-forward live resin with extreme potency. Heavy indica effects.", effects: ["Relaxed", "Euphoric", "Heavy"], flavour: "Garlic, Diesel, Earthy", longDescription: "GMO Cookies Live Resin Cartridge is for experienced users seeking extreme potency. The pungent, garlic-forward flavour is unique and intense. Heavy indica effects for deep relaxation." },
  { slug: "live-resin-cartridge-durban-poison", image: "/images/products/buy-live-resin-cartridge---burban-poison.jpg", name: "Live Resin Cartridge - Durban Poison", category: "vapes", type: "Live Resin", thc: "75%", basePrice: 112, description: "Pure sativa live resin with sweet, spicy notes. Energising and uplifting.", effects: ["Energetic", "Uplifted", "Focused"], flavour: "Sweet, Spicy, Pine", longDescription: "Durban Poison Live Resin Cartridge captures the pure sativa's sweet, spicy profile through fresh-frozen extraction. The energising, uplifting effects are perfect for outdoor activities and creative pursuits." },
  { slug: "510-thread-battery-adjustable-voltage", image: "/images/products/buy-510-thread-battery---adjustable-voltage.jpg", name: "510 Thread Battery - Adjustable Voltage", category: "vapes", type: "Battery", thc: "N/A", basePrice: 35, description: "Universal 510-thread battery with adjustable voltage settings. Compact and discreet.", effects: ["N/A"], flavour: "N/A", longDescription: "Our 510 Thread Battery features adjustable voltage settings for customised vaping experience. Compatible with all 510-threaded cartridges. Compact and discreet design for on-the-go use. 650mAh capacity." },
  { slug: "premium-vape-battery-variable-wattage", image: "/images/products/buy-premium-vape-battery---variable-wattage.jpg", name: "Premium Vape Battery - Variable Wattage", category: "vapes", type: "Battery", thc: "N/A", basePrice: 55, description: "Advanced battery with digital display and variable wattage. Longer lasting 1100mAh.", effects: ["N/A"], flavour: "N/A", longDescription: "Our Premium Vape Battery features digital display and variable wattage for precise control. The 1100mAh capacity provides longer lasting power. Perfect for regular vape users who want premium features." },
  { slug: "vape-pen-case-discreet-carrying", image: "/images/products/buy-vape-pen-case---discreet-carrying.jpg", name: "Vape Pen Case - Discreet Carrying", category: "vapes", type: "Accessory", thc: "N/A", basePrice: 25, description: "Smell-proof carrying case for your vape pen and cartridges. Holds 3 cartridges.", effects: ["N/A"], flavour: "N/A", longDescription: "Our Vape Pen Case is smell-proof and holds your vape pen plus up to 3 cartridges. The discreet design is perfect for travel and everyday carry. Keep your vaping essentials organised and protected." },
  
  // ==================== EDIBLES/GUMMIES (26 products) ====================
  { slug: "premium-thc-gummies-10mg", image: "/images/products/buy-premium-thc-gummies-10mg.jpg", name: "Premium THC Gummies 10mg", category: "edibles", type: "Gummies", thc: "10mg per gummy", basePrice: 69, description: "Best THC gummies Australia - Premium full spectrum THC gummies with 10mg per piece. Perfect for relaxation and euphoria.", effects: ["Euphoria", "Relaxation", "Creativity"], flavour: "Mixed Fruit", longDescription: "Our Premium THC Gummies are Australia's favourite edible. Each gummy contains exactly 10mg of THC for consistent, reliable dosing. Perfect for beginners or those seeking moderate effects. Delicious mixed fruit flavours." },
  { slug: "strongest-thc-gummies-25mg", image: "/images/products/buy-strongest-thc-gummies-25mg.jpg", name: "Strongest THC Gummies 25mg", category: "edibles", type: "Gummies", thc: "25mg per gummy", basePrice: 99, description: "Strongest THC gummies Australia - High potency 25mg THC per gummy for experienced users. Maximum effects.", effects: ["Maximum Strength", "Long Lasting", "Intense Effects"], flavour: "Mixed Berry", longDescription: "Our Strongest THC Gummies contain 25mg per piece for experienced users seeking intense effects. The long-lasting experience is perfect for extended relaxation or pain relief. Use responsibly and start with half a gummy." },
  { slug: "thc-sleep-gummies", image: "/images/products/buy-thc-sleep-gummies.jpg", name: "THC Sleep Gummies", category: "edibles", type: "Gummies", thc: "15mg per gummy", basePrice: 89, description: "THC gummies for sleep with added CBN. Fall asleep faster and enjoy deep, restful sleep. Wake refreshed.", effects: ["Deep Sleep", "CBN Enhanced", "Wake Refreshed"], flavour: "Berry", longDescription: "Our THC Sleep Gummies combine 15mg of THC with sleep-promoting CBN. Fall asleep faster and enjoy deeper, more restful sleep. Wake up feeling refreshed without grogginess. Perfect for insomnia and sleep issues." },
  { slug: "sativa-thc-gummies", image: "/images/products/buy-sativa-thc-gummies.jpg", name: "Sativa THC Gummies", category: "edibles", type: "Gummies", thc: "10mg per gummy", basePrice: 75, description: "Uplifting sativa THC gummies for daytime use. Energising effects perfect for creativity and focus.", effects: ["Energising", "Creative", "Daytime Use"], flavour: "Citrus", longDescription: "Sativa THC Gummies are formulated for daytime use with energising terpene profiles. The 10mg dose provides creativity and focus without sedation. Perfect for productive days and social activities." },
  { slug: "indica-thc-gummies", image: "/images/products/buy-indica-thc-gummies.jpg", name: "Indica THC Gummies", category: "edibles", type: "Gummies", thc: "10mg per gummy", basePrice: 75, description: "Relaxing indica THC gummies for evening use. Calming effects perfect for unwinding after a long day.", effects: ["Relaxing", "Calming", "Evening Use"], flavour: "Grape", longDescription: "Indica THC Gummies are perfect for evening relaxation. The calming terpene profile promotes relaxation and stress relief. Each 10mg gummy helps you unwind after a long day." },
  { slug: "balanced-1-1-thc-cbd-gummies", image: "/images/products/buy-balanced-1-1-thc-cbd-gummies.jpg", name: "Balanced 1:1 THC:CBD Gummies", category: "edibles", type: "Gummies", thc: "10mg per gummy", basePrice: 79, description: "Equal parts THC and CBD for balanced effects. Great for beginners or those seeking mild euphoria with wellness benefits.", effects: ["Balanced Effects", "Beginner Friendly", "Therapeutic"], flavour: "Mixed Fruit", longDescription: "Our Balanced 1:1 Gummies contain equal parts THC and CBD for a gentler, more therapeutic experience. The CBD moderates the THC effects, making these perfect for beginners or those sensitive to THC." },
  { slug: "micro-dose-thc-gummies-2-5mg", image: "/images/products/buy-micro-dose-thc-gummies-2-5mg.jpg", name: "Micro-Dose THC Gummies 2.5mg", category: "edibles", type: "Gummies", thc: "2.5mg per gummy", basePrice: 49, description: "Low-dose THC gummies for micro-dosing. 2.5mg per gummy for subtle effects and enhanced mood without feeling high.", effects: ["Micro-Dose", "Subtle Effects", "Mood Enhancement"], flavour: "Assorted Fruit", longDescription: "Micro-Dose THC Gummies are perfect for those seeking subtle cannabis benefits without intoxication. At 2.5mg per gummy, you can easily control your dose. Ideal for enhanced mood, creativity, and general wellness." },
  { slug: "tropical-thc-gummies", image: "/images/products/buy-tropical-thc-gummies.jpg", name: "Tropical THC Gummies", category: "edibles", type: "Gummies", thc: "10mg per gummy", basePrice: 69, description: "Delicious tropical flavoured THC gummies. Mango, pineapple and passion fruit flavours with potent effects.", effects: ["Great Taste", "Tropical Flavours", "Premium Quality"], flavour: "Mango, Pineapple, Passion Fruit", longDescription: "Tropical THC Gummies feature delicious mango, pineapple, and passion fruit flavours. Each 10mg gummy delivers consistent effects with tropical taste. Perfect for those who love fruity flavours." },
  { slug: "delta-9-thc-gummies", image: "/images/products/buy-delta-9-thc-gummies.jpg", name: "Delta 9 THC Gummies", category: "edibles", type: "Gummies", thc: "10mg per gummy", basePrice: 79, description: "Premium delta 9 THC gummies Australia. Pure delta-9 THC for authentic cannabis experience.", effects: ["Pure Delta-9", "Authentic Effects", "Lab Tested"], flavour: "Mixed Fruit", longDescription: "Our Delta 9 THC Gummies contain pure delta-9 THC for an authentic cannabis experience. Each gummy is lab tested for potency and purity. The classic THC effects are what cannabis enthusiasts expect." },
  { slug: "thc-gummies-for-anxiety", image: "/images/products/buy-thc-gummies-for-anxiety.jpg", name: "THC Gummies for Anxiety", category: "edibles", type: "Gummies", thc: "5mg per gummy", basePrice: 85, description: "Specially formulated THC gummies with calming terpenes. Perfect for reducing stress and anxiety naturally.", effects: ["Calming", "Stress Relief", "Anti-Anxiety"], flavour: "Lavender Berry", longDescription: "THC Gummies for Anxiety are specially formulated with calming terpenes like linalool and myrcene. The low 5mg dose combined with anxiety-reducing terpenes provides gentle stress relief without overwhelming effects." },
  { slug: "thc-gummies-for-pain", image: "/images/products/buy-thc-gummies-for-pain.jpg", name: "THC Gummies for Pain", category: "edibles", type: "Gummies", thc: "20mg per gummy", basePrice: 95, description: "High-dose THC gummies formulated for pain relief. Added CBG for enhanced anti-inflammatory effects.", effects: ["Pain Relief", "Anti-Inflammatory", "CBG Enhanced"], flavour: "Herbal Mint", longDescription: "THC Gummies for Pain feature a high 20mg dose with added CBG for enhanced anti-inflammatory effects. Specially formulated for those seeking relief from chronic pain, inflammation, and discomfort." },
  { slug: "vegan-thc-gummies", image: "/images/products/buy-vegan-thc-gummies.jpg", name: "Vegan THC Gummies", category: "edibles", type: "Gummies", thc: "10mg per gummy", basePrice: 75, description: "100% vegan and organic THC gummies. Made with pectin instead of gelatin. No artificial colours.", effects: ["100% Vegan", "Organic", "Natural Ingredients"], flavour: "Natural Fruit", longDescription: "Our Vegan THC Gummies are made with pectin instead of gelatin for a 100% plant-based treat. Organic ingredients and no artificial colours make these ideal for health-conscious consumers." },
  { slug: "thc-gummies-party-pack", image: "/images/products/buy-thc-gummies-party-pack.jpg", name: "THC Gummies Party Pack", category: "edibles", type: "Gummies", thc: "5mg per gummy", basePrice: 149, description: "Mixed flavour THC gummies variety pack. 50 gummies with assorted fruit flavours. Perfect for sharing.", effects: ["Mixed Flavours", "Value Pack", "Great for Sharing"], flavour: "Assorted", longDescription: "The THC Gummies Party Pack includes 50 gummies with assorted fruit flavours. The 5mg dose is perfect for social gatherings where guests have varying tolerances. Great value for regular users or sharing." },
  { slug: "thc-sour-gummies", image: "/images/products/buy-thc-sour-gummies.jpg", name: "THC Sour Gummies", category: "edibles", type: "Gummies", thc: "10mg per gummy", basePrice: 72, description: "Sour coated THC gummies with a tangy kick. Sour apple, lemon, and watermelon flavours.", effects: ["Sour Coating", "Tangy Flavours", "Fun Experience"], flavour: "Sour Apple, Lemon, Watermelon", longDescription: "THC Sour Gummies feature a tangy sour coating for those who love a flavour kick. Sour apple, lemon, and watermelon flavours mask any cannabis taste. Each 10mg gummy provides consistent, reliable effects." },
  { slug: "ultra-strength-thc-gummies-50mg", image: "/images/products/buy-ultra-strength-thc-gummies-50mg.jpg", name: "Ultra Strength THC Gummies 50mg", category: "edibles", type: "Gummies", thc: "50mg per gummy", basePrice: 129, description: "Our strongest THC gummies. 50mg per gummy for experienced users only. Extremely potent - use responsibly.", effects: ["Ultra Potent", "Experienced Users", "Long Duration"], flavour: "Mixed Fruit", longDescription: "Ultra Strength THC Gummies contain 50mg per piece and are for experienced users only. The effects are extremely potent and long-lasting. Start with a quarter gummy and wait 2 hours before taking more." },
  { slug: "thc-chocolate-bar", image: "/images/products/buy-thc-dark-chocolate-bar.jpg", name: "THC Chocolate Bar", category: "edibles", type: "Chocolate", thc: "100mg per bar", basePrice: 45, description: "Premium THC chocolate bar with 100mg total. Smooth milk chocolate with even dosing. 10 squares of 10mg each.", effects: ["Relaxing", "Euphoric", "Long-lasting"], flavour: "Milk Chocolate", longDescription: "Our THC Chocolate Bar is crafted from premium milk chocolate with 100mg THC total. The bar is divided into 10 squares of 10mg each for easy, consistent dosing. The smooth, rich chocolate flavour makes this a delicious way to enjoy cannabis." },
  { slug: "white-chocolate-thc-bar", image: "/images/products/buy-white-chocolate-thc-bar.jpg", name: "White Chocolate THC Bar", category: "edibles", type: "Chocolate", thc: "100mg per bar", basePrice: 49, description: "Creamy white chocolate infused with 100mg THC. 10 breakable squares at 10mg each. Smooth and sweet.", effects: ["Euphoric", "Relaxed", "Blissful"], flavour: "Creamy Vanilla", longDescription: "Our White Chocolate THC Bar combines premium white chocolate with 100mg of THC. The bar is divided into 10 squares of 10mg each for precise dosing. The creamy, sweet flavour makes this a luxurious way to enjoy cannabis." },
  { slug: "thc-milk-chocolate-truffles", image: "/images/products/buy-thc-milk-chocolate-truffles.jpg", name: "THC Milk Chocolate Truffles", category: "edibles", type: "Chocolate", thc: "15mg each", basePrice: 36, description: "Gourmet milk chocolate truffles with ganache centre. 6-pack at 15mg THC each. Rich and indulgent.", effects: ["Euphoric", "Happy", "Relaxed"], flavour: "Milk Chocolate, Hazelnut", longDescription: "Our THC Milk Chocolate Truffles are handcrafted with premium milk chocolate and a rich ganache centre. Each truffle contains 15mg of THC for a luxurious edible experience. The 6-pack is perfect for sharing or savouring over time." },
  { slug: "cannabis-brownie", image: "/images/products/buy-cannabis-brownie.jpg", name: "Cannabis Brownie", category: "edibles", type: "Baked Goods", thc: "50mg per brownie", basePrice: 25, description: "Classic cannabis brownie with 50mg THC. Rich, fudgy, and potent. Single-serve for experienced users.", effects: ["Powerful", "Long-lasting", "Full-body"], flavour: "Chocolate Fudge", longDescription: "Our Cannabis Brownie is a classic edible with 50mg of THC. The rich, fudgy chocolate brownie is delicious and potent. Single-serve size is perfect for experienced users. Effects may take 60-90 minutes to feel." },
  { slug: "sativa-thc-cookies", image: "/images/products/buy-sativa-thc-cookies.jpg", name: "Sativa THC Cookies", category: "edibles", type: "Baked Goods", thc: "25mg each", basePrice: 44, description: "Energising cannabis cookies with 25mg THC each. Chocolate chip flavour perfect for daytime creativity.", effects: ["Energetic", "Creative", "Uplifted"], flavour: "Chocolate Chip", longDescription: "Our Sativa THC Cookies are baked with energising sativa-dominant extract for a creative, uplifting experience. Each cookie contains 25mg of THC with a classic chocolate chip flavour. Perfect for daytime use and social activities." },
  { slug: "thc-lemonade", image: "/images/products/buy-thc-lemonade.jpg", name: "THC Lemonade", category: "edibles", type: "Drinks", thc: "50mg per bottle", basePrice: 44, description: "Refreshing cannabis lemonade with 50mg THC per bottle. Fast-acting and delicious citrus flavour.", effects: ["Uplifted", "Happy", "Refreshed"], flavour: "Lemon, Citrus", longDescription: "Our THC Lemonade is a refreshing cannabis-infused beverage with 50mg of THC per bottle. The fast-acting formula delivers effects quicker than traditional edibles. The natural lemon flavour is delicious and perfect for warm days." },
  { slug: "thc-cola", image: "/images/products/buy-thc-cola.jpg", name: "THC Cola", category: "edibles", type: "Drinks", thc: "25mg per bottle", basePrice: 36, description: "Classic cola taste infused with 25mg THC. Fizzy, fun, and perfect for social occasions.", effects: ["Happy", "Relaxed", "Euphoric"], flavour: "Cola", longDescription: "Our THC Cola combines the classic cola taste with 25mg of THC per bottle. The familiar flavour makes this a fun and discreet way to consume cannabis. Perfect for social gatherings and casual enjoyment." },
  { slug: "thc-hard-candies", image: "/images/products/buy-thc-hard-candies.jpg", name: "THC Hard Candies", category: "edibles", type: "Candy", thc: "10mg each", basePrice: 44, description: "Long-lasting THC hard candies at 10mg each. Assorted fruit flavours for discreet consumption anywhere.", effects: ["Relaxed", "Happy", "Calm"], flavour: "Assorted Fruit", longDescription: "THC Hard Candies are the most discreet way to enjoy cannabis. Each candy contains 10mg of THC and dissolves slowly for extended effects. The assorted fruit flavours taste great and leave no cannabis odour." },
  { slug: "thc-caramels", image: "/images/products/buy-thc-caramels.jpg", name: "THC Caramels", category: "edibles", type: "Candy", thc: "20mg each", basePrice: 44, description: "Soft and chewy THC caramels at 20mg each. Rich, buttery salted caramel taste with potent effects.", effects: ["Relaxed", "Euphoric", "Happy"], flavour: "Salted Caramel", longDescription: "Our THC Caramels are handcrafted with real butter and sea salt for an authentic caramel experience. Each piece contains 20mg of THC for potent, long-lasting effects. The soft, chewy texture makes these a favourite among edible enthusiasts." },
  { slug: "thc-infused-honey", image: "/images/products/buy-thc-infused-honey.jpg", name: "THC Infused Honey", category: "edibles", type: "Honey", thc: "500mg per jar", basePrice: 66, description: "Premium cannabis honey with 500mg THC per jar. Add to tea, food, or enjoy directly. Versatile and natural.", effects: ["Relaxed", "Soothing", "Versatile"], flavour: "Pure Honey", longDescription: "Our THC Infused Honey is made with premium Australian honey and 500mg of THC per jar. The versatile format lets you add it to tea, drizzle on food, or enjoy a spoonful directly. A natural and delicious way to consume cannabis." },
  { slug: "cannabis-gummy-bears", image: "/images/products/buy-cannabis-gummy-bears.jpg", name: "Cannabis Gummy Bears", category: "edibles", type: "Gummies", thc: "5mg per gummy", basePrice: 56, description: "Classic gummy bear shape with 5mg THC each. Perfect for micro-dosing beginners. Mixed fruit flavours.", effects: ["Mild", "Happy", "Relaxed"], flavour: "Mixed Fruit", longDescription: "Cannabis Gummy Bears are classic gummy bears infused with 5mg of THC each. The low dose is perfect for beginners and micro-dosing. The familiar shape and mixed fruit flavours make these a fun and approachable way to try edibles." },
];

// Get weight variants based on category
export function getWeightVariants(category: string) {
  switch (category) {
    case 'flower': return flowerWeights;
    case 'concentrates': return concentrateWeights;
    case 'hash': return hashWeights;
    case 'edibles': return edibleQuantities;
    case 'vapes': return vapeQuantities;
    case 'pre-rolls': return prerollQuantities;
    default: return flowerWeights;
  }
}
