export type SeoGuideSection = {
  heading: string;
  body: string[];
  bullets?: string[];
};

export type SeoGuideFaq = {
  question: string;
  answer: string;
};

export type SeoGuideLink = {
  href: string;
  label: string;
  detail: string;
};

export type SeoGuide = {
  slug: string;
  title: string;
  description: string;
  heroLabel: string;
  h1: string;
  intro: string;
  stats: { value: string; label: string }[];
  sections: SeoGuideSection[];
  faqs: SeoGuideFaq[];
  relatedLinks: SeoGuideLink[];
};

export const seoGuides: SeoGuide[] = [
  {
    slug: 'thc-gummies-sydney',
    title: 'THC Gummies Sydney | Delivery, Dosing & Buying Guide',
    description: 'A Sydney-focused THC gummies guide covering product fit, dosing expectations, discreet delivery timing, and support links before you order.',
    heroLabel: 'Product + City',
    h1: 'THC Gummies Sydney: What Buyers Usually Want to Know First',
    intro: 'Sydney searchers tend to stack several intents into one query: they want THC gummies, local relevance, clear dose guidance, and confidence around discreet delivery. This page exists to answer those questions in one place and route people to the right commercial and support pages without making them guess.',
    stats: [
      { value: '10mg+', label: 'Common Gummy Strengths' },
      { value: '2-5 Days', label: 'Standard Sydney Delivery' },
      { value: 'Bank + BTC', label: 'Checkout Options' }
    ],
    sections: [
      {
        heading: 'Which gummies make sense for Sydney buyers?',
        body: [
          'The best fit depends less on the city and more on the kind of experience you are trying to get from the product. A lower-dose gummy suits customers who want a more controlled start, while higher-dose options are better left to people who already know how edibles land for them.',
          'If the priority is starting cautiously, the micro-dose and 10mg options are the simplest route. If the priority is sleep, evening use, or stronger effects, the higher-potency and sleep-focused ranges make more sense than buying on price alone.'
        ],
        bullets: [
          'Start low if you are new to edibles or have not used them recently.',
          'Expect slower onset than inhaled products and avoid redosing too early.',
          'Use the category page to compare strengths, flavours, and intended use side by side.'
        ]
      },
      {
        heading: 'What does delivery to Sydney usually look like?',
        body: [
          'The main practical questions are dispatch speed, discreet packaging, and tracking. Those are handled on the shipping page so the delivery promise is documented instead of being buried in checkout.',
          'Metro Sydney orders generally follow the same national process: plain outer packaging, tracked shipping, and signature handling where required. That gives this page a city angle without pretending there is a separate Sydney-only warehouse or service model.'
        ]
      },
      {
        heading: 'How to compare before ordering',
        body: [
          'Google-style comparison searches usually signal hesitation, not lack of buying intent. People are comparing beginner-friendly THC gummies against stronger options, or gummies against faster-onset formats like vapes.',
          'The cleanest way to reduce that friction is to move them from this city page into the dosing guide, the comparison guide, and the main THC gummies collection so they can answer the final question without another search.'
        ]
      }
    ],
    faqs: [
      {
        question: 'How long does THC gummy delivery to Sydney take?',
        answer: 'Standard delivery is usually aligned with the published national window shown on the shipping page, with express available at checkout when offered.'
      },
      {
        question: 'What is the safest THC gummy starting dose?',
        answer: 'For most beginners, the lowest-dose products are the better starting point because edibles take longer to peak and are easier to overdo when you redose too early.'
      },
      {
        question: 'Where should I compare Sydney THC gummy options?',
        answer: 'Start with the THC gummies category page, then use the dosage guide if you need help narrowing by strength or effect profile.'
      }
    ],
    relatedLinks: [
      { href: '/shop/thc-gummies/', label: 'Shop THC Gummies', detail: 'Full category with strength and use-case options.' },
      { href: '/guides/thc-gummies-dosage-guide/', label: 'Read the Dosage Guide', detail: 'Beginner, moderate, and stronger edible expectations.' },
      { href: '/shipping-and-delivery/', label: 'Check Delivery Details', detail: 'Dispatch windows, tracking, and packaging standards.' }
    ]
  },
  {
    slug: 'thc-gummies-melbourne',
    title: 'THC Gummies Melbourne | Product Types, Delivery & Support',
    description: 'Melbourne-focused THC gummies guide covering product selection, edible strength differences, support content, and discreet delivery expectations.',
    heroLabel: 'Product + City',
    h1: 'THC Gummies Melbourne: Best Entry Points for Local Searchers',
    intro: 'Melbourne buyers often search with a product and city together because they want a local-feeling answer before they click into a national store. This guide gives that context while keeping the claims grounded in the same site-wide shipping, payment, and support workflow used everywhere else.',
    stats: [
      { value: '2.5mg-50mg', label: 'Dose Range Covered' },
      { value: '24-48hr', label: 'Typical Dispatch Window' },
      { value: 'Email Support', label: 'Pre-Order Questions' }
    ],
    sections: [
      {
        heading: 'Product choice matters more than city labels',
        body: [
          'A Melbourne landing page should help buyers choose between product types instead of repeating the same broad city copy. The useful split is beginner vs strong, daytime vs evening, and wellness-style blends vs straightforward THC gummies.',
          'That approach captures local search terms while still moving people toward the correct category or product page, which is where the commercial intent actually resolves.'
        ],
        bullets: [
          'Micro-dose gummies work better for cautious first orders.',
          'Balanced THC:CBD gummies suit people looking for a softer profile.',
          'High-potency gummies are better compared carefully before checkout.'
        ]
      },
      {
        heading: 'What Melbourne searchers need before checkout',
        body: [
          'Most hesitation sits around two issues: how strong the gummy will feel and how the parcel is delivered. Those answers already exist on the site, but Google-style long-tail pages work best when they make the relevant next click obvious.',
          'This guide therefore pushes people toward the dosage page, the shipping policy, and the contact form rather than forcing them to bounce back to search.'
        ]
      },
      {
        heading: 'Keep local pages commercial, not padded',
        body: [
          'The strongest product-plus-city pages are still buying pages. They do not pretend to be encyclopaedic. They clarify the local query, answer the practical blockers, and hand users to the category page with fewer objections than they started with.'
        ]
      }
    ],
    faqs: [
      {
        question: 'Do Melbourne THC gummy buyers need a different product mix?',
        answer: 'Not usually. The useful distinction is the dose and intended use, not the city itself, so the same category logic applies nationally.'
      },
      {
        question: 'Where can I compare beginner and stronger gummies?',
        answer: 'Use the THC gummies category page and the dosage guide together to compare low-dose, balanced, and high-potency options.'
      },
      {
        question: 'How do I ask a question before ordering?',
        answer: 'Use the contact form and include the product name or the kind of effect you are comparing so support can answer more directly.'
      }
    ],
    relatedLinks: [
      { href: '/shop/thc-gummies/', label: 'Browse Gummies', detail: 'Main collection page with product cards and reviews.' },
      { href: '/contact/#contact-form', label: 'Ask Support', detail: 'Email questions before ordering if you need help narrowing options.' },
      { href: '/guides/thc-gummies-vs-vapes/', label: 'Compare Gummies vs Vapes', detail: 'Useful for people deciding between slower and faster-onset formats.' }
    ]
  },
  {
    slug: 'thc-gummies-dosage-guide',
    title: 'THC Gummies Dosage Guide Australia | 2.5mg, 10mg, 25mg, 50mg',
    description: 'A practical THC gummies dosage guide for Australian buyers comparing 2.5mg, 10mg, 25mg, and 50mg edible strengths before ordering.',
    heroLabel: 'Dosage Intent',
    h1: 'THC Gummies Dosage Guide: What Different Strengths Usually Mean',
    intro: 'Dosage is one of the highest-value long-tail intents in cannabis search because it sits close to purchase. People searching dose-specific phrases are rarely browsing casually. They are trying to avoid a bad first order and pick a strength that matches their tolerance.',
    stats: [
      { value: '2.5mg', label: 'Low Starting Point' },
      { value: '10mg', label: 'Common Midpoint' },
      { value: '25mg+', label: 'Experienced Range' }
    ],
    sections: [
      {
        heading: '2.5mg to 5mg: low-dose and first-order territory',
        body: [
          'Lower-dose gummies are the safest way to learn how edibles affect you because they leave room to adjust on a later session instead of forcing you to sit through an overly strong experience.',
          'They are also useful for buyers who want something more functional or controlled rather than a heavy, long-lasting effect.'
        ]
      },
      {
        heading: '10mg to 15mg: the usual comparison range',
        body: [
          'This range is where a lot of shoppers land when they search terms like best THC gummies Australia or strongest gummies that still feel manageable. It is a common midpoint because it is clearly stronger than micro-dose products without jumping straight into high-potency territory.',
          'The main risk here is impatience. People often redose before the first edible has peaked, then assume the product is inconsistent when the real issue was timing.'
        ],
        bullets: [
          'Wait for the full onset before deciding whether it felt light.',
          'Avoid mixing dose experiments with alcohol or other substances.',
          'Pick a familiar setting the first time you try a new strength.'
        ]
      },
      {
        heading: '25mg to 50mg: high-potency products',
        body: [
          'These strengths are not broad beginner products. They exist for buyers who already know that lower edible doses are not enough for the result they want and who can handle a longer, heavier session.',
          'From an SEO standpoint, these pages capture “strongest THC gummies” searches. From a commercial standpoint, the copy should keep pushing responsible selection rather than treating bigger numbers as automatically better.'
        ]
      }
    ],
    faqs: [
      {
        question: 'Is 10mg of THC in a gummy strong?',
        answer: 'For many buyers it is a meaningful edible dose, especially if they do not use edibles often, which is why it is usually a better midpoint than a starting point.'
      },
      {
        question: 'Should beginners buy 25mg or 50mg gummies?',
        answer: 'No. Higher-potency gummies are better reserved for people who already know how lower doses affect them and want a stronger experience deliberately.'
      },
      {
        question: 'Where can I shop by strength?',
        answer: 'The THC gummies category page is the fastest way to compare low-dose, standard, and high-potency products side by side.'
      }
    ],
    relatedLinks: [
      { href: '/shop/thc-gummies/', label: 'Compare Gummy Strengths', detail: 'Move from dose research into product comparison.' },
      { href: '/faq/', label: 'Read the FAQ', detail: 'Extra answers on legality, delivery, and common ordering questions.' },
      { href: '/contact/#contact-form', label: 'Ask About a Product', detail: 'Use support if you want help matching a product to your tolerance.' }
    ]
  },
  {
    slug: 'thc-gummies-legal-australia',
    title: 'Are THC Gummies Legal in Australia? Practical Buying Guide',
    description: 'A THC gummies legality guide for Australian buyers covering legal uncertainty, state-by-state caution, and where to read broader cannabis law content.',
    heroLabel: 'Legality Intent',
    h1: 'Are THC Gummies Legal in Australia? The Practical Version',
    intro: 'Legality searches are rarely just informational. They are often trust checks that happen right before a buyer commits. This page is built to answer that concern directly, point to the broader legal guide, and avoid making oversized claims that would weaken trust.',
    stats: [
      { value: 'National', label: 'Audience Covered' },
      { value: 'State Varies', label: 'Legal Context' },
      { value: 'Support Linked', label: 'Next Step Paths' }
    ],
    sections: [
      {
        heading: 'Why this search matters commercially',
        body: [
          'A buyer searching whether THC gummies are legal in Australia is signalling hesitation, not low intent. They may be ready to buy but do not want to risk misunderstanding the legal environment.',
          'That is why the best legality pages should not try to oversell. They should explain that cannabis law is nuanced, link to the full legal explainer, and direct people to product or support pages only after the trust question is answered.'
        ]
      },
      {
        heading: 'How to handle legality content on a commercial site',
        body: [
          'The goal is to stay practical. Keep the language factual, acknowledge that laws vary, and avoid pretending a single paragraph replaces local due diligence. That approach performs better for trust than dramatic claims or vague reassurance.',
          'On this site, legality content works best when tied to the FAQ, disclaimer, and state or national explainer pages so the user can keep reading instead of bouncing.'
        ],
        bullets: [
          'Use the national law guide for broader context.',
          'Use the FAQ for short-form legality questions.',
          'Use the contact page if your question is tied to a specific product.'
        ]
      },
      {
        heading: 'What users typically do next',
        body: [
          'Once the legality concern is reduced, most people either compare THC gummies by dose or check delivery and payment details. That makes legality one of the strongest supporting intents for the wider funnel rather than a dead-end content piece.'
        ]
      }
    ],
    faqs: [
      {
        question: 'Is cannabis law the same in every Australian state?',
        answer: 'No. The legal environment varies, which is why the best next step is to read the broader legal guide and stay cautious about state-specific differences.'
      },
      {
        question: 'What should I read after a THC gummies legality page?',
        answer: 'Usually the national law explainer, the FAQ, and the THC gummies category page if you are also comparing products.'
      },
      {
        question: 'Can I ask support a legality-related product question?',
        answer: 'Yes. The contact form is the cleanest route if your question is tied to a product or ordering step.'
      }
    ],
    relatedLinks: [
      { href: '/blog/is-weed-legal-in-australia/', label: 'Read the Full Legal Guide', detail: 'National law explainer with broader context.' },
      { href: '/disclaimer/', label: 'Review the Disclaimer', detail: 'Responsible-use and legal caution page.' },
      { href: '/shop/thc-gummies/', label: 'Return to THC Gummies', detail: 'Move back into product comparison after legality research.' }
    ]
  },
  {
    slug: 'weed-delivery-australia',
    title: 'Weed Delivery Australia | Shipping Times, Tracking & Privacy',
    description: 'A weed delivery Australia guide covering dispatch timing, discreet packaging, metro and regional expectations, and support paths for delivery questions.',
    heroLabel: 'Delivery Intent',
    h1: 'Weed Delivery Australia: What Searchers Usually Need Before Ordering',
    intro: 'Delivery intent is a conversion-stage search. Buyers usually already trust the products enough to keep going, but they want confidence around speed, tracking, privacy, and what happens if the parcel is delayed.',
    stats: [
      { value: '$9.95', label: 'Standard Delivery' },
      { value: '$19.95', label: 'Express Delivery' },
      { value: 'Tracked', label: 'Shipping Standard' }
    ],
    sections: [
      {
        heading: 'What makes a delivery page rank and convert',
        body: [
          'The strongest delivery content does not stop at saying shipping is fast. It explains dispatch windows, discreet packaging, signatures, metro vs regional timing, and where to go if something goes wrong.',
          'That is why this guide exists alongside the full shipping policy rather than replacing it. It captures broader delivery intent while still routing serious buyers to the policy page with the exact numbers.'
        ]
      },
      {
        heading: 'Metro and regional expectations',
        body: [
          'Searchers in Sydney, Melbourne, Brisbane, Perth, Adelaide, Canberra, Hobart, and regional centres all care about timing, but a national site should avoid pretending every city has the same logistics. The right move is to set expectations clearly and document them on the shipping page.',
          'That keeps the delivery promise believable and gives Google-style crawlers a stronger trust footprint than vague “fast nationwide” claims on every page.'
        ]
      },
      {
        heading: 'Where delivery intent should lead next',
        body: [
          'After reading a delivery guide, users usually do one of three things: shop products, compare payment methods, or check refunds and support. Good internal linking reflects that flow instead of treating delivery as standalone content.'
        ],
        bullets: [
          'Move into the shipping page for full policy detail.',
          'Move into payment pages if checkout method is the blocker.',
          'Move into refunds or contact if the concern is support after dispatch.'
        ]
      }
    ],
    faqs: [
      {
        question: 'Where do I see exact shipping times?',
        answer: 'The shipping and delivery page publishes the current dispatch windows, delivery estimates, and packaging standards in one place.'
      },
      {
        question: 'Is delivery discreet?',
        answer: 'The site documents plain packaging and tracked handling on the shipping page so buyers can review the process before checkout.'
      },
      {
        question: 'What if I have a delivery problem?',
        answer: 'Use the refunds page and contact form for the clearest support path if an order is delayed, damaged, or needs follow-up.'
      }
    ],
    relatedLinks: [
      { href: '/shipping-and-delivery/', label: 'Read the Shipping Policy', detail: 'Exact timing, fees, tracking, and packaging details.' },
      { href: '/refunds/', label: 'Review Refunds & Issues', detail: 'What happens if a parcel is late or damaged.' },
      { href: '/shop/', label: 'Shop the Full Range', detail: 'Return to commercial pages once delivery questions are resolved.' }
    ]
  },
  {
    slug: 'thc-gummies-vs-vapes',
    title: 'THC Gummies vs Vapes | Which Format Fits Better?',
    description: 'A comparison guide for buyers deciding between THC gummies and vapes, with intent-driven differences in onset, control, portability, and product selection.',
    heroLabel: 'Comparison Intent',
    h1: 'THC Gummies vs Vapes: Best for Different Buying Intent',
    intro: 'Comparison searches are strong commercial signals because the buyer has already accepted the category and is now choosing a format. The useful distinction is not which one is “better” in general, but which format matches the kind of experience, timing, and control the user wants.',
    stats: [
      { value: 'Edibles', label: 'Slower Onset' },
      { value: 'Vapes', label: 'Faster Onset' },
      { value: 'Both', label: 'Commercial Intent' }
    ],
    sections: [
      {
        heading: 'Why people compare gummies and vapes',
        body: [
          'This is usually a decision about onset and control. Gummies are chosen by people who want a measured edible format and are comfortable waiting for effects to build. Vapes are chosen by people who want a quicker read on how the product is landing.',
          'That difference is more useful than broad lifestyle language because it speaks directly to what comparison searchers are actually trying to solve.'
        ]
      },
      {
        heading: 'Where gummies tend to win',
        body: [
          'Gummies work best for buyers who want a simple strength-based comparison, longer-lasting edible sessions, or a format that is easy to portion ahead of time. They also fit well with longer-tail searches around dose, sleep, or beginner-friendly use cases.'
        ],
        bullets: [
          'Good for strength-based shopping and edible comparisons.',
          'Easier to map against low, mid, and high-dose buying journeys.',
          'Pairs well with dosage and legality content clusters.'
        ]
      },
      {
        heading: 'Where vapes tend to win',
        body: [
          'Vapes fit buyers who want quicker onset and who prefer a format that can feel easier to titrate in real time. For SEO, they capture a different branch of commercial intent than edible pages, which is why comparison content should link clearly into both categories instead of forcing a false winner.'
        ]
      }
    ],
    faqs: [
      {
        question: 'What is the main difference between THC gummies and vapes?',
        answer: 'The most practical difference is onset. Gummies take longer to build, while vapes are usually chosen when the buyer wants quicker feedback.'
      },
      {
        question: 'Which format is easier for beginners to compare?',
        answer: 'Many beginners find gummies easier to compare by stated strength because the dose is clearer on the product page.'
      },
      {
        question: 'Where should I shop if I am still deciding?',
        answer: 'Compare the THC gummies collection and the vapes category side by side, then use support if you need help narrowing it down.'
      }
    ],
    relatedLinks: [
      { href: '/shop/thc-gummies/', label: 'Browse THC Gummies', detail: 'Dose-led edible comparison.' },
      { href: '/shop/vapes/', label: 'Browse Vapes', detail: 'Fast-onset format comparison.' },
      { href: '/guides/thc-gummies-dosage-guide/', label: 'Use the Dosage Guide', detail: 'Helpful if you are leaning toward edibles but unsure on strength.' }
    ]
  }
];

export function getSeoGuideBySlug(slug: string): SeoGuide | undefined {
  return seoGuides.find((guide) => guide.slug === slug);
}