/**
 * Google Keyword Rank Checker API Route
 * Calls Bright Data Search Engine Crawler API to find keyword rankings
 *
 * Compatible with both local Node.js development and Webflow Cloud (Cloudflare Workers)
 */

// Allowed origins for CORS - add your Webflow domain here
const ALLOWED_ORIGINS = [
  'https://your-site.webflow.io',
  'https://your-custom-domain.com',
  'http://localhost:3000', // Development
];

/**
 * Get API key from environment
 * Supports both Node.js (process.env) and Cloudflare Workers runtime
 */
async function getApiKey(req) {
  // First try standard process.env (works locally and may work in Webflow Cloud)
  if (process.env.BRIGHTDATA_API_KEY) {
    return process.env.BRIGHTDATA_API_KEY;
  }

  // For Webflow Cloud / Cloudflare Workers, try to get from context
  // This requires @cloudflare/next-on-pages in production
  try {
    const { getCloudflareContext } = await import('@cloudflare/next-on-pages');
    const { env } = await getCloudflareContext();
    if (env?.BRIGHTDATA_API_KEY) {
      return env.BRIGHTDATA_API_KEY;
    }
  } catch {
    // Module not available (local dev) or context not ready
  }

  return null;
}

/**
 * Set CORS headers for the response
 */
function setCorsHeaders(res, origin) {
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

/**
 * Get country code for Bright Data (Google domain mapping)
 */
function getGoogleDomain(countryCode) {
  const domains = {
    us: 'google.com',
    uk: 'google.co.uk',
    ca: 'google.ca',
    au: 'google.com.au',
    de: 'google.de',
    fr: 'google.fr',
    es: 'google.es',
    it: 'google.it',
    nl: 'google.nl',
    br: 'google.com.br',
    mx: 'google.com.mx',
    in: 'google.co.in',
    jp: 'google.co.jp',
  };
  return domains[countryCode.toLowerCase()] || 'google.com';
}

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Normalize domain for comparison
 */
function normalizeDomain(domain) {
  return domain.toLowerCase().replace(/^www\./, '').replace(/\/$/, '');
}

/**
 * Call Bright Data Search Engine Crawler API
 */
async function callBrightDataAPI(keyword, country, apiKey) {
  if (!apiKey) {
    throw new Error('BRIGHTDATA_API_KEY environment variable is not set');
  }

  const googleDomain = getGoogleDomain(country);

  // Bright Data SERP API endpoint
  // Documentation: https://docs.brightdata.com/scraping-automation/serp-api/introduction
  const endpoint = 'https://api.brightdata.com/serp/req';

  const requestBody = {
    query: keyword,
    country: country.toLowerCase(),
    search_engine: 'google',
    num: 100, // Request top 100 results
    device: 'desktop',
    gl: country.toLowerCase(), // Geolocation
    hl: 'en', // Language
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Bright Data API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Parse Bright Data response and find ranking
 */
function parseResults(apiResponse, targetDomain) {
  const normalizedTarget = normalizeDomain(targetDomain);
  const results = {
    rank: null,
    found: false,
    targetUrl: null,
    topCompetitors: [],
    totalResults: 0,
  };

  // Handle different response structures from Bright Data
  const organicResults = apiResponse.organic || apiResponse.results || [];
  results.totalResults = organicResults.length;

  for (let i = 0; i < organicResults.length; i++) {
    const result = organicResults[i];
    const url = result.url || result.link || '';
    const resultDomain = extractDomain(url);
    const normalizedResult = normalizeDomain(resultDomain);
    const position = i + 1;

    // Add to top 10 competitors list
    if (position <= 10) {
      results.topCompetitors.push({
        position,
        title: result.title || 'No title',
        url: url,
        domain: resultDomain,
        description: result.description || result.snippet || '',
      });
    }

    // Check if this result matches target domain
    if (normalizedResult.includes(normalizedTarget) || normalizedTarget.includes(normalizedResult)) {
      if (!results.found) {
        results.rank = position;
        results.found = true;
        results.targetUrl = url;
      }
    }
  }

  return results;
}

/**
 * Main API handler
 */
export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  setCorsHeaders(res, origin);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { keyword, targetDomain, country } = req.body;

    // Validate inputs
    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    if (!targetDomain || typeof targetDomain !== 'string' || targetDomain.trim().length === 0) {
      return res.status(400).json({ error: 'Target domain is required' });
    }

    if (!country || typeof country !== 'string' || country.trim().length === 0) {
      return res.status(400).json({ error: 'Country is required' });
    }

    const cleanKeyword = keyword.trim();
    const cleanDomain = normalizeDomain(targetDomain.trim());
    const cleanCountry = country.trim().toLowerCase();

    // Get API key (supports both Node.js and Cloudflare Workers)
    const apiKey = await getApiKey(req);

    // Call Bright Data API
    const apiResponse = await callBrightDataAPI(cleanKeyword, cleanCountry, apiKey);

    // Parse results
    const results = parseResults(apiResponse, cleanDomain);

    // Return response
    return res.status(200).json({
      success: true,
      data: {
        keyword: cleanKeyword,
        targetDomain: cleanDomain,
        country: cleanCountry.toUpperCase(),
        rank: results.found ? results.rank : 'Not Found',
        found: results.found,
        targetUrl: results.targetUrl,
        topCompetitors: results.topCompetitors,
        totalResultsAnalyzed: results.totalResults,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Rank check error:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while checking rank',
    });
  }
}
