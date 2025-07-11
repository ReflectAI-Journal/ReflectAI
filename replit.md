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