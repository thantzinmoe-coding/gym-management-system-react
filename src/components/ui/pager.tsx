import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PagerProps {
  /** Current page, starting at 1. */
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Disables the buttons while a page is loading. */
  disabled?: boolean;
  /** What is being counted, e.g. "records". */
  noun?: string;
}

/** Page numbers to show: always the first and last, plus the neighbours of the current page. */
function pageWindow(page: number, totalPages: number): (number | 'gap')[] {
  const wanted = new Set([1, totalPages, page - 1, page, page + 1]);
  const pages = [...wanted].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

/** "Showing 21–40 of 245 records" with previous / numbered / next buttons. */
export function Pager({ page, totalPages, totalItems, pageSize, onPageChange, disabled, noun = 'records' }: PagerProps) {
  if (totalItems === 0) return null;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col items-center justify-between gap-3 pt-4 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Showing {first}–{last} of {totalItems} {noun}
      </p>
      {totalPages > 1 && (
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <Button variant="outline" size="sm" disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          {pageWindow(page, totalPages).map((p, i) =>
            p === 'gap' ? (
              <span key={`gap-${i}`} className="px-1 text-muted-foreground" aria-hidden>…</span>
            ) : (
              <Button
                key={p}
                size="sm"
                variant={p === page ? 'default' : 'outline'}
                aria-current={p === page ? 'page' : undefined}
                disabled={disabled}
                onClick={() => onPageChange(p)}
                className="min-w-9"
              >
                {p}
              </Button>
            ),
          )}
          <Button variant="outline" size="sm" disabled={disabled || page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </nav>
      )}
    </div>
  );
}
