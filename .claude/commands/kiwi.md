# Kiwi.com Mock Page - Claude Code Requirements

## Overview
Create a realistic-looking flight search and results page mimicking Kiwi.com's design. The page should contain **intentional bugs** that will be discovered through user feedback and fixed by an AI agent demo.

## Design Reference
- Primary color: `#00a991` (Kiwi teal/green)
- Secondary color: `#0c0f14` (dark background sections)
- Accent: `#ff5c3d` (orange for CTAs)
- Font: Clean sans-serif (use Inter or system fonts)
- Style: Modern, clean, lots of whitespace, card-based results

## Page Structure

### 1. Header
- Kiwi.com logo (create simple text logo or placeholder)
- Navigation: Flights | Hotels | Car Rental | Kiwi.com Guarantee
- Right side: Language selector, Currency selector (showing "CZK" hardcoded), Help, Account icon

### 2. Hero Search Section
- Large heading: "Find cheap flights to anywhere"
- Search form with:
  - From field (with airplane icon)
  - To field
  - Departure date picker
  - Return date picker (🐛 **BUG #2**: onClick handler missing on mobile viewport)
  - Passengers dropdown
  - Cabin class dropdown
  - Search button (🐛 **BUG #4**: Button stays `disabled` even when all fields filled - validation logic broken)

### 3. Search Results Section
Create 4-5 flight result cards showing:

#### Flight Card Design
```
┌─────────────────────────────────────────────────────────────────┐
│  [Airline Logo]  Prague PRG → Barcelona BCN                     │
│                                                                 │
│  06:45 ────────── 2h 35m direct ────────── 09:20               │
│                                                                 │
│  [Baggage info area] 🐛 BUG #3: This section is EMPTY          │
│                                                                 │
│  Price: 2,450 CZK  🐛 BUG #1: Always shows CZK, ignores locale │
│                                                                 │
│  [Flight times in light gray: #c8c8c8 on white]                │
│  🐛 BUG #5: Contrast ratio ~2:1, fails WCAG AA                 │
│                                                                 │
│                                        [Select →] button        │
└─────────────────────────────────────────────────────────────────┘
```

## Intentional Bugs to Implement

### Bug #1: Currency Display Bug
**Location**: All price displays
**Implementation**: 
- Hardcode currency to "CZK" regardless of any settings
- Ignore the currency selector in header (make it non-functional)
- User feedback: *"I'm searching from the UK but all prices are showing in Czech Koruna?"*

### Bug #2: Broken Date Picker on Mobile
**Location**: Return date input field
**Implementation**:
```javascript
// Only attach click handler for desktop
if (window.innerWidth > 768) {
  returnDateInput.addEventListener('click', openDatePicker);
}
// Mobile users cannot open the date picker!
```
- User feedback: *"I tap on the return date and nothing happens on mobile"*

### Bug #3: Missing Baggage Information
**Location**: Flight result cards
**Implementation**:
- Create an empty `<div class="baggage-info"></div>` with no content
- The section exists but displays nothing
- No cabin bag / checked bag icons or text
- User feedback: *"Nowhere does it say if cabin bag is included"*

### Bug #4: Search Button Disabled State
**Location**: Search form submit button
**Implementation**:
```javascript
// Broken validation - always returns false
function validateForm() {
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;
  // BUG: Using && instead of || and wrong logic
  if (from && to) {
    return false; // Should be true!
  }
  return false;
}

// Button stays disabled
searchBtn.disabled = !validateForm();
```
- User feedback: *"The search button stays greyed out even after I fill in all fields"*

### Bug #5: Accessibility - Low Contrast Text
**Location**: Flight times and secondary text in result cards
**Implementation**:
```css
.flight-time {
  color: #c8c8c8; /* Light gray on white - ~2:1 contrast ratio */
  font-size: 14px;
}

.flight-duration {
  color: #d0d0d0; /* Even lighter */
}
```
- User feedback: *"The light gray text on white background is impossible to see"*

## Technical Requirements

### Stack
- Single HTML file with embedded CSS and JavaScript
- No frameworks required (vanilla JS)
- Responsive design (but with Bug #2 breaking mobile)

### Sample Flight Data
```javascript
const flights = [
  {
    airline: "Ryanair",
    from: { city: "Prague", code: "PRG" },
    to: { city: "Barcelona", code: "BCN" },
    departure: "06:45",
    arrival: "09:20",
    duration: "2h 35m",
    stops: 0,
    price: 2450, // Always displayed as CZK
    // baggage: {} // Missing!
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
  }
];
```

## Visual Polish
- Add subtle shadows to cards
- Smooth hover effects on interactive elements
- Loading skeleton states (optional)
- Kiwi-style rounded buttons with icons
- Small airplane icons for routes

## File Output
Single file: `kiwi-mock.html`

## Testing Checklist
- [ ] Page looks convincingly like Kiwi.com
- [ ] Bug #1: Currency always shows CZK
- [ ] Bug #2: Return date picker doesn't work on mobile (test at 375px width)
- [ ] Bug #3: Baggage section is visibly empty
- [ ] Bug #4: Search button never enables
- [ ] Bug #5: Flight times are barely readable (gray on white)