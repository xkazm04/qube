# Feedback Kanban Board - Claude Code Requirements

## Overview
Create a modern, interactive Kanban board for managing customer feedback. The board should be **themeless** (inheriting styles from the parent application's theme) and feature smooth drag-and-drop functionality. The key focus is on well-designed feedback cards that display channel-specific information optimally.

## Core Principles

### Themeless Design
- Use CSS custom properties (variables) for ALL colors, shadows, and styling
- Inherit typography from parent application
- No hardcoded colors - everything should reference theme variables
- Support both light and dark mode automatically through CSS variables

```css
/* Theme variables the app should provide */
:root {
  /* The Kanban will use these variables - do not define them, expect them from parent */
  --color-background: /* provided by app */;
  --color-surface: /* provided by app */;
  --color-surface-elevated: /* provided by app */;
  --color-border: /* provided by app */;
  --color-border-subtle: /* provided by app */;
  --color-text-primary: /* provided by app */;
  --color-text-secondary: /* provided by app */;
  --color-text-muted: /* provided by app */;
  --color-accent: /* provided by app */;
  --color-accent-subtle: /* provided by app */;
  --color-success: /* provided by app */;
  --color-warning: /* provided by app */;
  --color-error: /* provided by app */;
  --shadow-sm: /* provided by app */;
  --shadow-md: /* provided by app */;
  --shadow-lg: /* provided by app */;
  --radius-sm: /* provided by app */;
  --radius-md: /* provided by app */;
  --radius-lg: /* provided by app */;
  --font-family: /* provided by app */;
  --transition-fast: /* provided by app */;
  --transition-normal: /* provided by app */;
}
```

---

## Kanban Structure

### Columns
```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│    NEW      │  ANALYZED   │   MANUAL    │  AUTOMATIC  │    DONE     │
│             │             │             │             │             │
│ Incoming    │ Triaged &   │ Human Dev   │ AI Agent    │ Resolved    │
│ feedback    │ categorized │ Pipeline    │ Pipeline    │ feedback    │
│             │             │             │             │             │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│             │             │             │             │             │
│  [Card]     │  [Card]     │  [Card]     │  [Card]     │  [Card]     │
│             │             │             │             │             │
│  [Card]     │  [Card]     │             │  [Card]     │  [Card]     │
│             │             │             │             │             │
│  [Card]     │             │             │             │             │
│             │             │             │             │             │
│             │             │             │             │             │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

### Column Configuration
```javascript
const columns = [
  {
    id: 'new',
    title: 'New',
    subtitle: 'Incoming feedback',
    icon: '📥',
    acceptsFrom: [], // Can't receive from other columns via drag
    maxItems: null,  // Unlimited
  },
  {
    id: 'analyzed',
    title: 'Analyzed',
    subtitle: 'Triaged & categorized',
    icon: '🔍',
    acceptsFrom: ['new'],
    maxItems: null,
  },
  {
    id: 'manual',
    title: 'Manual',
    subtitle: 'Human dev pipeline',
    icon: '👨‍💻',
    acceptsFrom: ['analyzed'],
    maxItems: 10,
  },
  {
    id: 'automatic',
    title: 'Automatic',
    subtitle: 'AI agent pipeline',
    icon: '🤖',
    acceptsFrom: ['analyzed'],
    maxItems: 5, // AI can handle limited concurrent items
  },
  {
    id: 'done',
    title: 'Done',
    subtitle: 'Resolved',
    icon: '✅',
    acceptsFrom: ['manual', 'automatic'],
    maxItems: null,
  },
];
```

---

## Card Design System

### Base Card Structure
All cards share a common structure but render channel-specific content differently.

```
┌────────────────────────────────────────────────┐
│ [Channel Icon] [Channel] • [Time]    [Priority]│  <- Header (consistent)
├────────────────────────────────────────────────┤
│                                                │
│  [Channel-Specific Content Area]               │  <- Content (varies by type)
│                                                │
├────────────────────────────────────────────────┤
│ [Bug Tag]  [Sentiment]           [Actions ···] │  <- Footer (consistent)
└────────────────────────────────────────────────┘
```

### Card Sizing Strategy
- **Fixed width**: Cards fill column width (minus padding)
- **Variable height**: Content determines height, but with constraints
- **Min height**: 120px (ensures consistent visual rhythm)
- **Max height**: 280px (prevents overly long cards, adds scroll/truncation)
- **Comfortable padding**: 12-16px internal padding

### Card States
```css
.kanban-card {
  /* Default state */
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.kanban-card:hover {
  border-color: var(--color-border);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.kanban-card.dragging {
  box-shadow: var(--shadow-lg);
  transform: rotate(2deg) scale(1.02);
  opacity: 0.9;
  z-index: 1000;
}

.kanban-card.drop-target {
  border-color: var(--color-accent);
  border-style: dashed;
}

.kanban-card[data-priority="critical"] {
  border-left: 3px solid var(--color-error);
}

.kanban-card[data-priority="high"] {
  border-left: 3px solid var(--color-warning);
}
```

---

## Channel-Specific Card Layouts

### 1. Email Card
```
┌────────────────────────────────────────────────┐
│ 📧 Email • 5h ago                        🔴    │
├────────────────────────────────────────────────┤
│ From: James Richardson                         │
│                                                │
│ Subject: Currency display issue                │
│ ─────────────────────────────────────────────  │
│ "Whenever I search for flights, all prices     │
│ are displayed in Czech Koruna instead of       │
│ British Pounds. I have tried changing..."      │
│                                    [Read more] │
├────────────────────────────────────────────────┤
│ 💱 Currency   😤 Frustrated        [···]       │
└────────────────────────────────────────────────┘
```

**Email-specific fields:**
- From (author name/email)
- Subject line (emphasized)
- Body excerpt (truncated with "Read more")
- Attachment indicator (if any)

### 2. Twitter/X Card
```
┌────────────────────────────────────────────────┐
│ 🐦 Twitter • 30m ago                     🔴    │
├────────────────────────────────────────────────┤
│ @DigitalNomadNina                      23.5K ▼ │
│                                                │
│ "PSA for my fellow travelers: @kiikiwicom      │
│ mobile site has a bug where you can't select   │
│ return dates. The calendar just doesn't open   │
│ on phone. Use desktop until they fix it! 🐛💻" │
│                                                │
│ ❤️ 342    🔁 156    💬 28                      │
├────────────────────────────────────────────────┤
│ 📱 Mobile   📢 Viral Risk            [···]     │
└────────────────────────────────────────────────┘
```

**Twitter-specific fields:**
- Handle with follower count (influences priority)
- Full tweet text (with emoji support)
- Engagement metrics row (likes, retweets, replies)
- Viral risk indicator for high-engagement posts

### 3. Facebook Card
```
┌────────────────────────────────────────────────┐
│ 📘 Facebook • 2h ago                     🟡    │
├────────────────────────────────────────────────┤
│ Mike Thompson                                  │
│ Comment on: "Winter Sale Ad"                   │
│ ─────────────────────────────────────────────  │
│ "Your search doesn't even work lol. Filled     │
│ everything in and the search button is greyed  │
│ out. Great ad though 😂👎"                     │
│                                                │
│ 😠 12    😆 8    👍 3                          │
├────────────────────────────────────────────────┤
│ 🔍 Search   😏 Mocking               [···]     │
└────────────────────────────────────────────────┘
```

**Facebook-specific fields:**
- Author name
- Context (Page review / Comment on post / Messenger)
- Content with reactions breakdown
- Post type indicator

### 4. Support Chat Card
```
┌────────────────────────────────────────────────┐
│ 💬 Support Chat • 1h ago                 🔴    │
├────────────────────────────────────────────────┤
│ Sarah M. • iOS Mobile                          │
│ ─────────────────────────────────────────────  │
│ 👤 "I can't select the return date on iPhone"  │
│                                                │
│ 🎧 "What happens when you tap on the field?"   │
│                                                │
│ 👤 "Nothing. I tap and tap and the calendar    │
│    just doesn't open."                         │
│                              [+2 more messages] │
├────────────────────────────────────────────────┤
│ 📱 Mobile   😤 Frustrated            [···]     │
└────────────────────────────────────────────────┘
```

**Chat-specific fields:**
- Customer name + device/locale badge
- Conversation thread (alternating customer/agent)
- Message count indicator
- Expandable to show full conversation

### 5. Trustpilot/Review Card
```
┌────────────────────────────────────────────────┐
│ ⭐ Trustpilot • Yesterday                🟡    │
├────────────────────────────────────────────────┤
│ Margaret H.              ★★☆☆☆ (2/5)          │
│ ✓ Verified Purchase                            │
│ ─────────────────────────────────────────────  │
│ "Website accessibility is terrible"            │
│                                                │
│ "I'm 67 years old and have mild visual         │
│ impairment. I literally cannot read the        │
│ flight times on the search results..."         │
│                                    [Read more] │
├────────────────────────────────────────────────┤
│ 🎨 A11y   😞 Disappointed            [···]     │
└────────────────────────────────────────────────┘
```

**Review-specific fields:**
- Star rating (visual)
- Verified purchase badge
- Review title (emphasized)
- Review body (truncated)

### 6. App Store Review Card
```
┌────────────────────────────────────────────────┐
│ 📱 App Store • 6h ago                    🔴    │
├────────────────────────────────────────────────┤
│ BackpackerBen             ★☆☆☆☆ (1/5)         │
│ iOS • v5.124.0                                 │
│ ─────────────────────────────────────────────  │
│ "Can't even complete a search"                 │
│                                                │
│ "The search button stays grey and unclickable. │
│ Tried reinstalling twice. What a waste..."     │
│                                    [Read more] │
├────────────────────────────────────────────────┤
│ 🔍 Search   😠 Angry                 [···]     │
└────────────────────────────────────────────────┘
```

**App Store-specific fields:**
- Platform icon (iOS/Android)
- App version
- Star rating
- Review title + body

### 7. Instagram Card
```
┌────────────────────────────────────────────────┐
│ 📸 Instagram • 3h ago                    🟡    │
├────────────────────────────────────────────────┤
│ @wellness_queen_cz                      8.9K ▼ │
│ 📖 Story Mention                               │
│ ─────────────────────────────────────────────  │
│ "Chtěla jsem vám doporučit super deal na       │
│ @slevomat_cz ale tlačítko Do košíku je         │
│ broken 😭 Funguje vám to někomu?"              │
│                                                │
│ 👁️ 2.1K views    📊 Poll: 77% "nefunguje"     │
├────────────────────────────────────────────────┤
│ 🛒 Cart   😞 Disappointed            [···]     │
└────────────────────────────────────────────────┘
```

**Instagram-specific fields:**
- Handle with follower count
- Content type (Story/Post/DM/Comment)
- Story views or post engagement
- Poll results if applicable

---

## Detailed Component Specifications

### Card Header
```html
<div class="card-header">
  <div class="channel-info">
    <span class="channel-icon" data-channel="twitter">🐦</span>
    <span class="channel-name">Twitter</span>
    <span class="separator">•</span>
    <span class="timestamp" title="2024-01-13T18:45:00Z">30m ago</span>
  </div>
  <div class="priority-indicator" data-priority="critical" title="Critical Priority">
    🔴
  </div>
</div>
```

```css
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border-subtle);
  margin-bottom: 10px;
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.channel-icon {
  font-size: 14px;
}

.channel-name {
  font-weight: 600;
}

.timestamp {
  color: var(--color-text-muted);
}

.priority-indicator {
  font-size: 10px;
  opacity: 0.9;
}
```

### Card Footer
```html
<div class="card-footer">
  <div class="tags">
    <span class="bug-tag">💱 Currency</span>
    <span class="sentiment-tag" data-sentiment="frustrated">😤 Frustrated</span>
  </div>
  <button class="card-menu-btn" aria-label="Card actions">
    <span>···</span>
  </button>
</div>
```

```css
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid var(--color-border-subtle);
  margin-top: 10px;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.bug-tag, .sentiment-tag {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  background: var(--color-accent-subtle);
  color: var(--color-text-primary);
}

.sentiment-tag[data-sentiment="angry"],
.sentiment-tag[data-sentiment="frustrated"] {
  background: color-mix(in srgb, var(--color-error) 15%, transparent);
}

.sentiment-tag[data-sentiment="constructive"],
.sentiment-tag[data-sentiment="helpful"] {
  background: color-mix(in srgb, var(--color-success) 15%, transparent);
}

.card-menu-btn {
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  font-size: 16px;
  letter-spacing: 1px;
}

.card-menu-btn:hover {
  background: var(--color-surface-elevated);
  color: var(--color-text-primary);
}
```

### Engagement Metrics Row (Social Cards)
```html
<div class="engagement-metrics">
  <span class="metric" title="Likes">❤️ 342</span>
  <span class="metric" title="Retweets">🔁 156</span>
  <span class="metric" title="Replies">💬 28</span>
</div>
```

```css
.engagement-metrics {
  display: flex;
  gap: 16px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed var(--color-border-subtle);
  font-size: 12px;
  color: var(--color-text-secondary);
}

.metric {
  display: flex;
  align-items: center;
  gap: 4px;
}
```

### Conversation Thread (Chat Cards)
```html
<div class="conversation-thread">
  <div class="message customer">
    <span class="role">👤</span>
    <span class="text">"I can't select the return date on iPhone"</span>
  </div>
  <div class="message agent">
    <span class="role">🎧</span>
    <span class="text">"What happens when you tap on the field?"</span>
  </div>
  <div class="message customer">
    <span class="role">👤</span>
    <span class="text">"Nothing. I tap and tap and the calendar just doesn't open."</span>
  </div>
  <button class="expand-thread">+2 more messages</button>
</div>
```

```css
.conversation-thread {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message {
  display: flex;
  gap: 8px;
  font-size: 12px;
  line-height: 1.4;
}

.message .role {
  flex-shrink: 0;
}

.message .text {
  color: var(--color-text-primary);
}

.message.agent .text {
  color: var(--color-text-secondary);
  font-style: italic;
}

.expand-thread {
  background: none;
  border: none;
  color: var(--color-accent);
  font-size: 11px;
  cursor: pointer;
  padding: 4px 0;
  text-align: left;
}

.expand-thread:hover {
  text-decoration: underline;
}
```

### Star Rating Component
```html
<div class="star-rating" data-rating="2" data-max="5" aria-label="2 out of 5 stars">
  <span class="star filled">★</span>
  <span class="star filled">★</span>
  <span class="star">☆</span>
  <span class="star">☆</span>
  <span class="star">☆</span>
  <span class="rating-text">(2/5)</span>
</div>
```

```css
.star-rating {
  display: flex;
  align-items: center;
  gap: 1px;
  font-size: 12px;
}

.star {
  color: var(--color-text-muted);
}

.star.filled {
  color: #fbbf24; /* Gold - exception to themeless as it's semantic */
}

.rating-text {
  margin-left: 6px;
  color: var(--color-text-secondary);
  font-size: 11px;
}
```

---

## Drag and Drop Implementation

### Technology Choice
Use native HTML5 Drag and Drop API with modern enhancements, OR use a lightweight library:
- **Option A**: Native HTML5 DnD (zero dependencies)
- **Option B**: `@dnd-kit` for React (recommended if using React)
- **Option C**: `SortableJS` (framework-agnostic, feature-rich)

### Drag States
```javascript
// Card states during drag operations
const dragStates = {
  idle: 'idle',           // Normal state
  dragging: 'dragging',   // Currently being dragged
  dropTarget: 'dropTarget', // Valid drop zone
  dropInvalid: 'dropInvalid', // Invalid drop zone
  dropPreview: 'dropPreview', // Where card will land
};
```

### Drop Zone Validation
```javascript
function canDrop(sourceColumn, targetColumn, card) {
  const targetConfig = columns.find(c => c.id === targetColumn);
  
  // Check if target accepts from source
  if (!targetConfig.acceptsFrom.includes(sourceColumn)) {
    return { allowed: false, reason: 'Invalid workflow transition' };
  }
  
  // Check max items limit
  const currentCount = getCardCountInColumn(targetColumn);
  if (targetConfig.maxItems && currentCount >= targetConfig.maxItems) {
    return { allowed: false, reason: `${targetConfig.title} queue is full` };
  }
  
  return { allowed: true };
}
```

### Visual Feedback During Drag
```css
/* Column feedback */
.kanban-column.drag-over-valid {
  background: color-mix(in srgb, var(--color-success) 10%, var(--color-background));
}

.kanban-column.drag-over-invalid {
  background: color-mix(in srgb, var(--color-error) 10%, var(--color-background));
}

/* Drop preview placeholder */
.drop-placeholder {
  border: 2px dashed var(--color-accent);
  border-radius: var(--radius-md);
  background: var(--color-accent-subtle);
  min-height: 100px;
  margin: 8px 0;
  transition: all var(--transition-fast);
}

/* Dragged card ghost */
.kanban-card.dragging {
  opacity: 0.8;
  transform: rotate(3deg);
  box-shadow: var(--shadow-lg);
  cursor: grabbing;
}
```

### Animation on Drop
```css
@keyframes cardDrop {
  0% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  50% {
    transform: scale(0.98);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.kanban-card.just-dropped {
  animation: cardDrop 0.3s ease-out;
}
```

---

## Column Layout

### Column Structure
```html
<div class="kanban-board">
  <div class="kanban-column" data-column-id="new">
    <div class="column-header">
      <div class="column-title">
        <span class="column-icon">📥</span>
        <h3>New</h3>
        <span class="column-count">5</span>
      </div>
      <span class="column-subtitle">Incoming feedback</span>
    </div>
    <div class="column-body" role="list">
      <!-- Cards go here -->
    </div>
  </div>
  <!-- More columns... -->
</div>
```

### Column Styling
```css
.kanban-board {
  display: flex;
  gap: 16px;
  padding: 16px;
  min-height: calc(100vh - 120px);
  overflow-x: auto;
}

.kanban-column {
  flex: 1;
  min-width: 300px;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  background: var(--color-background);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-subtle);
}

.column-header {
  padding: 16px;
  border-bottom: 1px solid var(--color-border-subtle);
  position: sticky;
  top: 0;
  background: var(--color-background);
  z-index: 10;
}

.column-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.column-title h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.column-icon {
  font-size: 16px;
}

.column-count {
  background: var(--color-surface-elevated);
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: auto;
}

.column-subtitle {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 4px;
  display: block;
}

.column-body {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Pipeline-specific column indicators */
.kanban-column[data-column-id="manual"] .column-header {
  border-left: 3px solid var(--color-warning);
}

.kanban-column[data-column-id="automatic"] .column-header {
  border-left: 3px solid var(--color-accent);
}

.kanban-column[data-column-id="done"] .column-header {
  border-left: 3px solid var(--color-success);
}
```

---

## Card Action Menu

### Menu Items
```javascript
const cardActions = [
  { id: 'view', label: 'View Details', icon: '👁️' },
  { id: 'analyze', label: 'Run Analysis', icon: '🔍', showIn: ['new'] },
  { id: 'assign-manual', label: 'Assign to Developer', icon: '👨‍💻', showIn: ['analyzed'] },
  { id: 'assign-auto', label: 'Send to AI Agent', icon: '🤖', showIn: ['analyzed'] },
  { id: 'mark-done', label: 'Mark as Done', icon: '✅', showIn: ['manual', 'automatic'] },
  { id: 'reopen', label: 'Reopen', icon: '🔄', showIn: ['done'] },
  { separator: true },
  { id: 'link-jira', label: 'Create Jira Ticket', icon: '🎫' },
  { id: 'copy-link', label: 'Copy Link', icon: '🔗' },
];
```

### Dropdown Menu Component
```html
<div class="card-menu" role="menu">
  <button class="menu-item" role="menuitem">
    <span class="menu-icon">👁️</span>
    <span class="menu-label">View Details</span>
  </button>
  <button class="menu-item" role="menuitem">
    <span class="menu-icon">🔍</span>
    <span class="menu-label">Run Analysis</span>
  </button>
  <div class="menu-separator"></div>
  <button class="menu-item" role="menuitem">
    <span class="menu-icon">🎫</span>
    <span class="menu-label">Create Jira Ticket</span>
  </button>
</div>
```

```css
.card-menu {
  position: absolute;
  right: 8px;
  top: 100%;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 180px;
  padding: 4px;
  z-index: 100;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text-primary);
  border-radius: var(--radius-sm);
  text-align: left;
}

.menu-item:hover {
  background: var(--color-surface);
}

.menu-icon {
  font-size: 14px;
  width: 20px;
  text-align: center;
}

.menu-separator {
  height: 1px;
  background: var(--color-border-subtle);
  margin: 4px 8px;
}
```

---

## Card Detail Modal

When clicking "View Details" or double-clicking a card, show expanded view:

```
┌─────────────────────────────────────────────────────────────────┐
│  📧 Email Feedback                                        [×]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  From: James Richardson <j.richardson@email.co.uk>              │
│  Date: January 9, 2024 at 9:15 AM                               │
│  Subject: Currency display issue - showing CZK instead of GBP  │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Dear Kiwi.com Support,                                         │
│                                                                 │
│  I have been a loyal customer for over 3 years now, but I'm     │
│  experiencing a frustrating issue with your website.            │
│                                                                 │
│  Whenever I search for flights, all prices are displayed in     │
│  Czech Koruna (CZK) instead of British Pounds. I have tried:    │
│                                                                 │
│  1. Changing the currency in the dropdown menu                  │
│  2. Logging out and back in                                     │
│  3. Clearing my browser cache                                   │
│  4. Using a different browser entirely                          │
│                                                                 │
│  None of these solutions work...                                │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Analysis                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Bug: BUG_001_CURRENCY_DISPLAY                           │   │
│  │ Sentiment: Frustrated                                    │   │
│  │ Priority: High                                           │   │
│  │ Suggested Action: Automatic fix available                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  [Move to Manual 👨‍💻]  [Send to AI Agent 🤖]    [Create Jira 🎫] │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Model

### Feedback Item Interface
```typescript
interface FeedbackItem {
  id: string;
  company: 'kiwi' | 'slevomat';
  channel: 'email' | 'twitter' | 'facebook' | 'support_chat' | 'trustpilot' | 'app_store' | 'instagram';
  timestamp: string; // ISO 8601
  status: 'new' | 'analyzed' | 'manual' | 'automatic' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Common fields
  author: {
    name: string;
    handle?: string;      // Social media
    email?: string;       // Email
    followers?: number;   // Social reach
    verified?: boolean;   // Verified purchase
    locale?: string;      // User locale
    device?: string;      // Device info
  };
  
  content: {
    subject?: string;     // Email subject / Review title
    body: string;         // Main content
    excerpt?: string;     // Truncated preview
    translation?: string; // For non-English content
  };
  
  // Channel-specific
  engagement?: {
    likes?: number;
    retweets?: number;
    replies?: number;
    reactions?: Record<string, number>;
    views?: number;
  };
  
  conversation?: Array<{
    role: 'customer' | 'agent';
    message: string;
  }>;
  
  rating?: number;        // 1-5 stars
  
  // Analysis results
  analysis?: {
    bugId: string;
    bugTag: string;
    sentiment: string;
    suggestedPipeline: 'manual' | 'automatic';
    confidence: number;
  };
  
  // Metadata
  tags: string[];
  linkedTickets?: string[]; // Jira ticket IDs
  resolvedAt?: string;
  resolvedBy?: 'human' | 'ai';
}
```

---

## Keyboard Accessibility

### Shortcuts
| Key | Action |
|-----|--------|
| `Tab` | Navigate between cards |
| `Enter` / `Space` | Open card detail modal |
| `Arrow keys` | Navigate within column |
| `M` | Open card menu |
| `D` | Quick move to Done |
| `Escape` | Close modal / Cancel drag |

### Focus Management
```css
.kanban-card:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.kanban-column:focus-within .column-header {
  border-color: var(--color-accent);
}
```

---

## File Output

Single file: `feedback-kanban.html` (or component files if using framework)

Should include:
- Complete Kanban board structure
- All card type templates
- Drag and drop functionality
- Sample data for demo
- CSS using only theme variables

---

## Testing Checklist

### Themeless Compliance
- [ ] Zero hardcoded colors (except semantic gold for stars)
- [ ] All colors use CSS variables
- [ ] Works in light mode
- [ ] Works in dark mode
- [ ] Typography inherits from parent

### Drag & Drop
- [ ] Cards can be dragged smoothly
- [ ] Valid drop zones highlight green
- [ ] Invalid drop zones highlight red / show error
- [ ] Cards animate on drop
- [ ] Workflow rules enforced (can't skip columns)
- [ ] Max item limits respected

### Card Rendering
- [ ] Email cards show subject, from, excerpt
- [ ] Twitter cards show handle, followers, engagement
- [ ] Facebook cards show context, reactions
- [ ] Chat cards show conversation thread
- [ ] Review cards show stars, verified badge
- [ ] Instagram cards show content type, views
- [ ] All cards truncate properly at max-height
- [ ] "Read more" / "Expand" works

### Responsive
- [ ] Horizontal scroll on small screens
- [ ] Cards remain readable at minimum width
- [ ] Touch drag works on mobile/tablet

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader announcements for drag/drop
- [ ] Focus indicators visible
- [ ] ARIA labels present