// ============================================
// LIVE MARKET DATA SERVICE - FINNHUB ONLY
// No fallbacks - only show live data
// ============================================

const FINNHUB_API_KEY = 'd57cpn9r01qrcrnao2k0d57cpn9r01qrcrnao2kg';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export interface MarketQuote {
  symbol: string;
  price: number;
  change: number; // percentage change
  isLive: boolean;
}

// Stock symbols to fetch from Finnhub (expanded list)
const STOCK_SYMBOLS = [
  // Big Tech
  'AAPL', 'GOOGL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'META',
  // Financials
  'JPM', 'GS', 'MS', 'BAC', 'C',
  // ETFs & Indices
  'SPY', 'QQQ', 'IWM', 'DIA',
  // Other Tech
  'AMD', 'INTC', 'CRM', 'ORCL', 'NFLX',
];

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

async function fetchStockQuote(symbol: string): Promise<MarketQuote | null> {
  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );
    
    if (!response.ok) {
      console.warn(`Finnhub API error for ${symbol}:`, response.status);
      return null;
    }
    
    const data: FinnhubQuote = await response.json();
    
    // Check if we got valid data (c = 0 or null means no data - skip this ticker)
    if (!data.c || data.c === 0) {
      console.warn(`No data for ${symbol} - skipping`);
      return null;
    }
    
    return {
      symbol,
      price: data.c,
      change: data.dp || 0,
      isLive: true,
    };
  } catch (error) {
    console.warn(`Failed to fetch ${symbol}:`, error);
    return null;
  }
}

// ============================================
// MAIN FETCH FUNCTION - Finnhub only
// First call is instant, subsequent calls have 5 min interval
// ============================================
let lastFetchTime = 0;
let cachedData: MarketQuote[] = [];
let isFirstLoad = true; // Track if this is the first load
const MIN_FETCH_INTERVAL = 300000; // 5 minutes between API calls after first load

export async function fetchAllMarketData(): Promise<MarketQuote[]> {
  const now = Date.now();
  
  // First load is always instant, subsequent calls respect rate limit
  if (!isFirstLoad && now - lastFetchTime < MIN_FETCH_INTERVAL && cachedData.length > 0) {
    return cachedData;
  }
  
  try {
    // Fetch all stocks in parallel (faster load)
    const stockPromises = STOCK_SYMBOLS.map(symbol => fetchStockQuote(symbol));
    
    // Wait for all fetches
    const stockResults = await Promise.all(stockPromises);
    
    // Filter out null results (tickers with no data are skipped)
    const liveQuotes = stockResults.filter((q): q is MarketQuote => q !== null);
    
    if (liveQuotes.length > 0) {
      cachedData = liveQuotes;
      lastFetchTime = now;
      isFirstLoad = false; // Mark first load as complete
      console.log(`📈 Fetched ${liveQuotes.length} live quotes from Finnhub`);
    }
    
    return cachedData;
  } catch (error) {
    console.warn('Market data fetch failed:', error);
    isFirstLoad = false; // Even on error, don't retry instantly
    return cachedData; // Return whatever we have cached (could be empty)
  }
}

// ============================================
// WEBSOCKET FOR REAL-TIME UPDATES (Finnhub)
// ============================================
type TickCallback = (quotes: MarketQuote[]) => void;

class MarketDataStream {
  private ws: WebSocket | null = null;
  private callbacks: Set<TickCallback> = new Set();
  private prices: Map<string, MarketQuote> = new Map();
  private reconnectTimeout: number | null = null;
  private isConnecting = false;
  
  subscribe(callback: TickCallback): () => void {
    this.callbacks.add(callback);
    
    // Start WebSocket if not already running
    if (!this.ws && !this.isConnecting) {
      this.connect();
    }
    
    // Immediately send current prices if we have any
    if (this.prices.size > 0) {
      callback(Array.from(this.prices.values()));
    }
    
    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
      if (this.callbacks.size === 0) {
        this.disconnect();
      }
    };
  }
  
  private connect() {
    if (this.isConnecting || this.ws) return;
    this.isConnecting = true;
    
    try {
      this.ws = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`);
      
      this.ws.onopen = () => {
        console.log('📡 WebSocket connected to Finnhub');
        this.isConnecting = false;
        
        // Subscribe to stock symbols
        STOCK_SYMBOLS.forEach(symbol => {
          this.ws?.send(JSON.stringify({ type: 'subscribe', symbol }));
        });
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'trade' && data.data) {
            // Process trade updates
            data.data.forEach((trade: { s: string; p: number }) => {
              const existing = this.prices.get(trade.s);
              const newPrice = trade.p;
              
              if (newPrice && newPrice > 0) {
                const prevPrice = existing?.price || newPrice;
                const change = existing 
                  ? ((newPrice - prevPrice) / prevPrice) * 100 
                  : 0;
                
                this.prices.set(trade.s, {
                  symbol: trade.s,
                  price: newPrice,
                  change: existing ? existing.change + change : 0,
                  isLive: true,
                });
              }
            });
            
            // Notify subscribers only if we have data
            if (this.prices.size > 0) {
              const quotes = Array.from(this.prices.values());
              this.callbacks.forEach(cb => cb(quotes));
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      };
      
      this.ws.onerror = (error) => {
        console.warn('WebSocket error:', error);
        this.isConnecting = false;
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket closed');
        this.ws = null;
        this.isConnecting = false;
        
        // Reconnect after 5 seconds if there are still subscribers
        if (this.callbacks.size > 0) {
          this.reconnectTimeout = window.setTimeout(() => {
            this.connect();
          }, 5000);
        }
      };
    } catch (error) {
      console.warn('Failed to create WebSocket:', error);
      this.isConnecting = false;
    }
  }
  
  private disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      // Unsubscribe from all symbols
      STOCK_SYMBOLS.forEach(symbol => {
        this.ws?.send(JSON.stringify({ type: 'unsubscribe', symbol }));
      });
      
      this.ws.close();
      this.ws = null;
    }
  }
  
  updatePrices(quotes: MarketQuote[]) {
    quotes.forEach(q => this.prices.set(q.symbol, q));
    if (this.prices.size > 0) {
      this.callbacks.forEach(cb => cb(Array.from(this.prices.values())));
    }
  }
}

// Singleton instance
export const marketDataStream = new MarketDataStream();
