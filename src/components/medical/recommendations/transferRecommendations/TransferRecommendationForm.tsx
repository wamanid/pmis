import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeftRight, Save, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Prisoner {
  id: string;
  prisoner_number: string;
  full_name: string;
}

interface TransferRecommendationReason {
  id: string;
  name: string;
  description?: string;
}

interface Station {
  id: string;
  name: string;
  region?: string;
  district?: string;
}

interface Hospital {
  id: string;
  name: string;
  location?: string;
  type?: string;
}

interface ReferralCategory {
  id: string;
  name: string;
  description?: string;
}

interface TransferRecommendation {
  id?: string;
  prisoner_name?: string;
  prisoner_number?: string;
  reason_name?: string;
  station_name?: string;
  hospital_name?: string;
  category_name?: string;
  recommendation_notes: string;
  prisoner: string;
  reason_for_recommendation: string;
  recommended_station: string;
  refferal_hospital: string; // Note: API has typo "refferal"
  referral_category: string;
}

interface TransferRecommendationFormProps {
  recommendation?: TransferRecommendation | null;
  onSubmit: (recommendation: TransferRecommendation) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const TransferRecommendationForm: React.FC<TransferRecommendationFormProps> = ({ recommendation, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState<TransferRecommendation>({
    recommendation_notes: '',
    prisoner: '',
    reason_for_recommendation: '',
    recommended_station: '',
    refferal_hospital: '',
    referral_category: '',
  });

  const [prisoners, setPrisoners] = useState<Prisoner[]>([]);
  const [reasons, setReasons] = useState<TransferRecommendationReason[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [categories, setCategories] = useState<ReferralCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (recommendation && dataLoaded) {
      setFormData(recommendation);
    }
  }, [recommendation, dataLoaded]);

  const loadDropdownData = () => {
    // Mock Prisoners
    setPrisoners([
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', prisoner_number: 'PR-2024-001', full_name: 'John Doe' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa7', prisoner_number: 'PR-2024-002', full_name: 'Jane Smith' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa8', prisoner_number: 'PR-2024-003', full_name: 'Michael Johnson' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa9', prisoner_number: 'PR-2024-004', full_name: 'Emily Davis' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afaa', prisoner_number: 'PR-2024-005', full_name: 'Robert Lee' },
    ]);

    // Mock Transfer Recommendation Reasons
    setReasons([
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb1', name: 'Critical Medical Condition', description: 'Life-threatening condition requiring specialized care' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb2', name: 'Specialized Treatment Required', description: 'Condition requires expertise not available at current facility' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb3', name: 'Surgical Intervention', description: 'Patient requires surgery' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb4', name: 'Psychiatric Evaluation', description: 'Mental health assessment needed' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb5', name: 'Diagnostic Testing', description: 'Advanced diagnostic procedures required' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb6', name: 'Infectious Disease Control', description: 'Isolation or specialized infectious disease care' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb7', name: 'Chronic Disease Management', description: 'Long-term specialized care needed' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb8', name: 'Rehabilitation Services', description: 'Physical or occupational therapy required' },
    ]);

    // Mock Stations
    setStations([
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc1', name: 'Luzira Maximum Security Prison', region: 'Central', district: 'Kampala' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc2', name: 'Kigo Prison', region: 'Central', district: 'Wakiso' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc3', name: 'Murchison Bay Prison', region: 'Central', district: 'Kampala' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc4', name: 'Gulu Main Prison', region: 'Northern', district: 'Gulu' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc5', name: 'Mbarara Main Prison', region: 'Western', district: 'Mbarara' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc6', name: 'Kitalya Prison', region: 'Central', district: 'Wakiso' },
    ]);

    // Mock Hospitals
    setHospitals([
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afd1', name: 'Mulago National Referral Hospital', location: 'Kampala', type: 'National Referral' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afd2', name: 'Butabika National Psychiatric Hospital', location: 'Kampala', type: 'Specialized Psychiatric' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afd3', name: 'Mbarara Regional Referral Hospital', location: 'Mbarara', type: 'Regional Referral' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afd4', name: 'Gulu Regional Referral Hospital', location: 'Gulu', type: 'Regional Referral' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afd5', name: 'Kampala International Hospital', location: 'Kampala', type: 'Private' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afd6', name: 'Nakasero Hospital', location: 'Kampala', type: 'Private' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afd7', name: 'Kiruddu National Referral Hospital', location: 'Kampala', type: 'National Referral' },
    ]);

    // Mock Referral Categories
    setCategories([
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afe1', name: 'Emergency', description: 'Immediate medical attention required' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afe2', name: 'Urgent', description: 'Needs attention within 24-48 hours' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afe3', name: 'Routine', description: 'Scheduled transfer for regular care' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afe4', name: 'Elective', description: 'Non-urgent planned procedures' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afe5', name: 'Follow-up', description: 'Continuing care or assessment' },
    ]);

    setDataLoaded(true);
  };

  const handleInputChange = (field: keyof TransferRecommendation, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.reason_for_recommendation) {
      toast.error('Please select a reason for recommendation');
      return;
    }
    if (!formData.recommended_station) {
      toast.error('Please select a recommended station');
      return;
    }
    if (!formData.refferal_hospital) {
      toast.error('Please select a referral hospital');
      return;
    }
    if (!formData.referral_category) {
      toast.error('Please select a referral category');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const selectedPrisoner = prisoners.find((p) => p.id === formData.prisoner);
      const selectedReason = reasons.find((r) => r.id === formData.reason_for_recommendation);
      const selectedStation = stations.find((s) => s.id === formData.recommended_station);
      const selectedHospital = hospitals.find((h) => h.id === formData.refferal_hospital);
      const selectedCategory = categories.find((c) => c.id === formData.referral_category);

      const submitData: TransferRecommendation = {
        ...formData,
        prisoner_name: selectedPrisoner?.full_name || '',
        prisoner_number: selectedPrisoner?.prisoner_number || '',
        reason_name: selectedReason?.name || '',
        station_name: selectedStation?.name || '',
        hospital_name: selectedHospital?.name || '',
        category_name: selectedCategory?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Transfer recommendation created successfully');
        setFormData({
          recommendation_notes: '',
          prisoner: '',
          reason_for_recommendation: '',
          recommended_station: '',
          refferal_hospital: '',
          referral_category: '',
        });
      } else {
        toast.success('Transfer recommendation updated successfully');
      }
    }, 500);
  };

  const isReadOnly = mode === 'view';

  // Get display values for view mode
  const getDisplayValue = (field: string, id: string) => {
    if (!id) return 'N/A';
    
    switch (field) {
      case 'prisoner':
        const prisoner = prisoners.find(p => p.id === id);
        return prisoner ? `${prisoner.prisoner_number} - ${prisoner.full_name}` : id;
      case 'reason_for_recommendation':
        const reason = reasons.find(r => r.id === id);
        return reason ? `${reason.name}` : id;
      case 'recommended_station':
        const station = stations.find(s => s.id === id);
        return station ? `${station.name} (${station.region}, ${station.district})` : id;
      case 'refferal_hospital':
        const hospital = hospitals.find(h => h.id === id);
        return hospital ? `${hospital.name} - ${hospital.type}` : id;
      case 'referral_category':
        const category = categories.find(c => c.id === id);
        return category ? `${category.name} - ${category.description}` : id;
      default:
        return id;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <ArrowLeftRight className="h-5 w-5" />
          {mode === 'create' && 'New Transfer Recommendation'}
          {mode === 'edit' && 'Edit Transfer Recommendation'}
          {mode === 'view' && 'View Transfer Recommendation'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Prisoner Information
            </h3>
            <div className="space-y-2">
              <Label htmlFor="prisoner">
                Prisoner <span className="text-red-500">*</span>
              </Label>
              {isReadOnly ? (
                <div className="p-2 bg-gray-50 rounded border">
                  {getDisplayValue('prisoner', formData.prisoner)}
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
                    {prisoners.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.prisoner_number} - {p.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Transfer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reason_for_recommendation">
                  Reason for Recommendation <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('reason_for_recommendation', formData.reason_for_recommendation)}
                  </div>
                ) : (
                  <Select
                    value={formData.reason_for_recommendation}
                    onValueChange={(value) => handleInputChange('reason_for_recommendation', value)}
                  >
                    <SelectTrigger id="reason_for_recommendation">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {reasons.map((reason) => (
                        <SelectItem key={reason.id} value={reason.id}>
                          {reason.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="referral_category">
                  Referral Category <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('referral_category', formData.referral_category)}
                  </div>
                ) : (
                  <Select
                    value={formData.referral_category}
                    onValueChange={(value) => handleInputChange('referral_category', value)}
                  >
                    <SelectTrigger id="referral_category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} - {category.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recommended_station">
                  Recommended Station <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('recommended_station', formData.recommended_station)}
                  </div>
                ) : (
                  <Select
                    value={formData.recommended_station}
                    onValueChange={(value) => handleInputChange('recommended_station', value)}
                  >
                    <SelectTrigger id="recommended_station">
                      <SelectValue placeholder="Select station" />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((station) => (
                        <SelectItem key={station.id} value={station.id}>
                          {station.name} ({station.region}, {station.district})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="refferal_hospital">
                  Referral Hospital <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('refferal_hospital', formData.refferal_hospital)}
                  </div>
                ) : (
                  <Select
                    value={formData.refferal_hospital}
                    onValueChange={(value) => handleInputChange('refferal_hospital', value)}
                  >
                    <SelectTrigger id="refferal_hospital">
                      <SelectValue placeholder="Select hospital" />
                    </SelectTrigger>
                    <SelectContent>
                      {hospitals.map((hospital) => (
                        <SelectItem key={hospital.id} value={hospital.id}>
                          {hospital.name} - {hospital.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Additional Notes
            </h3>
            <div className="space-y-2">
              <Label htmlFor="recommendation_notes">Recommendation Notes</Label>
              <Textarea
                id="recommendation_notes"
                value={formData.recommendation_notes}
                onChange={(e) => handleInputChange('recommendation_notes', e.target.value)}
                placeholder="Enter detailed notes about the transfer recommendation, medical condition, urgency, special requirements, etc..."
                rows={6}
                disabled={isReadOnly}
              />
            </div>
          </div>

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
                {loading ? 'Saving...' : mode === 'create' ? 'Create Recommendation' : 'Update Recommendation'}
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

export default TransferRecommendationForm;
