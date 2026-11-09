import { useCallback, useEffect, useRef, useState } from 'react';
import { gymPackageService } from '@/services/gymPackageService';
import type { Package } from '@/context/PackageContext';

/**
 * One page of packages of one type (PERSONAL or GROUP), newest first, loaded from the server.
 * Changing the page loads that page; reload() fetches the current page again after an add/edit/delete.
 */
export function usePagedPackages(type: 'PERSONAL' | 'GROUP', pageSize = 12) {
  const [items, setItems] = useState<Package[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const latest = useRef(0); // a slow answer for an older page must not replace a newer one

  const load = useCallback(async (p: number) => {
    const id = ++latest.current;
    setLoading(true);
    try {
      const res = await gymPackageService.getGymPackagesByType(type, p - 1, pageSize);
      if (id !== latest.current) return;
      const pages = Math.max(1, res?.meta?.totalPages ?? 1);
      setItems(res?.data ?? []);
      setTotalItems(res?.meta?.totalItems ?? 0);
      setTotalPages(pages);
      if (p > pages) setPage(pages); // the last items of a page were removed
    } catch (err) {
      console.error(`Failed to fetch ${type} packages`, err);
    } finally {
      if (id === latest.current) setLoading(false);
    }
  }, [type, pageSize]);

  useEffect(() => {
    load(page);
  }, [load, page]);

  return { items, page, setPage, totalPages, totalItems, pageSize, loading, reload: () => load(page) };
}
