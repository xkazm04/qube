# Feedback Data Improvements for Kiwi/Slevomat Demo

## Overview
Improved feedback data for both Kiwi.com and Slevomat pages to create a more realistic and compelling demo that directly correlates feedback with demonstrable bugs in the UI.

## Changes Made

### 1. Removed English Translations ✅
- **Slevomat feedback** now displays in Czech only (no "translation" field in sidebar)
- This reflects the reality that Czech companies receive feedback in Czech
- Makes the demo more authentic and professional
- English feedback from international users (like Thomas B. from Germany) still shown in English

### 2. Enhanced Feedback Specificity ✅
Each feedback item now:
- **References specific UI elements** visible on the page
- **Mentions exact bug symptoms** that can be reproduced live
- **Addresses unique problems** (no duplicates)

## Bug-to-Feedback Mapping

### Kiwi.com Bugs (English Interface)

| Bug # | Bug Description | Feedback Items | How to Demo |
|-------|----------------|----------------|-------------|
| **#1** | Currency selector doesn't work - always shows CZK | KIWI-002, KIWI-010 | 1. Try changing currency dropdown<br>2. Notice prices stay in CZK |
| **#2** | Date picker doesn't open on mobile | KIWI-001, KIWI-023 | 1. Open page on mobile/narrow browser<br>2. Try clicking return date field<br>3. Nothing happens |
| **#3** | Baggage info section is empty | KIWI-004, KIWI-018 | 1. Look at flight results<br>2. See "Baggage included:" with empty space after |
| **#4** | Search button always disabled | KIWI-003, KIWI-008 | 1. Fill in all search fields<br>2. Button stays gray/disabled<br>3. Check validation logic (returns false always) |
| **#5** | Flight times have terrible contrast | KIWI-005, KIWI-012 | 1. Look at flight times (departure/arrival)<br>2. Very light gray (#c8c8c8) on white<br>3. Fails WCAG accessibility |

### Slevomat Bugs (Czech Interface)

| Bug # | Bug Description | Feedback Items | How to Demo |
|-------|----------------|----------------|-------------|
| **#6** | Expiry date never displayed | SLEVO-003, SLEVO-012 | 1. Look at deal cards<br>2. See "Platí do:" label<br>3. Date value is empty `<span></span>` |
| **#7** | Add to Cart broken for wellness | SLEVO-001, SLEVO-020 | 1. Try clicking "Do košíku" on wellness deals<br>2. Nothing happens<br>3. Works fine for restaurants |
| **#8** | Discount % calculation wrong | SLEVO-002, SLEVO-029 | 1. Wellness pobyt: shows -70%, is -40%<br>2. Math: (2990-1790)/2990 = 40.1%<br>3. Check other deals too |
| **#9** | Restaurant location missing | SLEVO-004, SLEVO-023 | 1. Look at restaurant deals<br>2. See "Adresa:" label<br>3. Address value is empty |
| **#10** | Error messages in Czech on EN site | SLEVO-005, SLEVO-024 | 1. Click EN button to switch to English<br>2. Try checkout with empty fields<br>3. Errors show in Czech: "Toto pole je povinné" |

## Demo Flow Suggestions

### For Kiwi.com Demo:
1. **Show the feedback panel** with critical items about currency (KIWI-002)
2. **Try to change currency** in header → doesn't work
3. **Check Twitter** feedback (KIWI-023) about mobile date picker
4. **Resize browser** to mobile size → date picker doesn't open
5. **Point out accessibility** issue from Margaret H. (KIWI-005)
6. **Show the low contrast** flight times

### For Slevomat Demo:
1. **Show Czech feedback** about missing expiry dates (SLEVO-003)
2. **Look at wellness deal** → "Platí do:" but no date shown
3. **Try adding wellness to cart** → button doesn't respond (SLEVO-020)
4. **Try restaurant deal** → works fine (demonstrates category-specific bug)
5. **Check discount math** → "70%" badge but actually 40% (SLEVO-029)
6. **Switch to English** → form errors still in Czech (SLEVO-005)

## Key Features of Improved Data

### ✅ Authenticity
- Czech company = Czech feedback (with occasional English from tourists)
- International company = Primarily English feedback
- Realistic channel distribution (email, social, chat, reviews)

### ✅ Traceability
- Each feedback references specific UI elements
- Bugs are 100% reproducible on the demo pages
- Clear correlation between complaint and visible issue

### ✅ Uniqueness
- Each feedback addresses a distinct problem
- No duplicate complaints (each has unique context)
- Mix of user types (customers, partners, influencers)

### ✅ Business Impact
- Priority flags show urgency (viral_risk, churn_risk, partner)
- Engagement metrics show reach (likes, retweets, followers)
- Multiple reports of same issue show pattern

## Additional Enhancement Ideas

### Future Additions (Optional):

1. **Add Performance Bug** (Kiwi)
   - Feedback: "Page takes 30 seconds to load flight results"
   - Demo: Add artificial delay on search click

2. **Add Payment Bug** (Slevomat)
   - Feedback: "Credit card keeps getting declined"
   - Demo: Show error modal on checkout

3. **Add Mobile Menu Bug** (Both)
   - Feedback: "Hamburger menu doesn't open"
   - Demo: Hide menu onclick on mobile

4. **Add Image Loading Bug** (Slevomat)
   - Feedback: "Deal images not loading"
   - Demo: Add broken image src on some deals

5. **Add Filter Bug** (Both)
   - Feedback: "Price filter doesn't work"
   - Demo: Add price filter that doesn't filter

## Testing the Demo

### Quick Test Checklist:
- [ ] Open Kiwi page - currency selector doesn't work
- [ ] Resize to mobile - return date picker doesn't open
- [ ] Check flight times - very low contrast
- [ ] Fill search form - button stays disabled
- [ ] Open Slevomat page - expiry dates missing
- [ ] Click wellness "Do košíku" - nothing happens
- [ ] Check discount math - percentages wrong
- [ ] Switch to EN - form errors in Czech

All checks should **FAIL** to demonstrate the bugs!

## File Locations

- **Kiwi page**: `app/kiwi/page.tsx`
- **Slevomat page**: `app/slevomat/page.tsx`
- **Kanban mock data**: `app/features/social/lib/kanbanMockData.ts`

## Notes for Presenters

1. **Czech language**: Don't apologize for Czech in Slevomat - this is authentic! Many European companies operate in local languages.

2. **Demonstrate the bugs**: Click around, show the issues are real, not just theoretical feedback.

3. **Show the correlation**: Open feedback panel, read complaint, demonstrate the exact issue on page.

4. **Highlight AI potential**: These bugs could be auto-detected, categorized, and routed to teams automatically.

5. **Business impact**: Point out high-follower accounts, viral potential, partner complaints showing revenue impact.
