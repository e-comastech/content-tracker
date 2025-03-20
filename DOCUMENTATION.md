# e-Comas Content Management Platform Documentation

## Overview
The e-Comas Content Management Platform is a suite of tools designed to help manage and optimize e-commerce content across various marketplaces. The platform's flagship tool is the Content Comparison Tool (CCT), which helps ensure content consistency between source files and Amazon listings.

## Content Comparison Tool (CCT)

### Purpose
The CCT helps e-commerce managers compare content between a source of truth (client's desired content) and current Amazon listings. It identifies discrepancies and facilitates content updates through a user-friendly interface.

### Core Features

#### 1. Authentication
- Google OAuth integration
- Secure user sessions
- User context management with email and profile information

#### 2. Content Comparison
- CSV file upload support for both Amazon and source content
- Field-by-field comparison using Levenshtein distance algorithm
- Configurable field selection (Product Title, Description, Bullet Points, etc.)
- Marketplace-specific filtering
- Accuracy calculations and statistics

#### 3. Data Visualization
- Overall accuracy metrics
- Field-specific match rates
- Perfect matches tracking
- Marketplace-specific statistics
- Export capabilities for visualizations

#### 4. Open Cases Assistant
- Batch processing for content updates
- Excel file generation for bulk updates
- Marketplace-specific batching
- Configurable batch sizes

### Technical Stack

#### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Lucide React for icons
- File parsing: PapaParse for CSV
- Excel generation: ExcelJS
- JWT handling for authentication

#### Backend Services
- Supabase for data storage
- Google Sheets API integration
- Google OAuth for authentication

#### Infrastructure
- Netlify for hosting and deployment
- Environment-based configuration
- Automated builds and deployments

### Data Structure

#### Product Data Interface
```typescript
interface ProductData {
  ASIN: string;
  Marketplace: string;
  ProductTitle?: string;
  Description?: string;
  BulletPoint1?: string;
  BulletPoint2?: string;
  BulletPoint3?: string;
  BulletPoint4?: string;
  BulletPoint5?: string;
  Variations?: string;
  Link?: string;
}
```

#### Comparison Results
```typescript
interface ComparisonResult {
  ASIN: string;
  Marketplace: string;
  overallMatch: number;
  fields: {
    [key: string]: {
      source1: string;
      source2: string;
      similarity: number;
    };
  };
  Link?: string;
}
```

### Database Schema (Supabase)

#### Comparisons Table
- id: uuid (primary key)
- client_name: string
- user_email: string
- marketplace: string
- total_products: number
- perfect_matches: number
- overall_accuracy: number
- created_at: timestamp

#### Field Metrics Table
- id: uuid (primary key)
- comparison_id: uuid (foreign key)
- field_name: string
- accuracy: number
- products_above_90: number
- created_at: timestamp

### Current Development Status

#### Completed Features
1. Basic comparison functionality
2. File upload and parsing
3. Google authentication
4. Results visualization
5. Open Cases Assistant
6. Dark/light theme support
7. Responsive design
8. Basic metrics storage

#### In Progress
1. Automated content fetching system
2. Historical data tracking
3. Enhanced analytics dashboard
4. Client-specific views

### Upcoming Features

#### Automated Content Management
- Weekly Amazon content scraping
- Automated comparisons
- Historical data tracking
- Trend analysis
- Alert system for accuracy drops

#### Data Requirements
1. Separate Google Sheets for:
   - Client source content
   - Amazon scraped content (per client)
2. Historical data storage in Supabase
3. Weekly comparison results
4. Trend analysis data

#### Alert System Requirements
- Accuracy drop thresholds
- Field-specific monitoring
- Week-over-week change tracking
- Notification system

### Environment Setup

#### Required Environment Variables
```
VITE_GOOGLE_CLIENT_ID=<oauth-client-id>
VITE_SUPABASE_URL=<supabase-project-url>
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
```

#### Development Setup
```bash
npm install
npm run dev
```

#### Build and Deployment
```bash
npm run build
# Automated deployment through Netlify
```

### File Structure
```
content-tracker/
├── src/
│   ├── components/
│   │   ├── ComparisonTable.tsx
│   │   ├── Dashboard.tsx
│   │   ├── FileUpload.tsx
│   │   ├── LoginPage.tsx
│   │   └── OpenCasesAssistant.tsx
│   ├── contexts/
│   │   └── UserContext.tsx
│   ├── hooks/
│   │   └── useMetricsStorage.ts
│   ├── lib/
│   │   └── supabase.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── comparison.ts
│   └── App.tsx
├── public/
├── index.html
└── package.json
```

### Best Practices

#### Code Style
- TypeScript for type safety
- React functional components with hooks
- Error boundaries for error handling
- Proper component composition
- Performance optimization with useMemo and useCallback

#### Security
- OAuth for authentication
- Environment variable protection
- XSS prevention
- CORS configuration
- Content Security Policy

#### Performance
- Code splitting
- Lazy loading
- Optimized builds
- Caching strategies
- Asset optimization

### Troubleshooting

Common Issues:
1. Authentication failures
   - Check Google OAuth configuration
   - Verify environment variables
2. File upload issues
   - Verify CSV format
   - Check file size limits
3. Comparison discrepancies
   - Verify field mapping
   - Check character encoding

### Contact
For technical issues or contributions, contact:
- Developer: Claudiu Clement
- LinkedIn: https://www.linkedin.com/in/claudiu-clement/

### Version History
Current Version: 2.4
Last Updated: 12/02/2025

### License
Copyright e-Comas SARL. All rights reserved. 