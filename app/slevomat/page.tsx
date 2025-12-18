"use client";

import { useState } from "react";
import FeedbackPanel, { FeedbackItem } from "../components/FeedbackPanel";

// Slevomat feedback data - 10 items covering all 5 bugs
const slevomatFeedback: FeedbackItem[] = [
  // Bug #6: Hidden Expiry Date (2 items)
  {
    id: "SLEVO-003",
    channel: "facebook",
    icon: "📘",
    author: "Lenka Procházková",
    time: "2 hours ago",
    content: "POZOR! Koupila jsem voucher na Slevomatu a až PO zaplacení jsem zjistila, že platí jen do konce příštího týdne! Kde to bylo napsané před nákupem?? 😤",
    translation: "WARNING! I bought a voucher and only AFTER paying I found out it's valid only until next week! Where was this written before purchase??",
    reactions: { angry: 23, sad: 8 },
    tag: "📅 Expiry"
  },
  {
    id: "SLEVO-012",
    channel: "support_chat",
    icon: "💬",
    author: "Anna K.",
    time: "1 hour ago",
    conversation: [
      { role: "customer", message: "Koupila jsem voucher na saunu a teď jsem zjistila že vyprší za 5 dní! Proč to nebylo vidět před nákupem?" },
      { role: "agent", message: "Moc se omlouvám. Datum platnosti by mělo být zobrazeno u nabídky..." },
      { role: "customer", message: "Na stránce nabídky jsem žádné datum expirace neviděla, až v emailu po zaplacení" }
    ],
    translation: "Customer bought sauna voucher, found out only 5 days validity after purchase. Expiry date not shown on deal page.",
    tag: "📅 Expiry"
  },
  // Bug #7: Add to Cart Broken (2 items)
  {
    id: "SLEVO-001",
    channel: "support_chat",
    icon: "💬",
    author: "Petra Nováková",
    time: "30 min ago",
    conversation: [
      { role: "customer", message: "Snažím se přidat wellness pobyt do košíku ale tlačítko vůbec nereaguje" },
      { role: "agent", message: "O který pobyt se jedná?" },
      { role: "customer", message: "Ten romantický wellness pro dva. Zkoušela jsem to i na jiném wellness pobytu - stejný problém. U restaurací to funguje normálně." }
    ],
    translation: "Trying to add wellness stay to cart but button doesn't respond. Same issue on other wellness deals. Restaurant deals work fine.",
    tag: "🛒 Cart"
  },
  {
    id: "SLEVO-020",
    channel: "twitter",
    icon: "🐦",
    author: "@ZuzkaTravel",
    time: "15 min ago",
    content: "Týden se snažím koupit wellness pobyt na @slevomat_cz a pořád nefunguje tlačítko. Support říká že na tom pracují. Týden! 😤 Koupím jinde.",
    translation: "Been trying to buy wellness stay for a week and button still doesn't work. Support says they're working on it. A week! Will buy elsewhere.",
    engagement: { likes: 15, retweets: 4 },
    tag: "🛒 Cart",
    priority: "churn_risk"
  },
  // Bug #8: Wrong Discount Percentage (2 items)
  {
    id: "SLEVO-002",
    channel: "email",
    icon: "📧",
    author: "Martin Dvořák",
    time: "4 hours ago",
    subject: "Stížnost - klamavá sleva",
    excerpt: "Na stránce je uvedena sleva 70%, původní cena 2990 Kč, aktuální 1790 Kč. Ale výpočet: (2990-1790)/2990 = 40%. To není 70%! Považuji to za klamavou reklamu.",
    translation: "Site shows 70% discount, but calculation shows only 40%. Consider this false advertising.",
    tag: "💰 Pricing"
  },
  {
    id: "SLEVO-029",
    channel: "facebook",
    icon: "📘",
    author: "Lucie Benešová",
    time: "1 hour ago",
    content: "70%? 😂 Propočítala jsem si váš 'wellness pobyt se slevou 70%' - původní cena 2990, aktuální 1790. To je 40% sleva, ne 70%. Učili jste se matematiku?",
    translation: "70%? 😂 I calculated your '70% off wellness stay' - original 2990, current 1790. That's 40%, not 70%. Did you learn math?",
    reactions: { haha: 45, angry: 12 },
    tag: "💰 Pricing",
    priority: "viral_risk"
  },
  // Bug #9: Missing Restaurant Location (2 items)
  {
    id: "SLEVO-004",
    channel: "twitter",
    icon: "🐦",
    author: "@FoodieKarla",
    time: "3 hours ago",
    content: "Chtěla jsem koupit ten degustační menu deal na @slevomat_cz ale... kde je ta restaurace vlastně? 😅 Nikde nevidím adresu ani mapu. Help? #praha #foodie",
    translation: "Wanted to buy the tasting menu deal but... where is the restaurant actually? Can't see address or map anywhere.",
    engagement: { likes: 12, retweets: 3 },
    tag: "📍 Location"
  },
  {
    id: "SLEVO-023",
    channel: "email",
    icon: "📧",
    author: "La Bottega (Partner)",
    time: "Yesterday",
    subject: "Chybějící adresa u naší nabídky",
    excerpt: "Jsme partnerská restaurace. Několik zákazníků nám volalo s dotazem, kde se nacházíme, protože na Slevomatu prý není uvedena adresa. V systému jsme ji vyplnili...",
    translation: "We're partner restaurant. Customers calling asking where we are - address not shown on Slevomat. We filled it in the system...",
    tag: "📍 Location",
    priority: "partner"
  },
  // Bug #10: Error Messages Wrong Language (2 items)
  {
    id: "SLEVO-005",
    channel: "trustpilot",
    icon: "⭐",
    author: "Thomas B.",
    location: "Germany",
    time: "Yesterday",
    rating: 2,
    title: "Error messages in wrong language",
    content: "I switched the website to English but error messages appear in Czech! 'Toto pole je povinné' - I had to use Google Translate. If you offer English, errors should be English too.",
    tag: "🌐 Language"
  },
  {
    id: "SLEVO-024",
    channel: "twitter",
    icon: "🐦",
    author: "@TouristInPrague",
    time: "2 hours ago",
    content: "Trying to buy spa voucher on @slevomat_cz but checkout form shows errors in Czech even though I'm on English site 😕 'Neplatný email' - had to Google translate.",
    engagement: { likes: 5, retweets: 1 },
    tag: "🌐 Language"
  }
];

// Sample deal data
const deals = [
  {
    id: 1,
    category: "wellness",
    title: "Romantický wellness pobyt pro 2 osoby",
    subtitle: "Hotel Nová Louka ⭐⭐⭐⭐",
    image: "https://picsum.photos/400/250?random=1",
    originalPrice: 2990,
    currentPrice: 1790,
    displayedDiscount: 70, // BUG #8: Actual is ~40%
    expiryDate: "2024-01-15", // BUG #6: Never shown
    soldCount: 234,
  },
  {
    id: 2,
    category: "wellness",
    title: "Relaxační masáž 60 minut",
    subtitle: "Thai Massage Studio",
    image: "https://picsum.photos/400/250?random=2",
    originalPrice: 1200,
    currentPrice: 590,
    displayedDiscount: 65, // BUG #8: Actual is ~51%
    expiryDate: "2024-01-20", // BUG #6: Never shown
    soldCount: 89,
  },
  {
    id: 3,
    category: "restaurant",
    title: "Degustační menu pro 2 osoby",
    subtitle: "La Bottega Bistroteka",
    image: "https://picsum.photos/400/250?random=3",
    originalPrice: 1800,
    currentPrice: 990,
    displayedDiscount: 55, // BUG #8: Actual is ~45%
    location: { // BUG #9: Never rendered
      address: "Dlouhá 39, Praha 1",
      coordinates: { lat: 50.0892, lng: 14.4243 }
    },
    soldCount: 156,
  },
  {
    id: 4,
    category: "experience",
    title: "Únikový escape room až pro 5 osob",
    subtitle: "Escape Master Praha",
    image: "https://picsum.photos/400/250?random=4",
    originalPrice: 1500,
    currentPrice: 899,
    displayedDiscount: 50, // BUG #8: Actual is ~40%
    soldCount: 312,
  },
  {
    id: 5,
    category: "wellness",
    title: "Privátní sauna na 2 hodiny",
    subtitle: "Saunia Harfa",
    image: "https://picsum.photos/400/250?random=5",
    originalPrice: 1400,
    currentPrice: 790,
    displayedDiscount: 60, // BUG #8: Actual is ~44%
    expiryDate: "2024-01-18", // BUG #6: Never shown
    soldCount: 67,
  },
  {
    id: 6,
    category: "restaurant",
    title: "Burger menu pro 2",
    subtitle: "Burgermeister",
    image: "https://picsum.photos/400/250?random=6",
    originalPrice: 598,
    currentPrice: 399,
    displayedDiscount: 40, // BUG #8: Actual is ~33%
    location: {
      address: "Náměstí Republiky 8, Praha 1",
      coordinates: { lat: 50.0875, lng: 14.4300 }
    },
    soldCount: 445,
  }
];

// BUG #10: Error messages hardcoded in Czech, ignoring locale
const errorMessages = {
  required: 'Toto pole je povinné',      // Should be: "This field is required"
  invalidEmail: 'Neplatný email',         // Should be: "Invalid email"
  invalidPhone: 'Neplatné telefonní číslo' // Should be: "Invalid phone number"
};

export default function SlevomatPage() {
  const [locale, setLocale] = useState<'cz' | 'en'>('cz');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<typeof deals[0] | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  const categories = [
    { id: 'all', label: locale === 'cz' ? 'Vše' : 'All' },
    { id: 'wellness', label: 'Wellness' },
    { id: 'restaurant', label: locale === 'cz' ? 'Restaurace' : 'Restaurants' },
    { id: 'experience', label: locale === 'cz' ? 'Zážitky' : 'Experiences' },
  ];

  const filteredDeals = activeCategory === 'all'
    ? deals
    : deals.filter(deal => deal.category === activeCategory);

  // BUG #7: Only attach handler for non-wellness categories
  const handleAddToCart = (deal: typeof deals[0]) => {
    if (deal.category === 'wellness') {
      // BUG: Wellness buttons do nothing!
      return;
    }
    setCart([...cart, deal.id]);
    setSelectedDeal(deal);
    setShowModal(true);
  };

  // BUG #10: Validate and show errors in Czech regardless of locale
  const validateForm = () => {
    const errors: { name?: string; email?: string; phone?: string } = {};

    if (!formData.name.trim()) {
      errors.name = errorMessages.required; // Always Czech!
    }

    if (!formData.email.trim()) {
      errors.email = errorMessages.required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = errorMessages.invalidEmail; // Always Czech!
    }

    if (!formData.phone.trim()) {
      errors.phone = errorMessages.required;
    } else if (!/^\+?[\d\s-]{9,}$/.test(formData.phone)) {
      errors.phone = errorMessages.invalidPhone; // Always Czech!
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      alert(locale === 'cz' ? 'Objednávka odeslána!' : 'Order submitted!');
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '' });
      setFormErrors({});
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Feedback Panel */}
      <FeedbackPanel
        feedbackItems={slevomatFeedback}
        accentColor="#e31c79"
        agentColor="#e31c79"
      />

      {/* Main Content - adjusted for feedback panel */}
      <div className="mr-0 lg:mr-[380px] transition-all duration-300">
        {/* Header */}
        <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <span className="text-2xl font-bold text-[#e31c79]">Slevomat</span>
              <nav className="hidden md:flex gap-6 text-sm font-medium text-[#1a1a1a]">
                <a href="#" className="hover:text-[#e31c79] transition-colors">
                  {locale === 'cz' ? 'Zážitky' : 'Experiences'}
                </a>
                <a href="#" className="hover:text-[#e31c79] transition-colors">
                  {locale === 'cz' ? 'Pobyty' : 'Stays'}
                </a>
                <a href="#" className="hover:text-[#e31c79] transition-colors">
                  {locale === 'cz' ? 'Restaurace' : 'Restaurants'}
                </a>
                <a href="#" className="hover:text-[#e31c79] transition-colors">
                  {locale === 'cz' ? 'Zboží' : 'Products'}
                </a>
                <a href="#" className="hover:text-[#e31c79] transition-colors">
                  {locale === 'cz' ? 'Cestování' : 'Travel'}
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2">
                <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={locale === 'cz' ? 'Hledat...' : 'Search...'}
                  className="bg-transparent outline-none text-sm w-40"
                />
              </div>
              {/* Language Toggle */}
              <button
                onClick={() => setLocale(locale === 'cz' ? 'en' : 'cz')}
                className="px-3 py-1 border border-gray-300 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                {locale === 'cz' ? 'EN' : 'CZ'}
              </button>
              {/* Login */}
              <button className="text-sm font-medium text-[#1a1a1a] hover:text-[#e31c79] transition-colors">
                {locale === 'cz' ? 'Přihlásit' : 'Login'}
              </button>
              {/* Cart */}
              <button className="relative p-2">
                <svg className="w-6 h-6 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#e31c79] text-white text-xs rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Promo Banner */}
        <div className="bg-[#e31c79] text-white text-center py-2 text-sm font-medium">
          {locale === 'cz' ? 'Až 70% slevy na wellness pobyty!' : 'Up to 70% off wellness stays!'}
        </div>
      </header>

      {/* Category Filter */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-[#e31c79] text-white'
                    : 'bg-gray-100 text-[#1a1a1a] hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">
          {locale === 'cz' ? 'Nejlepší nabídky' : 'Best Deals'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal) => (
            <div
              key={deal.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow transform hover:-translate-y-1 duration-200"
            >
              {/* Image with Discount Badge */}
              <div className="relative">
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="w-full h-48 object-cover"
                />
                {/* BUG #8: Discount badge shows wrong percentage */}
                <div className="absolute top-3 left-3 bg-[#4caf50] text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{deal.displayedDiscount}%
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-[#1a1a1a] text-lg mb-1">{deal.title}</h3>
                <p className="text-gray-500 text-sm mb-3">{deal.subtitle}</p>

                {/* BUG #6: Expiry date is NEVER shown even though data exists */}
                {/* The expiryDate field exists in deal data but we don't render it */}
                {deal.expiryDate && (
                  <div className="expiry-info flex items-center gap-1 text-sm text-gray-500 mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{locale === 'cz' ? 'Platí do:' : 'Valid until:'}</span>
                    {/* BUG: deal.expiryDate is never displayed - empty span! */}
                    <span className="font-medium"></span>
                  </div>
                )}

                {/* BUG #9: Location is NEVER shown for restaurant deals */}
                {deal.category === 'restaurant' && deal.location && (
                  <div className="location-info flex items-center gap-1 text-sm text-gray-500 mb-3">
                    <svg className="w-4 h-4 text-[#e31c79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{locale === 'cz' ? 'Adresa:' : 'Address:'}</span>
                    {/* BUG: deal.location.address exists but we don't render it - empty span! */}
                    <span className="font-medium"></span>
                  </div>
                )}

                {/* Sold Count */}
                <p className="text-gray-400 text-xs mb-3">
                  {locale === 'cz' ? `Prodáno ${deal.soldCount}×` : `Sold ${deal.soldCount} times`}
                </p>

                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-gray-400 line-through text-sm">
                    {deal.originalPrice.toLocaleString()} Kč
                  </span>
                  <span className="text-[#e31c79] font-bold text-xl">
                    {deal.currentPrice.toLocaleString()} Kč
                  </span>
                </div>

                {/* Add to Cart Button - BUG #7: Doesn't work for wellness */}
                <button
                  onClick={() => handleAddToCart(deal)}
                  className="w-full bg-[#e31c79] text-white py-3 rounded-lg font-semibold hover:bg-[#c9156a] transition-colors"
                >
                  {locale === 'cz' ? 'Do košíku' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Checkout Modal - BUG #10: Error messages in Czech even on EN locale */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#1a1a1a]">
                {locale === 'cz' ? 'Dokončit objednávku' : 'Complete Order'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormErrors({});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedDeal && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedDeal.title}</p>
                <p className="text-[#e31c79] font-bold">{selectedDeal.currentPrice.toLocaleString()} Kč</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'cz' ? 'Jméno' : 'Name'}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#e31c79] ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {/* BUG #10: Error message always in Czech */}
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#e31c79] ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {/* BUG #10: Error message always in Czech */}
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'cz' ? 'Telefon' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#e31c79] ${
                      formErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {/* BUG #10: Error message always in Czech */}
                  {formErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-[#e31c79] text-white py-3 rounded-lg font-semibold hover:bg-[#c9156a] transition-colors"
              >
                {locale === 'cz' ? 'Odeslat objednávku' : 'Submit Order'}
              </button>
            </form>
          </div>
        </div>
      )}

        {/* Footer */}
        <footer className="bg-[#1a1a1a] text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
            <p>{locale === 'cz' ? 'Toto je demo stránka pro ukázku chyb. Není spojeno se Slevomat.cz' : 'This is a demo page for showcasing bugs. Not affiliated with Slevomat.cz'}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
