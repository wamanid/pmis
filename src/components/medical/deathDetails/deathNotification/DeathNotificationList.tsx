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
import DeathNotificationForm from './DeathNotificationForm';
import DeathNotificationView from './DeathNotificationView';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';

interface Recipient {
  id: string;
  recipient_name: string;
  recipient: string;
}

interface DeathNotification {
  id: string;
  prisoner_name: string;
  death_confirmation: string;
  notification: string;
  recipients: Recipient[];
}

interface DeathNotificationListProps {
  selectedPrisonerId?: string;
}

// Mock data
const mockDeathNotifications: DeathNotification[] = [
  {
    id: '1',
    prisoner_name: 'John Doe (PR-2024-001)',
    death_confirmation: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    notification: '3fa85f64-5717-4562-b3fc-2c963f66afb1',
    recipients: [
      { id: '1', recipient_name: 'Mary Doe (Mother)', recipient: '3fa85f64-5717-4562-b3fc-2c963f66afc1' },
      { id: '2', recipient_name: 'James Doe (Father)', recipient: '3fa85f64-5717-4562-b3fc-2c963f66afc2' },
    ],
  },
  {
    id: '2',
    prisoner_name: 'Jane Smith (PR-2024-002)',
    death_confirmation: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
    notification: '3fa85f64-5717-4562-b3fc-2c963f66afb1',
    recipients: [
      { id: '3', recipient_name: 'Sarah Smith (Wife)', recipient: '3fa85f64-5717-4562-b3fc-2c963f66afc3' },
      { id: '4', recipient_name: 'Robert Johnson (Brother)', recipient: '3fa85f64-5717-4562-b3fc-2c963f66afc4' },
      { id: '5', recipient_name: 'Attorney David Musoke', recipient: '3fa85f64-5717-4562-b3fc-2c963f66afc6' },
    ],
  },
  {
    id: '3',
    prisoner_name: 'Michael Johnson (PR-2024-003)',
    death_confirmation: '3fa85f64-5717-4562-b3fc-2c963f66afa8',
    notification: '3fa85f64-5717-4562-b3fc-2c963f66afb4',
    recipients: [
      { id: '6', recipient_name: 'Grace Nakato (Sister)', recipient: '3fa85f64-5717-4562-b3fc-2c963f66afc5' },
      { id: '7', recipient_name: 'Rev. Peter Ssemakula', recipient: '3fa85f64-5717-4562-b3fc-2c963f66afc7' },
    ],
  },
  {
    id: '4',
    prisoner_name: 'Emily Davis (PR-2024-004)',
    death_confirmation: '3fa85f64-5717-4562-b3fc-2c963f66afa9',
    notification: '3fa85f64-5717-4562-b3fc-2c963f66afb1',
    recipients: [
      { id: '8', recipient_name: 'Mary Doe (Mother)', recipient: '3fa85f64-5717-4562-b3fc-2c963f66afc1' },
      { id: '9', recipient_name: 'US Embassy Kampala', recipient: '3fa85f64-5717-4562-b3fc-2c963f66afc8' },
      { id: '10', recipient_name: 'Attorney David Musoke', recipient: '3fa85f64-5717-4562-b3fc-2c963f66afc6' },
    ],
  },
  {
    id: '5',
    prisoner_name: 'Robert Lee (PR-2024-005)',
    death_confirmation: '3fa85f64-5717-4562-b3fc-2c963f66afaa',
    notification: '3fa85f64-5717-4562-b3fc-2c963f66afb5',
    recipients: [
      { id: '11', recipient_name: 'James Doe (Father)', recipient: '3fa85f64-5717-4562-b3fc-2c963f66afc2' },
    ],
  },
  {
    id: '6',
    prisoner_name: 'Jane Smith (PR-2024-002)',
    death_confirmation: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
    notification: '3fa85f64-5717-4562-b3fc-2c963f66afb2',
    recipients: [
      { id: '12', recipient_name: 'UK High Commission', recipient: '3fa85f64-5717-4562-b3fc-2c963f66afc9' },
    ],
  },
];

const DeathNotificationList: React.FC<DeathNotificationListProps> = ({ selectedPrisonerId }) => {
  const [records, setRecords] = useState<DeathNotification[]>(mockDeathNotifications);
  const [filteredRecords, setFilteredRecords] = useState<DeathNotification[]>(mockDeathNotifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DeathNotification | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    filterRecords();
  }, [searchTerm, records, selectedPrisonerId]);

  const filterRecords = () => {
    let filtered = [...records];

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.prisoner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.recipients.some((r) => r.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleView = (record: DeathNotification) => {
    setSelectedRecord(record);
    setViewDialogOpen(true);
  };

  const handleEdit = (record: DeathNotification) => {
    setSelectedRecord(record);
    setFormMode('edit');
    setDialogOpen(true);
  };

  const handleFormSubmit = (data: DeathNotification) => {
    if (formMode === 'create') {
      const newRecord: DeathNotification = {
        ...data,
        id: `${records.length + 1}`,
      };
      setRecords([...records, newRecord]);
      toast.success('Death notification created successfully');
    } else if (formMode === 'edit') {
      setRecords(records.map((r) => (r.id === selectedRecord?.id ? { ...data, id: r.id } : r)));
      toast.success('Death notification updated successfully');
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
      toast.success('Death notification deleted successfully');
      setShowDeleteDialog(false);
    }
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
                  placeholder="Search by prisoner name or recipient..."
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
                Add Notification
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Prisoner Name</TableHead>
                  <TableHead>Death Confirmation ID</TableHead>
                  <TableHead>Number of Recipients</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No death notification records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{record.prisoner_name}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">DC-{record.death_confirmation.slice(-8)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">
                          {record.recipients.length} {record.recipients.length === 1 ? 'Recipient' : 'Recipients'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="flex flex-wrap gap-1">
                          {record.recipients.slice(0, 3).map((recipient, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {recipient.recipient_name}
                            </Badge>
                          ))}
                          {record.recipients.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{record.recipients.length - 3} more
                            </Badge>
                          )}
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

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogTitle>Death Notification Form</DialogTitle>
          <DialogDescription>
            Create or update death notifications and manage recipients.
          </DialogDescription>
          <DeathNotificationForm
            notification={selectedRecord}
            onSubmit={handleFormSubmit}
            onCancel={() => setDialogOpen(false)}
            mode={formMode}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogTitle>Death Notification Details</DialogTitle>
          <DialogDescription>
            View detailed information about this death notification and all recipients.
          </DialogDescription>
          {selectedRecord && (
            <DeathNotificationView
              deathNotification={selectedRecord}
              onClose={() => setViewDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the death notification record.
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

export default DeathNotificationList;
