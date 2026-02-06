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
import { Search, Plus, Eye, Edit, ChevronLeft, ChevronRight, MoreVertical, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import DeathConfirmationForm from './DeathConfirmationForm';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../../ui/dialog';

interface DeathConfirmation {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  officer_in_charge_name: string;
  medical_officer_name: string;
  pathologist_attachment: string;
  other_attachment: string;
  medical_form: string;
  death_certificate: string;
  presumed_cause_of_death: string;
  actual_cause_of_death: string;
  cause_of_death: string;
  place_of_death: string;
  date_of_death: string;
  notes: string;
  prisoner: string;
  officer_in_charge: string;
  medial_officer: string; // Note: API has typo "medial"
}

interface DeathConfirmationListProps {
  selectedPrisonerId?: string;
}

// Mock data
const mockDeathConfirmations: DeathConfirmation[] = [
  {
    id: '1',
    prisoner: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    prisoner_name: 'John Doe',
    prisoner_number: 'PR-2024-001',
    officer_in_charge: '3fa85f64-5717-4562-b3fc-2c963f66afb1',
    officer_in_charge_name: 'SSP David Okello',
    medial_officer: '3fa85f64-5717-4562-b3fc-2c963f66afc1',
    medical_officer_name: 'Dr. David Makumbi',
    date_of_death: '2024-11-10',
    place_of_death: 'Prison Hospital Ward A',
    cause_of_death: 'Acute myocardial infarction (Heart Attack)',
    presumed_cause_of_death: 'Chest pain and respiratory distress - suspected cardiac event',
    actual_cause_of_death: 'Confirmed myocardial infarction with complete coronary artery blockage. Post-mortem examination revealed 90% occlusion of left anterior descending artery.',
    death_certificate: 'uploads/death_certificate/DC-2024-001.pdf',
    medical_form: 'uploads/medical_form/MF-2024-001.pdf',
    pathologist_attachment: 'uploads/pathologist/PATH-2024-001.pdf',
    other_attachment: '',
    notes: 'Patient had history of hypertension and diabetes. Was complaining of chest pain earlier in the day. Emergency response initiated but patient could not be revived. Family notified. Post-mortem conducted.',
  },
  {
    id: '2',
    prisoner: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
    prisoner_name: 'Jane Smith',
    prisoner_number: 'PR-2024-002',
    officer_in_charge: '3fa85f64-5717-4562-b3fc-2c963f66afb2',
    officer_in_charge_name: 'SP Sarah Namuganza',
    medial_officer: '3fa85f64-5717-4562-b3fc-2c963f66afc5',
    medical_officer_name: 'Dr. Richard Ssemakula',
    date_of_death: '2024-10-25',
    place_of_death: 'Isolation Ward - TB Unit',
    cause_of_death: 'Tuberculosis with severe respiratory failure',
    presumed_cause_of_death: 'Advanced tuberculosis with respiratory complications',
    actual_cause_of_death: 'Multi-drug resistant tuberculosis leading to acute respiratory distress syndrome (ARDS) and organ failure.',
    death_certificate: 'uploads/death_certificate/DC-2024-002.pdf',
    medical_form: 'uploads/medical_form/MF-2024-002.pdf',
    pathologist_attachment: 'uploads/pathologist/PATH-2024-002.pdf',
    other_attachment: 'uploads/other/LAB-2024-002.pdf',
    notes: 'Patient diagnosed with MDR-TB 8 months ago. Despite treatment, condition deteriorated rapidly in final week. Infection control protocols followed. Next of kin notified.',
  },
  {
    id: '3',
    prisoner: '3fa85f64-5717-4562-b3fc-2c963f66afa8',
    prisoner_name: 'Michael Johnson',
    prisoner_number: 'PR-2024-003',
    officer_in_charge: '3fa85f64-5717-4562-b3fc-2c963f66afb3',
    officer_in_charge_name: 'ASP James Mutumba',
    medial_officer: '3fa85f64-5717-4562-b3fc-2c963f66afc3',
    medical_officer_name: 'Dr. James Okello',
    date_of_death: '2024-11-05',
    place_of_death: 'Post-Operative Recovery Ward',
    cause_of_death: 'Post-surgical complications - Septic shock',
    presumed_cause_of_death: 'Post-operative infection suspected',
    actual_cause_of_death: 'Severe sepsis and septic shock following emergency appendectomy. Autopsy revealed peritonitis and systemic infection.',
    death_certificate: 'uploads/death_certificate/DC-2024-003.pdf',
    medical_form: 'uploads/medical_form/MF-2024-003.pdf',
    pathologist_attachment: 'uploads/pathologist/PATH-2024-003.pdf',
    other_attachment: '',
    notes: 'Emergency appendectomy performed 3 days prior to death. Patient developed fever and signs of sepsis on day 2 post-op. Antibiotics administered but condition rapidly deteriorated. Police investigation ongoing due to delayed medical intervention concerns.',
  },
  {
    id: '4',
    prisoner: '3fa85f64-5717-4562-b3fc-2c963f66afa9',
    prisoner_name: 'Emily Davis',
    prisoner_number: 'PR-2024-004',
    officer_in_charge: '3fa85f64-5717-4562-b3fc-2c963f66afb4',
    officer_in_charge_name: 'IP Grace Nalwanga',
    medial_officer: '3fa85f64-5717-4562-b3fc-2c963f66afc4',
    medical_officer_name: 'Dr. Patricia Mutesi',
    date_of_death: '2024-09-18',
    place_of_death: 'Cell Block C - Individual Cell',
    cause_of_death: 'Suicide by hanging',
    presumed_cause_of_death: 'Suspected suicide - found hanging in cell',
    actual_cause_of_death: 'Asphyxiation due to hanging. Autopsy confirmed self-inflicted death with ligature marks consistent with suicide.',
    death_certificate: 'uploads/death_certificate/DC-2024-004.pdf',
    medical_form: 'uploads/medical_form/MF-2024-004.pdf',
    pathologist_attachment: 'uploads/pathologist/PATH-2024-004.pdf',
    other_attachment: 'uploads/other/POLICE-2024-004.pdf',
    notes: 'Prisoner had history of depression and was on psychiatric medication. Found unresponsive during routine cell check. CPR attempted but unsuccessful. Full police investigation conducted. Coroner inquest completed. Suicide prevention measures reviewed.',
  },
  {
    id: '5',
    prisoner: '3fa85f64-5717-4562-b3fc-2c963f66afaa',
    prisoner_name: 'Robert Lee',
    prisoner_number: 'PR-2024-005',
    officer_in_charge: '3fa85f64-5717-4562-b3fc-2c963f66afb5',
    officer_in_charge_name: 'SSP Robert Ssemakula',
    medial_officer: '3fa85f64-5717-4562-b3fc-2c963f66afc2',
    medical_officer_name: 'Dr. Sarah Kisakye',
    date_of_death: '2024-12-02',
    place_of_death: 'General Medical Ward',
    cause_of_death: 'HIV/AIDS related complications - Pneumocystis pneumonia',
    presumed_cause_of_death: 'Advanced HIV/AIDS with opportunistic infections',
    actual_cause_of_death: 'Acquired Immunodeficiency Syndrome (AIDS) with Pneumocystis jirovecii pneumonia and cryptococcal meningitis. Complete immune system failure.',
    death_certificate: 'uploads/death_certificate/DC-2024-005.pdf',
    medical_form: 'uploads/medical_form/MF-2024-005.pdf',
    pathologist_attachment: 'uploads/pathologist/PATH-2024-005.pdf',
    other_attachment: '',
    notes: 'Patient diagnosed with AIDS stage 4. On antiretroviral therapy but poor adherence. Developed multiple opportunistic infections in final months. Palliative care provided. Family present at time of death.',
  },
  {
    id: '6',
    prisoner: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
    prisoner_name: 'Jane Smith',
    prisoner_number: 'PR-2024-002',
    officer_in_charge: '3fa85f64-5717-4562-b3fc-2c963f66afb1',
    officer_in_charge_name: 'SSP David Okello',
    medial_officer: '3fa85f64-5717-4562-b3fc-2c963f66afc1',
    medical_officer_name: 'Dr. David Makumbi',
    date_of_death: '2024-08-14',
    place_of_death: 'Prison Courtyard',
    cause_of_death: 'Cerebrovascular accident (Stroke)',
    presumed_cause_of_death: 'Sudden collapse - suspected stroke or cardiac event',
    actual_cause_of_death: 'Massive hemorrhagic stroke. Autopsy revealed ruptured cerebral aneurysm with extensive intracranial bleeding.',
    death_certificate: 'uploads/death_certificate/DC-2024-006.pdf',
    medical_form: 'uploads/medical_form/MF-2024-006.pdf',
    pathologist_attachment: 'uploads/pathologist/PATH-2024-006.pdf',
    other_attachment: '',
    notes: 'Prisoner collapsed suddenly during exercise period. Emergency medical team responded immediately. Transferred to hospital but pronounced dead on arrival. No prior symptoms or warnings. Natural death confirmed.',
  },
];

const DeathConfirmationList: React.FC<DeathConfirmationListProps> = ({ selectedPrisonerId }) => {
  const [records, setRecords] = useState<DeathConfirmation[]>(mockDeathConfirmations);
  const [filteredRecords, setFilteredRecords] = useState<DeathConfirmation[]>(mockDeathConfirmations);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DeathConfirmation | null>(null);
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
          record.prisoner_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.cause_of_death.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.place_of_death.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleView = (record: DeathConfirmation) => {
    setSelectedRecord(record);
    setFormMode('view');
    setDialogOpen(true);
  };

  const handleEdit = (record: DeathConfirmation) => {
    setSelectedRecord(record);
    setFormMode('edit');
    setDialogOpen(true);
  };

  const handleFormSubmit = (data: DeathConfirmation) => {
    if (formMode === 'create') {
      const newRecord: DeathConfirmation = {
        ...data,
        id: `${records.length + 1}`,
      };
      setRecords([...records, newRecord]);
      toast.success('Death confirmation created successfully');
    } else if (formMode === 'edit') {
      setRecords(records.map((r) => (r.id === selectedRecord?.id ? { ...data, id: r.id } : r)));
      toast.success('Death confirmation updated successfully');
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
      toast.success('Death confirmation deleted successfully');
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
                  placeholder="Search by prisoner, cause, or place of death..."
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
                Add Confirmation
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Prisoner</TableHead>
                  <TableHead>Number</TableHead>
                  <TableHead>Date of Death</TableHead>
                  <TableHead>Place of Death</TableHead>
                  <TableHead>Cause of Death</TableHead>
                  <TableHead>Medical Officer</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No death confirmation records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{record.prisoner_name}</TableCell>
                      <TableCell>{record.prisoner_number}</TableCell>
                      <TableCell>{record.date_of_death}</TableCell>
                      <TableCell>{record.place_of_death}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="line-clamp-2" title={record.cause_of_death}>
                          {record.cause_of_death}
                        </div>
                      </TableCell>
                      <TableCell>{record.medical_officer_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {record.death_certificate && (
                            <a
                              href={record.death_certificate}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Death Certificate"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <FileText className="h-4 w-4" />
                            </a>
                          )}
                          {record.medical_form && (
                            <a
                              href={record.medical_form}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Medical Form"
                              className="text-green-600 hover:text-green-800"
                            >
                              <FileText className="h-4 w-4" />
                            </a>
                          )}
                          {record.pathologist_attachment && (
                            <a
                              href={record.pathologist_attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Pathologist Report"
                              className="text-purple-600 hover:text-purple-800"
                            >
                              <FileText className="h-4 w-4" />
                            </a>
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

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogTitle>Death Confirmation Form</DialogTitle>
          <DialogDescription>
            Record and confirm prisoner death with complete documentation and medical details.
          </DialogDescription>
          <DeathConfirmationForm
            confirmation={selectedRecord}
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
              This action cannot be undone. This will permanently delete the death confirmation record.
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

export default DeathConfirmationList;
