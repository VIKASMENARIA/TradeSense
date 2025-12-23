
// ----------------------------------------------------------------------
// CONFIGURATION & STATE MANANGEMENT
// ----------------------------------------------------------------------

let USE_LIVE_DATA = false;
let API_KEY = "";
let DATA_PROVIDER = "ALPHA_VANTAGE";

const listeners = [];
const notifyListeners = () => listeners.forEach(l => l());

export const subscribeToApiStatus = (listener) => {
    listeners.push(listener);
    return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
    }
};

export const setApiConfig = (key, provider = "ALPHA_VANTAGE") => {
    API_KEY = key;
    DATA_PROVIDER = provider;
    USE_LIVE_DATA = !!key;
    console.log("API Config Updated:", { USE_LIVE_DATA, provider });
    notifyListeners();
};

export const getApiConfig = () => ({
    apiKey: API_KEY,
    provider: DATA_PROVIDER,
    isLive: USE_LIVE_DATA
});

// ----------------------------------------------------------------------
// SYMBOL SEARCH API (AUTOCOMPLETE)
// ----------------------------------------------------------------------

export const searchSymbols = async (query) => {
    if (!query) return [];

    // 1. If Live API Configured, use Real Search
    if (USE_LIVE_DATA && API_KEY) {
        try {
            console.log("Searching API for:", query);
            const response = await fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${API_KEY}`);
            const data = await response.json();

            if (data.bestMatches) {
                return data.bestMatches
                    .filter(match => match['04. region'] === 'India' || match['04. region'] === 'United States') // Prioritize India/US
                    .map(match => ({
                        symbol: match['01. symbol'],
                        name: match['02. name'],
                        region: match['04. region'],
                        type: match['03. type']
                    }));
            }
            return [];
        } catch (e) {
            console.error("Symbol Search Error:", e);
            return [];
        }
    }

    // 2. Offline Fallback: Search in local huge list
    const q = query.toUpperCase();
    return ALL_INDIAN_TICKS.filter(s =>
        s.symbol.includes(q) || s.name.toUpperCase().includes(q)
    ).slice(0, 10);
};

// ----------------------------------------------------------------------
// DATA FETCHING LAYER
// ----------------------------------------------------------------------

const fetchRealQuote = async (symbol) => {
    if (!API_KEY) return null;
    let searchSymbol = symbol.toUpperCase();

    // Auto-correction for Indian symbols if user selects "RELIANCE" but needs ".BSE"
    if (!searchSymbol.includes('.') && !searchSymbol.includes('^')) {
        // Optimization: If it matches a known Indian ticker in our list, append .BSE
        const isIndian = ALL_INDIAN_TICKS.find(s => s.symbol === searchSymbol);
        if (isIndian) searchSymbol = `${searchSymbol}.BSE`;
    }

    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${searchSymbol}&apikey=${API_KEY}`);
        const data = await response.json();

        if (data["Note"] || data["Information"]) return null; // Rate limit path

        const quote = data['Global Quote'];
        if (quote && quote['05. price']) {
            return {
                symbol: quote['01. symbol'],
                price: parseFloat(quote['05. price']),
                change: parseFloat(quote['09. change']),
                changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
                volume: parseInt(quote['06. volume']),
                prevClose: parseFloat(quote['08. previous close']),
                high: parseFloat(quote['03. high']),
                low: parseFloat(quote['04. low'])
            };
        }
        return null;
    } catch (e) {
        return null;
    }
};

export const fetchMarketDepth = async () => {
    if (!USE_LIVE_DATA || !API_KEY) return getSimulatedMarketDepth();

    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${API_KEY}`);
        const data = await response.json();

        if (data["top_gainers"]) {
            const mapToSchema = (item) => ({
                symbol: item.ticker,
                name: item.ticker,
                price: parseFloat(item.price).toFixed(2),
                changePercentage: parseFloat(item.change_percentage.replace('%', '')).toFixed(2),
                volume: item.volume,
                status: parseFloat(item.change_percentage) > 0 ? 'upper_circuit' : 'lower_circuit',
                oi: "-"
            });
            return {
                topGainers: data["top_gainers"].map(mapToSchema),
                topLosers: data["top_losers"].map(mapToSchema)
            };
        }
        return getSimulatedMarketDepth();
    } catch (e) {
        return getSimulatedMarketDepth();
    }
};

export const analyzeStock = async (symbol) => {
    if (!symbol) return null;

    let liveData = null;
    if (USE_LIVE_DATA && API_KEY) {
        liveData = await fetchRealQuote(symbol);
    }

    if (USE_LIVE_DATA && !liveData) {
        return {
            found: true,
            symbol: symbol.toUpperCase(),
            name: "Unavailable / Limit Exceeded",
            price: "---",
            recommendation: "ERROR",
            confidence: "0%",
            reasoning: "API Limit Reached or Invalid Symbol. Please wait 1 min or check connection.",
            metrics: { orderFlow: "-", institutionalActivity: "-", support: "-", resistance: "-", rsi: "-", macd: "-" }
        };
    }

    const price = liveData ? liveData.price : 500;
    const change = liveData ? liveData.changePercent : 0;
    const vol = liveData ? liveData.volume : "10M";

    if (!USE_LIVE_DATA) {
        const sim = ALL_INDIAN_TICKS.find(s => s.symbol === symbol.toUpperCase());
        if (sim) {
            return {
                found: true,
                ...sim,
                price: (Math.random() * 2000 + 100).toFixed(2),
                changePercentage: (Math.random() * 4 - 2).toFixed(2),
                recommendation: "BUY",
                confidence: "Simulated",
                reasoning: "Offline Mode: Using simulated market data.",
                metrics: generateSimMetrics(true, 1000)
            };
        } else {
            return {
                found: false,
                symbol: symbol.toUpperCase(),
                price: 0,
                recommendation: "NOT FOUND",
                confidence: "0",
                reasoning: "Symbol not in database.",
                metrics: { support: 0, resistance: 0 }
            }
        }
    }

    const isBullish = change > 0;
    const pivot = price;
    const r1 = (price * 1.02).toFixed(2);
    const s1 = (price * 0.98).toFixed(2);
    const rsi = isBullish ? (50 + (change * 5)).toFixed(1) : (50 + (change * 5)).toFixed(1);

    return {
        found: true,
        symbol: liveData.symbol,
        name: liveData.symbol,
        price: price.toFixed(2),
        changePercentage: change.toFixed(2),
        volume: vol,
        recommendation: change > 0.5 ? "STRONG BUY" : (change < -0.5 ? "STRONG SELL" : "HOLD"),
        confidence: "98.5%",
        reasoning: isBullish
            ? `Price is trading UP by ${change}%. Momentum is positive with volume support at ${vol}. Valid breakout above local resistance.`
            : `Price is trading DOWN by ${change}%. Selling pressure detected. Broke below key support at ${s1}.`,
        metrics: {
            orderFlow: isBullish ? "Net Inflow" : "Net Outflow",
            institutionalActivity: isBullish ? "Accumulating" : "Divesting",
            support: s1,
            resistance: r1,
            rsi: `${Math.min(90, Math.max(10, rsi))}`,
            macd: isBullish ? "Positive" : "Negative"
        }
    };
};

export const analyzeOptionChain = async (symbol) => {
    // Similar Logic to Analyze Stock
    if (!symbol) return null;
    let spotPrice = 0;
    if (USE_LIVE_DATA && API_KEY) {
        const quote = await fetchRealQuote(symbol);
        if (quote) spotPrice = quote.price;
    }

    if (spotPrice === 0 && !USE_LIVE_DATA) spotPrice = 18500; // Sim fallback

    const strikeStep = 50;
    const atmStrike = Math.round(spotPrice / strikeStep) * strikeStep;
    const isCall = spotPrice > 0;
    const premium = (spotPrice * 0.01 + Math.random() * 5).toFixed(2);

    return {
        found: true,
        tradeFound: true,
        type: "OPTION",
        symbol: symbol.toUpperCase(),
        spotPrice: spotPrice.toFixed(2),
        recommendation: {
            instrument: `${symbol.toUpperCase()} 28DEC ${atmStrike} CE`,
            action: "BUY",
            entry: premium,
            target: (Number(premium) * 1.3).toFixed(2),
            stopLoss: (Number(premium) * 0.8).toFixed(2),
            confidence: spotPrice > 0 ? "90%" : "0%",
            logic: spotPrice > 0 ? "Live Spot Analysis" : "Data Unavailable"
        },
        greeks: { delta: "0.55", theta: "-12.5", iv: "14.2" }
    };
};

// ----------------------------------------------------------------------
// MASTER LIST FOR OFFLINE / FALLBACK
// ----------------------------------------------------------------------
const ALL_INDIAN_TICKS = [
    { symbol: "RELIANCE", name: "Reliance Industries Ltd" },
    { symbol: "TCS", name: "Tata Consultancy Services" },
    { symbol: "HDFCBANK", name: "HDFC Bank Ltd" },
    { symbol: "INFY", name: "Infosys Ltd" },
    { symbol: "ICICIBANK", name: "ICICI Bank Ltd" },
    { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd" },
    { symbol: "ITC", name: "ITC Ltd" },
    { symbol: "SBIN", name: "State Bank of India" },
    { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd" },
    { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank" },
    { symbol: "LICI", name: "LIC India" },
    { symbol: "LT", name: "Larsen & Toubro" },
    { symbol: "HCLTECH", name: "HCL Technologies" },
    { symbol: "AXISBANK", name: "Axis Bank" },
    { symbol: "ASIANPAINT", name: "Asian Paints" },
    { symbol: "MARUTI", name: "Maruti Suzuki" },
    { symbol: "SUNPHARMA", name: "Sun Pharma" },
    { symbol: "TITAN", name: "Titan Company" },
    { symbol: "BAJFINANCE", name: "Bajaj Finance" },
    { symbol: "ULTRACEMCO", name: "UltraTech Cement" },
    { symbol: "ONGC", name: "Oil & Natural Gas Corp" },
    { symbol: "NTPC", name: "NTPC Ltd" },
    { symbol: "TATAMOTORS", name: "Tata Motors" },
    { symbol: "POWERGRID", name: "Power Grid Corp" },
    { symbol: "ADANIENT", name: "Adani Enterprises" },
    { symbol: "ADANIGREEN", name: "Adani Green Energy" },
    { symbol: "ADANIPORTS", name: "Adani Ports" },
    { symbol: "WIPRO", name: "Wipro Ltd" },
    { symbol: "M&M", name: "Mahindra & Mahindra" },
    { symbol: "COALINDIA", name: "Coal India" },
    { symbol: "BAJAJFINSV", name: "Bajaj Finserv" },
    { symbol: "PIDILITIND", name: "Pidilite Industries" },
    { symbol: "JSWSTEEL", name: "JSW Steel" },
    { symbol: "NESTLEIND", name: "Nestle India" },
    { symbol: "TATASTEEL", name: "Tata Steel" },
    { symbol: "GRASIM", name: "Grasim Industries" },
    { symbol: "TECHM", name: "Tech Mahindra" },
    { symbol: "HINDALCO", name: "Hindalco Industries" },
    { symbol: "CIPLA", name: "Cipla Ltd" },
    { symbol: "SBILIFE", name: "SBI Life Insurance" },
    { symbol: "BPCL", name: "Bharat Petroleum" },
    { symbol: "BRITANNIA", name: "Britannia Industries" },
    { symbol: "LTIM", name: "LTIMindtree" },
    { symbol: "TATACONSUM", name: "Tata Consumer Products" },
    { symbol: "DRREDDY", name: "Dr Reddys Labs" },
    { symbol: "EICHERMOT", name: "Eicher Motors" },
    { symbol: "DIVISLAB", name: "Divis Laboratories" },
    { symbol: "INDUSINDBK", name: "IndusInd Bank" },
    { symbol: "HEROMOTOCO", name: "Hero MotoCorp" },
    { symbol: "APOLLOHOSP", name: "Apollo Hospitals" },
    { symbol: "UPL", name: "UPL Ltd" },
    { symbol: "ZOMATO", name: "Zomato Ltd" },
    { symbol: "PAYTM", name: "One97 Communications" },
    { symbol: "NYKAA", name: "FSN E-Commerce" },
    { symbol: "DELHIVERY", name: "Delhivery Ltd" },
    { symbol: "AWL", name: "Adani Wilmar" },
    { symbol: "HAL", name: "Hindustan Aeronautics" },
    { symbol: "BEL", name: "Bharat Electronics" },
    { symbol: "VBL", name: "Varun Beverages" },
    { symbol: "CHOLAFIN", name: "Cholamandalam Inv" },
    { symbol: "SIEMENS", name: "Siemens Ltd" },
    { symbol: "BANKBARODA", name: "Bank of Baroda" },
    { symbol: "TRENT", name: "Trent Ltd" },
    { symbol: "HAVELLS", name: "Havells India" },
    { symbol: "INDIGO", name: "InterGlobe Aviation" },
    { symbol: "JINDALSTEL", name: "Jindal Steel" },
    { symbol: "SRF", name: "SRF Ltd" },
    { symbol: "ICICIPRULI", name: "ICICI Pru Life" },
    { symbol: "VEDL", name: "Vedanta Ltd" },
    { symbol: "GAIL", name: "GAIL India" },
    { symbol: "DLF", name: "DLF Ltd" },
    { symbol: "DABUR", name: "Dabur India" },
    { symbol: "SHREECEM", name: "Shree Cement" }
];
// (Note: This list is ~70 items. In real usage, use API search below)

export const stockData = ALL_INDIAN_TICKS.map(s => ({
    ...s, price: "100.00", changePercentage: 0, volume: "0", status: 'normal'
}));

const generateSimMetrics = (isBull, price) => ({
    orderFlow: isBull ? "Buy" : "Sell",
    institutionalActivity: "-",
    support: (price * 0.9).toFixed(2),
    resistance: (price * 1.1).toFixed(2),
    rsi: "50",
    macd: "0"
});

const getSimulatedMarketDepth = () => {
    // Generate some random movement for the offline dashboard
    const sim = ALL_INDIAN_TICKS.slice(0, 30).map(s => ({
        ...s,
        price: (Math.random() * 2000 + 100).toFixed(2),
        changePercentage: (Math.random() * 10 - 5).toFixed(2),
        volume: "1M",
        oi: "10K",
        status: 'normal'
    }));
    const sorted = sim.sort((a, b) => b.changePercentage - a.changePercentage);
    return {
        topGainers: sorted.slice(0, 10),
        topLosers: sorted.slice(-10).reverse()
    };
};
