import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
import { Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {MedicalRecord} from "../../../services/medical/medical";
import {PrisonerItem} from "../../../services/stationServices/visitorsServices/VisitorsService";
import {Unit} from "../../../services/stationServices/visitorsServices/visitorItem";

// interface MedicalRecord {
//   id: string;
//   prisoner_name: string;
//   prisoner_number: string;
//   blood_group_name: string;
//   prisoner: string;
//   blood_group: string;
// }

interface MedicalRecordListProps {
  onView: (medicalRecord: MedicalRecord) => void;
  onEdit: (medicalRecord: MedicalRecord) => void;
  onDelete: (id: string) => void;
  refreshTrigger?: number;
  medicalRecords: MedicalRecord
  setMedicalRecords: React.Dispatch<React.SetStateAction<MedicalRecord[]>>
  bloodGroups: Unit
  deleteDialogOpen: boolean
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<Boolean>>
}

const MedicalRecordList: React.FC<MedicalRecordListProps> = ({
  medicalRecords, setMedicalRecords, bloodGroups, setDeleteDialogOpen, deleteDialogOpen,
  onView,
  onEdit,
  onDelete,
  refreshTrigger,
}) => {
  // const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  // const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // const mockMedicalRecords: MedicalRecord[] = [
  //   {
  //     id: '1',
  //     prisoner_name: 'John Doe',
  //     prisoner_number: 'PR-2024-001',
  //     blood_group_name: 'A+',
  //     prisoner: '1',
  //     blood_group: '1',
  //   },
  //   {
  //     id: '2',
  //     prisoner_name: 'Jane Smith',
  //     prisoner_number: 'PR-2024-002',
  //     blood_group_name: 'O+',
  //     prisoner: '2',
  //     blood_group: '7',
  //   },
  //   {
  //     id: '3',
  //     prisoner_name: 'Michael Johnson',
  //     prisoner_number: 'PR-2024-003',
  //     blood_group_name: 'B+',
  //     prisoner: '3',
  //     blood_group: '3',
  //   },
  //   {
  //     id: '4',
  //     prisoner_name: 'Emily Davis',
  //     prisoner_number: 'PR-2024-004',
  //     blood_group_name: 'AB+',
  //     prisoner: '4',
  //     blood_group: '5',
  //   },
  //   {
  //     id: '5',
  //     prisoner_name: 'Robert Lee',
  //     prisoner_number: 'PR-2024-005',
  //     blood_group_name: 'O-',
  //     prisoner: '5',
  //     blood_group: '8',
  //   },
  // ];

  // useEffect(() => {
  //   loadMedicalRecords();
  // }, [refreshTrigger]);

  useEffect(() => {
    filterRecords();
  }, [medicalRecords, searchTerm, bloodGroupFilter]);

  // const loadMedicalRecords = () => {
  //   setLoading(true);
  //   setTimeout(() => {
  //     setMedicalRecords(mockMedicalRecords);
  //     setLoading(false);
  //   }, 500);
  // };

  const filterRecords = () => {
    let filtered = [...medicalRecords];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.prisoner_name?.toLowerCase().includes(term) ||
          record.prisoner_number?.toLowerCase().includes(term)
      );
    }

    if (bloodGroupFilter !== 'all') {
      filtered = filtered.filter((record) => record.blood_group_name === bloodGroupFilter);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const getBloodGroupBadge = (bloodGroup: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-red-100 text-red-800',
      'A-': 'bg-red-50 text-red-700',
      'B+': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-50 text-blue-700',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-50 text-purple-700',
      'O+': 'bg-green-100 text-green-800',
      'O-': 'bg-green-50 text-green-700',
    };

    return (
      <Badge className={colors[bloodGroup] || 'bg-gray-100 text-gray-800'}>{bloodGroup}</Badge>
    );
  };

  const handleDeleteClick = (id: string) => {
    setRecordToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      onDelete(recordToDelete);
      // setMedicalRecords((prev) => prev.filter((record) => record.id !== recordToDelete));
      // toast.success('Medical record deleted successfully');
      // setDeleteDialogOpen(false);
      // setRecordToDelete(null);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  return (
    <div className="w-full space-y-4">
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by prisoner name or number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={bloodGroupFilter} onValueChange={setBloodGroupFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Blood Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blood Groups</SelectItem>
                {
                  bloodGroups.map(item => (
                      <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRecords.length)} of{' '}
          {filteredRecords.length} medical records
        </div>
      </div>

      <Card className="w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow style={{ backgroundColor: '#650000' }}>
                  <TableHead className="text-white font-bold">Prisoner Name</TableHead>
                  <TableHead className="text-white font-bold">Prisoner Number</TableHead>
                  <TableHead className="text-white font-bold">Blood Group</TableHead>
                  <TableHead className="text-right text-white font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      Loading medical records...
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No medical records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell>{record.prisoner_name}</TableCell>
                      <TableCell className="font-mono text-sm">{record.prisoner_number}</TableCell>
                      <TableCell>{getBloodGroupBadge(record.blood_group_name)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(record)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(record)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(record.id)}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the medical record.
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

export default MedicalRecordList;
