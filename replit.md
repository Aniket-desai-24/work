# QuantumTradePro - AI Stock Analyzer

## Overview

QuantumTradePro is a comprehensive AI-powered stock trading analysis application that provides real-time stock information, intelligent buy/sell recommendations, and detailed financial analysis. The platform serves professional traders and investors with sophisticated analysis tools wrapped in an intuitive, dark-mode user interface inspired by leading financial platforms like Robinhood and TradingView.

The application integrates multiple data sources to deliver real-time stock prices, technical indicators, market news, and AI-generated trading recommendations. It features advanced portfolio simulation, backtesting capabilities, price alerts, and stock comparison tools, making it a complete solution for informed trading decisions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built using React 18 with TypeScript, implementing a component-based architecture for modularity and reusability. The application uses Wouter for lightweight client-side routing and TanStack Query for robust server state management with automatic caching and refetching.

The UI system is built on Tailwind CSS with a comprehensive design system featuring a dark-mode-first approach. The component library leverages shadcn/ui components built on Radix UI primitives, providing accessible and customizable interface elements. The styling follows a carefully crafted color palette optimized for financial data visualization with distinct colors for bullish/bearish indicators and AI-powered features.

State management follows a server-state pattern where TanStack Query manages server state while local component state handles UI interactions. This approach minimizes complexity while providing robust caching, optimistic updates, and error handling.

### Backend Architecture
The server is built using Express.js with TypeScript, following a service-oriented architecture with clear separation of concerns:

- **StockService**: Handles external API integration for real-time and historical stock data, with fallback mechanisms for realistic mock data when external APIs are unavailable
- **AIService**: Manages AI-powered analysis using Groq's LLaMA model for generating intelligent trading recommendations based on technical indicators, stock prices, and news sentiment
- **Storage**: Provides data persistence with in-memory caching for performance optimization, designed to be easily replaceable with database storage

The API follows RESTful conventions with endpoints for stock data, technical analysis, news feeds, and AI recommendations. Each service includes comprehensive error handling, rate limiting considerations, and graceful degradation.

### Data Management
The application uses Drizzle ORM for database operations with PostgreSQL as the primary database. The current schema defines user management and is designed to be extended for storing historical analysis data, user portfolios, and trading preferences.

A hybrid caching strategy is implemented where frequently accessed data (current stock prices, technical indicators) is cached in memory with configurable TTL values, while less frequent data is fetched on-demand. This approach balances performance with data freshness requirements.

### Component Organization
The frontend follows a hierarchical component structure:
- **TradingDashboard**: Main orchestration component managing application state and layout
- **Specialized Components**: StockPrice, AIRecommendation, TechnicalIndicators, PriceChart, NewsFeed, FundamentalMetrics for focused functionality
- **Advanced Features**: PortfolioSimulator, BacktestingEngine, AccuracyTracker, PriceAlerts, StockComparison for professional trading tools
- **Shared UI Components**: Reusable shadcn/ui components ensuring consistent design language across the application

Each component is designed with single responsibility principles, accepting props for configuration while maintaining internal state only for UI-specific concerns.

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, TypeScript, Vite for development tooling and fast builds
- **Routing & State**: Wouter for lightweight routing, TanStack Query for server state management with caching
- **UI Framework**: Tailwind CSS for styling, Radix UI primitives for accessible components, shadcn/ui component system

### Database and ORM
- **Database**: PostgreSQL with Neon serverless hosting for scalable data storage
- **ORM**: Drizzle ORM with Drizzle Kit for type-safe database operations and migrations
- **Session Management**: connect-pg-simple for PostgreSQL-backed session storage

### AI and External APIs
- **AI Integration**: Groq SDK for LLaMA-based trading analysis and recommendations
- **Stock Data**: Multiple API integrations with fallback mechanisms for reliable data access
- **Chart Visualization**: Recharts for financial data visualization and technical analysis charts

### Development and Build Tools
- **Build System**: Vite for fast development and optimized production builds
- **Runtime**: tsx for TypeScript execution, esbuild for server bundling
- **Quality Tools**: TypeScript for type safety, ESLint configurations for code quality

### UI and Interaction Libraries
- **Form Handling**: React Hook Form with Hookform Resolvers for robust form management
- **Date Handling**: date-fns for financial date calculations and formatting
- **Utility Libraries**: clsx and class-variance-authority for dynamic styling, cmdk for command palette functionality