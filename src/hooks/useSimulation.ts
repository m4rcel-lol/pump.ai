import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export type AIPersonality = 'degen' | 'whale' | 'analytical' | 'troll';

export interface AI {
  id: string;
  name: string;
  avatar: string;
  balance: number; // in Meowney
  portfolio: Record<string, number>; // coinId -> amount
  personality: AIPersonality;
  totalProfit: number;
}

export interface Memecoin {
  id: string;
  ticker: string;
  name: string;
  creatorId: string;
  price: number;
  marketCap: number;
  supply: number;
  poolMeowney: number;
  poolTokens: number;
  image: string;
  description: string;
  createdAt: number;
  volume: number;
  replies: number;
}

export type ActivityType = 'create' | 'buy' | 'sell' | 'chat' | 'burn' | 'event';

export interface Activity {
  id: string;
  timestamp: number;
  type: ActivityType;
  aiId: string; // 'system' for global events
  coinId?: string;
  amount?: number; // amount of Meowney or Coin
  message?: string;
}

export interface GlobalEvent {
  id: string;
  title: string;
  description: string;
  impactMultiplier: number; // e.g., 1.5 for positive, 0.5 for negative
  duration: number; // ticks
}

const GLOBAL_EVENTS: Omit<GlobalEvent, 'id' | 'duration'>[] = [
  { title: 'Elon Musk Tweet', description: 'Elon just tweeted a meme! Market is pumping.', impactMultiplier: 1.5 },
  { title: 'SEC Investigation', description: 'Rumors of an SEC probe into memecoins. Panic selling ensues.', impactMultiplier: 0.5 },
  { title: 'Market Crash', description: 'Macroeconomic factors cause a sudden market-wide crash.', impactMultiplier: 0.3 },
  { title: 'Exchange Listing', description: 'Major tier 1 exchange announces support for top memecoins.', impactMultiplier: 1.8 },
  { title: 'Whale Accumulation', description: 'On-chain data shows massive whale accumulation across the board.', impactMultiplier: 1.3 },
  { title: 'Regulatory Clarity', description: 'New favorable regulations announced for digital assets.', impactMultiplier: 1.4 },
  { title: 'Network Congestion', description: 'High gas fees and failed transactions slow down trading.', impactMultiplier: 0.8 },
];

const AI_NAMES = ["BasedBot", "DegenGPT", "WhaleWatcher", "ChadAI", "PepeMaxi", "SolanaSniper", "MoonBoy", "FudDestroyer", "AlphaSeeker", "WojakBot", "GigaChad", "SmolBrain"];
const COIN_PREFIXES = ["Doge", "Shiba", "Pepe", "Floki", "Bonk", "Wif", "Myro", "Slerf", "Bome", "Popcat", "Mog", "Toshi", "Brett", "Andy", "Wolf", "Cat", "Dog", "Frog", "Bird", "Fish", "Cum", "Safe", "Moon", "Elon", "Trump", "Biden", "Gensler", "SBF", "CZ"];
const COIN_SUFFIXES = ["Inu", "Coin", "Token", "AI", "Safe", "Moon", "Mars", "Elon", "Cum", "Doge", "Cat", "Frog", "GPT", "Bot", "Sniper", "Swap", "Fi", "Dao", "Punks", "Apes"];

const CHAT_MESSAGES = {
  degen: ["LFG!!!", "Apeing in rn", "Send it higher", "We are so early", "WAGMI", "Buying the dip!", "To the moon 🚀", "Diamond hands 💎🙌", "Paper hands getting shaken out", "This is the next 100x"],
  whale: ["Accumulating silently...", "Sweeping the floor", "Nice liquidity, I'll take it", "Market looks weak, time to buy", "Just dropped 100 Meowney on this", "Don't make me dump", "Controlling the supply", "Whale games 🐋"],
  analytical: ["Chart looks bullish", "RSI is oversold", "Breaking resistance", "Volume is increasing", "Tokenomics are solid", "Dev is based", "Liquidity locked", "Checking the contract...", "Market cap is still low", "Good entry point"],
  troll: ["Rug pull incoming", "Dev sold", "It's going to zero", "Have fun staying poor", "Imagine buying this", "Top signal", "I just dumped on you", "Scam coin", "Cope", "Seethe"]
};

const generateId = () => Math.random().toString(36).substring(2, 9);

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const getCookie = (name: string) => {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

const STORAGE_KEY = 'pump_sim_state';
const ACTIVE_KEY = 'pump_sim_active';

const generateCoinName = (existingCoins: Record<string, Memecoin>) => {
  const prefix = getRandomItem(COIN_PREFIXES);
  const suffix = Math.random() > 0.5 ? getRandomItem(COIN_SUFFIXES) : '';
  let name = `${prefix}${suffix ? ' ' + suffix : ''}`;
  let ticker = (prefix.substring(0, 3) + (suffix ? suffix.substring(0, 2) : '')).toUpperCase();
  
  const existingNames = Object.values(existingCoins).map(c => c.name);
  if (existingNames.includes(name)) {
    const version = existingNames.filter(n => n.startsWith(name)).length + 1;
    name = `${name} V${version}`;
    ticker = `${ticker}${version}`;
  }
  
  return { name, ticker };
};

const INITIAL_SUPPLY = 1_000_000_000;
const INITIAL_POOL_MEOWNEY = 20.0;
const INITIAL_POOL_TOKENS = 1_000_000_000;
const INITIAL_PRICE = INITIAL_POOL_MEOWNEY / INITIAL_POOL_TOKENS;

export const useSimulation = () => {
  const initialState = useMemo(() => {
    const isActive = getCookie(ACTIVE_KEY) || localStorage.getItem(ACTIVE_KEY);
    if (!isActive) return null;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.status === 'ended') return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }, []);

  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'ended'>(initialState?.status || 'idle');
  const [ais, setAis] = useState<Record<string, AI>>(initialState?.ais || {});
  const [coins, setCoins] = useState<Record<string, Memecoin>>(initialState?.coins || {});
  const [activities, setActivities] = useState<Activity[]>(initialState?.activities || []);
  const [stats, setStats] = useState(initialState?.stats || { totalVolume: 0, totalTrades: 0, marketHealth: 1.0 });
  const [marketHealthHistory, setMarketHealthHistory] = useState<{time: string, value: number}[]>(initialState?.marketHealthHistory || []);
  const [activeEvent, setActiveEvent] = useState<GlobalEvent | null>(initialState?.activeEvent || null);

  const aisRef = useRef(ais);
  const coinsRef = useRef(coins);
  const statsRef = useRef(stats);
  const activitiesRef = useRef(activities);
  const activeEventRef = useRef(activeEvent);
  const statusRef = useRef(status);

  // Sync refs
  useEffect(() => { aisRef.current = ais; }, [ais]);
  useEffect(() => { coinsRef.current = coins; }, [coins]);
  useEffect(() => { statsRef.current = stats; }, [stats]);
  useEffect(() => { activitiesRef.current = activities; }, [activities]);
  useEffect(() => { activeEventRef.current = activeEvent; }, [activeEvent]);
  useEffect(() => { statusRef.current = status; }, [status]);

  const addActivity = useCallback((activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activity,
      id: generateId(),
      timestamp: Date.now(),
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 100)); // Keep last 100
  }, []);

  const initSimulation = useCallback(() => {
    const initialAis: Record<string, AI> = {};
    AI_NAMES.forEach((name, i) => {
      const id = `ai_${i}`;
      initialAis[id] = {
        id,
        name,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
        balance: 100 + Math.random() * 900, // 100 to 1000 Meowney
        portfolio: {},
        personality: getRandomItem(['degen', 'whale', 'analytical', 'troll'] as AIPersonality[]),
        totalProfit: 0,
      };
    });
    setAis(initialAis);
    setCoins({});
    setActivities([]);
    setStats({ totalVolume: 0, totalTrades: 0, marketHealth: 1.0 });
    setMarketHealthHistory([]);
    setActiveEvent(null);
    setStatus('running');
    
    setCookie(ACTIVE_KEY, 'true', 7);
    localStorage.setItem(ACTIVE_KEY, 'true');
  }, []);

  const saveToStorage = useCallback(() => {
    if (statusRef.current === 'idle' || statusRef.current === 'ended') return;
    const state = {
      ais: aisRef.current,
      coins: coinsRef.current,
      activities: activitiesRef.current,
      stats: statsRef.current,
      marketHealthHistory,
      activeEvent: activeEventRef.current,
      status: statusRef.current
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [marketHealthHistory]);

  useEffect(() => {
    if (status === 'running' || status === 'paused') {
      const interval = setInterval(saveToStorage, 2000); // Save every 2 seconds
      return () => clearInterval(interval);
    }
  }, [status, saveToStorage]);

  const tick = useCallback(() => {
    if (status !== 'running') return;

    const currentAis = aisRef.current;
    const currentCoins = coinsRef.current;
    const currentEvent = activeEventRef.current;
    const aiIds = Object.keys(currentAis);
    if (aiIds.length === 0) return;

    // Handle Global Events
    if (currentEvent) {
      if (currentEvent.duration <= 0) {
        setActiveEvent(null);
        addActivity({ type: 'event', aiId: 'system', message: `Event Ended: ${currentEvent.title}` });
      } else {
        setActiveEvent(prev => prev ? { ...prev, duration: prev.duration - 1 } : null);
      }
    } else if (Math.random() < 0.005) { // 0.5% chance per tick to trigger an event
      const eventTemplate = getRandomItem(GLOBAL_EVENTS);
      const newEvent: GlobalEvent = {
        ...eventTemplate,
        id: generateId(),
        duration: 20 + Math.floor(Math.random() * 30), // Lasts 20-50 ticks
      };
      setActiveEvent(newEvent);
      addActivity({ type: 'event', aiId: 'system', message: `🚨 GLOBAL EVENT: ${newEvent.title} - ${newEvent.description}` });
      
      // Apply immediate market health shock
      setStats(prev => ({
        ...prev,
        marketHealth: Math.max(0.1, Math.min(2.0, prev.marketHealth * newEvent.impactMultiplier))
      }));
    }

    const aiId = getRandomItem(aiIds);
    const ai = currentAis[aiId];
    const coinIds = Object.keys(currentCoins);

    const actionRand = Math.random();
    
    // Background market volatility for a random coin to keep charts dynamic
    if (coinIds.length > 0 && Math.random() > 0.3) {
      const randomCoinId = getRandomItem(coinIds);
      setCoins(prev => {
        const coin = prev[randomCoinId];
        if (!coin) return prev;
        
        const marketHealth = statsRef.current.marketHealth;
        const volumeRatio = coin.volume / (coin.marketCap || 1);
        let volatility = 0.005 + Math.min(0.05, volumeRatio * 2); // 0.5% to 5.5% noise
        
        const creator = currentAis[coin.creatorId];
        if (creator) {
          if (creator.personality === 'degen') volatility *= 1.5;
          if (creator.personality === 'troll') volatility *= 2.0;
        }

        // Bias direction based on market health (1.0 is neutral)
        const bias = (marketHealth - 1.0) * 0.01; 
        const change = (Math.random() - 0.5) * volatility * 2 + bias;
        
        const newPoolMeowney = Math.max(0.1, coin.poolMeowney * (1 + change));
        const newPrice = newPoolMeowney / coin.poolTokens;
        
        return {
          ...prev,
          [randomCoinId]: {
            ...coin,
            poolMeowney: newPoolMeowney,
            price: newPrice,
            marketCap: newPrice * coin.supply
          }
        };
      });
    }
    
    // 10% Create, 35% Buy, 30% Sell, 5% Burn, 20% Chat
    if (actionRand < 0.1 || coinIds.length === 0) {
      // Create Coin
      if (ai.balance < 20.42) return; // Need 20.42 Meowney to create (20 for liquidity pool, 0.42 fee)
      
      const { name, ticker } = generateCoinName(currentCoins);
      const coinId = `coin_${generateId()}`;
      const newCoin: Memecoin = {
        id: coinId,
        ticker,
        name,
        creatorId: ai.id,
        price: INITIAL_PRICE,
        marketCap: INITIAL_PRICE * INITIAL_SUPPLY,
        supply: INITIAL_SUPPLY,
        poolMeowney: INITIAL_POOL_MEOWNEY,
        poolTokens: INITIAL_POOL_TOKENS,
        image: `https://api.dicebear.com/7.x/identicon/svg?seed=${coinId}`,
        description: `${name} is the next big thing on the network. Created by ${ai.name}.`,
        createdAt: Date.now(),
        volume: 0,
        replies: 0,
      };

      setCoins(prev => ({ ...prev, [coinId]: newCoin }));
      setAis(prev => ({
        ...prev,
        [ai.id]: {
          ...ai,
          balance: ai.balance - 20.42, // Creation fee + initial liquidity
        }
      }));
      
      addActivity({ type: 'create', aiId: ai.id, coinId });
      
    } else if (actionRand < 0.45) {
      // Buy Coin
      const coinId = getRandomItem(coinIds);
      const coin = currentCoins[coinId];
      
      // Decide how much to spend (1% to 20% of balance)
      const spendPercent = 0.01 + Math.random() * 0.19;
      const spendAmount = ai.balance * spendPercent;
      
      if (spendAmount < 0.01) return;
      
      // Strict AMM Math: x * y = k
      const k = coin.poolMeowney * coin.poolTokens;
      const newPoolMeowney = coin.poolMeowney + spendAmount;
      const newPoolTokens = k / newPoolMeowney;
      const tokensBought = coin.poolTokens - newPoolTokens;
      
      const newPrice = newPoolMeowney / newPoolTokens;

      setCoins(prev => ({
        ...prev,
        [coinId]: {
          ...coin,
          poolMeowney: newPoolMeowney,
          poolTokens: newPoolTokens,
          price: newPrice,
          marketCap: newPrice * coin.supply,
          volume: coin.volume + spendAmount,
        }
      }));

      setAis(prev => ({
        ...prev,
        [ai.id]: {
          ...ai,
          balance: ai.balance - spendAmount,
          portfolio: {
            ...ai.portfolio,
            [coinId]: (ai.portfolio[coinId] || 0) + tokensBought,
          }
        }
      }));

      setStats(prev => ({ 
        ...prev, 
        totalVolume: prev.totalVolume + spendAmount, 
        totalTrades: prev.totalTrades + 1,
        marketHealth: Math.max(0.5, Math.min(1.5, prev.marketHealth + (Math.random() - 0.5) * 0.05))
      }));
      addActivity({ type: 'buy', aiId: ai.id, coinId, amount: spendAmount });

    } else if (actionRand < 0.75) {
      // Sell Coin
      const ownedCoinIds = Object.keys(ai.portfolio).filter(id => ai.portfolio[id] > 0 && currentCoins[id]);
      if (ownedCoinIds.length === 0) return;

      const coinId = getRandomItem(ownedCoinIds);
      const coin = currentCoins[coinId];
      const tokensOwned = ai.portfolio[coinId];
      
      // Decide how much to sell (10% to 100%)
      const sellPercent = 0.1 + Math.random() * 0.9;
      const tokensToSell = tokensOwned * sellPercent;
      // Strict AMM Math: x * y = k
      const k = coin.poolMeowney * coin.poolTokens;
      const newPoolTokens = coin.poolTokens + tokensToSell;
      const newPoolMeowney = k / newPoolTokens;
      const receiveAmount = coin.poolMeowney - newPoolMeowney;
      
      const newPrice = newPoolMeowney / newPoolTokens;

      setCoins(prev => ({
        ...prev,
        [coinId]: {
          ...coin,
          poolMeowney: newPoolMeowney,
          poolTokens: newPoolTokens,
          price: newPrice,
          marketCap: newPrice * coin.supply,
          volume: coin.volume + receiveAmount,
        }
      }));

      setAis(prev => ({
        ...prev,
        [ai.id]: {
          ...ai,
          balance: ai.balance + receiveAmount,
          totalProfit: ai.totalProfit + receiveAmount, // Simplified profit tracking
          portfolio: {
            ...ai.portfolio,
            [coinId]: tokensOwned - tokensToSell,
          }
        }
      }));

      setStats(prev => ({ 
        ...prev, 
        totalVolume: prev.totalVolume + receiveAmount, 
        totalTrades: prev.totalTrades + 1,
        marketHealth: Math.max(0.5, Math.min(1.5, prev.marketHealth + (Math.random() - 0.5) * 0.05))
      }));
      addActivity({ type: 'sell', aiId: ai.id, coinId, amount: receiveAmount });

    } else if (actionRand < 0.80) {
      // Burn Coin
      const ownedCoinIds = Object.keys(ai.portfolio).filter(id => ai.portfolio[id] > 0 && currentCoins[id]);
      if (ownedCoinIds.length === 0) return;

      const coinId = getRandomItem(ownedCoinIds);
      const coin = currentCoins[coinId];
      const tokensOwned = ai.portfolio[coinId];
      
      // Burn 10% to 50% of their holdings
      const burnPercent = 0.1 + Math.random() * 0.4;
      const tokensToBurn = tokensOwned * burnPercent;
      
      // Burning reduces supply
      const newSupply = Math.max(1, coin.supply - tokensToBurn);
      const burnRatio = tokensToBurn / coin.supply;
      
      // Hype pump: Simulating external buyers adding Meowney to the pool due to burn hype
      const hypeMultiplier = 1 + (burnRatio * 2); // Burning 1% of supply = 2% pump in virtual liquidity
      const newPoolMeowney = coin.poolMeowney * hypeMultiplier;
      
      const newPrice = newPoolMeowney / coin.poolTokens;

      setCoins(prev => ({
        ...prev,
        [coinId]: {
          ...coin,
          supply: newSupply,
          poolMeowney: newPoolMeowney,
          price: newPrice,
          marketCap: newPrice * newSupply,
        }
      }));

      setAis(prev => ({
        ...prev,
        [ai.id]: {
          ...ai,
          portfolio: {
            ...ai.portfolio,
            [coinId]: tokensOwned - tokensToBurn,
          }
        }
      }));

      addActivity({ type: 'burn', aiId: ai.id, coinId, amount: tokensToBurn });

    } else {
      // Chat
      const coinId = coinIds.length > 0 ? getRandomItem(coinIds) : undefined;
      const message = getRandomItem(CHAT_MESSAGES[ai.personality]);
      
      if (coinId) {
        setCoins(prev => ({
          ...prev,
          [coinId]: {
            ...currentCoins[coinId],
            replies: currentCoins[coinId].replies + 1
          }
        }));
      }

      addActivity({ type: 'chat', aiId: ai.id, coinId, message });
    }
  }, [status, addActivity]);

  useEffect(() => {
    if (status === 'running') {
      // Run tick every 500ms to 1500ms
      const interval = setInterval(() => {
        tick();
      }, 800);
      return () => clearInterval(interval);
    }
  }, [status, tick]);

  useEffect(() => {
    if (status === 'running') {
      const interval = setInterval(() => {
        setMarketHealthHistory(prev => {
          const now = new Date();
          const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
          const newHistory = [...prev, { time, value: statsRef.current.marketHealth }];
          return newHistory.slice(-60); // Keep last 60 seconds
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const start = useCallback(() => {
    if (status === 'idle') {
      initSimulation();
    } else {
      setStatus('running');
    }
  }, [status, initSimulation]);

  const pause = useCallback(() => setStatus('paused'), []);
  const end = useCallback(() => {
    setStatus('ended');
    deleteCookie(ACTIVE_KEY);
    localStorage.removeItem(ACTIVE_KEY);
    localStorage.removeItem(STORAGE_KEY);
  }, []);
  const restart = useCallback(() => {
    initSimulation();
  }, [initSimulation]);
  const clear = useCallback(() => {
    setStatus('idle');
    deleteCookie(ACTIVE_KEY);
    localStorage.removeItem(ACTIVE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    setAis({});
    setCoins({});
    setActivities([]);
    setStats({ totalVolume: 0, totalTrades: 0, marketHealth: 1.0 });
    setMarketHealthHistory([]);
    setActiveEvent(null);
  }, []);

  return {
    status,
    ais,
    coins,
    activities,
    stats,
    marketHealthHistory,
    activeEvent,
    start,
    pause,
    end,
    restart,
    clear,
    isRecovered: !!(getCookie(ACTIVE_KEY) || localStorage.getItem(ACTIVE_KEY))
  };
};
