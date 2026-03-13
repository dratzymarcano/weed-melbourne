export const SITE_URL = 'https://mullawaysmedicalcannabis.com.au';
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: 'Mullaways Medical Cannabis',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/og-default.png`,
  description:
    'Australian online cannabis dispensary and educational resource focused on discreet delivery, clear product information, and customer support nationwide.',
  email: 'hello@mullawaysmedicalcannabis.com.au',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'hello@mullawaysmedicalcannabis.com.au',
    availableLanguage: ['en-AU'],
  },
  areaServed: {
    '@type': 'Country',
    name: 'Australia',
  },
  sameAs: [
    'https://www.instagram.com/mullawaysmedical',
    'https://www.facebook.com/mullawaysmedical',
    'https://x.com/mullawaysmed',
  ],
};