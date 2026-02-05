import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { FileText, Save, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {Unit} from "../../../../services/stationServices/visitorsServices/visitorItem";
import {PrisonerItem} from "../../../../services/stationServices/visitorsServices/VisitorsService";
import {Loading} from "../MedicalDetails";
import {Record} from "../../../../services/medical/medicalInformation/medical";

interface MedicalRecord {
  id?: string;
  prisoner_name?: string;
  prisoner_number?: string;
  blood_group_name?: string;
  prisoner: string;
  blood_group: string;
}

interface MedicalRecordFormProps {
  medicalRecord?: MedicalRecord | null;
  onSubmit: (medicalRecord: MedicalRecord) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
  prisoners: PrisonerItem
  bloodGroups: Unit
  loader: Boolean,
  setLoader: React.Dispatch<React.SetStateAction<Boolean>>
}

const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({
  prisoners, bloodGroups, loader, setLoader,
  medicalRecord,
  onSubmit,
  onCancel,
  mode,
}) => {
  const [formData, setFormData] = useState<MedicalRecord>({
    prisoner: '',
    blood_group: '',
  });

  // const [prisoners, setPrisoners] = useState<any[]>([]);
  // const [bloodGroups, setBloodGroups] = useState<any[]>([]);
  // const [loader, setLoader] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(true);

  // useEffect(() => {
  //   loadDropdownData();
  // }, []);

  useEffect(() => {
    if (medicalRecord && dataLoaded) {
      setFormData({ prisoner: medicalRecord.prisoner, blood_group: medicalRecord.blood_group })
      // setFormData(medicalRecord);
    }
  }, [medicalRecord, dataLoaded]);

  // const loadDropdownData = () => {
  //   // Mock data - replace with actual API calls
  //   setPrisoners([
  //     { id: '1', prisoner_number: 'PR-2024-001', full_name: 'John Doe' },
  //     { id: '2', prisoner_number: 'PR-2024-002', full_name: 'Jane Smith' },
  //     { id: '3', prisoner_number: 'PR-2024-003', full_name: 'Michael Johnson' },
  //     { id: '4', prisoner_number: 'PR-2024-004', full_name: 'Emily Davis' },
  //     { id: '5', prisoner_number: 'PR-2024-005', full_name: 'Robert Lee' },
  //   ]);
  //
  //   setBloodGroups([
  //     { id: '1', name: 'A+', description: 'Blood Group A Positive' },
  //     { id: '2', name: 'A-', description: 'Blood Group A Negative' },
  //     { id: '3', name: 'B+', description: 'Blood Group B Positive' },
  //     { id: '4', name: 'B-', description: 'Blood Group B Negative' },
  //     { id: '5', name: 'AB+', description: 'Blood Group AB Positive' },
  //     { id: '6', name: 'AB-', description: 'Blood Group AB Negative' },
  //     { id: '7', name: 'O+', description: 'Blood Group O Positive' },
  //     { id: '8', name: 'O-', description: 'Blood Group O Negative' },
  //   ]);
  //
  //   setDataLoaded(true);
  // };

  const handleInputChange = (field: keyof MedicalRecord, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.blood_group) {
      toast.error('Please select blood group');
      return;
    }

    // const selectedPrisoner = prisoners.find((p) => p.id === formData.prisoner);
    // const selectedBloodGroup = bloodGroups.find((bg) => bg.id === formData.blood_group);
    //

    const submitData: Record = {
      ...formData,
      is_active: true,
      deleted_datetime: null,
      deleted_by: null
    };

    setLoader(true);
    onSubmit(submitData);

    // setTimeout(() => {
    //   const selectedPrisoner = prisoners.find((p) => p.id === formData.prisoner);
    //   const selectedBloodGroup = bloodGroups.find((bg) => bg.id === formData.blood_group);
    //
    //   const submitData: MedicalRecord = {
    //     ...formData,
    //     prisoner_name: selectedPrisoner?.full_name || '',
    //     prisoner_number: selectedPrisoner?.prisoner_number || '',
    //     blood_group_name: selectedBloodGroup?.name || '',
    //   };
    //
    //   onSubmit(submitData);
    //   setLoader(false);
    //
    //   if (mode === 'create') {
    //     toast.success('Medical record created successfully');
    //     setFormData({ prisoner: '', blood_group: '' });
    //   } else {
    //     toast.success('Medical record updated successfully');
    //   }
    // }, 500);

  };

  const isReadOnly = mode === 'view';

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <FileText className="h-5 w-5" />
          {mode === 'create' && 'New Medical Record'}
          {mode === 'edit' && 'Edit Medical Record'}
          {mode === 'view' && 'View Medical Record'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Medical Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prisoner">
                  Prisoner <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="px-3 py-2 border rounded-md bg-gray-50">
                    {medicalRecord?.prisoner_number} - {medicalRecord?.prisoner_name}
                  </div>
                ) : (
                  <Select
                    value={formData.prisoner}
                    onValueChange={(value) => handleInputChange('prisoner', value)}
                  >
                    <SelectTrigger id="prisoner">
                      <SelectValue placeholder="Select prisoner" />
                    </SelectTrigger>
                    <SelectContent>
                      {prisoners.map((prisoner) => (
                        <SelectItem key={prisoner.id} value={prisoner.id}>
                          {prisoner.prisoner_number_value} - {prisoner.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="blood_group">
                  Blood Group <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="px-3 py-2 border rounded-md bg-gray-50">
                    {medicalRecord?.blood_group_name}
                  </div>
                ) : (
                  <Select
                    value={formData.blood_group}
                    onValueChange={(value) => handleInputChange('blood_group', value)}
                  >
                    <SelectTrigger id="blood_group">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name} - {group.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel} disabled={loader}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                style={{ backgroundColor: '#650000' }}
                className="text-white hover:opacity-90"
                disabled={loader}
              >
                <Save className="h-4 w-4 mr-2" />
                {loader ? 'Saving...' : mode === 'create' ? 'Create Record' : 'Update Record'}
              </Button>
            </div>
          )}

          {isReadOnly && (
            <div className="flex items-center justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Close
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default MedicalRecordForm;