import Head from 'next/head';
import KeywordRankChecker from '../components/KeywordRankChecker';

export default function Home() {
  return (
    <>
      <Head>
        <title>Google Keyword Rank Checker | Free SEO Tool</title>
        <meta
          name="description"
          content="Check your website's Google ranking for any keyword. Find out where your site ranks in the top 100 search results."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
        <KeywordRankChecker />
      </main>
    </>
  );
}
