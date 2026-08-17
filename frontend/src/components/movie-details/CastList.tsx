import { motion } from "framer-motion"
import { UserRound } from "lucide-react"

import type { CastCredit } from "@/features/library/types"

interface CastListProps {
  cast: CastCredit[]
  accent: string
}

export function CastList({ cast, accent }: CastListProps) {
  return (
    <section aria-labelledby="cast-title" data-testid="movie-cast-section">
      <h2 id="cast-title" className="text-xl font-bold tracking-tight sm:text-2xl">Cast</h2>
      {cast.length ? (
        <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {cast.map((credit, index) => (
            <motion.article key={`${credit.id}-${credit.character}`} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="w-36 shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-card" data-testid={`cast-member-${credit.id}`}>
              <div className="relative aspect-square bg-cover bg-center" style={credit.photo_url ? { backgroundImage: `url("${credit.photo_url}")` } : { background: `radial-gradient(circle at 70% 20%, ${accent}99, transparent 35%), linear-gradient(145deg, ${accent}55, #18181b 65%)` }}>
                {!credit.photo_url && <UserRound className="absolute bottom-3 left-1/2 size-16 -translate-x-1/2 text-white/25" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
              </div>
              <div className="p-3"><h3 className="truncate text-sm font-semibold">{credit.name}</h3><p className="mt-1 truncate text-xs text-muted-foreground">{credit.character}</p></div>
            </motion.article>
          ))}
        </div>
      ) : <p className="mt-3 text-sm text-muted-foreground">Cast information is coming soon.</p>}
    </section>
  )
}

