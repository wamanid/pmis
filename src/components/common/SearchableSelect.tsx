import React, { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { usePaginatedSearch } from "../../hooks/usePaginatedSearch";

/**
 * Enhancements:
 * - New optional prop `fetchPaginated` for services that return paginated shape { items, count, next }.
 * - If `fetchPaginated` supplied, SearchableSelect will use usePaginatedSearch and expose "Load more".
 * - Backwards-compatible: legacy `fetchOptions(q, signal)` that returns array or { items } still works.
 */

export interface SearchableSelectProps<T = any> {
  value?: string | null;
  onChange: (id: string | null) => void;
  items?: T[]; // static mode
  fetchOptions?: (q: string, signal?: AbortSignal) => Promise<T[] | { items: T[]; count?: number }>;
  // new paginated fetch API (preferred for big datasets)
  fetchPaginated?: (opts: { search?: string; page?: number; page_size?: number; [k: string]: any }, signal?: AbortSignal) => Promise<{ items: T[]; count?: number; next?: string | null }>;
  placeholder?: string;
  idField?: string;
  labelField?: string;
  renderItem?: (item: T) => React.ReactNode;
  className?: string;
  pageSize?: number;
  debounceMs?: number;
  minQueryLength?: number;
  cacheTTL?: number;
  onError?: (err: any) => void;
  onLoading?: (loading: boolean) => void;
}

export default function SearchableSelect<T = any>({
  value,
  onChange,
  items,
  fetchOptions,
  fetchPaginated,
  placeholder = "Select...",
  idField = "id",
  labelField = "name",
  renderItem,
  className,
  pageSize = 25,
  debounceMs = 400,
  minQueryLength = 0,
  cacheTTL = 60_000,
  onError,
  onLoading,
}: SearchableSelectProps<T>) {
  // Static mode
  if (!fetchOptions && !fetchPaginated) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const shown = (items ?? []).filter((it: any) => {
      if (!query) return true;
      const label = String(it[labelField] ?? "").toLowerCase();
      return label.includes(query.toLowerCase());
    });

    const selectedLabel = (() => {
      const found = (items ?? []).find((it: any) => String(it[idField]) === String(value));
      if (found) return renderItem ? renderItem(found) : (found[labelField] ?? String(found[idField]));
      return null;
    })();

    return (
      <Select value={value ?? ""} onValueChange={(v) => onChange(v || null)}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder}>{selectedLabel ?? placeholder}</SelectValue>
        </SelectTrigger>

        <SelectContent>
          <div className="px-3 py-2">
            <Input
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              className="mb-2"
              autoFocus
            />
          </div>

          {shown.length === 0 ? (
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

  // Server (paginated) mode — prefer fetchPaginated; if only legacy fetchOptions given, we wrap it.
  const fetchFn = fetchPaginated
    ? fetchPaginated
    : async (opts: any, signal?: AbortSignal) => {
        // wrap legacy fetchOptions(q, signal) into paginated shape
        const res = await (fetchOptions as any)(opts.search ?? "", signal);
        if (Array.isArray(res)) return { items: res, count: res.length, next: null };
        return { items: res.items ?? [], count: res.count ?? 0, next: null };
      };

  const { query, setQuery, items: results, loading, hasNext, loadMore } = usePaginatedSearch<T>(fetchFn, {
    initialQuery: "",
    pageSize,
    debounceMs,
    filters: {},
    initialItems: [],
    idField,
  });

  const selectedLabel = (() => {
    const found = (results ?? []).find((it: any) => String(it[idField]) === String(value));
    if (found) return renderItem ? renderItem(found) : (found[labelField] ?? String(found[idField]));
    return null;
  })();

  return (
    <Select value={value ?? ""} onValueChange={(v) => onChange(v || null)}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>{selectedLabel ?? placeholder}</SelectValue>
      </SelectTrigger>

      <SelectContent>
        <div className="px-3 py-2">
          <Input
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            className="mb-2"
            autoFocus
          />
        </div>

        {loading && results.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">Loading...</div>
        ) : results.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">No results.</div>
        ) : (
          <>
            {results.map((it: any) => (
              <SelectItem key={String(it[idField])} value={String(it[idField])}>
                {renderItem ? renderItem(it) : (it[labelField] ?? "")}
              </SelectItem>
            ))}

            {hasNext && (
              <div className="px-3 py-2 flex items-center justify-center">
                <button type="button" onClick={() => loadMore()} className="text-sm text-[#650000] px-3 py-1 rounded hover:underline" disabled={loading}>
                  {loading ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
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