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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Search, Plus, Eye, Edit, ChevronLeft, ChevronRight, MoreVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import FoodAssessmentForm from './FoodAssessmentForm';
import { Dialog, DialogContent } from '../ui/dialog';

interface FoodAssessment {
  id: string;
  prisoner_name: string;
  assessor_name: string;
  assessment_date: string;
  meal_type: string;
  food_quality: string;
  portion_size: string;
  nutritional_adequacy: string;
  food_temperature: string;
  presentation: string;
  taste_feedback: string;
  hygiene_standards: string;
  special_dietary_needs: string;
  allergen_considerations: string;
  appetite_level: string;
  food_consumed_percentage: string;
  waste_amount: string;
  complaints: string;
  assessor: string;
  recommendations: string;
  follow_up_required: string;
  notes: string;
  prisoner: string;
}

interface FoodAssessmentListProps {
  selectedPrisonerId?: string;
}

// Mock data
const mockFoodAssessments: FoodAssessment[] = [
  {
    id: '1',
    prisoner: '1',
    prisoner_name: 'John Doe',
    assessor: '1',
    assessor_name: 'Nurse Mary Nakato',
    assessment_date: '2024-11-13',
    meal_type: 'Lunch',
    food_quality: 'Good',
    portion_size: 'Adequate',
    nutritional_adequacy: 'Adequate',
    food_temperature: 'Appropriate',
    presentation: 'Good',
    taste_feedback: 'Food was well-prepared and tasty',
    hygiene_standards: 'Excellent',
    special_dietary_needs: 'Low sodium diet due to hypertension',
    allergen_considerations: 'No known allergies',
    appetite_level: 'Good',
    food_consumed_percentage: '85',
    waste_amount: 'Minimal',
    complaints: 'None',
    recommendations: 'Continue current diet plan',
    follow_up_required: 'No',
    notes: 'Patient eating well and satisfied with meals',
  },
  {
    id: '2',
    prisoner: '2',
    prisoner_name: 'Jane Smith',
    assessor: '2',
    assessor_name: 'Nutritionist Peter Musoke',
    assessment_date: '2024-11-12',
    meal_type: 'Breakfast',
    food_quality: 'Excellent',
    portion_size: 'Adequate',
    nutritional_adequacy: 'Excellent',
    food_temperature: 'Appropriate',
    presentation: 'Excellent',
    taste_feedback: 'Breakfast was very good, enjoyed the porridge',
    hygiene_standards: 'Excellent',
    special_dietary_needs: 'High protein diet for recovery from TB',
    allergen_considerations: 'Lactose intolerant - dairy alternatives provided',
    appetite_level: 'Excellent',
    food_consumed_percentage: '95',
    waste_amount: 'None',
    complaints: 'None',
    recommendations: 'Continue high protein diet, monitor weight gain',
    follow_up_required: 'Yes',
    notes: 'Patient showing good appetite and weight improvement',
  },
  {
    id: '3',
    prisoner: '3',
    prisoner_name: 'Michael Johnson',
    assessor: '4',
    assessor_name: 'Nurse Grace Atim',
    assessment_date: '2024-11-13',
    meal_type: 'Dinner',
    food_quality: 'Fair',
    portion_size: 'Adequate',
    nutritional_adequacy: 'Adequate',
    food_temperature: 'Too Cold',
    presentation: 'Fair',
    taste_feedback: 'Food was cold and not very appealing',
    hygiene_standards: 'Good',
    special_dietary_needs: 'None',
    allergen_considerations: 'Allergic to peanuts',
    appetite_level: 'Poor',
    food_consumed_percentage: '45',
    waste_amount: 'Moderate',
    complaints: 'Food served cold, needs reheating',
    recommendations: 'Ensure food is served at appropriate temperature, investigate kitchen timing',
    follow_up_required: 'Yes',
    notes: 'Patient appetite affected by medication, food temperature issue noted',
  },
  {
    id: '4',
    prisoner: '4',
    prisoner_name: 'Emily Davis',
    assessor: '5',
    assessor_name: 'Nutritionist Sarah Kizza',
    assessment_date: '2024-11-11',
    meal_type: 'Lunch',
    food_quality: 'Good',
    portion_size: 'Adequate',
    nutritional_adequacy: 'Adequate',
    food_temperature: 'Appropriate',
    presentation: 'Good',
    taste_feedback: 'Enjoyed the meal, good variety',
    hygiene_standards: 'Excellent',
    special_dietary_needs: 'Diabetic diet - controlled carbohydrates',
    allergen_considerations: 'No known allergies',
    appetite_level: 'Normal',
    food_consumed_percentage: '80',
    waste_amount: 'Minimal',
    complaints: 'None',
    recommendations: 'Continue diabetic meal plan, monitor blood glucose levels',
    follow_up_required: 'Yes',
    notes: 'Blood glucose levels stable, patient managing diet well',
  },
  {
    id: '5',
    prisoner: '5',
    prisoner_name: 'Robert Lee',
    assessor: '3',
    assessor_name: 'Dr. David Makumbi',
    assessment_date: '2024-11-13',
    meal_type: 'Breakfast',
    food_quality: 'Good',
    portion_size: 'Insufficient',
    nutritional_adequacy: 'Needs Improvement',
    food_temperature: 'Appropriate',
    presentation: 'Good',
    taste_feedback: 'Good taste but portion too small',
    hygiene_standards: 'Good',
    special_dietary_needs: 'High calorie diet for underweight patient',
    allergen_considerations: 'None',
    appetite_level: 'Excellent',
    food_consumed_percentage: '100',
    waste_amount: 'None',
    complaints: 'Portion size too small, still hungry after meal',
    recommendations: 'Increase portion sizes, add high-calorie supplements between meals',
    follow_up_required: 'Yes',
    notes: 'Patient underweight, needs nutritional support to gain weight',
  },
];

const FoodAssessmentList: React.FC<FoodAssessmentListProps> = ({ selectedPrisonerId }) => {
  const [records, setRecords] = useState<FoodAssessment[]>(mockFoodAssessments);
  const [filteredRecords, setFilteredRecords] = useState<FoodAssessment[]>(mockFoodAssessments);
  const [searchTerm, setSearchTerm] = useState('');
  const [qualityFilter, setQualityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FoodAssessment | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    filterRecords();
  }, [searchTerm, qualityFilter, records, selectedPrisonerId]);

  const filterRecords = () => {
    let filtered = [...records];

    if (selectedPrisonerId) {
      filtered = filtered.filter((record) => record.prisoner === selectedPrisonerId);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.prisoner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.meal_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.taste_feedback.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (qualityFilter !== 'all') {
      filtered = filtered.filter((record) => record.food_quality === qualityFilter);
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

  const getQualityBadge = (quality: string) => {
    const variants: { [key: string]: string } = {
      Excellent: 'bg-green-100 text-green-800',
      Good: 'bg-blue-100 text-blue-800',
      Fair: 'bg-yellow-100 text-yellow-800',
      Poor: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={variants[quality] || 'bg-gray-100 text-gray-800'}>
        {quality}
      </Badge>
    );
  };

  const getAppetiteBadge = (appetite: string) => {
    const variants: { [key: string]: string } = {
      Excellent: 'bg-green-100 text-green-800',
      Good: 'bg-blue-100 text-blue-800',
      Normal: 'bg-gray-100 text-gray-800',
      Poor: 'bg-orange-100 text-orange-800',
      'No Appetite': 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={variants[appetite] || 'bg-gray-100 text-gray-800'}>
        {appetite}
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
                  placeholder="Search by prisoner, meal type, or feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <Label htmlFor="quality-filter">Food Quality</Label>
              <Select value={qualityFilter} onValueChange={setQualityFilter}>
                <SelectTrigger id="quality-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quality</SelectItem>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
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
                  <TableHead>Prisoner</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Meal Type</TableHead>
                  <TableHead>Food Quality</TableHead>
                  <TableHead>Appetite</TableHead>
                  <TableHead>Consumed</TableHead>
                  <TableHead>Assessor</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No food assessment records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell>{record.prisoner_name}</TableCell>
                      <TableCell>{new Date(record.assessment_date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.meal_type}</TableCell>
                      <TableCell>{getQualityBadge(record.food_quality)}</TableCell>
                      <TableCell>{getAppetiteBadge(record.appetite_level)}</TableCell>
                      <TableCell>{record.food_consumed_percentage}%</TableCell>
                      <TableCell>{record.assessor_name}</TableCell>
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
                              onClick={() => {
                                setRecordToDelete(record.id);
                                setShowDeleteDialog(true);
                              }}
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
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (recordToDelete) {
                  setRecords(records.filter((record) => record.id !== recordToDelete));
                  toast.success('Food assessment deleted successfully');
                }
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FoodAssessmentList;