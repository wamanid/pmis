import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DischargeOfficersForm } from './DischargeOfficersForm';

export const DischargeOfficersList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const [records, setRecords] = useState([
    {
      id: '1',
      discharge_details: 'Discharge #001',
      prisoner_name: 'John Doe',
      officer_name: 'Officer Smith',
      rank: 'Inspector',
      force_number: 'OF-1234',
      role: 'Approving Officer',
      signature: 'signature.png',
      discharge: 'discharge-001',
    },
  ]);

  const filteredRecords = records.filter((r) =>
    r.officer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.prisoner_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Discharge Officers</h1>
          <p className="text-muted-foreground">Manage officers involved in discharge process</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Officer
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary hover:bg-primary">
                <TableHead className="text-white font-bold">Officer Name</TableHead>
                <TableHead className="text-white font-bold">Rank</TableHead>
                <TableHead className="text-white font-bold">Force Number</TableHead>
                <TableHead className="text-white font-bold">Role</TableHead>
                <TableHead className="text-white font-bold">Prisoner</TableHead>
                <TableHead className="text-white font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.officer_name}</TableCell>
                  <TableCell>{record.rank}</TableCell>
                  <TableCell>{record.force_number}</TableCell>
                  <TableCell>{record.role}</TableCell>
                  <TableCell>{record.prisoner_name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(record); setIsFormOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(record); setIsDeleteOpen(true); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{selectedRecord ? 'Edit' : 'Add'} Officer</DialogTitle>
          </DialogHeader>
          <DischargeOfficersForm
            initialData={selectedRecord}
            onSubmit={(data) => {
              if (selectedRecord) {
                setRecords(records.map((r) => (r.id === selectedRecord.id ? { ...r, ...data } : r)));
                toast.success('Updated');
              } else {
                setRecords([...records, { id: Date.now().toString(), ...data }]);
                toast.success('Created');
              }
              setIsFormOpen(false);
              setSelectedRecord(null);
            }}
            onCancel={() => { setIsFormOpen(false); setSelectedRecord(null); }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this officer assignment? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              if (selectedRecord) {
                setRecords(records.filter((r) => r.id !== selectedRecord.id));
                toast.success('Officer assignment deleted successfully');
              }
              setIsDeleteOpen(false);
              setSelectedRecord(null);
            }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};