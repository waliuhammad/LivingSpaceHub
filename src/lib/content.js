/**
 * Default site copy. The admin can override any of it from Admin → Content, which saves to
 * Firestore content/site. Missing fields fall back to these defaults.
 */
export const DEFAULT_CONTENT = {
  contact: {
    addressLines: ['1st Floor Office No.04 Humayun Tower', 'University Road', 'Peshawar, Pakistan'],
    phone: '03338131393',
    whatsapp: '923338131393',
    email: 'info@livingspaceshub.com',
  },
  social: {
    instagram: '',
    pinterest: '',
    facebook: '',
    twitter: '',
  },
  footerTagline: "Curating the world's most beautiful home decor and lifestyle pieces to help you create a space that reflects your soul.",
  faq: [
    { question: 'How long does delivery take?', answer: 'Delivery usually takes 3–7 working days depending on your location.' },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept Cash on Delivery (COD), JazzCash and EasyPaisa. For JazzCash and EasyPaisa, send the payment to the account shown at checkout and enter your transaction ID.',
    },
    {
      question: 'Can I return or exchange a product?',
      answer: 'Yes, you can request a return or exchange within 7 days of delivery, provided the item is unused and in original packaging.',
    },
    { question: 'Do you offer handmade or custom products?', answer: 'Yes! Many of our home decor items are handcrafted. Custom orders may take additional time.' },
    {
      question: 'How can I track my order?',
      answer: 'Use the Track Order page with your order number and phone number. Signed-in customers can also see every order under My Account.',
    },
    { question: 'Is Cash on Delivery available in all areas?', answer: 'COD is available in most cities. However, availability may vary depending on your location.' },
  ],
  about: {
    heading: 'Our Philosophy',
    intro: 'We believe that your home should be more than just a place to live—it should be a curated extension of your identity.',
    body: 'Founded in 2024, Living Space Hub started as a small boutique with a singular goal: to bring artisanal, high-quality home decor to design lovers around the world. We partner with independent designers and established craftsmen to source pieces that are as sustainable as they are beautiful.',
    pillars: [
      { title: 'Artisanal', text: 'Each piece is hand-selected for its unique character and craftsmanship.' },
      { title: 'Sustainable', text: 'We prioritize ethically sourced materials and responsible production.' },
    ],
    journey: [
      { year: '2024', text: 'Launched as a digital gallery in London, showcasing local ceramic artists.' },
      { year: '2025', text: 'Expanded our collection to include premium furniture and sustainable textiles.' },
      { year: '2026', text: 'Now serving design enthusiasts globally with shipping to over 50 countries.' },
    ],
  },
  productTabs: {
    details: [
      'Crafted from sustainably sourced solid hardwood & natural fibers.',
      'Hand-finished by master artisans for organic texture.',
      'Designed in California, ethically produced.',
    ],
    shipping:
      'Standard shipping takes 3–7 working days. Larger furniture pieces may need extra time. Returns and exchanges are accepted within 7 days of delivery for unused items in original packaging.',
    care: 'Dust regularly with a dry microfibre cloth. For wood surfaces, use damp cloth with mild soap; avoid harsh chemical cleaners. Keep away from direct sunlight.',
  },
};

const nonEmpty = (value, fallback) => (Array.isArray(value) ? (value.length ? value : fallback) : value || fallback);

export function mergeContent(saved = {}) {
  const d = DEFAULT_CONTENT;
  return {
    contact: {
      addressLines: nonEmpty(saved.contact?.addressLines, d.contact.addressLines),
      phone: nonEmpty(saved.contact?.phone, d.contact.phone),
      whatsapp: nonEmpty(saved.contact?.whatsapp, d.contact.whatsapp),
      email: nonEmpty(saved.contact?.email, d.contact.email),
    },
    social: { ...d.social, ...saved.social },
    footerTagline: nonEmpty(saved.footerTagline, d.footerTagline),
    faq: nonEmpty(saved.faq, d.faq),
    about: {
      heading: nonEmpty(saved.about?.heading, d.about.heading),
      intro: nonEmpty(saved.about?.intro, d.about.intro),
      body: nonEmpty(saved.about?.body, d.about.body),
      pillars: nonEmpty(saved.about?.pillars, d.about.pillars),
      journey: nonEmpty(saved.about?.journey, d.about.journey),
    },
    productTabs: {
      details: nonEmpty(saved.productTabs?.details, d.productTabs.details),
      shipping: nonEmpty(saved.productTabs?.shipping, d.productTabs.shipping),
      care: nonEmpty(saved.productTabs?.care, d.productTabs.care),
    },
  };
}
