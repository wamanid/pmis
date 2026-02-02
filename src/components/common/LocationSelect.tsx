import React, { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Search } from "lucide-react";

interface LocationSelectProps<T = any> {
  items: T[];
  value?: string | null;
  onChange: (value: string) => void;
  idField?: string;
  labelField?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * LocationSelect - Lightweight dropdown for location cascades
 * 
 * Optimized for small-medium datasets (regions, districts, counties, etc.)
 * Features:
 * - Instant client-side search with debouncing
 * - No complex state management
 * - Handles dynamic items arrays correctly
 * - Disabled state support for cascading
 */
export function LocationSelect<T = any>({
  items = [],
  value,
  onChange,
  idField = "id",
  labelField = "name",
  placeholder = "Select...",
  disabled = false,
  className = ""
}: LocationSelectProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter((item: any) => {
      const label = item[labelField]?.toString().toLowerCase() || "";
      return label.includes(query);
    });
  }, [items, searchQuery, labelField]);

  // Get display label for selected value
  const selectedLabel = useMemo(() => {
    if (!value) return null;
    const selectedItem = items.find((item: any) => item[idField] === value);
    return selectedItem ? selectedItem[labelField] : null;
  }, [value, items, idField, labelField]);

  // Reset search when dropdown closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearchQuery("");
    }
  };

  return (
    <Select 
      value={value || undefined} 
      onValueChange={onChange}
      disabled={disabled}
      onOpenChange={handleOpenChange}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {selectedLabel || placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {/* Search input - only show if more than 5 items */}
        {items.length > 5 && (
          <div className="flex items-center border-b px-3 pb-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-full border-0 bg-transparent p-0 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        
        {/* Items list */}
        <div className="max-h-[300px] overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {items.length === 0 ? "No items available" : "No results found"}
            </div>
          ) : (
            filteredItems.map((item: any) => (
              <SelectItem key={item[idField]} value={item[idField]}>
                {item[labelField]}
              </SelectItem>
            ))
          )}
        </div>
      </SelectContent>
    </Select>
  );
}

export default LocationSelect;
