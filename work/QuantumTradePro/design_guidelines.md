# AI-Powered Trading App Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from leading financial platforms like Robinhood, TradingView, and Bloomberg Terminal, combined with modern dark-mode applications for professional trading environments.

## Core Design Elements

### A. Color Palette
**Dark Mode Primary** (Main theme):
- Background: 210 25% 8% (Deep navy-blue dark)
- Card backgrounds: 210 20% 12% 
- Border/dividers: 210 15% 20%
- Text primary: 0 0% 95%
- Text secondary: 0 0% 70%

**Financial Colors**:
- Bullish/Gains: 142 76% 36% (Professional green)
- Bearish/Losses: 0 84% 60% (Financial red)
- Neutral/Warning: 45 93% 58% (Amber)
- AI Accent: 217 91% 60% (Blue for AI features)

**Status Indicators**:
- Market Open: 142 76% 36%
- Market Closed: 0 0% 50%
- High confidence: 142 76% 36%
- Low confidence: 0 84% 60%

### B. Typography
- **Primary Font**: Inter (Google Fonts) - excellent for financial data readability
- **Monospace Font**: JetBrains Mono - for stock prices, percentages, and technical data
- **Hierarchy**: 
  - Headers: 24px-32px, font-weight 600
  - Stock prices: 20px-24px, monospace, font-weight 700
  - Body text: 14px-16px, font-weight 400
  - Financial metrics: 12px-14px, monospace

### C. Layout System
**Tailwind spacing primitives**: Primary units of 2, 4, 6, and 8
- Card padding: p-6
- Section margins: mb-8
- Grid gaps: gap-4
- Component spacing: space-y-4
- Button padding: px-6 py-3

### D. Component Library

**Navigation**:
- Dark header with subtle border-bottom
- Logo with AI accent color
- Search bar with autocomplete dropdown
- Market status indicator with real-time updates

**Data Cards**:
- Dark background with subtle borders
- Rounded corners (rounded-lg)
- Hover states with slight brightness increase
- Financial metrics in monospace font
- Color-coded indicators for gains/losses

**Charts & Visualizations**:
- Dark theme with minimal grid lines
- Green/red color coding for price movements
- Clean axis labels in secondary text color
- Interactive tooltips with dark backgrounds

**Forms & Inputs**:
- Dark input backgrounds with blue focus rings
- Autocomplete dropdowns with dark styling
- Search bars with subtle placeholder text

**Buttons**:
- Primary: Blue AI accent color with white text
- Buy action: Green with white text  
- Sell action: Red with white text
- Secondary: Outline style with transparent background

**AI Recommendation Panel**:
- Prominent card with AI accent border
- Large confidence score display
- Clear BUY/SELL/HOLD indicators
- Reasoning section with bullet points

**Technical Indicators**:
- Compact metric cards in grid layout
- Progress bars for relative values
- Trend arrows for directional changes
- Tooltips explaining each metric

## Visual Hierarchy
1. **Primary Focus**: Stock price and AI recommendation (largest elements)
2. **Secondary**: Charts and key metrics
3. **Tertiary**: News feed and detailed analytics
4. **Supporting**: Navigation and status indicators

## Responsive Design
- **Desktop**: Full dashboard with side-by-side charts and metrics
- **Tablet**: Stacked cards with collapsible sections
- **Mobile**: Single-column layout with priority on price and recommendation

## Interaction Patterns
- **Smooth transitions** for data updates (opacity changes)
- **Loading states** with skeleton screens matching dark theme
- **Real-time updates** with subtle animations for price changes
- **Hover states** for interactive elements with brightness adjustments

## Professional Financial App Aesthetic
- **Minimal animations** - only for data updates and loading
- **High contrast** for important financial data
- **Consistent spacing** using the defined Tailwind units
- **Clean typography** prioritizing readability of numbers
- **Information density** balanced with white space
- **Professional color scheme** avoiding overly bright or playful colors

This design creates a sophisticated, professional trading interface that prioritizes data clarity while maintaining modern aesthetics suitable for serious financial analysis.