import React, {useEffect, useState} from 'react';
import { ChevronDown, ChevronRight, Check, ChevronsUpDown, Filter, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '../ui/utils';
import { ManualLockUpItem } from "../../services/stationServices/manualLockupIntegration";
import { getStationsAndTypes } from "../../services/stationServices/utils";
import axiosInstance from '../../services/axiosInstance';
 
interface GroupedLockup {
  station: string;
  stationName: string;
  type: string;
  typeName: string;
  date: string;
  time: string;
  records: ManualLockUpItem[];
  categoryTotals: Record<string, number>; // Dynamic: category_name -> total
  grandTotal: number;
}

interface Location {
  id: string;
  name: string;
  slug?: string;
  description?: string;
}

interface Sex {
  id: string;
  name: string;
  description?: string;
}

interface PrisonerCategory {
  id: string;
  name: string;
  description?: string;
}

// Fully dynamic: keys are "category_sex" like "convict_male", "remand_female"
type CategorySexCounts = Record<string, number>;

type DetailGrid = Record<string, CategorySexCounts>; // location_name -> CategorySexCounts
 
interface ManualLockupTableViewProps {
  lockups: ManualLockUpItem[];
}
 
export function ManualLockupTableView({ lockups }: ManualLockupTableViewProps) {
   const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
   const [stationFilter, setStationFilter] = useState<string>('');
   const [lockupTypeFilter, setLockupTypeFilter] = useState<string>('');
   const [dateFilter, setDateFilter] = useState<string>('');
   const [stationSearchOpen, setStationSearchOpen] = useState(false);
   const [mockStations, setMockStations] = useState<{id:string;name:string}[]>([]);
   const [mockLockupTypes, setMockLockupTypes] = useState<{id:string;name:string}[]>([]);
   const [locations, setLocations] = useState<Location[]>([]);
   const [locationsLoading, setLocationsLoading] = useState(true);
   const [sexes, setSexes] = useState<Sex[]>([]);
   const [sexesLoading, setSexesLoading] = useState(true);
   const [prisonerCategories, setPrisonerCategories] = useState<PrisonerCategory[]>([]);
   const [categoriesLoading, setCategoriesLoading] = useState(true);
 
   // Fetch locations from API
   useEffect(() => {
     const fetchLocations = async () => {
       try {
         setLocationsLoading(true);
         const response = await axiosInstance.get('/system-administration/locations/', {
           params: { page_size: -1 }
         });
         const items = response.data?.results || [];
         setLocations(items);
       } catch (error) {
         console.error('Failed to fetch locations:', error);
         setLocations([]);
       } finally {
         setLocationsLoading(false);
       }
     };
     fetchLocations();
   }, []);

   // Fetch sexes from API
   useEffect(() => {
     const fetchSexes = async () => {
       try {
         setSexesLoading(true);
         const response = await axiosInstance.get('/system-administration/sexes/', {
           params: { page_size: -1 }
         });
         const items = response.data?.results || [];
         setSexes(items);
       } catch (error) {
         console.error('Failed to fetch sexes:', error);
         setSexes([]);
       } finally {
         setSexesLoading(false);
       }
     };
     fetchSexes();
   }, []);

   // Fetch prisoner categories from API
   useEffect(() => {
     const fetchPrisonerCategories = async () => {
       try {
         setCategoriesLoading(true);
         const response = await axiosInstance.get('/system-administration/prisoner-categories/', {
           params: { page_size: -1 }
         });
         const items = response.data?.results || [];
         setPrisonerCategories(items);
       } catch (error) {
         console.error('Failed to fetch prisoner categories:', error);
         setPrisonerCategories([]);
       } finally {
         setCategoriesLoading(false);
       }
     };
     fetchPrisonerCategories();
   }, []);

   useEffect(() => {
     if (Array.isArray(lockups) && lockups.length > 0) {
       const data = getStationsAndTypes(lockups);
       setMockStations(data.stations ?? []);
       setMockLockupTypes(data.types ?? []);
     } else {
       setMockStations([]);
       setMockLockupTypes([]);
     }
   }, [lockups]);
 
   const getStationName = (id: string) => mockStations.find(s => s.id === id)?.name || id;
   const getTypeName = (id: string) => mockLockupTypes.find(t => t.id === id)?.name || id;
 
   // Filter lockups based on selected filters
   const getFilteredLockups = (): ManualLockUpItem[] => {
     if (!Array.isArray(lockups)) return [];
     return lockups.filter(lockup => {
       const matchesStation = !stationFilter || lockup.station === stationFilter;
       const matchesType = !lockupTypeFilter || lockupTypeFilter === 'all' || lockup.type === lockupTypeFilter;
       const matchesDate = !dateFilter || lockup.date === dateFilter;
       return matchesStation && matchesType && matchesDate;
     });
   };
 
   // Group lockups by station, type, date, and time
   const groupLockups = (): GroupedLockup[] => {
     const filtered = getFilteredLockups();
     const grouped: { [key: string]: GroupedLockup } = {};
 
     filtered.forEach(lockup => {
       const key = `${lockup.station_name ?? lockup.station}-${lockup.type_name ?? lockup.type}-${lockup.date}-${lockup.lockup_time}`;
 
       if (!grouped[key]) {
         grouped[key] = {
           station: lockup.station ?? '',
           stationName: lockup.station_name ?? getStationName(lockup.station ?? ''),
           type: lockup.type ?? '',
           typeName: lockup.type_name ?? getTypeName(lockup.type ?? ''),
           date: lockup.date ?? '',
           time: lockup.lockup_time ?? '',
           records: [],
           categoryTotals: {},
           grandTotal: 0,
         };
       }
 
       grouped[key].records.push(lockup);
 
       // Normalize count
       const cnt = Number((lockup as any).count) || 0;
 
       // Dynamically accumulate category totals
       const categoryName = ((lockup as any).prisoner_category_name || '').toLowerCase().trim();
       if (categoryName) {
         if (!grouped[key].categoryTotals[categoryName]) {
           grouped[key].categoryTotals[categoryName] = 0;
         }
         grouped[key].categoryTotals[categoryName] += cnt;
       }
 
       grouped[key].grandTotal += cnt;
     });
 
     return Object.values(grouped);
   };
 
   // Build detail grid from records with dynamic locations, categories, and sexes
   const buildDetailGrid = (records: ManualLockUpItem[]): DetailGrid => {
     // Initialize grid with all locations from API
     const grid: DetailGrid = {};
     locations.forEach(loc => {
       const locationKey = loc.name.toLowerCase().trim();
       grid[locationKey] = {};
       
       // Initialize all category_sex combinations to 0
       prisonerCategories.forEach(cat => {
         sexes.forEach(sex => {
           const catKey = cat.name.toLowerCase().trim();
           const sexKey = sex.name.toLowerCase().trim();
           const fieldKey = `${catKey}_${sexKey}`;
           grid[locationKey][fieldKey] = 0;
         });
       });
     });
 
     records.forEach(record => {
       // Use location_name from API response
       const locationName = ((record as any).location_name || '').toLowerCase().trim();
       
       // Get category from prisoner_category_name
       const categoryName = ((record as any).prisoner_category_name || '').toLowerCase().trim();
       
       // Get sex from sex_name using fetched sexes data
       const sexNameFromRecord = ((record as any).sex_name || '').toLowerCase().trim();
       const matchedSex = sexes.find(s => s.name.toLowerCase().trim() === sexNameFromRecord);
       
       // Update grid if location exists and we have valid category/sex
       if (categoryName && matchedSex && grid[locationName]) {
         const sexKey = matchedSex.name.toLowerCase().trim();
         const fieldName = `${categoryName}_${sexKey}`;
         
         if (fieldName in grid[locationName]) {
           const cnt = Number((record as any).count) || 0;
           grid[locationName][fieldName] += cnt;
         }
       }
     });
 
     return grid;
   };
 
   // Calculate row totals for detail grid (sum all values in the record)
   const calculateRowTotal = (row: CategorySexCounts): number => {
     return Object.values(row).reduce((sum, val) => sum + val, 0);
   };
 
   // Calculate column totals for detail grid (sum across all locations for each category_sex)
   const calculateColumnTotals = (grid: DetailGrid): CategorySexCounts => {
     const totals: CategorySexCounts = {};
     
     // Initialize totals for all category_sex combinations
     prisonerCategories.forEach(cat => {
       sexes.forEach(sex => {
         const catKey = cat.name.toLowerCase().trim();
         const sexKey = sex.name.toLowerCase().trim();
         const fieldKey = `${catKey}_${sexKey}`;
         totals[fieldKey] = 0;
       });
     });
     
     // Sum across all locations
     Object.values(grid).forEach(locationCounts => {
       Object.entries(locationCounts).forEach(([key, value]) => {
         totals[key] = (totals[key] || 0) + value;
       });
     });
     
     return totals;
   };
 
   const toggleRow = (key: string) => {
     const newExpanded = new Set(expandedRows);
     if (newExpanded.has(key)) {
       newExpanded.delete(key);
     } else {
       newExpanded.add(key);
     }
     setExpandedRows(newExpanded);
   };
 
   const groupedData = groupLockups();
 
   const clearFilters = () => {
     setStationFilter('');
     setLockupTypeFilter('');
     setDateFilter('');
   };
 
   const hasActiveFilters = stationFilter || lockupTypeFilter || dateFilter;
 
   return (
     <div className="space-y-4">
       {/* Filters Section */}
       <div className="bg-white rounded-lg border p-4">
         <div className="flex items-center gap-2 mb-4">
           <Filter className="h-4 w-4 text-muted-foreground" />
           <span>Filters</span>
           {hasActiveFilters && (
             <Button
               variant="ghost"
               size="sm"
               onClick={clearFilters}
               className="ml-auto h-8"
             >
               <X className="h-4 w-4 mr-1" />
               Clear All
             </Button>
           )}
         </div>
 
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {/* Station Filter - Searchable */}
           <div className="space-y-2">
             <Label>Station</Label>
             <Popover open={stationSearchOpen} onOpenChange={setStationSearchOpen}>
               <PopoverTrigger asChild>
                 <Button
                   variant="outline"
                   role="combobox"
                   aria-expanded={stationSearchOpen}
                   className="w-full justify-between"
                 >
                   {stationFilter
                     ? mockStations.find((station) => station.id === stationFilter)?.name
                     : "Select station..."}
                   <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                 </Button>
               </PopoverTrigger>
               <PopoverContent className="w-[300px] p-0">
                 <Command>
                   <CommandInput placeholder="Search station..." />
                   <CommandList>
                     <CommandEmpty>No station found.</CommandEmpty>
                     <CommandGroup>
                       <CommandItem
                         value="all"
                         onSelect={() => {
                           setStationFilter('');
                           setStationSearchOpen(false);
                         }}
                       >
                         <Check
                           className={cn(
                             "mr-2 h-4 w-4",
                             !stationFilter ? "opacity-100" : "opacity-0"
                           )}
                         />
                         All Stations
                       </CommandItem>
                       {mockStations.map((station) => (
                         <CommandItem
                           key={station.id}
                           value={station.name}
                           onSelect={() => {
                             setStationFilter(station.id);
                             setStationSearchOpen(false);
                           }}
                         >
                           <Check
                             className={cn(
                               "mr-2 h-4 w-4",
                               stationFilter === station.id ? "opacity-100" : "opacity-0"
                             )}
                           />
                           {station.name}
                         </CommandItem>
                       ))}
                     </CommandGroup>
                   </CommandList>
                 </Command>
               </PopoverContent>
             </Popover>
           </div>
 
           {/* Lockup Type Filter */}
           <div className="space-y-2">
             <Label>Lockup Type</Label>
             <Select value={lockupTypeFilter} onValueChange={setLockupTypeFilter}>
               <SelectTrigger>
                 <SelectValue placeholder="Select type..." />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Types</SelectItem>
                 {mockLockupTypes.map((type) => (
                   <SelectItem key={type.id} value={type.id}>
                     {type.name}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
 
           {/* Date Filter */}
           <div className="space-y-2">
             <Label>Date</Label>
             <Input
               type="date"
               value={dateFilter}
               onChange={(e) => setDateFilter(e.target.value)}
               placeholder="Select date..."
             />
           </div>
         </div>
       </div>
 
       <div className="bg-white rounded-lg border overflow-x-auto">
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead className="w-[50px]"></TableHead>
               <TableHead>Station</TableHead>
               <TableHead>Lockup Type</TableHead>
               <TableHead>Date & Time</TableHead>
               {/* Dynamic category columns */}
               {prisonerCategories.map(category => (
                 <TableHead key={category.id} className="text-right capitalize">
                   {category.name}
                 </TableHead>
               ))}
               <TableHead className="text-right">Total</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {groupedData.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                   No manual lockup records found
                 </TableCell>
               </TableRow>
             ) : (
               groupedData.map((group) => {
                 const key = `${group.station}-${group.type}-${group.date}-${group.time}`;
                 const isExpanded = expandedRows.has(key);
                 const detailGrid = buildDetailGrid(group.records);
                 const columnTotals = calculateColumnTotals(detailGrid);
 
                 return (
                   <React.Fragment key={key}>
                     <TableRow
                       className="cursor-pointer hover:bg-muted/50"
                       onClick={() => toggleRow(key)}
                     >
                       <TableCell>
                         {isExpanded ? (
                           <ChevronDown className="h-4 w-4" />
                         ) : (
                           <ChevronRight className="h-4 w-4" />
                         )}
                       </TableCell>
                       <TableCell>{group.stationName}</TableCell>
                       <TableCell>{group.typeName}</TableCell>
                       <TableCell>{group.date} {group.time}</TableCell>
                       {/* Dynamic category totals */}
                       {prisonerCategories.map(category => {
                         const categoryKey = category.name.toLowerCase().trim();
                         const total = group.categoryTotals[categoryKey] || 0;
                         return (
                           <TableCell key={category.id} className="text-right">
                             {total}
                           </TableCell>
                         );
                       })}
                       <TableCell className="text-right">{group.grandTotal}</TableCell>
                     </TableRow>
 
                     {isExpanded && (
                       <TableRow>
                         <TableCell colSpan={9} className="bg-muted/20 p-6">
                           <div className="overflow-x-auto">
                             <table className="w-full border-collapse border">
                               <thead>
                                 <tr className="border-b bg-muted/50">
                                   <th className="border-r p-3 text-left min-w-[120px]">Location</th>
                                   {/* Dynamic category columns with sex subheaders */}
                                   {prisonerCategories.map(category => (
                                     <th key={category.id} className="border-r p-3 text-center capitalize" colSpan={sexes.length}>
                                       {category.name}
                                     </th>
                                   ))}
                                   <th className="p-3 text-center bg-primary/10">Total</th>
                                 </tr>
                                 <tr className="border-b bg-muted/30">
                                   <th className="border-r p-2"></th>
                                   {/* Dynamic sex sub-columns for each category */}
                                   {prisonerCategories.map(category => (
                                     <React.Fragment key={category.id}>
                                       {sexes.map(sex => (
                                         <th key={`${category.id}-${sex.id}`} className="border-r p-2 text-center text-sm capitalize">
                                           {sex.name}
                                         </th>
                                       ))}
                                     </React.Fragment>
                                   ))}
                                   <th className="p-2 text-center text-sm bg-primary/10"></th>
                                 </tr>
                               </thead>
                               <tbody>
                                 {/* Dynamic Location Rows */}
                                 {locations.map(location => {
                                   const locationKey = location.name.toLowerCase().trim();
                                   const locationData = detailGrid[locationKey];
                                   if (!locationData) return null;
                                   
                                   return (
                                     <tr key={location.id} className="border-b">
                                       <td className="border-r p-3 capitalize">{location.name}</td>
                                       {/* Dynamic category_sex cells */}
                                       {prisonerCategories.map(category => (
                                         <React.Fragment key={category.id}>
                                           {sexes.map(sex => {
                                             const catKey = category.name.toLowerCase().trim();
                                             const sexKey = sex.name.toLowerCase().trim();
                                             const fieldKey = `${catKey}_${sexKey}`;
                                             const value = locationData[fieldKey] || 0;
                                             return (
                                               <td key={`${category.id}-${sex.id}`} className="border-r p-2 text-center bg-gray-50">
                                                 {value}
                                               </td>
                                             );
                                           })}
                                         </React.Fragment>
                                       ))}
                                       <td className="p-2 text-center bg-primary/10">{calculateRowTotal(locationData)}</td>
                                     </tr>
                                   );
                                 })}
 
                                 {/* Total Row */}
                                 <tr className="bg-primary/10">
                                   <td className="border-r p-3">Total</td>
                                   {/* Dynamic totals for each category_sex */}
                                   {prisonerCategories.map(category => (
                                     <React.Fragment key={category.id}>
                                       {sexes.map(sex => {
                                         const catKey = category.name.toLowerCase().trim();
                                         const sexKey = sex.name.toLowerCase().trim();
                                         const fieldKey = `${catKey}_${sexKey}`;
                                         const value = columnTotals[fieldKey] || 0;
                                         return (
                                           <td key={`${category.id}-${sex.id}`} className="border-r p-2 text-center">
                                             {value}
                                           </td>
                                         );
                                       })}
                                     </React.Fragment>
                                   ))}
                                   <td className="p-2 text-center">{group.grandTotal || 0}</td>
                                 </tr>
                               </tbody>
                             </table>
                           </div>
                         </TableCell>
                       </TableRow>
                     )}
                   </React.Fragment>
                 );
               })
             )}
           </TableBody>
         </Table>
       </div>
     </div>
   );
}
