import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { DischargeChecklistItemForm } from './DischargeChecklistItemForm';

interface DischargeChecklistItem {
  id: string;
  discharge_details: string;
  checklist_item_name: string;
  prisoner_name: string;
  completed: boolean;
  completed_date: string;
  notes: string;
  discharge: string;
  checklist_item: string;
}

export const DischargeChecklistItemList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompleted, setFilterCompleted] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DischargeChecklistItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const [checklistItems, setChecklistItems] = useState<DischargeChecklistItem[]>([
    {
      id: '1',
      discharge_details: 'Discharge #001 - John Doe',
      checklist_item_name: 'Property Return',
      prisoner_name: 'John Doe',
      completed: true,
      completed_date: '2025-11-29T09:00:00Z',
      notes: 'All personal property returned',
      discharge: 'discharge-001',
      checklist_item: 'checklist-001',
    },
    {
      id: '2',
      discharge_details: 'Discharge #001 - John Doe',
      checklist_item_name: 'Final Medical Check',
      prisoner_name: 'John Doe',
      completed: false,
      completed_date: '',
      notes: '',
      discharge: 'discharge-001',
      checklist_item: 'checklist-002',
    },
  ]);

  const filteredRecords = checklistItems.filter((record) => {
    const matchesSearch =
      record.prisoner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.checklist_item_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCompleted =
      filterCompleted === 'all' ||
      (filterCompleted === 'completed' && record.completed) ||
      (filterCompleted === 'pending' && !record.completed);

    return matchesSearch && matchesCompleted;
  });

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, startIndex + recordsPerPage);

  const handleView = (record: DischargeChecklistItem) => {
    setSelectedRecord(record);
    setIsViewOpen(true);
  };

  const handleEdit = (record: DischargeChecklistItem) => {
    setSelectedRecord(record);
    setIsFormOpen(true);
  };

  const handleDelete = (record: DischargeChecklistItem) => {
    setSelectedRecord(record);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedRecord) {
      setChecklistItems(checklistItems.filter((r) => r.id !== selectedRecord.id));
      toast.success('Checklist item deleted successfully');
    }
    setIsDeleteOpen(false);
    setSelectedRecord(null);
  };

  const handleFormSubmit = (data: any) => {
    if (selectedRecord) {
      setChecklistItems(
        checklistItems.map((r) => (r.id === selectedRecord.id ? { ...r, ...data } : r))
      );
      toast.success('Checklist item updated successfully');
    } else {
      const newRecord = {
        id: Date.now().toString(),
        ...data,
      };
      setChecklistItems([...checklistItems, newRecord]);
      toast.success('Checklist item created successfully');
    }
    setIsFormOpen(false);
    setSelectedRecord(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Discharge Checklist Items</h1>
          <p className="text-muted-foreground">
            Track discharge checklist completion for each prisoner
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Checklist Item
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by prisoner name or checklist item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={filterCompleted} onValueChange={setFilterCompleted}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{filteredRecords.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">
              {filteredRecords.filter((r) => r.completed).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-600">
              {filteredRecords.filter((r) => !r.completed).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  <TableHead className="text-white font-bold">Prisoner Name</TableHead>
                  <TableHead className="text-white font-bold">Checklist Item</TableHead>
                  <TableHead className="text-white font-bold">Status</TableHead>
                  <TableHead className="text-white font-bold">Completed Date</TableHead>
                  <TableHead className="text-white font-bold">Notes</TableHead>
                  <TableHead className="text-white font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No checklist items found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.prisoner_name}</TableCell>
                      <TableCell>{record.checklist_item_name}</TableCell>
                      <TableCell>
                        {record.completed ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-orange-600">
                            <XCircle className="h-4 w-4" />
                            Pending
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(record.completed_date)}</TableCell>
                      <TableCell className="max-w-xs truncate">{record.notes || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleView(record)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(record)}>
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
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + recordsPerPage, filteredRecords.length)} of {filteredRecords.length} records
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{selectedRecord ? 'Edit' : 'Add'} Checklist Item</DialogTitle>
          </DialogHeader>
          <DischargeChecklistItemForm
            initialData={selectedRecord}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedRecord(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Checklist Item Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prisoner Name</Label>
                  <p className="text-sm mt-1">{selectedRecord.prisoner_name}</p>
                </div>
                <div>
                  <Label>Checklist Item</Label>
                  <p className="text-sm mt-1">{selectedRecord.checklist_item_name}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p className="text-sm mt-1">{selectedRecord.completed ? 'Completed' : 'Pending'}</p>
                </div>
                <div>
                  <Label>Completed Date</Label>
                  <p className="text-sm mt-1">{formatDate(selectedRecord.completed_date)}</p>
                </div>
                <div className="col-span-2">
                  <Label>Notes</Label>
                  <p className="text-sm mt-1">{selectedRecord.notes || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <DialogDescription>Are you sure you want to delete this checklist item? This action cannot be undone.</DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};