import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Stethoscope, Save, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { requiredValidation } from '../../../../utils/validation';
import {Unit} from "../../../../services/stationServices/visitorsServices/visitorItem";
import {CaseBook, MedicalRecord} from "../../../../services/medical/medicalInformation/medical";
import {
  getCasebookList,
  getMedicalRecordsList,
  getRegimentList
} from "../../../../services/medical/medicalInformation/medicalGetApis";
import {handleCatchError} from "../../../../services/stationServices/utils";

export interface AilmentForm {
  id?: string;
  prisoner_name?: string;
  ailment_name?: string;
  regiment_name?: string;
  remarks: string;
  supporting_document: string;
  document: File | null
  prisoner_medical_record: string;
  ailment: string;
  regiment: string;
}

interface AilmentFormProps {
  ailment?: AilmentForm | null;
  onSubmit: (ailment: AilmentForm) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
  regiments: Unit[];
  diseases: Unit[];
  medicalRecords: MedicalRecord[]
  setMedicalRecords: React.Dispatch<React.SetStateAction<MedicalRecord[]>>
  loader: Boolean
  setLoader: React.Dispatch<React.SetStateAction<Boolean>>;
}

const AilmentForm: React.FC<AilmentFormProps> = ({ ailment, onSubmit, onCancel, mode, loader, setLoader, setMedicalRecords, medicalRecords, regiments, diseases }) => {
  const { control, handleSubmit: handleRHFSumbit, setValue, watch, formState: { errors } } = useForm<AilmentForm>({
    defaultValues: {
      remarks: '',
      supporting_document: '',
      prisoner_medical_record: '',
      document: null,
      ailment: '',
      regiment: '',
    }
  });

  const [dataLoaded, setDataLoaded] = useState(true);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (ailment && dataLoaded) {
      Object.keys(ailment).forEach(key => {
        setValue(key as keyof AilmentForm, ailment[key as keyof AilmentForm]);
      });
    }
  }, [ailment, dataLoaded, setValue]);

  const loadDropdownData = async () => {
     try {
      let medicalRecordOk = true

      if (!medicalRecords.length) {
        medicalRecordOk = await getMedicalRecordsList(setMedicalRecords)
      }

      if (medicalRecordOk) {
        setDataLoaded(false)
      }
      else {
        toast.error("Please make sure you have medical records")
        onCancel()
      }

    }
    catch (error) {
      handleCatchError(error)
      onCancel()
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('supporting_document', file.name);
      setValue('document', file);
      toast.success('Document uploaded successfully');
    }
  };

  const onFormSubmit = (data: AilmentForm) => {
    if (!data.remarks) {
      toast.error('Please provide remarks');
      return;
    }
    setLoader(true);
    onSubmit(data);
  };

  const isReadOnly = mode === 'view';

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <Stethoscope className="h-5 w-5" />
          {mode === 'create' && 'New Ailment Record'}
          {mode === 'edit' && 'Edit Ailment Record'}
          {mode === 'view' && 'View Ailment Record'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleRHFSumbit(onFormSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Prisoner Medical Record
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prisoner_medical_record">
                  Medical Record <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="prisoner_medical_record"
                  control={control}
                  rules={requiredValidation("Medical Record")}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger id="prisoner_medical_record">
                        <SelectValue placeholder="Select medical record" />
                      </SelectTrigger>
                      <SelectContent>
                        {medicalRecords.map((record) => (
                          <SelectItem key={record.id} value={record.id}>
                            {record.prisoner_number_value} - {record.prisoner_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.prisoner_medical_record && !isReadOnly && (
                  <p className="text-sm text-red-600">{errors.prisoner_medical_record.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Ailment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ailment">
                  Ailment/Disease <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="ailment"
                  control={control}
                  rules={requiredValidation("Ailment")}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger id="ailment">
                        <SelectValue placeholder="Select ailment" />
                      </SelectTrigger>
                      <SelectContent>
                        {diseases.map((ailment) => (
                          <SelectItem key={ailment.id} value={ailment.id}>
                            {ailment.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.ailment && !isReadOnly && (
                  <p className="text-sm text-red-600">{errors.ailment.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="regiment">
                  Treatment Regiment <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="regiment"
                  control={control}
                  rules={requiredValidation("Treatment Regiment")}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger id="regiment">
                        <SelectValue placeholder="Select regiment" />
                      </SelectTrigger>
                      <SelectContent>
                        {regiments.map((regiment) => (
                          <SelectItem key={regiment.id} value={regiment.id}>
                            {regiment.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.regiment && !isReadOnly && (
                  <p className="text-sm text-red-600">{errors.regiment.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Additional Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks <span className="text-red-500">*</span></Label>
                <Controller
                  name="remarks"
                  control={control}
                  rules={requiredValidation("Remarks")}
                  render={({ field }) => (
                    <Textarea
                      id="remarks"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Enter any additional remarks..."
                      rows={4}
                      disabled={isReadOnly}
                    />
                  )}
                />
                {errors.remarks && !isReadOnly && (
                  <p className="text-sm text-red-600">{errors.remarks.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supporting_document">Supporting Document</Label>
                {isReadOnly ? (
                  <Input
                    id="supporting_document"
                    value={watch('supporting_document')}
                    disabled
                    placeholder="No document uploaded"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      id="supporting_document"
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <Upload className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                {watch('supporting_document') && (
                  <p className="text-sm text-gray-600">
                    Current file: {watch('supporting_document')}
                  </p>
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

export default AilmentForm;