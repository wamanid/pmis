import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../ui/utils";
import { fetchPrisoners } from "../../services/customPrisonersService";
import { useFilters } from "../../contexts/FilterContext";
import { usePaginatedSearch } from "../../hooks/usePaginatedSearch";

type Item = Record<string, any>;

type Props = {
  value?: string | null;
  onChange: (val: string | null) => void;
  placeholder?: string;
  pageSize?: number;
  disabled?: boolean;
  className?: string;
  idField?: string; // default "id"
  labelField?: string; // default "full_name"
  initialItems?: Item[]; // optional initial list
  onSelectItem?: (item: Item) => void; // <--- add this prop
};

export default function CustomPrisonerSearch({
  value = null,
  onChange,
  placeholder = "Search prisoner...",
  pageSize = 25,
  disabled = false,
  className,
  idField = "id",
  labelField = "full_name",
  initialItems = [],
  onSelectItem, // <--- destructure here
}: Props) {
  const { station: globalStation, district: globalDistrict, region: globalRegion } = useFilters();

  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [contentWidth, setContentWidth] = useState<number | null>(null);

  // use hook for paginated search (debounced + abort + loadMore)
  const {
    query,
    setQuery,
    items,
    loading,
    error,
    hasNext,
    loadMore,
  } = usePaginatedSearch<Item>(fetchPrisoners, {
    initialQuery: "",
    pageSize,
    debounceMs: 300,
    filters: {
      station: globalStation || null,
      district: globalDistrict || null,
      region: globalRegion || null,
      useCache: true,
    },
    initialItems: initialItems || [],
    idField,
  });

  // keep selected label in sync with provided value and items
  useEffect(() => {
    if (!value) {
      setSelectedLabel(null);
      return;
    }
    const found = items.find((it) => String(it[idField]) === String(value));
    if (found) {
      setSelectedLabel(found[labelField]);
      return;
    }
    // if not found in current items, try to fetch single record
    const ctrl = new AbortController();
    fetchPrisoners({ search: String(value), page_size: 1, page: 1, station: globalStation || null, district: globalDistrict || null, region: globalRegion || null }, ctrl.signal)
      .then((res) => {
        const p = (res.items || [])[0];
        if (p) {
          setSelectedLabel(p[labelField]);
        }
      })
      .catch(() => {})
      .finally(() => ctrl.abort());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, items, idField, labelField]);

  useEffect(() => {
    if (!open) return;
    const updateWidth = () => {
      const w = triggerRef.current?.offsetWidth ?? null;
      setContentWidth(w);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [open]);

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left"
            type="button"
            disabled={disabled}
            onClick={() => {
              // open and ensure initial fetch for empty query
              if (!open) {
                // only trigger the debounced hook fetch when we don't already have items
                if (items.length === 0) {
                  setQuery(""); // trigger initial fetch (hook is debounced)
                }
              }
            }}
          >
            {value ? (selectedLabel ?? String(value)) : <span className="text-gray-500 text-sm">{placeholder}</span>}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          // allow the dropdown content to scroll when many items are rendered
          className="p-0"
          style={{
            ...(contentWidth ? { width: `${contentWidth}px` } : undefined),
            maxHeight: "380px", // adjust as needed (32rem ~= 512px)
            overflowY: "auto",   // vertical scroll
            overflowX: "hidden", // prevent horizontal scroll
            WebkitOverflowScrolling: "touch" // ✅ enables smooth trackpad/touch scrolling
          }}
        >
          <Command shouldFilter={false}>
            <CommandInput placeholder={placeholder} value={query} onValueChange={(v) => setQuery(v)} />
            {/* ensure the internal list can scroll (some inner elements set overflow-hidden) */}
            <CommandList className="max-h-[380px] " style={{ WebkitOverflowScrolling: "touch" }}>
              {loading && items.length === 0 ? (
                <div className="flex items-center justify-center py-4">
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : (
                <>
                  <CommandEmpty>No prisoner found.</CommandEmpty>
                  <CommandGroup>
                    {items.map((p) => {
                      const id = String(p[idField]);
                      const label = String(p[labelField] ?? id);

                      // derive stable station fields for each item (tries multiple common keys)
                      const stationId = p.current_station ?? p.station ?? p.current_station_id ?? p.station_id ?? p.stationId ?? "";
                      const stationName = p.current_station_name ?? p.station_name ?? p.stationName ?? "";

                      return (
                        <CommandItem
                          key={id}
                          value={id}
                          onSelect={() => {
                            onChange(id);
                            setSelectedLabel(label);
                            // call parent with full item plus explicit station fields (guaranteed keys)
                            try {
                              onSelectItem?.({ ...p, stationId, stationName });
                            } catch {}
                            setOpen(false);
                          }}
                          className="cursor-pointer"
                        >
                          <Check className={cn("mr-2 h-4 w-4", String(value) === id ? "opacity-100" : "opacity-0")} style={{ color: "#650000" }} />
                          <div className="flex flex-col text-sm">
                            <span>{label}</span>
                            <span className="text-xs text-gray-500">{p.prisoner_number_value ?? p.prisoner_number ?? ""}</span>
                          </div>

                          {/* hidden metadata (kept in DOM for debugging / easy extraction) */}
                          <span style={{ display: "none" }} data-station-id={stationId} data-station-name={stationName} />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>

                  {/* Load more */}
                  {hasNext && (
                    <div className="flex items-center justify-center p-2">
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
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}