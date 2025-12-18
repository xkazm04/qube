"use client";

import { useState, useEffect } from "react";
import FeedbackPanel, { FeedbackItem } from "../components/FeedbackPanel";

// Kiwi feedback data - 10 items covering all 5 bugs
const kiwiFeedback: FeedbackItem[] = [
  // Bug #1: Currency Display (2 items)
  {
    id: "KIWI-002",
    channel: "email",
    icon: "📧",
    author: "James Richardson",
    time: "5 hours ago",
    subject: "Currency display issue - showing CZK instead of GBP",
    excerpt: "Whenever I search for flights, all prices are displayed in Czech Koruna (CZK) instead of British Pounds. I have tried changing the currency in the dropdown menu - it doesn't seem to save...",
    tag: "💱 Currency"
  },
  {
    id: "KIWI-010",
    channel: "facebook",
    icon: "📘",
    author: "Robert Kowalski",
    time: "3 hours ago",
    content: "Currency is stuck on Czech crowns and I'm in Poland. I don't want to do math every time I look at a flight price. The selector in the menu does nothing. Please fix this basic functionality!",
    tag: "💱 Currency"
  },
  // Bug #2: Date Picker Mobile (2 items)
  {
    id: "KIWI-001",
    channel: "support_chat",
    icon: "💬",
    author: "Sarah M.",
    time: "1 hour ago",
    conversation: [
      { role: "customer", message: "I'm trying to book a return flight but I can't select the return date on my iPhone" },
      { role: "agent", message: "Could you describe what happens when you tap on the return date field?" },
      { role: "customer", message: "Nothing. Literally nothing happens. I tap and tap and the calendar just doesn't open." }
    ],
    tag: "📱 Mobile"
  },
  {
    id: "KIWI-023",
    channel: "twitter",
    icon: "🐦",
    author: "@DigitalNomadNina",
    followers: "23.5K",
    time: "30 min ago",
    content: "PSA for my fellow travelers: @kiwicom mobile site has a bug where you can't select return dates. The calendar just doesn't open on phone. Use desktop until they fix it! 🐛💻",
    engagement: { likes: 342, retweets: 156 },
    tag: "📱 Mobile",
    priority: "viral"
  },
  // Bug #3: Missing Baggage Info (2 items)
  {
    id: "KIWI-004",
    channel: "twitter",
    icon: "🐦",
    author: "@TravellerTom_",
    time: "2 hours ago",
    content: "@kiwicom just got charged €45 at the gate for my cabin bag because your site showed NOTHING about baggage allowance. Where's the transparency? 🤬 #kiwifail",
    engagement: { likes: 47, retweets: 12 },
    tag: "🧳 Baggage"
  },
  {
    id: "KIWI-018",
    channel: "email",
    icon: "📧",
    author: "Henrik Larsson",
    time: "4 hours ago",
    subject: "Baggage information not visible",
    excerpt: "I almost made an expensive mistake today. Nowhere on the booking page did it say what baggage was included. The baggage section appears to be completely empty...",
    tag: "🧳 Baggage"
  },
  // Bug #4: Search Button Disabled (2 items)
  {
    id: "KIWI-003",
    channel: "facebook",
    icon: "📘",
    author: "Mike Thompson",
    time: "45 min ago",
    content: "Your search doesn't even work lol. Filled everything in and the search button is greyed out. Great ad though 😂👎",
    reactions: { angry: 12, haha: 8 },
    tag: "🔍 Search"
  },
  {
    id: "KIWI-008",
    channel: "app_store",
    icon: "📱",
    author: "BackpackerBen",
    time: "6 hours ago",
    rating: 1,
    title: "Can't even complete a search",
    content: "Can't even get past the search screen. I fill in departure, destination, dates - the search button stays grey and unclickable. Tried reinstalling twice.",
    tag: "🔍 Search"
  },
  // Bug #5: Low Contrast / Accessibility (2 items)
  {
    id: "KIWI-005",
    channel: "trustpilot",
    icon: "⭐",
    author: "Margaret H.",
    time: "Yesterday",
    rating: 2,
    title: "Website accessibility is terrible",
    content: "I'm 67 years old and have mild visual impairment. I literally cannot read the flight times on the search results. The text is so light grey it's almost invisible against the white background.",
    tag: "🎨 Accessibility"
  },
  {
    id: "KIWI-012",
    channel: "twitter",
    icon: "🐦",
    author: "@AccessibleTravel",
    followers: "8.9K",
    time: "3 hours ago",
    content: "Did a quick accessibility audit of @kiwicom - flight times nearly invisible with ~2:1 contrast ratio. Come on @kiwicom, it's 2024. #a11y #AccessibleTravel #WCAG",
    engagement: { likes: 234, retweets: 89 },
    tag: "🎨 Accessibility",
    priority: "advocacy"
  }
];

// Sample flight data
const flights = [
  {
    airline: "Ryanair",
    from: { city: "Prague", code: "PRG" },
    to: { city: "Barcelona", code: "BCN" },
    departure: "06:45",
    arrival: "09:20",
    duration: "2h 35m",
    stops: 0,
    price: 2450,
  },
  {
    airline: "Vueling",
    from: { city: "Prague", code: "PRG" },
    to: { city: "Barcelona", code: "BCN" },
    departure: "14:30",
    arrival: "17:15",
    duration: "2h 45m",
    stops: 0,
    price: 3200,
  },
  {
    airline: "Wizz Air",
    from: { city: "Prague", code: "PRG" },
    to: { city: "Barcelona", code: "BCN" },
    departure: "19:00",
    arrival: "23:45",
    duration: "4h 45m",
    stops: 1,
    stopCity: "Vienna",
    price: 1890,
  },
  {
    airline: "EasyJet",
    from: { city: "Prague", code: "PRG" },
    to: { city: "Barcelona", code: "BCN" },
    departure: "08:15",
    arrival: "11:00",
    duration: "2h 45m",
    stops: 0,
    price: 2780,
  },
  {
    airline: "Lufthansa",
    from: { city: "Prague", code: "PRG" },
    to: { city: "Barcelona", code: "BCN" },
    departure: "12:00",
    arrival: "16:30",
    duration: "4h 30m",
    stops: 1,
    stopCity: "Frankfurt",
    price: 4150,
  },
];

export default function KiwiPage() {
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [cabinClass, setCabinClass] = useState("economy");
  const [currency, setCurrency] = useState("CZK");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // BUG #4: Broken validation - always returns false
  function validateForm() {
    const from = fromCity;
    const to = toCity;
    // BUG: Using wrong logic - returns false even when fields are filled
    if (from && to) {
      return false; // Should be true!
    }
    return false;
  }

  useEffect(() => {
    setIsFormValid(validateForm());
  }, [fromCity, toCity, departureDate, returnDate]);

  // BUG #2: Only attach click handler for desktop
  const handleReturnDateClick = () => {
    if (typeof window !== "undefined" && window.innerWidth > 768) {
      setShowDatePicker(true);
    }
    // Mobile users cannot open the date picker!
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Feedback Panel */}
      <FeedbackPanel
        feedbackItems={kiwiFeedback}
        accentColor="#ff5c3d"
        agentColor="#00a991"
      />

      {/* Main Content - adjusted for feedback panel */}
      <div className="mr-0 lg:mr-[380px] transition-all duration-300">
        {/* Header */}
        <header className="bg-[#0c0f14] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <span className="text-2xl font-bold text-[#00a991]">Kiwi.com</span>
              <nav className="hidden md:flex gap-6 text-sm">
                <a href="#" className="hover:text-[#00a991] transition-colors">Flights</a>
                <a href="#" className="hover:text-[#00a991] transition-colors">Hotels</a>
                <a href="#" className="hover:text-[#00a991] transition-colors">Car Rental</a>
                <a href="#" className="hover:text-[#00a991] transition-colors">Kiwi.com Guarantee</a>
              </nav>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <button className="hover:text-[#00a991] transition-colors">EN</button>
              {/* BUG #1: Currency selector is non-functional - always shows CZK */}
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-transparent border border-zinc-600 rounded px-2 py-1 text-sm cursor-pointer"
              >
                <option value="CZK">CZK</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
              <button className="hover:text-[#00a991] transition-colors">Help</button>
              <button className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Search Section */}
      <section className="bg-gradient-to-b from-[#0c0f14] to-[#1a1d24] py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-8">
            Find cheap flights to anywhere
          </h1>

          {/* Search Form */}
          <div className="bg-white rounded-xl shadow-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* From Field */}
              <div className="relative">
                <label className="block text-xs text-zinc-500 mb-1">From</label>
                <div className="flex items-center border border-zinc-300 rounded-lg px-3 py-2">
                  <svg className="w-5 h-5 text-zinc-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <input
                    type="text"
                    placeholder="City or airport"
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value)}
                    className="w-full outline-none text-sm"
                  />
                </div>
              </div>

              {/* To Field */}
              <div className="relative">
                <label className="block text-xs text-zinc-500 mb-1">To</label>
                <div className="flex items-center border border-zinc-300 rounded-lg px-3 py-2">
                  <svg className="w-5 h-5 text-zinc-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="City or airport"
                    value={toCity}
                    onChange={(e) => setToCity(e.target.value)}
                    className="w-full outline-none text-sm"
                  />
                </div>
              </div>

              {/* Departure Date */}
              <div className="relative">
                <label className="block text-xs text-zinc-500 mb-1">Departure</label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm outline-none"
                />
              </div>

              {/* Return Date - BUG #2: onClick only works on desktop */}
              <div className="relative">
                <label className="block text-xs text-zinc-500 mb-1">Return</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  onClick={handleReturnDateClick}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Passengers */}
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Passengers</label>
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm outline-none"
                >
                  <option value="1">1 Adult</option>
                  <option value="2">2 Adults</option>
                  <option value="3">3 Adults</option>
                  <option value="4">4 Adults</option>
                </select>
              </div>

              {/* Cabin Class */}
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Cabin Class</label>
                <select
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value)}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm outline-none"
                >
                  <option value="economy">Economy</option>
                  <option value="premium">Premium Economy</option>
                  <option value="business">Business</option>
                  <option value="first">First Class</option>
                </select>
              </div>

              {/* Search Button - BUG #4: Always disabled */}
              <div className="flex items-end">
                <button
                  disabled={!isFormValid}
                  className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                    isFormValid
                      ? "bg-[#ff5c3d] hover:bg-[#e5533a] cursor-pointer"
                      : "bg-zinc-300 cursor-not-allowed"
                  }`}
                >
                  Search Flights
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flight Results Section */}
      <section className="py-12 bg-zinc-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-zinc-900 mb-6">Flight Results</h2>

          <div className="space-y-4">
            {flights.map((flight, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  {/* Airline and Route */}
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-xs font-bold text-zinc-600">
                        {flight.airline.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-zinc-700">{flight.airline}</span>
                    </div>
                    <div className="text-sm text-zinc-500">
                      {flight.from.city} {flight.from.code} → {flight.to.city} {flight.to.code}
                    </div>
                  </div>

                  {/* Flight Times - BUG #5: Low contrast text */}
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    {/* BUG #5: Light gray text on white - contrast ratio ~2:1 */}
                    <span className="text-lg font-semibold" style={{ color: "#c8c8c8" }}>
                      {flight.departure}
                    </span>
                    <div className="flex flex-col items-center">
                      {/* BUG #5: Even lighter text for duration */}
                      <span className="text-xs" style={{ color: "#d0d0d0" }}>
                        {flight.duration}
                      </span>
                      <div className="w-24 h-px bg-zinc-300 relative">
                        <div className="absolute -top-1 left-0 w-2 h-2 bg-zinc-400 rounded-full"></div>
                        <div className="absolute -top-1 right-0 w-2 h-2 bg-zinc-400 rounded-full"></div>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {flight.stops === 0 ? "Direct" : `${flight.stops} stop`}
                      </span>
                    </div>
                    {/* BUG #5: Light gray text on white */}
                    <span className="text-lg font-semibold" style={{ color: "#c8c8c8" }}>
                      {flight.arrival}
                    </span>
                  </div>

                  {/* Price and Select - BUG #1: Always CZK */}
                  <div className="flex flex-col items-end">
                    {/* BUG #1: Currency hardcoded to CZK, ignores selector */}
                    <span className="text-2xl font-bold text-[#00a991]">
                      {flight.price.toLocaleString()} CZK
                    </span>
                    <button className="mt-2 px-6 py-2 bg-[#00a991] text-white rounded-lg font-medium hover:bg-[#008f7d] transition-colors flex items-center gap-2">
                      Select
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* BUG #3: Baggage info section is EMPTY */}
                <div className="mt-4 pt-4 border-t border-zinc-100">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-zinc-500 font-medium">Baggage included:</span>
                    {/* BUG #3: This section intentionally has no content - no baggage icons or details */}
                    <div className="baggage-info flex-1">
                      {/* No cabin bag / checked bag icons or text shown here */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* Footer */}
        <footer className="bg-[#0c0f14] text-white py-8">
          <div className="max-w-4xl mx-auto px-4 text-center text-sm text-zinc-400">
            <p>This is a demo page for showcasing bugs. Not affiliated with Kiwi.com</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
