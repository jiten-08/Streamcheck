import { motion } from "framer-motion"
import { Info, Play, Plus, Star, Volume2 } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import type { Movie } from "@/features/movies/types"

interface HeroBannerProps {
  movie: Movie
}

export function HeroBanner({ movie }: HeroBannerProps) {
  return (
    <section className="relative isolate min-h-[500px] overflow-hidden rounded-2xl border border-white/8 bg-card shadow-2xl shadow-black/30 sm:min-h-[540px]" aria-labelledby="featured-title" data-testid="hero-banner">
      <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 74% 32%, ${movie.accent}80 0%, transparent 28%), radial-gradient(circle at 90% 80%, #312e8180 0%, transparent 32%), linear-gradient(105deg, #09090b 20%, #18181b 58%, ${movie.accent}38 115%)` }} />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgb(255_255_255/0.12)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.12)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(90deg,transparent,black)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      <motion.div initial={{ opacity: 0, x: 40, rotate: 5 }} animate={{ opacity: 1, x: 0, rotate: 3 }} transition={{ duration: 0.7, ease: "easeOut" }} className="absolute right-[8%] top-[12%] hidden aspect-[2/3] w-56 overflow-hidden rounded-2xl border border-white/15 shadow-2xl shadow-black/60 lg:block" style={{ background: `radial-gradient(circle at 70% 20%, #a5b4fc 0%, transparent 28%), linear-gradient(155deg, ${movie.accent}, #18181b 55%, #09090b)` }}>
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(45deg,transparent_45%,white_48%,transparent_51%)] [background-size:28px_28px]" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/75 to-transparent p-6 pt-24">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">A StreamCheck Original</p>
          <p className="mt-2 text-2xl font-black uppercase leading-none tracking-tight text-white">Eclipse<br />Protocol</p>
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }} className="relative z-10 flex min-h-[500px] max-w-3xl flex-col justify-end px-5 pb-14 pt-24 sm:min-h-[540px] sm:px-10 sm:pb-16 lg:px-14">
        <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} className="mb-5 flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="rounded-md bg-primary px-2.5 py-1 font-bold uppercase tracking-wider text-white">Featured</span>
          <span className="flex items-center gap-1 text-amber-300"><Star className="size-3.5 fill-current" />{movie.rating}</span>
          <span className="text-success">{movie.match}% Match</span>
          <span className="text-zinc-300">{movie.year}</span>
          <span className="rounded border border-white/25 px-1.5 py-0.5 text-zinc-300">{movie.maturity}</span>
          <span className="text-zinc-300">{movie.duration}</span>
        </motion.div>
        <motion.p variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-300">StreamCheck Original</motion.p>
        <motion.h1 id="featured-title" variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} className="mt-2 max-w-2xl text-4xl font-black uppercase leading-[0.92] tracking-[-0.04em] text-white drop-shadow-2xl sm:text-6xl lg:text-7xl">{movie.title}</motion.h1>
        <motion.p variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} className="mt-4 text-base font-medium text-zinc-200">{movie.tagline}</motion.p>
        <motion.p variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} className="mt-2 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base sm:leading-7">{movie.description}</motion.p>
        <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} className="mt-7 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="bg-white text-black shadow-xl shadow-white/10 hover:bg-zinc-200"><Link to={`/watch/${movie.slug}`} data-testid="hero-watch-button"><Play className="fill-current" />Watch now</Link></Button>
          <Button asChild size="lg" variant="secondary" className="bg-white/10 text-white backdrop-blur hover:bg-white/20"><Link to={`/movies/${movie.slug}`} data-testid="hero-info-button"><Info />More info</Link></Button>
          <Button size="icon" variant="outline" className="ml-auto hidden rounded-full border-white/25 bg-black/20 text-white backdrop-blur sm:inline-flex" aria-label="Add to watchlist"><Plus /></Button>
          <Button size="icon" variant="outline" className="hidden rounded-full border-white/25 bg-black/20 text-white backdrop-blur sm:inline-flex" aria-label="Toggle sound"><Volume2 /></Button>
        </motion.div>
      </motion.div>
    </section>
  )
}
