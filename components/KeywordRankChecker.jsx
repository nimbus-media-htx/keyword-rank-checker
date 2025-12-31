'use client';

import { useState } from 'react';

/**
 * Country options for the dropdown
 */
const COUNTRIES = [
  { code: 'us', name: 'United States' },
  { code: 'uk', name: 'United Kingdom' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'es', name: 'Spain' },
  { code: 'it', name: 'Italy' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'br', name: 'Brazil' },
  { code: 'mx', name: 'Mexico' },
  { code: 'in', name: 'India' },
  { code: 'jp', name: 'Japan' },
];

/**
 * Loading spinner component
 */
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Rank display component
 */
function RankDisplay({ rank, found, targetDomain, keyword }) {
  const isFound = found && rank !== 'Not Found';

  return (
    <div className={`p-6 rounded-xl ${isFound ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          Rank for "<span className="font-medium">{keyword}</span>"
        </p>
        <div className={`text-5xl font-bold mb-2 ${isFound ? 'text-green-600' : 'text-orange-600'}`}>
          {isFound ? `#${rank}` : 'Not Found'}
        </div>
        <p className="text-sm text-gray-500">
          {isFound
            ? `${targetDomain} ranks #${rank} in the top 100`
            : `${targetDomain} not found in top 100 results`}
        </p>
      </div>
    </div>
  );
}

/**
 * Top 10 competitors table component
 */
function CompetitorsTable({ competitors, targetDomain }) {
  if (!competitors || competitors.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 10 Competitors</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-medium text-gray-600">Rank</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Domain</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Title</th>
            </tr>
          </thead>
          <tbody>
            {competitors.map((competitor) => {
              const isTarget = competitor.domain.includes(targetDomain) ||
                               targetDomain.includes(competitor.domain);
              return (
                <tr
                  key={competitor.position}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    isTarget ? 'bg-green-50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${
                      competitor.position <= 3
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {competitor.position}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={competitor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      {competitor.domain}
                    </a>
                    {isTarget && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Your Site
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-md truncate">
                    {competitor.title}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Main Keyword Rank Checker Component
 * Export this for use with Webflow DevLink
 */
export default function KeywordRankChecker({ apiEndpoint = '/api/check-rank' }) {
  const [keyword, setKeyword] = useState('');
  const [targetDomain, setTargetDomain] = useState('');
  const [country, setCountry] = useState('us');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: keyword.trim(),
          targetDomain: targetDomain.trim(),
          country,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check rank');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to check rank');
      }

      setResults(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
          <h1 className="text-2xl font-bold mb-2">Google Keyword Rank Checker</h1>
          <p className="text-blue-100 text-sm">
            Check your website's ranking position for any keyword in Google's top 100 results
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {!results ? (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Keyword Input */}
              <div>
                <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
                  Keyword
                </label>
                <input
                  type="text"
                  id="keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g., best coffee maker"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              {/* Target Domain Input */}
              <div>
                <label htmlFor="targetDomain" className="block text-sm font-medium text-gray-700 mb-1">
                  Target Domain
                </label>
                <input
                  type="text"
                  id="targetDomain"
                  value={targetDomain}
                  onChange={(e) => setTargetDomain(e.target.value)}
                  placeholder="e.g., example.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Enter without http:// or www.</p>
              </div>

              {/* Country Select */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner />
                    Checking Rank...
                  </>
                ) : (
                  'Check Rank'
                )}
              </button>
            </form>
          ) : (
            /* Results */
            <div>
              {/* Rank Display */}
              <RankDisplay
                rank={results.rank}
                found={results.found}
                targetDomain={results.targetDomain}
                keyword={results.keyword}
              />

              {/* Meta Info */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                <span>Country: {results.country}</span>
                <span>Results Analyzed: {results.totalResultsAnalyzed}</span>
                <span>Checked: {new Date(results.timestamp).toLocaleString()}</span>
              </div>

              {/* Competitors Table */}
              <CompetitorsTable
                competitors={results.topCompetitors}
                targetDomain={results.targetDomain}
              />

              {/* Check Another Button */}
              <button
                onClick={handleReset}
                className="mt-6 w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
              >
                Check Another Keyword
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-center text-xs text-gray-400 mt-4">
        Powered by Bright Data SERP API
      </p>
    </div>
  );
}
