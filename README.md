# Google Keyword Rank Checker

A full-stack Next.js application for checking Google keyword rankings, built for Webflow Cloud deployment.

## Features

- Check keyword rankings in Google's top 100 results
- Support for 13 countries
- Display top 10 competitors
- Clean, responsive UI with Tailwind CSS
- CORS-enabled API for Webflow integration

## Project Structure

```
keyword-rank-checker/
├── components/
│   ├── KeywordRankChecker.jsx  # Main React component
│   └── index.js                # Component exports for DevLink
├── pages/
│   ├── api/
│   │   └── check-rank.js       # API route for Bright Data
│   ├── _app.js                 # Next.js app wrapper
│   └── index.js                # Home page
├── styles/
│   └── globals.css             # Tailwind CSS imports
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
└── .env.example
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd keyword-rank-checker
npm install
```

### 2. Configure Environment Variables

#### Local Development

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Bright Data API key:

```
BRIGHTDATA_API_KEY=your_api_key_here
```

#### Webflow Cloud (Production)

Environment variables in Webflow Cloud are only available at **runtime**, not build time.

1. Connect your GitHub repository to Webflow Cloud
2. Open the **Deployments Dashboard** for your environment
3. Select **Environment Variables** from the sidebar
4. Click **Add Variable**
5. Enter the following:
   - **Key:** `BRIGHTDATA_API_KEY`
   - **Value:** Your Bright Data API key
6. **Important:** Check the **Secret** checkbox to encrypt sensitive data
7. Push a new commit to trigger deployment with the updated variables

> **Note:** Anyone with access to your Webflow Cloud project can view environment variables. Always mark API keys as Secrets to encrypt and mask their values.

For more details, see the [Webflow Cloud Environments documentation](https://developers.webflow.com/webflow-cloud/environments).

### 3. Get Your Bright Data API Key

1. Sign up at [brightdata.com](https://brightdata.com)
2. Navigate to your dashboard
3. Go to **API Tokens** or **Account Settings**
4. Create a new API token with SERP API access
5. Copy the token and add it to your environment variables

### 4. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to test the application.

### 5. Deploy to Webflow Cloud

```bash
npm run build
```

Push to your connected Git repository - Webflow Cloud will auto-deploy.

## Webflow Integration Options

### Option A: DevLink Integration (Recommended)

1. Connect your Webflow site to this repository via DevLink
2. Import the `KeywordRankChecker` component:

```jsx
import { KeywordRankChecker } from './components';

// Use in your Webflow page
<KeywordRankChecker apiEndpoint="/api/check-rank" />
```

### Option B: Embed Code Integration

Add this to a Webflow page's custom code section:

```html
<div id="keyword-rank-checker-root"></div>
<script src="https://your-deployed-app.webflow.io/_next/static/chunks/pages/index.js"></script>
```

### Option C: iFrame Integration

Embed the tool on any page:

```html
<iframe
  src="https://your-deployed-app.webflow.io"
  width="100%"
  height="800"
  frameborder="0">
</iframe>
```

## CORS Configuration

The API route is configured to accept requests from:
- Your Webflow domain (`your-site.webflow.io`)
- Your custom domain
- localhost (for development)

Update the `ALLOWED_ORIGINS` array in `pages/api/check-rank.js`:

```javascript
const ALLOWED_ORIGINS = [
  'https://your-actual-site.webflow.io',
  'https://your-custom-domain.com',
  'http://localhost:3000',
];
```

## API Reference

### POST /api/check-rank

Check keyword ranking for a domain.

**Request Body:**

```json
{
  "keyword": "best coffee maker",
  "targetDomain": "example.com",
  "country": "us"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "keyword": "best coffee maker",
    "targetDomain": "example.com",
    "country": "US",
    "rank": 15,
    "found": true,
    "targetUrl": "https://example.com/coffee-makers",
    "topCompetitors": [
      {
        "position": 1,
        "title": "10 Best Coffee Makers...",
        "url": "https://competitor.com/...",
        "domain": "competitor.com",
        "description": "..."
      }
    ],
    "totalResultsAnalyzed": 100,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## Supported Countries

| Code | Country |
|------|---------|
| us | United States |
| uk | United Kingdom |
| ca | Canada |
| au | Australia |
| de | Germany |
| fr | France |
| es | Spain |
| it | Italy |
| nl | Netherlands |
| br | Brazil |
| mx | Mexico |
| in | India |
| jp | Japan |

## Troubleshooting

### API returns 500 error

- Check that `BRIGHTDATA_API_KEY` is set correctly in Environment Variables
- Ensure you marked it as a **Secret** and pushed a new commit to trigger redeployment
- Verify your Bright Data account has SERP API credits
- Check the Deployments Dashboard logs for detailed error messages

### Environment variables not working

Webflow Cloud runs on Cloudflare Workers, so environment variables are only available at **runtime** (not build time). The API route includes support for both:
- `process.env` (standard Node.js / local development)
- `getCloudflareContext()` (Webflow Cloud production)

### CORS errors

- Ensure your Webflow domain is in the `ALLOWED_ORIGINS` array
- Redeploy after updating the origins

### Rate limiting

Bright Data has usage limits based on your plan. Monitor your usage in their dashboard.

## License

MIT
