import { useEffect, useRef, useState } from "react";

export function usePaginatedSearch<T extends { id?: string | number }>(
  fetchFn: (options: any, signal?: AbortSignal) => Promise<{ items: T[]; count: number; next?: string | null }>,
  {
    initialQuery = "",
    pageSize = 25,
    debounceMs = 300,
    filters = {},
    initialItems = [] as T[],
    idField = "id",
  }: {
    initialQuery?: string;
    pageSize?: number;
    debounceMs?: number;
    filters?: Record<string, any>;
    initialItems?: T[];
    idField?: string;
  } = {}
) {
  const [query, setQuery] = useState(initialQuery);
  const [items, setItems] = useState<T[]>(initialItems || []);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);
  const seenIdsRef = useRef(new Set<string | number>());

  // initialize seen ids from initialItems
  useEffect(() => {
    const s = new Set<string | number>();
    (initialItems || []).forEach((it) => {
      const id = (it as any)[idField] ?? (it as any).id;
      if (id !== undefined) s.add(String(id));
    });
    seenIdsRef.current = s;
    setItems(initialItems || []);
  }, [initialItems, idField]);

  const doFetch = (q: string, p: number, reset = false) => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);

    const opts = { search: q, page: p, page_size: pageSize, ...filters };

    fetchFn(opts, ctrl.signal)
      .then((res) => {
        const newItems = res.items || [];
        setHasNext(!!res.next);
        if (reset) {
          // reset seen ids and items
          const s = new Set<string | number>();
          newItems.forEach((it) => {
            const id = (it as any)[idField] ?? (it as any).id;
            if (id !== undefined) s.add(String(id));
          });
          seenIdsRef.current = s;
          setItems(newItems);
          setPage(1);
        } else {
          // append while preventing duplicates
          const toAppend: T[] = [];
          newItems.forEach((it) => {
            const id = (it as any)[idField] ?? (it as any).id;
            const key = id !== undefined ? String(id) : undefined;
            if (!key || !seenIdsRef.current.has(key)) {
              if (key) seenIdsRef.current.add(key);
              toAppend.push(it);
            }
          });
          setItems((prev) => [...prev, ...toAppend]);
        }
      })
      .catch((err) => {
        if ((err as any)?.name !== "AbortError") setError(err);
      })
      .finally(() => {
        setLoading(false);
        if (abortRef.current === ctrl) abortRef.current = null;
      });
  };

  // Debounced search + reset to page 1
  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      // reset page to 1 and fetch fresh
      setPage(1);
      doFetch(query, 1, true);
    }, debounceMs);
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, JSON.stringify(filters)]); // re-run when filters change

  const loadMore = () => {
    if (!hasNext || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    doFetch(query, nextPage, false);
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return {
    query,
    setQuery,
    items,
    loading,
    error,
    hasNext,
    loadMore,
    setPage,
  };
}