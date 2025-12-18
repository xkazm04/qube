# Extended Mock Pages - Feedback Display Requirements

## Overview
This document extends the original Kiwi and Slevomat mock page requirements by adding a **feedback panel** that displays real user complaints. The feedback shown should correspond to bugs that are actually present and fixable in the mock pages.

During the demo, an AI agent will:
1. Read the displayed feedback
2. Identify the underlying bug
3. Fix the bug in real-time

Only feedback related to **implementable/fixable bugs** should be displayed. Feedback about customer service, refunds, or other non-technical issues should be excluded.

---

## Shared Feedback Panel Component

### Design
```
┌─────────────────────────────────────────────────────────────────────────┐
│  📣 Live Customer Feedback                              [Auto-refresh] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 🐦 Twitter • @username • 2 hours ago                            │   │
│  │                                                                  │   │
│  │ "Tweet content here..."                                         │   │
│  │                                                                  │   │
│  │ ❤️ 47  🔁 12  💬 8                                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 📧 Email • James R. • 5 hours ago                               │   │
│  │ Subject: Currency display issue                                  │   │
│  │                                                                  │   │
│  │ "Email excerpt here..."                                         │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 💬 Support Chat • Sarah M. • 1 hour ago                         │   │
│  │                                                                  │   │
│  │ Customer: "Chat message here..."                                │   │
│  │ Agent: "Response here..."                                       │   │
│  │ Customer: "Follow-up here..."                                   │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  [Load More Feedback]                                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Styling
- Panel position: Right sidebar (desktop) or bottom drawer (mobile)
- Width: 350-400px on desktop
- Background: Slightly darker than page background (`#f8f9fa`)
- Cards: White background with subtle shadow
- Channel icons with brand colors:
  - Twitter: `#1DA1F2`
  - Facebook: `#4267B2`
  - Email: `#EA4335`
  - Support Chat: `#00a991` (Kiwi) / `#e31c79` (Slevomat)
  - Trustpilot: `#00b67a`
  - Instagram: Gradient pink-orange
  - App Store: `#007AFF`

### Behavior
- Feedback cards should have a subtle "unread" indicator (blue dot)
- Optional: Add "New" badge animation when feedback appears
- Scrollable container with max-height
- Each card should include a small tag showing the bug category (e.g., "🎨 Accessibility", "🛒 Cart", "💰 Pricing")

---

## Kiwi.com - Feedback to Display

Display **10 feedback items** covering all 5 bugs:

### Bug #1: Currency Display (BUG_001)
```javascript
{
  id: "KIWI-002",
  channel: "email",
  icon: "📧",
  author: "James Richardson",
  time: "5 hours ago",
  subject: "Currency display issue - showing CZK instead of GBP",
  excerpt: "Whenever I search for flights, all prices are displayed in Czech Koruna (CZK) instead of British Pounds. I have tried changing the currency in the dropdown menu - it doesn't seem to save...",
  tag: "💱 Currency"
}
```

```javascript
{
  id: "KIWI-010",
  channel: "facebook",
  icon: "📘",
  author: "Robert Kowalski",
  time: "3 hours ago",
  rating: 2,
  content: "Currency is stuck on Czech crowns and I'm in Poland. I don't want to do math every time I look at a flight price. The selector in the menu does nothing. Please fix this basic functionality!",
  tag: "💱 Currency"
}
```

### Bug #2: Date Picker Mobile (BUG_002)
```javascript
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
}
```

```javascript
{
  id: "KIWI-023",
  channel: "twitter",
  icon: "🐦",
  author: "@DigitalNomadNina",
  followers: "23.5K",
  time: "30 min ago",
  content: "PSA for my fellow travelers: @kiikiwicom mobile site has a bug where you can't select return dates. The calendar just doesn't open on phone. Use desktop until they fix it! 🐛💻",
  engagement: { likes: 342, retweets: 156 },
  tag: "📱 Mobile",
  priority: "viral"
}
```

### Bug #3: Missing Baggage Info (BUG_003)
```javascript
{
  id: "KIWI-004",
  channel: "twitter",
  icon: "🐦",
  author: "@TravellerTom_",
  time: "2 hours ago",
  content: "@kiikiwicom just got charged €45 at the gate for my cabin bag because your site showed NOTHING about baggage allowance. Where's the transparency? 🤬 #kiwifail",
  engagement: { likes: 47, retweets: 12 },
  tag: "🧳 Baggage"
}
```

```javascript
{
  id: "KIWI-018",
  channel: "email",
  icon: "📧",
  author: "Henrik Larsson",
  time: "4 hours ago",
  subject: "Baggage information not visible",
  excerpt: "I almost made an expensive mistake today. Nowhere on the booking page did it say what baggage was included. The baggage section appears to be completely empty...",
  tag: "🧳 Baggage"
}
```

### Bug #4: Search Button Disabled (BUG_004)
```javascript
{
  id: "KIWI-003",
  channel: "facebook",
  icon: "📘",
  author: "Mike Thompson",
  time: "45 min ago",
  type: "comment_on_ad",
  content: "Your search doesn't even work lol. Filled everything in and the search button is greyed out. Great ad though 😂👎",
  reactions: { angry: 12, haha: 8 },
  tag: "🔍 Search"
}
```

```javascript
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
}
```

### Bug #5: Low Contrast / Accessibility (BUG_005)
```javascript
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
}
```

```javascript
{
  id: "KIWI-012",
  channel: "twitter",
  icon: "🐦",
  author: "@AccessibleTravel",
  followers: "8.9K",
  time: "3 hours ago",
  content: "Did a quick accessibility audit of @kiikiwicom - flight times nearly invisible with ~2:1 contrast ratio. Come on @kiikiwicom, it's 2024. #a11y #AccessibleTravel #WCAG",
  engagement: { likes: 234, retweets: 89 },
  tag: "🎨 Accessibility",
  priority: "advocacy"
}
```

---

## Slevomat - Feedback to Display

Display **10 feedback items** covering all 5 bugs:

### Bug #6: Hidden Expiry Date (BUG_006)
```javascript
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
}
```

```javascript
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
}
```

### Bug #7: Add to Cart Broken (BUG_007)
```javascript
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
}
```

```javascript
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
}
```

### Bug #8: Wrong Discount Percentage (BUG_008)
```javascript
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
}
```

```javascript
{
  id: "SLEVO-029",
  channel: "facebook",
  icon: "📘",
  author: "Lucie Benešová",
  time: "1 hour ago",
  type: "comment_on_ad",
  content: "70%? 😂 Propočítala jsem si váš 'wellness pobyt se slevou 70%' - původní cena 2990, aktuální 1790. To je 40% sleva, ne 70%. Učili jste se matematiku?",
  translation: "70%? 😂 I calculated your '70% off wellness stay' - original 2990, current 1790. That's 40%, not 70%. Did you learn math?",
  reactions: { haha: 45, angry: 12 },
  tag: "💰 Pricing",
  priority: "viral_risk"
}
```

### Bug #9: Missing Restaurant Location (BUG_009)
```javascript
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
}
```

```javascript
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
}
```

### Bug #10: Error Messages Wrong Language (BUG_010)
```javascript
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
}
```

```javascript
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
```

---

## Implementation Details

### Data Structure
```javascript
// Shared feedback data structure
const feedbackData = {
  kiwi: [
    // Array of 10 feedback objects as shown above
  ],
  slevomat: [
    // Array of 10 feedback objects as shown above
  ]
};
```

### Feedback Card Component
```html
<div class="feedback-card" data-bug-id="BUG_001" data-channel="email">
  <div class="feedback-header">
    <span class="channel-icon">📧</span>
    <span class="channel-name">Email</span>
    <span class="author">James Richardson</span>
    <span class="time">5 hours ago</span>
  </div>
  
  <div class="feedback-subject">Currency display issue - showing CZK instead of GBP</div>
  
  <div class="feedback-content">
    "Whenever I search for flights, all prices are displayed in Czech Koruna..."
  </div>
  
  <div class="feedback-footer">
    <span class="bug-tag">💱 Currency</span>
  </div>
</div>
```

### CSS for Feedback Panel
```css
.feedback-panel {
  position: fixed;
  right: 0;
  top: 60px; /* Below header */
  width: 380px;
  height: calc(100vh - 60px);
  background: #f8f9fa;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
  padding: 16px;
  z-index: 100;
}

.feedback-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.feedback-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: box-shadow 0.2s;
}

.feedback-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.feedback-card[data-priority="viral"],
.feedback-card[data-priority="viral_risk"],
.feedback-card[data-priority="churn_risk"] {
  border-left: 3px solid #e53935;
}

.feedback-card[data-priority="partner"] {
  border-left: 3px solid #fb8c00;
}

.feedback-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.channel-icon {
  font-size: 16px;
}

.author {
  font-weight: 600;
  color: #333;
}

.time {
  margin-left: auto;
  color: #999;
}

.feedback-subject {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 6px;
  color: #333;
}

.feedback-content {
  font-size: 13px;
  line-height: 1.5;
  color: #444;
}

.feedback-translation {
  font-size: 12px;
  color: #666;
  font-style: italic;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed #e0e0e0;
}

.feedback-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.bug-tag {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 12px;
  background: #e3f2fd;
  color: #1565c0;
}

.engagement {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #666;
}

/* Chat conversation styling */
.chat-message {
  padding: 6px 0;
  font-size: 12px;
}

.chat-message .role {
  font-weight: 600;
  color: #333;
}

.chat-message .role.agent {
  color: #00a991;
}

/* Mobile responsive */
@media (max-width: 1200px) {
  .feedback-panel {
    width: 320px;
  }
}

@media (max-width: 900px) {
  .feedback-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    width: 100%;
    height: 40vh;
    border-left: none;
    border-top: 1px solid #e0e0e0;
  }
}
```

### Toggle Button
Add a floating button to show/hide the feedback panel:
```html
<button class="feedback-toggle" onclick="toggleFeedbackPanel()">
  📣 Feedback <span class="badge">10</span>
</button>
```

```css
.feedback-toggle {
  position: fixed;
  right: 400px; /* Adjust based on panel width */
  top: 80px;
  background: #ff5c3d; /* Kiwi accent */
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  z-index: 101;
}

.feedback-toggle .badge {
  background: white;
  color: #ff5c3d;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 6px;
  font-size: 12px;
}
```

---

## File Outputs

Update the original mock files to include:
1. `kiwi-mock.html` - Add feedback panel with Kiwi-specific feedback
2. `slevomat-mock.html` - Add feedback panel with Slevomat-specific feedback

Or create as separate enhanced versions:
1. `kiwi-mock-with-feedback.html`
2. `slevomat-mock-with-feedback.html`

---

## Testing Checklist

### Feedback Panel
- [ ] Panel displays correctly on desktop (right sidebar)
- [ ] Panel displays correctly on mobile (bottom drawer)
- [ ] Toggle button shows/hides panel
- [ ] All 10 feedback items render for each site
- [ ] Chat conversations display properly
- [ ] Translations appear for Czech feedback (Slevomat)
- [ ] Priority indicators (red border) appear on critical items
- [ ] Bug tags are color-coded and visible

### Bug-Feedback Correlation
- [ ] Each displayed feedback corresponds to a bug present in the mock
- [ ] Feedback text accurately describes the bug behavior
- [ ] No feedback about non-implementable issues (refunds, customer service, etc.)

### Demo Flow Verification
- [ ] Agent can read feedback from panel
- [ ] Agent can identify which bug the feedback relates to
- [ ] After fix, the feedback would no longer be valid (bug resolved)