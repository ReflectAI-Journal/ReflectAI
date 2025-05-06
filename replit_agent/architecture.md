# Architecture Documentation

## Overview

This application is a full-stack web application called "ReflectAI" - a journaling application with AI features for personal reflection. It uses a modern JavaScript/TypeScript stack with a clear separation between client and server components. The application combines a React frontend with an Express backend, PostgreSQL database, and OpenAI integration to provide AI-powered journaling features.

## System Architecture

The system follows a client-server architecture with the following core components:

### Client (Frontend)
- Built with React and TypeScript
- Uses Vite as the build tool and development server
- Incorporates TailwindCSS for styling with a design system based on shadcn/ui components
- Utilizes React Query for data fetching and state management
- Employs a routing system with wouter for navigation
- Includes Framer Motion for animations and enhanced UI experiences

### Server (Backend)
- Node.js/Express server written in TypeScript
- Serves both the API and the static frontend assets in production
- Uses Drizzle ORM for database operations
- Implements authentication with Passport.js
- Integrates with OpenAI's API for AI-powered features
- Supports session management for user authentication

### Database
- PostgreSQL database hosted on Neon Database (serverless)
- Schema managed through Drizzle ORM with migrations
- Database schema includes users, journal entries, goals, and associated metadata

### External Services
- OpenAI API for generating AI responses to journal entries
- Stripe for payment processing and subscription management
- SendGrid for email notifications

## Key Components

### Frontend Components

1. **Pages and Routing**: 
   - Multiple page components in `client/src/pages/` directory
   - Main routes include Home, Archives, Stats, Goals, Chat, and more
   - Protected routes ensure authenticated access to sensitive content

2. **UI Components**: 
   - Design system built on shadcn/ui (Radix UI primitives with TailwindCSS)
   - Custom components for specific application features
   - Responsive layout with mobile support

3. **State Management**:
   - React Query for server state
   - React Context for global state (e.g., authentication, chat)
   - Custom hooks for encapsulating business logic

4. **Third-party UI Integration**:
   - Recharts for data visualization
   - Stripe Elements for payment UI

### Backend Components

1. **API Routes**:
   - RESTful API endpoints organized in `server/routes.ts`
   - JWT-based authentication
   - Route protection based on authentication and subscription status

2. **Database Access Layer**:
   - Drizzle ORM for type-safe database operations
   - Storage service (`server/storage.ts`) abstracts database interactions

3. **Authentication System**:
   - Passport.js for authentication strategies
   - Session-based auth with secure password hashing
   - Support for trial accounts and subscription-based access

4. **AI Integration**:
   - OpenAI client for generating responses
   - GPT-4o for AI analysis of journal entries and chat features

5. **Payment Integration**:
   - Stripe API for payment processing
   - Subscription management system

### Database Schema

The database schema includes several key tables:

1. **users**: 
   - User authentication and profile data
   - Subscription and payment information

2. **journal_entries**: 
   - User's journal entries with content, date, and mood
   - AI-generated responses to entries

3. **journal_stats**: 
   - Aggregated statistics on journaling habits
   - Streak tracking and analytics

4. **goals**: 
   - Goal tracking functionality
   - Parent-child relationships for nested goals

5. **goal_activities**: 
   - Activities related to specific goals
   - Progress tracking

## Data Flow

1. **Journal Entry Creation**:
   - User writes entry in the frontend editor
   - Entry is sent to the server via API
   - Server saves entry to database
   - Server sends content to OpenAI API
   - AI-generated response is saved and returned to client
   - Client displays the AI analysis to the user

2. **Authentication Flow**:
   - User registers or logs in via the Auth page
   - Credentials are validated on the server
   - JWT token is generated and stored for the session
   - Protected routes check for valid authentication

3. **Subscription and Payment**:
   - User selects a subscription plan
   - Stripe payment flow is initiated
   - On successful payment, subscription status is updated
   - User gains access to premium features

4. **AI Chat**:
   - User selects chat type (general support or philosophical)
   - Messages are sent to OpenAI API via the server
   - AI responses are displayed in the chat interface
   - Chat history is maintained during the session

## External Dependencies

### Frontend Dependencies
- **React**: Core UI library
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: Component library built on Radix UI
- **React Query**: Data fetching and caching
- **wouter**: Routing library
- **Framer Motion**: Animation library
- **Stripe.js**: Payment integration
- **Recharts**: Charting library

### Backend Dependencies
- **Express**: Web framework
- **Drizzle ORM**: Database ORM
- **OpenAI SDK**: AI integration
- **Passport.js**: Authentication library
- **Stripe Node SDK**: Payment processing
- **SendGrid**: Email service
- **Zod**: Schema validation

## Deployment Strategy

The application is configured for deployment in multiple environments:

### Development
- Vite development server for the frontend
- Express server in development mode
- Support for hot reloading and live development

### Production
- Vite builds the frontend as static assets
- Express serves both the API and static assets
- Environment variables control configuration
- Potential for containerization with Docker

### Replit Deployment
- Configuration for hosting on Replit
- Automated deployment through Replit workflows
- Port configuration for Replit hosting

### Mobile Support
- Mobile-responsive web design
- iOS support through Capacitor for potential native iOS app
- Configuration for native iOS builds

## Security Considerations

- Secure password hashing with scrypt
- HTTPS enforcement in production
- JWT-based authentication
- Input validation with Zod schemas
- Environment variable protection for API keys
- Sanitized logging to prevent sensitive data exposure

## Future Extension Points

1. **Additional AI Features**: 
   - The modular AI integration allows for extending AI capabilities
   - Potential for different AI models or providers

2. **Mobile Native Apps**:
   - iOS configuration already present
   - Potential for Android app development

3. **Enhanced Analytics**:
   - Current stats framework can be extended
   - Possibility for more advanced insights

4. **Social Features**:
   - Database schema could be extended for social interactions
   - Sharing capabilities could be added

5. **Integration with Other Services**:
   - Current architecture allows for additional third-party integrations