import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  User,
  Activity,
  UserCircle,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
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

interface AfterCare {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  activity_name: string;
  officer_name: string;
  description: string;
  photo?: string;
  prisoner: string;
  after_care_activity: string;
  officer: number;
}

interface AfterCareListProps {
  afterCares: AfterCare[];
  onView: (afterCare: AfterCare) => void;
  onEdit: (afterCare: AfterCare) => void;
  onDelete: (id: string) => void;
}

const AfterCareList: React.FC<AfterCareListProps> = ({
  afterCares,
  onView,
  onEdit,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAfterCares, setFilteredAfterCares] = useState<AfterCare[]>(afterCares);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [afterCareToDelete, setAfterCareToDelete] = useState<string | null>(null);

  useEffect(() => {
    const filtered = afterCares.filter(afterCare => {
      const searchLower = searchTerm.toLowerCase();
      return (
        afterCare.prisoner_name.toLowerCase().includes(searchLower) ||
        afterCare.prisoner_number.toLowerCase().includes(searchLower) ||
        afterCare.activity_name.toLowerCase().includes(searchLower) ||
        afterCare.officer_name.toLowerCase().includes(searchLower) ||
        afterCare.description.toLowerCase().includes(searchLower)
      );
    });
    setFilteredAfterCares(filtered);
  }, [searchTerm, afterCares]);

  const handleDeleteClick = (id: string) => {
    setAfterCareToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (afterCareToDelete) {
      onDelete(afterCareToDelete);
      setDeleteDialogOpen(false);
      setAfterCareToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by prisoner name, number, activity, officer, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setSearchTerm('')}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* After Care Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: '#650000' }} className="hover:bg-[#650000]">
                  <TableHead className="text-white">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Prisoner Name
                    </div>
                  </TableHead>
                  <TableHead className="text-white">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Prisoner Number
                    </div>
                  </TableHead>
                  <TableHead className="text-white">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Activity
                    </div>
                  </TableHead>
                  <TableHead className="text-white">
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4" />
                      Responsible Officer
                    </div>
                  </TableHead>
                  <TableHead className="text-white">Description</TableHead>
                  <TableHead className="text-white">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Photo
                    </div>
                  </TableHead>
                  <TableHead className="text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAfterCares.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No after care records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAfterCares.map((afterCare) => (
                    <TableRow key={afterCare.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>{afterCare.prisoner_name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          {afterCare.prisoner_number}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {afterCare.activity_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{afterCare.officer_name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[250px] truncate text-sm text-gray-600">
                          {afterCare.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        {afterCare.photo ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <ImageIcon className="h-4 w-4" />
                            <span className="text-xs">Available</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No photo</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(afterCare)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(afterCare)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(afterCare.id)}
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Info */}
          {filteredAfterCares.length > 0 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <div>
                Showing {filteredAfterCares.length} of {afterCares.length} record(s)
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this after care record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              style={{ backgroundColor: '#650000' }}
              className="text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AfterCareList;
