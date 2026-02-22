import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { FlaskConical, Save, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { requiredValidation } from '../../../../utils/validation';
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
  const { control, handleSubmit: handleRHFSumbit, setValue, watch, formState: { errors } } = useForm<Test>({
    defaultValues: {
      notes: '',
      result_document: '',
      document: null,
      medical_case_book: '',
      medical_test: '',
      result: '',
    }
  });

  const [dataLoaded, setDataLoaded] = useState(true);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (labTest && dataLoaded) {
      Object.keys(labTest).forEach(key => {
        setValue(key as keyof Test, labTest[key as keyof Test]);
      });
    }
  }, [labTest, dataLoaded, setValue]);

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
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('result_document', file.name);
      setValue('document', file);
      toast.success('Document uploaded successfully');
    }
  };

  const onFormSubmit = (data: Test) => {
    if (!data.notes) {
      toast.error('Please provide the notes');
      return;
    }
    setLoader(true);
    onSubmit(data)
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
              <form onSubmit={handleRHFSumbit(onFormSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
                    Case Book Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="medical_case_book">
                        Medical Case Book <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        name="medical_case_book"
                        control={control}
                        rules={requiredValidation("Case Book")}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
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
                        )}
                      />
                      {errors.medical_case_book && !isReadOnly && (
                        <p className="text-sm text-red-600">{errors.medical_case_book.message}</p>
                      )}
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
                      <Controller
                        name="medical_test"
                        control={control}
                        rules={requiredValidation("Medical Test")}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
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
                        )}
                      />
                      {errors.medical_test && !isReadOnly && (
                        <p className="text-sm text-red-600">{errors.medical_test.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="result">
                        Test Result <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        name="result"
                        control={control}
                        rules={requiredValidation("Test Result")}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
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
                        )}
                      />
                      {errors.result && !isReadOnly && (
                        <p className="text-sm text-red-600">{errors.result.message}</p>
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
                      <Label htmlFor="result_document">Result Document</Label>
                      {isReadOnly ? (
                        <Input value={watch('result_document')} disabled placeholder="No document uploaded" />
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
                      {watch('result_document') && (
                        <p className="text-sm text-gray-600">Current file: {watch('result_document')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes <span className="text-red-500">*</span></Label>
                      <Controller
                        name="notes"
                        control={control}
                        rules={requiredValidation("Notes")}
                        render={({ field }) => (
                          <Textarea
                            id="notes"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Enter test notes and observations..."
                            rows={4}
                            disabled={isReadOnly}
                          />
                        )}
                      />
                      {errors.notes && !isReadOnly && (
                        <p className="text-sm text-red-600">{errors.notes.message}</p>
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