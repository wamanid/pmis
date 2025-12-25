import React, { useEffect, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { fetchStaffProfiles } from "../../services/staffProfilesService";
import { usePaginatedSearch } from "../../hooks/usePaginatedSearch";

export interface StaffProfileSelectProps {
  value?: string | null; // UUID id
  onChange: (id: string | null) => void;
  placeholder?: string;
  className?: string;
  initialItems?: any[]; // <- new optional prop
}

export default function StaffProfileSelect({
  value,
  onChange,
  placeholder = "Select staff...",
  className,
  initialItems = [], // <- default
}: StaffProfileSelectProps) {
  const { query, setQuery, items, loading, hasNext, loadMore } = usePaginatedSearch<any>(fetchStaffProfiles, {
    initialQuery: "",
    pageSize: 50,
    debounceMs: 300,
    filters: {},
    initialItems: initialItems || [], // <-- forward initial items
    idField: "id",
  });

  // resolve selected label from items
  const selected = items.find((it) => String(it.id) === String(value));
  const selectedLabel = selected ? `${selected.first_name ?? ""} ${selected.last_name ?? ""}${selected.force_number ? ` [${selected.force_number}]` : ""}`.trim() : null;

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
            onKeyDown={(e) => e.stopPropagation()}
            className="mb-2"
            autoFocus
          />
        </div>

        {loading && items.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">Loading...</div>
        ) : items.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">No results.</div>
        ) : (
          <>
            {items.map((it) => (
              <SelectItem key={String(it.id)} value={String(it.id)}>
                {`${it.first_name ?? ""} ${it.last_name ?? ""}${it.force_number ? ` [${it.force_number}]` : ""}`}
              </SelectItem>
            ))}

            {hasNext && (
              <div className="px-3 py-2 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => loadMore()}
                  className="text-sm text-[#650000] px-3 py-1 rounded hover:underline"
                  disabled={loading}
                >
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
