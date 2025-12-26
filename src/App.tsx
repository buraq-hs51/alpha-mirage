import { Navigation } from "@/components/Navigation"
import { Hero } from "@/components/Hero"
import { About } from "@/components/About"
import { Experience } from "@/components/Experience"
import { Projects } from "@/components/Projects"
import { Education } from "@/components/Education"
import { Skills } from "@/components/Skills"
import { Contact } from "@/components/Contact"
import { Toaster } from "@/components/ui/sonner"
import InteractiveEffects from "@/components/InteractiveEffects"

function App() {
  return (
    <div className="min-h-screen cursor-none">
      {/* Background Interactive Effects */}
      <InteractiveEffects />
      
      {/* Main Content */}
      <div className="relative">
        <Navigation />
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Contact />
        
        <footer className="py-8 px-6 border-t border-border/30 bg-secondary/20">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-sm text-muted-foreground mb-2">
              © {new Date().getFullYear()} Shadaab Ahmed. Quantitative Developer & Financial Engineer.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Built with React, TypeScript & Tailwind CSS
            </p>
          </div>
        </footer>
      </div>

      <Toaster />
    </div>
  )
}

export default App