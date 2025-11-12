import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Search, Plus, Eye, Edit, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import CourtVisitForm from './CourtVisitForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface CourtVisitRecord {
  id: string;
  prisoner_name: string;
  id_type_name: string;
  relationship_name: string;
  visit_id: string;
  visit_date: string;
  visitor_name: string;
  id_number: string;
  telephone_number: string;
  address: string;
  items_brought: string;
  prisoner: string;
  id_type: string;
  relationship: string;
}

// Mock data
const mockCourtVisitRecords: CourtVisitRecord[] = [
  {
    id: '1',
    prisoner: '1',
    prisoner_name: 'John Doe',
    visit_id: 'VIS-1698765432-123',
    visit_date: '2025-11-01',
    visitor_name: 'Mary Doe',
    id_type: '1',
    id_type_name: 'National ID',
    id_number: 'CM12345678',
    telephone_number: '0712345678',
    relationship: '1',
    relationship_name: 'Spouse',
    address: 'Plot 123, Kampala Road, Kampala',
    items_brought: '1'
  },
  {
    id: '2',
    prisoner: '2',
    prisoner_name: 'Jane Smith',
    visit_id: 'VIS-1698765433-456',
    visit_date: '2025-11-01',
    visitor_name: 'David Smith',
    id_type: '2',
    id_type_name: 'Passport',
    id_number: 'P987654321',
    telephone_number: '0787654321',
    relationship: '2',
    relationship_name: 'Parent',
    address: 'Box 456, Entebbe, Uganda',
    items_brought: '2'
  },
  {
    id: '3',
    prisoner: '3',
    prisoner_name: 'Michael Johnson',
    visit_id: 'VIS-1698765434-789',
    visit_date: '2025-10-30',
    visitor_name: 'Attorney Sarah Williams',
    id_type: '1',
    id_type_name: 'National ID',
    id_number: 'CM11223344',
    telephone_number: '0701122334',
    relationship: '6',
    relationship_name: 'Lawyer',
    address: 'Williams & Associates, Plot 89, Kampala',
    items_brought: '3'
  },
  {
    id: '4',
    prisoner: '1',
    prisoner_name: 'John Doe',
    visit_id: 'VIS-1698765435-012',
    visit_date: '2025-10-28',
    visitor_name: 'Pastor Robert Brown',
    id_type: '1',
    id_type_name: 'National ID',
    id_number: 'CM55667788',
    telephone_number: '0755667788',
    relationship: '7',
    relationship_name: 'Religious Leader',
    address: 'Grace Church, Mukono',
    items_brought: '3'
  },
  {
    id: '5',
    prisoner: '4',
    prisoner_name: 'Mary Williams',
    visit_id: 'VIS-1698765436-345',
    visit_date: '2025-10-27',
    visitor_name: 'Lisa Taylor',
    id_type: '3',
    id_type_name: 'Driving License',
    id_number: 'DL44556677',
    telephone_number: '0744556677',
    relationship: '5',
    relationship_name: 'Friend',
    address: 'Jinja Road, Kampala',
    items_brought: '4'
  },
  {
    id: '6',
    prisoner: '5',
    prisoner_name: 'James Brown',
    visit_id: 'VIS-1698765437-678',
    visit_date: '2025-10-26',
    visitor_name: 'Jennifer Brown',
    id_type: '1',
    id_type_name: 'National ID',
    id_number: 'CM99887766',
    telephone_number: '0799887766',
    relationship: '3',
    relationship_name: 'Child',
    address: 'Mbarara Town',
    items_brought: '1'
  },
  {
    id: '7',
    prisoner: '2',
    prisoner_name: 'Jane Smith',
    visit_id: 'VIS-1698765438-901',
    visit_date: '2025-10-25',
    visitor_name: 'Thomas Smith',
    id_type: '1',
    id_type_name: 'National ID',
    id_number: 'CM33445566',
    telephone_number: '0733445566',
    relationship: '4',
    relationship_name: 'Sibling',
    address: 'Masaka District',
    items_brought: '2'
  },
];

const CourtVisitList: React.FC = () => {
  const [visits, setVisits] = useState<CourtVisitRecord[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<CourtVisitRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<CourtVisitRecord | null>(null);
  const [editData, setEditData] = useState<CourtVisitRecord | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPrisoner, setFilterPrisoner] = useState('');
  const [filterRelationship, setFilterRelationship] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadVisits();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [visits, searchQuery, filterPrisoner, filterRelationship, filterDateFrom, filterDateTo]);

  const loadVisits = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setVisits(mockCourtVisitRecords);
      setTotalCount(mockCourtVisitRecords.length);
    } catch (error) {
      toast.error('Failed to load court visits');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...visits];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.prisoner_name.toLowerCase().includes(query) ||
          v.visitor_name.toLowerCase().includes(query) ||
          v.visit_id.toLowerCase().includes(query) ||
          v.telephone_number.includes(query) ||
          v.id_number.toLowerCase().includes(query) ||
          v.address.toLowerCase().includes(query)
      );
    }

    // Prisoner filter
    if (filterPrisoner) {
      filtered = filtered.filter((v) => v.prisoner_name === filterPrisoner);
    }

    // Relationship filter
    if (filterRelationship) {
      filtered = filtered.filter((v) => v.relationship_name === filterRelationship);
    }

    // Date range filter
    if (filterDateFrom) {
      filtered = filtered.filter((v) => v.visit_date >= filterDateFrom);
    }
    if (filterDateTo) {
      filtered = filtered.filter((v) => v.visit_date <= filterDateTo);
    }

    setFilteredVisits(filtered);
    setTotalCount(filtered.length);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleEdit = (visit: CourtVisitRecord) => {
    setEditData(visit);
    setShowForm(true);
  };

  const handleView = (visit: CourtVisitRecord) => {
    setSelectedVisit(visit);
    setShowViewDialog(true);
  };

  const handleFormSuccess = () => {
    loadVisits();
    setShowForm(false);
    setEditData(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterPrisoner('');
    setFilterRelationship('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  // Get unique values for filters
  const uniquePrisoners = Array.from(new Set(visits.map(v => v.prisoner_name)));
  const uniqueRelationships = Array.from(new Set(visits.map(v => v.relationship_name)));

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVisits.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVisits.length / itemsPerPage);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-gray-900">Court Visits</h1>
          <p className="text-gray-600">Manage prisoner court visits and visitor records</p>
        </div>
        <Button
          onClick={handleCreate}
          style={{ backgroundColor: '#650000' }}
          className="text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Visit
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Row 1: Search and basic filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search visits..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prisoner_filter">Prisoner</Label>
                <Select value={filterPrisoner} onValueChange={setFilterPrisoner}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Prisoners" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prisoners</SelectItem>
                    {uniquePrisoners.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship_filter">Relationship</Label>
                <Select value={filterRelationship} onValueChange={setFilterRelationship}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Relationships" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Relationships</SelectItem>
                    {uniqueRelationships.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Date filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_from">Date From</Label>
                <Input
                  id="date_from"
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_to">Date To</Label>
                <Input
                  id="date_to"
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                />
              </div>

              <div className="space-y-2 flex items-end">
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalCount)} of {totalCount} visits
        </p>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: '#650000' }}>
                  <TableHead className="w-[50px] text-white">#</TableHead>
                  <TableHead className="text-white">Visit ID</TableHead>
                  <TableHead className="text-white">Visit Date</TableHead>
                  <TableHead className="text-white">Prisoner Name</TableHead>
                  <TableHead className="text-white">Visitor Name</TableHead>
                  <TableHead className="text-white">Relationship</TableHead>
                  <TableHead className="text-white">ID Type</TableHead>
                  <TableHead className="text-white">Contact</TableHead>
                  <TableHead className="text-right text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No court visits found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((visit, index) => (
                    <TableRow key={visit.id}>
                      <TableCell>{indexOfFirstItem + index + 1}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {visit.visit_id}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(visit.visit_date)}</TableCell>
                      <TableCell>{visit.prisoner_name}</TableCell>
                      <TableCell>{visit.visitor_name}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          {visit.relationship_name}
                        </Badge>
                      </TableCell>
                      <TableCell>{visit.id_type_name}</TableCell>
                      <TableCell>{visit.telephone_number}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(visit)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(visit)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Form Dialog */}
      <CourtVisitForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditData(null);
        }}
        onSuccess={handleFormSuccess}
        editData={editData}
      />

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Court Visit Details
            </DialogTitle>
          </DialogHeader>

          {selectedVisit && (
            <div className="space-y-6">
              {/* Visit Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Visit ID</Label>
                  <p className="mt-1 font-mono text-sm">{selectedVisit.visit_id}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Visit Date</Label>
                  <p className="mt-1">{formatDate(selectedVisit.visit_date)}</p>
                </div>
              </div>

              {/* Prisoner Information */}
              <div>
                <h3 className="border-b pb-2 mb-4">Prisoner Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Prisoner Name</Label>
                    <p className="mt-1">{selectedVisit.prisoner_name}</p>
                  </div>
                </div>
              </div>

              {/* Visitor Information */}
              <div>
                <h3 className="border-b pb-2 mb-4">Visitor Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Visitor Name</Label>
                    <p className="mt-1">{selectedVisit.visitor_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Relationship</Label>
                    <div className="mt-1">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        {selectedVisit.relationship_name}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-600">ID Type</Label>
                    <p className="mt-1">{selectedVisit.id_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">ID Number</Label>
                    <p className="mt-1">{selectedVisit.id_number}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Telephone Number</Label>
                    <p className="mt-1">{selectedVisit.telephone_number}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              {selectedVisit.address && (
                <div>
                  <Label className="text-gray-600">Address</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-md border">
                    <p className="text-sm">{selectedVisit.address}</p>
                  </div>
                </div>
              )}

              {/* Items Brought */}
              {selectedVisit.items_brought && (
                <div>
                  <Label className="text-gray-600">Items Brought</Label>
                  <p className="mt-1">Item ID: {selectedVisit.items_brought}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowViewDialog(false);
                    handleEdit(selectedVisit);
                  }}
                  style={{ backgroundColor: '#650000' }}
                  className="text-white hover:opacity-90"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourtVisitList;
