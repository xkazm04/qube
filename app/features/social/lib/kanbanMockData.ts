import type { FeedbackItem } from './kanbanTypes';

export const mockKanbanFeedback: FeedbackItem[] = [
  // NEW - Email
  {
    id: 'fb-001',
    company: 'kiwi',
    channel: 'email',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: 'new',
    priority: 'critical',
    author: {
      name: 'James Richardson',
      email: 'j.richardson@email.co.uk',
      locale: 'en-GB',
    },
    content: {
      subject: 'Currency display issue - showing CZK instead of GBP',
      body: 'Dear Kiwi.com Support,\n\nI have been a loyal customer for over 3 years now, but I\'m experiencing a frustrating issue with your website.\n\nWhenever I search for flights, all prices are displayed in Czech Koruna (CZK) instead of British Pounds. I have tried:\n\n1. Changing the currency in the dropdown menu\n2. Logging out and back in\n3. Clearing my browser cache\n4. Using a different browser entirely\n\nNone of these solutions work. This is making it impossible to compare prices effectively.',
      excerpt: 'Whenever I search for flights, all prices are displayed in Czech Koruna instead of British Pounds. I have tried changing...',
    },
    tags: ['currency', 'localization'],
  },
  // NEW - Twitter
  {
    id: 'fb-002',
    company: 'kiwi',
    channel: 'twitter',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'new',
    priority: 'critical',
    author: {
      name: 'Nina Digital',
      handle: '@DigitalNomadNina',
      followers: 23500,
    },
    content: {
      body: 'PSA for my fellow travelers: @kiwicom mobile site has a bug where you can\'t select return dates. The calendar just doesn\'t open on phone. Use desktop until they fix it! 🐛💻',
      excerpt: 'PSA for my fellow travelers: @kiwicom mobile site has a bug...',
    },
    engagement: {
      likes: 342,
      retweets: 156,
      replies: 28,
    },
    tags: ['mobile', 'calendar'],
  },
  // NEW - Facebook
  {
    id: 'fb-003',
    company: 'slevomat',
    channel: 'facebook',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'new',
    priority: 'medium',
    author: {
      name: 'Mike Thompson',
    },
    content: {
      body: 'Your search doesn\'t even work lol. Filled everything in and the search button is greyed out. Great ad though 😂👎',
      excerpt: 'Your search doesn\'t even work lol...',
    },
    contextType: 'Comment on: "Winter Sale Ad"',
    engagement: {
      reactions: { angry: 12, haha: 8, like: 3 },
    },
    tags: ['search', 'button'],
  },
  // NEW - Support Chat
  {
    id: 'fb-004',
    company: 'kiwi',
    channel: 'support_chat',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: 'new',
    priority: 'critical',
    author: {
      name: 'Sarah M.',
      device: 'iOS Mobile',
    },
    content: {
      body: 'I can\'t select the return date on iPhone',
      excerpt: 'I can\'t select the return date on iPhone',
    },
    conversation: [
      { role: 'customer', message: 'I can\'t select the return date on iPhone' },
      { role: 'agent', message: 'What happens when you tap on the field?' },
      { role: 'customer', message: 'Nothing. I tap and tap and the calendar just doesn\'t open.' },
      { role: 'customer', message: 'I\'ve tried restarting the app multiple times' },
      { role: 'customer', message: 'Still not working. This is urgent, I need to book today!' },
    ],
    tags: ['mobile', 'calendar', 'iOS'],
  },
  // NEW - Trustpilot
  {
    id: 'fb-005',
    company: 'kiwi',
    channel: 'trustpilot',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'new',
    priority: 'medium',
    author: {
      name: 'Margaret H.',
      verified: true,
    },
    content: {
      subject: 'Website accessibility is terrible',
      body: 'I\'m 67 years old and have mild visual impairment. I literally cannot read the flight times on the search results. The font is too small and there\'s not enough contrast. Very disappointing from a major travel company.',
      excerpt: 'I\'m 67 years old and have mild visual impairment...',
    },
    rating: 2,
    tags: ['accessibility', 'font-size', 'contrast'],
  },
  // ANALYZED - App Store
  {
    id: 'fb-006',
    company: 'kiwi',
    channel: 'app_store',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    status: 'analyzed',
    priority: 'critical',
    author: {
      name: 'BackpackerBen',
    },
    content: {
      subject: 'Can\'t even complete a search',
      body: 'The search button stays grey and unclickable. Tried reinstalling twice. What a waste of storage space. Fix your app!',
      excerpt: 'The search button stays grey and unclickable...',
    },
    rating: 1,
    platform: 'ios',
    appVersion: 'v5.124.0',
    analysis: {
      bugId: 'BUG_SEARCH_001',
      bugTag: 'Search Button',
      sentiment: 'angry',
      suggestedPipeline: 'automatic',
      confidence: 0.92,
    },
    tags: ['search', 'button', 'iOS'],
  },
  // ANALYZED - Instagram
  {
    id: 'fb-007',
    company: 'slevomat',
    channel: 'instagram',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: 'analyzed',
    priority: 'medium',
    author: {
      name: 'Wellness Queen CZ',
      handle: '@wellness_queen_cz',
      followers: 8900,
    },
    content: {
      body: 'Chtěla jsem vám doporučit super deal na @slevomat_cz ale tlačítko Do košíku je broken 😭 Funguje vám to někomu?',
      excerpt: 'Chtěla jsem vám doporučit super deal...',
      translation: 'I wanted to recommend a great deal on @slevomat_cz but the Add to Cart button is broken 😭 Does it work for anyone?',
    },
    contextType: 'Story Mention',
    engagement: {
      views: 2100,
    },
    analysis: {
      bugId: 'BUG_CART_002',
      bugTag: 'Add to Cart',
      sentiment: 'disappointed',
      suggestedPipeline: 'automatic',
      confidence: 0.88,
    },
    tags: ['cart', 'button', 'Czech'],
  },
  // ANALYZED - Email
  {
    id: 'fb-008',
    company: 'kiwi',
    channel: 'email',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    status: 'analyzed',
    priority: 'high',
    author: {
      name: 'David Chen',
      email: 'd.chen@techcorp.com',
    },
    content: {
      subject: 'Payment processing error - Card declined incorrectly',
      body: 'My valid credit card is being rejected during checkout. The error says "Card declined" but I\'ve verified with my bank that the card is fine. I\'ve tried 3 different cards and all are rejected.',
      excerpt: 'My valid credit card is being rejected during checkout...',
    },
    analysis: {
      bugId: 'BUG_PAYMENT_003',
      bugTag: 'Payment Gateway',
      sentiment: 'frustrated',
      suggestedPipeline: 'manual',
      confidence: 0.75,
    },
    tags: ['payment', 'checkout', 'critical'],
  },
  // MANUAL - Twitter
  {
    id: 'fb-009',
    company: 'kiwi',
    channel: 'twitter',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    status: 'manual',
    priority: 'high',
    author: {
      name: 'TechBlogger Mike',
      handle: '@TechMikeBlog',
      followers: 45000,
    },
    content: {
      body: 'Just spent 2 hours debugging @kiwicom\'s API integration for a travel app I\'m building. Their date format documentation is completely wrong. ISO 8601? Nope. Custom format they don\'t document. 🤦‍♂️',
      excerpt: 'Just spent 2 hours debugging @kiwicom\'s API...',
    },
    engagement: {
      likes: 89,
      retweets: 23,
      replies: 15,
    },
    analysis: {
      bugId: 'DOC_API_001',
      bugTag: 'API Documentation',
      sentiment: 'frustrated',
      suggestedPipeline: 'manual',
      confidence: 0.95,
    },
    linkedTickets: ['JIRA-1234'],
    tags: ['api', 'documentation', 'developer'],
  },
  // MANUAL - Support Chat
  {
    id: 'fb-010',
    company: 'slevomat',
    channel: 'support_chat',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    status: 'manual',
    priority: 'medium',
    author: {
      name: 'Jana Novakova',
      device: 'Windows Desktop',
      locale: 'cs-CZ',
    },
    content: {
      body: 'Voucher code is not applying correctly',
      excerpt: 'Voucher code is not applying correctly',
    },
    conversation: [
      { role: 'customer', message: 'Mám problém s použitím slevového kódu WINTER50' },
      { role: 'agent', message: 'Můžete mi poslat screenshot chybové hlášky?' },
      { role: 'customer', message: 'Posílám. Kód by měl dát 50% slevu ale ukazuje jen 10%' },
    ],
    analysis: {
      bugId: 'BUG_VOUCHER_004',
      bugTag: 'Voucher Logic',
      sentiment: 'frustrated',
      suggestedPipeline: 'manual',
      confidence: 0.82,
    },
    linkedTickets: ['JIRA-1235'],
    tags: ['voucher', 'discount', 'Czech'],
  },
  // AUTOMATIC - Facebook
  {
    id: 'fb-011',
    company: 'kiwi',
    channel: 'facebook',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: 'automatic',
    priority: 'medium',
    author: {
      name: 'Travel Enthusiast Group',
    },
    content: {
      body: 'The flight price changed between selecting and checkout! Started at €150, ended up at €220. Classic bait and switch.',
      excerpt: 'The flight price changed between selecting and checkout...',
    },
    contextType: 'Group Post Mention',
    engagement: {
      reactions: { angry: 45, sad: 12, like: 8 },
    },
    analysis: {
      bugId: 'BUG_PRICE_005',
      bugTag: 'Price Consistency',
      sentiment: 'angry',
      suggestedPipeline: 'automatic',
      confidence: 0.91,
    },
    tags: ['pricing', 'checkout'],
  },
  // AUTOMATIC - App Store
  {
    id: 'fb-012',
    company: 'slevomat',
    channel: 'app_store',
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    status: 'automatic',
    priority: 'high',
    author: {
      name: 'AndroidUser2024',
    },
    content: {
      subject: 'App crashes on startup',
      body: 'After the latest update, the app crashes immediately on startup. Pixel 7 Pro, Android 14. Please fix ASAP!',
      excerpt: 'After the latest update, the app crashes immediately...',
    },
    rating: 1,
    platform: 'android',
    appVersion: 'v3.45.2',
    analysis: {
      bugId: 'BUG_CRASH_006',
      bugTag: 'App Crash',
      sentiment: 'frustrated',
      suggestedPipeline: 'automatic',
      confidence: 0.97,
    },
    tags: ['crash', 'android', 'startup'],
  },
  // DONE - Email
  {
    id: 'fb-013',
    company: 'kiwi',
    channel: 'email',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    status: 'done',
    priority: 'high',
    author: {
      name: 'Patricia Williams',
      email: 'p.williams@gmail.com',
    },
    content: {
      subject: 'Booking confirmation not received',
      body: 'I completed a booking 3 hours ago but still haven\'t received any confirmation email. My booking reference shows on the website but I need the email for my records.',
      excerpt: 'I completed a booking 3 hours ago but still haven\'t received...',
    },
    analysis: {
      bugId: 'BUG_EMAIL_007',
      bugTag: 'Email Delivery',
      sentiment: 'frustrated',
      suggestedPipeline: 'automatic',
      confidence: 0.89,
    },
    resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    resolvedBy: 'ai',
    linkedTickets: ['JIRA-1230'],
    tags: ['email', 'confirmation', 'booking'],
  },
  // DONE - Twitter
  {
    id: 'fb-014',
    company: 'slevomat',
    channel: 'twitter',
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    status: 'done',
    priority: 'medium',
    author: {
      name: 'Czech Food Lover',
      handle: '@CzechFoodie',
      followers: 5200,
    },
    content: {
      body: 'Hey @slevomat_cz the restaurant filter on your app doesn\'t work properly. Selecting "Prague 1" shows results from all over Prague 👀',
      excerpt: 'Hey @slevomat_cz the restaurant filter on your app...',
    },
    engagement: {
      likes: 12,
      retweets: 3,
      replies: 2,
    },
    analysis: {
      bugId: 'BUG_FILTER_008',
      bugTag: 'Location Filter',
      sentiment: 'constructive',
      suggestedPipeline: 'manual',
      confidence: 0.85,
    },
    resolvedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    resolvedBy: 'human',
    linkedTickets: ['JIRA-1228'],
    tags: ['filter', 'location', 'restaurants'],
  },
  // DONE - Trustpilot
  {
    id: 'fb-015',
    company: 'kiwi',
    channel: 'trustpilot',
    timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    status: 'done',
    priority: 'low',
    author: {
      name: 'Happy Traveler',
      verified: true,
    },
    content: {
      subject: 'Great experience, one small suggestion',
      body: 'Overall loved using Kiwi! One small thing - it would be nice if the calendar showed public holidays for the destination country. Would help with planning.',
      excerpt: 'Overall loved using Kiwi! One small thing...',
    },
    rating: 4,
    analysis: {
      bugId: 'FEAT_CAL_001',
      bugTag: 'Feature Request',
      sentiment: 'constructive',
      suggestedPipeline: 'manual',
      confidence: 0.78,
    },
    resolvedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    resolvedBy: 'human',
    tags: ['feature-request', 'calendar', 'holidays'],
  },
];

export function getFeedbackByStatus(status: string): FeedbackItem[] {
  return mockKanbanFeedback.filter((item) => item.status === status);
}

export function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = now.getTime() - time.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}
