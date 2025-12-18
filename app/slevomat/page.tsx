"use client";

import { useState } from "react";

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
                <div className="expiry-info">
                  {/* BUG: deal.expiryDate is never displayed! */}
                </div>

                {/* BUG #9: Location is NEVER shown for restaurant deals */}
                {deal.category === 'restaurant' && (
                  <div className="location-info mb-3">
                    {/* BUG: deal.location exists but we don't render address or map */}
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
  );
}
