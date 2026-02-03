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
import DeathRecipientForm from './DeathRecipientForm';
import { Dialog, DialogContent } from '../ui/dialog';

interface DeathRecipient {
  id: string;
  prisoner_name: string;
  received_by_name: string;
  collection_date: string;
  collection_time: string;
  recipient_full_name: string;
  recipient_relationship: string;
  recipient_national_id: string;
  recipient_contact: string;
  recipient_address: string;
  witness_name: string;
  witness_contact: string;
  received_by: string;
  body_condition: string;
  personal_effects_released: string;
  effects_description: string;
  death_certificate_collected: string;
  burial_permit_collected: string;
  transportation_arrangement: string;
  funeral_home_details: string;
  acknowledgement_signed: string;
  notes: string;
  prisoner: string;
}

interface DeathRecipientListProps {
  selectedPrisonerId?: string;
}

// Mock data
const mockDeathRecipients: DeathRecipient[] = [
  {
    id: '1',
    prisoner: '1',
    prisoner_name: 'John Doe',
    received_by: '2',
    received_by_name: 'Officer in Charge - David Ssemakula',
    collection_date: '2024-11-11',
    collection_time: '10:00',
    recipient_full_name: 'Mary Doe',
    recipient_relationship: 'Spouse',
    recipient_national_id: 'CM12345678901234',
    recipient_contact: '+256 700 123456',
    recipient_address: 'Plot 45, Kampala Road, Kampala',
    witness_name: 'Brother - James Doe',
    witness_contact: '+256 700 789012',
    body_condition: 'Good',
    personal_effects_released: 'Yes',
    effects_description: '1 wristwatch, 1 wedding ring, 1 wallet with UGX 50,000, 1 pair of shoes, 2 sets of clothing',
    death_certificate_collected: 'Yes',
    burial_permit_collected: 'Yes',
    transportation_arrangement: 'Kampala Funeral Services hearse',
    funeral_home_details: 'Kampala Funeral Services Ltd, Tel: +256 700 555666, License: FH-2024-045',
    acknowledgement_signed: 'Yes',
    notes: 'Body released in good condition. All documentation completed. Family thanked staff for care provided.',
  },
  {
    id: '2',
    prisoner: '3',
    prisoner_name: 'Michael Johnson',
    received_by: '1',
    received_by_name: 'Admin Officer - John Okello',
    collection_date: '2024-11-08',
    collection_time: '14:30',
    recipient_full_name: 'Elizabeth Johnson',
    recipient_relationship: 'Mother',
    recipient_national_id: 'CM98765432109876',
    recipient_contact: '+256 700 567890',
    recipient_address: 'Village Kabale, Mbarara District',
    witness_name: 'Father - Robert Johnson',
    witness_contact: '+256 700 234567',
    body_condition: 'Fair',
    personal_effects_released: 'Yes',
    effects_description: '1 Bible, 1 necklace, 1 wallet (empty), 2 sets of clothing, 1 blanket',
    death_certificate_collected: 'Yes',
    burial_permit_collected: 'Yes',
    transportation_arrangement: 'Family hired private vehicle',
    funeral_home_details: 'N/A - Family handling burial arrangements',
    acknowledgement_signed: 'Yes',
    notes: 'Mother very emotional. Police present due to suspicious nature of death. Post-mortem report provided to family.',
  },
  {
    id: '3',
    prisoner: '5',
    prisoner_name: 'Robert Lee',
    received_by: '3',
    received_by_name: 'Welfare Officer - Sarah Namukasa',
    collection_date: '2024-10-31',
    collection_time: '09:00',
    recipient_full_name: 'Sarah Lee',
    recipient_relationship: 'Daughter',
    recipient_national_id: 'CM11122233344455',
    recipient_contact: '+256 700 901234',
    recipient_address: 'Apartment 3B, Nakawa Housing Estate, Kampala',
    witness_name: 'Son - David Lee',
    witness_contact: '+256 700 456789',
    body_condition: 'Good',
    personal_effects_released: 'Yes',
    effects_description: '1 watch, 1 pair of glasses, 1 wallet with UGX 25,000, photos of family, 3 sets of clothing',
    death_certificate_collected: 'Yes',
    burial_permit_collected: 'Yes',
    transportation_arrangement: 'Kampala Funeral Services hearse',
    funeral_home_details: 'Kampala Funeral Services Ltd, Tel: +256 700 555666',
    acknowledgement_signed: 'Yes',
    notes: 'Natural death. Family appreciated the care. Body to be buried in family plot in Entebbe.',
  },
];

const DeathRecipientList: React.FC<DeathRecipientListProps> = ({ selectedPrisonerId }) => {
  const [records, setRecords] = useState<DeathRecipient[]>(mockDeathRecipients);
  const [filteredRecords, setFilteredRecords] = useState<DeathRecipient[]>(mockDeathRecipients);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DeathRecipient | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    filterRecords();
  }, [searchTerm, records, selectedPrisonerId]);

  const filterRecords = () => {
    let filtered = [...records];

    if (selectedPrisonerId) {
      filtered = filtered.filter((record) => record.prisoner === selectedPrisonerId);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.prisoner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.recipient_full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.recipient_national_id.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleView = (record: DeathRecipient) => {
    setSelectedRecord(record);
    setFormMode('view');
    setDialogOpen(true);
  };

  const handleEdit = (record: DeathRecipient) => {
    setSelectedRecord(record);
    setFormMode('edit');
    setDialogOpen(true);
  };

  const handleFormSubmit = (data: DeathRecipient) => {
    if (formMode === 'create') {
      const newRecord: DeathRecipient = {
        ...data,
        id: `${records.length + 1}`,
      };
      setRecords([...records, newRecord]);
      toast.success('Body release record created successfully');
    } else if (formMode === 'edit') {
      setRecords(records.map((r) => (r.id === selectedRecord?.id ? { ...data, id: r.id } : r)));
      toast.success('Body release record updated successfully');
    }
    setDialogOpen(false);
  };

  const handleDelete = (recordId: string) => {
    setRecordToDelete(recordId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      setRecords(records.filter((record) => record.id !== recordToDelete));
      toast.success('Body release record deleted successfully');
    }
    setShowDeleteDialog(false);
  };

  const getConditionBadge = (condition: string) => {
    const variants: { [key: string]: string } = {
      Good: 'bg-green-100 text-green-800',
      Fair: 'bg-yellow-100 text-yellow-800',
      Poor: 'bg-orange-100 text-orange-800',
      Decomposed: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={variants[condition] || 'bg-gray-100 text-gray-800'}>
        {condition}
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
                  placeholder="Search by prisoner, recipient, or ID..."
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
                Add Release Record
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Prisoner</TableHead>
                  <TableHead>Collection Date</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>National ID</TableHead>
                  <TableHead>Body Condition</TableHead>
                  <TableHead>Received By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No body release records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell>{record.prisoner_name}</TableCell>
                      <TableCell>{new Date(record.collection_date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.recipient_full_name}</TableCell>
                      <TableCell>{record.recipient_relationship}</TableCell>
                      <TableCell>{record.recipient_national_id}</TableCell>
                      <TableCell>{getConditionBadge(record.body_condition)}</TableCell>
                      <TableCell>{record.received_by_name}</TableCell>
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
          <DeathRecipientForm
            recipient={selectedRecord}
            onSubmit={handleFormSubmit}
            onCancel={() => setDialogOpen(false)}
            mode={formMode}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the body release record.
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

export default DeathRecipientList;