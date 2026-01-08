import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Search, Plus, Edit, Trash2, Eye, Skull } from 'lucide-react';
import { toast } from 'sonner';
import { DischargeDeceasedForm } from './DischargeDeceasedForm';

interface DischargeDeceased {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  discharge_type_name: string;
  discharge_datetime: string;
  remarks: string;
  date_of_death: string;
  morgue_details: string;
  next_of_kin_available: boolean;
  next_of_kin_details: string;
  prisoner: string;
  discharge_type: string;
  discharge_reason: string;
}

export const DischargeDeceasedList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DischargeDeceased | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const [records, setRecords] = useState<DischargeDeceased[]>([
    {
      id: '1',
      prisoner_name: 'John Deceased',
      prisoner_number: 'P-2024-999',
      discharge_type_name: 'Death',
      discharge_datetime: '2025-11-25T10:00:00Z',
      remarks: 'Natural causes',
      date_of_death: '2025-11-25',
      morgue_details: 'Mulago Hospital Morgue',
      next_of_kin_available: true,
      next_of_kin_details: 'Mary Deceased, Wife, +256700123456',
      prisoner: 'prisoner-999',
      discharge_type: 'type-003',
      discharge_reason: 'reason-death-001',
    },
  ]);

  const filteredRecords = records.filter((record) =>
    record.prisoner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.prisoner_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, startIndex + recordsPerPage);

  const handleFormSubmit = (data: any) => {
    if (selectedRecord) {
      setRecords(records.map((r) => (r.id === selectedRecord.id ? { ...r, ...data } : r)));
      toast.success('Deceased discharge record updated successfully');
    } else {
      setRecords([...records, { id: Date.now().toString(), ...data }]);
      toast.success('Deceased discharge record created successfully');
    }
    setIsFormOpen(false);
    setSelectedRecord(null);
  };

  const confirmDelete = () => {
    if (selectedRecord) {
      setRecords(records.filter((r) => r.id !== selectedRecord.id));
      toast.success('Deceased discharge record deleted successfully');
    }
    setIsDeleteOpen(false);
    setSelectedRecord(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Deceased Prisoner Discharges</h1>
          <p className="text-muted-foreground">Manage deceased prisoner discharge records</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Record
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by prisoner name or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  <TableHead className="text-white font-bold">Prisoner Name</TableHead>
                  <TableHead className="text-white font-bold">Prisoner Number</TableHead>
                  <TableHead className="text-white font-bold">Date of Death</TableHead>
                  <TableHead className="text-white font-bold">Morgue Details</TableHead>
                  <TableHead className="text-white font-bold">Next of Kin</TableHead>
                  <TableHead className="text-white font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No deceased discharge records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.prisoner_name}</TableCell>
                      <TableCell>{record.prisoner_number}</TableCell>
                      <TableCell>{new Date(record.date_of_death).toLocaleDateString()}</TableCell>
                      <TableCell className="max-w-xs truncate">{record.morgue_details}</TableCell>
                      <TableCell>{record.next_of_kin_available ? 'Available' : 'Not Available'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(record); setIsViewOpen(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(record); setIsFormOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(record); setIsDeleteOpen(true); }}>
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{selectedRecord ? 'Edit' : 'Add'} Deceased Discharge</DialogTitle>
          </DialogHeader>
          <DischargeDeceasedForm
            initialData={selectedRecord}
            onSubmit={handleFormSubmit}
            onCancel={() => { setIsFormOpen(false); setSelectedRecord(null); }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Deceased Discharge Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Prisoner Name</Label><p className="text-sm mt-1">{selectedRecord.prisoner_name}</p></div>
                <div><Label>Prisoner Number</Label><p className="text-sm mt-1">{selectedRecord.prisoner_number}</p></div>
                <div><Label>Date of Death</Label><p className="text-sm mt-1">{new Date(selectedRecord.date_of_death).toLocaleDateString()}</p></div>
                <div><Label>Morgue Details</Label><p className="text-sm mt-1">{selectedRecord.morgue_details}</p></div>
                <div className="col-span-2"><Label>Next of Kin Details</Label><p className="text-sm mt-1">{selectedRecord.next_of_kin_details || 'N/A'}</p></div>
                <div className="col-span-2"><Label>Remarks</Label><p className="text-sm mt-1">{selectedRecord.remarks}</p></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this deceased discharge record? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};