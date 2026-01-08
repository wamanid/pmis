import React, {useEffect, useState} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Search, Plus, Edit, Trash2, Eye, Baby, Users } from 'lucide-react';
import { toast } from 'sonner';
import { DischargeChildHandoverForm } from './DischargeChildHandoverForm';
import { Badge } from '../../ui/badge';
import {Loader} from "../ViewDischargeDetails";
import {
  getRelationships,
  PrisonerItem,
  RelationShipItem
} from "../../../services/stationServices/visitorsServices/VisitorsService";
import {
  addAllowance,
  addHandover,
  ChildHandover,
  ChildItem, deleteHandover,
  getAllowances,
  getChildHandover,
  getChildren, Handover, updateAllowance, updateHandover
} from "../../../services/discharge/discharge";
import {handleCatchError, handleResponseError, handleServerError2} from "../../../services/stationServices/utils";

interface ChildProps {
  loading: Loader
  setLoading: React.Dispatch<React.SetStateAction<Loader>>
  relationships: RelationShipItem
  setRelationships: React.Dispatch<React.SetStateAction<RelationShipItem[]>>
  originalChildren: ChildItem
  setOriginalChildren: React.Dispatch<React.SetStateAction<ChildItem[]>>
  handovers: ChildHandover
  setHandovers: React.Dispatch<React.SetStateAction<ChildHandover[]>>
}

// interface DischargeChildHandover {
//   id: string;
//   child_name: string;
//   mother_name: string;
//   relationship_name: string;
//   custodian: string;
//   contact_of_custodian: string;
//   datetime_of_handover: string;
//   reason_for_handover: string;
//   physical_condition: string;
//   probation_report: string;
//   age_at_handover: number;
//   remarks: string;
//   child: string;
//   custodian_relation_to_prisoner: string;
// }
//
// interface ChildRecord {
//   id: string;
//   prisoner_name: string;
//   prisoner_number: string;
//   prisoner_number_value: string;
//   sex_name: string;
//   age_value: number;
//   hospital_name: string;
//   district_name: string;
//   name: string;
//   date_of_birth: string;
//   fathers_name: string;
//   mothers_name: string;
//   photo: string;
//   physical_condition: string;
//   child_record: string;
//   medical_condition: string;
//   medical_report: string;
//   probation_report: string;
//   description: string;
//   age_on_admission: number;
//   prisoner: string;
//   relation: string;
//   hospital_of_birth: string;
//   district_of_birth: string;
//   sex: string;
// }

type TabType = 'due-for-handover' | 'handover-records';

export const DischargeChildHandoverList: React.FC<ChildProps> = ({ loading, setLoading, originalChildren, setOriginalChildren, handovers, setHandovers, relationships, setRelationships }) => {
  const [activeTab, setActiveTab] = useState<TabType>('due-for-handover');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [selectedChild, setSelectedChild] = useState<ChildItem | null>(null);
  const [isChildViewOpen, setIsChildViewOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // API Integration
  const [children, setChildren] = useState<ChildItem[]>([])
  // const [originalChildren, setOriginalChildren] = useState<ChildItem[]>([])
  // const [handovers, setHandovers] = useState<ChildHandover[]>([])
  // const [relationships, setRelationships] = useState<RelationShipItem[]>([])
  const [selectedId, setSelectedId] = useState("")
  const [child, setChild] = useState("")
  const [childSelected, setChildSelected] = useState(false)

  useEffect(() => {
    if (loading.child || !relationships.length) {
      setLoading(prev => ({
        ...prev,
        child: true
      }))
      fetchData()
    }
  }, [loading.child, relationships]);

  function populateList(response: any, msg: string, setData: any){
    if (handleServerError2(response)) return

    if ("results" in response) {
      const data = response.results
      if (!data.length && msg) {
        toast.error(msg)
      }
      setData(data)
      // console.log(data)
    }

  }

  function populateList2(response: any, msg: string){
    if (handleServerError2(response)) return []

    if ("results" in response) {
      const data = response.results
      if (!data.length && msg) {
        toast.error(msg)
      }
      return data
      // console.log(data)
    }

    return []
  }

  function updateList (ch: any, hos: any) {
    // console.log(hos)
    const idsInHandovers = new Set(hos.map(ho => ho.child))
    // console.log(idsInHandovers)
    const filtered = ch.filter(c => !idsInHandovers.has(c.id))
    setChildren(filtered)
    setOriginalChildren(ch)
  }

  async function fetchData() {
    try {
      const response1 = await getChildHandover()
      const hos = populateList2(response1, "There are no child handovers")
      setHandovers(hos)

      const response2 = await getChildren(2)
      updateList(populateList2(response2, "There are no child 2 years and above"), hos)

      const response3 = await getRelationships()
      populateList(response3, "", setRelationships)

    }catch (error) {
      handleCatchError(error)
    }finally {
      setLoading(prev => ({
        ...prev,
        child: false
      }))
    }
  }

  const filteredChildren = children.filter(
    (child) =>
      child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.prisoner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.prisoner_number_value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHandovers = handovers.filter(
    (record) =>
      record.child_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.mother_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages =
    activeTab === 'due-for-handover'
      ? Math.ceil(filteredChildren.length / recordsPerPage)
      : Math.ceil(filteredHandovers.length / recordsPerPage);

  const startIndex = (currentPage - 1) * recordsPerPage;

  const currentChildren = filteredChildren.slice(
    startIndex,
    startIndex + recordsPerPage
  );
  const currentHandovers = filteredHandovers.slice(
    startIndex,
    startIndex + recordsPerPage
  );

  const handleViewChild = (child: ChildItem) => {
    setSelectedChild(child);
    setIsChildViewOpen(true);
  };

  const handleHandoverChild = (child: ChildItem) => {
    // Pre-populate the handover form with child data
    setSelectedRecord({
      is_active: true,
      deleted_datetime: null,
      custodian: "",
      contact_of_custodian: "",
      datetime_of_handover: new Date().toISOString(),
      reason_for_handover: "",
      physical_condition: child.physical_condition,
      probation_report: "",
      age_at_handover: 0,
      remarks: "",
      deleted_by: null,
      child: child.id,
      custodian_relation_to_prisoner: "",
    });
    setChildSelected(true)
    setIsFormOpen(true);
  };

  const handleView = (record: ChildHandover) => {
    setSelectedRecord(record);
    setIsViewOpen(true);
  };

  const handleEdit = (record: ChildHandover) => {
    setSelectedRecord(record);
    setChildSelected(false)
    setIsFormOpen(true);
  };

  const handleDelete = (record: ChildHandover) => {
    // setSelectedRecord(record);
    setSelectedId(record.id)
    setChild(record.child)
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
     if (!selectedId && !child) return

    try {
      await deleteHandover(selectedId)
      setHandovers(handovers.filter((r) => r.id !== selectedId));
      toast.success('Child handover record deleted successfully');

      const obj = originalChildren.find(ch => ch.id === child)
      if (obj) {
        setChildren(prev => ([obj, ...prev]))
      }

      setIsDeleteOpen(false);
      setSelectedId("");

    }catch (error) {
      handleCatchError(error)
    }
  };

  const handleFormSubmit = async (data: Handover) => {
    // console.log(data)
    try {

      let response: any
      if (selectedRecord && !childSelected){
        response = await updateHandover(data, selectedRecord.id);
      }
      else {
        response = await addHandover(data);
      }
      if (handleResponseError(response)) return;

      if (!('id' in response)) {
        toast.error("Failed to update the handover table");
        return;
      }

      if (selectedRecord && !childSelected){
        setHandovers(prev => (
          prev.map(rec => (rec.id === response.id ? response : rec))
        ));
        toast.success('Child handover record updated successfully');
      }
      else {
        setHandovers(prev => [response, ...prev]);
        toast.success('Child handover record created successfully');
        setChildren(children.filter((r) => r.id !== data.child));
      }

      setChildSelected(false)
      setIsFormOpen(false);
      setSelectedRecord(null);
    }catch (error) {
      handleCatchError(error)
    }
    // if (selectedRecord?.id) {
    //   setHandovers(
    //     handovers.map((r) => (r.id === selectedRecord.id ? { ...r, ...data } : r))
    //   );
    //   toast.success('Child handover record updated successfully');
    // } else {
    //   setHandovers([...handovers, { id: Date.now().toString(), ...data }]);
    //   toast.success('Child handover record created successfully');
    // }
    // setIsFormOpen(false);
    // setSelectedRecord(null);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const ageInMonths =
      (today.getFullYear() - birthDate.getFullYear()) * 12 +
      today.getMonth() -
      birthDate.getMonth();
    return ageInMonths;
  };

  return (
    <div className="space-y-6">
      {
        loading.child ? (
            <div className="size-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">
                      Fetching children handover Information, Please wait...
                    </p>
              </div>
            </div>
        ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1>Child Handovers</h1>
                  <p className="text-muted-foreground">
                    Manage children due for handover and handover records
                  </p>
                </div>
                {activeTab === 'handover-records' && (
                  <Button onClick={() => {
                    setSelectedRecord(null)
                    setChildSelected(false)
                    setIsFormOpen(true)
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Handover
                  </Button>
                )}
              </div>

              {/* Search */}
              <Card>
                <CardContent className="pt-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={
                        activeTab === 'due-for-handover'
                          ? 'Search by child name or mother name...'
                          : 'Search by child or mother name...'
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Card>
                <CardContent className="p-0">
                  {/* Custom Tabs Navigation */}
                  <div className="flex gap-2 p-4 bg-gray-100 border-b">
                    <button
                      onClick={() => {
                        setActiveTab('due-for-handover');
                        setCurrentPage(1);
                        setSearchQuery('');
                      }}
                      className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                        activeTab === 'due-for-handover'
                          ? 'text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                      style={{
                        backgroundColor:
                          activeTab === 'due-for-handover' ? '#650000' : undefined,
                      }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Baby className="h-4 w-4" />
                        Children Due for Handover
                        <Badge
                          variant="outline"
                          className={
                            activeTab === 'due-for-handover'
                              ? 'bg-white text-gray-900'
                              : 'bg-gray-100'
                          }
                        >
                          {filteredChildren.length}
                        </Badge>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('handover-records');
                        setCurrentPage(1);
                        setSearchQuery('');
                      }}
                      className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                        activeTab === 'handover-records'
                          ? 'text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                      style={{
                        backgroundColor:
                          activeTab === 'handover-records' ? '#650000' : undefined,
                      }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Users className="h-4 w-4" />
                        Child Handovers
                        <Badge
                          variant="outline"
                          className={
                            activeTab === 'handover-records'
                              ? 'bg-white text-gray-900'
                              : 'bg-gray-100'
                          }
                        >
                          {filteredHandovers.length}
                        </Badge>
                      </div>
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="p-0">
                    {activeTab === 'due-for-handover' ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-primary hover:bg-primary">
                              <TableHead className="text-white font-bold">Child Name</TableHead>
                              <TableHead className="text-white font-bold">Mother Name</TableHead>
                              <TableHead className="text-white font-bold">
                                Prisoner Number
                              </TableHead>
                              <TableHead className="text-white font-bold">Date of Birth</TableHead>
                              <TableHead className="text-white font-bold">Age (Months)</TableHead>
                              <TableHead className="text-white font-bold">
                                Physical Condition
                              </TableHead>
                              <TableHead className="text-white font-bold text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentChildren.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={7}
                                  className="text-center py-8 text-muted-foreground"
                                >
                                  No children due for handover found
                                </TableCell>
                              </TableRow>
                            ) : (
                              currentChildren.map((child) => (
                                <TableRow key={child.id}>
                                  <TableCell className="font-medium">{child.name}</TableCell>
                                  <TableCell>{child.mothers_name}</TableCell>
                                  <TableCell>{child.prisoner_number_value}</TableCell>
                                  <TableCell>{formatDate(child.date_of_birth)}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {calculateAge(child.date_of_birth)} months
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="max-w-xs truncate" title={child.physical_condition}>
                                      {child.physical_condition}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewChild(child)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleHandoverChild(child)}
                                        style={{ backgroundColor: '#34D399' }}
                                        className="hover:opacity-90"
                                      >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Handover
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-primary hover:bg-primary">
                              <TableHead className="text-white font-bold">Child Name</TableHead>
                              <TableHead className="text-white font-bold">Mother Name</TableHead>
                              <TableHead className="text-white font-bold">Custodian</TableHead>
                              <TableHead className="text-white font-bold">Contact</TableHead>
                              <TableHead className="text-white font-bold">Age</TableHead>
                              <TableHead className="text-white font-bold">Handover Date</TableHead>
                              <TableHead className="text-white font-bold text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentHandovers.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={7}
                                  className="text-center py-8 text-muted-foreground"
                                >
                                  No child handover records found
                                </TableCell>
                              </TableRow>
                            ) : (
                              currentHandovers.map((record) => (
                                <TableRow key={record.id}>
                                  <TableCell>{record.child_name}</TableCell>
                                  <TableCell>{record.mother_name}</TableCell>
                                  <TableCell>{record.custodian}</TableCell>
                                  <TableCell>{record.contact_of_custodian}</TableCell>
                                  <TableCell>{record.age_at_handover} months</TableCell>
                                  <TableCell>
                                    {formatDateTime(record.datetime_of_handover)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleView(record)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(record)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(record)}
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
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to{' '}
                    {Math.min(
                      startIndex + recordsPerPage,
                      activeTab === 'due-for-handover'
                        ? filteredChildren.length
                        : filteredHandovers.length
                    )}{' '}
                    of{' '}
                    {activeTab === 'due-for-handover'
                      ? filteredChildren.length
                      : filteredHandovers.length}{' '}
                    records
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
            </>
        )
      }

      {/* Child View Dialog */}
      <Dialog open={isChildViewOpen} onOpenChange={setIsChildViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
              <Baby className="h-5 w-5" />
              Child Details
            </DialogTitle>
          </DialogHeader>
          {selectedChild && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <div
                  className="px-6 py-3"
                  style={{ backgroundColor: '#faebd7', color: '#650000' }}
                >
                  <h2>Basic Information</h2>
                </div>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">Child Name</Label>
                      <p className="font-medium mt-1">{selectedChild.name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Date of Birth</Label>
                      <p className="font-medium mt-1">
                        {formatDate(selectedChild.date_of_birth)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Age</Label>
                      <p className="font-medium mt-1">
                        {calculateAge(selectedChild.date_of_birth)} months
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Sex</Label>
                      <p className="font-medium mt-1">{selectedChild.sex_name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Mother's Name</Label>
                      <p className="font-medium mt-1">{selectedChild.mothers_name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Father's Name</Label>
                      <p className="font-medium mt-1">{selectedChild.fathers_name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Prisoner Number</Label>
                      <p className="font-medium mt-1">
                        {selectedChild.prisoner_number_value}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Child Record</Label>
                      <p className="font-medium mt-1">{selectedChild.child_record}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Birth Details */}
              <Card>
                <div
                  className="px-6 py-3"
                  style={{ backgroundColor: '#faebd7', color: '#650000' }}
                >
                  <h2>Birth Details</h2>
                </div>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">Hospital of Birth</Label>
                      <p className="font-medium mt-1">{selectedChild.hospital_name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">District of Birth</Label>
                      <p className="font-medium mt-1">{selectedChild.district_name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Age on Admission</Label>
                      <p className="font-medium mt-1">
                        {selectedChild.age_on_admission} months
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medical & Physical Condition */}
              <Card>
                <div
                  className="px-6 py-3"
                  style={{ backgroundColor: '#faebd7', color: '#650000' }}
                >
                  <h2>Medical & Physical Condition</h2>
                </div>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label className="text-gray-500">Physical Condition</Label>
                    <p className="font-medium mt-1">{selectedChild.physical_condition}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Medical Condition</Label>
                    <p className="font-medium mt-1">{selectedChild.medical_condition}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Medical Report</Label>
                    <p className="font-medium mt-1">{selectedChild.medical_report}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Reports */}
              <Card>
                <div
                  className="px-6 py-3"
                  style={{ backgroundColor: '#faebd7', color: '#650000' }}
                >
                  <h2>Reports</h2>
                </div>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label className="text-gray-500">Probation Report</Label>
                    <p className="font-medium mt-1">{selectedChild.probation_report}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Description</Label>
                    <p className="font-medium mt-1">{selectedChild.description}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChildViewOpen(false)}>
              Close
            </Button>
            {selectedChild && (
              <Button
                onClick={() => {
                  setIsChildViewOpen(false);
                  handleHandoverChild(selectedChild);
                }}
                style={{ backgroundColor: '#34D399' }}
                className="hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Handover
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Handover Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{
              selectedRecord?.child && !childSelected ? 'Edit'
              : 'Add'
            } Child Handover</DialogTitle>
          </DialogHeader>
          <DischargeChildHandoverForm
            childSelected={childSelected}
            children={originalChildren}
            relationships={relationships}
            initialData={selectedRecord}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedRecord(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Handover View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Child Handover Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Child Name</Label>
                  <p className="text-sm mt-1">{selectedRecord.child_name}</p>
                </div>
                <div>
                  <Label>Mother Name</Label>
                  <p className="text-sm mt-1">{selectedRecord.mother_name}</p>
                </div>
                <div>
                  <Label>Custodian</Label>
                  <p className="text-sm mt-1">{selectedRecord.custodian}</p>
                </div>
                <div>
                  <Label>Contact</Label>
                  <p className="text-sm mt-1">{selectedRecord.contact_of_custodian}</p>
                </div>
                <div>
                  <Label>Age</Label>
                  <p className="text-sm mt-1">{selectedRecord.age_at_handover} months</p>
                </div>
                <div>
                  <Label>Handover Date</Label>
                  <p className="text-sm mt-1">
                    {formatDateTime(selectedRecord.datetime_of_handover)}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label>Physical Condition</Label>
                  <p className="text-sm mt-1">{selectedRecord.physical_condition}</p>
                </div>
                <div className="col-span-2">
                  <Label>Remarks</Label>
                  <p className="text-sm mt-1">{selectedRecord.remarks}</p>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this child handover record?</p>
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
