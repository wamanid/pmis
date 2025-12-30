import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import {ChildItem, Handover} from "../../../services/discharge/discharge";
import {RelationShipItem} from "../../../services/stationServices/visitorsServices/VisitorsService";
import {toast} from "sonner";

interface DischargeChildHandoverFormProps {
  children: ChildItem
  relationships: RelationShipItem
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const DischargeChildHandoverForm: React.FC<DischargeChildHandoverFormProps> = ({
  children, relationships,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Handover>({
    is_active: true,
    deleted_datetime: null,
    custodian: "",
    contact_of_custodian: "",
    datetime_of_handover: new Date().toISOString(),
    reason_for_handover: "",
    physical_condition: "",
    probation_report: "",
    age_at_handover: 0,
    remarks: "",
    deleted_by: null,
    child: "",
    custodian_relation_to_prisoner: "",
  });

  useEffect(() => {
    if (!relationships.length){
      toast.error("There are no relationships, please first add the relationship types to continue")
      onCancel()
    }
  }, [relationships]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="child">Child *</Label>
          <Select value={formData.child} onValueChange={(value) => {
            handleChange('child', value);
          }}>
            <SelectTrigger><SelectValue placeholder="Select child" /></SelectTrigger>
            <SelectContent>
              {
                children.map(child => (
                    <SelectItem key={child.id} value={child.id}>{child.name} (Mother: {child.mothers_name})</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="custodian">Custodian Name *</Label>
          <Input
            id="custodian"
            value={formData.custodian}
            onChange={(e) => handleChange('custodian', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="contact_of_custodian">Custodian Contact *</Label>
          <Input
            id="contact_of_custodian"
            type="tel"
            value={formData.contact_of_custodian}
            onChange={(e) => handleChange('contact_of_custodian', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="custodian_relation_to_prisoner">Relationship to Prisoner *</Label>
          <Select value={formData.custodian_relation_to_prisoner} onValueChange={(value) => {
            handleChange('custodian_relation_to_prisoner', value);
          }}>
            <SelectTrigger><SelectValue placeholder="Select relationship" /></SelectTrigger>
            <SelectContent>
              {
                relationships.map(rel => (
                    <SelectItem key={rel.id} value={rel.id}>{rel.name}</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="age_at_handover">Age at Handover (months) *</Label>
          <Input
            id="age_at_handover"
            type="number"
            value={formData.age_at_handover}
            onChange={(e) => handleChange('age_at_handover', parseInt(e.target.value))}
            required
          />
        </div>

        <div>
          <Label htmlFor="datetime_of_handover">Handover Date & Time *</Label>
          <Input
            id="datetime_of_handover"
            type="datetime-local"
            value={formData.datetime_of_handover.slice(0, 16)}
            onChange={(e) => handleChange('datetime_of_handover', e.target.value + ':00Z')}
            required
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="reason_for_handover">Reason for Handover</Label>
          <Textarea
            id="reason_for_handover"
            value={formData.reason_for_handover}
            onChange={(e) => handleChange('reason_for_handover', e.target.value)}
            rows={2}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="physical_condition">Physical Condition</Label>
          <Textarea
            id="physical_condition"
            value={formData.physical_condition}
            onChange={(e) => handleChange('physical_condition', e.target.value)}
            rows={2}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="probation_report">Probation Report</Label>
          <Textarea
            id="probation_report"
            value={formData.probation_report}
            onChange={(e) => handleChange('probation_report', e.target.value)}
            rows={2}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea
            id="remarks"
            value={formData.remarks}
            onChange={(e) => handleChange('remarks', e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initialData ? 'Update' : 'Create'} Handover</Button>
      </div>
    </form>
  );
};
