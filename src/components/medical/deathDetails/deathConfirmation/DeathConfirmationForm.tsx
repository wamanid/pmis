import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Textarea } from '../../../ui/textarea';
import { FileX, Save, X, Calendar as CalendarIcon, Upload, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Calendar } from '../../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/popover';
import { format } from 'date-fns';
import CustomPrisonerSearch from '../../../common/CustomPrisonerSearch';
import StaffProfileSelect from '../../../common/StaffProfileSelect';
import {
  DeathConfirmation,
} from '../../../../services/medical/deathDetails/deathConfirmationService';
import { uploadFile } from '../../../../services/fileUploadService';
import axiosInstance from '../../../../services/axiosInstance';

interface DeathConfirmationFormProps {
  confirmation?: DeathConfirmation | null;
  onComplete: () => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const DeathConfirmationForm: React.FC<DeathConfirmationFormProps> = ({
  confirmation,
  onComplete,
  onCancel,
  mode,
}) => {
  const [formData, setFormData] = useState<DeathConfirmation>({
    pathologist_attachment: '',
    other_attachment: '',
    medical_form: '',
    death_certificate: '',
    presumed_cause_of_death: '',
    actual_cause_of_death: '',
    cause_of_death: '',
    place_of_death: '',
    date_of_death: '',
    notes: '',
    prisoner: '',
    officer_in_charge: '',
    medial_officer: '',
  });

  const [loading, setLoading] = useState(false);
  const [deathDateOpen, setDeathDateOpen] = useState(false);

  // Local state for pending file uploads (stores File objects before upload)
  const [pendingFiles, setPendingFiles] = useState<{
    death_certificate: File | null;
    medical_form: File | null;
    pathologist_attachment: File | null;
    other_attachment: File | null;
  }>({
    death_certificate: null,
    medical_form: null,
    pathologist_attachment: null,
    other_attachment: null,
  });

  // Upload progress tracking
  const [uploadProgress, setUploadProgress] = useState<{
    death_certificate: number;
    medical_form: number;
    pathologist_attachment: number;
    other_attachment: number;
  }>({
    death_certificate: 0,
    medical_form: 0,
    pathologist_attachment: 0,
    other_attachment: 0,
  });

  // Local state for document editing
  const [editingDoc, setEditingDoc] = useState<{
    death_certificate: boolean;
    medical_form: boolean;
    pathologist_attachment: boolean;
    other_attachment: boolean;
  }>({
    death_certificate: false,
    medical_form: false,
    pathologist_attachment: false,
    other_attachment: false,
  });

  // Local state for dropdowns (with initialization functions)
  const [localPrisonerId, setLocalPrisonerId] = useState<string | null>(() => {
    if (confirmation && (mode === 'edit' || mode === 'view') && confirmation.prisoner) {
      return confirmation.prisoner;
    }
    return null;
  });

  const [localOfficerInChargeId, setLocalOfficerInChargeId] = useState<string | null>(() => {
    if (confirmation && (mode === 'edit' || mode === 'view') && confirmation.officer_in_charge) {
      return confirmation.officer_in_charge;
    }
    return null;
  });

  const [localMedicalOfficerId, setLocalMedicalOfficerId] = useState<string | null>(() => {
    if (confirmation && (mode === 'edit' || mode === 'view') && confirmation.medial_officer) {
      return confirmation.medial_officer;
    }
    return null;
  });

  // Derive initialItems from confirmation prop (memoized to prevent re-renders)
  const initialPrisonerItem = useMemo(() =>
    confirmation && (mode === 'edit' || mode === 'view') && confirmation.prisoner && confirmation.prisoner_name
      ? {
          id: confirmation.prisoner,
          prisoner_number: confirmation.prisoner_number || '',
          full_name: confirmation.prisoner_name,
        }
      : null,
    [confirmation, mode]
  );

  const initialOfficerInChargeItem = useMemo(() =>
    confirmation &&
    (mode === 'edit' || mode === 'view') &&
    confirmation.officer_in_charge &&
    confirmation.officer_in_charge_name
      ? {
          id: confirmation.officer_in_charge,
          full_name: confirmation.officer_in_charge_name,
          force_number: '',
        }
      : null,
    [confirmation, mode]
  );

  const initialMedicalOfficerItem = useMemo(() =>
    confirmation &&
    (mode === 'edit' || mode === 'view') &&
    confirmation.medial_officer &&
    confirmation.medical_officer_name
      ? {
          id: confirmation.medial_officer,
          full_name: confirmation.medical_officer_name,
          force_number: '',
        }
      : null,
    [confirmation, mode]
  );

  // CRITICAL: Define handleInputChange FIRST before other handlers use it
  const handleInputChange = useCallback((field: keyof DeathConfirmation, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Memoized onChange handlers - inline state updates to avoid dependency issues
  const handlePrisonerChange = useCallback((prisonerId: string | null) => {
    setLocalPrisonerId(prisonerId);
    setFormData((prev) => ({ ...prev, prisoner: prisonerId }));
  }, []);

  const handleOfficerInChargeChange = useCallback((val: string | null) => {
    setLocalOfficerInChargeId(val);
    setFormData((prev) => ({ ...prev, officer_in_charge: val }));
  }, []);

  const handleMedicalOfficerChange = useCallback((val: string | null) => {
    setLocalMedicalOfficerId(val);
    setFormData((prev) => ({ ...prev, medial_officer: val }));
  }, []);

  // Memoize dropdown components to prevent re-renders on formData changes
  const prisonerSearchComponent = useMemo(() => (
    <CustomPrisonerSearch
      value={localPrisonerId}
      onChange={handlePrisonerChange}
      disabled={loading}
    />
  ), [localPrisonerId, handlePrisonerChange, loading]);

  const officerInChargeSelectComponent = useMemo(() => (
    <StaffProfileSelect
      value={localOfficerInChargeId}
      onChange={handleOfficerInChargeChange}
      placeholder="Select officer in charge"
      initialItem={initialOfficerInChargeItem ?? undefined}
    />
  ), [localOfficerInChargeId, handleOfficerInChargeChange, initialOfficerInChargeItem]);

  const medicalOfficerSelectComponent = useMemo(() => (
    <StaffProfileSelect
      value={localMedicalOfficerId}
      onChange={handleMedicalOfficerChange}
      placeholder="Select medical officer"
      initialItem={initialMedicalOfficerItem ?? undefined}
    />
  ), [localMedicalOfficerId, handleMedicalOfficerChange, initialMedicalOfficerItem]);

  // Synchronize form data with confirmation prop
  useEffect(() => {
    if (confirmation && (mode === 'edit' || mode === 'view')) {
      setFormData(confirmation);
      setLocalPrisonerId(confirmation.prisoner || null);
      setLocalOfficerInChargeId(confirmation.officer_in_charge || null);
      setLocalMedicalOfficerId(confirmation.medial_officer || null);
    }
  }, [confirmation, mode]);

  // Reset form when switching to create mode
  useEffect(() => {
    if (mode === 'create') {
      setFormData({
        pathologist_attachment: '',
        other_attachment: '',
        medical_form: '',
        death_certificate: '',
        presumed_cause_of_death: '',
        actual_cause_of_death: '',
        cause_of_death: '',
        place_of_death: '',
        date_of_death: '',
        notes: '',
        prisoner: '',
        officer_in_charge: '',
        medial_officer: '',
      });
      setLocalPrisonerId(null);
      setLocalOfficerInChargeId(null);
      setLocalMedicalOfficerId(null);
    }
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.officer_in_charge) {
      toast.error('Please select an officer in charge');
      return;
    }
    if (!formData.medial_officer) {
      toast.error('Please select a medical officer');
      return;
    }
    if (!formData.date_of_death) {
      toast.error('Please select date of death');
      return;
    }
    if (!formData.place_of_death) {
      toast.error('Please enter place of death');
      return;
    }
    if (!formData.cause_of_death) {
      toast.error('Please enter cause of death');
      return;
    }

    setLoading(true);

    try {
      // Check if we have any pending files to upload
      const hasPendingFiles = Object.values(pendingFiles).some(file => file !== null);

      if (hasPendingFiles || mode === 'create') {
        // Send as multipart/form-data with files + all form fields in ONE request
        const formDataToSend = new FormData();

        // Add all text fields
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            formDataToSend.append(key, String(value));
          }
        });

        // Add pending files (if any)
        if (pendingFiles.death_certificate) {
          formDataToSend.append('death_certificate', pendingFiles.death_certificate);
        }
        if (pendingFiles.medical_form) {
          formDataToSend.append('medical_form', pendingFiles.medical_form);
        }
        if (pendingFiles.pathologist_attachment) {
          formDataToSend.append('pathologist_attachment', pendingFiles.pathologist_attachment);
        }
        if (pendingFiles.other_attachment) {
          formDataToSend.append('other_attachment', pendingFiles.other_attachment);
        }

        // Show uploading toast if there are files
        if (hasPendingFiles) {
          const fileCount = Object.values(pendingFiles).filter(f => f !== null).length;
          toast.info(`Uploading ${fileCount} file(s) with form data...`);
        }

        // Send multipart request
        const endpoint = mode === 'edit' && confirmation?.id 
          ? `/medical-management/death-confirmations/${confirmation.id}/`
          : '/medical-management/death-confirmations/';

        const response = await axiosInstance({
          method: mode === 'edit' ? 'put' : 'post',
          url: endpoint,
          data: formDataToSend,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        toast.success(mode === 'create' ? 'Death confirmation created successfully' : 'Death confirmation updated successfully');

        if (mode === 'create') {
          // Reset form
          setFormData({
            pathologist_attachment: '',
            other_attachment: '',
            medical_form: '',
            death_certificate: '',
            presumed_cause_of_death: '',
            actual_cause_of_death: '',
            cause_of_death: '',
            place_of_death: '',
            date_of_death: '',
            notes: '',
            prisoner: '',
            officer_in_charge: '',
            medial_officer: '',
          });
          setLocalPrisonerId(null);
          setLocalOfficerInChargeId(null);
          setLocalMedicalOfficerId(null);
          setPendingFiles({
            death_certificate: null,
            medical_form: null,
            pathologist_attachment: null,
            other_attachment: null,
          });
        }

        // Signal parent that submission is complete
        onComplete();
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast.error(error.response?.data?.message || 'Failed to save death confirmation');
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <FileX className="h-5 w-5" />
          {mode === 'create' && 'New Death Confirmation'}
          {mode === 'edit' && 'Edit Death Confirmation'}
          {mode === 'view' && 'View Death Confirmation'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prisoner Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Prisoner Information
            </h3>
            <div className="space-y-2">
              <Label htmlFor="prisoner">
                Prisoner <span className="text-red-500">*</span>
              </Label>
              {isReadOnly ? (
                <Input
                  value={`${confirmation?.prisoner_number || ''} - ${confirmation?.prisoner_name || ''}`}
                  disabled
                  className="bg-gray-50"
                />
              ) : mode === 'edit' ? (
                <Input
                  value={`${confirmation?.prisoner_number || ''} - ${confirmation?.prisoner_name || ''}`}
                  disabled
                  className="bg-muted"
                />
              ) : (
                prisonerSearchComponent
              )}
            </div>
          </div>

          {/* Death Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Death Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_death">
                  Date of Death <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <Input
                    value={
                      formData.date_of_death
                        ? format(new Date(formData.date_of_death), 'PPP')
                        : 'N/A'
                    }
                    disabled
                    className="bg-gray-50"
                  />
                ) : (
                  <Popover open={deathDateOpen} onOpenChange={setDeathDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        disabled={loading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date_of_death
                          ? format(new Date(formData.date_of_death), 'PPP')
                          : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.date_of_death ? new Date(formData.date_of_death) : undefined}
                        onSelect={(date: Date | undefined) => {
                          if (date) {
                            handleInputChange('date_of_death', format(date, 'yyyy-MM-dd'));
                          }
                          setDeathDateOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="place_of_death">
                  Place of Death <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="place_of_death"
                  value={formData.place_of_death}
                  onChange={(e) => handleInputChange('place_of_death', e.target.value)}
                  placeholder="e.g., Prison Hospital Ward A"
                  disabled={isReadOnly || loading}
                  className={isReadOnly ? 'bg-gray-50' : ''}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cause_of_death">
                Cause of Death <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="cause_of_death"
                value={formData.cause_of_death}
                onChange={(e) => handleInputChange('cause_of_death', e.target.value)}
                placeholder="Enter the primary cause of death..."
                rows={3}
                disabled={isReadOnly || loading}
                className={isReadOnly ? 'bg-gray-50' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="presumed_cause_of_death">Presumed Cause of Death</Label>
              <Textarea
                id="presumed_cause_of_death"
                value={formData.presumed_cause_of_death}
                onChange={(e) => handleInputChange('presumed_cause_of_death', e.target.value)}
                placeholder="Enter the initial/presumed cause of death before investigation..."
                rows={3}
                disabled={isReadOnly || loading}
                className={isReadOnly ? 'bg-gray-50' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actual_cause_of_death">Actual Cause of Death</Label>
              <Textarea
                id="actual_cause_of_death"
                value={formData.actual_cause_of_death}
                onChange={(e) => handleInputChange('actual_cause_of_death', e.target.value)}
                placeholder="Enter the confirmed/actual cause of death after post-mortem or investigation..."
                rows={3}
                disabled={isReadOnly || loading}
                className={isReadOnly ? 'bg-gray-50' : ''}
              />
            </div>
          </div>

          {/* Responsible Officers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Responsible Officers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="officer_in_charge">
                  Officer in Charge <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <Input
                    value={confirmation?.officer_in_charge_name || 'N/A'}
                    disabled
                    className="bg-gray-50"
                  />
                ) : (
                  officerInChargeSelectComponent
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="medial_officer">
                  Medical Officer <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <Input
                    value={confirmation?.medical_officer_name || 'N/A'}
                    disabled
                    className="bg-gray-50"
                  />
                ) : (
                  medicalOfficerSelectComponent
                )}
              </div>
            </div>
          </div>

          {/* Documents & Attachments */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Documents & Attachments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Death Certificate */}
              <div className="space-y-2">
                <Label htmlFor="death_certificate">Death Certificate</Label>
                {isReadOnly ? (
                  <div className="p-3 bg-gray-50 rounded border">
                    {formData.death_certificate ? (
                      <a
                        href={formData.death_certificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Document
                      </a>
                    ) : (
                      <span className="text-gray-500">No file uploaded</span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.death_certificate && !editingDoc.death_certificate ? (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded">
                        <ExternalLink className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <a
                          href={formData.death_certificate}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline truncate flex-1"
                          title={formData.death_certificate}
                        >
                          {formData.death_certificate.split('/').pop()?.substring(0, 30) || 'View Current Document'}
                        </a>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingDoc(prev => ({ ...prev, death_certificate: true }))}
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          disabled={loading}
                          title="Replace document"
                        >
                          Replace
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleInputChange('death_certificate', '');
                            setPendingFiles(prev => ({ ...prev, death_certificate: null }));
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={loading}
                          title="Remove document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : pendingFiles.death_certificate ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
                          <span className="text-sm text-green-900 truncate flex-1">
                            {pendingFiles.death_certificate.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPendingFiles(prev => ({ ...prev, death_certificate: null }));
                            }}
                            className="text-red-600 hover:text-red-700"
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-green-600">File ready to upload. Click Save to upload.</p>
                      </div>
                    ) : (
                      <>
                        <Input
                          type="file"
                          id="death_certificate"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('Death certificate file selected:', file.name);
                              setPendingFiles(prev => ({ ...prev, death_certificate: file }));
                              setEditingDoc(prev => ({ ...prev, death_certificate: false }));
                            }
                          }}
                          disabled={loading}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <p className="text-xs text-gray-500">Upload PDF, JPG, or PNG file</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Medical Form */}
              <div className="space-y-2">
                <Label htmlFor="medical_form">Medical Form</Label>
                {isReadOnly ? (
                  <div className="p-3 bg-gray-50 rounded border">
                    {formData.medical_form ? (
                      <a
                        href={formData.medical_form}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Document
                      </a>
                    ) : (
                      <span className="text-gray-500">No file uploaded</span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.medical_form && !editingDoc.medical_form ? (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded">
                        <ExternalLink className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <a
                          href={formData.medical_form}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline truncate flex-1"
                          title={formData.medical_form}
                        >
                          {formData.medical_form.split('/').pop()?.substring(0, 30) || 'View Current Document'}
                        </a>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingDoc(prev => ({ ...prev, medical_form: true }))}
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          disabled={loading}
                          title="Replace document"
                        >
                          Replace
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleInputChange('medical_form', '');
                            setPendingFiles(prev => ({ ...prev, medical_form: null }));
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={loading}
                          title="Remove document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : pendingFiles.medical_form ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
                          <span className="text-sm text-green-900 truncate flex-1">
                            {pendingFiles.medical_form.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPendingFiles(prev => ({ ...prev, medical_form: null }));
                            }}
                            className="text-red-600 hover:text-red-700"
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-green-600">File ready to upload. Click Save to upload.</p>
                      </div>
                    ) : (
                      <>
                        <Input
                          type="file"
                          id="medical_form"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('Medical form file selected:', file.name);
                              setPendingFiles(prev => ({ ...prev, medical_form: file }));
                              setEditingDoc(prev => ({ ...prev, medical_form: false }));
                            }
                          }}
                          disabled={loading}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <p className="text-xs text-gray-500">Upload PDF, JPG, or PNG file</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Pathologist Attachment */}
              <div className="space-y-2">
                <Label htmlFor="pathologist_attachment">Pathologist Attachment</Label>
                {isReadOnly ? (
                  <div className="p-3 bg-gray-50 rounded border">
                    {formData.pathologist_attachment ? (
                      <a
                        href={formData.pathologist_attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Document
                      </a>
                    ) : (
                      <span className="text-gray-500">No file uploaded</span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.pathologist_attachment && !editingDoc.pathologist_attachment ? (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded">
                        <ExternalLink className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <a
                          href={formData.pathologist_attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline truncate flex-1"
                          title={formData.pathologist_attachment}
                        >
                          {formData.pathologist_attachment.split('/').pop()?.substring(0, 30) || 'View Current Document'}
                        </a>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingDoc(prev => ({ ...prev, pathologist_attachment: true }))}
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          disabled={loading}
                          title="Replace document"
                        >
                          Replace
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleInputChange('pathologist_attachment', '');
                            setPendingFiles(prev => ({ ...prev, pathologist_attachment: null }));
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={loading}
                          title="Remove document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : pendingFiles.pathologist_attachment ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
                          <span className="text-sm text-green-900 truncate flex-1">
                            {pendingFiles.pathologist_attachment.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPendingFiles(prev => ({ ...prev, pathologist_attachment: null }));
                            }}
                            className="text-red-600 hover:text-red-700"
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-green-600">File ready to upload. Click Save to upload.</p>
                      </div>
                    ) : (
                      <>
                        <Input
                          type="file"
                          id="pathologist_attachment"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('Pathologist attachment file selected:', file.name);
                              setPendingFiles(prev => ({ ...prev, pathologist_attachment: file }));
                              setEditingDoc(prev => ({ ...prev, pathologist_attachment: false }));
                            }
                          }}
                          disabled={loading}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <p className="text-xs text-gray-500">Upload PDF, JPG, or PNG file</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Other Attachment */}
              <div className="space-y-2">
                <Label htmlFor="other_attachment">Other Attachment</Label>
                {isReadOnly ? (
                  <div className="p-3 bg-gray-50 rounded border">
                    {formData.other_attachment ? (
                      <a
                        href={formData.other_attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Document
                      </a>
                    ) : (
                      <span className="text-gray-500">No file uploaded</span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.other_attachment && !editingDoc.other_attachment ? (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded">
                        <ExternalLink className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <a
                          href={formData.other_attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline truncate flex-1"
                          title={formData.other_attachment}
                        >
                          {formData.other_attachment.split('/').pop()?.substring(0, 30) || 'View Current Document'}
                        </a>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingDoc(prev => ({ ...prev, other_attachment: true }))}
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          disabled={loading}
                          title="Replace document"
                        >
                          Replace
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleInputChange('other_attachment', '');
                            setPendingFiles(prev => ({ ...prev, other_attachment: null }));
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={loading}
                          title="Remove document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : pendingFiles.other_attachment ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
                          <span className="text-sm text-green-900 truncate flex-1">
                            {pendingFiles.other_attachment.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPendingFiles(prev => ({ ...prev, other_attachment: null }));
                            }}
                            className="text-red-600 hover:text-red-700"
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-green-600">File ready to upload. Click Save to upload.</p>
                      </div>
                    ) : (
                      <>
                        <Input
                          type="file"
                          id="other_attachment"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('Other attachment file selected:', file.name);
                              setPendingFiles(prev => ({ ...prev, other_attachment: file }));
                              setEditingDoc(prev => ({ ...prev, other_attachment: false }));
                            }
                          }}
                          disabled={loading}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <p className="text-xs text-gray-500">Upload PDF, JPG, or PNG file</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Additional Notes
            </h3>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter any additional notes, observations, or comments..."
                rows={4}
                disabled={isReadOnly || loading}
                className={isReadOnly ? 'bg-gray-50' : ''}
              />
            </div>
          </div>

          {/* Form Actions */}
          {!isReadOnly && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                style={{ backgroundColor: '#650000' }}
                className="text-white hover:opacity-90"
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
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

export default DeathConfirmationForm;
