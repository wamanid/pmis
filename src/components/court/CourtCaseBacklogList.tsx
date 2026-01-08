import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Card, CardContent } from '../ui/card';
import { Search, Eye, ChevronLeft, ChevronRight, AlertTriangle, Calendar } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Badge } from '../ui/badge';

interface PrisonerRecord {
  id: string;
  prison_station_name: string;
  prisoner_class_name: string;
  previous_convictions: number;
  photo: string;
  escapee: boolean;
  armed_personnel: boolean;
  extremely_violent: boolean;
  life_or_death_imprisonment: boolean;
  lodger: boolean;
  previous_convictions_count: number;
  commital: boolean;
  prison_station: string;
  arrest_region: string;
  arrest_district: string;
  arrest_county: string;
  arrest_sub_county: string;
  arrest_parish: string;
  arrest_village: string;
  prisoner_class: string;
  date_of_committal: string;
  prisoner: string;
  prisoner_name?: string;
  prisoner_number?: string;
  days_in_custody?: number;
}

// Mock data for prisoner records
const mockPrisonerRecords: PrisonerRecord[] = [
  {
    id: '1',
    prisoner_name: 'John Doe',
    prisoner_number: 'PN-2024-001',
    prison_station_name: 'Luzira Prison',
    prisoner_class_name: 'Remand',
    previous_convictions: 2,
    photo: '',
    escapee: false,
    armed_personnel: false,
    extremely_violent: false,
    life_or_death_imprisonment: false,
    lodger: false,
    previous_convictions_count: 2,
    commital: true,
    prison_station: '1',
    arrest_region: '1',
    arrest_district: '1',
    arrest_county: '1',
    arrest_sub_county: '1',
    arrest_parish: '1',
    arrest_village: '1',
    prisoner_class: '1',
    date_of_committal: '2024-01-15T10:00:00Z',
    prisoner: '1',
    days_in_custody: 292
  },
  {
    id: '2',
    prisoner_name: 'Jane Smith',
    prisoner_number: 'PN-2024-002',
    prison_station_name: 'Kigo Prison',
    prisoner_class_name: 'Awaiting Trial',
    previous_convictions: 0,
    photo: '',
    escapee: false,
    armed_personnel: false,
    extremely_violent: true,
    life_or_death_imprisonment: false,
    lodger: false,
    previous_convictions_count: 0,
    commital: true,
    prison_station: '2',
    arrest_region: '1',
    arrest_district: '2',
    arrest_county: '2',
    arrest_sub_county: '2',
    arrest_parish: '2',
    arrest_village: '2',
    prisoner_class: '2',
    date_of_committal: '2024-02-20T14:30:00Z',
    prisoner: '2',
    days_in_custody: 256
  },
  {
    id: '3',
    prisoner_name: 'Michael Johnson',
    prisoner_number: 'PN-2024-003',
    prison_station_name: 'Luzira Prison',
    prisoner_class_name: 'Remand',
    previous_convictions: 1,
    photo: '',
    escapee: false,
    armed_personnel: true,
    extremely_violent: false,
    life_or_death_imprisonment: false,
    lodger: false,
    previous_convictions_count: 1,
    commital: true,
    prison_station: '1',
    arrest_region: '1',
    arrest_district: '1',
    arrest_county: '1',
    arrest_sub_county: '1',
    arrest_parish: '1',
    arrest_village: '1',
    prisoner_class: '1',
    date_of_committal: '2023-11-10T09:15:00Z',
    prisoner: '3',
    days_in_custody: 358
  },
  {
    id: '4',
    prisoner_name: 'Sarah Williams',
    prisoner_number: 'PN-2024-004',
    prison_station_name: 'Kitalya Prison',
    prisoner_class_name: 'Awaiting Trial',
    previous_convictions: 0,
    photo: '',
    escapee: false,
    armed_personnel: false,
    extremely_violent: false,
    life_or_death_imprisonment: true,
    lodger: false,
    previous_convictions_count: 0,
    commital: true,
    prison_station: '3',
    arrest_region: '2',
    arrest_district: '3',
    arrest_county: '3',
    arrest_sub_county: '3',
    arrest_parish: '3',
    arrest_village: '3',
    prisoner_class: '2',
    date_of_committal: '2023-08-05T11:45:00Z',
    prisoner: '4',
    days_in_custody: 455
  },
  {
    id: '5',
    prisoner_name: 'Robert Brown',
    prisoner_number: 'PN-2024-005',
    prison_station_name: 'Fort Portal Prison',
    prisoner_class_name: 'Remand',
    previous_convictions: 3,
    photo: '',
    escapee: true,
    armed_personnel: false,
    extremely_violent: true,
    life_or_death_imprisonment: false,
    lodger: false,
    previous_convictions_count: 3,
    commital: true,
    prison_station: '4',
    arrest_region: '3',
    arrest_district: '4',
    arrest_county: '4',
    arrest_sub_county: '4',
    arrest_parish: '4',
    arrest_village: '4',
    prisoner_class: '1',
    date_of_committal: '2023-06-20T16:20:00Z',
    prisoner: '5',
    days_in_custody: 501
  },
];

// Mock data for filters
const mockPrisonStations = [
  { id: '1', name: 'Luzira Prison' },
  { id: '2', name: 'Kigo Prison' },
  { id: '3', name: 'Kitalya Prison' },
  { id: '4', name: 'Fort Portal Prison' },
  { id: '5', name: 'Gulu Prison' },
];

const mockPrisonerClasses = [
  { id: '1', name: 'Remand' },
  { id: '2', name: 'Awaiting Trial' },
  { id: '3', name: 'Convict' },
  { id: '4', name: 'Civil Debtor' },
];

const mockRegions = [
  { id: '1', name: 'Central Region' },
  { id: '2', name: 'Eastern Region' },
  { id: '3', name: 'Western Region' },
  { id: '4', name: 'Northern Region' },
];

export default function CourtCaseBacklogList() {
  const [records, setRecords] = useState<PrisonerRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<PrisonerRecord[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrisonStation, setFilterPrisonStation] = useState('');
  const [filterPrisonerClass, setFilterPrisonerClass] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showEscapeesOnly, setShowEscapeesOnly] = useState(false);
  const [showViolentOnly, setShowViolentOnly] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, filterPrisonStation, filterPrisonerClass, filterRegion, filterDateFrom, filterDateTo, showEscapeesOnly, showViolentOnly]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRecords(mockPrisonerRecords);
    } catch (error) {
      toast.error('Failed to fetch court case backlog records');
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...records];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.prisoner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.prisoner_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.prison_station_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply prison station filter
    if (filterPrisonStation) {
      filtered = filtered.filter(record => record.prison_station === filterPrisonStation);
    }

    // Apply prisoner class filter
    if (filterPrisonerClass) {
      filtered = filtered.filter(record => record.prisoner_class === filterPrisonerClass);
    }

    // Apply region filter
    if (filterRegion) {
      filtered = filtered.filter(record => record.arrest_region === filterRegion);
    }

    // Apply date range filter
    if (filterDateFrom) {
      filtered = filtered.filter(record => 
        new Date(record.date_of_committal) >= new Date(filterDateFrom)
      );
    }

    if (filterDateTo) {
      filtered = filtered.filter(record => 
        new Date(record.date_of_committal) <= new Date(filterDateTo)
      );
    }

    // Apply escapees filter
    if (showEscapeesOnly) {
      filtered = filtered.filter(record => record.escapee);
    }

    // Apply violent filter
    if (showViolentOnly) {
      filtered = filtered.filter(record => record.extremely_violent);
    }

    // Sort by days in custody (descending)
    filtered.sort((a, b) => (b.days_in_custody || 0) - (a.days_in_custody || 0));

    setFilteredRecords(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterPrisonStation('');
    setFilterPrisonerClass('');
    setFilterRegion('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setShowEscapeesOnly(false);
    setShowViolentOnly(false);
  };

  const handleViewDetails = (record: PrisonerRecord) => {
    toast.info(`Viewing details for ${record.prisoner_name}`);
    // In real app, navigate to prisoner detail page
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysInCustodyColor = (days?: number) => {
    if (!days) return 'bg-gray-100 text-gray-800';
    if (days > 365) return 'bg-red-100 text-red-800';
    if (days > 180) return 'bg-orange-100 text-orange-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl" style={{ color: '#650000' }}>Court Case Backlog</h2>
          <p className="text-gray-600 mt-1">Track prisoners awaiting court proceedings</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-lg px-4 py-2">
            Total Cases: {filteredRecords.length}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Row 1: Search and Location Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search prisoner name/number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prison_station">Prison Station</Label>
                <Select
                  value={filterPrisonStation}
                  onValueChange={setFilterPrisonStation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All stations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stations</SelectItem>
                    {mockPrisonStations.map((station) => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prisoner_class">Prisoner Class</Label>
                <Select
                  value={filterPrisonerClass}
                  onValueChange={setFilterPrisonerClass}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {mockPrisonerClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Arrest Region</Label>
                <Select
                  value={filterRegion}
                  onValueChange={setFilterRegion}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {mockRegions.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Date Filters and Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_from">Committal Date From</Label>
                <div className="relative">
                  <Input
                    id="date_from"
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_to">Committal Date To</Label>
                <div className="relative">
                  <Input
                    id="date_to"
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  variant={showEscapeesOnly ? 'default' : 'outline'}
                  onClick={() => setShowEscapeesOnly(!showEscapeesOnly)}
                  className="w-full"
                  style={showEscapeesOnly ? { backgroundColor: '#650000' } : {}}
                >
                  Escapees Only
                </Button>
              </div>

              <div className="flex items-end">
                <Button
                  variant={showViolentOnly ? 'default' : 'outline'}
                  onClick={() => setShowViolentOnly(!showViolentOnly)}
                  className="w-full"
                  style={showViolentOnly ? { backgroundColor: '#650000' } : {}}
                >
                  Violent Only
                </Button>
              </div>

              <div className="flex items-end md:col-span-2">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: '#650000' }}>
                  <TableHead className="text-white">Prisoner Info</TableHead>
                  <TableHead className="text-white">Station</TableHead>
                  <TableHead className="text-white">Class</TableHead>
                  <TableHead className="text-white">Committal Date</TableHead>
                  <TableHead className="text-white">Days in Custody</TableHead>
                  <TableHead className="text-white">Flags</TableHead>
                  <TableHead className="text-white">Previous Convictions</TableHead>
                  <TableHead className="text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading records...
                    </TableCell>
                  </TableRow>
                ) : currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.prisoner_name}</div>
                          <div className="text-sm text-gray-500">{record.prisoner_number}</div>
                        </div>
                      </TableCell>
                      <TableCell>{record.prison_station_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.prisoner_class_name}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(record.date_of_committal)}</TableCell>
                      <TableCell>
                        <Badge className={getDaysInCustodyColor(record.days_in_custody)}>
                          {record.days_in_custody} days
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {record.escapee && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Escapee
                            </Badge>
                          )}
                          {record.extremely_violent && (
                            <Badge variant="destructive" className="text-xs">
                              Violent
                            </Badge>
                          )}
                          {record.armed_personnel && (
                            <Badge className="text-xs bg-orange-600">
                              Armed
                            </Badge>
                          )}
                          {record.life_or_death_imprisonment && (
                            <Badge className="text-xs bg-purple-600">
                              Life/Death
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {record.previous_convictions_count}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(record)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && filteredRecords.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRecords.length)} of {filteredRecords.length} records
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
