import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

interface LibraryPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function LibraryPagination({ page, totalPages, onPageChange }: LibraryPaginationProps) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (item) => item === 1 || item === totalPages || Math.abs(item - page) <= 1,
  )

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 pt-4" aria-label="Movie library pagination" data-testid="library-pagination">
      <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onPageChange(page - 1)} data-testid="pagination-previous"><ChevronLeft />Previous</Button>
      {pages.map((item, index) => (
        <span key={item} className="contents">
          {index > 0 && pages[index - 1] !== item - 1 && <span className="px-1 text-muted-foreground">…</span>}
          <Button variant={item === page ? "primary" : "ghost"} size="icon-sm" onClick={() => onPageChange(item)} aria-current={item === page ? "page" : undefined} data-testid={`pagination-page-${item}`}>{item}</Button>
        </span>
      ))}
      <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => onPageChange(page + 1)} data-testid="pagination-next">Next<ChevronRight /></Button>
    </nav>
  )
}

