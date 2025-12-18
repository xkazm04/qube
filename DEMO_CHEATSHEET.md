# Demo Cheat Sheet - Kiwi & Slevomat Bugs

## 🎯 Quick Bug Reference

### Kiwi.com (English)
| What to Show | Where to Look | What Happens |
|-------------|---------------|--------------|
| **Currency Stuck** | Header dropdown | Change EUR/GBP → stays CZK |
| **Mobile Date Picker** | Resize browser < 768px | Click return date → nothing |
| **No Baggage Info** | Flight results | "Baggage included:" then empty |
| **Disabled Search** | Fill ALL fields | Button stays gray |
| **Low Contrast** | Flight times | Light gray text (#c8c8c8) |

### Slevomat (Czech)
| What to Show | Where to Look | What Happens |
|-------------|---------------|--------------|
| **Missing Expiry** | Deal cards | "Platí do:" then empty |
| **Cart Broken** | Wellness deals | Click "Do košíku" → nothing |
| **Wrong Discount** | Wellness pobyt badge | Shows -70%, is -40% |
| **No Address** | Restaurant deals | "Adresa:" then empty |
| **Czech Errors** | Switch to EN, submit empty form | "Toto pole je povinné" |

## 🗣️ Demo Script

### Opening (30 sec)
"We're looking at two Czech travel companies - Kiwi.com (international flights) and Slevomat (local deals). Both have critical bugs reported by customers across multiple channels."

### Kiwi Demo (2 min)
1. **Show feedback**: "James from UK complains currency won't change"
2. **Try it**: Change GBP in dropdown → prices stay CZK
3. **Social proof**: Twitter user with 23K followers warns about mobile bug
4. **Demonstrate**: Resize browser → date picker broken
5. **Impact**: Accessibility complaint from elderly user
6. **Show**: Flight times barely readable

### Slevomat Demo (2 min)
1. **Show feedback**: "Lenka paid before seeing expiry date"
2. **Demonstrate**: Deals show "Platí do:" but no date
3. **Cart issue**: Multiple complaints wellness button doesn't work
4. **Try it**: Click "Do košíku" on wellness → nothing
5. **Try restaurant**: Works fine (category-specific bug!)
6. **Math error**: Badge shows -70%, calculate: only -40%
7. **Language bug**: Switch EN → errors still Czech

### Closing (30 sec)
"Ten unique, reproducible bugs across two sites. Every complaint maps to a real issue. This is what our AI system analyzes, categorizes, and routes automatically to engineering teams."

## 💡 Key Talking Points

### Why This Matters
- ✅ **Multi-channel**: Email, Twitter, Facebook, Support, Reviews
- ✅ **Multi-language**: English + Czech automatic detection
- ✅ **Business impact**: Influencers, viral posts, partner complaints
- ✅ **Reproducible**: Every bug can be demonstrated live
- ✅ **Unique issues**: 10 distinct problems, not duplicates

### AI System Benefits
1. **Auto-classification**: "Currency bug" vs "Mobile bug" vs "Accessibility"
2. **Priority detection**: High-follower accounts, viral potential
3. **Pattern recognition**: Multiple reports of same issue
4. **Team routing**: Frontend team vs Backend team
5. **Ticket generation**: Auto-create JIRA from feedback

## 🎨 Visual Cues

### Kiwi Page
- **Dark header** (#0c0f14) with Kiwi green (#00a991)
- **Currency dropdown**: Top right corner
- **Search form**: Big white card with gradient background
- **Flight cards**: White cards with very light gray times
- **Baggage section**: Border-top with empty content

### Slevomat Page
- **White header** with Slevomat pink (#e31c79)
- **Language toggle**: "EN/CZ" button top right
- **Deal cards**: Grid layout with discount badges
- **Missing data**: Look for label + empty space pattern
- **Modal form**: Checkout popup with Czech errors

## 🚨 Common Questions

**Q: Why are some in Czech?**
A: Czech company serving Czech market. AI handles both languages automatically.

**Q: Are these real bugs?**
A: Demo bugs, but based on real patterns from production systems.

**Q: How does AI detect the problem?**
A: NLP analyzes text, identifies keywords, correlates with system logs, assigns categories.

**Q: What about false positives?**
A: Confidence scores + human review for low-confidence items.

## 📱 Mobile Testing

To test mobile bugs:
1. Open DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Select "iPhone 12" or similar
4. Try return date field on Kiwi

## 🔍 Code Locations

If someone asks about implementation:
- **Kiwi**: `app/kiwi/page.tsx` lines 190-199 (validation bug), 206-211 (mobile bug)
- **Slevomat**: `app/slevomat/page.tsx` lines 243-251 (cart bug), 418-427 (expiry), 430-440 (location)

## ⚡ Quick Wins

For shorter demo (1 min each):
- **Kiwi**: Currency + Mobile date picker
- **Slevomat**: Missing expiry + Cart button

For detailed demo (3+ min each):
- Show ALL bugs + feedback correlation + business impact
