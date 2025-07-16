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
- July 16, 2025. Updated free trial buttons to bypass login and go directly to checkout:
  - Changed "Free Trial" buttons to navigate to `/checkout-step1` instead of `/checkout/plan-id`
  - Added plan parameters to checkout URLs (pro-monthly and unlimited-monthly)
  - Users can now start the checkout process without authentication requirements
  - Streamlined user experience by removing authentication barrier for trial signup
- July 16, 2025. Updated subscription buttons to emphasize free trial offering:
  - Changed "Get Pro Monthly" button text to "Free Trial" in pricing section
  - Changed "Get Unlimited Monthly" button text to "Free Trial" in pricing section
  - Maintained existing pricing information and secondary annual buttons
  - Enhanced focus on free trial value proposition for user acquisition
- July 16, 2025. Cleaned up duplicate ReflectAI logos to keep only one in header:
  - Removed duplicate ReflectAI logo from Footer component
  - Kept only the main ReflectAI logo in Header component for consistent branding
  - Cleaned up unused logo import from Footer component
  - Maintained copyright text in footer while removing visual logo duplication
- July 16, 2025. Removed Light Mode button from profile menu while maintaining theme functionality in Settings:
  - Removed the "Light Mode" toggle button from the profile dropdown menu
  - Cleaned up unused theme state and toggle function from ProfileMenu component
  - Removed unused Moon and Sun icon imports from ProfileMenu
  - Maintained full theme switching functionality in Settings page with Light/Dark/System options
  - Light mode theme system now working correctly with proper CSS variables and class application
  - Theme preferences are still properly saved in localStorage and applied across the application
- July 16, 2025. Enhanced Stripe customer creation and payment method attachment:
  - Updated customer creation to attach payment method during creation with payment_method and invoice_settings
  - Modified both /api/create-subscription and /api/create-subscription-simple endpoints for better payment method handling
  - For new customers: payment method attached during customer creation with default payment method settings
  - For existing customers: payment method attached separately and set as default via customer update
  - Added stripe.confirmCardSetup implementation to CheckoutStep2.tsx and StripeCheckout.tsx
  - Frontend can now handle setup intent client secrets using confirmCardSetup method
  - Backend updated to provide setupIntentClientSecret in subscription creation responses
  - Added environment variable-based subscription creation endpoint /api/create-subscription-simple
  - Configured multiple Stripe price IDs in environment variables for different subscription plans
  - Both payment confirmation methods (confirmCardPayment and confirmCardSetup) now available
- July 16, 2025. Fixed Stripe setup intent configuration for embedded checkout:
  - Fixed setup intent error by adding automatic_payment_methods configuration with allow_redirects: 'never'
  - Restricted payment method types to 'card' only for embedded checkout compatibility
  - Enhanced setup intent to work properly with in-app payment processing without requiring return_url
  - Payment method validation now works seamlessly within the embedded checkout flow
- July 16, 2025. Redesigned checkout page with clean, professional layout:
  - Implemented modern, minimalist design with improved spacing and typography
  - Simplified form inputs with consistent styling and better visual hierarchy
  - Enhanced grid layout with payment form and billing information sidebar
  - Removed excessive gradients and decorative elements for cleaner appearance
  - Streamlined security indicators and trust badges throughout the page
- July 16, 2025. Fixed Stripe API integration and enhanced checkout page design:
  - Fixed Stripe API structure from invalid `product: name` to correct `product_data: { name, description }` format
  - Resolved "No such product" error by using proper Stripe API v2024-06-20 structure for dynamic product creation
  - Enhanced CheckoutStep2 page with professional design including SSL/PCI compliance badges
  - Added trust indicators, security messaging, and improved visual hierarchy throughout payment form
  - Enhanced card input fields with better styling, icons, shadows, and hover effects
  - Improved submit button with gradient effects, loading states, and security messaging
  - Added comprehensive security footer with compliance badges and Stripe branding
  - Payment processing now works correctly within the app using embedded Stripe Elements
- July 16, 2025. Restored embedded Stripe Elements for in-app payment processing:
  - Reverted to embedded Stripe Elements approach to keep payment processing within the app
  - Updated /api/create-subscription endpoint to handle payment methods and create subscriptions directly
  - Modified CheckoutStep2 to process payments inline using Stripe Elements instead of external redirects
  - Maintained proper product_data structure with latest Stripe API version 2024-06-20
  - Users complete payment without leaving the app while maintaining 7-day trial period
  - Embedded payment flow provides seamless user experience while staying within the application
- July 16, 2025. Implemented proper credit card processing with Stripe Elements:
  - Updated StripeCheckout component to collect and process credit card data directly through Stripe Elements
  - Modified /api/create-subscription endpoint to handle payment methods and create subscriptions properly
  - Credit card information now flows securely to Stripe for payment processing with 7-day trial period
  - Replaced redirect-based checkout with embedded payment method collection and subscription creation
  - Enhanced checkout.session.completed webhook with comprehensive logging and metadata handling
  - Replaced SendGrid with Resend email service for reliable feedback delivery
  - Verified feedback system works with screenshot capture and email delivery
- July 16, 2025. Implemented unified 3-step checkout flow with consistent design template:
  - Created complete checkout sequence: Subscription (plan selection) → CheckoutStep1 (personal info) → CheckoutStep2 (payment)
  - Applied consistent design template with same colors, borders, and spacing across all three pages
  - Added unified progress indicators showing current step (1: Choose Plan, 2: Personal Info, 3: Payment)
  - Removed country field from checkout form per user request, simplified billing address collection
  - Updated all pages to use same background gradient, card styling, and button designs
  - Enhanced backend API to handle personal information and create proper Stripe subscriptions with US default country
  - Built CheckoutStep1 with Google autofill option and CheckoutStep2 with enhanced Stripe Elements integration
  - Integrated sessionStorage to persist user data between checkout steps with comprehensive form validation
- July 16, 2025. Redesigned checkout page with modern, spacious design matching subscription page style:
  - Enhanced header with large gradient title and prominent trust indicators in rounded containers
  - Redesigned form sections with larger cards, backdrop blur effects, and enhanced shadows
  - Improved input field styling with larger padding, rounded corners, and focus ring effects
  - Enhanced button with gradient background, hover animations, and scale transform effects
  - Upgraded order summary with gradient plan header, larger text, and improved visual hierarchy
  - Added consistent spacing, modern borders, and professional color scheme throughout
  - Complete visual redesign transforms checkout into premium, professional experience
- July 16, 2025. Enhanced Stripe webhook handling and completed minimalistic checkout design:
  - Added comprehensive webhook handlers for payment_intent.created and payment_intent.succeeded events
  - Removed neon gradient backgrounds in favor of clean, professional gray and white containers
  - Expanded order summary with larger fonts and spacing for better visual hierarchy
  - Streamlined card input styling with subtle blue focus states instead of bright colors
  - Maintained friendly user experience with icons while achieving elegant minimalistic design
  - All Stripe events now properly tracked and handled for both embedded and hosted checkout flows
- July 15, 2025. Enhanced embedded Stripe checkout with professional design and proper dark theme integration:
  - Updated color scheme to match website's design system using CSS custom properties
  - Applied dark theme to Stripe Elements with proper night theme configuration
  - Fixed white border issues and expanded checkout to full width
  - Added comprehensive Stripe appearance customization with dark backgrounds
  - Enhanced trust indicators with SSL encryption and PCI compliance badges
  - Integrated "Powered by stripe" branding for credibility
  - Professional gradient headers and consistent styling throughout form
  - Seamless payment experience that maintains website's visual identity
- July 15, 2025. Restored embedded Stripe checkout within the app:
  - Recreated EmbeddedCheckoutForm component with comprehensive payment collection
  - Added EmbeddedCheckout page for in-app payment processing
  - Implemented full billing address collection, age verification, and terms agreement
  - Added /embedded-checkout route with Stripe Elements integration
  - Updated subscription page to use embedded checkout by default
  - Removed secondary "Continue with Stripe Checkout" button for cleaner interface
  - Users can now complete payments without leaving the website
  - Enhanced payment security with Stripe's embedded Elements system
- July 15, 2025. Simplified payment flow to use only Stripe hosted checkout:
  - Removed embedded checkout forms and components completely
  - Updated subscription page to use only Stripe's hosted checkout for all plans
  - Deleted EmbeddedCheckout, TestEmbedded pages and EmbeddedCheckoutForm component
  - Removed /api/create-subscription endpoint since only hosted checkout is used
  - Simplified user experience with direct redirect to professional Stripe checkout pages
  - All payment processing now handled securely through Stripe's PCI-compliant hosted forms
- July 15, 2025. Fixed critical Stripe API errors and enhanced embedded checkout styling:
  - Resolved "unknown parameter" error by using proper Stripe API structure (product → price → subscription)
  - Fixed null client_secret error during trial periods by handling trial vs immediate payment scenarios
  - Updated payment field styling with black text color for consistency with form design
  - Enhanced payment section with proper form integration and professional appearance
  - Added trial period handling that doesn't require payment during the 7-day free trial
  - Subscription creation now properly supports both trial activation and immediate billing
- July 15, 2025. Successfully completed embedded Stripe checkout form implementation:
  - Built comprehensive EmbeddedCheckoutForm component using Stripe Elements
  - Added full data collection: personal info, billing address, date of birth validation (13+ requirement)
  - Implemented mandatory Terms and Conditions agreement checkbox with legal page links
  - Added optional newsletter subscription checkbox for marketing preferences
  - Created /embedded-checkout route with complete Stripe Elements integration
  - Updated subscription page with dual payment options: embedded (default) and hosted checkout
  - Users can now complete payments without leaving website for improved user experience
  - Added error handling for URL parameter parsing and form validation
  - Integrated with existing user authentication and subscription management system
- July 15, 2025. Created embedded Stripe checkout form within the website:
  - Built EmbeddedCheckoutForm component using Stripe Elements for professional payment processing
  - Added comprehensive data collection: personal info, billing address, date of birth validation
  - Included mandatory Terms and Conditions agreement and optional newsletter subscription
  - Created /embedded-checkout route with full Stripe Elements integration
  - Updated subscription page to offer both embedded checkout (default) and hosted Stripe options
  - Users can now complete payments without leaving the website for better user experience
- July 15, 2025. Integrated Stripe free trial within the app interface:
  - Added database fields to track Stripe trial information (stripeTrialEnd, isOnStripeTrial)
  - Enhanced subscription status endpoint to fetch real-time trial data from Stripe API
  - Created TrialStatusBanner component showing trial countdown and upgrade options
  - Webhook handling now updates local trial information when subscriptions are created
  - Users can see exact trial expiration dates and remaining days within the app
- July 15, 2025. Simplified subscription flow with direct Stripe redirect:
  - Replaced embedded checkout form with simple fetch() API call and direct redirect
  - Users now go directly to Stripe's hosted checkout page for better UX
  - Removed complex embedded Stripe Elements form in favor of simpler implementation
  - Payment flow: subscription page → API call → direct redirect to Stripe checkout
- July 15, 2025. Added 7-day free trial to all subscription plans:
  - Implemented trial_period_days: 3 in Stripe checkout sessions
  - Updated domain references to use actual Replit development URL
  - All new subscriptions now include automatic 3-day free trial period
  - Users can experience full features before first payment is charged
- July 15, 2025. Enhanced payment form with professional design and improved data collection:
  - Replaced age field with date of birth for more accurate age verification
  - Added required Terms and Conditions agreement checkbox with links to legal pages
  - Added optional newsletter subscription checkbox for marketing preferences
  - Improved form validation with date-based age calculation (13+ requirement)
  - Enhanced professional design while maintaining user-friendly functionality
  - Button remains disabled until Terms agreement is checked
  - Newsletter preference is passed to backend for future marketing campaigns
- July 15, 2025. Fixed subscription payment flow to create proper recurring billing:
  - Switched embedded checkout from Payment Intents to Stripe Checkout Sessions
  - Fixed subscription creation issue causing payments to appear as one-time instead of recurring
  - Enhanced webhook handling for automatic subscription status updates
  - Added comprehensive database methods for subscription management
  - Subscription status now properly updates from "trial" to "pro"/"unlimited" after payment
  - Payments now appear correctly in Stripe dashboard as recurring subscriptions
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