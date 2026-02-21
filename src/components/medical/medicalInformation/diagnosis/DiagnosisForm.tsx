import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Switch } from '../../../ui/switch';
import { ClipboardList, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { requiredValidation } from '../../../../utils/validation';
import {Unit} from "../../../../services/stationServices/visitorsServices/visitorItem";
import {CaseBook, DiagnosisItem} from "../../../../services/medical/medicalInformation/medical";
import {getCasebookList, getRegimentList} from "../../../../services/medical/medicalInformation/medicalGetApis";
import {handleCatchError} from "../../../../services/stationServices/utils";

interface Diagnosis {
  id?: string;
  prisoner_name?: string;
  disease_name?: string;
  regiments_name?: string;
  differential: boolean;
  unfit_for_labor: boolean;
  remarks: string;
  medical_case_book: string;
  disease: string;
  regiments: string;
}

interface DiagnosisFormProps {
  diagnosis?: Diagnosis | null;
  onSubmit: (diagnosis: Diagnosis) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
  regiments: Unit[];
  setRegiments: React.Dispatch<React.SetStateAction<Unit[]>>;
  diseases: Unit[];
  caseBooks: CaseBook[];
  setCaseBooks: React.Dispatch<React.SetStateAction<CaseBook[]>>;
  loader: Boolean
  setLoader: React.Dispatch<React.SetStateAction<Boolean>>;
}

const DiagnosisForm: React.FC<DiagnosisFormProps> = ({ diagnosis, onSubmit, onCancel, mode, caseBooks, setCaseBooks, loader, setLoader, setRegiments, regiments, diseases }) => {
  const [formData, setFormData] = useState<DiagnosisItem>({
    differential: false,
    unfit_for_labor: false,
    remarks: '',
    medical_case_book: '',
    disease: '',
    regiment: '',
    is_active: true,
    deleted_datetime: null,
    deleted_by: null,
  });

  const [dataLoaded, setDataLoaded] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (diagnosis && dataLoaded) {
      setFormData(diagnosis);
    }
  }, [diagnosis, dataLoaded]);

  const loadDropdownData = async () => {
    try {
      let casebooksOk = true
      let regimentsOk = true

      if (!caseBooks.length) {
        casebooksOk = await getCasebookList(setCaseBooks)
      }
      if (!regiments.length) {
        regimentsOk = await getRegimentList(setRegiments)
      }

      if (casebooksOk && regimentsOk) {
        setDataLoaded(false)
      }
      else {
        toast.error("Please make sure you have case books and regiments")
        onCancel()
      }

    }
    catch (error) {
      handleCatchError(error)
    }
  };

  const handleInputChange = (field: keyof Diagnosis, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: Record<string, string> = {};
    
    if (!formData.medical_case_book) {
      newErrors.medical_case_book = 'Case Book is required';
    }
    if (!formData.disease) {
      newErrors.disease = 'Disease is required';
    }
    if (!formData.regiment) {
      newErrors.regiment = 'Treatment Regiment is required';
    }
    if (!formData.remarks) {
      newErrors.remarks = 'Remarks is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    setLoader(true);
    onSubmit(formData);
    //   const selectedCaseBook = caseBooks.find((cb) => cb.id === formData.medical_case_book);
    //   const selectedDisease = diseases.find((d) => d.id === formData.disease);
    //   const selectedRegiments = regimentss.find((r) => r.id === formData.regiments);
    //
    //   const submitData: Diagnosis = {
    //     ...formData,
    //     prisoner_name: selectedCaseBook?.prisoner_name || '',
    //     disease_name: selectedDisease?.name || '',
    //     regiments_name: selectedRegiments?.name || '',
    //   };
    //
    //   onSubmit(submitData);
    //   setLoader(false);
    //
    //   if (mode === 'create') {
    //     toast.success('Diagnosis created successfully');
    //     setFormData({
    //       differential: false,
    //       unfit_for_labor: false,
    //       remarks: '',
    //       medical_case_book: '',
    //       disease: '',
    //       regiments: '',
    //     });
    //   } else {
    //     toast.success('Diagnosis updated successfully');
    //   }
    // }, 500);
  };

  const isReadOnly = mode === 'view';

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <ClipboardList className="h-5 w-5" />
          {mode === 'create' && 'New Diagnosis'}
          {mode === 'edit' && 'Edit Diagnosis'}
          {mode === 'view' && 'View Diagnosis'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {
          dataLoaded ? (
              <div className="size-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground text-sm">
                        Fetching additional information, Please wait...
                      </p>
                </div>
              </div>
          ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
                    Case Book Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="medical_case_book">
                        Medical Case Book <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.medical_case_book}
                        onValueChange={(value) => handleInputChange('medical_case_book', value)}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger id="medical_case_book">
                          <SelectValue placeholder="Select case book" />
                        </SelectTrigger>
                        <SelectContent>
                          {caseBooks.map((cb) => (
                            <SelectItem key={cb.id} value={cb.id}>
                              {cb.check_type_name} - {cb.prisoner_name} - Doctor: {cb.doctors_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
      
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
                    Diagnosis Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="disease">
                        Disease <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.disease}
                        onValueChange={(value) => handleInputChange('disease', value)}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger id="disease">
                          <SelectValue placeholder="Select disease" />
                        </SelectTrigger>
                        <SelectContent>
                          {diseases.map((disease) => (
                            <SelectItem key={disease.id} value={disease.id}>
                              {disease.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
      
                    <div className="space-y-2">
                      <Label htmlFor="regiments">
                        Treatment Regiments <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.regiment}
                        onValueChange={(value) => handleInputChange('regiment', value)}
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
                    </div>
                  </div>
                </div>
      
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
                    Status Flags
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="differential">Differential Diagnosis</Label>
                        <p className="text-sm text-gray-600">Mark if diagnosis is differential</p>
                      </div>
                      <Switch
                        id="differential"
                        checked={formData.differential}
                        onCheckedChange={(checked) => handleInputChange('differential', checked)}
                        disabled={isReadOnly}
                      />
                    </div>
      
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="unfit_for_labor">Unfit for Labor</Label>
                        <p className="text-sm text-gray-600">Mark if prisoner unfit for work</p>
                      </div>
                      <Switch
                        id="unfit_for_labor"
                        checked={formData.unfit_for_labor}
                        onCheckedChange={(checked) => handleInputChange('unfit_for_labor', checked)}
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                </div>
      
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
                    Additional Information
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="remarks"
                      value={formData.remarks}
                      onChange={(e) => handleInputChange('remarks', e.target.value)}
                      placeholder="Enter any additional remarks or observations..."
                      rows={4}
                      disabled={isReadOnly}
                    />
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
                      {loader ? 'Saving...' : mode === 'create' ? 'Create Diagnosis' : 'Update Diagnosis'}
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
          )
        }
        
      </CardContent>
    </Card>
  );
};

export default DiagnosisForm;