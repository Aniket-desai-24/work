# AI Stock Analyzer

## Overview

AI Stock Analyzer is a comprehensive trading analysis application that provides real-time stock information, AI-powered buy/sell recommendations, and detailed financial analysis. The application features a modern dark-themed interface optimized for financial data visualization, combining real-time market data with artificial intelligence to deliver intelligent trading insights.

The system is designed as a full-stack web application serving professional traders and investors who need sophisticated analysis tools with an intuitive user experience. It integrates multiple data sources to provide comprehensive stock analysis including technical indicators, fundamental metrics, news sentiment analysis, and AI-driven recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built using React 18 with TypeScript, implementing a component-based architecture for modularity and reusability. The application uses Wouter for lightweight client-side routing and TanStack Query for sophisticated data fetching, caching, and synchronization with automatic background updates.

The UI system is built on Tailwind CSS with a comprehensive design system inspired by financial platforms like Robinhood and TradingView. It features a dark-mode-first approach with carefully crafted color schemes for financial data (green for gains, red for losses, blue for AI features). The component library uses Radix UI primitives wrapped in shadcn/ui components, ensuring accessibility and consistent behavior across the application.

State management follows a server-state pattern where TanStack Query manages server state while local component state handles UI interactions. This approach minimizes complexity while providing robust data synchronization and caching capabilities.

### Backend Architecture
The server is built using Express.js with TypeScript, following a service-oriented architecture. The main services include:

- **StockService**: Handles external API integration for real-time and historical stock data
- **AIService**: Manages AI-powered analysis using Groq's LLaMA model for generating trading recommendations
- **Storage**: Provides data persistence with in-memory caching for performance optimization

The API follows RESTful conventions with endpoints for stock data, technical analysis, news feeds, and AI recommendations. Each service is designed with error handling, rate limiting considerations, and fallback mechanisms for external API failures.

### Data Management
The application uses Drizzle ORM for database operations with PostgreSQL as the primary database. The schema defines user management and will be extended for storing historical analysis data and user preferences.

A hybrid caching strategy is implemented where frequently accessed data (current stock prices, technical indicators) is cached in memory with configurable TTL values, while less frequent data is fetched on-demand. This approach balances performance with data freshness requirements.

### Component Organization
The frontend follows a hierarchical component structure:
- **TradingDashboard**: Main orchestration component managing application state
- **Specialized Components**: StockPrice, AIRecommendation, TechnicalIndicators, PriceChart, NewsFeed, FundamentalMetrics
- **Shared UI Components**: Reusable shadcn/ui components for consistent design language
- **Layout Components**: Header, navigation, and responsive grid systems

Each component is designed with single responsibility principles, accepting props for configuration while maintaining internal state only for UI-specific concerns.

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, TypeScript, Vite for development tooling
- **Routing & State**: Wouter for routing, TanStack Query for server state management
- **UI Framework**: Tailwind CSS, Radix UI primitives, shadcn/ui component system

### Backend Services
- **AI Integration**: Groq SDK with LLaMA 3.3-70B model for generating trading recommendations and market analysis
- **Database**: PostgreSQL with Neon serverless hosting, Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL session store for user authentication

### Stock Market Data APIs
The application is architected to integrate with financial data providers (currently using mock data with planned integration for production APIs):
- Alpha Vantage, IEX Cloud, or Polygon.io for real-time stock prices and historical data
- Financial news APIs for sentiment analysis and market news aggregation
- Technical indicator calculations for RSI, MACD, Bollinger Bands, and moving averages

### Development & Deployment Tools
- **Build System**: ESBuild for production builds, Vite for development server
- **Code Quality**: TypeScript for type safety, PostCSS for CSS processing
- **Database Migration**: Drizzle Kit for schema migrations and database management
- **Font Loading**: Google Fonts (Inter for UI, JetBrains Mono for financial data)

### Production Considerations
The application is designed for deployment on platforms supporting Node.js with environment variable configuration for API keys, database connections, and service endpoints. The modular architecture allows for easy scaling of individual services and integration with additional data providers or AI models as needed.