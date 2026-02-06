import React, { useState, useEffect } from 'react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../ui/table';
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
import { Card, CardContent } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Search, Plus, Eye, Edit, ChevronLeft, ChevronRight, MoreVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import FoodAssessmentForm from './FoodAssessmentForm';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../../ui/dialog';

interface FoodAssessment {
  id: string;
  notes: string;
  station: string;
  station_name: string;
  item: string;
  item_name: string;
  item_category?: string;
  quality: string;
  quality_name: string;
}

interface FoodAssessmentListProps {
  selectedStationId?: string;
}

// Mock data
const mockFoodAssessments: FoodAssessment[] = [
  {
    id: '1',
    station: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    station_name: 'Luzira Maximum Security Prison',
    item: '3fa85f64-5717-4562-b3fc-2c963f66afb1',
    item_name: 'Posho (Maize Meal)',
    item_category: 'Staple',
    quality: '3fa85f64-5717-4562-b3fc-2c963f66afc2',
    quality_name: 'Good',
    notes: 'Well-prepared posho with good consistency. Properly cooked and served hot. Prisoners reported satisfaction with the quality and portion size.',
  },
  {
    id: '2',
    station: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    station_name: 'Luzira Maximum Security Prison',
    item: '3fa85f64-5717-4562-b3fc-2c963f66afb2',
    item_name: 'Beans',
    item_category: 'Protein',
    quality: '3fa85f64-5717-4562-b3fc-2c963f66afc3',
    quality_name: 'Fair',
    notes: 'Beans were slightly undercooked. Need to increase cooking time by 15-20 minutes. Some prisoners complained about hardness. Recommend quality improvement.',
  },
  {
    id: '3',
    station: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
    station_name: 'Kigo Prison',
    item: '3fa85f64-5717-4562-b3fc-2c963f66afb3',
    item_name: 'Matoke (Plantain)',
    item_category: 'Staple',
    quality: '3fa85f64-5717-4562-b3fc-2c963f66afc1',
    quality_name: 'Excellent',
    notes: 'Perfectly steamed matoke, soft and well-prepared. Excellent taste and presentation. All prisoners satisfied with the meal.',
  },
  {
    id: '4',
    station: '3fa85f64-5717-4562-b3fc-2c963f66afa8',
    station_name: 'Murchison Bay Prison',
    item: '3fa85f64-5717-4562-b3fc-2c963f66afb4',
    item_name: 'Rice',
    item_category: 'Staple',
    quality: '3fa85f64-5717-4562-b3fc-2c963f66afc4',
    quality_name: 'Poor',
    notes: 'Rice was overcooked and mushy. Temperature was too cold when served. Multiple complaints received. Immediate action required to improve preparation standards.',
  },
  {
    id: '5',
    station: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
    station_name: 'Kigo Prison',
    item: '3fa85f64-5717-4562-b3fc-2c963f66afb6',
    item_name: 'Vegetables (Greens)',
    item_category: 'Vegetable',
    quality: '3fa85f64-5717-4562-b3fc-2c963f66afc2',
    quality_name: 'Good',
    notes: 'Fresh vegetables, properly washed and cooked. Good nutritional value maintained. Minor salt adjustment needed for better taste.',
  },
  {
    id: '6',
    station: '3fa85f64-5717-4562-b3fc-2c963f66afa9',
    station_name: 'Gulu Main Prison',
    item: '3fa85f64-5717-4562-b3fc-2c963f66afb8',
    item_name: 'Meat Stew',
    item_category: 'Protein',
    quality: '3fa85f64-5717-4562-b3fc-2c963f66afc1',
    quality_name: 'Excellent',
    notes: 'Well-seasoned meat stew with tender meat. Adequate portion of meat per serving. Hygiene standards maintained throughout preparation.',
  },
  {
    id: '7',
    station: '3fa85f64-5717-4562-b3fc-2c963f66afaa',
    station_name: 'Mbarara Main Prison',
    item: '3fa85f64-5717-4562-b3fc-2c963f66afbc',
    item_name: 'Porridge',
    item_category: 'Breakfast',
    quality: '3fa85f64-5717-4562-b3fc-2c963f66afc2',
    quality_name: 'Good',
    notes: 'Nutritious morning porridge served at appropriate temperature. Good sweetness level. Prisoners reported satisfaction with breakfast meal.',
  },
];

const FoodAssessmentList: React.FC<FoodAssessmentListProps> = ({ selectedStationId }) => {
  const [records, setRecords] = useState<FoodAssessment[]>(mockFoodAssessments);
  const [filteredRecords, setFilteredRecords] = useState<FoodAssessment[]>(mockFoodAssessments);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FoodAssessment | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    filterRecords();
  }, [searchTerm, records, selectedStationId]);

  const filterRecords = () => {
    let filtered = [...records];

    if (selectedStationId) {
      filtered = filtered.filter((record) => record.station === selectedStationId);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.station_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.quality_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setSelectedRecord(null);
    setFormMode('create');
    setDialogOpen(true);
  };

  const handleView = (record: FoodAssessment) => {
    setSelectedRecord(record);
    setFormMode('view');
    setDialogOpen(true);
  };

  const handleEdit = (record: FoodAssessment) => {
    setSelectedRecord(record);
    setFormMode('edit');
    setDialogOpen(true);
  };

  const handleFormSubmit = (data: FoodAssessment) => {
    if (formMode === 'create') {
      const newRecord: FoodAssessment = {
        ...data,
        id: `${records.length + 1}`,
      };
      setRecords([...records, newRecord]);
      toast.success('Food assessment created successfully');
    } else if (formMode === 'edit') {
      setRecords(records.map((r) => (r.id === selectedRecord?.id ? { ...data, id: r.id } : r)));
      toast.success('Food assessment updated successfully');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setRecordToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      setRecords(records.filter((record) => record.id !== recordToDelete));
      toast.success('Food assessment deleted successfully');
      setShowDeleteDialog(false);
    }
  };

  const getQualityBadge = (qualityName: string) => {
    const variants: { [key: string]: string } = {
      Excellent: 'bg-green-100 text-green-800',
      Good: 'bg-blue-100 text-blue-800',
      Fair: 'bg-yellow-100 text-yellow-800',
      Poor: 'bg-orange-100 text-orange-800',
      Unacceptable: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={variants[qualityName] || 'bg-gray-100 text-gray-800'}>
        {qualityName}
      </Badge>
    );
  };

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  return (
    <>
      <Card>
        <CardContent className="p-6">
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by station, food item, or quality..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleCreate}
                style={{ backgroundColor: '#650000' }}
                className="text-white hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Assessment
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Station</TableHead>
                  <TableHead>Food Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quality Rating</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No food assessment records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{record.station_name}</TableCell>
                      <TableCell>{record.item_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.item_category}</Badge>
                      </TableCell>
                      <TableCell>{getQualityBadge(record.quality_name)}</TableCell>
                      <TableCell className="max-w-md">
                        <div className="line-clamp-2" title={record.notes}>
                          {record.notes || 'No notes'}
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
                            <DropdownMenuItem onClick={() => handleView(record)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(record)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(record.id)}
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

          {/* Pagination */}
          {filteredRecords.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredRecords.length)} of{' '}
                {filteredRecords.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogTitle>Food Assessment Form</DialogTitle>
          <DialogDescription>
            Assess food quality and record observations for station meals.
          </DialogDescription>
          <FoodAssessmentForm
            assessment={selectedRecord}
            onSubmit={handleFormSubmit}
            onCancel={() => setDialogOpen(false)}
            mode={formMode}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the food assessment record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FoodAssessmentList;
