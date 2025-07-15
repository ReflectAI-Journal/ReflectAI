# ReflectAI - Daily Reflection Companion

## Overview

ReflectAI is a full-stack journaling application that combines personal reflection with AI-powered insights. The application helps users maintain consistent journaling habits while providing thoughtful analysis and guidance through various AI personalities. It features journal entries, goal tracking, emotional analytics, and different AI conversation modes including philosophical discussions.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: TailwindCSS with shadcn/ui component library for consistent design
- **State Management**: TanStack React Query for server state and local React state for UI
- **Routing**: Wouter for lightweight client-side routing
- **Animations**: Framer Motion for smooth UI transitions
- **Forms**: React Hook Form with Zod validation
- **Payment Processing**: Stripe integration for subscriptions

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript for type safety
- **Authentication**: Passport.js with local strategy and session management
- **Database ORM**: Drizzle ORM with PostgreSQL
- **AI Integration**: OpenAI API (GPT-4o) for journal analysis and conversations
- **Email Service**: SendGrid for notifications
- **Session Storage**: In-memory store with configurable persistence

### Database Schema
- **Users**: Authentication, subscription status, trial management
- **Journal Entries**: Content, moods, AI responses, favorites
- **Journal Stats**: Streak tracking, mood analytics, entry counts
- **Goals**: Multi-level goal system (life, yearly, monthly, weekly, daily)
- **Goal Activities**: Time tracking, progress logging
- **Chat Usage**: AI conversation history and limits

## Key Components

### Journal System
- Rich text editor for daily entries
- Mood tracking and sentiment analysis
- AI-powered reflection generation with privacy safeguards
- Calendar-based navigation and archives
- Export functionality for data portability

### AI Personalities
- Multiple conversation modes: counselor, philosopher, general advice
- Customizable personality system with built-in and user-created options
- Context-aware responses based on journal content
- Content sanitization for privacy protection

### Goals and Progress Tracking
- Hierarchical goal structure supporting different time horizons
- Activity logging with time tracking
- Visual progress charts using Recharts
- Streak visualization and motivation systems

### Analytics and Insights
- Emotion timeline tracking
- Mind pattern analysis from journal content
- Memory Lane feature for revisiting past entries
- Statistical dashboards with various chart types

## Data Flow

1. **User Authentication**: Passport.js handles login/registration with bcrypt password hashing
2. **Journal Entry Creation**: React Hook Form → Validation → API → Drizzle ORM → PostgreSQL
3. **AI Analysis**: Journal content → Privacy sanitization → OpenAI API → Response storage
4. **Real-time Updates**: TanStack Query manages cache invalidation and optimistic updates
5. **Subscription Management**: Stripe webhooks → Database updates → Feature access control

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL hosting
- **OpenAI API**: GPT-4o for AI conversations and analysis
- **Stripe**: Payment processing and subscription management
- **SendGrid**: Email delivery service

### Development Tools
- **Replit**: Development environment with custom cartographer plugin
- **ESBuild**: Fast bundling for production server code
- **TypeScript**: Static type checking across the entire stack

### UI Libraries
- **Radix UI**: Headless components for accessibility
- **Lucide React**: Icon library
- **Recharts**: Data visualization components
- **Date-fns**: Date manipulation utilities

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- tsx for running TypeScript server directly
- In-memory session storage for development simplicity
- Environment variables for API keys and database connections

### Production
- Static frontend build served by Express server
- ESBuild bundle for optimized server code
- SSL enforcement and security headers
- PostgreSQL with connection pooling
- Memory store with cleanup for session management

### Security Considerations
- Content Security Policy headers
- XSS protection and CSRF prevention
- Password hashing with scrypt
- PII sanitization before AI processing
- Session timeout and secure cookie configuration

## Changelog
- July 15, 2025. Fixed app startup issues and verified Stripe integration:
  - Resolved application startup failures by ensuring all required environment variables are properly configured
  - Confirmed OpenAI API key and Stripe secret key are correctly set and accessible
  - Verified database connection is working properly with PostgreSQL
  - Tested Stripe checkout session creation - working perfectly with successful redirects to checkout.reflectai-journal.site
  - Stripe payment flow is fully functional: users can select plans, create checkout sessions, and be redirected to Stripe
  - Removed debugging logs after confirming Stripe integration is working correctly
- July 15, 2025. Complete Stripe payment integration implementation:
  - Completely removed all LemonSqueezy references and replaced with Stripe
  - Added stripeCustomerId and stripeSubscriptionId fields to users table
  - Implemented Stripe checkout sessions for subscription management
  - Created /api/create-checkout-session endpoint for secure payment processing
  - Updated subscription page with static pricing plans (Pro $14.99/mo, Unlimited $24.99/mo)
  - Built checkout flow using Stripe-hosted pages for PCI compliance
  - Added payment verification system in CheckoutSuccess page
  - App now uses Stripe exclusively for all payment processing with proper webhook handling
- July 13, 2025. Implemented upgrade modal system for premium features:
  - Created UpgradeModal component with professional design for feature upgrade prompts
  - Built UpgradeContext provider to manage upgrade modal state across the application
  - Added automatic detection of subscription-required API errors with custom event handling
  - Integrated upgrade prompts on Stats page ("Advanced Analytics") and MindPatterns page ("Advanced Pattern Analysis")
  - System shows user-friendly popups when accessing Unlimited-only features with option to upgrade
  - Modal includes feature descriptions, required plan badges, and direct links to subscription page
- July 13, 2025. Added comprehensive Terms of Service functionality:
  - Created detailed Terms of Service page at /terms-of-service with legal content covering privacy, billing, AI disclaimers, and usage policies
  - Added comprehensive refund policy section with 7-day money-back guarantee, prorated refunds for annual plans, and clear refund process
  - Added detailed privacy policy covering data collection, usage, protection, sharing, user rights, retention, and international compliance
  - Added Terms of Service link in footer for easy public access
  - Added Terms & Conditions menu item in user profile dropdown for authenticated users
  - Page includes proper styling, responsive design, and professional legal language
  - Fixed app startup issues by resolving ES module import path conflicts between server and frontend
- July 11, 2025. Implemented revised user flow: questionnaire → counselor match → account creation → subscription plans:
  - Created new CounselorMatch page that shows personalized counselor details after questionnaire completion
  - Updated flow: questionnaire → /counselor-match → /auth?tab=register&source=questionnaire → /subscription
  - Users now see their matched counselor profile before being asked to create an account
  - Modified Auth component to detect questionnaire source and redirect appropriately after account creation
  - Simplified checkout flow to use direct LemonSqueezy URLs for reliable payment processing
  - Enhanced user engagement by showing counselor match results before requesting account creation
- July 11, 2025. Fixed payment confirmation button text and LemonSqueezy checkout integration:
  - Updated both PaymentSuccess and CheckoutSuccess page buttons to say "Go to App" instead of "View Order"
  - Resolved LemonSqueezy API "Unprocessable Entity" errors by switching to direct checkout URLs with custom success parameters
  - Direct URLs include checkout[custom][success_url] parameter to redirect to /checkout-success after payment
  - Eliminated complex API integration that was causing validation errors
  - All payment confirmations now have clear "Go to App" buttons that redirect to the application
- July 11, 2025. Fixed iPhone button overflow on counselor match page:
  - Made counselor journey button responsive with shorter text on mobile devices
  - Added progressive text shortening: desktop shows full text, mobile shows "Begin with [Name]"
  - Improved overall mobile layout with better padding and spacing for iPhone screens
  - Button now fits properly within screen bounds on all device sizes
- July 11, 2025. Created comprehensive user tutorial system for new subscribers:
  - Built interactive tutorial component with step-by-step guidance through all features
  - Added tutorial trigger on successful subscription payments (both Stripe and LemonSqueezy)
  - Created tutorial context provider for managing tutorial state across the app
  - Added manual tutorial trigger in Settings page under Help & Support section
  - Tutorial covers counselor chat, journaling, philosophy mode, goals, check-ins, and analytics
  - Users can skip or complete tutorial, with progress saved in localStorage
  - Tutorial automatically starts for new premium subscribers after payment
- July 11, 2025. Updated logo to transparent SVG for better display across backgrounds:
  - Created new transparent SVG logo with blue-to-purple gradient
  - Updated all logo imports across App.tsx, Header.tsx, Landing.tsx, Auth.tsx, and Footer.tsx
  - Removed dark background from logo for better integration with light and dark themes
  - Logo now displays consistently on all pages with transparent background
- July 11, 2025. Enhanced daily check-in system with intelligent issue tracking:
  - Added new database fields to check-ins: isResolved, priority, tags, followUpDate for comprehensive issue tracking
  - Implemented automated daily check-in generation with personalized wellness questions
  - Created intelligent AI analysis system that determines if issues are resolved based on user responses
  - Added automatic follow-up scheduling for unresolved high-priority issues (1 day for urgent, 3 days for high priority)
  - Enhanced MemoryLane page with prominent daily check-in interface and improved check-in type badges
  - Added new API endpoints: /api/check-ins/daily, /api/check-ins/daily/status, /api/check-ins/unresolved
  - System now provides continuous support by automatically following up on concerning responses
- July 11, 2025. Major logo update with new gradient ReflectAI brand identity:
  - Replaced all logo instances across Header, Landing, Auth, Footer, and App loading screen with new gradient logo
  - Updated favicon and app icons with new branding
  - Removed all CSS color filters to display logo in original blue gradient colors
  - Updated logo file path to 'new-reflectai-logo.png' across all components
  - Logo now displays consistent dark blue to purple gradient design on all pages
- July 11, 2025. Complete branding update with new ReflectAI logo:
  - Replaced all logo instances across Header, Landing, Auth, and mobile app pages with official Reflect AI Logo.png
  - Removed CSS color filters to display logo in original colors
  - Updated favicon and app icons with new branding
  - Streamlined logo styling by removing redundant text labels
  - Maintained consistent logo sizing across all components
- July 11, 2025. Updated payment flow to redirect to AI counselor page:
  - Modified PaymentSuccess component to automatically redirect to '/app/counselor' after 2 seconds
  - Updated payment success button text to "Start Counseling Session"
  - Added LemonSqueezy webhook endpoint at '/api/webhooks/lemonsqueezy' to handle payment confirmations
  - Created new CheckoutSuccess page for LemonSqueezy redirect flow
  - Updated LemonSqueezy checkout configuration to include success_url pointing to '/checkout-success'
  - Added payment success redirect endpoint at '/api/payment-success' for authenticated users
  - All successful payments now direct users to the AI counseling interface immediately
- July 11, 2025. Removed Plausible analytics tracking:
  - Deleted all Plausible script tags from HTML files
  - Removed plausible-init.js file
  - Updated Content Security Policy to remove Plausible domains
  - Cleaned up iOS app HTML files
  - Application no longer sends any data to Plausible analytics
- July 11, 2025. Removed Check-ins and Challenges features:
  - Completely deleted Check-ins and Challenges pages and components
  - Removed navigation items for both features from bottom navigation
  - Added redirects for old /app/check-ins and /app/challenges routes to home page
  - Simplified secondary navigation to only include Stats and Archives
  - App now focuses on core journaling and AI conversation features
- July 11, 2025. Replaced Memory Lane with Check-ins system:
  - Implemented complete check-ins database schema with scheduled follow-ups
  - Added automatic check-in creation when AI asks questions during conversations
  - Created check-ins API endpoints and storage interface
  - Replaced Memory Lane page content with Check-ins functionality
  - Check-ins are scheduled 2-3 days after AI questions for continued dialogue
  - Users can respond to check-ins and receive AI follow-up responses
- July 11, 2025. Enhanced AI responsiveness and user profile styling:
  - Reduced AI response length to 2-3 sentences max with 150 token limit
  - Updated all AI personalities to always end with engaging questions
  - Made AI responses more interactive and conversation-focused
  - Added colorful modern user profile section to Settings page
  - Profile includes gradient avatar, subscription badges, and stats cards
  - Implemented glassmorphism design with backdrop blur effects
- July 11, 2025. Updated subscription plan pricing:
  - Changed Pro monthly price from $9.99 to $14.99
  - Changed Pro annual price from $101.90 to $152.90 (15% discount maintained)
  - Changed Unlimited monthly price from $17.99 to $24.99
  - Changed Unlimited annual price from $183.50 to $254.90 (15% discount maintained)
  - Updated pricing in both main server routes and iOS configuration
- July 8, 2025. Major pivot: Transformed app focus from journaling to AI counselor:
  - Changed main messaging from "AI-powered journaling" to "AI counselor made just for you"  
  - Updated hero section: "Talk Anywhere Anytime with your AI counselor made just for you"
  - Revised all features to focus on counseling: 24/7 support, personalized guidance, crisis support
  - Changed about section to "Your Personal AI Counselor" with therapy-focused benefits
  - Updated visual mockups from mood charts to chat interface representation
  - Modified call-to-action from "Try AI Reflection" to "Talk to AI Counselor"
- July 8, 2025. Updated subscription naming and improved chat interfaces:
  - Changed subscription plan naming from "yearly" to "annually" for better clarity
  - Added smooth animations for chat focus modes with slide-in/slide-out transitions
  - Implemented Cancel and Send buttons for both Counselor and Philosopher fullscreen modes
  - Fixed cursor positioning and visibility in all text input areas
  - Added billing period toggle on subscription page for easy switching between monthly/annual plans
  - Reduced zoom levels further (85% desktop, 75% mobile) for more compact interface
- July 7, 2025. Fixed AI insights, text input sizing, and navigation layout issues:
  - Fixed AI insights by adding proper user authentication to all journal entry routes
  - Added user ID verification to ensure users can only access their own entries
  - Improved textarea auto-resize with proper viewport sizing and scroll handling
  - Fixed navigation layout by moving entries counter below premium button
  - Enhanced textarea styling with better focus states and responsive design
  - Tested and verified all fixes work correctly with real user sessions
- July 4, 2025. Fixed deployment issues:
  - Converted server from CommonJS to ES modules
  - Updated TypeScript configuration for ES2022 target
  - Fixed module imports in server/index.ts and server/security.ts
  - Ensured consistent port 5000 usage for deployment
  - Verified production build process works correctly
- June 27, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.