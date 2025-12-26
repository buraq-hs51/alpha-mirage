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
    <div className="fixed bottom-24 right-4 z-20 pointer-events-none">
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
    <div className="fixed top-16 right-4 z-20 pointer-events-none">
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
// MAIN EXPORT - COMBINES ALL EFFECTS
// ============================================
export default function InteractiveEffects() {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  if (!isMounted) return null
  
  return (
    <>
      <FloatingOrbs />
      <GridLines />
      <MatrixRain />
      <NeuralNetworkViz />
      <AlgoStatusWidget />
      <OrderBookDepth />
      <BrownianMotion />
      <CorrelationMatrix />
      <CodeTerminal />
      <StockTicker />
      <InteractiveCursor />
    </>
  )
}
