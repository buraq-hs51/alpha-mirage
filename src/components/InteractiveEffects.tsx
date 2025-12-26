import { useEffect, useState, useRef, useCallback } from "react"
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

  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  
  const springConfig = { stiffness: 300, damping: 25, mass: 0.5 }
  const springX = useSpring(cursorX, springConfig)
  const springY = useSpring(cursorY, springConfig)

  // Smooth trailing cursor positions
  const trail1X = useSpring(cursorX, { stiffness: 150, damping: 20 })
  const trail1Y = useSpring(cursorY, { stiffness: 150, damping: 20 })
  const trail2X = useSpring(cursorX, { stiffness: 80, damping: 18 })
  const trail2Y = useSpring(cursorY, { stiffness: 80, damping: 18 })
  const trail3X = useSpring(cursorX, { stiffness: 40, damping: 15 })
  const trail3Y = useSpring(cursorY, { stiffness: 40, damping: 15 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX
      const newY = e.clientY
      
      // Calculate velocity
      const vx = newX - lastPos.current.x
      const vy = newY - lastPos.current.y
      const speed = Math.sqrt(vx * vx + vy * vy)
      
      cursorX.set(newX)
      cursorY.set(newY)
      
      // Spawn particles based on speed
      if (speed > 5) {
        const numParticles = Math.min(Math.floor(speed / 10), 3)
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
        
        setParticles(prev => [...prev.slice(-20), ...newParticles])
      }
      
      lastPos.current = { x: newX, y: newY }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [cursorX, cursorY])

  // Cleanup old particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.slice(-15))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Only show on desktop
  if (typeof window !== 'undefined' && window.innerWidth < 768) return null

  return (
    <>
      {/* Ambient glow that follows cursor loosely */}
      <motion.div
        className="fixed pointer-events-none z-40"
        style={{
          x: trail3X,
          y: trail3Y,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div 
          className="w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, oklch(0.7 0.15 190 / 0.08) 0%, oklch(0.6 0.2 280 / 0.03) 40%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </motion.div>

      {/* Secondary glow ring */}
      <motion.div
        className="fixed pointer-events-none z-40"
        style={{
          x: trail2X,
          y: trail2Y,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div 
          className="w-[200px] h-[200px] rounded-full"
          style={{
            background: 'radial-gradient(circle, oklch(0.75 0.18 190 / 0.15) 0%, oklch(0.72 0.19 145 / 0.05) 50%, transparent 70%)',
            filter: 'blur(20px)',
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Inner glow trail */}
      <motion.div
        className="fixed pointer-events-none z-40"
        style={{
          x: trail1X,
          y: trail1Y,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div 
          className="w-[80px] h-[80px] rounded-full"
          style={{
            background: 'radial-gradient(circle, oklch(0.8 0.2 190 / 0.3) 0%, oklch(0.75 0.18 190 / 0.1) 50%, transparent 70%)',
            filter: 'blur(8px)',
          }}
        />
      </motion.div>

      {/* Main cursor core */}
      <motion.div
        className="fixed pointer-events-none z-50"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        {/* Rotating ring */}
        <motion.div
          className="absolute w-8 h-8 -left-4 -top-4 rounded-full border border-cyan-400/40"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Pulsing core */}
        <motion.div
          className="w-3 h-3 rounded-full"
          style={{
            background: 'linear-gradient(135deg, oklch(0.85 0.2 190) 0%, oklch(0.75 0.18 170) 100%)',
            boxShadow: `
              0 0 10px oklch(0.8 0.2 190 / 0.8),
              0 0 20px oklch(0.75 0.18 190 / 0.6),
              0 0 40px oklch(0.7 0.15 190 / 0.4),
              0 0 60px oklch(0.65 0.12 190 / 0.2)
            `,
          }}
          animate={{
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
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
  const [offset, setOffset] = useState(0)

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prev => prev.map(stock => ({
        ...stock,
        price: stock.price + (Math.random() - 0.5) * 2,
        change: stock.change + (Math.random() - 0.5) * 0.5
      })))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(prev => prev + 1)
    }, 30)
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
        <div 
          className="flex items-center gap-12 py-2.5 whitespace-nowrap"
          style={{ transform: `translateX(-${offset % (stocks.length * 180)}px)` }}
        >
          {[...stocks, ...stocks, ...stocks, ...stocks].map((stock, i) => (
            <motion.div 
              key={i} 
              className="flex items-center gap-3 font-mono text-sm"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-foreground font-bold tracking-wide">{stock.symbol}</span>
              <span className="text-foreground/70">${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <motion.span 
                className={`flex items-center gap-1 font-semibold ${stock.change >= 0 ? "text-green-400" : "text-red-400"}`}
                animate={{ 
                  textShadow: stock.change >= 0 
                    ? ['0 0 5px oklch(0.72 0.19 145 / 0.5)', '0 0 15px oklch(0.72 0.19 145 / 0.8)', '0 0 5px oklch(0.72 0.19 145 / 0.5)']
                    : ['0 0 5px oklch(0.65 0.20 25 / 0.5)', '0 0 15px oklch(0.65 0.20 25 / 0.8)', '0 0 5px oklch(0.65 0.20 25 / 0.5)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {stock.change >= 0 ? "▲" : "▼"} {Math.abs(stock.change).toFixed(2)}%
              </motion.span>
            </motion.div>
          ))}
        </div>
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
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    
    const chars = "01∑∏∫∂∇αβγδεμσρφψ+-×÷=<>≈∞√ΔΓΘΛ".split("")
    const fontSize = 14
    const columns = Math.floor(canvas.width / fontSize)
    const drops: number[] = Array(columns).fill(1)
    const speeds: number[] = Array(columns).fill(0).map(() => Math.random() * 0.5 + 0.5)
    const brightness: number[] = Array(columns).fill(0).map(() => Math.random() * 0.5 + 0.3)
    
    const draw = () => {
      // Semi-transparent black to create trail effect
      ctx.fillStyle = 'rgba(10, 15, 26, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize
        
        // Vary the color between cyan and green with glow
        const hue = 170 + Math.random() * 30 // cyan to teal range
        const alpha = brightness[i]
        
        ctx.font = `${fontSize}px JetBrains Mono, monospace`
        ctx.fillStyle = `oklch(0.7 0.15 ${hue} / ${alpha})`
        ctx.shadowColor = `oklch(0.7 0.18 ${hue} / 0.5)`
        ctx.shadowBlur = 10
        ctx.fillText(char, x, y)
        ctx.shadowBlur = 0
        
        // Reset drop randomly
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
          brightness[i] = Math.random() * 0.5 + 0.3
        }
        
        drops[i] += speeds[i]
      }
    }
    
    const interval = setInterval(draw, 50)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', resize)
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
  const orbs = [
    { size: 400, x: '10%', y: '20%', color: '190', duration: 20, delay: 0 },
    { size: 300, x: '80%', y: '60%', color: '145', duration: 25, delay: 5 },
    { size: 350, x: '50%', y: '80%', color: '280', duration: 22, delay: 2 },
    { size: 250, x: '20%', y: '70%', color: '85', duration: 18, delay: 8 },
    { size: 200, x: '70%', y: '15%', color: '200', duration: 30, delay: 3 },
  ]

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, oklch(0.5 0.15 ${orb.color} / 0.15) 0%, oklch(0.4 0.1 ${orb.color} / 0.05) 40%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
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
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="oklch(0.75 0.18 190)" strokeWidth="0.5"/>
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
      
      {/* Scanning line effect */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
        animate={{
          top: ['-10%', '110%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
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
    for (let i = 0; i < 50; i++) {
      const volatility = 2 + Math.random() * 4
      const change = (Math.random() - 0.48) * volatility // slight upward bias
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
    const interval = setInterval(() => {
      setCandles(generateCandles())
    }, 4000)
    return () => clearInterval(interval)
  }, [generateCandles])

  return (
    <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none overflow-hidden">
      {/* Gradient fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
      
      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1000 100" className="opacity-30">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {candles.map((candle, i) => {
          const x = (i / candles.length) * 1000
          const width = 16
          const isGreen = candle.close >= candle.open
          const color = isGreen ? "oklch(0.72 0.19 145)" : "oklch(0.65 0.20 25)"
          
          return (
            <motion.g 
              key={candle.id}
              filter="url(#glow)"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02, duration: 0.4, ease: "easeOut" }}
            >
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
            </motion.g>
          )
        })}
      </svg>
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
