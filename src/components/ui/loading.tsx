import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * The app's one loading style: gray placeholder blocks shaped like the content that is
 * coming. Use these instead of "Loading..." text, spinners, or a flash of "No data found".
 */

/** Page title and subtitle placeholders. */
export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-4 w-96 max-w-full" />
    </div>
  );
}

/** A row of summary cards (counts, totals). */
export function StatCardsSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', count >= 4 && 'lg:grid-cols-4', className)}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

/** A single large panel. */
export function PanelSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-64 rounded-xl', className)} />;
}

/** Table-like rows: a header strip and `rows` lines. */
export function TableSkeleton({ rows = 6, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)} aria-hidden>
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

/** List rows with an avatar and two text lines, for people, chats and notifications. */
export function ListSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)} aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

/** A grid of cards, for packages, equipment and trainers. */
export function CardGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', className)} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <Card key={i}>
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** A form: label and input pairs plus a button. */
export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className="space-y-5" aria-hidden>
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

/** A skeleton inside a titled card, when the page title itself is already on screen. */
export function CardBodySkeleton({ kind = 'table', rows }: { kind?: 'table' | 'list' | 'grid' | 'form'; rows?: number }) {
  if (kind === 'list') return <ListSkeleton rows={rows} />;
  if (kind === 'grid') return <CardGridSkeleton count={rows} />;
  if (kind === 'form') return <FormSkeleton fields={rows} />;
  return <TableSkeleton rows={rows} />;
}

/** Shown while a signed-in page's code downloads: header, summary cards, and a big panel. */
export function PageSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <PageHeaderSkeleton />
      <StatCardsSkeleton />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={5} />
        </CardContent>
      </Card>
    </div>
  );
}

/** Shown while a public page (home, about, login...) downloads: top bar, hero and cards. */
export function PublicPageSkeleton() {
  return (
    <div className="min-h-screen bg-background" role="status" aria-label="Loading">
      <div className="flex h-16 items-center justify-between border-b px-6">
        <Skeleton className="h-8 w-32" />
        <div className="hidden gap-6 md:flex">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-4 w-16" />)}
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="mx-auto max-w-6xl space-y-10 px-6 py-12">
        <div className="space-y-4">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <CardGridSkeleton count={3} />
      </div>
    </div>
  );
}
