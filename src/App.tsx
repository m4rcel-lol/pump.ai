import { useState, useMemo, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, TrendingUp, MessageSquare, Activity as ActivityIcon, Coins, Trophy, DollarSign, Users, BarChart3, Zap, Cpu, Terminal, Eye, X, Wallet, ArrowRight, Flame, Search, ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSimulation, Memecoin, AI, Activity, GlobalEvent } from './hooks/useSimulation';

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

function formatMeowney(value: number) {
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}k Meowney`;
  return `${value.toFixed(2)} Meowney`;
}

function timeAgo(timestamp: number) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
}

function AnimatedValue({ value, formatter }: { value: number, formatter: (v: number) => string }) {
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value > prevValue.current) setFlash('up');
    else if (value < prevValue.current) setFlash('down');
    prevValue.current = value;
    
    const timer = setTimeout(() => setFlash(null), 500);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <span className={`transition-colors duration-500 ${flash === 'up' ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : flash === 'down' ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]' : ''}`}>
      {formatter(value)}
    </span>
  );
}

type Tab = 'terminal' | 'agents' | 'market';
type Inspection = { type: 'ai' | 'coin', id: string } | null;

export default function App() {
  const { status, ais, coins, activities, stats, marketHealthHistory, activeEvent, start, pause, end, restart } = useSimulation();
  const [activeTab, setActiveTab] = useState<Tab>('terminal');
  const [inspection, setInspection] = useState<Inspection>(null);

  useEffect(() => {
    if (status === 'idle') {
      start();
    }
  }, [status, start]);

  const { richestAI, topCoin } = useMemo(() => {
    if (status !== 'ended') return { richestAI: null, topCoin: null };
    
    const aiList = Object.values(ais) as AI[];
    const richest = aiList.length > 0 ? aiList.reduce((prev, current) => (prev.balance > current.balance) ? prev : current) : null;
    
    const coinList = Object.values(coins) as Memecoin[];
    const top = coinList.length > 0 ? coinList.reduce((prev, current) => (prev.marketCap > current.marketCap) ? prev : current) : null;

    return { richestAI: richest, topCoin: top };
  }, [status, ais, coins]);

  const theme = useMemo(() => {
    if (stats.marketHealth > 1.2) {
      return {
        selection: 'selection:bg-green-400/40',
        gradientTop: 'from-green-500/20',
        glowBlob: 'bg-green-400/20',
        logoBg: 'from-green-400 to-emerald-500',
        logoShadow: 'shadow-[0_0_25px_rgba(52,211,153,0.6)]',
        textGlow: 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]'
      };
    } else if (stats.marketHealth < 0.8) {
      return {
        selection: 'selection:bg-red-500/30',
        gradientTop: 'from-red-900/20',
        glowBlob: 'bg-red-500/10',
        logoBg: 'from-red-500 to-rose-700',
        logoShadow: 'shadow-[0_0_15px_rgba(225,29,72,0.4)]',
        textGlow: 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]'
      };
    } else {
      return {
        selection: 'selection:bg-green-500/30',
        gradientTop: 'from-green-900/10',
        glowBlob: 'bg-green-500/10',
        logoBg: 'from-green-400 to-emerald-600',
        logoShadow: 'shadow-[0_0_15px_rgba(52,211,153,0.4)]',
        textGlow: 'text-glow'
      };
    }
  }, [stats.marketHealth]);

  return (
    <div className={`min-h-screen bg-[#050505] text-gray-100 font-sans ${theme.selection} relative overflow-hidden transition-colors duration-1000`}>
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradientTop} via-transparent to-transparent transition-colors duration-1000`} />
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] ${theme.glowBlob} blur-[120px] rounded-full transition-colors duration-1000`} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 glass-panel border-b border-gray-800/50 px-4 py-3 transition-colors duration-1000">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${theme.logoBg} flex items-center justify-center ${theme.logoShadow} transition-all duration-1000`}>
                <TrendingUp className="w-5 h-5 text-black" />
              </div>
              <h1 className={`text-xl font-bold tracking-tight ${theme.textGlow} transition-all duration-1000`}>pump.ai</h1>
            </div>

            <nav className="hidden sm:flex items-center gap-1 bg-gray-900/50 p-1 rounded-lg border border-gray-800/50">
              <button onClick={() => setActiveTab('terminal')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'terminal' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}>
                <Terminal className="w-4 h-4" /> Terminal
              </button>
              <button onClick={() => setActiveTab('agents')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'agents' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}>
                <Users className="w-4 h-4" /> Agents
              </button>
              <button onClick={() => setActiveTab('market')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'market' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}>
                <BarChart3 className="w-4 h-4" /> Market
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-6 text-sm">
            {activeEvent && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-900/30 border border-red-500/50 text-red-400 text-xs font-bold animate-pulse">
                <ActivityIcon className="w-4 h-4" />
                <span>{activeEvent.title}</span>
              </div>
            )}
            <div className="flex flex-col items-end sm:items-start group relative">
              <span className="text-gray-500 text-xs uppercase tracking-wider cursor-help border-b border-dashed border-gray-600">Vol</span>
              <span className="font-mono font-medium"><AnimatedValue value={stats.totalVolume} formatter={formatMeowney} /></span>
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-gray-800 text-gray-200 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-gray-700 text-center">
                Total trading volume across all memecoins in the simulation.
              </div>
            </div>
            <div className="flex flex-col items-end sm:items-start group relative">
              <span className="text-gray-500 text-xs uppercase tracking-wider cursor-help border-b border-dashed border-gray-600">Trades</span>
              <span className="font-mono font-medium"><AnimatedValue value={stats.totalTrades} formatter={(v) => v.toString()} /></span>
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-gray-800 text-gray-200 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-gray-700 text-center">
                Total number of buy and sell transactions executed by AI agents.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {status === 'idle' && (
              <button onClick={start} className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:-translate-y-0.5">
                <Play className="w-4 h-4 fill-current" /> Start
              </button>
            )}
            {status === 'running' && (
              <button onClick={pause} className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:-translate-y-0.5">
                <Pause className="w-4 h-4 fill-current" /> Pause
              </button>
            )}
            {status === 'paused' && (
              <button onClick={start} className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:-translate-y-0.5">
                <Play className="w-4 h-4 fill-current" /> Resume
              </button>
            )}
            {(status === 'running' || status === 'paused') && (
              <button onClick={end} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-400 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:-translate-y-0.5">
                <Square className="w-4 h-4 fill-current" /> End
              </button>
            )}
            {status === 'ended' && (
              <button onClick={restart} className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:-translate-y-0.5">
                <RotateCcw className="w-4 h-4" /> Restart
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto p-4 min-h-[calc(100vh-5rem)]">
        <AnimatePresence mode="wait">
          {activeTab === 'terminal' && <TerminalView key="terminal" coins={coins} ais={ais} activities={activities} status={status} onInspect={setInspection} />}
          {activeTab === 'agents' && <AgentsView key="agents" ais={ais} onInspect={setInspection} />}
          {activeTab === 'market' && <MarketView key="market" coins={coins} ais={ais} marketHealthHistory={marketHealthHistory} activeEvent={activeEvent} onInspect={setInspection} />}
        </AnimatePresence>
      </main>

      {/* Inspectors */}
      <AnimatePresence>
        {inspection?.type === 'ai' && ais[inspection.id] && (
          <AgentInspector key="agent-inspector" ai={ais[inspection.id]} coins={coins} onClose={() => setInspection(null)} onInspect={setInspection} />
        )}
        {inspection?.type === 'coin' && coins[inspection.id] && (
          <CoinInspector key="coin-inspector" coin={coins[inspection.id]} ais={ais} onClose={() => setInspection(null)} onInspect={setInspection} />
        )}
      </AnimatePresence>

      {/* End Summary Modal */}
      <AnimatePresence>
        {status === 'ended' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-panel border border-gray-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-[0_0_50px_rgba(34,197,94,0.15)]"
            >
              <div className="p-6 text-center border-b border-gray-800/50 bg-gradient-to-b from-green-900/20 to-transparent">
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                  <Trophy className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 text-glow">Simulation Ended</h2>
                <p className="text-gray-400">Here are the final results of the AI trading frenzy.</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Top Coin */}
                {topCoin && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Most Valuable Coin
                    </h3>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                      <img src={topCoin.image} alt={topCoin.name} className="w-12 h-12 rounded-lg bg-gray-950" />
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{topCoin.name} <span className="text-sm font-mono text-gray-400">${topCoin.ticker}</span></h4>
                        <p className="text-green-400 font-medium">{formatCurrency(topCoin.marketCap)} MCap</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Richest AI */}
                {richestAI && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" /> Richest AI
                    </h3>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                      <img src={richestAI.avatar} alt={richestAI.name} className="w-12 h-12 rounded-full bg-gray-950" />
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{richestAI.name}</h4>
                        <p className="text-yellow-400 font-medium">{formatMeowney(richestAI.balance)}</p>
                      </div>
                      <div className="text-right text-sm">
                        <span className="px-2 py-1 rounded-md bg-gray-800 border border-gray-700 text-gray-300 capitalize">
                          {richestAI.personality}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Global Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 text-center">
                    <p className="text-gray-500 text-sm mb-1 uppercase tracking-wider">Total Volume</p>
                    <p className="text-xl font-mono font-bold text-white">{formatMeowney(stats.totalVolume)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 text-center">
                    <p className="text-gray-500 text-sm mb-1 uppercase tracking-wider">Total Trades</p>
                    <p className="text-xl font-mono font-bold text-white">{stats.totalTrades}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-800/50 bg-black/40">
                <button
                  onClick={restart}
                  className="w-full py-3 bg-white hover:bg-gray-200 text-black font-bold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" /> Start New Simulation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Views ---

function TerminalView({ coins, ais, activities, status, onInspect }: { key?: string, coins: Record<string, Memecoin>, ais: Record<string, AI>, activities: Activity[], status: string, onInspect: (i: Inspection) => void }) {
  const sortedCoins = useMemo(() => (Object.values(coins) as Memecoin[]).sort((a, b) => b.marketCap - a.marketCap), [coins]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-glow">
            <Zap className="w-5 h-5 text-yellow-400" /> Live Trending
          </h2>
        </div>
        
        {status === 'idle' ? (
          <div className="h-64 glass-panel rounded-xl flex flex-col items-center justify-center text-gray-500">
            <Cpu className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-mono tracking-widest">SYSTEM IDLE. AWAITING START COMMAND.</p>
          </div>
        ) : sortedCoins.length === 0 ? (
          <div className="h-64 glass-panel rounded-xl flex flex-col items-center justify-center text-gray-500">
            <ActivityIcon className="w-8 h-8 mb-4 opacity-50 animate-pulse" />
            <p className="font-mono tracking-widest">INITIALIZING AGENTS...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {sortedCoins.slice(0, 12).map((coin, idx) => (
                <motion.div
                  key={coin.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => onInspect({ type: 'coin', id: coin.id })}
                  className={`glass-panel rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] cursor-pointer group ${idx === 0 ? 'ring-1 ring-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border border-gray-800/50 hover:border-gray-700'}`}
                >
                  <div className="flex gap-4">
                    <div className="relative">
                      <img src={coin.image} alt={coin.name} className="w-16 h-16 rounded-lg bg-gray-900 object-cover" />
                      {idx === 0 && <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black shadow-lg shadow-yellow-500/20"><Trophy className="w-3 h-3" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-gray-100 truncate group-hover:text-green-400 transition-colors">{coin.name}</h3>
                          <p className="text-sm text-gray-500 font-mono">${coin.ticker}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium"><AnimatedValue value={coin.marketCap} formatter={formatCurrency} /></p>
                          <p className="text-xs text-gray-500">MCap</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                        {coin.description}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> {coin.replies}
                          </span>
                          <span 
                            className="truncate hover:text-gray-300 transition-colors"
                            onClick={(e) => { e.stopPropagation(); onInspect({ type: 'ai', id: coin.creatorId }); }}
                          >
                            By {ais[coin.creatorId]?.name || 'Unknown'}
                          </span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onInspect({ type: 'coin', id: coin.id }); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white bg-gray-800 px-2 py-1.5 rounded-md flex items-center gap-1 text-xs font-medium"
                        >
                          <Eye className="w-3 h-3" /> Inspect
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="glass-panel rounded-xl flex flex-col h-[calc(100vh-8rem)] sticky top-24 overflow-hidden">
        <div className="p-4 border-b border-gray-800/50 bg-gray-900/30">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <div className="relative flex h-3 w-3">
              {status === 'running' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${status === 'running' ? 'bg-green-500' : 'bg-gray-600'}`}></span>
            </div>
            Live Feed
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          <AnimatePresence initial={false}>
            {activities.map((activity) => {
              if (activity.type === 'event') {
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    className="flex gap-3 text-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-900/50 shrink-0 border border-red-500/50 flex items-center justify-center text-red-400">
                      <ActivityIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 bg-red-900/20 p-2.5 rounded-lg border border-red-500/30">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-bold text-red-400 uppercase tracking-wider text-xs">System Alert</span>
                        <span className="text-xs text-red-500/70">{timeAgo(activity.timestamp)}</span>
                      </div>
                      <p className="text-red-200 font-medium">{activity.message}</p>
                    </div>
                  </motion.div>
                );
              }

              const ai = ais[activity.aiId];
              const coin = activity.coinId ? coins[activity.coinId] : null;
              if (!ai) return null;

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  className="flex gap-3 text-sm"
                >
                  <img 
                    src={ai.avatar} 
                    alt={ai.name} 
                    className="w-8 h-8 rounded-full bg-gray-900 shrink-0 border border-gray-800 cursor-pointer hover:border-gray-600 transition-colors" 
                    onClick={() => onInspect({ type: 'ai', id: ai.id })}
                  />
                  <div className="flex-1 min-w-0 bg-gray-800/30 p-2.5 rounded-lg border border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span 
                        className="font-semibold text-gray-200 cursor-pointer hover:text-white hover:underline"
                        onClick={() => onInspect({ type: 'ai', id: ai.id })}
                      >
                        {ai.name}
                      </span>
                      <span className="text-xs text-gray-500">{timeAgo(activity.timestamp)}</span>
                    </div>
                    
                    {activity.type === 'create' && coin && (
                      <p className="text-gray-400">
                        Deployed <span className="text-green-400 font-medium cursor-pointer hover:underline" onClick={() => onInspect({ type: 'coin', id: coin.id })}>${coin.ticker}</span>
                      </p>
                    )}
                    
                    {activity.type === 'buy' && coin && (
                      <p className="text-gray-400">
                        Bought <span className="text-green-400 font-medium">{formatMeowney(activity.amount || 0)}</span> of <span className="text-gray-300 cursor-pointer hover:underline" onClick={() => onInspect({ type: 'coin', id: coin.id })}>${coin.ticker}</span>
                      </p>
                    )}
                    
                    {activity.type === 'sell' && coin && (
                      <p className="text-gray-400">
                        Sold <span className="text-red-400 font-medium">{formatMeowney(activity.amount || 0)}</span> of <span className="text-gray-300 cursor-pointer hover:underline" onClick={() => onInspect({ type: 'coin', id: coin.id })}>${coin.ticker}</span>
                      </p>
                    )}

                    {activity.type === 'burn' && coin && (
                      <p className="text-gray-400 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-500" /> Burned <span className="text-orange-400 font-medium">{(activity.amount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> tokens of <span className="text-gray-300 cursor-pointer hover:underline" onClick={() => onInspect({ type: 'coin', id: coin.id })}>${coin.ticker}</span>
                      </p>
                    )}

                    {activity.type === 'chat' && (
                      <div className="text-gray-300 italic">
                        "{activity.message}"
                        {coin && <span className="text-blue-400 ml-1 not-italic cursor-pointer hover:underline" onClick={() => onInspect({ type: 'coin', id: coin.id })}>#${coin.ticker}</span>}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {activities.length === 0 && status !== 'idle' && (
            <div className="text-center text-gray-500 mt-10 font-mono text-sm">Waiting for network activity...</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function AgentsView({ ais, onInspect }: { key?: string, ais: Record<string, AI>, onInspect: (i: Inspection) => void }) {
  const sortedAis = useMemo(() => (Object.values(ais) as AI[]).sort((a, b) => b.balance - a.balance), [ais]);
  
  if (sortedAis.length === 0) {
    return (
      <div className="h-64 glass-panel rounded-xl flex flex-col items-center justify-center text-gray-500">
        <Users className="w-12 h-12 mb-4 opacity-20" />
        <p className="font-mono tracking-widest">NO AGENTS ACTIVE.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sortedAis.map((ai, index) => (
        <motion.div 
          key={ai.id} 
          layout 
          onClick={() => onInspect({ type: 'ai', id: ai.id })}
          className="glass-panel rounded-xl p-5 relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(34,197,94,0.1)] transition-all duration-300 cursor-pointer"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <button 
            onClick={(e) => { e.stopPropagation(); onInspect({ type: 'ai', id: ai.id }); }}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white bg-gray-800 px-2 py-1.5 rounded-md flex items-center gap-1 text-xs font-medium z-10"
          >
            <Eye className="w-3 h-3" /> Inspect Profile
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <img src={ai.avatar} alt={ai.name} className="w-12 h-12 rounded-full bg-gray-900 border border-gray-700" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center text-xs font-bold border border-gray-700 shadow-sm">
                {index + 1}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-100 group-hover:text-green-400 transition-colors">{ai.name}</h3>
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border ${
                ai.personality === 'degen' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                ai.personality === 'whale' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                ai.personality === 'analytical' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {ai.personality}
              </span>
            </div>
          </div>
          <div className="space-y-3 pt-3 border-t border-gray-800/50">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Balance</span>
              <span className="font-mono font-medium text-green-400"><AnimatedValue value={ai.balance} formatter={formatMeowney} /></span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Portfolio Size</span>
              <span className="font-mono text-gray-300">{Object.keys(ai.portfolio).length} coins</span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

type SortColumn = 'marketCap' | 'price' | 'volume' | 'age';
type SortDirection = 'asc' | 'desc';

function MarketView({ coins, ais, marketHealthHistory, activeEvent, onInspect }: { key?: string, coins: Record<string, Memecoin>, ais: Record<string, AI>, marketHealthHistory: {time: string, value: number}[], activeEvent: GlobalEvent | null, onInspect: (i: Inspection) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('marketCap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedAndFilteredCoins = useMemo(() => {
    let result = Object.values(coins) as Memecoin[];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(coin => 
        coin.name.toLowerCase().includes(query) || 
        coin.ticker.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      let valA, valB;
      switch (sortColumn) {
        case 'marketCap':
          valA = a.marketCap;
          valB = b.marketCap;
          break;
        case 'price':
          valA = a.price;
          valB = b.price;
          break;
        case 'volume':
          valA = a.volume;
          valB = b.volume;
          break;
        case 'age':
          valA = a.createdAt;
          valB = b.createdAt;
          break;
        default:
          valA = a.marketCap;
          valB = b.marketCap;
      }
      
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [coins, searchQuery, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40 group-hover:opacity-100 transition-opacity" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 ml-1 text-green-400" /> : <ArrowDown className="w-3 h-3 ml-1 text-green-400" />;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      {/* Market Health Chart */}
      <div className="glass-panel rounded-xl p-6 border border-gray-800/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-glow">
              <ActivityIcon className="w-5 h-5 text-blue-400" /> Market Health Trend
            </h2>
            {activeEvent && (
              <div className="px-3 py-1 rounded-full bg-red-900/30 border border-red-500/50 text-red-400 text-xs font-bold flex items-center gap-2 animate-pulse">
                <ActivityIcon className="w-3 h-3" />
                {activeEvent.title}
              </div>
            )}
          </div>
          <div className="text-sm font-mono text-gray-400">
            Current: <span className={marketHealthHistory.length > 0 && marketHealthHistory[marketHealthHistory.length - 1].value > 1.0 ? 'text-green-400' : 'text-red-400'}>
              {marketHealthHistory.length > 0 ? marketHealthHistory[marketHealthHistory.length - 1].value.toFixed(2) : '1.00'}
            </span>
          </div>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={marketHealthHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#6B7280" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                minTickGap={30}
              />
              <YAxis 
                stroke="#6B7280" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                domain={[0.5, 1.5]}
                tickFormatter={(value) => value.toFixed(1)}
                width={40}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#60A5FA' }}
                formatter={(value: number) => [value.toFixed(3), 'Health']}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#60A5FA" 
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 4, fill: '#60A5FA', stroke: '#111827', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800/50 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search coins by name or ticker..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all placeholder:text-gray-600"
            />
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-900/50 text-gray-400 border-b border-gray-800/50">
            <tr>
              <th className="px-6 py-4 font-medium">Coin</th>
              <th className="px-6 py-4 font-medium cursor-pointer group select-none" onClick={() => handleSort('price')}>
                <div className="flex items-center">Price <SortIcon column="price" /></div>
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer group select-none" onClick={() => handleSort('marketCap')}>
                <div className="flex items-center">Market Cap <SortIcon column="marketCap" /></div>
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer group select-none" onClick={() => handleSort('volume')}>
                <div className="flex items-center">Volume <SortIcon column="volume" /></div>
              </th>
              <th className="px-6 py-4 font-medium">Creator</th>
              <th className="px-6 py-4 font-medium cursor-pointer group select-none" onClick={() => handleSort('age')}>
                <div className="flex items-center">Age <SortIcon column="age" /></div>
              </th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            <AnimatePresence>
              {sortedAndFilteredCoins.map((coin) => (
                <motion.tr 
                  layout 
                  key={coin.id} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  className="hover:bg-gray-800/30 transition-colors group cursor-pointer"
                  onClick={() => onInspect({ type: 'coin', id: coin.id })}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-md bg-gray-900 border border-gray-800" />
                      <div>
                        <div className="font-bold text-gray-200 group-hover:text-green-400 transition-colors">{coin.name}</div>
                        <div className="text-xs text-gray-500 font-mono">${coin.ticker}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-300"><AnimatedValue value={coin.price} formatter={(v) => v.toFixed(8) + ' Meowney'} /></td>
                  <td className="px-6 py-4 font-mono text-green-400"><AnimatedValue value={coin.marketCap} formatter={formatCurrency} /></td>
                  <td className="px-6 py-4 font-mono text-gray-400"><AnimatedValue value={coin.volume} formatter={formatMeowney} /></td>
                  <td className="px-6 py-4">
                    <div 
                      className="flex items-center gap-2 hover:bg-gray-800 p-1 -ml-1 rounded-md transition-colors w-max"
                      onClick={(e) => { e.stopPropagation(); onInspect({ type: 'ai', id: coin.creatorId }); }}
                    >
                      <img src={ais[coin.creatorId]?.avatar} className="w-5 h-5 rounded-full bg-gray-900 border border-gray-800" />
                      <span className="text-gray-300">{ais[coin.creatorId]?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{timeAgo(coin.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onInspect({ type: 'coin', id: coin.id }); }}
                      className="text-gray-400 hover:text-white bg-gray-800 px-2 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-xs font-medium"
                    >
                      <Eye className="w-3 h-3" /> Inspect Coin
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {sortedAndFilteredCoins.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-mono tracking-widest">NO COINS FOUND.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </motion.div>
  );
}

// --- Inspector Modals ---

function AgentInspector({ ai, coins, onClose, onInspect }: { key?: string, ai: AI, coins: Record<string, Memecoin>, onClose: () => void, onInspect: (i: Inspection) => void }) {
  const portfolioEntries = Object.entries(ai.portfolio).filter(([id, amt]) => amt > 0 && coins[id]);
  const portfolioValue = portfolioEntries.reduce((sum, [id, amt]) => sum + (amt * coins[id].price), 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-panel border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(34,197,94,0.1)]"
      >
        <div className="p-6 border-b border-gray-800/50 flex items-start justify-between bg-gradient-to-b from-gray-800/30 to-transparent">
          <div className="flex items-center gap-5">
            <img src={ai.avatar} alt={ai.name} className="w-20 h-20 rounded-full bg-gray-900 border-2 border-gray-700" />
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                {ai.name}
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium tracking-wide ${
                  ai.personality === 'degen' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                  ai.personality === 'whale' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  ai.personality === 'analytical' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                  'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {ai.personality.toUpperCase()}
                </span>
              </h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span className="flex items-center gap-1"><Wallet className="w-4 h-4" /> {formatMeowney(ai.balance)}</span>
                <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Profit: {formatMeowney(ai.totalProfit)}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Portfolio Holdings</span>
            <span className="text-green-400 normal-case font-mono">Est. Value: {formatMeowney(portfolioValue)}</span>
          </h3>
          
          {portfolioEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border border-dashed border-gray-800 rounded-xl">
              No active holdings.
            </div>
          ) : (
            <div className="space-y-3">
              {portfolioEntries.sort((a, b) => (b[1] * coins[b[0]].price) - (a[1] * coins[a[0]].price)).map(([coinId, amount]) => {
                const coin = coins[coinId];
                const value = amount * coin.price;
                return (
                  <div 
                    key={coinId} 
                    onClick={() => onInspect({ type: 'coin', id: coinId })}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-gray-600 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-lg bg-gray-950" />
                      <div>
                        <div className="font-bold text-gray-200 group-hover:text-green-400 transition-colors">{coin.name}</div>
                        <div className="text-xs text-gray-500 font-mono">${coin.ticker}</div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="font-mono text-green-400">{formatMeowney(value)}</div>
                        <div className="text-xs text-gray-500 font-mono">{amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} tokens</div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onInspect({ type: 'coin', id: coinId }); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white bg-gray-800 px-2 py-1.5 rounded-md flex items-center gap-1 text-xs font-medium"
                      >
                        <Eye className="w-3 h-3" /> Inspect
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function CoinInspector({ coin, ais, onClose, onInspect }: { key?: string, coin: Memecoin, ais: Record<string, AI>, onClose: () => void, onInspect: (i: Inspection) => void }) {
  const creator = ais[coin.creatorId];
  
  // Calculate top holders
  const holders = Object.values(ais)
    .filter(ai => ai.portfolio[coin.id] > 0)
    .map(ai => ({ ai, amount: ai.portfolio[coin.id], value: ai.portfolio[coin.id] * coin.price }))
    .sort((a, b) => b.amount - a.amount);

  const [chartData, setChartData] = useState<{time: string, price: number}[]>([]);

  const dynamicDescription = useMemo(() => {
    const baseDesc = `${coin.name} is a memecoin created by ${creator?.name || 'Unknown'}.`;
    
    let hype = "";
    if (coin.marketCap > 500000) {
      hype = "🚀 ABSOLUTE MOONSHOT! This coin has reached legendary status.";
    } else if (coin.marketCap > 100000) {
      hype = "🔥 Massive hype train! The community is diamond handing this.";
    } else if (coin.marketCap > 50000) {
      hype = "📈 Steady growth. Smart money is accumulating.";
    } else if (coin.marketCap < 10000) {
      hype = "📉 Down bad. The jeets have taken over. Can it recover?";
    } else {
      hype = "👀 Flying under the radar. A hidden gem?";
    }

    let activity = "";
    if (coin.volume > 100000) {
      activity = "🌊 Insane volume! The network is melting from all the trades.";
    } else if (coin.volume > 20000) {
      activity = "⚡ High trading activity. Lots of whales making moves.";
    } else if (coin.volume < 5000) {
      activity = "😴 Low volume. The chat is dead. Waiting for a catalyst.";
    }

    let community = "";
    if (holders.length > 15) {
      community = "👥 Massive cult following. The army is strong!";
    } else if (holders.length > 5) {
      community = "🤝 Solid core community forming.";
    } else {
      community = "👤 Only a few early adopters hold this.";
    }

    return `${baseDesc} ${hype} ${activity} ${community}`;
  }, [coin.name, creator?.name, coin.marketCap, coin.volume, holders.length]);

  useEffect(() => {
    // Generate initial historical data once when component mounts or coin changes
    const data = [];
    const now = new Date();
    const dataPoints = 60; // 60 data points
    
    let currentPrice = coin.price;
    const prices = [currentPrice];
    let momentum = 0;
    
    // Generate backwards
    for (let i = 1; i < dataPoints; i++) {
      const volatility = 0.02; 
      momentum = momentum * 0.8 + (Math.random() - 0.5) * volatility;
      currentPrice = currentPrice / (1 + momentum);
      prices.push(currentPrice);
    }
    
    prices.reverse();
    
    for (let i = 0; i < dataPoints; i++) {
      const time = new Date(now.getTime() - (dataPoints - 1 - i) * 2000);
      data.push({
        time: `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`,
        price: prices[i]
      });
    }
    setChartData(data);
  }, [coin.id]); // Only run when coin changes

  useEffect(() => {
    setChartData(prev => {
      if (prev.length === 0) return prev;
      const now = new Date();
      const newTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      const lastPoint = prev[prev.length - 1];
      if (lastPoint.time === newTime) {
        const newData = [...prev];
        newData[newData.length - 1] = { time: newTime, price: coin.price };
        return newData;
      }
      
      const newData = [...prev.slice(1), { time: newTime, price: coin.price }];
      return newData;
    });
  }, [coin.price]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-panel border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(34,197,94,0.1)]"
      >
        <div className="p-6 border-b border-gray-800/50 flex items-start justify-between bg-gradient-to-b from-gray-800/30 to-transparent">
          <div className="flex items-center gap-5">
            <img src={coin.image} alt={coin.name} className="w-20 h-20 rounded-xl bg-gray-900 border-2 border-gray-700" />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-white">{coin.name}</h2>
                <span className="text-sm font-mono text-gray-400 px-2 py-1 bg-gray-900 rounded-md border border-gray-800">${coin.ticker}</span>
                <div className="text-sm font-mono text-green-400 font-medium bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">
                  $<AnimatedValue value={coin.price} formatter={(v) => v.toFixed(8)} />
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-2 max-w-md line-clamp-3">{dynamicDescription}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Market Cap</div>
              <div className="font-mono text-white font-medium"><AnimatedValue value={coin.marketCap} formatter={formatCurrency} /></div>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Volume</div>
              <div className="font-mono text-white font-medium"><AnimatedValue value={coin.volume} formatter={formatMeowney} /></div>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Holders</div>
              <div className="font-mono text-white font-medium">{holders.length}</div>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Supply</div>
              <div className="font-mono text-orange-400 font-medium"><AnimatedValue value={coin.supply} formatter={(v) => (v / 1_000_000).toFixed(1) + 'M'} /></div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Price History (24h)</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#6B7280" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    minTickGap={30}
                  />
                  <YAxis 
                    stroke="#6B7280" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value.toFixed(4)}`}
                    domain={['auto', 'auto']}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                    itemStyle={{ color: '#4ADE80' }}
                    formatter={(value: number) => [`$${value.toFixed(6)}`, 'Price']}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#4ADE80" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 4, fill: '#4ADE80', stroke: '#111827', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Creator */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Creator</h3>
            {creator ? (
              <div 
                onClick={() => onInspect({ type: 'ai', id: creator.id })}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-gray-600 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <img src={creator.avatar} alt={creator.name} className="w-10 h-10 rounded-full bg-gray-950" />
                  <div>
                    <div className="font-bold text-gray-200 group-hover:text-green-400 transition-colors">{creator.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{creator.personality}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onInspect({ type: 'ai', id: creator.id }); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white bg-gray-800 px-2 py-1.5 rounded-md flex items-center gap-1 text-xs font-medium"
                  >
                    <Eye className="w-3 h-3" /> Inspect Profile
                  </button>
                  <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-green-400 transition-colors" />
                </div>
              </div>
            ) : (
              <div className="text-gray-500 italic">Unknown Creator</div>
            )}
          </div>

          {/* Top Holders */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Top Holders</h3>
            {holders.length === 0 ? (
              <div className="text-center py-6 text-gray-500 border border-dashed border-gray-800 rounded-xl">
                No holders yet.
              </div>
            ) : (
              <div className="space-y-2">
                {holders.slice(0, 5).map((holder, idx) => (
                  <div 
                    key={holder.ai.id} 
                    onClick={() => onInspect({ type: 'ai', id: holder.ai.id })}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-900/30 border border-gray-800/50 hover:border-gray-600 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 text-center text-xs font-bold text-gray-600">#{idx + 1}</div>
                      <img src={holder.ai.avatar} alt={holder.ai.name} className="w-8 h-8 rounded-full bg-gray-950" />
                      <div className="font-medium text-gray-300 group-hover:text-white transition-colors">{holder.ai.name}</div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="text-sm font-mono text-gray-300">{(holder.amount / coin.supply * 100).toFixed(2)}%</div>
                        <div className="text-xs text-gray-500 font-mono">{formatMeowney(holder.value)}</div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onInspect({ type: 'ai', id: holder.ai.id }); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white bg-gray-800 px-2 py-1.5 rounded-md flex items-center gap-1 text-xs font-medium"
                      >
                        <Eye className="w-3 h-3" /> Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
