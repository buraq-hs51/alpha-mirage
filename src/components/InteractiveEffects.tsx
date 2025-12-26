import { useEffect, useState, useRef, useCallback, memo } from "react"
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion"

// Quant formulas and code snippets
const codeSnippets = [
  "μ = E[R]",
  "σ² = Var(R)",
  "Δ = ∂V/∂S",
  "Γ = ∂²V/∂S²",
  "ρ = Corr(X,Y)",
  "VaR₀.₉₅",
  "α + βRₘ",
  "N(d₁)",
  "e^{-rT}",
  "∫σdW",
  "PnL++",
  "λ = 0.94",
  "θ = -∂V/∂t",
  "κ(θ-v)",
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
      <StockTicker />
      <InteractiveCursor />
    </>
  )
}
