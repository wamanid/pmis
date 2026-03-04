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
  Users,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PrisonerChild {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  sex_name: string;
  age: number;
  prisoner: string;
  sex: string;
}

interface PrisonerChildrenListProps {
  onView: (child: PrisonerChild) => void;
  onEdit: (child: PrisonerChild) => void;
  onDelete: (id: string) => void;
  refreshTrigger?: number;
  prisonerId?: string;
}

const PrisonerChildrenList: React.FC<PrisonerChildrenListProps> = ({
  onView,
  onEdit,
  onDelete,
  refreshTrigger,
  prisonerId,
}) => {
  const [children, setChildren] = useState<PrisonerChild[]>([]);
  const [filteredChildren, setFilteredChildren] = useState<PrisonerChild[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sexFilter, setSexFilter] = useState('all');
  const [ageRangeFilter, setAgeRangeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [childToDelete, setChildToDelete] = useState<string | null>(null);

  // Mock data
  const mockChildren: PrisonerChild[] = [
    {
      id: '1',
      prisoner_name: 'John Doe',
      prisoner_number: 'PR-2024-001',
      sex_name: 'Male',
      age: 8,
      prisoner: '1',
      sex: '1',
    },
    {
      id: '2',
      prisoner_name: 'John Doe',
      prisoner_number: 'PR-2024-001',
      sex_name: 'Female',
      age: 12,
      prisoner: '1',
      sex: '2',
    },
    {
      id: '3',
      prisoner_name: 'Jane Smith',
      prisoner_number: 'PR-2024-002',
      sex_name: 'Male',
      age: 15,
      prisoner: '2',
      sex: '1',
    },
    {
      id: '4',
      prisoner_name: 'Jane Smith',
      prisoner_number: 'PR-2024-002',
      sex_name: 'Female',
      age: 6,
      prisoner: '2',
      sex: '2',
    },
    {
      id: '5',
      prisoner_name: 'Michael Johnson',
      prisoner_number: 'PR-2024-003',
      sex_name: 'Male',
      age: 10,
      prisoner: '3',
      sex: '1',
    },
    {
      id: '6',
      prisoner_name: 'Emily Davis',
      prisoner_number: 'PR-2024-004',
      sex_name: 'Female',
      age: 14,
      prisoner: '4',
      sex: '2',
    },
    {
      id: '7',
      prisoner_name: 'Emily Davis',
      prisoner_number: 'PR-2024-004',
      sex_name: 'Male',
      age: 9,
      prisoner: '4',
      sex: '1',
    },
    {
      id: '8',
      prisoner_name: 'Robert Lee',
      prisoner_number: 'PR-2024-005',
      sex_name: 'Female',
      age: 17,
      prisoner: '5',
      sex: '2',
    },
  ];

  useEffect(() => {
    loadChildren();
  }, [refreshTrigger, prisonerId]);

  useEffect(() => {
    filterChildren();
  }, [children, searchTerm, sexFilter, ageRangeFilter]);

  const loadChildren = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      let data = mockChildren;
      // Filter by prisonerId if provided
      if (prisonerId) {
        data = data.filter((child) => child.prisoner === prisonerId);
      }
      setChildren(data);
      setLoading(false);
    }, 500);
  };

  const filterChildren = () => {
    let filtered = [...children];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (child) =>
          child.prisoner_name.toLowerCase().includes(term) ||
          child.prisoner_number.toLowerCase().includes(term) ||
          child.sex_name.toLowerCase().includes(term)
      );
    }

    // Sex filter
    if (sexFilter !== 'all') {
      filtered = filtered.filter((child) => child.sex_name === sexFilter);
    }

    // Age range filter
    if (ageRangeFilter !== 'all') {
      switch (ageRangeFilter) {
        case '0-5':
          filtered = filtered.filter((child) => child.age >= 0 && child.age <= 5);
          break;
        case '6-10':
          filtered = filtered.filter((child) => child.age >= 6 && child.age <= 10);
          break;
        case '11-15':
          filtered = filtered.filter((child) => child.age >= 11 && child.age <= 15);
          break;
        case '16+':
          filtered = filtered.filter((child) => child.age >= 16);
          break;
      }
    }

    setFilteredChildren(filtered);
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

  const getAgeGroup = (age: number): string => {
    if (age <= 5) return 'Infant/Toddler';
    if (age <= 10) return 'Child';
    if (age <= 15) return 'Pre-Teen';
    return 'Teenager';
  };

  const handleDeleteClick = (id: string) => {
    setChildToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (childToDelete) {
      onDelete(childToDelete);
      setChildren((prev) => prev.filter((child) => child.id !== childToDelete));
      toast.success('Child record deleted successfully');
      setDeleteDialogOpen(false);
      setChildToDelete(null);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredChildren.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredChildren.length / itemsPerPage);

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
                placeholder="Search by prisoner name or number..."
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
                <SelectItem value="0-5">0-5 years</SelectItem>
                <SelectItem value="6-10">6-10 years</SelectItem>
                <SelectItem value="11-15">11-15 years</SelectItem>
                <SelectItem value="16+">16+ years</SelectItem>
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
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredChildren.length)} of{' '}
          {filteredChildren.length} child records
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
                  <TableHead className="text-white font-bold">Age Group</TableHead>
                  <TableHead className="text-right text-white font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Loading child records...
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No child records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((child) => (
                    <TableRow key={child.id} className="hover:bg-gray-50">
                      <TableCell>{child.prisoner_name}</TableCell>
                      <TableCell className="font-mono text-sm">{child.prisoner_number}</TableCell>
                      <TableCell>{getSexBadge(child.sex_name)}</TableCell>
                      <TableCell>{child.age} years</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getAgeGroup(child.age)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(child)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(child)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(child.id)}
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
              This action cannot be undone. This will permanently delete the child record from the system.
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

export default PrisonerChildrenList;
