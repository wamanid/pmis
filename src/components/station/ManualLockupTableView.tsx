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
 
interface GroupedLockup {
  station: string;
  stationName: string;
  type: string;
  typeName: string;
  date: string;
  time: string;
  records: ManualLockUpItem[];
  convictTotal: number;
  remandTotal: number;
  debtorTotal: number;
  lodgerTotal: number;
  grandTotal: number;
}
 
interface DetailGrid {
  station: { convict_male: number; convict_female: number; remand_male: number; remand_female: number; debtor_male: number; debtor_female: number; lodger_male: number; lodger_female: number };
  court: { convict_male: number; convict_female: number; remand_male: number; remand_female: number; debtor_male: number; debtor_female: number; lodger_male: number; lodger_female: number };
  labour: { convict_male: number; convict_female: number; remand_male: number; remand_female: number; debtor_male: number; debtor_female: number; lodger_male: number; lodger_female: number };
}
 
interface ManualLockupTableViewProps {
  lockups: ManualLockUpItem[]; // NOTE: expect server-provided array of items
}
 
const categoryIds = {
  convict: '770e8400-e29b-41d4-a716-446655440001',
  remand: '770e8400-e29b-41d4-a716-446655440002',
  debtor: '770e8400-e29b-41d4-a716-446655440003',
  lodger: '770e8400-e29b-41d4-a716-446655440004',
};
 
const sexIds = {
  male: '880e8400-e29b-41d4-a716-446655440001',
  female: '880e8400-e29b-41d4-a716-446655440002',
};
 
export function ManualLockupTableView({ lockups }: ManualLockupTableViewProps) {
   const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
   const [stationFilter, setStationFilter] = useState<string>('');
   const [lockupTypeFilter, setLockupTypeFilter] = useState<string>('');
   const [dateFilter, setDateFilter] = useState<string>('');
   const [stationSearchOpen, setStationSearchOpen] = useState(false);
   const [mockStations, setMockStations] = useState<{id:string;name:string}[]>([]);
   const [mockLockupTypes, setMockLockupTypes] = useState<{id:string;name:string}[]>([]);
 
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
           convictTotal: 0,
           remandTotal: 0,
           debtorTotal: 0,
           lodgerTotal: 0,
           grandTotal: 0,
         };
       }
 
       grouped[key].records.push(lockup);
 
       // Normalize count
       const cnt = Number((lockup as any).count) || 0;
 
       // Calculate category totals using either uuid (prisoner_category) or name (prisoner_category_name)
       if (lockup.prisoner_category === categoryIds.convict || (lockup as any).prisoner_category_name === "Convict") {
         grouped[key].convictTotal += cnt;
       } else if (lockup.prisoner_category === categoryIds.remand || (lockup as any).prisoner_category_name === "Remand") {
         grouped[key].remandTotal += cnt;
       } else if (lockup.prisoner_category === categoryIds.debtor || (lockup as any).prisoner_category_name === "Civil Debtor") {
         grouped[key].debtorTotal += cnt;
       } else if (lockup.prisoner_category === categoryIds.lodger || (lockup as any).prisoner_category_name === "Lodger") {
         grouped[key].lodgerTotal += cnt;
       }
 
       grouped[key].grandTotal += cnt;
     });
 
     return Object.values(grouped);
   };
 
   // Build detail grid from records
   const buildDetailGrid = (records: ManualLockUpItem[]): DetailGrid => {
     const grid: DetailGrid = {
       station: { convict_male: 0, convict_female: 0, remand_male: 0, remand_female: 0, debtor_male: 0, debtor_female: 0, lodger_male: 0, lodger_female: 0 },
       court: { convict_male: 0, convict_female: 0, remand_male: 0, remand_female: 0, debtor_male: 0, debtor_female: 0, lodger_male: 0, lodger_female: 0 },
       labour: { convict_male: 0, convict_female: 0, remand_male: 0, remand_female: 0, debtor_male: 0, debtor_female: 0, lodger_male: 0, lodger_female: 0 },
     };
 
     records.forEach(record => {
       const location = record.location;
       let category = '';
       let sex = '';
 
      // determine category (uuid or name)
      if (record.prisoner_category === categoryIds.convict || (record as any).prisoner_category_name === 'Convict') category = 'convict';
      else if (record.prisoner_category === categoryIds.remand || (record as any).prisoner_category_name === 'Remand') category = 'remand';
      else if (record.prisoner_category === categoryIds.debtor || (record as any).prisoner_category_name === 'Civil Debtor') category = 'debtor';
      else if (record.prisoner_category === categoryIds.lodger || (record as any).prisoner_category_name === 'Lodger') category = 'lodger';
 
      if (record.sex === sexIds.male || (record as any).sex_name === 'Male') sex = 'male';
      else if (record.sex === sexIds.female || (record as any).sex_name === 'Female') sex = 'female';
 
      if (category && sex && (grid as any)[location]) {
        const fieldName = `${category}_${sex}` as keyof typeof grid[typeof location];
        const cnt = Number((record as any).count) || 0;
        (grid as any)[location][fieldName] += cnt;
       }
     });
 
     return grid;
   };
 
   // Calculate row totals for detail grid
   const calculateRowTotal = (row: { convict_male: number; convict_female: number; remand_male: number; remand_female: number; debtor_male: number; debtor_female: number; lodger_male: number; lodger_female: number }) => {
     return row.convict_male + row.convict_female + row.remand_male + row.remand_female + row.debtor_male + row.debtor_female + row.lodger_male + row.lodger_female;
   };
 
   // Calculate column totals for detail grid
   const calculateColumnTotals = (grid: DetailGrid) => {
     return {
       convict_male: grid.station.convict_male + grid.court.convict_male + grid.labour.convict_male,
       convict_female: grid.station.convict_female + grid.court.convict_female + grid.labour.convict_female,
       remand_male: grid.station.remand_male + grid.court.remand_male + grid.labour.remand_male,
       remand_female: grid.station.remand_female + grid.court.remand_female + grid.labour.remand_female,
       debtor_male: grid.station.debtor_male + grid.court.debtor_male + grid.labour.debtor_male,
       debtor_female: grid.station.debtor_female + grid.court.debtor_female + grid.labour.debtor_female,
       lodger_male: grid.station.lodger_male + grid.court.lodger_male + grid.labour.lodger_male,
       lodger_female: grid.station.lodger_female + grid.court.lodger_female + grid.labour.lodger_female,
     };
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
               <TableHead className="text-right">Convict</TableHead>
               <TableHead className="text-right">Remand</TableHead>
               <TableHead className="text-right">Debtor</TableHead>
               <TableHead className="text-right">Lodger</TableHead>
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
                       <TableCell className="text-right">{group.convictTotal}</TableCell>
                       <TableCell className="text-right">{group.remandTotal}</TableCell>
                       <TableCell className="text-right">{group.debtorTotal}</TableCell>
                       <TableCell className="text-right">{group.lodgerTotal}</TableCell>
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
                                   <th className="border-r p-3 text-center" colSpan={2}>Convict</th>
                                   <th className="border-r p-3 text-center" colSpan={2}>Remand</th>
                                   <th className="border-r p-3 text-center" colSpan={2}>Debtor</th>
                                   <th className="border-r p-3 text-center" colSpan={2}>Lodger</th>
                                   <th className="p-3 text-center bg-primary/10">Total</th>
                                 </tr>
                                 <tr className="border-b bg-muted/30">
                                   <th className="border-r p-2"></th>
                                   <th className="border-r p-2 text-center text-sm">Male</th>
                                   <th className="border-r p-2 text-center text-sm">Female</th>
                                   <th className="border-r p-2 text-center text-sm">Male</th>
                                   <th className="border-r p-2 text-center text-sm">Female</th>
                                   <th className="border-r p-2 text-center text-sm">Male</th>
                                   <th className="border-r p-2 text-center text-sm">Female</th>
                                   <th className="border-r p-2 text-center text-sm">Male</th>
                                   <th className="border-r p-2 text-center text-sm">Female</th>
                                   <th className="p-2 text-center text-sm bg-primary/10"></th>
                                 </tr>
                               </thead>
                               <tbody>
                                 {/* Station Row */}
                                 <tr className="border-b">
                                   <td className="border-r p-3">Station</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.station.convict_male || 0}</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.station.convict_female || 0}</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.station.remand_male || 0}</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.station.remand_female || 0}</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.station.debtor_male || 0}</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.station.debtor_female || 0}</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.station.lodger_male || 0}</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.station.lodger_female || 0}</td>
                                   <td className="p-2 text-center bg-primary/10">{calculateRowTotal(detailGrid.station)}</td>
                                 </tr>
 
                                 {/* Court Row */}
                                 <tr className="border-b">
                                   <td className="border-r p-3">Court</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.court.convict_male || 0}</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.court.convict_female || 0}</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.court.remand_male || 0}</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.court.remand_female || 0}</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.court.debtor_male || 0}</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.court.debtor_female || 0}</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.court.lodger_male || 0}</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.court.lodger_female || 0}</td>
                                   <td className="p-2 text-center bg-primary/10">{calculateRowTotal(detailGrid.court)}</td>
                                 </tr>
 
                                 {/* Labour Row */}
                                 <tr className="border-b">
                                   <td className="border-r p-3">Labour</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.labour.convict_male || 0}</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.labour.convict_female || 0}</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.labour.remand_male || 0}</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.labour.remand_female || 0}</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.labour.debtor_male || 0}</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.labour.debtor_female || 0}</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.labour.lodger_male || 0}</td>
                                   <td className="border-r p-2 text-center bg-gray-50">{detailGrid.labour.lodger_female || 0}</td>
                                   <td className="p-2 text-center bg-primary/10">{calculateRowTotal(detailGrid.labour)}</td>
                                 </tr>
 
                                 {/* Total Row */}
                                 <tr className="bg-primary/10">
                                   <td className="border-r p-3">Total</td>
                                   <td className="border-r p-2 text-center">{columnTotals.convict_male}</td>
                                   <td className="border-r p-2 text-center">{columnTotals.convict_female}</td>
                                   <td className="border-r p-2 text-center">{columnTotals.remand_male}</td>
                                   <td className="border-r p-2 text-center">{columnTotals.remand_female}</td>
                                   <td className="border-r p-2 text-center">{columnTotals.debtor_male}</td>
                                   <td className="border-r p-2 text-center">{columnTotals.debtor_female}</td>
                                   <td className="border-r p-2 text-center">{columnTotals.lodger_male}</td>
                                   <td className="border-r p-2 text-center">{columnTotals.lodger_female}</td>
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
