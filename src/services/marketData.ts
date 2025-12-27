// ============================================
// LIVE MARKET DATA SERVICE - FINNHUB ONLY
// Centralized caching to prevent API rate limit issues
// Finnhub limit: 60 API calls/min
// ============================================

const FINNHUB_API_KEY = 'd57urc1r01qptoap74k0d57urc1r01qptoap74kg';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export interface MarketQuote {
  symbol: string;
  price: number;
  change: number; // percentage change
  prevClose: number;
  high: number;
  low: number;
  isLive: boolean;
}

// ALL symbols needed across the entire app - fetched once, shared everywhere
const ALL_SYMBOLS = [
  // ETFs & Indices (needed by Greeks, ML Trading, Portfolio)
  'SPY', 'QQQ', 'DIA', 'IWM',
  // Big Tech (needed by Stock Ticker, ML Trading, Portfolio)
  'AAPL', 'GOOGL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'META',
  // Financials (Stock Ticker)
  'JPM', 'GS', 'BAC',
  // Other (Stock Ticker)
  'AMD', 'INTC', 'NFLX',
];

// ============================================
// GLOBAL CACHE - Shared across all widgets
// ============================================
interface CachedQuote extends MarketQuote {
  timestamp: number;
}

const globalCache: Map<string, CachedQuote> = new Map();
let lastGlobalFetch = 0;
let isFetching = false;
const CACHE_TTL = 180000; // 3 minutes cache validity
const MIN_FETCH_INTERVAL = 180000; // 3 minutes between fetches (safe: ~18 calls / 3 min = 6/min)

// ============================================
// FINNHUB API - Stock Quotes
// ============================================
interface FinnhubQuote {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High
  l: number;  // Low
  o: number;  // Open
  pc: number; // Previous close
  t: number;  // Timestamp
}

async function fetchSingleQuote(symbol: string): Promise<MarketQuote | null> {
  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );
    
    if (!response.ok) {
      if (response.status === 429) {
        console.warn(`⚠️ Rate limited on ${symbol}`);
      }
      return null;
    }
    
    const data: FinnhubQuote = await response.json();
    
    if (!data.c || data.c === 0) {
      return null;
    }
    
    return {
      symbol,
      price: data.c,
      change: data.dp || 0,
      prevClose: data.pc || data.c,
      high: data.h || data.c,
      low: data.l || data.c,
      isLive: true,
    };
  } catch (error) {
    console.warn(`Failed to fetch ${symbol}:`, error);
    return null;
  }
}

// ============================================
// MAIN FETCH - Fetches ALL symbols once
// All widgets use getQuote() to read from cache
// ============================================
async function refreshGlobalCache(): Promise<void> {
  if (isFetching) return;
  
  const now = Date.now();
  if (now - lastGlobalFetch < MIN_FETCH_INTERVAL && globalCache.size > 0) {
    return; // Use cache
  }
  
  isFetching = true;
  console.log('📈 Fetching market data for all widgets...');
  
  try {
    // Fetch all symbols in parallel
    const results = await Promise.all(
      ALL_SYMBOLS.map(symbol => fetchSingleQuote(symbol))
    );
    
    // Update cache
    results.forEach(quote => {
      if (quote) {
        globalCache.set(quote.symbol, { ...quote, timestamp: now });
      }
    });
    
    lastGlobalFetch = now;
    console.log(`✅ Cached ${globalCache.size} quotes (next refresh in 3 min)`);
  } catch (error) {
    console.warn('Cache refresh failed:', error);
  } finally {
    isFetching = false;
  }
}

// ============================================
// PUBLIC API - Used by all widgets
// ============================================

// Get a single quote from cache (instant, no API call)
export function getQuote(symbol: string): MarketQuote | null {
  const cached = globalCache.get(symbol);
  if (cached) {
    return cached;
  }
  return null;
}

// Get multiple quotes from cache
export function getQuotes(symbols: string[]): MarketQuote[] {
  return symbols
    .map(s => getQuote(s))
    .filter((q): q is MarketQuote => q !== null);
}

// Get all cached quotes
export function getAllQuotes(): MarketQuote[] {
  return Array.from(globalCache.values());
}

// Check if cache has data
export function hasCachedData(): boolean {
  return globalCache.size > 0;
}

// Force refresh (used on initial page load)
export async function fetchAllMarketData(): Promise<MarketQuote[]> {
  await refreshGlobalCache();
  return getAllQuotes();
}

// Start auto-refresh (call once on app mount)
let refreshInterval: NodeJS.Timeout | null = null;
export function startAutoRefresh(): () => void {
  // Initial fetch
  refreshGlobalCache();
  
  // Refresh every 3 minutes
  if (!refreshInterval) {
    refreshInterval = setInterval(refreshGlobalCache, MIN_FETCH_INTERVAL);
  }
  
  // Return cleanup function
  return () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  };
}
