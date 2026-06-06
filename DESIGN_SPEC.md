# DESIGN SPEC — Percy: Responsive Web & Mobile Voucher Wallet

**Project Name**: Percy (פרסי)  
**Type**: Responsive Web Application  
**Platforms**: Desktop, Tablet, Mobile  
**Purpose**: A smart digital voucher wallet for managing gift cards, discount codes, and loyalty benefits

---

## Brand Identity

### Color Palette

**Primary Brand Color**: `#C7CEEA` (Soft Lavender/Purple)  
**Secondary**: `#F4A261` (Warm Amber)  
**Accent**: `#00704A` (Deep Green - for success/active states)  
**Danger**: `#E74C3C` (Red)  
**Warning**: `#F39C12` (Orange)  

**Neutral Scale**:
- Background: `#0A0A0F` (Deep Black)
- Surface: `#1A1A2E` (Dark Navy)
- Elevated Surface: `#2D2D44` (Charcoal)
- Border: `rgba(255,255,255,0.1)`
- Text Primary: `#FFFFFF`
- Text Secondary: `#D1D5DB` (Light Gray)
- Text Muted: `#9CA3AF` (Medium Gray)

### Typography

- **Headlines**: "DM Sans" Bold (600-800 weight)
- **Body**: "DM Sans" Regular (400-500 weight)
- **Monospace (Codes)**: "JetBrains Mono" (600-700 weight)
- **Hebrew RTL**: Native support throughout

### Logo & Icon Style

- Clean, minimalist voucher/ticket icon
- Primary icon: 🎟️ voucher emoji as placeholder
- Custom icon set needed for: wallet, add, search, settings, favorites, expiry alerts

---

## Design System Components

### Buttons

**Primary Button**
- Background: Linear gradient (`#C7CEEA` → `#B8BEDE`)
- Text: White, Bold
- Padding: 16px 24px
- Border Radius: 16px
- Shadow: `0 8px 20px rgba(199, 206, 234, 0.3)`
- Hover: Brighten 10%

**Secondary Button**
- Background: `rgba(255,255,255,0.07)`
- Border: `1px solid rgba(255,255,255,0.1)`
- Text: White
- Padding: 14px 20px
- Border Radius: 12px

**Danger Button**
- Background: `rgba(231, 76, 60, 0.15)`
- Border: `1px solid rgba(231, 76, 60, 0.3)`
- Text: `#E74C3C`

### Input Fields

- Background: `rgba(255,255,255,0.06)`
- Border: `1px solid rgba(255,255,255,0.1)`
- Border Radius: 14px
- Padding: 13px 16px
- Focus: Border color `#C7CEEA`, background `rgba(199,206,234,0.1)`

### Cards

- Background: `rgba(255,255,255,0.06)`
- Border: `1px solid rgba(255,255,255,0.1)`
- Border Radius: 20px
- Padding: 16px
- Shadow: Subtle drop shadow `0 4px 12px rgba(0,0,0,0.2)`
- Hover: Slight lift, border brightens

### Badges & Status Indicators

**Active**: Green background `#2ECC71`, text white  
**Partial**: Orange background `#F39C12`, text white  
**Used**: Gray background `#6B7280`, text white  
**Expired**: Dark gray `#9B9B9B`  

---

## Layout & Responsive Design

### Breakpoints

- **Mobile**: 0px - 640px (portrait/landscape)
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px+

### Grid System

- **Mobile**: Single column, full width with 24px margins
- **Tablet**: 2-column layout when beneficial
- **Desktop**: 3-column card grid, or 2-column with sidebar

### Navigation

**Mobile**:
- Bottom navigation bar with 5 main tabs
- Icons + Labels
- Floating Action Button (FAB) for "Add Voucher" centered above navbar

**Tablet**:
- Top navigation bar OR horizontal sidebar
- Icons + Labels
- Breadcrumb support

**Desktop**:
- Horizontal top navbar with logo, search, settings
- OR Left sidebar with navigation menu
- Full-width content area

### Main Sections

1. **Dashboard/Home**
   - Summary cards: Total Value, Active Count, Expiring Soon
   - Recent alerts banner
   - Tab selector: All | Favorites | Stats
   - Search + Filter bar

2. **My Vouchers (All Vouchers)**
   - List/Grid view toggle
   - Filter sidebar (Category, Status, Amount, Expiry)
   - Sort options (Expiry, Value, Store Name)
   - Voucher cards with swipe actions (mobile)
   - Infinite scroll OR pagination

3. **Voucher Detail**
   - Large store name + balance display
   - Barcode/QR code display (full brightness on mobile)
   - Photo gallery
   - Usage history timeline
   - Quick actions: Mark Used, Edit, Delete, Share
   - Expiry countdown with color urgency
   - Location & restriction notes

4. **Add/Edit Voucher**
   - AI photo scan option (upload image)
   - Manual form with all fields
   - Category selector
   - Color picker for card styling
   - Photo attachment
   - Status selection

5. **Search**
   - Full-text search across store, code, notes
   - Recent searches
   - Barcode scan-to-search option (mobile)

6. **Statistics**
   - Overview dashboard with stats boxes
   - Category breakdown with progress bars
   - Value by category chart
   - Usage patterns

7. **Settings**
   - Notification preferences
   - iCloud/backup options
   - Theme (if applicable)
   - About & Privacy
   - Sign out

---

## Key Visual Patterns

### Voucher Card Design

**Mobile Layout**:
- Top color stripe (brand color)
- Store name (bold)
- Barcode/code displayed as monospace
- Remaining balance (large, prominent)
- Status badge with dot indicator
- Expiry countdown (color-coded: green/yellow/red)
- Photo thumbnail (if available)
- Favorite star (if pinned)
- Swipe handle for actions

**Desktop/Tablet Layout**:
- Same card structure but with more breathing room
- Hover state shows actions inline
- Multi-column grid (2-3 cards per row)

### Color Coding for Status

- **Active**: Green accent
- **Partially Used**: Orange/Yellow accent
- **Used**: Gray/muted
- **Expired**: Dark gray, low opacity

### Expiry Indicator

- **>30 days**: Green circle, "Exp [date]"
- **7-30 days**: Yellow circle with 🟡, "[N] days left"
- **<7 days**: Red circle with 🔴, "[N] days left"
- **Expired**: Dark circle with ⚠️, "Expired"

---

## Mobile-First Specifications

### Screen Sizes

- iPhone SE (375px)
- iPhone 12/13/14/15 (390px)
- iPhone Pro Max (430px)
- Landscape mode support

### Touch Targets

- Minimum 44px × 44px for all interactive elements
- Swipe gestures for card actions
- Long-press for context menus (if needed)

### Bottom Navigation (Mobile Only)

Fixed at bottom, 5 tabs:
1. 🗂 Wallet (All Vouchers)
2. ★ Favorites
3. 📊 Stats
4. 🔍 Search
5. ⚙️ Settings

### Floating Action Button (Mobile)

- Position: Bottom-right, above navbar
- Icon: + (plus)
- Color: Lavender gradient
- Size: 56px diameter
- Shadow: Elevated
- Tap to add new voucher

---

## Desktop Specifications

### Sidebar Navigation (Optional Design A)

- Left sidebar: 240px wide
- White space, clean section headers
- Icons + text for each menu item
- Collapsible on smaller desktops

### Top Navigation (Optional Design B)

- Horizontal navbar: Percy logo | Search bar | User profile icon | Settings
- Sticky/fixed at top
- Clean, minimal design

### Content Area

- Max width: 1200px-1400px (centered)
- Responsive padding
- Grid layout for cards (2-3 columns)

---

## Interactive States

### Hover States (Desktop)

- Card: Lift slightly, border brightens
- Button: Opacity increase, shadow enhancement
- Link: Underline appears

### Active States

- Selected tab: Highlighted background + underline
- Active filter: Background color + check mark

### Loading States

- Skeleton screens for cards
- Spinner for data loading (brief)
- No loading spinner for instant local operations

### Empty States

- Contextual messaging ("No vouchers yet")
- Call-to-action ("Tap + to add your first voucher")
- Illustration/icon placeholder

---

## Animations & Transitions

- **Card swipe**: 250ms cubic-bezier transition
- **Page transitions**: 300ms fade-in
- **Button hover**: 150ms ease-in-out
- **Loading spinner**: Continuous 800ms rotation
- **Toast notifications**: Slide-in from top (200ms), slide-out (200ms)

---

## Accessibility

- **Color Contrast**: WCAG AA minimum (4.5:1 for text)
- **Focus States**: Clear visible focus rings
- **Screen Reader**: Semantic HTML, ARIA labels
- **Dynamic Type**: Support for text scaling
- **Dark Mode**: Native support (already dark theme)

---

## Hebrew RTL Support

- All layouts fully mirrored for RTL
- Text direction: right-to-left by default
- Date format: DD.MM.YYYY
- Currency symbol: ₪ (right of amount)
- Store names: Original language (Hebrew or English as branded)

---

## Performance Goals

- **Page load**: <2 seconds on 4G
- **Barcode display**: <200ms to render
- **List load**: <100ms for cached data
- **Search**: Real-time as user types
- **Image optimization**: Lazy load photos

---

## Data Features

### Voucher Attributes to Display

- Store name
- Category
- Barcode / Code
- Original Amount
- Remaining Amount
- Expiry Date
- Status (Active / Partial / Used / Expired)
- Location Scope
- Photo/Receipt image
- Notes
- Favorite flag

### User Actions

- Add voucher (scan, photo, manual)
- View detail
- Mark as used
- Log partial use
- Edit voucher
- Delete voucher
- Pin to favorites
- Share barcode
- Search
- Filter
- Sort
- Set reminders

---

## Design Deliverables Needed

1. **Design System Components** (Figma/design tool):
   - All button variants
   - Input fields & states
   - Cards & card variants
   - Badges & status indicators
   - Navigation components

2. **Page Designs** (Hi-fidelity mockups):
   - Dashboard/Home (mobile, tablet, desktop)
   - All Vouchers list (mobile, tablet, desktop)
   - Voucher Detail (mobile, tablet, desktop)
   - Add/Edit Voucher (mobile, tablet, desktop)
   - Search Results
   - Statistics Page
   - Settings Page

3. **Interactive Prototypes**:
   - Card swipe actions (mobile)
   - Filter interactions
   - Page transitions
   - Mobile navigation flow

4. **Icon Set**:
   - Wallet, Add, Search, Settings, Favorites, Expiry, Delete, Edit, etc.

5. **Typography & Spacing Guide**:
   - Type scale
   - Line heights
   - Spacing scale (8px, 12px, 16px, 24px, 32px, etc.)

---

## Notes for Designer

- **Dark theme** is intentional — premium, modern feel
- **Lavender accent** differentiates from typical fintech apps
- **Card-based design** mirrors physical wallet experience
- **Emphasis on expiry management** — key selling point
- **Hebrew-first** design — fully RTL support essential
- **Mobile-responsive** must feel native on both small and large screens
- **Barcode prominence** on detail view — must be immediately scannable
- **Swipe actions** (mobile) should be intuitive and discoverable

---

**Ready for Figma/Design Tool Handoff** ✅
