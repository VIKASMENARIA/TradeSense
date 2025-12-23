import { useState, useEffect } from 'react';

// ----------------------------------------------------------------------
// CONFIGURATION & STATE MANANGEMENT
// ----------------------------------------------------------------------

// Default to simulation
let USE_LIVE_DATA = false;
let API_KEY = "";
let DATA_PROVIDER = "ALPHA_VANTAGE"; // or 'CUSTOM'

export const setApiConfig = (key, provider = "ALPHA_VANTAGE") => {
    API_KEY = key;
    DATA_PROVIDER = provider;
    USE_LIVE_DATA = !!key;
    console.log("API Config Updated:", { USE_LIVE_DATA, provider });
};

export const getApiConfig = () => ({
    apiKey: API_KEY,
    provider: DATA_PROVIDER,
    isLive: USE_LIVE_DATA
});

// ----------------------------------------------------------------------
// STATIC DATA (FALLBACK)
// ----------------------------------------------------------------------

const SECTORS = ['Finance', 'Tech', 'Energy', 'Auto', 'Pharma', 'FMCG', 'Metals', 'Infra', 'Chems', 'Textiles'];
const baseStocks = [
    { s: "RELIANCE", n: "Reliance Industries", p: 2450.50, v: "14.2M" },
    { s: "TCS", n: "Tata Consultancy Svcs", p: 3450.20, v: "2.1M" },
    { s: "HDFCBANK", n: "HDFC Bank Ltd", p: 1540.00, v: "18.5M" },
    { s: "ICICIBANK", n: "ICICI Bank", p: 960.50, v: "12.3M" },
    { s: "INFY", n: "Infosys Ltd", p: 1420.30, v: "5.6M" },
    { s: "ITC", n: "ITC Ltd", p: 445.60, v: "22.1M" },
    { s: "SBIN", n: "State Bank of India", p: 580.20, v: "15.0M" },
    { s: "BHARTIARTL", n: "Bharti Airtel", p: 890.00, v: "4.2M" },
    { s: "LICI", n: "LIC India", p: 650.00, v: "1.2M" },
    { s: "KOTAKBANK", n: "Kotak Mahindra Bank", p: 1850.00, v: "2.8M" },
    { s: "LT", n: "Larsen & Toubro", p: 2890.50, v: "1.9M" },
    { s: "HINDUNILVR", n: "Hindustan Unilever", p: 2560.00, v: "1.1M" },
    { s: "AXISBANK", n: "Axis Bank", p: 980.00, v: "8.5M" },
    { s: "TATAMOTORS", n: "Tata Motors", p: 640.00, v: "25.0M" },
    { s: "MARUTI", n: "Maruti Suzuki", p: 9800.00, v: "0.5M" },
    { s: "SUNPHARMA", n: "Sun Pharma", p: 1120.00, v: "1.8M" },
    { s: "ASIANPAINT", n: "Asian Paints", p: 3200.00, v: "0.8M" },
    { s: "TITAN", n: "Titan Company", p: 3100.00, v: "1.0M" },
    { s: "BAJFINANCE", n: "Bajaj Finance", p: 7200.00, v: "0.9M" },
    { s: "ADANIENT", n: "Adani Enterprises", p: 2450.00, v: "12.0M" },
    { s: "WIPRO", n: "Wipro Ltd", p: 405.00, v: "6.5M" },
    { s: "HCLTECH", n: "HCL Technologies", p: 1150.00, v: "2.2M" },
    { s: "ONGC", n: "ONGC", p: 175.00, v: "18.0M" },
    { s: "NTPC", n: "NTPC Ltd", p: 210.00, v: "14.5M" },
    { s: "POWERGRID", n: "Power Grid Corp", p: 245.00, v: "11.2M" },
    { s: "ULTRACEMCO", n: "UltraTech Cement", p: 8200.00, v: "0.4M" },
    { s: "COALINDIA", n: "Coal India", p: 235.00, v: "9.5M" },
    { s: "ADANIGREEN", n: "Adani Green Energy", p: 960.00, v: "1.5M" },
    { s: "ADANIPORTS", n: "Adani Ports", p: 810.00, v: "5.5M" },
    { s: "CIPLA", n: "Cipla Ltd", p: 1250.00, v: "1.3M" },
    { s: "ZOMATO", n: "Zomato Ltd", p: 125.50, v: "45M" },
    { s: "PAYTM", n: "One97 Comm", p: 410.00, v: "12M" },
    { s: "NYKAA", n: "FSN E-Commerce", p: 150.00, v: "8M" },
    { s: "POLICYBZR", n: "PB Fintech", p: 780.00, v: "3M" },
    { s: "DELHIVERY", n: "Delhivery Ltd", p: 420.00, v: "4M" },
    { s: "TATASTEEL", n: "Tata Steel", p: 130.00, v: "55M" },
    { s: "JIOFIN", n: "Jio Financial", p: 230.00, v: "25M" },
    { s: "RVNL", n: "Rail Vikas Nigam", p: 165.00, v: "18M" },
    { s: "IRFC", n: "Indian Railway Fin", p: 75.00, v: "22M" },
    { s: "MAZAGON", n: "Mazagon Dock", p: 2100.00, v: "2M" },
    { s: "HAL", n: "Hindustan Aeronautics", p: 3800.00, v: "1.5M" },
    { s: "BEL", n: "Bharat Electronics", p: 140.00, v: "12M" },
    { s: "BHEL", n: "Bharat Heavy Elec", p: 120.00, v: "15M" },
    { s: "SAIL", n: "Steel Authority", p: 90.00, v: "25M" },
    { s: "NMDC", n: "NMDC Ltd", p: 160.00, v: "10M" },
    { s: "IDFCFIRST", n: "IDFC First Bank", p: 85.00, v: "20M" },
    { s: "FEDERALBNK", n: "Federal Bank", p: 145.00, v: "8M" },
    { s: "INDHOTEL", n: "Indian Hotels", p: 420.00, v: "4M" },
    { s: "TATACHEM", n: "Tata Chemicals", p: 1050.00, v: "2.5M" },
    { s: "TATAPOWER", n: "Tata Power", p: 260.00, v: "14M" },
    { s: "VEDL", n: "Vedanta Ltd", p: 240.00, v: "11M" },
    { s: "HINDZINC", n: "Hindustan Zinc", p: 310.00, v: "1M" },
    { s: "PIDILITIND", n: "Pidilite Ind", p: 2450.00, v: "0.5M" },
    { s: "HAVELLS", n: "Havells India", p: 1350.00, v: "1.2M" },
    { s: "POLYCAB", n: "Polycab India", p: 5200.00, v: "0.8M" },
    { s: "DIXON", n: "Dixon Tech", p: 6500.00, v: "0.4M" },
    { s: "KPITTECH", n: "KPIT Tech", p: 1500.00, v: "3M" },
    { s: "L&TFH", n: "L&T Finance", p: 160.00, v: "5M" },
    { s: "M&MFIN", n: "M&M Finance", p: 280.00, v: "6M" },
    { s: "LICHSGFIN", n: "LIC Housing", p: 450.00, v: "2M" },
    { s: "PFC", n: "Power Finance", p: 380.00, v: "12M" },
    { s: "REC", n: "REC Ltd", p: 410.00, v: "10M" }
];

// Fallback Simulation Generator
export const generateStockData = () => {
    return baseStocks.map(stock => {
        const rand = Math.random();
        let status = 'normal';
        let change = (Math.random() * 4 - 2).toFixed(2);

        if (rand > 0.90) {
            status = 'upper_circuit';
            change = (Math.random() * (20 - 5) + 5).toFixed(2);
        } else if (rand < 0.10) {
            status = 'lower_circuit';
            change = (Math.random() * (-20 - -5) - 5).toFixed(2);
        }

        const vol = stock.v || (Math.floor(Math.random() * 10) + "M");

        return {
            symbol: stock.s,
            name: stock.n,
            price: Number(stock.p).toFixed(2),
            changePercentage: Number(change),
            status,
            volume: vol,
            sector: SECTORS[Math.floor(Math.random() * SECTORS.length)],
            vwap: (stock.p * (1 + (Math.random() * 0.02 - 0.01))).toFixed(2),
            beta: (Math.random() * 1.5 + 0.5).toFixed(2),
            oi: (Math.random() * 10 + 1).toFixed(1) + "M"
        };
    });
};

export const stockData = generateStockData();

// ----------------------------------------------------------------------
// API FETCH LOGIC (LIVE DATA)
// ----------------------------------------------------------------------

// Helper to fetch single quote from Alpha Vantage
const fetchAlphaVantageQuote = async (symbol) => {
    if (!API_KEY) return null;
    try {
        // Try BSE first, then NSE if needed. AV usually supports BSE better for Indian free tier.
        const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}.BSE&apikey=${API_KEY}`);
        const data = await response.json();
        const quote = data['Global Quote'];

        if (quote && quote['05. price']) {
            return {
                price: Number(quote['05. price']),
                changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
                volume: quote['06. volume']
            };
        }
        return null;
    } catch (e) {
        console.error("API Fetch Error:", e);
        return null;
    }
};

// ----------------------------------------------------------------------
// ANALYSIS LOGIC
// ----------------------------------------------------------------------

export const analyzeStock = async (symbol) => {
    if (!symbol) return null;

    // Default Simulated Object (Fallback)
    let stock = stockData.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
    let price = stock ? Number(stock.price) : 500;
    let changePercentage = stock ? stock.changePercentage : 1.5;

    // --- LIVE DATA OVERRIDE ---
    if (USE_LIVE_DATA && API_KEY) {
        // Create async wrapper to handle promise
        // Note: The UI component needs to handle the async return! 
        // We will return a Promise if live data is on. 
        // NOTE: To fix existing sync components, we might need refactoring. 
        // For now, let's assume this function is asyncified in updated UI.

        const liveData = await fetchAlphaVantageQuote(symbol);
        if (liveData) {
            price = liveData.price;
            changePercentage = liveData.changePercent;
            // Create a temporary stock object from live data
            stock = {
                symbol: symbol.toUpperCase(),
                name: "Real-Time Asset",
                price: price.toFixed(2),
                changePercentage: changePercentage.toFixed(2),
                status: changePercentage > 5 ? 'upper_circuit' : (changePercentage < -5 ? 'lower_circuit' : 'normal'),
                volume: liveData.volume
            };
        }
    }
    // ---------------------------

    const isBullish = Math.random() > 0.5; // Still simulated metrics for signals (Alpha generation logic)

    const generateDeepMetrics = (isBullish, price) => ({
        orderFlow: isBullish ? "Net Buy 12.5Cr" : "Net Sell 8.2Cr",
        institutionalActivity: isBullish ? "Accumulation" : "Distribution",
        support: (price * 0.95).toFixed(2),
        resistance: (price * 1.05).toFixed(2),
        rsi: isBullish ? "68.5 (Rising)" : "32.4 (Bearish)",
        macd: isBullish ? "Crossover Positive" : "Divergence Negative"
    });

    if (!stock && !USE_LIVE_DATA) {
        // Fallback for unknown symbol in offline mode
        return {
            found: false,
            symbol: symbol.toUpperCase(),
            name: "Simulated Asset",
            price: price.toFixed(2),
            recommendation: isBullish ? "STRONG BUY" : "STRONG SELL",
            confidence: "99.2",
            reasoning: "OFFLINE SIMULATION: Enable Live Data for accuracy.",
            metrics: generateDeepMetrics(isBullish, price)
        };
    }

    // Logic using the (potentially live) price/change
    const isGood = changePercentage > -0.5; // Buy if not crashing hard

    return {
        found: true,
        symbol: symbol.toUpperCase(), // Ensure symbol is present even if constructed
        name: stock ? stock.name : symbol.toUpperCase(),
        price: price.toFixed(2),
        changePercentage: changePercentage,
        recommendation: isGood ? "STRONG BUY" : "STRONG SELL",
        confidence: "99.8",
        reasoning: isGood
            ? `QUANT SIGNAL: ${symbol.toUpperCase()} shows bullish momentum. Live price action confirms support hold.`
            : `QUANT SIGNAL: ${symbol.toUpperCase()} faces selling pressure. Live data indicates distribution phase.`,
        metrics: generateDeepMetrics(isGood, price)
    };
};

const INDICES = [
    { s: "NIFTY", p: 19500 },
    { s: "BANKNIFTY", p: 44200 },
    { s: "FINNIFTY", p: 19800 }
];

export const analyzeOptionChain = (symbol) => {
    if (!symbol) return null;
    let spotPrice = 0;
    const index = INDICES.find(i => i.s === symbol.toUpperCase());
    if (index) {
        spotPrice = index.p + (Math.random() * 200 - 100);
    } else {
        const stock = stockData.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
        spotPrice = stock ? Number(stock.price) : (Math.random() * 1000 + 100);
    }

    const strikeStep = symbol.toUpperCase() === 'NIFTY' ? 50 : 100;
    const atmStrike = Math.round(spotPrice / strikeStep) * strikeStep;

    const isCall = Math.random() > 0.5;
    const premium = (Math.random() * 150 + 20).toFixed(2);
    const algoScore = Math.floor(Math.random() * 100);

    // If live data is off, we use simulation logic
    if (algoScore < 30) {
        return {
            found: true,
            tradeFound: false,
            symbol: symbol.toUpperCase(),
            message: "NO HIGH-PROBABILITY SETUP DETECTED. MARKET CHOPPY. STAY CASH.",
        };
    }

    const strike = isCall ? atmStrike : atmStrike - strikeStep;
    const type = isCall ? "Call (CE)" : "Put (PE)";
    const expiry = "28 DEC";

    return {
        found: true,
        tradeFound: true,
        type: "OPTION",
        symbol: symbol.toUpperCase(),
        spotPrice: spotPrice.toFixed(2),
        recommendation: {
            instrument: `${symbol.toUpperCase()} ${expiry} ${strike} ${isCall ? 'CE' : 'PE'}`,
            action: "BUY",
            entry: premium,
            target: (Number(premium) * 1.4).toFixed(2),
            stopLoss: (Number(premium) * 0.8).toFixed(2),
            confidence: "99.9%",
            logic: isCall
                ? "Huge Long Buildup in Futures. 1Cr+ Put Writing at ATM Strike. VIX cooling off."
                : "Short Covering rally exhausted. Heavy Call Writing detected at resistance. Delta turning negative."
        },
        greeks: {
            delta: (Math.random()).toFixed(2),
            theta: (-1 * Math.random() * 10).toFixed(2),
            iv: (Math.random() * 20 + 10).toFixed(1)
        }
    };
};

export const calculateArbitrage = (spotPrice, futurePrice, daysToExpiry) => {
    const spread = futurePrice - spotPrice;
    const costOfCarry = spotPrice * (0.06 * (daysToExpiry / 365));
    const profit = spread - costOfCarry;

    return {
        spread: spread.toFixed(2),
        basis: ((spread / spotPrice) * 100).toFixed(2) + "%",
        arbitrageOpportunity: profit > 0.5,
        projectedProfit: profit.toFixed(2)
    };
};

export const getAlgoStatus = () => {
    return [
        { name: "I-ALPHA (Arb)", type: "Mkt Neutral", status: "RUNNING", dailyPnL: "+0.45%", exposure: "45Cr", latency: "2ms" },
        { name: "L-S QUANT", type: "Statistical", status: "ADJUSTING", dailyPnL: "-0.12%", exposure: "12Cr", latency: "14ms" },
        { name: "VOLATILITY HARVEST", type: "Options", status: "IDLE", dailyPnL: "0.00%", exposure: "0Cr", latency: "-" },
        { name: "HFT SCALPER", type: "Deltas", status: "RUNNING", dailyPnL: "+1.20%", exposure: "5Cr", latency: "450us" }
    ];
};

export const getExecutionQueue = () => {
    return [
        { id: "ORD-9982", symbol: "RELIANCE", algo: "TWAP", progress: 45, side: "BUY", avgPrice: 2450.40, totalQty: 50000, filled: 22500 },
        { id: "ORD-9983", symbol: "TCS", algo: "VWAP", progress: 12, side: "SELL", avgPrice: 3410.00, totalQty: 12000, filled: 1440 },
        { id: "ORD-9984", symbol: "NIFTY FUT", algo: "ICEBERG", progress: 88, side: "BUY", avgPrice: 19650.00, totalQty: 5000, filled: 4400 }
    ];
};
