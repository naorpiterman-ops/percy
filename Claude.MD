# CLAUDE.md — VaultCard: iPhone Voucher Management App

## Project Overview

**App Name**: VaultCard (שמירת שוברים)  
**Platform**: iOS (iPhone-first, iPad compatible)  
**Language**: Swift + SwiftUI  
**Minimum iOS**: 17.0  
**Purpose**: A personal digital wallet for managing gift cards, vouchers, discount codes, store credits, and loyalty benefits — inspired by real Israeli consumer voucher ecosystems (Ten Bis, Carrefour, Leumi Bonus, Fix, BuyMe, Rami Levi, Behatsdaa, etc.)

---

## Core Data Model

### Voucher Entity

```swift
struct Voucher: Identifiable, Codable {
    var id: UUID
    var store: String                    // e.g., "קרפור", "תן ביס", "פיקס"
    var category: VoucherCategory
    var source: VoucherSource
    var code: String                     // barcode number / digital code
    var codeType: CodeType               // barcode, QR, numeric, alphanumeric
    var originalAmount: Decimal
    var remainingAmount: Decimal          // enables partial-use tracking
    var currency: String                 // "ILS" default
    var location: LocationScope          // where it can be used
    var expiryDate: Date?
    var purchaseDate: Date?
    var notes: String?
    var tags: [String]
    var status: VoucherStatus
    var usageHistory: [UsageEvent]
    var imageData: Data?                 // photo of physical voucher/receipt
    var barcodeImageData: Data?
    var isPinned: Bool
    var alertSettings: AlertSettings
    var linkedOrderNumber: String?       // e.g. "8530174" from Behatsdaa
    var networkRestrictions: String?     // e.g. "לא ניתן לשימוש ב-Carrefour Hyper"
}
```

### Supporting Types

```swift
enum VoucherCategory {
    case food           // תן ביס, החישוק, רולדין
    case supermarket    // קרפור, רמי לוי בשכונה
    case fashion        // פיקס, FOX, MANGO, etc.
    case home           // BuyMe Home Design, Fox Home
    case entertainment  // הוט סינמה, Jump
    case health         // שיפא, פארם
    case generalRetail  // תו פלוס, לאומי בונוס
    case fuel           // סונול, פז
    case kids           // Golf Kids, Toys R Us
    case other
}

enum VoucherSource {
    case tenBis              // תן ביס platform
    case buyMe               // BuyMe platform
    case leumiBonus          // לאומי בונוס
    case behatsdaa           // בהצדעה (military discount)
    case leumit              // קופת חולים לאומית
    case physical            // paper/receipt voucher
    case employer            // from employer benefit card
    case manual              // user entered manually
    case scanned             // scanned from photo
}

enum VoucherStatus {
    case active
    case partiallyUsed(remainingAmount: Decimal)
    case fullyUsed
    case expired
    case paused              // temporarily set aside
}

enum CodeType {
    case barcode(format: BarcodeFormat)  // EAN-128, CODE-39, etc.
    case qr
    case numericOnly
    case alphanumeric
    case url                             // e.g., https://slink.k4a.co.il/...
}

enum LocationScope {
    case specificBranch(name: String, address: String)
    case chainwide                       // all branches of chain
    case cityOnly(city: String)
    case nationwide
    case onlineOnly
    case offlineOnly
    case custom(description: String)
}

struct UsageEvent: Codable {
    var date: Date
    var amountUsed: Decimal
    var storeBranch: String?
    var receiptNote: String?
}

struct AlertSettings: Codable {
    var expiryAlerts: Bool               // default: true
    var daysBeforeExpiry: [Int]          // e.g. [30, 7, 1]
    var lowBalanceAlert: Bool
    var lowBalanceThreshold: Decimal?    // e.g., alert when < 20 ILS remaining
}
```

---

## Features

### 1. Voucher Capture (Add Flow)

**Methods to add a voucher:**

- **📷 Scan Barcode / QR** — Camera opens, reads code, auto-fills store if recognized
- **📸 Photo Import** — OCR on receipt or digital screenshot (read barcode number, amount, expiry, store)
- **🔗 Share Extension** — Accept shared screenshots from other apps (browser, mail, Ten Bis app)
- **✋ Manual Entry** — Full form with all fields
- **📧 Email Import** — Parse confirmation emails from known senders (Leumi Bonus, Ten Bis, BuyMe, Behatsdaa)

**Smart OCR extraction targets:**
- Store name
- Barcode / code number
- Amount (₪ value)
- Expiry date
- Order number / receipt number
- Network restrictions / usage rules
- Location scope

### 2. Voucher List & Browse

**Views:**
- **All Vouchers** — default sorted by expiry (soonest first)
- **By Category** — food, fashion, supermarket, etc.
- **By Store** — grouped alphabetically
- **By Source** — Ten Bis, Leumi Bonus, physical, etc.
- **Expiring Soon** — within 30 days
- **High Value** — sorted by remaining amount desc
- **Pinned** — user-starred vouchers at top

**Filters:**
- Status: Active / Partial / Used / Expired
- Category multi-select
- Amount range slider
- Location: online / offline / specific city
- Date range (purchase or expiry)

**Sort options:**
- Expiry date (asc/desc)
- Remaining value (high/low)
- Store name (A-Z)
- Recently added
- Recently used

### 3. Voucher Detail View

Displays:
- Store logo / name
- Current remaining balance (large, prominent)
- Progress bar: original → remaining (visual burn-down)
- Barcode / QR rendered natively (full-brightness, white background)
- Expiry countdown ("פג תוקף בעוד 12 יום" with color urgency)
- Usage history timeline
- Location restrictions clearly listed
- Source platform badge
- Notes field
- Quick action: **Mark Used** / **Log Partial Use** / **Share** / **Edit**

**Brightness auto-boost** when barcode is displayed (like Wallet app).

### 4. Partial Use Logging

When a voucher has ₪200 and user spends ₪163.23:
- Tap **"השתמשתי בחלק"** 
- Enter amount used + optional branch name + optional photo of receipt
- Remaining balance auto-calculated and shown
- Transaction logged in usage history
- Status updates to `partiallyUsed`

### 5. Smart Expiry Management

- **Expiry timeline**: color-coded indicator
  - 🟢 >30 days
  - 🟡 7–30 days  
  - 🔴 <7 days
  - ⚫ Expired (grayed out, moved to archive)
- **Push notifications**: configurable per-voucher (30 days, 7 days, 1 day before)
- **Expired archive**: still accessible, searchable; never auto-deleted
- **Grace period flag**: some stores honor vouchers briefly after expiry — user can mark this

### 6. Dashboard / Home

**Summary widgets:**
- Total value in active vouchers (₪ sum)
- Expiring this week (count + total value)
- Recently used
- Highest value voucher

**Quick-use panel**: Swipe to show barcode instantly for last-used or pinned vouchers.

### 7. Store Recognition & Enrichment

Built-in store database for Israeli chains:
- Auto-detect from barcode prefix or OCR text
- Pre-fill: logo, category, typical usage restrictions, location scope
- Supported: Ten Bis, BuyMe, Carrefour, Rami Levi, Fix, Fox, Behatsdaa, Leumi Bonus, Hot Cinema, Roladin, HaChishuk, Golf, Mango, Ace, Vardinon, Tiv Taam, and 50+ more

### 8. Network & Location Restrictions

Prominently display (not buried):
- "תקף בסניפי רמי לוי בשכונה בלבד — לא ניתן במעלה החורש 90 ירושלים"
- "לא ניתן לשימוש ב-Carrefour Hyper"
- "ניתן לשימוש עצמי בלבד — לא ניתן להעברה"
- Tap for full terms

### 9. Sharing & Export

- Share barcode image via AirDrop, WhatsApp, Messages
- Export voucher as PDF (for physical printout)
- Share to Apple Wallet (where barcode format is compatible)
- Export all active vouchers as CSV (for backup)
- **Cannot share**: system warns if voucher terms prohibit transfer

### 10. Search

- Full-text search across: store, code, notes, tags, amount
- Fuzzy matching (Hebrew + English)
- Recent searches remembered
- Barcode scan-to-search (point camera at existing barcode to find it)

### 11. Sync & Backup

- **iCloud sync** — across user's devices (iPhone + iPad)
- **iCloud Keychain** — codes stored securely
- **Local backup** — encrypted JSON export to Files app
- No server-side storage of voucher codes (privacy-first)

### 12. Widgets (iOS Home Screen & Lock Screen)

- **Small widget**: Count of expiring this week + total value
- **Medium widget**: Top 2 vouchers by urgency with remaining amount
- **Lock screen widget**: Expiring today count

---

## UX/UI Design Principles

### Visual Design Language

**Theme**: Clean, premium, card-based — inspired by physical wallet cards.  
**Color system**:
```
Primary:       #1A1A2E  (deep navy)
Accent:        #F4A261  (warm amber — evokes physical receipts/paper)
Surface:       #FFFFFF / #F8F7F4 (warm white)
Success:       #2ECC71
Warning:       #F39C12
Danger:        #E74C3C
Expired:       #9B9B9B
Text primary:  #1A1A2E
Text secondary:#6B7280
```

**Typography**: 
- Headlines: SF Pro Rounded (native, feels approachable)
- Body: SF Pro Text
- Amounts: SF Pro Display, bold, large — money is the hero
- Hebrew RTL: fully supported, layout mirrors correctly

**Card design**:
- Each voucher is a card with subtle drop shadow
- Store color or gradient derived from brand where possible
- Amount shown prominently (36pt+), remaining vs original
- Status indicator as a left-border color stripe

### Key UX Patterns

**1. Swipe Actions on List**
- Swipe left: Mark Used / Delete
- Swipe right: Pin / Quick Barcode

**2. Barcode Display**
- Full-screen barcode mode on tap
- Screen brightness auto-set to 100%
- White padding around barcode always
- Code number displayed below in large monospaced font
- Easy tap-to-copy

**3. Contextual Empty States**
- "No expiring vouchers 🎉" (not generic "no items")
- "Add your first voucher with the + button"

**4. Onboarding (first launch)**
- 3-screen carousel: what is VaultCard, how to add, how expiry alerts work
- Immediate permission request for notifications with clear rationale
- Skip option always visible

**5. Status Bar Color**
- Green when all vouchers healthy
- Amber when some expiring soon
- Red when vouchers expiring this week

**6. Accessibility**
- VoiceOver labels on all elements
- Dynamic Type support (all text scales)
- High contrast mode support
- Haptic feedback on barcode scan success, mark-as-used, etc.

**7. RTL / Hebrew First**
- All layouts default to RTL
- Hebrew date formats (dd.mm.yy)
- Hebrew currency (₪ prefix, not suffix)
- All system strings localized in Hebrew + English

**8. Speed**
- Barcode must display within 200ms of opening a voucher
- List must load in <100ms from cached data
- No loading spinners for local operations

---

## Navigation Structure

```
TabBar:
├── 🏠 Home (Dashboard)
│   ├── Summary cards
│   ├── Expiring soon list
│   └── Quick-access pinned
│
├── 💳 My Vouchers
│   ├── Filter/Sort bar
│   ├── Voucher list (cards)
│   └── Voucher Detail
│       ├── Barcode fullscreen
│       ├── Usage history
│       └── Log partial use
│
├── ➕ Add (Center tab — prominent)
│   ├── Scan barcode/QR
│   ├── Import photo
│   └── Manual entry
│
├── 🔍 Search
│   └── Results list
│
└── ⚙️ Settings
    ├── Notifications
    ├── Default alert timing
    ├── iCloud sync toggle
    ├── Export / Backup
    ├── Store database update
    └── About / Privacy
```

---

## Technical Architecture

```
VaultCard/
├── App/
│   ├── VaultCardApp.swift
│   └── AppDelegate.swift
├── Models/
│   ├── Voucher.swift
│   ├── VoucherStatus.swift
│   ├── UsageEvent.swift
│   └── StoreDatabase.swift
├── ViewModels/
│   ├── VoucherListVM.swift
│   ├── VoucherDetailVM.swift
│   ├── AddVoucherVM.swift
│   └── DashboardVM.swift
├── Views/
│   ├── Home/
│   ├── VoucherList/
│   ├── VoucherDetail/
│   ├── AddVoucher/
│   ├── Search/
│   └── Settings/
├── Services/
│   ├── OCRService.swift          // Vision framework
│   ├── BarcodeService.swift      // AVFoundation
│   ├── NotificationService.swift
│   ├── CloudSyncService.swift    // CloudKit
│   ├── StoreRecognitionService.swift
│   └── ImportService.swift       // Email / share extension parsing
├── Persistence/
│   ├── CoreDataStack.swift
│   └── VoucherRepository.swift
├── Extensions/
│   └── Decimal+Currency.swift
└── Resources/
    ├── StoreDatabase.json        // Offline store catalog
    └── Localizable.strings (he, en)
```

**Key Frameworks:**
- `SwiftUI` — all UI
- `CoreData` — local persistence
- `CloudKit` — iCloud sync
- `Vision` — OCR for photo import
- `AVFoundation` — live barcode scanning
- `UserNotifications` — expiry alerts
- `WidgetKit` — home/lock screen widgets
- `ShareExtension` — accept shared screenshots

---

## Edge Cases & Rules

| Scenario | Behavior |
|---|---|
| Voucher with ₪0 remaining | Auto-suggest "Mark as fully used" |
| Two vouchers for same store | Show combined available balance on store page |
| Voucher with no expiry | Show "ללא תאריך תפוגה" — no countdown shown |
| Duplicate barcode scanned | Alert: "This code already exists — view it?" |
| Code is a URL | Open in-app browser + option to save code separately |
| Expired voucher used accidentally | Allow logging, add note "used after expiry" |
| Photo import fails OCR | Fall back to manual entry with pre-filled photo attached |
| Physical receipt (paper) | Photo stored as reference image, manual data entry |
| No internet | All features work offline; sync queued for next connection |

---

## Localization

- **Primary language**: Hebrew (RTL)
- **Secondary**: English
- All amounts in ₪ (ILS)
- Date format: dd.mm.yy (Israeli standard)
- Store names kept in original language (Hebrew or English as branded)

---

## Privacy & Security

- No voucher codes stored on any external server
- iCloud sync uses user's private iCloud container (CloudKit private database)
- No analytics without explicit user opt-in
- Biometric lock option (Face ID / Touch ID) for app access
- Screenshots of barcode view are disabled by default (privacy toggle in settings)
- Compliance with Israeli privacy law (חוק הגנת הפרטיות)

---

## Version Roadmap

**v1.0 — MVP**
- Manual add + barcode scan
- Full voucher detail with barcode display
- Partial use logging
- Expiry alerts
- iCloud sync

**v1.1**
- OCR photo import
- Share extension
- Home screen widgets

**v1.2**
- Email import (Ten Bis, BuyMe, Leumi Bonus parsers)
- Store database with logos
- Combined balance view per store

**v2.0**
- Apple Wallet integration
- Family sharing (shared voucher pool)
- Recurring voucher templates (e.g., monthly employer benefit)