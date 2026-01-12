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
import DeathNotificationForm from './DeathNotificationForm';
import { Dialog, DialogContent } from '../ui/dialog';

interface DeathNotification {
  id: string;
  prisoner_name: string;
  notified_by_name: string;
  notification_date: string;
  notification_time: string;
  recipient_name: string;
  recipient_relationship: string;
  recipient_contact: string;
  recipient_address: string;
  notification_method: string;
  notification_status: string;
  notified_by: string;
  message_delivered: string;
  response_received: string;
  additional_contacts_notified: string;
  embassy_notified: string;
  embassy_name: string;
  next_of_kin_arrival_date: string;
  acknowledgement_received: string;
  notes: string;
  prisoner: string;
}

interface DeathNotificationListProps {
  selectedPrisonerId?: string;
}

// Mock data
const mockDeathNotifications: DeathNotification[] = [
  {
    id: '1',
    prisoner: '1',
    prisoner_name: 'John Doe',
    notified_by: '1',
    notified_by_name: 'Welfare Officer - Sarah Namukasa',
    notification_date: '2024-11-10',
    notification_time: '15:00',
    recipient_name: 'Mary Doe',
    recipient_relationship: 'Spouse',
    recipient_contact: '+256 700 123456',
    recipient_address: 'Plot 45, Kampala Road, Kampala',
    notification_method: 'Phone Call',
    notification_status: 'Acknowledged',
    message_delivered: 'Yes',
    response_received: 'Family member expressed shock and grief. Requested to come collect body. Will arrive tomorrow.',
    additional_contacts_notified: 'Brother - James Doe (+256 700 789012), Sister - Susan Doe (+256 700 345678)',
    embassy_notified: 'No',
    embassy_name: '',
    next_of_kin_arrival_date: '2024-11-11',
    acknowledgement_received: 'Yes',
    notes: 'Spouse very emotional but understood the message. Requested burial arrangements be discussed tomorrow.',
  },
  {
    id: '2',
    prisoner: '3',
    prisoner_name: 'Michael Johnson',
    notified_by: '3',
    notified_by_name: 'Social Worker - Grace Atim',
    notification_date: '2024-11-05',
    notification_time: '10:30',
    recipient_name: 'Elizabeth Johnson',
    recipient_relationship: 'Mother',
    recipient_contact: '+256 700 567890',
    recipient_address: 'Village Kabale, Mbarara District',
    notification_method: 'In Person',
    notification_status: 'Acknowledged',
    message_delivered: 'Yes',
    response_received: 'Mother was extremely distressed. Police present during notification due to suspicious nature of death.',
    additional_contacts_notified: 'Father - Robert Johnson (+256 700 234567), Local Council Chairman',
    embassy_notified: 'No',
    embassy_name: '',
    next_of_kin_arrival_date: '2024-11-06',
    acknowledgement_received: 'Yes',
    notes: 'Required police escort for in-person notification due to nature of death. Counseling support provided.',
  },
  {
    id: '3',
    prisoner: '5',
    prisoner_name: 'Robert Lee',
    notified_by: '2',
    notified_by_name: 'Admin Officer - John Okello',
    notification_date: '2024-10-29',
    notification_time: '08:00',
    recipient_name: 'Sarah Lee',
    recipient_relationship: 'Daughter',
    recipient_contact: '+256 700 901234',
    recipient_address: 'Apartment 3B, Nakawa Housing Estate, Kampala',
    notification_method: 'Phone Call',
    notification_status: 'Acknowledged',
    message_delivered: 'Yes',
    response_received: 'Daughter informed, she will coordinate with other family members and arrive within 2 days.',
    additional_contacts_notified: 'Son - David Lee (+256 700 456789)',
    embassy_notified: 'No',
    embassy_name: '',
    next_of_kin_arrival_date: '2024-10-31',
    acknowledgement_received: 'Yes',
    notes: 'Family aware of father\'s cardiac condition. Natural death confirmed.',
  },
];

const DeathNotificationList: React.FC<DeathNotificationListProps> = ({ selectedPrisonerId }) => {
  const [records, setRecords] = useState<DeathNotification[]>(mockDeathNotifications);
  const [filteredRecords, setFilteredRecords] = useState<DeathNotification[]>(mockDeathNotifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DeathNotification | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    filterRecords();
  }, [searchTerm, statusFilter, records, selectedPrisonerId]);

  const filterRecords = () => {
    let filtered = [...records];

    if (selectedPrisonerId) {
      filtered = filtered.filter((record) => record.prisoner === selectedPrisonerId);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.prisoner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.recipient_contact.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((record) => record.notification_status === statusFilter);
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
    setFormMode('view');
    setDialogOpen(true);
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

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Notified: 'bg-blue-100 text-blue-800',
      Acknowledged: 'bg-green-100 text-green-800',
      Failed: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status}
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
                  placeholder="Search by prisoner, recipient, or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <Label htmlFor="status-filter">Notification Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Notified">Notified</SelectItem>
                  <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
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
                Add Notification
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Prisoner</TableHead>
                  <TableHead>Notification Date</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notified By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No death notification records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell>{record.prisoner_name}</TableCell>
                      <TableCell>{new Date(record.notification_date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.recipient_name}</TableCell>
                      <TableCell>{record.recipient_relationship}</TableCell>
                      <TableCell>{record.notification_method}</TableCell>
                      <TableCell>{getStatusBadge(record.notification_status)}</TableCell>
                      <TableCell>{record.notified_by_name}</TableCell>
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
          <DeathNotificationForm
            notification={selectedRecord}
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
              This action cannot be undone. This will permanently delete the death notification.
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
                  toast.success('Death notification deleted successfully');
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

export default DeathNotificationList;