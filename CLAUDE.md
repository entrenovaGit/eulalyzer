# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Primary Commands
```bash
# Development server with Turbopack (faster builds)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Convex development server (for real-time database)
npm run convex:dev

# Deploy Convex functions
npm run convex:deploy
```

### Database Operations
```bash
# Generate database migrations
npx drizzle-kit generate

# Push schema changes to database
npx drizzle-kit push

# View database in Drizzle Studio
npx drizzle-kit studio
```

## Project Architecture

This is an **EULAlyzer** application - a SaaS platform for analyzing End User License Agreements using AI. The project follows a modern full-stack Next.js architecture with comprehensive authentication, subscription management, and AI integration.

### Core Tech Stack
- **Frontend**: Next.js 15.3.1 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components with Radix UI primitives
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth v1.2.8 with Google OAuth
- **Subscriptions**: Polar.sh for billing and subscription management
- **AI Integration**: OpenAI SDK with streaming responses
- **Real-time Features**: Convex for real-time database operations
- **File Storage**: Cloudflare R2 (S3-compatible)
- **Analytics**: PostHog for product analytics

### Key Application Features

#### EULA Analysis System
- **Core Function**: AI-powered analysis of software license agreements
- **Risk Assessment**: Generates risk scores (1-100) and detailed explanations
- **Analysis Storage**: Saves analysis results linked to user accounts
- **Mock Implementation**: Currently uses mock responses (real OpenAI integration ready)

#### Authentication & User Management
- Better Auth with session-based authentication
- Google OAuth integration
- User profile management with image uploads
- Session persistence with database storage

#### Subscription System
- Two-tier pricing via Polar.sh (Starter/Professional)
- Real-time webhook processing for subscription events
- Payment gating for premium features
- Customer portal integration for self-service billing

### Database Schema Architecture

The application uses a dual-database approach:

#### PostgreSQL (Primary Database via Drizzle)
- **Users & Auth**: Better Auth tables (user, session, account, verification)
- **Subscriptions**: Polar.sh webhook data storage
- **Core Analysis**: EULA analysis results and metadata

#### Convex (Real-time Database)
- **Analysis Operations**: Real-time EULA analysis functions
- **History Tracking**: User analysis history with real-time updates
- **Mock AI Integration**: Placeholder for OpenAI API calls

### Directory Structure

```
app/
├── api/                     # API routes
│   ├── analyze-eula/        # EULA analysis endpoint (REST)
│   ├── auth/                # Better Auth API routes
│   ├── chat/                # AI chat integration
│   └── subscription/        # Polar.sh webhook handling
├── dashboard/               # Protected user dashboard
│   ├── _components/         # Dashboard-specific components
│   ├── chat/               # AI chat interface
│   ├── upload/             # File upload with R2 storage
│   ├── payment/            # Subscription management
│   └── settings/           # User settings & billing
├── pricing/                # Public pricing page
└── (auth)/                 # Authentication pages

convex/                     # Convex real-time functions
├── analyzeEula.ts          # EULA analysis mutations/queries
└── schema.ts              # Convex database schema

components/
├── ui/                     # shadcn/ui component library
├── homepage/               # Landing page components
└── eula-analyzer.tsx       # Main EULA analysis component

lib/
├── auth.ts                 # Better Auth configuration
├── subscription.ts         # Polar.sh utilities
└── upload-image.ts         # R2 file upload utilities

db/
├── schema.ts              # PostgreSQL schema (Drizzle)
├── drizzle.ts             # Database connection
└── migrations/            # Database migrations
```

### Environment Configuration

#### Required Environment Variables
```env
# Database
DATABASE_URL="neon-postgresql-url"

# Authentication  
BETTER_AUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="google-oauth-client-id"
GOOGLE_CLIENT_SECRET="google-oauth-client-secret"

# Polar.sh Subscriptions
POLAR_ACCESS_TOKEN="polar-access-token"
POLAR_WEBHOOK_SECRET="webhook-secret"
NEXT_PUBLIC_STARTER_TIER="starter-product-id"
NEXT_PUBLIC_STARTER_SLUG="starter-slug"

# OpenAI (for production AI features)
OPENAI_API_KEY="openai-api-key"

# Convex (for real-time features)
CONVEX_DEPLOYMENT="convex-deployment-url"
NEXT_PUBLIC_CONVEX_URL="convex-public-url"

# Cloudflare R2 Storage
CLOUDFLARE_ACCOUNT_ID="cloudflare-account-id"
R2_UPLOAD_IMAGE_ACCESS_KEY_ID="r2-access-key"
R2_UPLOAD_IMAGE_SECRET_ACCESS_KEY="r2-secret-key"
R2_UPLOAD_IMAGE_BUCKET_NAME="r2-bucket-name"
```

### Development Notes

#### AI Integration Status
- **Current**: Mock responses for EULA analysis
- **Production Ready**: OpenAI integration prepared in convex/analyzeEula.ts
- **Switch Method**: Update Convex function to use real OpenAI API calls

#### Authentication Flow
- Better Auth handles all authentication logic
- Graceful fallbacks for missing environment variables
- Production/development environment detection

#### Subscription Integration
- Polar.sh webhooks update subscription status in real-time
- Payment gating implemented via subscription status checks
- Customer portal integration for billing management

#### Database Operations
- Use Drizzle for schema management and migrations
- Convex handles real-time features and AI operations
- Database adapters configured for both systems

### Key Integration Patterns

#### EULA Analysis Workflow
1. User submits EULA text via API endpoint
2. Text validation and length checks (max 50,000 chars)
3. Analysis processed via Convex (currently mocked)
4. Results stored in PostgreSQL with user association
5. Real-time updates via Convex queries

#### Subscription Gating
1. Check user subscription status via Polar.sh
2. Enforce feature limits based on subscription tier
3. Redirect to billing portal for upgrades
4. Handle webhook events for status updates

### Testing and Quality Assurance
- Run `npm run lint` before commits
- Test authentication flows in development
- Verify subscription webhook handling
- Test EULA analysis with various input sizes
- Validate file upload functionality with R2