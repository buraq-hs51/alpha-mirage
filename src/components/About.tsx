import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, TrendUp, Rocket } from "@phosphor-icons/react"
import { motion } from "framer-motion"

export function About() {
  return (
    <section id="about" className="py-24 px-6 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <User size={32} className="text-accent" weight="duotone" />
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">About Me</h2>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="lg:col-span-2"
          >
            <Card className="h-full p-8 border-border/50 bg-card/50 backdrop-blur hover:border-accent/30 transition-all duration-300">
              <h3 className="text-2xl font-semibold mb-6 text-accent">Professional Summary</h3>
              
              <div className="space-y-4 text-card-foreground/90 leading-relaxed">
                <p>
                  I'm a <strong className="text-accent">multidisciplinary technologist</strong> with 4.5 years of experience spanning 
                  software engineering, data engineering, machine learning, and quantitative finance. My expertise bridges distributed 
                  systems architecture, high-throughput data pipelines, deep learning models, and quantitative trading systems—building 
                  production infrastructure that powers data-driven financial decisions.
                </p>

                <p>
                  <strong className="text-foreground">Software Engineering:</strong> Built microservices using MCP frameworks, architected 
                  distributed systems with event-driven architectures, and developed <strong className="text-foreground">C++ market data feeds 
                  processing 50K+ ticks/second with sub-5ms latency</strong>. Designed <strong className="text-foreground">Go-based order 
                  management systems</strong> with real-time Black-Scholes Greeks computation, leveraging concurrent programming patterns and 
                  lock-free data structures.
                </p>

                <p>
                  <strong className="text-foreground">Data Engineering & Big Data:</strong> Engineered high-throughput data pipelines processing 
                  <strong className="text-foreground">200TB+ daily</strong> using Spark and AWS EMR, optimized distributed ETL workflows supporting 
                  100M+ transactions, and built real-time streaming architectures with Kafka. Reduced infrastructure costs by 25% while improving 
                  system reliability and data processing efficiency.
                </p>

                <p>
                  <strong className="text-foreground">Machine Learning:</strong> Developed deep learning models using <strong className="text-foreground">
                  TensorFlow</strong> for time series prediction and classification tasks, implemented <strong className="text-foreground">NLP 
                  pipelines</strong> for text analysis and sentiment modeling, and applied machine learning techniques to financial markets—building 
                  predictive models for trading signals, regime detection, and risk assessment.
                </p>

                <p>
                  Currently pursuing <strong className="text-foreground">MS Financial Engineering at WorldQuant University</strong>, I'm integrating 
                  my software engineering, data engineering, and ML expertise with rigorous quantitative finance theory—derivatives pricing, stochastic 
                  modeling, and portfolio optimization. This unique combination positions me to build the next generation of quantitative trading 
                  infrastructure that leverages modern ML/data engineering practices.
                </p>

                <p className="pt-2">
                  I'm seeking <strong className="text-accent">quantitative developer roles</strong> where I can apply my comprehensive 
                  skill set in algorithmic trading systems, quantitative research platforms, or ML-driven trading infrastructure. Open to relocation 
                  globally for the right opportunity.
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-6"
          >
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur hover:border-accent/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <TrendUp size={24} className="text-accent" weight="duotone" />
                <h3 className="text-lg font-semibold">Core Strengths</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Distributed Systems & Microservices",
                  "Low-Latency Systems (C++/Go)",
                  "Big Data Pipelines (Spark, Kafka)",
                  "Machine Learning & Deep Learning",
                  "NLP & TensorFlow",
                  "Quantitative Trading Systems",
                  "Derivatives Pricing",
                  "Real-Time Analytics"
                ].map((strength, i) => (
                  <li key={i} className="flex items-center gap-2 text-card-foreground/80">
                    <span className="text-accent">▸</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur hover:border-accent/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <Rocket size={24} className="text-accent" weight="duotone" />
                <h3 className="text-lg font-semibold">Target Roles</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Quantitative Developer",
                  "Trading Systems Engineer",
                  "Derivatives Pricing Developer",
                  "Quantitative Analyst",
                  "Market Data Engineer"
                ].map((role, i) => (
                  <Badge
                    key={i}
                    className="bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-colors"
                  >
                    {role}
                  </Badge>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
