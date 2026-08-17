import { motion } from "framer-motion"
import { ChevronRight, Film } from "lucide-react"

import type { Genre } from "@/features/movies/types"

interface GenreGridProps {
  genres: Genre[]
}

export function GenreGrid({ genres }: GenreGridProps) {
  return (
    <section id="genres" className="scroll-mt-24" aria-labelledby="genres-title" data-testid="genres-section">
      <div className="mb-5"><h2 id="genres-title" className="text-xl font-bold tracking-tight sm:text-2xl">Browse by genre</h2><p className="mt-1 text-sm text-muted-foreground">Find something for every mood</p></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {genres.map((genre, index) => (
          <motion.button key={genre.name} type="button" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }} whileHover={{ y: -4 }} className="group relative min-h-32 overflow-hidden rounded-xl border border-white/8 p-4 text-left shadow-lg shadow-black/20" style={{ background: `radial-gradient(circle at 85% 15%, ${genre.accent}80, transparent 36%), linear-gradient(145deg, ${genre.accent}35, #18181b 65%)` }}>
            <Film className="absolute -right-3 -top-2 size-20 rotate-12 text-white/10 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-110" />
            <div className="relative flex h-full flex-col justify-end"><span className="font-bold text-white">{genre.name}</span><span className="mt-1 flex items-center justify-between text-xs text-zinc-400">{genre.count} titles<ChevronRight className="size-4 transition-transform group-hover:translate-x-1" /></span></div>
          </motion.button>
        ))}
      </div>
    </section>
  )
}

