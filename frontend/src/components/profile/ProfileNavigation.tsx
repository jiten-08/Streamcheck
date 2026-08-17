import { Clock3, Crown, History, KeyRound, UserRound } from "lucide-react"

const items = [{ label: "Personal information", href: "#personal-information", icon: UserRound }, { label: "Subscription", href: "#subscription", icon: Crown }, { label: "Watch history", href: "#watch-history", icon: History }, { label: "Activity", href: "#activity", icon: Clock3 }, { label: "Security", href: "#security", icon: KeyRound }]

export function ProfileNavigation() {
  return <nav className="sticky top-20 flex gap-2 overflow-x-auto rounded-xl border bg-card/80 p-2 backdrop-blur lg:block lg:space-y-1" aria-label="Profile sections">{items.map(({ label, href, icon: Icon }) => <a key={href} href={href} className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><Icon className="size-4" />{label}</a>)}</nav>
}
