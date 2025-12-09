import React, { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

/**
 * SearchableSelect
 *
 * Responsibilities:
 * - Render a dropdown with a search input.
 * - Support two modes:
 *   1) Static items passed via `items` prop (client-side filter).
 *   2) Dynamic lookup via `fetchOptions(q, signal)` (server-side search).
 * - Debounced queries, minQueryLength guard, and a tiny in-memory cache (TTL) to reduce duplicate requests.
 * - Properly cancels in-flight requests using AbortController.
 *
 * Notes for future devs:
 * - The service layer should remain stateless and return raw data. UI handles debounce/cancel/cache.
 * - fetchOptions may return either T[] OR { items: T[]; count?: number } — component normalizes to an array.
 * - Keep cache small and TTL short (default 60s). Cache is only a UX optimization — not a source of truth.
 */

export interface SearchableSelectProps<T = any> {
  value?: string | null;
  onChange: (id: string | null) => void;

  // either provide static items OR provide fetchOptions to query the server
  items?: T[];

  // fetchOptions can return an array or an object { items: T[]; count?: number }
  // second arg is AbortSignal so caller can cancel in-flight requests.
  fetchOptions?: (q: string, signal?: AbortSignal) => Promise<T[] | { items: T[]; count?: number }>;

  placeholder?: string;
  idField?: string;
  labelField?: string;
  renderItem?: (item: T) => React.ReactNode;
  className?: string;
  pageSize?: number;

  // enhancements (configurable per-instance)
  debounceMs?: number;           // ms to wait after typing stops before sending request
  minQueryLength?: number;       // minimum characters before querying server
  cacheTTL?: number;             // ms to keep cached results
  onError?: (err: any) => void;
  onLoading?: (loading: boolean) => void;
}

export default function SearchableSelect<T = any>({
  value,
  onChange,
  items,
  fetchOptions,
  placeholder = "Select...",
  idField = "id",
  labelField = "name",
  renderItem,
  className,
  debounceMs = 400,
  minQueryLength = 0,
  cacheTTL = 60_000,
  onError,
  onLoading,
}: SearchableSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<T[]>(items ?? []);
  const [loading, setLoading] = useState(false);

  // AbortController so we can cancel inflight fetches when a newer query starts
  const abortRef = useRef<AbortController | null>(null);

  // track unmount to avoid state updates after component is gone
  const mountedRef = useRef(true);

  // tiny in-memory cache: query -> { ts, data }
  // purpose: avoid duplicate requests when user toggles dropdown or types back-and-forth
  const cacheRef = useRef<Map<string, { ts: number; data: T[] }>>(new Map());

  // debounce timer id
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      try { abortRef.current?.abort(); } catch {}
    };
  }, []);

  // sync when parent provides static items
  useEffect(() => {
    if (items) setOptions(items);
  }, [items]);

  /**
   * load(q)
   * - Normalizes fetchOptions response into an array.
   * - Uses cache when available and fresh.
   * - Calls onLoading/onError hooks so consumers can react.
   */
  const load = useCallback(async (q: string) => {
    if (!fetchOptions) return;
    // cancel previous request
    try { abortRef.current?.abort(); } catch {}
    const c = new AbortController();
    abortRef.current = c;

    setLoading(true);
    onLoading?.(true);

    try {
      const key = String(q ?? "").trim();

      // return cached data if fresh
      const cached = cacheRef.current.get(key);
      if (cached && (Date.now() - cached.ts) <= cacheTTL) {
        if (!mountedRef.current) return;
        setOptions(cached.data ?? []);
        return;
      }

      // perform fetch; fetchOptions may return array OR { items, count }
      const res = await fetchOptions(q, c.signal);
      if (!mountedRef.current) return;

      // normalize response to array
      let data: T[] = [];
      if (Array.isArray(res)) {
        data = res as T[];
      } else if (res && Array.isArray((res as any).items)) {
        data = (res as any).items as T[];
      } else {
        data = [];
      }

      setOptions(data);
      try { cacheRef.current.set(key, { ts: Date.now(), data }); } catch (e) { /* ignore cache set errors */ }
    } catch (err: any) {
      // ignore Abort errors (normal during rapid typing)
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;

      // surface error to caller and log for devs
      onError?.(err);
      // Keep console.error in dev only; avoid logging tokens or sensitive data in production.
      console.error("SearchableSelect fetch error (dev):", err);

      // clear options on error to avoid stale UIs
      setOptions([]);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        onLoading?.(false);
      }
    }
  }, [fetchOptions, cacheTTL, onError, onLoading]);

  // debounce effect for query changes when using fetchOptions (server mode)
  useEffect(() => {
    if (!fetchOptions) return;

    // if query is too short, don't call the server; clear pending debounce
    const qTrim = (query || "").trim();
    if (qTrim.length < minQueryLength && qTrim.length > 0) {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      return;
    }

    // clear previous debounce timer
    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    const id = window.setTimeout(() => load(query), debounceMs);
    debounceRef.current = id;

    return () => {
      window.clearTimeout(id);
      debounceRef.current = null;
    };
  }, [query, load, fetchOptions, debounceMs, minQueryLength]);

  // on open: trigger load if query meets minQueryLength (useful to populate dropdown)
  useEffect(() => {
    if (open && fetchOptions) {
      if ((query || "").trim().length >= minQueryLength) load(query);
    }
  }, [open, fetchOptions, load, query, minQueryLength]);

  // selectedLabel resolves selected value to rendered label using current options
  const selectedLabel = (() => {
    // options is always an array here
    const found = (options ?? []).find((it: any) => String(it[idField]) === String(value));
    if (found) return renderItem ? renderItem(found) : (found[labelField] ?? String(found[idField]));
    return null;
  })();

  // shown is the list displayed. If we use static items (no fetchOptions) do a client filter.
  const shown = !fetchOptions
    ? (options ?? []).filter((it: any) => {
        if (!query) return true;
        const label = String(it[labelField] ?? "").toLowerCase();
        return label.includes(query.toLowerCase());
      })
    : options;

  return (
    <Select value={value ?? ""} onValueChange={(v) => onChange(v || null)}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {selectedLabel ?? placeholder}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        <div className="px-3 py-2">
          <Input
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            // prevent Select from consuming key events so typing works as expected
            onKeyDown={(e) => e.stopPropagation()}
            className="mb-2"
            aria-label={`Search ${placeholder}`}
            autoFocus
          />
        </div>

        {loading ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">Loading...</div>
        ) : shown.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">No results.</div>
        ) : (
          shown.map((it: any) => (
            <SelectItem key={String(it[idField])} value={String(it[idField])}>
              {renderItem ? renderItem(it) : (it[labelField] ?? "")}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}






// Add a tiny CommandSelect wrapper for simple client-side lists (static items). 
// It uses the Popover + Command UI (same UX used across the app), 
// exposes the same basic props (value, onChange, items, idField, 
// labelField, renderItem) so you can swap it in where you only need 
// client-side filtering. No debounce, no fetch/cancel/cache — smaller and faster.


// import React from "react";
// import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
// import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "../ui/command";
// import { Button } from "../ui/button";
// import { Check } from "lucide-react";

// export type SimpleOption = { [k: string]: any };

// interface Props {
//   value?: string | null;
//   onChange: (id: string | null) => void;
//   items: SimpleOption[];
//   placeholder?: string;
//   idField?: string;
//   labelField?: string;
//   renderItem?: (item: SimpleOption) => React.ReactNode;
//   className?: string;
//   buttonClassName?: string;
// }

// export default function CommandSelect({
//   value,
//   onChange,
//   items,
//   placeholder = "Select...",
//   idField = "id",
//   labelField = "name",
//   renderItem,
//   className,
//   buttonClassName,
// }: Props) {
//   const selected = items.find((it) => String(it[idField]) === String(value));
//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <Button variant="outline" className={buttonClassName} type="button" aria-expanded={Boolean(selected)}>
//           {selected ? (renderItem ? renderItem(selected) : selected[labelField]) : placeholder}
//         </Button>
//       </PopoverTrigger>

//       <PopoverContent className={`w-full p-0 ${className ?? ""}`}>
//         <Command>
//           <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
//           <CommandList>
//             <CommandEmpty>No results.</CommandEmpty>
//             <CommandGroup>
//               {items.map((it) => {
//                 const id = String(it[idField]);
//                 const label = renderItem ? null : String(it[labelField] ?? "");
//                 return (
//                   <CommandItem
//                     key={id}
//                     value={label || id}
//                     onSelect={() => {
//                       onChange(id);
//                     }}
//                   >
//                     <Check className={`mr-2 h-4 w-4 ${String(value) === id ? "opacity-100" : "opacity-0"}`} />
//                     <div className="flex flex-col">
//                       {renderItem ? renderItem(it) : <div>{label}</div>}
//                     </div>
//                   </CommandItem>
//                 );
//               })}
//             </CommandGroup>
//           </CommandList>
//         </Command>
//       </PopoverContent>
//     </Popover>
//   );
// }



// Usage example (replace a static dropdown)

// no filepath — paste into the component where you want to use it
// import CommandSelect from '../common/CommandSelect';

// <CommandSelect
//   value={accountForm.prisoner}
//   onChange={(id) => setAccountForm({...accountForm, prisoner: id})}
//   items={prisoners}                // array of { id, full_name, prisoner_number, ... }
//   idField="id"
//   labelField="full_name"
//   renderItem={(p) => (
//     <>
//       <div>{p.full_name}</div>
//       <div className="text-xs text-muted-foreground font-mono">{p.prisoner_number}</div>
//     </>
//   )}
//   placeholder="Select prisoner..."
// />