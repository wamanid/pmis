import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { FlaskConical, Save, X, Upload } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {CaseBook} from "../../../../services/medical/medicalInformation/medical";
import {Unit} from "../../../../services/stationServices/visitorsServices/visitorItem";
import {getCasebookList} from "../../../../services/medical/medicalInformation/medicalGetApis";
import {handleCatchError} from "../../../../services/stationServices/utils";

export interface Test {
  id?: string;
  prisoner_name?: string;
  test_name?: string;
  result_name?: string;
  notes: string;
  result_document: string;
  document: File | null;
  medical_case_book: string;
  medical_test: string;
  result: string;
}

interface LabTestFormProps {
  labTest?: Test | null;
  onSubmit: (labTest: Test) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
  loader: boolean
  setLoader: React.Dispatch<React.SetStateAction<Boolean>>
  setNewDialogLoader: React.Dispatch<React.SetStateAction<Boolean>>
  caseBooks: CaseBook[];
  setCaseBooks: React.Dispatch<React.SetStateAction<CaseBook[]>>;
  medicalTests: Unit[];
  testResults: Unit[];
}

const LabTestForm: React.FC<LabTestFormProps> = ({ labTest, onSubmit, onCancel, mode, setNewDialogLoader, setLoader,
                                                   setCaseBooks, caseBooks, testResults, medicalTests, loader }) => {
  const [formData, setFormData] = useState<Test>({
    notes: '',
    result_document: '',
    document: null,
    medical_case_book: '',
    medical_test: '',
    result: '',
  });

  // const [caseBooks, setCaseBooks] = useState<any[]>([]);
  // const [medicalTests, setMedicalTests] = useState<any[]>([]);
  // const [testResults, setTestResults] = useState<any[]>([]);
  // const [loader, setLoader] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(true);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (labTest && dataLoaded) {
      setFormData(labTest);
    }
  }, [labTest, dataLoaded]);

  const loadDropdownData = async () => {
    try {
      let casebooksOk = true

      if (!caseBooks.length) {
        casebooksOk = await getCasebookList(setCaseBooks)
      }

      if (casebooksOk) {
        setDataLoaded(false)
      }
      else {
        toast.error("Please make sure you have case books")
        onCancel()
      }

    }
    catch (error) {
      handleCatchError(error)
    }
    // setCaseBooks([
    //   { id: '1', prisoner_name: 'John Doe', case_number: 'CB-2024-001' },
    //   { id: '2', prisoner_name: 'Jane Smith', case_number: 'CB-2024-002' },
    //   { id: '3', prisoner_name: 'Michael Johnson', case_number: 'CB-2024-003' },
    // ]);
    //
    // setMedicalTests([
    //   { id: '1', name: 'Complete Blood Count', category: 'Hematology' },
    //   { id: '2', name: 'Liver Function Test', category: 'Biochemistry' },
    //   { id: '3', name: 'Kidney Function Test', category: 'Biochemistry' },
    //   { id: '4', name: 'HIV Test', category: 'Serology' },
    //   { id: '5', name: 'Tuberculosis Test', category: 'Microbiology' },
    // ]);
    //
    // setTestResults([
    //   { id: '1', name: 'Normal', description: 'Within normal range' },
    //   { id: '2', name: 'Abnormal', description: 'Outside normal range' },
    //   { id: '3', name: 'Positive', description: 'Test positive' },
    //   { id: '4', name: 'Negative', description: 'Test negative' },
    //   { id: '5', name: 'Pending', description: 'Results pending' },
    // ]);
    //
    // setDataLoaded(true);
  };

  const handleInputChange = (field: keyof LabTest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, result_document: file.name, document: file }));
      toast.success('Document uploaded successfully');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: Record<string, string> = {};
    
    if (!formData.medical_case_book) {
      newErrors.medical_case_book = 'Case Book is required';
    }
    if (!formData.medical_test) {
      newErrors.medical_test = 'Medical Test is required';
    }
    if (!formData.result) {
      newErrors.result = 'Test Result is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    if (!formData.notes) {
      toast.error('Please provide the notes');
      return;
    }

    setLoader(true);
    onSubmit(formData)

    // setTimeout(() => {
    //   const selectedCaseBook = caseBooks.find((cb) => cb.id === formData.medical_case_book);
    //   const selectedTest = medicalTests.find((t) => t.id === formData.medical_test);
    //   const selectedResult = testResults.find((r) => r.id === formData.result);
    //
    //   const submitData: LabTest = {
    //     ...formData,
    //     prisoner_name: selectedCaseBook?.prisoner_name || '',
    //     test_name: selectedTest?.name || '',
    //     result_name: selectedResult?.name || '',
    //   };
    //
    //   onSubmit(submitData);
    //   setLoader(false);
    //
    //   if (mode === 'create') {
    //     toast.success('Lab test created successfully');
    //     setFormData({
    //       notes: '',
    //       result_document: '',
    //       medical_case_book: '',
    //       medical_test: '',
    //       result: '',
    //     });
    //   } else {
    //     toast.success('Lab test updated successfully');
    //   }
    // }, 500);
  };

  const isReadOnly = mode === 'view';

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <FlaskConical className="h-5 w-5" />
          {mode === 'create' && 'New Lab Test'}
          {mode === 'edit' && 'Edit Lab Test'}
          {mode === 'view' && 'View Lab Test'}
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
                    Test Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="medical_test">
                        Medical Test <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.medical_test}
                        onValueChange={(value) => handleInputChange('medical_test', value)}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger id="medical_test">
                          <SelectValue placeholder="Select test" />
                        </SelectTrigger>
                        <SelectContent>
                          {medicalTests.map((test) => (
                            <SelectItem key={test.id} value={test.id}>
                              {/*{test.name} ({test.category})*/}
                              {test.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="result">
                        Test Result <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.result}
                        onValueChange={(value) => handleInputChange('result', value)}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger id="result">
                          <SelectValue placeholder="Select result" />
                        </SelectTrigger>
                        <SelectContent>
                          {testResults.map((result) => (
                            <SelectItem key={result.id} value={result.id}>
                              {result.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="result_document">Result Document</Label>
                      {isReadOnly ? (
                        <Input value={formData.result_document} disabled placeholder="No document uploaded" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            id="result_document"
                            onChange={handleFileUpload}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                          <Upload className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      {formData.result_document && (
                        <p className="text-sm text-gray-600">Current file: {formData.result_document}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes <span className="text-red-500">*</span></Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Enter test notes and observations..."
                        rows={4}
                        disabled={isReadOnly}
                      />
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
                      {loader ? 'Saving...' : mode === 'create' ? 'Create Test' : 'Update Test'}
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

export default LabTestForm;