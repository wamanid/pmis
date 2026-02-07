import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Pill,
  User,
} from 'lucide-react';
import { format } from 'date-fns';
import { TreatmentPlan } from './TreatmentPlan.types';
import { mockTreatmentPlans } from './TreatmentPlan.mock';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../../ui/dialog';
import TreatmentPlanFormV2 from './TreatmentPlanFormV2';
import { toast } from 'sonner';

const TreatmentPlanList: React.FC = () => {
  const [treatmentPlans] = useState<TreatmentPlan[]>(mockTreatmentPlans);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPrisoners, setExpandedPrisoners] = useState<Set<string>>(
    new Set()
  );
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(
    new Set()
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlan | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  // Filter treatment plans
  const filteredPlans = treatmentPlans.filter(
    (plan) =>
      plan.prisoner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.prisoner_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.diagnosis_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.medications.some((med) =>
        med.medication_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Group treatment plans by prisoner
  const groupedPlans = useMemo(() => {
    const groups = new Map<string, TreatmentPlan[]>();
    
    filteredPlans.forEach((plan) => {
      const key = plan.prisoner_number || 'unknown';
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(plan);
    });

    // Sort treatment plans within each group by date (newest first)
    groups.forEach((plans) => {
      plans.sort((a, b) => 
        new Date(b.date_prescribed).getTime() - new Date(a.date_prescribed).getTime()
      );
    });

    return groups;
  }, [filteredPlans]);

  // Toggle prisoner group expand/collapse
  const togglePrisonerExpand = (prisonerNumber: string) => {
    const newExpanded = new Set(expandedPrisoners);
    if (newExpanded.has(prisonerNumber)) {
      newExpanded.delete(prisonerNumber);
    } else {
      newExpanded.add(prisonerNumber);
    }
    setExpandedPrisoners(newExpanded);
  };

  // Toggle individual treatment plan expand/collapse
  const togglePlanExpand = (planId: string) => {
    const newExpanded = new Set(expandedPlans);
    if (newExpanded.has(planId)) {
      newExpanded.delete(planId);
    } else {
      newExpanded.add(planId);
    }
    setExpandedPlans(newExpanded);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Discontinued':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format dosage for display
  const formatDosage = (med: any): string => {
    const parts = [];
    if (med.dosage_quantity) parts.push(med.dosage_quantity);
    if (med.dosage_frequency) parts.push(med.dosage_frequency);
    if (med.dosage_duration && med.dosage_duration_unit) {
      parts.push(`${med.dosage_duration} ${med.dosage_duration_unit}`);
    } else if (med.dosage_duration_unit && !med.dosage_duration) {
      parts.push(med.dosage_duration_unit);
    }
    return parts.join(', ');
  };

  // Handle create
  const handleCreate = () => {
    setSelectedPlan(null);
    setFormMode('create');
    setDialogOpen(true);
  };

  // Handle view
  const handleView = (plan: TreatmentPlan) => {
    setSelectedPlan(plan);
    setFormMode('view');
    setDialogOpen(true);
  };

  // Handle edit
  const handleEdit = (plan: TreatmentPlan) => {
    setSelectedPlan(plan);
    setFormMode('edit');
    setDialogOpen(true);
  };

  // Handle delete
  const handleDelete = (plan: TreatmentPlan) => {
    if (confirm(`Delete treatment plan for ${plan.prisoner_name}?`)) {
      toast.success('Treatment plan deleted successfully');
    }
  };

  // Handle form submit
  const handleFormSubmit = (plan: TreatmentPlan) => {
    if (formMode === 'create') {
      toast.success('Treatment plan created successfully');
    } else {
      toast.success('Treatment plan updated successfully');
    }
    setDialogOpen(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#650000' }}>
              Treatment Plans
            </h2>
            <p className="text-muted-foreground">
              Manage and track prisoner medical treatments and prescriptions
            </p>
          </div>
          <Button
            onClick={handleCreate}
            style={{ backgroundColor: '#650000' }}
            className="text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Treatment Plan
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by prisoner name, medication, or diagnosis..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Treatment Plans List */}
        <Card>
          <CardContent className="p-0">
            {groupedPlans.size === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Pill className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No treatment plans found</p>
                {searchTerm && (
                  <p className="text-sm mt-2">
                    Try adjusting your search criteria
                  </p>
                )}
              </div>
            ) : (
              <div className="divide-y">
                {Array.from(groupedPlans.entries()).map(([prisonerNumber, plans]) => {
                  const isPrisonerExpanded = expandedPrisoners.has(prisonerNumber);
                  const prisonerName = plans[0]?.prisoner_name || 'Unknown';
                  
                  // Calculate summary stats for this prisoner
                  const activeCount = plans.filter((p) => p.treatment_status === 'Active').length;
                  const completedCount = plans.filter((p) => p.treatment_status === 'Completed').length;
                  const discontinuedCount = plans.filter((p) => p.treatment_status === 'Discontinued').length;

                  return (
                    <div key={prisonerNumber}>
                      {/* Prisoner Group Header */}
                      <div 
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                        style={{ backgroundColor: isPrisonerExpanded ? '#f9fafb' : 'transparent' }}
                        onClick={() => togglePrisonerExpand(prisonerNumber)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePrisonerExpand(prisonerNumber);
                              }}
                            >
                              {isPrisonerExpanded ? (
                                <ChevronDown className="h-5 w-5" style={{ color: '#650000' }} />
                              ) : (
                                <ChevronRight className="h-5 w-5" style={{ color: '#650000' }} />
                              )}
                            </Button>

                            <User className="h-5 w-5" style={{ color: '#650000' }} />

                            <div className="flex-1">
                              <div className="font-semibold text-base">
                                {prisonerName} | {prisonerNumber}
                              </div>
                              <div className="text-sm text-muted-foreground mt-0.5">
                                {plans.length} treatment plan{plans.length !== 1 ? 's' : ''}
                                {activeCount > 0 && (
                                  <span className="ml-2 text-green-600">• {activeCount} active</span>
                                )}
                                {completedCount > 0 && (
                                  <span className="ml-2 text-blue-600">• {completedCount} completed</span>
                                )}
                                {discontinuedCount > 0 && (
                                  <span className="ml-2 text-gray-600">• {discontinuedCount} discontinued</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            Latest: {format(new Date(plans[0].date_prescribed), 'PP')}
                          </div>
                        </div>
                      </div>

                      {/* Individual Treatment Plans (shown when prisoner group is expanded) */}
                      {isPrisonerExpanded && (
                        <div className="bg-gray-50 border-t">
                          {plans.map((plan) => {
                            const isPlanExpanded = expandedPlans.has(plan.id);

                            return (
                              <div key={plan.id} className="border-b last:border-b-0 bg-white">
                                <div className="p-4 pl-16 hover:bg-gray-50">
                                  {/* Plan Header */}
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="p-0 h-5 w-5"
                                          onClick={() => togglePlanExpand(plan.id)}
                                        >
                                          {isPlanExpanded ? (
                                            <ChevronDown className="h-4 w-4 text-gray-600" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4 text-gray-600" />
                                          )}
                                        </Button>

                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-medium text-gray-600">
                                              {plan.case_book_reference || plan.id}
                                            </span>
                                            <span className="text-sm text-gray-400">|</span>
                                            <span className="text-sm text-muted-foreground">
                                              {format(new Date(plan.date_prescribed), 'PP')}
                                            </span>
                                            <span className="text-sm text-gray-400">|</span>
                                            <span className="text-sm text-muted-foreground">
                                              {plan.prescribed_by_name}
                                            </span>
                                          </div>

                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm font-medium">
                                              Diagnosis: {plan.diagnosis_name}
                                            </span>
                                            <Badge className={getStatusColor(plan.treatment_status)}>
                                              {plan.treatment_status}
                                            </Badge>
                                          </div>

                                          {/* Medication Summary (collapsed view) */}
                                          {!isPlanExpanded && (
                                            <div className="mt-2 space-y-1">
                                              {plan.medications.slice(0, 2).map((med) => (
                                                <div key={med.id} className="text-sm text-muted-foreground">
                                                  • {med.medication_name}, {formatDosage(med)}
                                                </div>
                                              ))}
                                              {plan.medications.length > 2 && (
                                                <div className="text-sm text-gray-500">
                                                  + {plan.medications.length - 2} more medication{plan.medications.length - 2 !== 1 ? 's' : ''}
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Expanded Medication Details */}
                                      {isPlanExpanded && (
                                        <div className="mt-4 ml-8 space-y-4">
                                          {/* Medications Table */}
                                          <div className="border rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                              <thead className="bg-gray-100 border-b">
                                                <tr>
                                                  <th className="text-left p-2 font-semibold">Medication</th>
                                                  <th className="text-left p-2 font-semibold">Type</th>
                                                  <th className="text-left p-2 font-semibold">Quantity</th>
                                                  <th className="text-left p-2 font-semibold">Dosage</th>
                                                  <th className="text-left p-2 font-semibold">Instructions</th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y">
                                                {plan.medications.map((med) => (
                                                  <tr key={med.id} className="hover:bg-gray-50">
                                                    <td className="p-2 font-medium">{med.medication_name}</td>
                                                    <td className="p-2 text-muted-foreground">{med.medication_type}</td>
                                                    <td className="p-2">
                                                      {med.is_quantifiable && med.quantity
                                                        ? `${med.quantity} ${med.quantity_unit}`
                                                        : '—'}
                                                    </td>
                                                    <td className="p-2">{formatDosage(med)}</td>
                                                    <td className="p-2 text-muted-foreground">
                                                      {med.additional_instructions || '—'}
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>

                                          {/* General Notes */}
                                          {plan.general_notes && (
                                            <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                                              <div className="text-xs font-semibold text-amber-800 mb-1">
                                                General Notes
                                              </div>
                                              <div className="text-sm text-amber-900">{plan.general_notes}</div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 ml-4">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleView(plan)}
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(plan)}
                                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(plan)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Active Treatments</div>
              <div className="text-2xl font-bold" style={{ color: '#650000' }}>
                {treatmentPlans.filter((p) => p.treatment_status === 'Active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Completed</div>
              <div className="text-2xl font-bold text-blue-600">
                {treatmentPlans.filter((p) => p.treatment_status === 'Completed').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Plans</div>
              <div className="text-2xl font-bold text-gray-600">
                {treatmentPlans.length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-6xl max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e: any) => e.preventDefault()}
        >
          <DialogTitle>
            {formMode === 'create' && 'Create New Treatment Plan'}
            {formMode === 'edit' && 'Edit Treatment Plan'}
            {formMode === 'view' && 'View Treatment Plan'}
          </DialogTitle>
          <DialogDescription>
            {formMode === 'create' &&
              'Add medications and dosage instructions for the patient treatment plan.'}
            {formMode === 'edit' && 'Modify the details of this treatment plan.'}
            {formMode === 'view' && 'View the complete treatment plan details.'}
          </DialogDescription>
          <TreatmentPlanFormV2
            treatmentPlan={selectedPlan || undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setDialogOpen(false)}
            mode={formMode}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TreatmentPlanList;
