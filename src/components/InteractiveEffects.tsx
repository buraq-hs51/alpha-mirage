import { useEffect, useState, useRef, useCallback, memo } from "react"
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion"

// Quant/ML formulas and code snippets - enhanced
const codeSnippets = [
  // Options Greeks
  "Δ = ∂V/∂S",
  "Γ = ∂²V/∂S²",
  "θ = -∂V/∂t",
  "ν = ∂V/∂σ",
  // ML/Stats
  "∇L(θ)",
  "SGD++",
  "LSTM(h,c)",
  "softmax(z)",
  "ReLU(x)",
  "∂L/∂w",
  // Quant Finance
  "α + βRₘ",
  "VaR₀.₉₅",
  "E[R|F]",
  "dS = μdt + σdW",
  "N(d₁)",
  "PnL++",
  "Sharpe > 2",
  "κ(θ-v)",
  // HFT/Low Latency
  "O(log n)",
  "latency < 1μs",
  "L2 cache hit",
  "FPGA",
]

// Stock data
const stockSymbols = [
  { symbol: "AAPL", price: 189.45, change: 2.34 },
  { symbol: "GOOGL", price: 141.23, change: -1.12 },
  { symbol: "MSFT", price: 378.91, change: 4.56 },
  { symbol: "NVDA", price: 495.22, change: 12.45 },
  { symbol: "TSLA", price: 248.34, change: 5.67 },
  { symbol: "BTC", price: 43521.00, change: 1234.56 },
  { symbol: "ETH", price: 2245.00, change: -45.67 },
  { symbol: "SPY", price: 475.23, change: 3.21 },
  { symbol: "QQQ", price: 405.67, change: 2.89 },
  { symbol: "META", price: 356.78, change: -2.34 },
]

// ============================================
// ENHANCED CURSOR WITH PARTICLE TRAIL
// ============================================
export function InteractiveCursor() {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    snippet?: string
    type: 'glow' | 'spark' | 'code'
  }>>([])
  const lastPos = useRef({ x: 0, y: 0 })
  const particleId = useRef(0)
  const throttleRef = useRef(0)

  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  
  // Optimized spring config - stiffer = faster response
  const springConfig = { stiffness: 500, damping: 30 }
  const springX = useSpring(cursorX, springConfig)
  const springY = useSpring(cursorY, springConfig)

  // Reduced to 2 trail positions (from 3)
  const trail1X = useSpring(cursorX, { stiffness: 150, damping: 22 })
  const trail1Y = useSpring(cursorY, { stiffness: 150, damping: 22 })
  const trail2X = useSpring(cursorX, { stiffness: 60, damping: 18 })
  const trail2Y = useSpring(cursorY, { stiffness: 60, damping: 18 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      // Throttle particle creation to 60fps max
      const shouldSpawnParticle = now - throttleRef.current > 16
      
      const newX = e.clientX
      const newY = e.clientY
      
      cursorX.set(newX)
      cursorY.set(newY)
      
      if (shouldSpawnParticle) {
        // Calculate velocity
        const vx = newX - lastPos.current.x
        const vy = newY - lastPos.current.y
        const speed = Math.sqrt(vx * vx + vy * vy)
        
        // Spawn particles based on speed - max 2 particles
        if (speed > 8) {
          const numParticles = Math.min(Math.floor(speed / 15), 2)
          const newParticles: Array<{
            id: number
            x: number
            y: number
            snippet?: string
            type: 'glow' | 'spark' | 'code'
          }> = []
          
          for (let i = 0; i < numParticles; i++) {
            const type: 'glow' | 'spark' | 'code' = Math.random() > 0.7 ? 'code' : (Math.random() > 0.5 ? 'spark' : 'glow')
            newParticles.push({
              id: particleId.current++,
              x: newX + (Math.random() - 0.5) * 40,
              y: newY + (Math.random() - 0.5) * 40,
              snippet: type === 'code' ? codeSnippets[Math.floor(Math.random() * codeSnippets.length)] : undefined,
              type
            })
          }
          
          // Limit to 12 particles max (from 20)
          setParticles(prev => [...prev.slice(-10), ...newParticles])
          throttleRef.current = now
        }
        
        lastPos.current = { x: newX, y: newY }
      }
    }

    // Passive listener for better scroll performance
    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [cursorX, cursorY])

  // Cleanup old particles - less frequent
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.slice(-8))
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  // Only show on desktop
  if (typeof window !== 'undefined' && window.innerWidth < 768) return null

  return (
    <>
      {/* Ambient glow - simplified, using trail2 instead of trail3 */}
      <motion.div
        className="fixed pointer-events-none z-40 will-change-transform"
        style={{
          x: trail2X,
          y: trail2Y,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div 
          className="w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </motion.div>

      {/* Secondary glow ring - removed expensive animation */}
      <motion.div
        className="fixed pointer-events-none z-40 will-change-transform"
        style={{
          x: trail1X,
          y: trail1Y,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div 
          className="w-[150px] h-[150px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.2) 0%, transparent 70%)',
            filter: 'blur(15px)',
          }}
        />
      </motion.div>

      {/* Main cursor core */}
      <motion.div
        className="fixed pointer-events-none z-50 will-change-transform"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        {/* Rotating ring - CSS animation instead of framer */}
        <div
          className="absolute w-8 h-8 -left-4 -top-4 rounded-full border border-cyan-400/40"
          style={{ animation: 'spin 3s linear infinite' }}
        />
        
        {/* Core - static glow, no animation */}
        <div
          className="w-3 h-3 rounded-full bg-cyan-400"
          style={{
            boxShadow: '0 0 15px #22d3ee, 0 0 30px rgba(34, 211, 238, 0.5)',
          }}
        />
      </motion.div>

      {/* Particle effects */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="fixed pointer-events-none z-45 font-mono text-xs"
            initial={{ 
              x: particle.x, 
              y: particle.y, 
              opacity: particle.type === 'code' ? 0.9 : 0.7,
              scale: particle.type === 'spark' ? 0.5 : 1,
            }}
            animate={{ 
              opacity: 0,
              y: particle.y - (particle.type === 'code' ? 60 : 30),
              x: particle.x + (Math.random() - 0.5) * 30,
              scale: particle.type === 'spark' ? 0 : 0.5,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: particle.type === 'spark' ? 0.5 : 1.5, ease: "easeOut" }}
            style={{
              color: particle.type === 'code' 
                ? 'oklch(0.75 0.18 190)' 
                : particle.type === 'spark'
                ? 'oklch(0.78 0.15 85)'
                : 'oklch(0.72 0.19 145)',
              textShadow: particle.type === 'code' 
                ? '0 0 15px oklch(0.75 0.18 190 / 0.8)' 
                : '0 0 10px currentColor',
            }}
          >
            {particle.type === 'code' ? particle.snippet : particle.type === 'spark' ? '✦' : '•'}
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  )
}

// ============================================
// ENHANCED STOCK TICKER WITH GLOW
// ============================================
export function StockTicker() {
  const [stocks, setStocks] = useState(stockSymbols)

  // Simulate live price updates - less frequent for performance
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prev => prev.map(stock => ({
        ...stock,
        price: stock.price + (Math.random() - 0.5) * 2,
        change: stock.change + (Math.random() - 0.5) * 0.5
      })))
    }, 3000) // Slower updates
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-30 overflow-hidden">
      {/* Gradient overlay for glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-green-500/5" />
      
      <div className="relative border-b border-cyan-500/20" style={{
        boxShadow: '0 1px 20px oklch(0.75 0.18 190 / 0.15), 0 1px 40px oklch(0.72 0.19 145 / 0.1)'
      }}>
        {/* CSS-animated ticker - GPU accelerated */}
        <div 
          className="flex items-center gap-12 py-2.5 whitespace-nowrap will-change-transform"
          style={{ 
            width: 'max-content',
            animation: 'ticker 60s linear infinite',
          }}
        >
          {[...stocks, ...stocks, ...stocks, ...stocks].map((stock, i) => (
            <div 
              key={i} 
              className="flex items-center gap-3 font-mono text-sm hover:scale-105 transition-transform"
            >
              <span className="text-foreground font-bold tracking-wide">{stock.symbol}</span>
              <span className="text-foreground/70">${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span 
                className={`flex items-center gap-1 font-semibold ${stock.change >= 0 ? "text-green-400" : "text-red-400"}`}
                style={{
                  textShadow: stock.change >= 0 
                    ? '0 0 10px oklch(0.72 0.19 145 / 0.6)'
                    : '0 0 10px oklch(0.65 0.20 25 / 0.6)'
                }}
              >
                {stock.change >= 0 ? "▲" : "▼"} {Math.abs(stock.change).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
        {/* CSS keyframe for GPU-accelerated ticker */}
        <style>{`
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-25%); }
          }
        `}</style>
      </div>
    </div>
  )
}

// ============================================
// ENHANCED MATRIX RAIN WITH DEPTH
// ============================================
export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return
    
    let animationId: number
    let lastTime = 0
    const targetFPS = 20 // 20fps is plenty for background effect
    const frameInterval = 1000 / targetFPS
    
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    
    // Debounced resize handler
    let resizeTimeout: ReturnType<typeof setTimeout>
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(resize, 150)
    }
    window.addEventListener('resize', handleResize)
    
    const chars = "01∑∏∫∂∇αβγδεμσρφψ+-×÷=<>≈∞√ΔΓΘΛ".split("")
    const fontSize = 14
    const columns = Math.floor(canvas.width / (fontSize * 1.5)) // Fewer columns
    const drops: number[] = Array(columns).fill(1)
    const speeds: number[] = Array(columns).fill(0).map(() => Math.random() * 0.5 + 0.5)
    const brightness: number[] = Array(columns).fill(0).map(() => Math.random() * 0.5 + 0.3)
    
    const draw = (timestamp: number) => {
      animationId = requestAnimationFrame(draw)
      
      // Throttle to target FPS
      if (timestamp - lastTime < frameInterval) return
      lastTime = timestamp
      
      // Semi-transparent black to create trail effect
      ctx.fillStyle = 'rgba(10, 15, 26, 0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.font = `${fontSize}px monospace`
      
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const x = i * fontSize * 1.5
        const y = drops[i] * fontSize
        
        // Simplified color - no expensive shadowBlur
        const alpha = brightness[i]
        ctx.fillStyle = `rgba(34, 211, 238, ${alpha})` // cyan color
        ctx.fillText(char, x, y)
        
        // Reset drop randomly
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
          brightness[i] = Math.random() * 0.5 + 0.3
        }
        
        drops[i] += speeds[i]
      }
    }
    
    animationId = requestAnimationFrame(draw)
    
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimeout)
    }
  }, [])
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0 opacity-[0.06]"
    />
  )
}

// ============================================
// FLOATING ORBS WITH GLOW
// ============================================
export function FloatingOrbs() {
  // Orb config - reduced to 3 orbs
  const orbsConfig = [
    { size: 400, x: '10%', y: '20%', color: '#22d3ee', animName: 'float1' },
    { size: 300, x: '80%', y: '60%', color: '#4ade80', animName: 'float2' },
    { size: 350, x: '50%', y: '80%', color: '#a78bfa', animName: 'float3' },
  ]

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {orbsConfig.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full will-change-transform"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color}20 0%, transparent 70%)`,
            filter: 'blur(60px)',
            animation: `${orb.animName} ${20 + i * 5}s ease-in-out infinite`,
          }}
        />
      ))}
      {/* CSS keyframes for GPU-accelerated orb animations */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 25px) scale(0.95); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, 35px) scale(1.02); }
        }
      `}</style>
    </div>
  )
}

// ============================================
// NEURAL NETWORK VISUALIZATION - CSS only
// ============================================
export function NeuralNetworkViz() {
  // Node positions for a simple 3-layer network visualization
  const layers = [
    [{ id: 1, y: 20 }, { id: 2, y: 40 }, { id: 3, y: 60 }, { id: 4, y: 80 }], // Input
    [{ id: 5, y: 25 }, { id: 6, y: 50 }, { id: 7, y: 75 }], // Hidden
    [{ id: 8, y: 35 }, { id: 9, y: 65 }], // Output
  ]

  return (
    <div className="fixed bottom-24 right-4 z-10 pointer-events-none hidden lg:block opacity-80">
      <div className="bg-background/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-2">
        <div className="text-cyan-400 font-mono text-[10px] mb-1 font-bold">NEURAL NET</div>
        <svg width="180" height="90" viewBox="0 0 200 100">
          {/* Connections - draw lines between layers */}
          {layers[0].map(n1 => 
            layers[1].map(n2 => (
              <line
                key={`${n1.id}-${n2.id}`}
                x1="30" y1={n1.y}
                x2="100" y2={n2.y}
                stroke="#22d3ee"
                strokeWidth="0.5"
                opacity="0.4"
                className="neural-pulse"
                style={{ animationDelay: `${(n1.id + n2.id) * 0.1}s` }}
              />
            ))
          )}
          {layers[1].map(n1 => 
            layers[2].map(n2 => (
              <line
                key={`${n1.id}-${n2.id}`}
                x1="100" y1={n1.y}
                x2="170" y2={n2.y}
                stroke="#4ade80"
                strokeWidth="0.5"
                opacity="0.4"
                className="neural-pulse"
                style={{ animationDelay: `${(n1.id + n2.id) * 0.1 + 0.5}s` }}
              />
            ))
          )}
          
          {/* Nodes */}
          {layers[0].map(n => (
            <circle key={n.id} cx="30" cy={n.y} r="4" fill="#22d3ee" className="neural-node" style={{ animationDelay: `${n.id * 0.2}s` }} />
          ))}
          {layers[1].map(n => (
            <circle key={n.id} cx="100" cy={n.y} r="5" fill="#a78bfa" className="neural-node" style={{ animationDelay: `${n.id * 0.2}s` }} />
          ))}
          {layers[2].map(n => (
            <circle key={n.id} cx="170" cy={n.y} r="4" fill="#4ade80" className="neural-node" style={{ animationDelay: `${n.id * 0.2}s` }} />
          ))}
        </svg>
        
        <style>{`
          .neural-node {
            animation: nodePulse 2s ease-in-out infinite;
          }
          .neural-pulse {
            animation: linePulse 3s ease-in-out infinite;
          }
          @keyframes nodePulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          @keyframes linePulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.7; }
          }
        `}</style>
      </div>
    </div>
  )
}

// ============================================
// ALGORITHM STATUS WIDGET
// ============================================
export function AlgoStatusWidget() {
  const [metrics, setMetrics] = useState({
    sharpe: 2.34,
    pnl: 12847.50,
    trades: 1247,
    latency: 0.8,
  })

  // Update metrics periodically - slow interval for performance
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        sharpe: Math.max(0.5, prev.sharpe + (Math.random() - 0.5) * 0.1),
        pnl: prev.pnl + (Math.random() - 0.45) * 100,
        trades: prev.trades + Math.floor(Math.random() * 3),
        latency: Math.max(0.1, Math.min(2, prev.latency + (Math.random() - 0.5) * 0.2)),
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const pnlColor = metrics.pnl >= 0 ? 'text-green-400' : 'text-red-400'

  return (
    <div className="fixed top-20 right-4 z-10 pointer-events-none hidden lg:block opacity-80">
      <div className="bg-background/80 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-3 font-mono text-xs">
        {/* Status header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-cyan-400 font-bold">ALGO RUNNING</span>
        </div>
        
        {/* Metrics */}
        <div className="space-y-1 text-foreground/70">
          <div className="flex justify-between gap-4">
            <span>Sharpe:</span>
            <span className="text-cyan-400">{metrics.sharpe.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>PnL:</span>
            <span className={pnlColor}>${metrics.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Trades:</span>
            <span>{metrics.trades.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Latency:</span>
            <span className={metrics.latency < 1 ? 'text-green-400' : 'text-yellow-400'}>{metrics.latency.toFixed(1)}ms</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// ORDER BOOK DEPTH VISUALIZATION - Bloomberg-style
// ============================================
export function OrderBookDepth() {
  const [orderBook, setOrderBook] = useState({
    bids: [
      { price: 189.45, size: 2500 },
      { price: 189.44, size: 1800 },
      { price: 189.43, size: 3200 },
      { price: 189.42, size: 1500 },
      { price: 189.41, size: 4200 },
    ],
    asks: [
      { price: 189.46, size: 2100 },
      { price: 189.47, size: 1600 },
      { price: 189.48, size: 2800 },
      { price: 189.49, size: 1900 },
      { price: 189.50, size: 3500 },
    ],
  })

  // Simulate order book updates
  useEffect(() => {
    const interval = setInterval(() => {
      setOrderBook(prev => ({
        bids: prev.bids.map(order => ({
          ...order,
          size: Math.max(500, order.size + Math.floor((Math.random() - 0.5) * 800))
        })),
        asks: prev.asks.map(order => ({
          ...order,
          size: Math.max(500, order.size + Math.floor((Math.random() - 0.5) * 800))
        })),
      }))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const maxSize = Math.max(
    ...orderBook.bids.map(o => o.size),
    ...orderBook.asks.map(o => o.size)
  )

  return (
    <div className="fixed bottom-20 left-4 z-20 pointer-events-none">
      <div className="bg-background/80 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-3 font-mono text-[10px] w-44">
        <div className="text-cyan-400 font-bold mb-2 text-xs">ORDER BOOK</div>
        
        {/* Asks (sells) - reversed to show highest at top */}
        <div className="space-y-0.5 mb-1">
          {[...orderBook.asks].reverse().map((order, i) => (
            <div key={`ask-${i}`} className="relative flex justify-between">
              <div 
                className="absolute right-0 top-0 bottom-0 bg-red-500/20"
                style={{ width: `${(order.size / maxSize) * 100}%` }}
              />
              <span className="relative text-red-400">{order.price.toFixed(2)}</span>
              <span className="relative text-foreground/50">{order.size.toLocaleString()}</span>
            </div>
          ))}
        </div>
        
        {/* Spread */}
        <div className="border-t border-b border-cyan-500/30 py-1 my-1 text-center">
          <span className="text-cyan-400">Spread: </span>
          <span className="text-foreground/70">$0.01</span>
        </div>
        
        {/* Bids (buys) */}
        <div className="space-y-0.5">
          {orderBook.bids.map((order, i) => (
            <div key={`bid-${i}`} className="relative flex justify-between">
              <div 
                className="absolute left-0 top-0 bottom-0 bg-green-500/20"
                style={{ width: `${(order.size / maxSize) * 100}%` }}
              />
              <span className="relative text-green-400">{order.price.toFixed(2)}</span>
              <span className="relative text-foreground/50">{order.size.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// BROWNIAN MOTION PARTICLES - Stochastic Process
// ============================================
export function BrownianMotion() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = 200
    const height = 120
    canvas.width = width
    canvas.height = height
    
    // Particles following GBM: dS = μSdt + σSdW
    const particles: Array<{ x: number; y: number; vx: number; vy: number }> = []
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
      })
    }
    
    let animationId: number
    let lastTime = 0
    const fps = 30
    const frameInterval = 1000 / fps
    
    const draw = (timestamp: number) => {
      animationId = requestAnimationFrame(draw)
      
      if (timestamp - lastTime < frameInterval) return
      lastTime = timestamp
      
      // Clear with fade effect
      ctx.fillStyle = 'rgba(10, 15, 26, 0.15)'
      ctx.fillRect(0, 0, width, height)
      
      // Update and draw particles with Brownian motion
      const dt = 0.1
      const mu = 0.05  // drift
      const sigma = 2  // volatility
      
      particles.forEach((p, i) => {
        // Wiener process increment
        const dW = (Math.random() - 0.5) * 2
        
        // GBM update
        p.vx = mu * dt + sigma * dW * Math.sqrt(dt)
        p.vy = mu * dt + sigma * (Math.random() - 0.5) * 2 * Math.sqrt(dt)
        
        p.x += p.vx * 10
        p.y += p.vy * 10
        
        // Boundary reflection
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1
        p.x = Math.max(0, Math.min(width, p.x))
        p.y = Math.max(0, Math.min(height, p.y))
        
        // Draw particle with glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 8)
        gradient.addColorStop(0, `rgba(34, 211, 238, 0.8)`)
        gradient.addColorStop(1, 'rgba(34, 211, 238, 0)')
        
        ctx.beginPath()
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
        
        // Draw core
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = '#22d3ee'
        ctx.fill()
        
        // Draw connections to nearby particles
        particles.forEach((p2, j) => {
          if (i >= j) return
          const dist = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2)
          if (dist < 50) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.3 * (1 - dist / 50)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
    }
    
    animationId = requestAnimationFrame(draw)
    
    return () => cancelAnimationFrame(animationId)
  }, [])
  
  return (
    <div className="fixed top-40 right-4 z-20 pointer-events-none">
      <div className="bg-background/60 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-2">
        <div className="text-cyan-400 font-mono text-[10px] mb-1">dS = μdt + σdW</div>
        <canvas ref={canvasRef} className="rounded" style={{ width: 200, height: 120 }} />
      </div>
    </div>
  )
}

// ============================================
// CORRELATION MATRIX HEATMAP
// ============================================
export function CorrelationMatrix() {
  const assets = ['SPY', 'QQQ', 'BTC', 'GLD', 'VIX']
  const [correlations, setCorrelations] = useState<number[][]>([
    [1.00, 0.92, 0.35, 0.12, -0.75],
    [0.92, 1.00, 0.40, 0.08, -0.80],
    [0.35, 0.40, 1.00, 0.15, -0.25],
    [0.12, 0.08, 0.15, 1.00, 0.05],
    [-0.75, -0.80, -0.25, 0.05, 1.00],
  ])

  // Slightly update correlations periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCorrelations(prev => 
        prev.map((row, i) => 
          row.map((val, j) => {
            if (i === j) return 1
            const newVal = val + (Math.random() - 0.5) * 0.05
            return Math.max(-1, Math.min(1, newVal))
          })
        )
      )
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const getColor = (val: number) => {
    if (val >= 0.7) return 'bg-green-500'
    if (val >= 0.3) return 'bg-green-500/60'
    if (val >= 0) return 'bg-green-500/30'
    if (val >= -0.3) return 'bg-red-500/30'
    if (val >= -0.7) return 'bg-red-500/60'
    return 'bg-red-500'
  }

  return (
    <div className="fixed top-64 left-4 z-20 pointer-events-none">
      <div className="bg-background/80 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-2">
        <div className="text-cyan-400 font-mono text-[10px] mb-2 font-bold">CORRELATION ρ</div>
        
        {/* Header row */}
        <div className="flex gap-0.5 mb-0.5">
          <div className="w-7" />
          {assets.map(a => (
            <div key={a} className="w-7 text-[8px] text-foreground/50 text-center">{a}</div>
          ))}
        </div>
        
        {/* Matrix */}
        {correlations.map((row, i) => (
          <div key={i} className="flex gap-0.5 mb-0.5">
            <div className="w-7 text-[8px] text-foreground/50 flex items-center">{assets[i]}</div>
            {row.map((val, j) => (
              <div 
                key={j} 
                className={`w-7 h-7 rounded-sm flex items-center justify-center text-[8px] font-mono transition-all duration-500 ${getColor(val)}`}
                style={{ opacity: Math.abs(val) * 0.8 + 0.2 }}
              >
                {val.toFixed(1)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// LIVE CODE TERMINAL
// ============================================
export function CodeTerminal() {
  const codeLines = [
    { text: '>>> model = LSTM(hidden_size=256)', color: 'text-cyan-400' },
    { text: '>>> optimizer = Adam(lr=0.001)', color: 'text-cyan-400' },
    { text: '>>> for epoch in range(100):', color: 'text-purple-400' },
    { text: '...     loss = train_step(batch)', color: 'text-foreground/70' },
    { text: '...     if loss < best_loss:', color: 'text-foreground/70' },
    { text: '...         save_model(model)', color: 'text-foreground/70' },
    { text: 'Training: ████████░░ 80%', color: 'text-green-400' },
    { text: 'Loss: 0.0023 | Sharpe: 2.41', color: 'text-yellow-400' },
    { text: '>>> backtest(strategy="momentum")', color: 'text-cyan-400' },
    { text: 'Returns: +24.7% | MaxDD: -8.2%', color: 'text-green-400' },
  ]
  
  const [visibleLines, setVisibleLines] = useState(0)
  const [cursorVisible, setCursorVisible] = useState(true)

  useEffect(() => {
    const lineInterval = setInterval(() => {
      setVisibleLines(prev => (prev + 1) % (codeLines.length + 3))
    }, 800)
    
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev)
    }, 500)
    
    return () => {
      clearInterval(lineInterval)
      clearInterval(cursorInterval)
    }
  }, [])

  return (
    <div className="fixed bottom-4 left-4 z-20 pointer-events-none">
      <div className="bg-background/90 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-2 w-64 font-mono text-[10px]">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <span className="text-foreground/50">quant_strategy.py</span>
        </div>
        
        <div className="space-y-0.5 h-28 overflow-hidden">
          {codeLines.slice(0, visibleLines).map((line, i) => (
            <div key={i} className={line.color}>{line.text}</div>
          ))}
          {cursorVisible && <span className="text-cyan-400">█</span>}
        </div>
      </div>
    </div>
  )
}

// ============================================
// ANIMATED GRID LINES
// ============================================
export function GridLines() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#22d3ee" strokeWidth="0.5"/>
          </pattern>
          <linearGradient id="gridFade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.3"/>
            <stop offset="50%" stopColor="white" stopOpacity="1"/>
            <stop offset="100%" stopColor="white" stopOpacity="0.3"/>
          </linearGradient>
          <mask id="gridMask">
            <rect width="100%" height="100%" fill="url(#gridFade)"/>
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" mask="url(#gridMask)"/>
      </svg>
      
      {/* Scanning line effect - CSS animation */}
      <div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent will-change-transform"
        style={{ animation: 'scanLine 10s linear infinite' }}
      />
      <style>{`
        @keyframes scanLine {
          0% { top: -10%; }
          100% { top: 110%; }
        }
      `}</style>
    </div>
  )
}

// ============================================
// LIVE CANDLESTICK CHART
// ============================================
export function CandlestickAnimation() {
  const [candles, setCandles] = useState<Array<{
    id: number
    open: number
    close: number
    high: number
    low: number
  }>>([])
  
  const generateCandles = useCallback(() => {
    const newCandles: typeof candles = []
    let lastClose = 50 + Math.random() * 20
    // Reduced from 50 to 30 candles
    for (let i = 0; i < 30; i++) {
      const volatility = 2 + Math.random() * 4
      const change = (Math.random() - 0.48) * volatility
      const open = lastClose
      const close = Math.max(10, Math.min(90, open + change))
      const high = Math.max(open, close) + Math.random() * 2
      const low = Math.min(open, close) - Math.random() * 2
      newCandles.push({ id: i, open, close, high, low })
      lastClose = close
    }
    return newCandles
  }, [])

  useEffect(() => {
    setCandles(generateCandles())
    // Less frequent updates
    const interval = setInterval(() => {
      setCandles(generateCandles())
    }, 6000)
    return () => clearInterval(interval)
  }, [generateCandles])

  return (
    <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none overflow-hidden">
      {/* Gradient fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
      
      {/* Removed expensive glow filter, using simple opacity */}
      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1000 100" className="opacity-25">
        {candles.map((candle, i) => {
          const x = (i / candles.length) * 1000
          const width = 20
          const isGreen = candle.close >= candle.open
          const color = isGreen ? "#4ade80" : "#f87171"
          
          return (
            <g key={candle.id} className="candlestick-appear" style={{ animationDelay: `${i * 20}ms` }}>
              {/* Wick */}
              <line
                x1={x + width / 2}
                y1={100 - candle.high}
                x2={x + width / 2}
                y2={100 - candle.low}
                stroke={color}
                strokeWidth="1.5"
              />
              {/* Body */}
              <rect
                x={x}
                y={100 - Math.max(candle.open, candle.close)}
                width={width}
                height={Math.max(Math.abs(candle.close - candle.open), 1)}
                fill={color}
                rx="1"
              />
            </g>
          )
        })}
      </svg>
      <style>{`
        .candlestick-appear {
          animation: candleAppear 0.4s ease-out forwards;
          opacity: 0;
        }
        @keyframes candleAppear {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ============================================
// 🎲 ROTATING 3D CUBE - Financial data on each face
// ============================================
export function Rotating3DCube() {
  const faces = [
    { label: 'ALPHA', value: '+2.34σ', color: '#22d3ee' },
    { label: 'SHARPE', value: '2.87', color: '#4ade80' },
    { label: 'VOL', value: '12.4%', color: '#a78bfa' },
    { label: 'BETA', value: '0.85', color: '#f472b6' },
    { label: 'PnL', value: '+$847K', color: '#fbbf24' },
    { label: 'DRAWDOWN', value: '-4.2%', color: '#ef4444' },
  ]

  return (
    <div className="fixed top-24 right-4 z-10 pointer-events-none hidden lg:block">
      <div className="cube-container">
        <div className="cube">
          {faces.map((face, i) => (
            <div key={i} className={`cube-face cube-face-${i + 1}`}>
              <div className="text-[10px] opacity-70 font-mono">{face.label}</div>
              <div className="text-xl font-bold font-mono" style={{ color: face.color }}>{face.value}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .cube-container {
          width: 100px;
          height: 100px;
          perspective: 400px;
        }
        .cube {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          animation: cubeRotate 12s infinite linear;
        }
        .cube-face {
          position: absolute;
          width: 100px;
          height: 100px;
          background: rgba(0, 0, 0, 0.8);
          border: 1px solid rgba(34, 211, 238, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.3), inset 0 0 20px rgba(34, 211, 238, 0.1);
        }
        .cube-face-1 { transform: rotateY(0deg) translateZ(50px); }
        .cube-face-2 { transform: rotateY(90deg) translateZ(50px); }
        .cube-face-3 { transform: rotateY(180deg) translateZ(50px); }
        .cube-face-4 { transform: rotateY(-90deg) translateZ(50px); }
        .cube-face-5 { transform: rotateX(90deg) translateZ(50px); }
        .cube-face-6 { transform: rotateX(-90deg) translateZ(50px); }
        @keyframes cubeRotate {
          0% { transform: rotateX(0deg) rotateY(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg); }
        }
      `}</style>
    </div>
  )
}

// ============================================
// 🌌 PARTICLE CONSTELLATION NETWORK - Interactive web
// ============================================
export function ParticleConstellationNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    
    // Track mouse
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouse, { passive: true })
    
    // Create particles
    const particles: { x: number; y: number; vx: number; vy: number; baseX: number; baseY: number; size: number }[] = []
    const numParticles = 80
    
    for (let i = 0; i < numParticles; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      particles.push({
        x, y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
      })
    }
    
    let animationId: number
    let lastTime = 0
    const fps = 30
    const interval = 1000 / fps
    
    const draw = (time: number) => {
      if (time - lastTime < interval) {
        animationId = requestAnimationFrame(draw)
        return
      }
      lastTime = time
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      const mouse = mouseRef.current
      
      particles.forEach((p, i) => {
        // Move toward mouse when close
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist < 200) {
          p.x += dx * 0.02
          p.y += dy * 0.02
        } else {
          // Return to base position slowly
          p.x += (p.baseX - p.x) * 0.01 + p.vx
          p.y += (p.baseY - p.y) * 0.01 + p.vy
        }
        
        // Draw connections to nearby particles
        particles.forEach((p2, j) => {
          if (i >= j) return
          const dx2 = p2.x - p.x
          const dy2 = p2.y - p.y
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
          
          if (dist2 < 120) {
            const opacity = (1 - dist2 / 120) * 0.6
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(34, 211, 238, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
        
        // Draw particle with glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
        gradient.addColorStop(0, 'rgba(34, 211, 238, 1)')
        gradient.addColorStop(0.3, 'rgba(34, 211, 238, 0.5)')
        gradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
        
        // Core
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = '#22d3ee'
        ctx.fill()
      })
      
      animationId = requestAnimationFrame(draw)
    }
    
    animationId = requestAnimationFrame(draw)
    
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouse)
    }
  }, [])
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 pointer-events-none"
    />
  )
}

// ============================================
// 📊 LIVE TRADING HUD - Bloomberg-style dashboard
// ============================================
export function LiveTradingHUD() {
  const [data, setData] = useState({
    price: 4521.34,
    bid: 4521.20,
    ask: 4521.48,
    volume: 2847291,
    vwap: 4518.76,
    high: 4534.21,
    low: 4498.12,
    change: 23.45,
    changePct: 0.52,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const change = (Math.random() - 0.5) * 2
        const newPrice = prev.price + change
        return {
          ...prev,
          price: newPrice,
          bid: newPrice - 0.14 - Math.random() * 0.1,
          ask: newPrice + 0.14 + Math.random() * 0.1,
          volume: prev.volume + Math.floor(Math.random() * 5000),
          change: prev.change + change,
          changePct: ((prev.change + change) / prev.price) * 100,
        }
      })
    }, 100) // Update every 100ms for realistic feel
    return () => clearInterval(interval)
  }, [])

  const isPositive = data.change >= 0

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
      <div className="bg-black/90 backdrop-blur-md border border-cyan-500/30 rounded-lg px-6 py-3 flex items-center gap-8 font-mono text-sm">
        {/* Main Price */}
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-bold">ES</span>
          <span className={`text-2xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {data.price.toFixed(2)}
          </span>
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            <span>{isPositive ? '▲' : '▼'}</span>
            <span>{Math.abs(data.change).toFixed(2)}</span>
            <span>({Math.abs(data.changePct).toFixed(2)}%)</span>
          </div>
        </div>
        
        {/* Bid/Ask */}
        <div className="flex gap-4 text-xs">
          <div>
            <span className="text-foreground/50">BID</span>
            <span className="text-green-400 ml-2">{data.bid.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-foreground/50">ASK</span>
            <span className="text-red-400 ml-2">{data.ask.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Volume & VWAP */}
        <div className="flex gap-4 text-xs">
          <div>
            <span className="text-foreground/50">VOL</span>
            <span className="text-cyan-400 ml-2">{(data.volume / 1000000).toFixed(2)}M</span>
          </div>
          <div>
            <span className="text-foreground/50">VWAP</span>
            <span className="text-purple-400 ml-2">{data.vwap.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs">LIVE</span>
        </div>
      </div>
    </div>
  )
}

// ============================================
// 🧬 DNA HELIX OF SKILLS - Rotating double helix
// ============================================
export function DNAHelixSkills() {
  const skills = [
    'Python', 'C++', 'Go', 'Rust', 'TensorFlow', 'PyTorch',
    'CUDA', 'Kafka', 'Spark', 'Redis', 'PostgreSQL', 'AWS',
    'Kubernetes', 'Docker', 'React', 'TypeScript'
  ]
  
  const [rotation, setRotation] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed left-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none hidden xl:block opacity-60">
      <div className="relative w-16 h-80">
        {skills.map((skill, i) => {
          const angle = (i / skills.length) * Math.PI * 4 + (rotation * Math.PI / 180)
          const y = (i / skills.length) * 320
          const x1 = Math.cos(angle) * 30 + 40
          const x2 = Math.cos(angle + Math.PI) * 30 + 40
          const z1 = Math.sin(angle)
          const z2 = Math.sin(angle + Math.PI)
          const opacity1 = 0.3 + (z1 + 1) * 0.35
          const opacity2 = 0.3 + (z2 + 1) * 0.35
          const scale1 = 0.7 + (z1 + 1) * 0.15
          const scale2 = 0.7 + (z2 + 1) * 0.15
          
          return (
            <div key={i}>
              {/* Strand 1 node */}
              <div 
                className="absolute w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center transition-all duration-100"
                style={{ 
                  left: x1, 
                  top: y,
                  opacity: opacity1,
                  transform: `scale(${scale1})`,
                  boxShadow: `0 0 ${10 + z1 * 10}px rgba(34, 211, 238, ${opacity1})`,
                }}
              />
              {/* Strand 2 node */}
              <div 
                className="absolute w-4 h-4 rounded-full bg-purple-400 flex items-center justify-center transition-all duration-100"
                style={{ 
                  left: x2, 
                  top: y,
                  opacity: opacity2,
                  transform: `scale(${scale2})`,
                  boxShadow: `0 0 ${10 + z2 * 10}px rgba(167, 139, 250, ${opacity2})`,
                }}
              />
              {/* Connection line */}
              <svg 
                className="absolute pointer-events-none"
                style={{ left: 0, top: y + 6, width: 80, height: 4 }}
              >
                <line
                  x1={x1 + 8} y1="2"
                  x2={x2 + 8} y2="2"
                  stroke={`rgba(34, 211, 238, ${Math.max(opacity1, opacity2) * 0.5})`}
                  strokeWidth="1"
                />
              </svg>
              {/* Skill label */}
              {z1 > 0.3 && (
                <div 
                  className="absolute text-[10px] font-mono text-cyan-400 whitespace-nowrap transition-opacity duration-200"
                  style={{ 
                    left: x1 + 20, 
                    top: y,
                    opacity: opacity1,
                  }}
                >
                  {skill}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// MAIN EXPORT - COMBINES ALL EFFECTS
// Optimized for performance + content visibility
// ============================================
export default function InteractiveEffects() {
  const [isMounted, setIsMounted] = useState(false)
  const [scrollOpacity, setScrollOpacity] = useState(1)
  
  useEffect(() => {
    setIsMounted(true)
    
    // Handle scroll-based opacity for widgets
    const handleScroll = () => {
      const scrollY = window.scrollY
      const fadeStart = 100  // Start fading at 100px
      const fadeEnd = 400    // Fully faded at 400px
      
      if (scrollY <= fadeStart) {
        setScrollOpacity(1)
      } else if (scrollY >= fadeEnd) {
        setScrollOpacity(0.15) // Keep slight visibility
      } else {
        const opacity = 1 - ((scrollY - fadeStart) / (fadeEnd - fadeStart)) * 0.85
        setScrollOpacity(opacity)
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  if (!isMounted) return null
  
  return (
    <>
      {/* BACKGROUND LAYER (z-0) - Subtle, behind content */}
      <GridLines />
      <FloatingOrbs />
      
      {/* PROFILE-SPECIFIC WIDGETS - Fade on scroll */}
      <div style={{ opacity: scrollOpacity, transition: 'opacity 0.2s ease-out' }}>
        <LatencyMonitor />
        <DataThroughputCounter />
        <LiveGreeksCalculator />
        <TechStackOrbit />
        <MLTradingSignals />
      </div>
      
      {/* Achievement badges - always visible at bottom */}
      <AchievementBadges />
      
      {/* BOTTOM ELEMENTS */}
      <StockTicker />
      
      {/* CURSOR (z-50) - Always on top */}
      <InteractiveCursor />
    </>
  )
}

// ============================================
// 🏆 ACHIEVEMENT BADGES - Your Key Metrics
// ============================================
export function AchievementBadges() {
  const achievements = [
    { icon: '⚡', value: '<5ms', label: 'Latency', color: 'cyan' },
    { icon: '📊', value: '200TB+', label: 'Daily Data', color: 'green' },
    { icon: '🎯', value: '50K+', label: 'Ticks/sec', color: 'purple' },
    { icon: '🎓', value: 'WQU', label: 'MS FinEng', color: 'gold' },
  ]

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
      <div className="flex gap-3">
        {achievements.map((a, i) => (
          <div 
            key={i}
            className="bg-black/70 backdrop-blur-md border border-cyan-500/30 rounded-lg px-3 py-2 flex items-center gap-2 font-mono text-xs"
            style={{
              animation: `fadeSlideUp 0.5s ease-out ${i * 0.1}s both`,
              boxShadow: `0 0 20px rgba(34, 211, 238, 0.2)`,
            }}
          >
            <span className="text-lg">{a.icon}</span>
            <div>
              <div className={`font-bold ${
                a.color === 'cyan' ? 'text-cyan-400' :
                a.color === 'green' ? 'text-green-400' :
                a.color === 'purple' ? 'text-purple-400' :
                'text-yellow-400'
              }`}>{a.value}</div>
              <div className="text-foreground/50 text-[10px]">{a.label}</div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ============================================
// 🌐 TECH STACK ORBIT - Rotating skills around a core
// ============================================
export function TechStackOrbit() {
  const [rotation, setRotation] = useState(0)
  
  const innerOrbit = ['C++', 'Python', 'Go', 'SQL']
  const outerOrbit = ['Spark', 'Kafka', 'TensorFlow', 'AWS', 'Redis', 'Docker']
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.5) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed top-1/2 -translate-y-1/2 left-4 z-30 pointer-events-none hidden xl:block">
      <div className="relative w-40 h-40">
        {/* Core */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 flex items-center justify-center">
          <span className="text-cyan-400 font-bold text-xs text-center">QUANT<br/>DEV</span>
        </div>
        
        {/* Inner orbit */}
        {innerOrbit.map((skill, i) => {
          const angle = (i / innerOrbit.length) * Math.PI * 2 + (rotation * Math.PI / 180)
          const x = Math.cos(angle) * 45 + 70
          const y = Math.sin(angle) * 45 + 70
          return (
            <div
              key={skill}
              className="absolute w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-[10px] font-mono text-cyan-400 font-bold transition-all duration-100"
              style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
            >
              {skill}
            </div>
          )
        })}
        
        {/* Outer orbit */}
        {outerOrbit.map((skill, i) => {
          const angle = (i / outerOrbit.length) * Math.PI * 2 - (rotation * Math.PI / 180 * 0.5)
          const x = Math.cos(angle) * 70 + 70
          const y = Math.sin(angle) * 70 + 70
          return (
            <div
              key={skill}
              className="absolute w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-[8px] font-mono text-purple-400 transition-all duration-100"
              style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
            >
              {skill}
            </div>
          )
        })}
        
        {/* Orbit lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: `rotate(${rotation}deg)` }}>
          <circle cx="80" cy="80" r="45" fill="none" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(167, 139, 250, 0.15)" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>
    </div>
  )
}

// ============================================
// 🤖 ML TRADING SIGNALS - Live ML Model Predictions
// Shows your TensorFlow/ML expertise in trading context
// ============================================
export function MLTradingSignals() {
  const [predictions, setPredictions] = useState([
    { asset: 'SPY', signal: 'LONG', confidence: 0.87, regime: 'BULLISH', model: 'LSTM' },
    { asset: 'QQQ', signal: 'HOLD', confidence: 0.62, regime: 'NEUTRAL', model: 'Transformer' },
    { asset: 'BTC', signal: 'SHORT', confidence: 0.74, regime: 'BEARISH', model: 'GRU' },
  ])
  
  const [modelMetrics, setModelMetrics] = useState({
    accuracy: 0.73,
    sharpe: 2.14,
    winRate: 0.58,
    avgReturn: 0.0023,
  })
  
  const [isTraining, setIsTraining] = useState(false)
  const [epoch, setEpoch] = useState(0)

  useEffect(() => {
    // Simulate live predictions updating
    const predictionInterval = setInterval(() => {
      setPredictions(prev => prev.map(p => ({
        ...p,
        confidence: Math.max(0.5, Math.min(0.95, p.confidence + (Math.random() - 0.5) * 0.1)),
        signal: Math.random() > 0.9 ? ['LONG', 'SHORT', 'HOLD'][Math.floor(Math.random() * 3)] : p.signal,
      })))
    }, 2000)
    
    // Simulate training cycles
    const trainingInterval = setInterval(() => {
      setIsTraining(true)
      setEpoch(0)
      
      const trainStep = setInterval(() => {
        setEpoch(prev => {
          if (prev >= 10) {
            clearInterval(trainStep)
            setIsTraining(false)
            setModelMetrics(prev => ({
              accuracy: Math.min(0.85, prev.accuracy + Math.random() * 0.02),
              sharpe: Math.min(3.0, prev.sharpe + Math.random() * 0.1),
              winRate: Math.min(0.65, prev.winRate + Math.random() * 0.01),
              avgReturn: prev.avgReturn + Math.random() * 0.0005,
            }))
            return 0
          }
          return prev + 1
        })
      }, 200)
    }, 15000)
    
    return () => {
      clearInterval(predictionInterval)
      clearInterval(trainingInterval)
    }
  }, [])

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'LONG': return 'text-green-400 bg-green-400/20'
      case 'SHORT': return 'text-red-400 bg-red-400/20'
      default: return 'text-yellow-400 bg-yellow-400/20'
    }
  }

  return (
    <div className="fixed bottom-24 left-4 z-30 pointer-events-none hidden xl:block">
      <div className="bg-black/80 backdrop-blur-md border border-purple-500/40 rounded-lg p-4 font-mono text-xs w-72">
        <div className="flex items-center justify-between mb-3 border-b border-purple-500/20 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 font-bold text-sm">🤖 ML TRADING ENGINE</span>
          </div>
          {isTraining && (
            <div className="flex items-center gap-1 text-yellow-400">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-[10px]">TRAINING {epoch}/10</span>
            </div>
          )}
        </div>
        
        {/* Live Predictions */}
        <div className="space-y-2 mb-3">
          {predictions.map((p, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-foreground/70 w-8">{p.asset}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getSignalColor(p.signal)}`}>
                  {p.signal}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-1.5 bg-foreground/10 rounded overflow-hidden">
                  <div 
                    className="h-full bg-purple-400 transition-all duration-500" 
                    style={{ width: `${p.confidence * 100}%` }}
                  />
                </div>
                <span className="text-purple-400 w-10 text-right">{(p.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Model Performance */}
        <div className="border-t border-purple-500/20 pt-2">
          <div className="text-foreground/50 text-[10px] mb-2">MODEL PERFORMANCE</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div className="flex justify-between">
              <span className="text-foreground/50">Accuracy</span>
              <span className="text-cyan-400">{(modelMetrics.accuracy * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/50">Sharpe</span>
              <span className="text-green-400">{modelMetrics.sharpe.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/50">Win Rate</span>
              <span className="text-yellow-400">{(modelMetrics.winRate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/50">Avg Return</span>
              <span className="text-green-400">+{(modelMetrics.avgReturn * 100).toFixed(2)}%</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-2 border-t border-purple-500/20 text-center">
          <span className="text-purple-400/60 text-[10px]">TensorFlow • LSTM • NLP • Regime Detection</span>
        </div>
      </div>
    </div>
  )
}

// ============================================
// 📊 LATENCY MONITOR - Your C++ Performance Stats
// Shows your actual achievement: sub-5ms latency, 50K+ ticks/sec
// ============================================
export function LatencyMonitor() {
  const [stats, setStats] = useState({
    latency: 3.2,
    ticksPerSec: 48234,
    uptime: 99.97,
    queueDepth: 12,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        latency: Math.max(0.8, Math.min(4.9, prev.latency + (Math.random() - 0.5) * 0.5)),
        ticksPerSec: Math.floor(48000 + Math.random() * 4000),
        uptime: 99.97,
        queueDepth: Math.floor(Math.random() * 20 + 5),
      }))
    }, 100)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed top-20 right-4 z-30 pointer-events-none hidden lg:block">
      <div className="bg-black/80 backdrop-blur-md border border-cyan-500/40 rounded-lg p-4 font-mono text-xs w-56">
        <div className="flex items-center gap-2 mb-3 border-b border-cyan-500/20 pb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-cyan-400 font-bold text-sm">C++ MARKET DATA FEED</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-foreground/60">LATENCY</span>
            <span className={`font-bold ${stats.latency < 5 ? 'text-green-400' : 'text-yellow-400'}`}>
              {stats.latency.toFixed(1)}ms
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foreground/60">THROUGHPUT</span>
            <span className="text-cyan-400 font-bold">{stats.ticksPerSec.toLocaleString()}/s</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foreground/60">QUEUE DEPTH</span>
            <span className="text-purple-400">{stats.queueDepth}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foreground/60">UPTIME</span>
            <span className="text-green-400">{stats.uptime}%</span>
          </div>
        </div>
        
        <div className="mt-3 pt-2 border-t border-cyan-500/20 text-center">
          <span className="text-cyan-400/60 text-[10px]">Lock-Free Queue • UDP Multicast</span>
        </div>
      </div>
    </div>
  )
}

// ============================================
// 📈 DATA THROUGHPUT COUNTER - Your 200TB+ Achievement
// ============================================
export function DataThroughputCounter() {
  const [data, setData] = useState({
    dailyTB: 0,
    transactions: 0,
    kafkaEvents: 0,
  })

  useEffect(() => {
    // Animate counting up
    const duration = 3000
    const steps = 60
    const interval = duration / steps
    let step = 0

    const timer = setInterval(() => {
      step++
      const progress = step / steps
      const eased = 1 - Math.pow(1 - progress, 3) // Ease out cubic
      
      setData({
        dailyTB: Math.floor(eased * 200),
        transactions: Math.floor(eased * 100),
        kafkaEvents: Math.floor(eased * 2.5 * 10) / 10,
      })
      
      if (step >= steps) {
        clearInterval(timer)
        // After initial animation, add small fluctuations
        const fluctuate = setInterval(() => {
          setData(prev => ({
            dailyTB: 200 + Math.floor(Math.random() * 10),
            transactions: 100 + Math.floor(Math.random() * 5),
            kafkaEvents: 2.5 + Math.random() * 0.3,
          }))
        }, 2000)
        return () => clearInterval(fluctuate)
      }
    }, interval)
    
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="fixed bottom-24 right-4 z-30 pointer-events-none hidden lg:block">
      <div className="bg-black/80 backdrop-blur-md border border-green-500/40 rounded-lg p-4 font-mono text-xs w-56">
        <div className="flex items-center gap-2 mb-3 border-b border-green-500/20 pb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400 font-bold text-sm">DATA PIPELINE STATS</span>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="text-foreground/60 mb-1">DAILY THROUGHPUT</div>
            <div className="text-3xl font-bold text-green-400">{data.dailyTB}TB+</div>
          </div>
          <div className="flex justify-between">
            <div>
              <div className="text-foreground/60 text-[10px]">TRANSACTIONS</div>
              <div className="text-cyan-400 font-bold">{data.transactions}M+</div>
            </div>
            <div className="text-right">
              <div className="text-foreground/60 text-[10px]">KAFKA EVENTS</div>
              <div className="text-purple-400 font-bold">{data.kafkaEvents.toFixed(1)}B/day</div>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-2 border-t border-green-500/20 text-center">
          <span className="text-green-400/60 text-[10px]">Spark • AWS EMR • Redshift</span>
        </div>
      </div>
    </div>
  )
}

// ============================================
// 📐 LIVE GREEKS CALCULATOR - Black-Scholes Greeks
// Shows your quantitative finance expertise
// ============================================
export function LiveGreeksCalculator() {
  const [option, setOption] = useState({
    S: 100,      // Spot price
    K: 100,      // Strike
    r: 0.05,     // Risk-free rate
    sigma: 0.20, // Volatility
    T: 0.25,     // Time to expiry (years)
  })
  
  const [greeks, setGreeks] = useState({ delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 })

  // Black-Scholes Greeks calculation
  const calculateGreeks = (S: number, K: number, r: number, sigma: number, T: number) => {
    const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T))
    const d2 = d1 - sigma * Math.sqrt(T)
    
    // Standard normal PDF and CDF approximations
    const pdf = (x: number) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI)
    const cdf = (x: number) => {
      const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741
      const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911
      const sign = x < 0 ? -1 : 1
      x = Math.abs(x) / Math.sqrt(2)
      const t = 1 / (1 + p * x)
      const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
      return 0.5 * (1 + sign * y)
    }
    
    const delta = cdf(d1)
    const gamma = pdf(d1) / (S * sigma * Math.sqrt(T))
    const theta = -(S * pdf(d1) * sigma) / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * cdf(d2)
    const vega = S * pdf(d1) * Math.sqrt(T)
    const rho = K * T * Math.exp(-r * T) * cdf(d2)
    
    return { delta, gamma, theta: theta / 365, vega: vega / 100, rho: rho / 100 }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate market movement
      setOption(prev => {
        const newS = prev.S + (Math.random() - 0.5) * 2
        const newSigma = Math.max(0.1, Math.min(0.4, prev.sigma + (Math.random() - 0.5) * 0.02))
        return { ...prev, S: newS, sigma: newSigma }
      })
    }, 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setGreeks(calculateGreeks(option.S, option.K, option.r, option.sigma, option.T))
  }, [option])

  return (
    <div className="fixed top-20 left-4 z-30 pointer-events-none hidden xl:block">
      <div className="bg-black/80 backdrop-blur-md border border-purple-500/40 rounded-lg p-4 font-mono text-xs w-64">
        <div className="flex items-center gap-2 mb-3 border-b border-purple-500/20 pb-2">
          <span className="text-purple-400 font-bold text-sm">BLACK-SCHOLES GREEKS</span>
        </div>
        
        {/* Option Parameters */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-[10px]">
          <div className="text-center">
            <div className="text-foreground/50">SPOT</div>
            <div className="text-cyan-400">${option.S.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-foreground/50">STRIKE</div>
            <div className="text-foreground">${option.K}</div>
          </div>
          <div className="text-center">
            <div className="text-foreground/50">IV</div>
            <div className="text-yellow-400">{(option.sigma * 100).toFixed(1)}%</div>
          </div>
        </div>
        
        {/* Greeks Display */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-foreground/60">Δ Delta</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-foreground/10 rounded overflow-hidden">
                <div 
                  className="h-full bg-green-400 transition-all duration-300" 
                  style={{ width: `${greeks.delta * 100}%` }}
                />
              </div>
              <span className="text-green-400 w-12 text-right">{greeks.delta.toFixed(3)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foreground/60">Γ Gamma</span>
            <span className="text-cyan-400">{greeks.gamma.toFixed(4)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foreground/60">Θ Theta</span>
            <span className="text-red-400">{greeks.theta.toFixed(4)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foreground/60">ν Vega</span>
            <span className="text-purple-400">{greeks.vega.toFixed(4)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foreground/60">ρ Rho</span>
            <span className="text-yellow-400">{greeks.rho.toFixed(4)}</span>
          </div>
        </div>
        
        <div className="mt-3 pt-2 border-t border-purple-500/20 text-center">
          <span className="text-purple-400/60 text-[10px]">MS Financial Engineering • WQU</span>
        </div>
      </div>
    </div>
  )
}

// ============================================
// HERO EQUATION MORPH - Large animated equations
// ============================================
export function HeroEquationMorph() {
  const equations = [
    { eq: "dS = μSdt + σSdW", name: "Geometric Brownian Motion" },
    { eq: "C = S₀N(d₁) - Ke⁻ʳᵗN(d₂)", name: "Black-Scholes Formula" },
    { eq: "dv = κ(θ-v)dt + ξ√v dWᵥ", name: "Heston Stochastic Volatility" },
    { eq: "∇θ J(θ) = 𝔼[∇θ log π(a|s) R]", name: "Policy Gradient" },
    { eq: "Sharpe = (Rₚ - Rғ) / σₚ", name: "Risk-Adjusted Returns" },
    { eq: "VaR₀.₉₅ = μ - 1.645σ", name: "Value at Risk" },
  ]
  
  const [currentIndex, setCurrentIndex] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % equations.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="fixed top-[15%] left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <div 
            className="text-5xl md:text-7xl lg:text-8xl font-mono font-bold tracking-tight px-4"
            style={{
              background: 'linear-gradient(135deg, #22d3ee 0%, #a78bfa 50%, #4ade80 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 40px rgba(34, 211, 238, 0.8)) drop-shadow(0 0 80px rgba(167, 139, 250, 0.5))',
            }}
          >
            {equations[currentIndex].eq}
          </div>
          <motion.div 
            className="text-cyan-400 text-base mt-4 font-mono tracking-widest uppercase font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {equations[currentIndex].name}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ============================================
// DATA FLOW STREAMS - Flowing particles
// ============================================
export function DataFlowStreams() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    
    // Create flowing particles
    const streams: { x: number; y: number; speed: number; size: number; hue: number }[] = []
    for (let i = 0; i < 50; i++) {
      streams.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() * 2 + 1,
        size: Math.random() * 3 + 1,
        hue: Math.random() * 60 + 170, // Cyan to purple
      })
    }
    
    let animationId: number
    let lastTime = 0
    const fps = 30
    const interval = 1000 / fps
    
    const draw = (time: number) => {
      if (time - lastTime < interval) {
        animationId = requestAnimationFrame(draw)
        return
      }
      lastTime = time
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      streams.forEach(p => {
        // Draw glowing particle
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
        gradient.addColorStop(0, `hsla(${p.hue}, 80%, 60%, 0.8)`)
        gradient.addColorStop(0.5, `hsla(${p.hue}, 80%, 60%, 0.3)`)
        gradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
        
        // Draw trail
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x - p.speed * 15, p.y)
        ctx.strokeStyle = `hsla(${p.hue}, 80%, 60%, 0.4)`
        ctx.lineWidth = p.size * 0.5
        ctx.stroke()
        
        // Move
        p.x += p.speed
        if (p.x > canvas.width + 50) {
          p.x = -50
          p.y = Math.random() * canvas.height
        }
      })
      
      animationId = requestAnimationFrame(draw)
    }
    
    animationId = requestAnimationFrame(draw)
    
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 pointer-events-none opacity-30"
    />
  )
}

// ============================================
// PULSING HEX GRID - Geometric background
// ============================================
export function PulsingHexGrid() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-20">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hexPattern" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon 
              points="30,0 60,15 60,37 30,52 0,37 0,15" 
              fill="none" 
              stroke="#22d3ee" 
              strokeWidth="1"
              className="hex-pulse"
            />
          </pattern>
          <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexPattern)" />
        {/* Glowing orbs over hex grid */}
        <circle cx="20%" cy="30%" r="200" fill="url(#hexGradient)" className="hex-glow-1" />
        <circle cx="80%" cy="70%" r="250" fill="url(#hexGradient)" className="hex-glow-2" />
        <circle cx="50%" cy="50%" r="150" fill="url(#hexGradient)" className="hex-glow-3" />
      </svg>
      <style>{`
        .hex-pulse {
          animation: hexPulse 3s ease-in-out infinite;
        }
        .hex-glow-1 {
          animation: hexFloat 8s ease-in-out infinite;
        }
        .hex-glow-2 {
          animation: hexFloat 10s ease-in-out infinite reverse;
        }
        .hex-glow-3 {
          animation: hexFloat 6s ease-in-out infinite;
          animation-delay: 2s;
        }
        @keyframes hexPulse {
          0%, 100% { stroke-opacity: 0.4; }
          50% { stroke-opacity: 1; }
        }
        @keyframes hexFloat {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
          50% { transform: translate(30px, -30px) scale(1.3); opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
