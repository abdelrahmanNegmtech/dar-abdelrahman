# DAR App — Premium Stays in Egypt

## Project Overview
A Next.js 16 application for premium short/long-term stays in Egypt. Three user portals:
- **Marketplace (Guest)** — Browse & book properties
- **Owner Portal (Host)** — Manage listings & earnings
- **Admin Console** — Oversee properties, users & analytics

---

## 🧭 User Flows & Routes

### 🏠 PUBLIC / GUEST (No Auth Required)
| Route | Description | Key Components |
|-------|-------------|----------------|
| `/` | Homepage — Hero + Recommendations + Popular Stays | `HeroSection`, `PopularStaysSection`, `MarketplaceFooter` |
| `/stays/[slug]` | Property Details | `PropertyDetailsPage`, `BookingCard`, `ReviewsSection` |
| `/stays/[slug]/gallery` | Property Gallery | `PropertyGalleryPage`, `PhotoGrid`, `HeroGalleryViewer` |
| `/hotels` | Hotels Listing | `MarketplaceShell`, `PropertyStayCard` |
| `/hotels/[slug]` | Hotel Details | `HotelDetailsClient` |
| `/search` | Search Results | `SearchExperience`, `FilterSidebar`, `SearchPropertyCard` |
| `/booking` | Booking Flow | `BookingFlow` |
| `/booking/payment` | Payment | Payment form |
| `/booking/confirmed` | Confirmation | Success state |
| `/booking/cancelled` | Cancelled | Cancelled state |
| `/booking/failed` | Failed | Error state |
| `/about` | About Us | `AboutPage` |
| `/contact` | Contact | `ContactPage` |
| `/help` | Help Center | `HelpCenterPage` |
| `/legal` | Legal Center | `LegalCenterPage` |
| `/legal/[slug]` | Legal Detail | Terms, Privacy, etc. |
| `/favorites` | Favorites | `FavoritesPage` |
| `/saved` | Saved Properties | Saved listing |
| `/become-a-host` | Host Landing Page | `HostLandingPage` |
| `/add-property` | Quick Add Property | Add property form |

### 🔐 AUTHENTICATION
| Route | Description |
|-------|-------------|
| `/login` | Login |
| `/sign-up` | Sign Up |
| `/create-account` | Create Account (with type selector) |
| `/forgot-password` | Forgot Password |
| `/password-reset` | Password Reset |
| `/verify-email` | Email Verification |

### 👤 TRAVELER DASHBOARD (After Login)
| Route | Description | Layout |
|-------|-------------|--------|
| `/traveler` | Dashboard | `TravelerLayout` |
| `/traveler/bookings` | My Bookings | `TravelerLayout` |
| `/traveler/bookings/[bookingId]` | Booking Details | `TravelerLayout` |
| `/traveler/bookings/[bookingId]/invoice` | Invoice | `TravelerLayout` |
| `/traveler/dashboard` | Dashboard (alt) | `TravelerLayout` |
| `/traveler/messages` | Messages | `TravelerLayout` |
| `/traveler/notifications` | Notifications | `TravelerLayout` |
| `/traveler/payments` | Payments | `TravelerLayout` |
| `/traveler/profile` | Profile | `TravelerLayout` |
| `/traveler/reviews` | Reviews | `TravelerLayout` |
| `/traveler/saved` | Saved Properties | `TravelerLayout` |
| `/traveler/settings` | Settings | `TravelerLayout` |
| `/traveler/support` | Support | `TravelerLayout` |
| `/traveler/support/tickets/[ticketId]` | Ticket Details | `TravelerLayout` |

### 🏡 OWNER / HOST PORTAL (After Login)
| Route | Description | Layout |
|-------|-------------|--------|
| `/owner` | Dashboard — Stats + Quick Actions | `OwnerShell` |
| `/owner/properties` | My Properties | `OwnerShell` |
| `/owner/properties/new/details` | Add Property — Details | `OwnerShell` |
| `/owner/properties/new/photos` | Add Property — Photos | `OwnerShell` |
| `/owner/properties/publish` | Publish New Property | `OwnerShell` |
| `/owner/properties/[id]` | Property Details | `OwnerShell` |
| `/owner/properties/[id]/edit` | Edit Property | `OwnerShell` |
| `/owner/properties/[id]/publish` | Publish Existing | `OwnerShell` |
| `/owner/properties/[id]/photos` | Manage Photos | `OwnerShell` |
| `/owner/properties/[id]/calendar` | Calendar | `OwnerShell` |
| `/owner/properties/[id]/calendar-management` | Calendar Management | `OwnerShell` |
| `/owner/properties/[id]/seasonal-pricing` | Seasonal Pricing | `OwnerShell` |
| `/owner/properties/[id]/availability-rules` | Availability Rules | `OwnerShell` |
| `/owner/properties/[id]/rejected` | Rejected Property | `OwnerShell` |
| `/owner/bookings` | Booking Requests | `OwnerShell` |
| `/owner/bookings/request-decision` | Decision Page | `OwnerShell` |
| `/owner/payouts` | Payouts & Earnings | `OwnerShell` |
| `/owner/verification` | Identity Verification | `OwnerShell` |
| `/owner/help-center` | Help Center | `OwnerShell` |

### 🛡️ ADMIN CONSOLE
| Route | Description | Layout |
|-------|-------------|--------|
| `/admin` | Dashboard / Overview | `AdminLayout` (with `AdminSidebar`) |
| `/admin/properties` | Properties Management | `AdminLayout` |
| `/admin/users` | Users Management | `AdminLayout` |
| `/admin/bookings` | Bookings Management | `AdminLayout` |
| `/admin/reports` | Reports & Analytics | `AdminLayout` |

---

## 🎨 Design System

### Brand Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--brand` | `#5631d8` | Primary brand color |
| `--brand-strong` | `#4a2ac2` | Darker variant (hover states) |
| `--brand-soft` | `#ede9ff` | Light background variant |
| `--brand-ghost` | `rgba(86, 49, 216, 0.12)` | Subtle ghost background |
| `--background` | `#f3f6fb` | Page background |
| `--foreground` | `#0d1838` | Primary text color |
| `--surface` | `#ffffff` | Card/surface background |
| `--surface-dark` | `#091225` | Dark sidebar background |
| `--sidebar-dark-background` | `#070f1d` | Sidebar background |

### Fonts
- **Sans**: Geist (via `next/font`) with `Segoe UI`, `SF Pro Text` fallbacks
- **Mono**: Geist Mono with `SFMono-Regular`, `Consolas` fallbacks

### Logo
- **Dark surface**: `/dar-logo-uploaded.png`
- **Light surface**: `/dar-logo-purple.png`
- **Component**: `@/components/brand/dar-logo` (use `DarLogo` with `surface` prop)
- **Auth variant**: `@/features/authentication/components/BrandLogo` (uses `/assets/images/dar-logo.png`)

> **Note**: Logo needs unification. Currently 3 different logo components exist.

---

## 📁 Project Structure
```
dar-app/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth pages group
│   ├── (public)/           # Public pages group
│   ├── admin/              # Admin Console
│   ├── booking/            # Booking flow
│   ├── owner/              # Owner Portal
│   ├── traveler/           # Traveler Dashboard
│   ├── host/               # Host features
│   ├── hotels/             # Hotel listing
│   ├── stays/              # Property listing
│   ├── api/                # API routes
│   └── layout.tsx          # Root layout
├── components/             # Shared components
│   ├── brand/              # Brand logo
│   ├── host-landing/       # Host landing page
│   ├── owner/              # Owner shell & cards
│   └── ui/                 # UI primitives
├── features/               # Feature modules
│   ├── authentication/     # Auth UI
│   ├── bookings/           # Booking management
│   ├── design-system/      # Design system primitives
│   ├── overview/           # Admin overview
│   ├── properties/         # Property management
│   ├── public-marketplace/ # Guest marketplace
│   ├── reports/            # Admin reports
│   ├── sidebar/            # Navigation sidebar
│   ├── system-states/      # Empty/error/loading states
│   ├── traveler/           # Traveler dashboard
│   └── users/              # User management
├── hooks/                  # Custom hooks
├── lib/                    # Utilities
│   ├── constants/          # App constants
│   ├── dar-data.ts        # Mock data
│   ├── supabase/          # Supabase client
│   └── utils/             # Utility functions
└── public/                 # Static assets
```

---

## 🔧 Technical Stack
- **Framework**: Next.js 16.2.9 (Turbopack)
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS v4
- **Icons**: lucide-react
- **Database**: Supabase (configured, not yet connected)
- **Forms**: react-hook-form

---

## ✅ Recent Polish (May 2026)
1. **Color Unification**: Brand color `#5631d8` standardized across Owner Portal
   - `#5522d9` → `var(--brand)` in 5 files
   - Hover states → `var(--brand-strong)`
   - Accent/border/focus colors → `var(--brand)`
2. **Real Images**: 47 PNG assets from original designs copied to `public/`
3. **SVG→PNG**: 53+ image references updated across 13 Owner Portal files

## 🚧 Next Steps
1. [ ] **Unify Logo** — Consolidate `BrandLogo.tsx` + `DarLogo.tsx` into single component
2. [ ] **Fix Owner Layout** — Add `OwnerSidebar` to `app/owner/layout.tsx`
3. [ ] **Fix Navigation Links** — Audit and fix broken links across Owner Portal
4. [ ] **Connect Supabase** — Wire up auth, data fetching, and API routes
5. [ ] **Remove Dead SVGs** — Delete orphaned `.svg` placeholders from `public/`
6. [ ] **GitHub Setup** — Add proper `.gitignore`, README, CI/CD
