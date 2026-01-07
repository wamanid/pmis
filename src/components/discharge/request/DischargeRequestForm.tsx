import React, {useEffect, useState} from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Card, CardContent } from '../../ui/card';
import { Plus, Trash2, FileText, User } from 'lucide-react';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../ui/utils';
import {
  BatchDischargeRequest,
  DischargeItem,
  DischargeRequest,
  DischargeType,
  getReasons,
  getTypes, SingleDischargeRequest
} from "../../../services/discharge/discharge";
import {Unit} from "../../../services/stationServices/visitorsServices/visitorItem";
import {
  getLabel,
  getPrisonerLabel, getPrisonerLabel2,
  getStaffLabel,
  handleCatchError,
  handleServerError2
} from "../../../services/stationServices/utils";
import {getPrisoners, Prisoner, PrisonerItem} from "../../../services/stationServices/visitorsServices/VisitorsService";
import {getStaffProfile, StaffItem} from "../../../services/stationServices/staffDeploymentService";

interface DischargeRequestFormProps {
  types: DischargeType
  setTypes: React.Dispatch<React.SetStateAction<DischargeType[]>>
  reasons: Unit
  setReasons: React.Dispatch<React.SetStateAction<Unit[]>>
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  mode?: 'create' | 'edit';
  prisoners: PrisonerItem
  setPrisoners: React.Dispatch<React.SetStateAction<PrisonerItem[]>>
}

// export interface DischargeItem {
//   id?: string;
//   prisoner: string;
//   // prisoner_name: string;
//   // prisoner_number: string;
//   discharge_type: string;
//   // discharge_type_name: string;
//   discharge_reason: string;
//   // discharge_reason_name: string;
//   discharge_datetime: string;
//   remarks: string;
//   intended_place_of_stay: string;
// }

// Mock data
// const mockPrisoners = [
//   { id: 'prisoner-001', name: 'John Doe', number: 'P-2024-001' },
//   { id: 'prisoner-002', name: 'Jane Smith', number: 'P-2024-002' },
//   { id: 'prisoner-003', name: 'Michael Johnson', number: 'P-2024-003' },
//   { id: 'prisoner-004', name: 'Sarah Williams', number: 'P-2024-004' },
//   { id: 'prisoner-005', name: 'David Brown', number: 'P-2024-005' },
// ];

// const mockDischargeTypes = [
//   { id: 'type-001', name: 'Sentence Completion' },
//   { id: 'type-002', name: 'Transfer' },
//   { id: 'type-003', name: 'Death' },
//   { id: 'type-004', name: 'Court Order' },
//   { id: 'type-005', name: 'Deportation' },
//   { id: 'type-006', name: 'Execution' },
// ];
//
// const mockDischargeReasons = [
//   { id: 'reason-001', name: 'Sentence Completed' },
//   { id: 'reason-002', name: 'Inter-Prison Transfer' },
//   { id: 'reason-003', name: 'Medical Grounds' },
//   { id: 'reason-004', name: 'Presidential Pardon' },
//   { id: 'reason-005', name: 'Court Order' },
// ];

// const mockStaff = [
//   {
//     id: 'staff-001',
//     name: 'Robinson Okello',
//     force_number: 'UPS/001/2020',
//     rank: 'Assistant Commissioner',
//   },
//   {
//     id: 'staff-002',
//     name: 'Sarah Namuli',
//     force_number: 'UPS/002/2019',
//     rank: 'Senior Superintendent',
//   },
//   {
//     id: 'staff-003',
//     name: 'Michael Kizito',
//     force_number: 'UPS/003/2018',
//     rank: 'Superintendent',
//   },
// ];

export const DischargeRequestForm: React.FC<DischargeRequestFormProps> = ({
  types, reasons, setTypes, setReasons, prisoners, setPrisoners,
  initialData,
  onSubmit,
  onCancel,
  mode = 'create',
}) => {
  const [formData, setFormData] = useState({
    comment: initialData?.comment || '',
    in_charge: initialData?.in_charge || '',
    in_charge_approved: false,
    in_charge_remark: "",
    officer_in_charge_approved: false,
    officer_in_charge_remark: "",
    // in_charge_name: initialData?.in_charge_name || '',
    // in_charge_force_number: initialData?.in_charge_force_number || '',
    // in_charge_rank: initialData?.in_charge_rank || '',
    officer_in_charge: initialData?.officer_in_charge || '',
    // officer_in_charge_name: initialData?.officer_in_charge_name || '',
    // officer_in_charge_force_number: initialData?.officer_in_charge_force_number || '',
    // officer_in_charge_rank: initialData?.officer_in_charge_rank || '',
  });

  const [discharges, setDischarges] = useState<DischargeItem[]>(
    initialData?.discharges || []
  );

  const [inChargeOpen, setInChargeOpen] = useState(false);
  const [officerInChargeOpen, setOfficerInChargeOpen] = useState(false);

  // State for editing discharge in table
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingDischarge, setEditingDischarge] = useState<DischargeItem>({
    prisoner: '',
    // prisoner_name: '',
    // prisoner_number: '',
    discharge_type: '',
    // discharge_type_name: '',
    discharge_reason: '',
    // discharge_reason_name: '',
    discharge_datetime: '',
    remarks: '',
    intended_place_of_stay: '',
  });

  const [prisonerOpen, setPrisonerOpen] = useState(false);
  const [dischargeTypeOpen, setDischargeTypeOpen] = useState(false);
  const [dischargeReasonOpen, setDischargeReasonOpen] = useState(false);

  // API Integration
  const [loader, setLoader] = useState(true)

  const [staff, setStaff] = useState<StaffItem[]>([]);

  useEffect(() => {
    if(loader) {
      fetchData()
    }
  }, [loader]);

  function populateList(response: any, msg: string, setData: any) {
    if (handleServerError2(response)) return true

    if ("results" in response) {
      const data = response.results
      if (!data.length) {
        toast.error(msg)
        return true
      }
      setData(data)
      console.log(data)

    }

    return false
  }

  function returnedValue (value: boolean){
    if (value){
      onCancel()
      return
    }
  }

  async function fetchData() {
    try {
        if (!prisoners.length){
          const response1 = await getPrisoners()
          returnedValue(populateList(response1, "There are no prisoners", setPrisoners))
        }

        const response2 = await getStaffProfile()
        returnedValue(populateList(response2, "There are no staff officers", setStaff))

        if (!types.length) {
          const response3 = await getTypes()
          returnedValue(populateList(response3, "There are no discharge types", setTypes))

        }

        if (!reasons.length) {
          const response4 = await getReasons()
          returnedValue(populateList(response4, "There are no discharge reasons", setReasons))
        }

    }catch (error) {
      handleCatchError(error)
    }finally {
      setLoader(false)
    }
  }

  const inChargeLabel = getStaffLabel(staff, "Select in charge...", formData.in_charge);
  const officerInChargeLabel = getStaffLabel(staff, "Select officer in charge...", formData.officer_in_charge);
  // const prisonerLabel = getPrisonerLabel(prisoners, "Select prisoner...", )

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInChargeSelect = (staffId: string) => {
    const st = staff.find((s) => s.id === staffId);
    if (st) {
      setFormData((prev) => ({
        ...prev,
        in_charge: staffId,
        in_charge_name: `${st.first_name} ${st.last_name}`,
        in_charge_force_number: st.force_number,
        in_charge_rank: st.rank,
      }));
      setInChargeOpen(false);
    }
  };

  const handleOfficerInChargeSelect = (staffId: string) => {
    const st = staff.find((s) => s.id === staffId);
    if (st) {
      setFormData((prev) => ({
        ...prev,
        officer_in_charge: staffId,
        officer_in_charge_name: `${st.first_name} ${st.last_name}`,
        officer_in_charge_force_number: st.force_number,
        officer_in_charge_rank: st.rank,
      }));
      setOfficerInChargeOpen(false);
    }
  };

  const addDischarge = () => {
    setEditingIndex(discharges.length);
    setEditingDischarge({
      prisoner: '',
      // prisoner_name: '',
      // prisoner_number: '',
      discharge_type: '',
      // discharge_type_name: '',
      discharge_reason: '',
      // discharge_reason_name: '',
      discharge_datetime: new Date().toISOString().slice(0, 16) + ':00Z',
      remarks: '',
      intended_place_of_stay: '',
    });
  };

  const saveDischarge = () => {
    if (!editingDischarge.prisoner || !editingDischarge.discharge_type || !editingDischarge.discharge_reason) {
      toast.error('Please fill all required fields');
      return;
    }

    if (editingIndex !== null) {
      if (editingIndex < discharges.length) {
        // Update existing
        const updated = [...discharges];
        updated[editingIndex] = editingDischarge;
        setDischarges(updated);
        toast.success('Discharge updated');
      } else {
        // Add new
        setDischarges([...discharges, editingDischarge]);
        toast.success('Discharge added');
      }
      setEditingIndex(null);
      setEditingDischarge({
        prisoner: '',
        // prisoner_name: '',
        // prisoner_number: '',
        discharge_type: '',
        // discharge_type_name: '',
        discharge_reason: '',
        // discharge_reason_name: '',
        discharge_datetime: '',
        remarks: '',
        intended_place_of_stay: '',
      });
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingDischarge({
      prisoner: '',
      // prisoner_name: '',
      // prisoner_number: '',
      discharge_type: '',
      // discharge_type_name: '',
      discharge_reason: '',
      // discharge_reason_name: '',
      discharge_datetime: '',
      remarks: '',
      intended_place_of_stay: '',
    });
  };

  const editDischarge = (index: number) => {
    setEditingIndex(index);
    setEditingDischarge(discharges[index]);
  };

  const removeDischarge = (index: number) => {
    setDischarges(discharges.filter((_, i) => i !== index));
    toast.success('Discharge removed');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (discharges.length === 0) {
       const submitData: SingleDischargeRequest = {
        ...formData,
        deleted_datetime: null,
        deleted_by: null,
        is_active: true,
      };
      onSubmit(submitData);
    }
    else {
      const submitData: BatchDischargeRequest = {
        ...formData,
        discharges,
      };
      onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {
        loader ? (
            <div className="size-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">
                      Fetching Prisoners and Staff Information, Please wait...
                    </p>
              </div>
            </div>
        ) : (
            <>
               {/* Request Information */}
                <div
                  className="px-4 py-3 rounded-lg"
                  style={{ backgroundColor: '#faebd7', color: '#650000' }}
                >
                  <h3 className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Request Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="in_charge">In Charge *</Label>
                    <Popover open={inChargeOpen} onOpenChange={setInChargeOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={inChargeOpen}
                          className="w-full justify-between"
                          type="button"
                        >
                          {inChargeLabel}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search staff..." />
                          <CommandList>
                            <CommandEmpty>No staff found.</CommandEmpty>
                            <CommandGroup>
                              {staff.map((staff) => (
                                <CommandItem
                                  key={staff.id}
                                  value={`${staff.first_name} ${staff.last_name}`}
                                  onSelect={() => handleChange("in_charge", staff.id)}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      formData.in_charge === staff.id ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{`${staff.first_name} ${staff.last_name}`}</span>
                                    <span className="text-xs text-gray-500">
                                      {staff.rank_name} • {staff.force_number}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="officer_in_charge">Officer In Charge *</Label>
                    <Popover open={officerInChargeOpen} onOpenChange={setOfficerInChargeOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={officerInChargeOpen}
                          className="w-full justify-between"
                          type="button"
                        >
                          {officerInChargeLabel}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search staff..." />
                          <CommandList>
                            <CommandEmpty>No staff found.</CommandEmpty>
                            <CommandGroup>
                              {staff.map((staff) => (
                                <CommandItem
                                  key={staff.id}
                                  value={`${staff.first_name} ${staff.last_name}`}
                                  onSelect={() => handleChange("officer_in_charge", staff.id)}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      formData.officer_in_charge === staff.id ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{`${staff.first_name} ${staff.last_name}`}</span>
                                    <span className="text-xs text-gray-500">
                                      {staff.rank_name} • {staff.force_number}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div>
                  <Label htmlFor="comment">Comment</Label>
                  <Textarea
                    id="comment"
                    value={formData.comment}
                    onChange={(e) => handleChange('comment', e.target.value)}
                    rows={3}
                    placeholder="Enter any additional comments..."
                  />
                </div>

                {/* Discharges */}
                <p className="text-black-500 mb-4">This is optional, you can create your request without discharges</p>
                <div
                  className="px-4 py-3 rounded-lg flex items-center justify-between"
                  style={{ backgroundColor: '#faebd7', color: '#650000' }}
                >
                  <h3 className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Discharges ({discharges.length})
                  </h3>
                  {editingIndex === null && (
                    <Button
                      type="button"
                      onClick={addDischarge}
                      size="sm"
                      style={{ backgroundColor: '#34D399' }}
                      className="hover:opacity-90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Discharge
                    </Button>
                  )}
                </div>

                {/* Editing Form */}
                {editingIndex !== null && (
                  <Card className="border-2" style={{ borderColor: '#34D399' }}>
                    <CardContent className="pt-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Prisoner *</Label>
                          <Popover open={prisonerOpen} onOpenChange={setPrisonerOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={prisonerOpen}
                                className="w-full justify-between"
                                type="button"
                              >
                                {
                                  getPrisonerLabel(prisoners, "Select prisoner...", editingDischarge.prisoner)
                                }
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search prisoner..." />
                                <CommandList>
                                  <CommandEmpty>No prisoner found.</CommandEmpty>
                                  <CommandGroup>
                                    {prisoners.map((prisoner) => (
                                      <CommandItem
                                        key={prisoner.id}
                                        value={prisoner.full_name}
                                        onSelect={() => {
                                          setEditingDischarge((prev) => ({
                                            ...prev,
                                            prisoner: prisoner.id,
                                          }));
                                          setPrisonerOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            'mr-2 h-4 w-4',
                                            editingDischarge.prisoner === prisoner.id ? 'opacity-100' : 'opacity-0'
                                          )}
                                        />
                                        <div className="flex flex-col">
                                          <span>{prisoner.full_name}</span>
                                          <span className="text-xs text-gray-500">{prisoner.prisoner_number_value}</span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div>
                          <Label>Discharge Type *</Label>
                          <Popover open={dischargeTypeOpen} onOpenChange={setDischargeTypeOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={dischargeTypeOpen}
                                className="w-full justify-between"
                                type="button"
                              >
                                {editingDischarge.discharge_type
                                  ? (() => {
                                      const selected = types.find(pr => pr.id === editingDischarge.discharge_type)
                                      return selected
                                        ? `${selected.name}`
                                        : 'Select discharge type...'
                                    })()
                                  : 'Select discharge type...'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search discharge type..." />
                                <CommandList>
                                  <CommandEmpty>No discharge type found.</CommandEmpty>
                                  <CommandGroup>
                                    {types.map((type) => (
                                      <CommandItem
                                        key={type.id}
                                        value={type.name}
                                        onSelect={() => {
                                          setEditingDischarge((prev) => ({
                                            ...prev,
                                            discharge_type: type.id
                                          }));
                                          setDischargeTypeOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            'mr-2 h-4 w-4',
                                            editingDischarge.discharge_type === type.id ? 'opacity-100' : 'opacity-0'
                                          )}
                                        />
                                        {type.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div>
                          <Label>Discharge Reason *</Label>
                          <Popover open={dischargeReasonOpen} onOpenChange={setDischargeReasonOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={dischargeReasonOpen}
                                className="w-full justify-between"
                                type="button"
                              >
                                {editingDischarge.discharge_reason
                                  ? (() => {
                                      const selected = reasons.find(pr => pr.id === editingDischarge.discharge_reason)
                                      return selected
                                        ? `${selected.name}`
                                        : 'Select discharge type...'
                                    })()
                                  : 'Select discharge reason...'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search discharge reason..." />
                                <CommandList>
                                  <CommandEmpty>No discharge reason found.</CommandEmpty>
                                  <CommandGroup>
                                    {reasons.map((reason) => (
                                      <CommandItem
                                        key={reason.id}
                                        value={reason.name}
                                        onSelect={() => {
                                          setEditingDischarge((prev) => ({
                                            ...prev,
                                            discharge_reason: reason.id,
                                          }));
                                          setDischargeReasonOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            'mr-2 h-4 w-4',
                                            editingDischarge.discharge_reason === reason.id ? 'opacity-100' : 'opacity-0'
                                          )}
                                        />
                                        {reason.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div>
                          <Label>Discharge Date & Time *</Label>
                          <Input
                            type="datetime-local"
                            value={editingDischarge.discharge_datetime.slice(0, 16)}
                            onChange={(e) =>
                              setEditingDischarge((prev) => ({
                                ...prev,
                                discharge_datetime: e.target.value + ':00Z',
                              }))
                            }
                            required
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label>Intended Place of Stay</Label>
                          <Input
                            value={editingDischarge.intended_place_of_stay}
                            onChange={(e) =>
                              setEditingDischarge((prev) => ({
                                ...prev,
                                intended_place_of_stay: e.target.value,
                              }))
                            }
                            placeholder="Enter intended address..."
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label>Remarks</Label>
                          <Textarea
                            value={editingDischarge.remarks}
                            onChange={(e) =>
                              setEditingDischarge((prev) => ({
                                ...prev,
                                remarks: e.target.value,
                              }))
                            }
                            rows={2}
                            placeholder="Enter any remarks..."
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={cancelEdit}>
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={saveDischarge}
                          style={{ backgroundColor: '#34D399' }}
                          className="hover:opacity-90"
                        >
                          {editingIndex < discharges.length ? 'Update' : 'Add'} Discharge
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Discharges Table */}
                {discharges.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Prisoner</TableHead>
                        <TableHead>Discharge Type</TableHead>
                        <TableHead>Discharge Reason</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {discharges.map((discharge, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {(() => {
                              const label = getPrisonerLabel2(prisoners, discharge.prisoner)
                              return (
                                  <div>
                                    <div className="font-medium">{label ? label.name : ""}</div>
                                    <div className="text-sm text-gray-500">{label ? label.number : ""}</div>
                                  </div>
                              )
                            })()}
                          </TableCell>
                          <TableCell>{getLabel(types, discharge.discharge_type)}</TableCell>
                          <TableCell>{getLabel(reasons, discharge.discharge_reason)}</TableCell>
                          <TableCell>
                            {new Date(discharge.discharge_datetime).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => editDischarge(index)}
                                disabled={editingIndex !== null}
                              >
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDischarge(index)}
                                disabled={editingIndex !== null}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {discharges.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <User className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 mb-4">No discharges added yet</p>
                    <Button type="button" onClick={addDischarge} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Discharge
                    </Button>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    style={{ backgroundColor: '#650000' }}
                    className="hover:opacity-90"
                  >
                    {mode === 'edit' ? 'Update' : 'Create'} Discharge Request
                  </Button>
                </div>
            </>
        )
      }

    </form>
  );
};
