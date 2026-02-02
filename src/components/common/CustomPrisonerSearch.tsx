import React, { useCallback } from "react";
import SearchableSelect from "./SearchableSelect";
import { fetchPrisoners } from "../../services/customPrisonersService";
import { useFilters } from "../../contexts/FilterContext";

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

  // Paginated server fetch (14M+ ready). Uses SearchableSelect server mode.
  const fetchPrisonersPaginated = useCallback(async (opts: any, signal?: AbortSignal) => {
    // Seed with initialItems on first empty search if provided
    if (!opts?.search && (opts?.page ?? 1) === 1 && (initialItems?.length ?? 0) > 0) {
      return { items: initialItems, count: initialItems.length, next: null };
    }

    const res = await fetchPrisoners({
      search: opts?.search ?? "",
      page: opts?.page ?? 1,
      page_size: opts?.page_size ?? pageSize,
      station: globalStation || null,
      district: globalDistrict || null,
      region: globalRegion || null,
    }, signal as any);

    const data = Array.isArray(res) ? { results: res, count: res.length, next: null } : (res?.data ?? res ?? {});
    const items = data?.items ?? data?.results ?? [];
    return {
      items,
      count: data?.count ?? items.length ?? 0,
      next: data?.next ?? null,
    };
  }, [initialItems, pageSize, globalStation, globalDistrict, globalRegion]);

  const renderItem = useCallback((p: Item) => {
    const id = String(p[idField]);
    const label = String(p[labelField] ?? id);
    const stationName = p.current_station_name ?? p.station_name ?? "";
    return (
      <div className="flex flex-col">
        <span className="text-sm">{label}</span>
        <span className="text-xs text-gray-500">{p.prisoner_number_value ?? p.prisoner_number ?? ""}{stationName ? ` • ${stationName}` : ""}</span>
      </div>
    );
  }, [idField, labelField]);

  return (
    <SearchableSelect
      fetchPaginated={fetchPrisonersPaginated}
      value={value ?? null}
      onChange={(val) => {
        onChange(val);
      }}
      onSelectItem={onSelectItem}
      placeholder={placeholder}
      idField={idField}
      labelField={labelField}
      renderItem={renderItem}
      pageSize={pageSize}
      minQueryLength={0}
      className={className}
      disabled={disabled}
    />
  );
}