export const SITE_URL = 'https://mullawaysmedicalcannabis.com.au';
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export const organizationSchema = {
  '@context': 'https://schema.org',
  // OnlineStore alongside Organization tells Google this is an e-commerce entity —
  // required for Merchant Center free-listing eligibility and entity graph accuracy.
  '@type': ['Organization', 'OnlineStore'],
  '@id': ORGANIZATION_ID,
  name: 'Mullaways Medical Cannabis',
  legalName: 'Mullaways Medical Cannabis',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/logo.png`,
    width: 200,
    height: 60,
  },
  image: `${SITE_URL}/og-default.png`,
  description:
    'Australian online cannabis dispensary and educational resource focused on discreet delivery, clear product information, and customer support nationwide. Based in Mullaways, NSW — serving Sydney, Melbourne, Brisbane, Perth, Adelaide, Canberra and regional Australia.',
  foundingDate: '2024',
  email: 'hello@mullawaysmedicalcannabis.com.au',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Mullaways',
    addressRegion: 'NSW',
    addressCountry: 'AU',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'hello@mullawaysmedicalcannabis.com.au',
    availableLanguage: [{ '@type': 'Language', name: 'English', alternateName: 'en-AU' }],
  },
  areaServed: {
    '@type': 'Country',
    name: 'Australia',
    identifier: 'AU',
  },
  // OfferCatalog helps Google understand product category structure —
  // improves Shopping Graph entity associations.
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Cannabis Products Australia',
    itemListElement: [
      { '@type': 'OfferCatalog', name: 'Cannabis Flower', url: `${SITE_URL}/shop/flower/` },
      { '@type': 'OfferCatalog', name: 'THC Gummies', url: `${SITE_URL}/shop/thc-gummies/` },
      { '@type': 'OfferCatalog', name: 'Cannabis Edibles', url: `${SITE_URL}/shop/edibles/` },
      { '@type': 'OfferCatalog', name: 'Vapes & Cartridges', url: `${SITE_URL}/shop/vapes/` },
      { '@type': 'OfferCatalog', name: 'Concentrates', url: `${SITE_URL}/shop/concentrates/` },
      { '@type': 'OfferCatalog', name: 'Pre-Rolls', url: `${SITE_URL}/shop/pre-rolls/` },
      { '@type': 'OfferCatalog', name: 'Hash', url: `${SITE_URL}/shop/hash/` },
    ],
  },
  // knowsAbout signals topical authority to Google's E-E-A-T and Knowledge Graph.
  knowsAbout: [
    'Cannabis',
    'Medical Cannabis Australia',
    'THC Products',
    'CBD Products',
    'Cannabis Flower',
    'THC Gummies',
    'Cannabis Edibles',
    'Cannabis Concentrates',
    'Cannabis Delivery Australia',
    'Online Cannabis Dispensary',
  ],
  sameAs: [
    'https://www.instagram.com/mullawaysmedical',
    'https://www.facebook.com/mullawaysmedical',
    'https://x.com/mullawaysmed',
  ],
};

// Shared return policy — referenced from every product's hasMerchantReturnPolicy.
// Required for Google Merchant Center free product listings eligibility.
export const merchantReturnPolicy = {
  '@type': 'MerchantReturnPolicy',
  '@id': `${SITE_URL}/#return-policy`,
  applicableCountry: 'AU',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 14,
  returnMethod: 'https://schema.org/ReturnByMail',
  returnFees: 'https://schema.org/FreeReturn',
};

// Shared shipping details — referenced from every product Offer.
// Required for Google Merchant Center free product listings eligibility.
export const shippingDetails = {
  '@type': 'OfferShippingDetails',
  '@id': `${SITE_URL}/#shipping-au`,
  shippingRate: {
    '@type': 'MonetaryAmount',
    value: '9.95',
    currency: 'AUD',
  },
  shippingDestination: {
    '@type': 'DefinedRegion',
    addressCountry: 'AU',
  },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: {
      '@type': 'QuantitativeValue',
      minValue: 0,
      maxValue: 1,
      unitCode: 'DAY',
    },
    transitTime: {
      '@type': 'QuantitativeValue',
      minValue: 2,
      maxValue: 5,
      unitCode: 'DAY',
    },
  },
};
