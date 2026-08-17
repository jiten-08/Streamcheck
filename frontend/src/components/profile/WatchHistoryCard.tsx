import { Clock3, History, Play } from "lucide-react"
import { Link } from "react-router-dom"

import { buttonVariants } from "@/components/ui/button-variants"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { WatchHistoryItem } from "@/features/profile/types"

interface Props { items: WatchHistoryItem[]; loading: boolean }

export function WatchHistoryCard({ items, loading }: Props) {
  return <Card id="watch-history" className="scroll-mt-24" data-testid="watch-history-card"><CardHeader><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-indigo-400"><History className="size-5" /></span><div><h2 className="text-lg font-bold">Watch history</h2><p className="text-sm text-muted-foreground">Titles you recently played.</p></div></div></CardHeader><CardContent>
    {loading ? <div className="grid gap-3 sm:grid-cols-2">{[1,2,3,4].map((item) => <Skeleton key={item} className="h-28 rounded-xl" />)}</div> : items.length ? <div className="grid gap-3 sm:grid-cols-2">{items.map(({ id, movie, last_watched_at }) => <article key={id} className="group flex min-w-0 gap-3 rounded-xl border bg-background/45 p-3 transition-colors hover:border-primary/40" data-testid={`watch-history-item-${movie.slug}`}><Link to={`/movies/${movie.slug}`} className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary">{movie.poster_url ? <img src={movie.poster_url} alt="" className="size-full object-cover transition-transform group-hover:scale-105" /> : <div className="size-full" style={{ background: `linear-gradient(145deg, ${movie.accent_color}, #18181b)` }} />}<span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100"><Play className="size-5 fill-white" /></span></Link><div className="min-w-0 flex-1 py-1"><Link to={`/movies/${movie.slug}`} className="line-clamp-1 font-semibold hover:text-indigo-400">{movie.title}</Link><p className="mt-1 text-xs text-muted-foreground">{movie.category.name} · {movie.duration}</p><p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="size-3.5" />{new Date(last_watched_at).toLocaleDateString()}</p></div></article>)}</div> : <div className="rounded-xl border border-dashed p-7 text-center"><History className="mx-auto size-8 text-muted-foreground" /><h3 className="mt-3 font-semibold">Nothing watched yet</h3><p className="mt-1 text-sm text-muted-foreground">Start a title and it will appear here.</p><Link to="/library" className={`${buttonVariants({ variant: "secondary" })} mt-5`}>Browse library</Link></div>}
  </CardContent></Card>
}
