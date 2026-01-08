import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import * as StaffEntryService from "../../services/stationServices/staffEntryService";

interface StaffProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  staff_name?: string;
  force_number?: string;
  rank?: string;
  rank_name?: string;
  [k: string]: any;
}

interface Props {
  value: string;
  onChange: (id: string | null) => void;
  placeholder?: string;
  initialItems?: StaffProfile[];
  className?: string;
}

export default function StaffProfileSelect({
  value,
  onChange,
  placeholder = "Search staff...",
  initialItems = [],
  className,
}: Props) {
  const [items, setItems] = useState<StaffProfile[]>(initialItems || []);
  const [query, setQuery] = useState("");
  const debounceRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // merge incoming initialItems when they change
  useEffect(() => {
    if (!initialItems || initialItems.length === 0) return;
    setItems((prev) => {
      const map = new Map(prev.map((i) => [i.id, i]));
      for (const it of initialItems) map.set(it.id, it);
      return Array.from(map.values());
    });
  }, [initialItems]);

  // on mount: if no items, fetch a small initial page so the dropdown shows entries immediately
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if ((items || []).length > 0) return;
      try {
        const res = await StaffEntryService.fetchStaffProfiles({ page_size: 10 });
        if (cancelled) return;
        const list = Array.isArray(res) ? res : (res?.results ?? []);
        if (list && list.length) {
          setItems((prev) => {
            const map = new Map(prev.map((i) => [i.id, i]));
            for (const it of list) map.set(it.id, it);
            return Array.from(map.values());
          });
        }
      } catch (err) {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, []); // run once

  // if a value is set but not in items, fetch it so the SelectValue label renders
  useEffect(() => {
    if (!value) return;
    if (items.some((i) => i.id === value)) return;
    let cancelled = false;
    (async () => {
      try {
        const profiles = await StaffEntryService.fetchStaffProfiles({ id: value });
        const p = profiles?.[0] ?? null;
        if (p && !cancelled) {
          setItems((prev) => {
            if (prev.some((i) => i.id === p.id)) return prev;
            return [p, ...prev];
          });
        }
      } catch (e) {
        // ignore silently
        console.debug("prefetch staff profile failed", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [value, items]);

  const labelFor = useMemo(() => {
    return (it?: StaffProfile | null) => {
      if (!it) return "";
      const name = (it.first_name || it.last_name)
        ? `${it.first_name ?? ""} ${it.last_name ?? ""}`.trim()
        : (it.staff_name ?? "");
      const force = it.force_number ?? it.staff_force_number ?? "";
      if (name && force) return `${name} [${force}]`;
      if (name) return name;
      if (force) return force;
      return it.id;
    };
  }, []);

  // debounced remote search
  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (!query) return;
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await StaffEntryService.fetchStaffProfiles({ search: query, page_size: 10 });
        if (!mountedRef.current) return;
        const list = Array.isArray(res) ? res : (res?.results ?? []);
        setItems((prev) => {
          const map = new Map(prev.map((i) => [i.id, i]));
          for (const it of list) map.set(it.id, it);
          return Array.from(map.values());
        });
      } catch (err) {
        console.debug("staff search error", err);
      }
    }, 250);
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [query]);

  return (
    <Select value={value} onValueChange={(v) => onChange(v || null)}>
      <SelectTrigger className={className}>
        {/* Render selected label explicitly so closed trigger shows correct text immediately */}
        <SelectValue placeholder={placeholder}>
          {labelFor(items.find(i => i.id === value) ?? null)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <div className="px-3 py-2">
          <Input
            placeholder="Search staff..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mb-2"
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>

        {items.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">No staff found</div>
        ) : (
          items.map((it) => (
            <SelectItem key={it.id} value={it.id}>
              <div className="flex flex-col">
                <div className="text-sm">{labelFor(it)}</div>
                <div className="text-xs text-muted-foreground">
                  {it.rank_name ?? it.rank ?? ""} {it.station_name ? `• ${it.station_name}` : ""}
                </div>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
