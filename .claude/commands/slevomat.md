# Slevomat.cz Mock Page - Claude Code Requirements

## Overview
Create a realistic-looking Czech deals/vouchers page mimicking Slevomat.cz's design. The page should contain **intentional bugs** that will be discovered through user feedback and fixed by an AI agent demo.

## Design Reference
- Primary color: `#e31c79` (Slevomat pink/magenta)
- Secondary color: `#1a1a1a` (dark text)
- Background: `#f5f5f5` (light gray)
- Accent: `#4caf50` (green for discounts)
- Font: Clean sans-serif (use system fonts)
- Style: Deal cards with large images, prominent discount badges, countdown timers

## Page Structure

### 1. Header
- Slevomat logo (create simple text logo with pink color)
- Navigation: Zážitky | Pobyty | Restaurace | Zboží | Cestování
- Search bar
- Right side: Language toggle (CZ/EN), Login/Register, Cart icon
- Promo banner below: "Až 70% slevy na wellness pobyty!"

### 2. Category Filter Bar
- Horizontal scrollable pills: Vše | Wellness | Restaurace | Zážitky | Pobyty | Sport

### 3. Deals Grid
Create 6 deal cards in a responsive grid (3 columns desktop, 2 tablet, 1 mobile)

#### Deal Card Design
```
┌─────────────────────────────────────────┐
│  [Large Image - 16:9 ratio]             │
│                                         │
│  ┌─────┐                                │
│  │-70% │ 🐛 BUG #8: Shows 70% but       │
│  └─────┘   actual discount is ~40%      │
│                                         │
├─────────────────────────────────────────┤
│  Romantický wellness pobyt pro 2        │
│  ⭐⭐⭐⭐ Hotel Nová Louka                │
│                                         │
│  🐛 BUG #6: Expiry date NOT shown here  │
│                                         │
│  ̶2̶,̶9̶9̶0̶ ̶K̶č̶  1,790 Kč                    │
│                                         │
│  [  Do košíku  ] 🐛 BUG #7: onClick     │
│                     handler broken      │
└─────────────────────────────────────────┘
```

### 4. Featured Restaurant Deal (for Bug #9)
```
┌─────────────────────────────────────────┐
│  [Restaurant Image]                     │
│                                         │
│  Degustační menu pro 2 osoby            │
│  La Bottega Bistroteka                  │
│                                         │
│  🐛 BUG #9: No address, no map,         │
│     location section completely missing │
│                                         │
│  990 Kč (hodnota 1,800 Kč)              │
│                                         │
│  [  Koupit  ]                           │
└─────────────────────────────────────────┘
```

### 5. Checkout Modal (for Bug #10)
- Triggered by attempting purchase
- Simple form: Name, Email, Phone
- 🐛 **BUG #10**: Error messages display in Czech even on EN locale

## Intentional Bugs to Implement

### Bug #6: Voucher Expiry Date Hidden
**Location**: Deal cards - expiry info missing
**Implementation**:
```javascript
const deals = [
  {
    title: "Romantický wellness pobyt",
    // expiryDate exists in data but is never rendered!
    expiryDate: "2024-01-15", // Only 2 weeks away
    price: 1790,
    originalPrice: 2990,
  }
];

// In render function - expiry is never shown
function renderDealCard(deal) {
  return `
    <div class="deal-card">
      <h3>${deal.title}</h3>
      <div class="price">${deal.price} Kč</div>
      <!-- BUG: deal.expiryDate is never displayed! -->
      <button>Do košíku</button>
    </div>
  `;
}
```
- User feedback (CZ): *"Až po zaplacení jsem zjistil, že platí jen 2 týdny!"*

### Bug #7: Add to Cart Button Not Working
**Location**: "Do košíku" buttons on wellness/stay deals
**Implementation**:
```javascript
// BUG: Event listener never attached to wellness category
document.querySelectorAll('.deal-card').forEach(card => {
  const category = card.dataset.category;
  
  // Only attach to non-wellness categories
  if (category !== 'wellness') {
    card.querySelector('.add-to-cart').addEventListener('click', addToCart);
  }
  // Wellness buttons do nothing!
});
```
- User feedback (CZ): *"Tlačítko 'Do košíku' nereaguje na kliknutí u wellness pobytů"*

### Bug #8: Wrong Discount Percentage
**Location**: Discount badges on deal cards
**Implementation**:
```javascript
function calculateDiscount(original, current) {
  // BUG: Wrong formula - shows inflated discount
  // Correct: ((original - current) / original) * 100
  // Wrong implementation:
  return Math.round((original / current) * 100 - 100);
  // This gives ~67% instead of actual ~40%
}

// Or simply hardcode wrong values:
const deals = [
  {
    title: "Wellness pobyt",
    price: 1790,
    originalPrice: 2990,
    displayedDiscount: 70, // Hardcoded lie! Actual is 40%
  }
];
```
- User feedback (CZ): *"Sleva údajně 70%, ale když porovnám s původní cenou, je to sotva 40%"*

### Bug #9: Missing Location for Restaurant Deal
**Location**: Restaurant deal card
**Implementation**:
```javascript
const restaurantDeal = {
  title: "Degustační menu pro 2 osoby",
  restaurant: "La Bottega Bistroteka",
  price: 990,
  value: 1800,
  // Location data exists but component doesn't render it
  location: {
    address: "Dlouhá 39, Praha 1",
    coordinates: { lat: 50.0892, lng: 14.4243 }
  }
};

// Template missing location section entirely
function renderRestaurantDeal(deal) {
  return `
    <div class="restaurant-deal">
      <h3>${deal.title}</h3>
      <p>${deal.restaurant}</p>
      <!-- BUG: No address, no map component! -->
      <div class="price">${deal.price} Kč</div>
    </div>
  `;
}
```
- User feedback (CZ): *"Nikde nevidím adresu ani mapu"*

### Bug #10: Form Validation Error Messages in Wrong Language
**Location**: Checkout modal form
**Implementation**:
```javascript
// Locale is set to EN
const currentLocale = 'en';

// But error messages are hardcoded in Czech
const errorMessages = {
  required: 'Toto pole je povinné',      // Should be: "This field is required"
  invalidEmail: 'Neplatný email',         // Should be: "Invalid email"
  invalidPhone: 'Neplatné telefonní číslo' // Should be: "Invalid phone number"
};

// No i18n lookup, just uses Czech strings
function validateField(field, value) {
  if (!value) {
    showError(field, errorMessages.required); // Always Czech!
  }
}
```
- User feedback (EN): *"Error messages appear in Czech on English version"*

## Technical Requirements

### Stack
- Single HTML file with embedded CSS and JavaScript
- No frameworks required (vanilla JS)
- Responsive grid layout

### Sample Deal Data
```javascript
const deals = [
  {
    id: 1,
    category: "wellness",
    title: "Romantický wellness pobyt pro 2 osoby",
    subtitle: "Hotel Nová Louka ⭐⭐⭐⭐",
    image: "https://picsum.photos/400/250?random=1",
    originalPrice: 2990,
    currentPrice: 1790,
    displayedDiscount: 70, // BUG: Actual is ~40%
    expiryDate: "2024-01-15", // BUG: Never shown
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
    displayedDiscount: 65,
    expiryDate: "2024-01-20",
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
    displayedDiscount: 55,
    location: { // BUG: Never rendered
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
    displayedDiscount: 50,
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
    displayedDiscount: 60,
    expiryDate: "2024-01-18",
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
    displayedDiscount: 40,
    soldCount: 445,
  }
];
```

## Visual Polish
- Large discount badge (circle or ribbon) in top-left of card
- Strikethrough original price
- "Prodáno X×" (Sold X times) social proof
- Countdown timer for limited deals (optional)
- Pink/magenta brand accents
- Hover effects on cards (slight lift, shadow)

## Language Support
- Default: Czech (CZ)
- Toggle to: English (EN)
- Store locale in variable: `let currentLocale = 'cz';`
- Bug #10 breaks when switching to EN

## File Output
Single file: `slevomat-mock.html`

## Testing Checklist
- [ ] Page looks convincingly like Slevomat.cz
- [ ] Bug #6: No expiry dates visible on any deal cards
- [ ] Bug #7: "Do košíku" button does nothing for wellness deals (other categories work)
- [ ] Bug #8: Discount badges show wrong percentages (higher than actual)
- [ ] Bug #9: Restaurant deal has no address or map
- [ ] Bug #10: Switch to EN locale, trigger form error → message is in Czech