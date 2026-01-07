import React, {useEffect, useState} from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { SubsistenceAllowancesForm } from './SubsistenceAllowancesForm';
import {Loader} from "../ViewDischargeDetails";
import {
  addAllowance,
  Allowance, deleteAllowance,
  DischargeType,
  getAllowances,
  SubsistenceAllowance, updateAllowance
} from "../../../services/discharge/discharge";
import {Unit} from "../../../services/stationServices/visitorsServices/visitorItem";
import {PrisonerItem} from "../../../services/stationServices/visitorsServices/VisitorsService";
import {handleCatchError, handleResponseError, handleServerError2} from "../../../services/stationServices/utils";

interface ChildProps {
  loading: Loader
  setLoading: React.Dispatch<React.SetStateAction<Loader>>
  prisoners: PrisonerItem
  setPrisoners: React.Dispatch<React.SetStateAction<PrisonerItem[]>>
  allowances: Allowance
  setAllowances: React.Dispatch<React.SetStateAction<Allowance[]>>
}

export const SubsistenceAllowancesList: React.FC<ChildProps> = ({ loading, setLoading, prisoners, setPrisoners, setAllowances, allowances }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // const [records, setAllowances] = useState<Allowance[]>([]);

  // API Integration
  useEffect(() => {
    if (loading.subsistence || !allowances.length) {
      setLoading(prev => ({
        ...prev,
        subsistence: true
      }))
      fetchData()
    }
  }, [loading.subsistence]);

  async function fetchData() {
    try {
      const response = await getAllowances()
      if (handleServerError2(response)) return
      if ("results" in response) {
        const data = response.results
        if (!data.length) {
          toast.error("There are no subsistence allowances")
        }
        setAllowances(data)
        // console.log(data)
      }

    }catch (error) {
      handleCatchError(error)
    }finally {
      setLoading(prev => ({
        ...prev,
        subsistence: false
      }))
    }
  }

  async function handleFormSubmit(data: SubsistenceAllowance) {
    try {
      let response: any
      if (selectedRecord){
        response = await updateAllowance(data, selectedRecord.id);
      }
      else {
        response = await addAllowance(data);
      }
      if (handleResponseError(response)) return;

      if (!('id' in response)) {
        toast.error("Failed to update the allowances table");
        return;
      }

      if (selectedRecord){
        setAllowances(prev => (
            prev.map(rec => (rec.id === response.id ? response : rec))
        ));
        toast.success('updated');
      }
      else {
        setAllowances(prev => [response, ...prev]);
        toast.success('Created');
      }

      setIsFormOpen(false);
      setSelectedRecord(null);
    } catch (error) {
      handleCatchError(error);
    }
  }

  async function handleDelete() {
    if (!selectedRecord) return

    try {
      await deleteAllowance(selectedRecord.id)
      setAllowances(prev => prev.filter(rec => rec.id !== selectedRecord.id))
      toast.success('Subsistence allowance record deleted successfully');

      setIsDeleteOpen(false);
      setSelectedRecord(null);

    }catch (error) {
      handleCatchError(error)
    }
  }


  //  if (selectedRecord) {
    //   setAllowances(records.map((r) => (r.id === selectedRecord.id ? { ...r, ...data } : r)));
    //   toast.success('Updated');
    // } else {
    //   setAllowances([...records, { id: Date.now().toString(), ...data }]);
    //   toast.success('Created');
    // }
    // setIsFormOpen(false);
    // setSelectedRecord(null);

  const filteredRecords = allowances.filter((r) =>
    r.prisoner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.prisoner_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {
        loading.subsistence ? (
            <div className="size-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">
                      Fetching subsistence allowances Information, Please wait...
                    </p>
              </div>
            </div>
        ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h1>Subsistence Allowances</h1>
                  <p className="text-muted-foreground">Manage subsistence allowance disposal records</p>
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
                        <TableHead className="text-white font-bold">Amount (UGX)</TableHead>
                        <TableHead className="text-white font-bold">Creditor Details</TableHead>
                        <TableHead className="text-white font-bold">Disposal Date</TableHead>
                        <TableHead className="text-white font-bold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {
                        !filteredRecords.length ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No subsistence allowances found
                              </TableCell>
                            </TableRow>
                        ) : (
                            filteredRecords.map((record) => (
                              <TableRow key={record.id}>
                                <TableCell>{record.prisoner_name}</TableCell>
                                <TableCell>{record.prisoner_number}</TableCell>
                                <TableCell>{parseFloat(record.allowance_amount).toLocaleString()}</TableCell>
                                <TableCell>{record.creditor_details}</TableCell>
                                <TableCell>{new Date(record.disposal_date).toLocaleDateString()}</TableCell>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{selectedRecord ? 'Edit' : 'Add'} Allowance Record</DialogTitle>
          </DialogHeader>
          <SubsistenceAllowancesForm
            prisoners={prisoners} setPrisoners={setPrisoners}
            initialData={selectedRecord}
            onSubmit={handleFormSubmit}
            onCancel={() => { setIsFormOpen(false); setSelectedRecord(null); }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} aria-describedby={undefined}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this subsistence allowance record? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};