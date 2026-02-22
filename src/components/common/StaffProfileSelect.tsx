import React, { useCallback, useRef, useEffect } from "react";
import SearchableSelect from "./SearchableSelect";
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
  value?: string | null;
  onChange: (id: string | null) => void;
  placeholder?: string;
  initialItems?: StaffProfile[];
  initialItem?: StaffProfile;
  className?: string;
}

export default function StaffProfileSelect({
  value,
  onChange,
  placeholder = "Search staff...",
  initialItems = [],
  initialItem,
  className,
}: Props) {
  // Debug logging
  React.useEffect(() => {
    if (initialItem) {
      console.log('StaffProfileSelect received initialItem:', initialItem);
      console.log('StaffProfileSelect value:', value);
    }
  }, [initialItem, value]);

  // Use ref to capture current initialItems without recreating callback
  const initialItemsRef = useRef(initialItems);
  
  useEffect(() => {
    initialItemsRef.current = initialItems;
  }, [initialItems]);

  // Paginated server fetch (14M+ ready). Uses SearchableSelect server mode.
  // CRITICAL: Empty dependency array = stable reference = no re-fetches on form changes
  const fetchStaffPaginated = useCallback(async (opts: any, signal?: AbortSignal) => {
    const currentInitialItems = initialItemsRef.current;
    
    // If parent passed initialItems, return them for the first empty search to avoid extra round-trip
    if (!opts?.search && (opts?.page ?? 1) === 1 && (currentInitialItems?.length ?? 0) > 0) {
      return { items: currentInitialItems, count: currentInitialItems.length, next: null };
    }

    const res = await StaffEntryService.fetchStaffProfiles({
      search: opts?.search ?? "",
      page: opts?.page ?? 1,
      page_size: opts?.page_size ?? 50,
    }, signal as any);

    const data = Array.isArray(res) ? { results: res, count: res.length, next: null } : (res?.data ?? res ?? {});
    const items = data?.results ?? [];
    return {
      items,
      count: data?.count ?? items.length ?? 0,
      next: data?.next ?? null,
    };
  }, []); // Empty deps - function never recreates

  const renderItem = useCallback((it: StaffProfile) => {
    const name = (it.first_name || it.last_name)
      ? `${it.first_name ?? ""} ${it.last_name ?? ""}`.trim()
      : (it.staff_name ?? "");
    const force = it.force_number ?? it.staff_force_number ?? "";
    const label = name && force ? `${name} [${force}]` : (name || force || it.id);
    return (
      <div className="flex flex-col">
        <span className="text-sm">{label}</span>
        <span className="text-xs text-muted-foreground">{(it.rank_name ?? it.rank ?? "")} {it.station_name ? `• ${it.station_name}` : ""}</span>
      </div>
    );
  }, []);

  return (
    <SearchableSelect
      fetchPaginated={fetchStaffPaginated}
      value={value ?? null}
      onChange={onChange}
      placeholder={placeholder}
      idField="id"
      labelField="staff_name"
      renderItem={renderItem}
      pageSize={50}
      minQueryLength={0}
      className={className}
      initialItem={initialItem}
    />
  );
}
