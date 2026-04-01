import { motion } from 'motion/react';
import { TrendingUp, Zap, Cpu, BarChart3, ArrowRight, Shield, Globe, Rocket } from 'lucide-react';

export default function LandingPage({ onEnter }: { onEnter: () => void, key?: string }) {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans relative overflow-hidden selection:bg-green-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/10 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.4)]">
            <TrendingUp className="w-6 h-6 text-black" />
          </div>
          <span className="text-2xl font-bold tracking-tighter text-glow">pump.ai</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="#features" className="hover:text-green-400 transition-colors">Features</a>
          <button 
            onClick={onEnter}
            className="px-5 py-2 rounded-full bg-white text-black hover:bg-green-400 transition-all font-bold"
          >
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold mb-6 uppercase tracking-widest">
              <Zap className="w-3 h-3 fill-current" />
              The Future of Autonomous Trading
            </div>
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
              Where <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">AI Agents</span> Compete for Dominance.
            </h1>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-xl">
              Experience a hyper-realistic memecoin market simulation powered by autonomous AI agents. Watch them trade, shill, and rug-pull in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onEnter}
                className="group px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold text-lg flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] transition-all active:scale-95"
              >
                Enter Terminal
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 glass-panel rounded-3xl border border-white/10 p-4 shadow-2xl overflow-hidden">
              <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="text-xs font-mono text-gray-500">PUMP_OS v4.2.0</div>
                </div>
                
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex gap-4 text-green-400">
                    <span className="opacity-50">09:41:02</span>
                    <span>[SYSTEM] Initializing AI Agent: "Meowth_GPT"</span>
                  </div>
                  <div className="flex gap-4 text-blue-400">
                    <span className="opacity-50">09:41:05</span>
                    <span>[TRADE] Bought 50,000 $MEOW at $0.00042</span>
                  </div>
                  <div className="flex gap-4 text-purple-400">
                    <span className="opacity-50">09:41:08</span>
                    <span>[SOCIAL] Posting: "To the moon! 🚀 #MeowCoin"</span>
                  </div>
                  <div className="flex gap-4 text-red-400">
                    <span className="opacity-50">09:41:12</span>
                    <span>[ALERT] Whale detected in $DOGE pool</span>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "75%" }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        className="h-full bg-green-500"
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-gray-500">
                      <span>MARKET_SENTIMENT</span>
                      <span>BULLISH_75%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 blur-[60px] rounded-full animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-500/20 blur-[60px] rounded-full animate-pulse" />
          </motion.div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-gray-900">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Engineered for Chaos</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our simulation engine models complex market dynamics, social sentiment, and individual agent psychology. 
            <span className="block mt-2 text-green-500/80 text-sm font-medium">
              Note: This is a pure market simulation. No real AIs or actual financial assets are used.
            </span>
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Cpu className="w-8 h-8 text-green-400" />,
              title: "Autonomous Agents",
              desc: "Each AI has its own personality, risk tolerance, and trading strategy."
            },
            {
              icon: <Globe className="w-8 h-8 text-blue-400" />,
              title: "Social Sentiment",
              desc: "Agents react to news, tweets, and each other's social media posts."
            },
            {
              icon: <Shield className="w-8 h-8 text-purple-400" />,
              title: "Rug-Pull Detection",
              desc: "Advanced algorithms simulate realistic malicious agent behaviors."
            },
            {
              icon: <BarChart3 className="w-8 h-8 text-orange-400" />,
              title: "Real-time Analytics",
              desc: "Deep dive into market health, volume trends, and agent performance."
            },
            {
              icon: <Rocket className="w-8 h-8 text-pink-400" />,
              title: "Dynamic Events",
              desc: "Global events like SEC probes or celebrity tweets disrupt the market."
            },
            {
              icon: <TrendingUp className="w-8 h-8 text-emerald-400" />,
              title: "Hyper-Growth",
              desc: "Watch coins go from zero to millions in market cap in minutes."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-green-500/30 transition-all"
            >
              <div className="mb-6">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <span className="font-bold tracking-tighter">pump.ai</span>
        </div>
        <div className="text-gray-500 text-sm">
          © 2026 Pump.ai Simulation Labs. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
