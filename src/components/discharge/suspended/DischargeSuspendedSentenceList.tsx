import React, {useEffect, useState} from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DischargeSuspendedSentenceForm } from './DischargeSuspendedSentenceForm';
import {Loader} from "../ViewDischargeDetails";
import {PrisonerItem} from "../../../services/stationServices/visitorsServices/VisitorsService";
import {
  addAllowance, addSentence, Court, deleteAllowance, deleteSentence, DischargeRequest, DischargeType,
  getAllowances,
  getSuspendedSentences,
  Sentence,
  SuspendedSentence,
  updateAllowance, updateSentences
} from "../../../services/discharge/discharge";
import {handleCatchError, handleResponseError, handleServerError2} from "../../../services/stationServices/utils";
import {Unit} from "../../../services/stationServices/visitorsServices/visitorItem";

interface ChildProps {
  loading: Loader
  setLoading: React.Dispatch<React.SetStateAction<Loader>>
  prisoners: PrisonerItem
  setPrisoners: React.Dispatch<React.SetStateAction<PrisonerItem[]>>
  types: DischargeType
  setTypes: React.Dispatch<React.SetStateAction<DischargeType[]>>
  reasons: Unit
  setReasons: React.Dispatch<React.SetStateAction<Unit[]>>
  setDischargeRequests: React.Dispatch<React.SetStateAction<DischargeRequest[]>>
  dischargeRequests: DischargeRequest
}

export const DischargeSuspendedSentenceList: React.FC<ChildProps> = ({ loading, setLoading, prisoners, setPrisoners,
                                                                       types, reasons, setTypes, setReasons, dischargeRequests,
                                                                       setDischargeRequests }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const [records, setRecords] = useState<SuspendedSentence[]>([]);

  // API Integration
  const [courts, setCourts] = useState<Court[]>([])

  useEffect(() => {
    if(loading.suspended || !records.length) {
      fetchData()
    }
  }, [loading.suspended]);

  async function fetchData() {
    try {
      const response = await getSuspendedSentences()
      if (handleServerError2(response)) return
      if ("results" in response) {
        const data = response.results
        if (!data.length) {
          toast.error("There are no suspended sentences")
        }
        setRecords(data)
        // console.log(data)
      }

    }catch (error) {
      handleCatchError(error)
    }finally {
      setLoading(prev => ({
        ...prev,
        suspended: false
      }))
    }
  }

  async function handleDelete() {
    if (!selectedRecord) return

    try {
      await deleteSentence(selectedRecord.id)
      setRecords(prev => prev.filter(rec => rec.id !== selectedRecord.id))
      toast.success('Suspended sentence record deleted successfully');

      setIsDeleteOpen(false);
      setSelectedRecord(null);

    }catch (error) {
      handleCatchError(error)
    }
  }

  async function handleFormSubmit(data: Sentence) {
    // console.log(data)
    try {
      let response: any
      if (selectedRecord){
        response = await updateSentences(data, selectedRecord.id);
      }
      else {
        response = await addSentence(data);
      }
      if (handleResponseError(response)) return;

      if (!('id' in response)) {
        toast.error("Failed to update the suspended sentences table");
        return;
      }

      if (selectedRecord){
        setRecords(prev => (
            prev.map(rec => (rec.id === response.id ? response : rec))
        ));
        toast.success('updated');
      }
      else {
        setRecords(prev => [response, ...prev]);
        toast.success('Created');
      }

      setIsFormOpen(false);
      setSelectedRecord(null);
    }catch (error) {
      handleCatchError(error)
    }
    // if (selectedRecord) {
    //   setRecords(records.map((r) => (r.id === selectedRecord.id ? { ...r, ...data } : r)));
    //   toast.success('Updated');
    // } else {
    //   setRecords([...records, { id: Date.now().toString(), ...data }]);
    //   toast.success('Created');
    // }
    // setIsFormOpen(false);
    // setSelectedRecord(null);
  }

  const filteredRecords = records.filter((r) =>
    r.prisoner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.prisoner_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
       {
        loading.suspended ? (
            <div className="size-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">
                      Fetching suspended sentences Information, Please wait...
                    </p>
              </div>
            </div>
        ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h1>Suspended Sentence Discharges</h1>
                  <p className="text-muted-foreground">Manage suspended sentence discharge records</p>
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
                        <TableHead className="text-white font-bold">Prisoner Name</TableHead>
                        <TableHead className="text-white font-bold">Prisoner Number</TableHead>
                        <TableHead className="text-white font-bold">Court</TableHead>
                        <TableHead className="text-white font-bold">Suspension Duration</TableHead>
                        <TableHead className="text-white font-bold">Discharge Date</TableHead>
                        <TableHead className="text-white font-bold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {
                        !filteredRecords.length ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No suspended sentences found
                              </TableCell>
                            </TableRow>
                        ) : (
                            filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.prisoner_name}</TableCell>
                          <TableCell>{record.prisoner_number}</TableCell>
                          <TableCell>{record.court_name}</TableCell>
                          <TableCell>{record.duration_of_suspension} months</TableCell>
                          <TableCell>{new Date(record.discharge_datetime).toLocaleDateString()}</TableCell>
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
                      ))
                        )
                      }
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
        )
       }

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRecord ? 'Edit' : 'Add'} Suspended Sentence</DialogTitle>
          </DialogHeader>
          <DischargeSuspendedSentenceForm
            types={types} setTypes={setTypes}
            reasons={reasons} setReasons={setReasons} dischargeRequests={dischargeRequests}
            setDischargeRequests={setDischargeRequests}
            prisoners={prisoners} setPrisoners={setPrisoners}
            initialData={selectedRecord}
            courts={courts} setCourts={setCourts}
            onSubmit={handleFormSubmit}
            onCancel={() => { setIsFormOpen(false); setSelectedRecord(null); }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this suspended sentence record? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};