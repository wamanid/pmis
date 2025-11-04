import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FilterContextType {
  region: string;
  district: string;
  station: string;
  setRegion: (value: string) => void;
  setDistrict: (value: string) => void;
  setStation: (value: string) => void;
  getFilterParams: () => Record<string, string>;
  clearFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const STORAGE_KEY = 'pmis_user_filters';

interface StoredFilters {
  region: string;
  district: string;
  station: string;
}

export function FilterProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage or empty
  const [region, setRegionState] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: StoredFilters = JSON.parse(stored);
        return parsed.region || '';
      } catch {
        return '';
      }
    }
    return '';
  });

  const [district, setDistrictState] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: StoredFilters = JSON.parse(stored);
        return parsed.district || '';
      } catch {
        return '';
      }
    }
    return '';
  });

  const [station, setStationState] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: StoredFilters = JSON.parse(stored);
        return parsed.station || '';
      } catch {
        return '';
      }
    }
    return '';
  });

  // Save to localStorage whenever filters change
  useEffect(() => {
    const filters: StoredFilters = { region, district, station };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [region, district, station]);

  const setRegion = (value: string) => {
    setRegionState(value);
    // Clear dependent filters
    setDistrictState('');
    setStationState('');
  };

  const setDistrict = (value: string) => {
    setDistrictState(value);
    // Clear dependent filter
    setStationState('');
  };

  const setStation = (value: string) => {
    setStationState(value);
  };

  // Get filter params for API requests
  const getFilterParams = (): Record<string, string> => {
    const params: Record<string, string> = {};
    if (region) params.region = region;
    if (district) params.district = district;
    if (station) params.station = station;
    return params;
  };

  // Clear all filters
  const clearFilters = () => {
    setRegionState('');
    setDistrictState('');
    setStationState('');
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <FilterContext.Provider
      value={{
        region,
        district,
        station,
        setRegion,
        setDistrict,
        setStation,
        getFilterParams,
        clearFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
