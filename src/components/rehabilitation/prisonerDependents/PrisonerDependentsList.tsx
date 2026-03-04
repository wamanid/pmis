import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Badge } from '../../../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../ui/alert-dialog';
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  UserCircle,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PrisonerDependent {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  sex_name: string;
  age: number;
  residence: string;
  prisoner: string;
  sex: string;
}

interface PrisonerDependentsListProps {
  onView: (dependent: PrisonerDependent) => void;
  onEdit: (dependent: PrisonerDependent) => void;
  onDelete: (id: string) => void;
  refreshTrigger?: number;
  prisonerId?: string;
}

const PrisonerDependentsList: React.FC<PrisonerDependentsListProps> = ({
  onView,
  onEdit,
  onDelete,
  refreshTrigger,
  prisonerId,
}) => {
  const [dependents, setDependents] = useState<PrisonerDependent[]>([]);
  const [filteredDependents, setFilteredDependents] = useState<PrisonerDependent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sexFilter, setSexFilter] = useState('all');
  const [ageRangeFilter, setAgeRangeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dependentToDelete, setDependentToDelete] = useState<string | null>(null);

  // Mock data
  const mockDependents: PrisonerDependent[] = [
    {
      id: '1',
      prisoner_name: 'John Doe',
      prisoner_number: 'PR-2024-001',
      sex_name: 'Female',
      age: 65,
      residence: 'Kampala, Central Division',
      prisoner: '1',
      sex: '2',
    },
    {
      id: '2',
      prisoner_name: 'John Doe',
      prisoner_number: 'PR-2024-001',
      sex_name: 'Male',
      age: 70,
      residence: 'Kampala, Central Division',
      prisoner: '1',
      sex: '1',
    },
    {
      id: '3',
      prisoner_name: 'Jane Smith',
      prisoner_number: 'PR-2024-002',
      sex_name: 'Female',
      age: 28,
      residence: 'Entebbe, Wakiso District',
      prisoner: '2',
      sex: '2',
    },
    {
      id: '4',
      prisoner_name: 'Michael Johnson',
      prisoner_number: 'PR-2024-003',
      sex_name: 'Male',
      age: 45,
      residence: 'Jinja, Eastern Region',
      prisoner: '3',
      sex: '1',
    },
    {
      id: '5',
      prisoner_name: 'Michael Johnson',
      prisoner_number: 'PR-2024-003',
      sex_name: 'Female',
      age: 72,
      residence: 'Jinja, Eastern Region',
      prisoner: '3',
      sex: '2',
    },
    {
      id: '6',
      prisoner_name: 'Emily Davis',
      prisoner_number: 'PR-2024-004',
      sex_name: 'Male',
      age: 55,
      residence: 'Mbarara, Western Region',
      prisoner: '4',
      sex: '1',
    },
    {
      id: '7',
      prisoner_name: 'Emily Davis',
      prisoner_number: 'PR-2024-004',
      sex_name: 'Female',
      age: 22,
      residence: 'Mbarara, Western Region',
      prisoner: '4',
      sex: '2',
    },
    {
      id: '8',
      prisoner_name: 'Robert Lee',
      prisoner_number: 'PR-2024-005',
      sex_name: 'Female',
      age: 68,
      residence: 'Gulu, Northern Region',
      prisoner: '5',
      sex: '2',
    },
  ];

  useEffect(() => {
    loadDependents();
  }, [refreshTrigger, prisonerId]);

  useEffect(() => {
    filterDependents();
  }, [dependents, searchTerm, sexFilter, ageRangeFilter]);

  const loadDependents = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      let data = mockDependents;
      // Filter by prisonerId if provided
      if (prisonerId) {
        data = data.filter((dependent) => dependent.prisoner === prisonerId);
      }
      setDependents(data);
      setLoading(false);
    }, 500);
  };

  const filterDependents = () => {
    let filtered = [...dependents];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (dependent) =>
          dependent.prisoner_name.toLowerCase().includes(term) ||
          dependent.prisoner_number.toLowerCase().includes(term) ||
          dependent.residence.toLowerCase().includes(term) ||
          dependent.sex_name.toLowerCase().includes(term)
      );
    }

    // Sex filter
    if (sexFilter !== 'all') {
      filtered = filtered.filter((dependent) => dependent.sex_name === sexFilter);
    }

    // Age range filter
    if (ageRangeFilter !== 'all') {
      switch (ageRangeFilter) {
        case '0-20':
          filtered = filtered.filter((dependent) => dependent.age >= 0 && dependent.age <= 20);
          break;
        case '21-40':
          filtered = filtered.filter((dependent) => dependent.age >= 21 && dependent.age <= 40);
          break;
        case '41-60':
          filtered = filtered.filter((dependent) => dependent.age >= 41 && dependent.age <= 60);
          break;
        case '61+':
          filtered = filtered.filter((dependent) => dependent.age >= 61);
          break;
      }
    }

    setFilteredDependents(filtered);
    setCurrentPage(1);
  };

  const getSexBadge = (sex: string) => {
    const badgeStyles: Record<string, string> = {
      Male: 'bg-blue-100 text-blue-800',
      Female: 'bg-pink-100 text-pink-800',
    };

    return (
      <Badge className={badgeStyles[sex] || 'bg-gray-100 text-gray-800'}>
        {sex}
      </Badge>
    );
  };

  const getAgeCategory = (age: number): string => {
    if (age <= 20) return 'Young Adult';
    if (age <= 40) return 'Adult';
    if (age <= 60) return 'Middle-Aged';
    return 'Senior';
  };

  const handleDeleteClick = (id: string) => {
    setDependentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (dependentToDelete) {
      onDelete(dependentToDelete);
      setDependents((prev) => prev.filter((dependent) => dependent.id !== dependentToDelete));
      toast.success('Dependent record deleted successfully');
      setDeleteDialogOpen(false);
      setDependentToDelete(null);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDependents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDependents.length / itemsPerPage);

  return (
    <div className="w-full space-y-4">
      {/* Filters */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by prisoner name, number or residence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sex Filter */}
            <Select value={sexFilter} onValueChange={setSexFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Sexes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sexes</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>

            {/* Age Range Filter */}
            <Select value={ageRangeFilter} onValueChange={setAgeRangeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Ages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                <SelectItem value="0-20">0-20 years</SelectItem>
                <SelectItem value="21-40">21-40 years</SelectItem>
                <SelectItem value="41-60">41-60 years</SelectItem>
                <SelectItem value="61+">61+ years</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchTerm || sexFilter !== 'all' || ageRangeFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSexFilter('all');
                  setAgeRangeFilter('all');
                }}
                className="lg:col-span-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDependents.length)} of{' '}
          {filteredDependents.length} dependent records
        </div>
      </div>

      {/* Table */}
      <Card className="w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow style={{ backgroundColor: '#650000' }}>
                  <TableHead className="text-white font-bold">Prisoner Name</TableHead>
                  <TableHead className="text-white font-bold">Prisoner Number</TableHead>
                  <TableHead className="text-white font-bold">Sex</TableHead>
                  <TableHead className="text-white font-bold">Age</TableHead>
                  <TableHead className="text-white font-bold">Age Category</TableHead>
                  <TableHead className="text-white font-bold">Residence</TableHead>
                  <TableHead className="text-right text-white font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Loading dependent records...
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No dependent records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((dependent) => (
                    <TableRow key={dependent.id} className="hover:bg-gray-50">
                      <TableCell>{dependent.prisoner_name}</TableCell>
                      <TableCell className="font-mono text-sm">{dependent.prisoner_number}</TableCell>
                      <TableCell>{getSexBadge(dependent.sex_name)}</TableCell>
                      <TableCell>{dependent.age} years</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getAgeCategory(dependent.age)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{dependent.residence}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(dependent)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(dependent)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(dependent.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the dependent record from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              style={{ backgroundColor: '#650000' }}
              className="text-white hover:opacity-90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PrisonerDependentsList;
