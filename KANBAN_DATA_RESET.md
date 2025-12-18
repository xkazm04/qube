# Kanban Mock Data Reset

## Changes Made ✅

All feedback items have been reset to the **"New"** state to provide a clean starting point for demos.

## What Was Changed

### Status Updates
Changed all items from various statuses to `status: 'new'`:
- **fb-006** - App Store (Critical): `analyzed` → `new`
- **fb-007** - Instagram: `analyzed` → `new`
- **fb-008** - Email (High Priority): `analyzed` → `new`
- **fb-009** - X/Twitter (High Priority): `manual` → `new`
- **fb-010** - Support Chat: `manual` → `new`
- **fb-011** - Facebook: `automatic` → `new`
- **fb-012** - App Store (High Priority): `automatic` → `new`
- **fb-013** - Email: `done` → `new`
- **fb-014** - X/Twitter: `done` → `new`
- **fb-015** - Trustpilot: `done` → `new`

### Removed Fields
Cleaned up all items by removing fields that represent processed/analyzed state:

1. **`analysis` object** - Removed from all items (was present in fb-006 through fb-015)
   - No more `bugId`, `bugTag`, `sentiment`, `suggestedPipeline`, `confidence`
   
2. **`linkedTickets` array** - Removed from items that had JIRA links
   - fb-009: Removed `['JIRA-1234']`
   - fb-010: Removed `['JIRA-1235']`
   - fb-013: Removed `['JIRA-1230']`
   - fb-014: Removed `['JIRA-1228']`

3. **`resolvedAt` timestamp** - Removed from completed items
   - fb-013, fb-014, fb-015

4. **`resolvedBy` field** - Removed from completed items
   - fb-013: Was `'ai'`
   - fb-014: Was `'human'`
   - fb-015: Was `'human'`

## Current State

### All 15 Items Now in "New" Column
- ✅ **5 items** - Already were in "new" state (fb-001 through fb-005)
- ✅ **10 items** - Moved to "new" state (fb-006 through fb-015)

### Total Distribution by Priority:
- **Critical**: 3 items (fb-001, fb-002, fb-004, fb-006)
- **High**: 3 items (fb-008, fb-009, fb-013)
- **Medium**: 8 items (fb-003, fb-005, fb-007, fb-010, fb-011, fb-014)
- **Low**: 1 item (fb-015)

### Distribution by Channel:
- **Email**: 3 items
- **X (Twitter)**: 3 items
- **Support Chat**: 2 items
- **App Store**: 2 items
- **Facebook**: 2 items
- **Trustpilot**: 2 items
- **Instagram**: 1 item

### Distribution by Company:
- **Kiwi.com**: 10 items
- **Slevomat**: 5 items

## Demo Workflow

Now you can demonstrate the complete AI processing workflow from scratch:

1. **Start**: All 15 items in "New" column
2. **Select items**: Right-click to select multiple items
3. **Process with AI**: Click "Process with AI" button
4. **Watch**: Items automatically analyzed and moved to "Analyzed" column
5. **Route**: Items can then be moved to "Manual" or "Automatic" pipelines
6. **Complete**: Move items to "Done" when resolved

## Benefits for Demo

✅ **Clean slate** - No pre-processed items cluttering other columns
✅ **Full workflow** - Can demonstrate entire process from start to finish
✅ **SLA indicators** - All items show fresh timestamps with varying SLA states
✅ **Realistic variety** - Mix of priorities, channels, and companies
✅ **No hardcoded state** - Everything happens through the UI interactions

## Preserved Data

All original content remains intact:
- Customer complaints and feedback text
- Author information
- Timestamps (for SLA calculations)
- Engagement metrics (likes, retweets, etc.)
- Tags
- Priority levels
- Channel and company assignments

## File Modified

- `app/features/social/lib/kanbanMockData.ts`

## Testing

To verify the changes:
1. Load the Kanban board
2. Confirm all 15 items appear in the "New" column
3. No items in "Analyzed", "Manual", "Automatic", or "Done" columns
4. All items can be selected and processed with AI

Perfect for demos! 🎯
