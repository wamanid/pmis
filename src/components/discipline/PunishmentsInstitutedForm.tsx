import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface PunishmentsInstitutedFormProps {
  data?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isViewMode?: boolean;
}

export default function PunishmentsInstitutedForm({
  data,
  onSave,
  onCancel,
  isViewMode = false,
}: PunishmentsInstitutedFormProps) {
  const [formData, setFormData] = useState({
    punishment_name: "",
    staff_name: "",
    staff_force_number: "",
    staff_rank: "",
    start_datetime: "",
    end_datetime: "",
    diet: "",
    duration: 0,
    monetary_value: "",
    commissioner_general: "",
    remarks: "",
    offence: "",
    disciplinary_punishment: "",
    stage: "",
    earning_grade: "",
    staff: "",
  });

  const [offences, setOffences] = useState<any[]>([]);
  const [punishments, setPunishments] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
    fetchDropdownData();
  }, [data]);

  const fetchDropdownData = async () => {
    try {
      // TODO: Replace with actual API calls
      setOffences([
        { id: "off-1", name: "Insubordination" },
        { id: "off-2", name: "Fighting" },
      ]);
      
      setPunishments([
        { id: "pun-1", name: "Solitary Confinement" },
        { id: "pun-2", name: "Loss of Privileges" },
        { id: "pun-3", name: "Extra Duties" },
      ]);
      
      setStages([
        { id: "stage-1", name: "Stage 1" },
        { id: "stage-2", name: "Stage 2" },
        { id: "stage-3", name: "Stage 3" },
      ]);
      
      setGrades([
        { id: "grade-1", name: "Grade A" },
        { id: "grade-2", name: "Grade B" },
        { id: "grade-3", name: "Grade C" },
      ]);
      
      setStaff([
        { id: "staff-1", name: "Officer Brown", force_number: "PF11111", rank: "Captain" },
        { id: "staff-2", name: "Officer White", force_number: "PF22222", rank: "Lieutenant" },
      ]);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePunishmentChange = (value: string) => {
    const punishment = punishments.find((p) => p.id === value);
    if (punishment) {
      setFormData((prev) => ({
        ...prev,
        disciplinary_punishment: value,
        punishment_name: punishment.name,
      }));
    }
  };

  const handleStaffChange = (value: string) => {
    const staffMember = staff.find((s) => s.id === value);
    if (staffMember) {
      setFormData((prev) => ({
        ...prev,
        staff: value,
        staff_name: staffMember.name,
        staff_force_number: staffMember.force_number,
        staff_rank: staffMember.rank,
      }));
    }
  };

  const calculateDuration = () => {
    if (formData.start_datetime && formData.end_datetime) {
      const start = new Date(formData.start_datetime);
      const end = new Date(formData.end_datetime);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setFormData((prev) => ({ ...prev, duration: diffDays }));
    }
  };

  useEffect(() => {
    calculateDuration();
  }, [formData.start_datetime, formData.end_datetime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isViewMode) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Offence */}
        <div className="space-y-2">
          <Label htmlFor="offence">Offence *</Label>
          <Select
            value={formData.offence}
            onValueChange={(value) => handleChange("offence", value)}
            disabled={isViewMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select offence" />
            </SelectTrigger>
            <SelectContent>
              {offences.map((offence) => (
                <SelectItem key={offence.id} value={offence.id}>
                  {offence.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Disciplinary Punishment */}
        <div className="space-y-2">
          <Label htmlFor="disciplinary_punishment">Punishment Type *</Label>
          <Select
            value={formData.disciplinary_punishment}
            onValueChange={handlePunishmentChange}
            disabled={isViewMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select punishment" />
            </SelectTrigger>
            <SelectContent>
              {punishments.map((punishment) => (
                <SelectItem key={punishment.id} value={punishment.id}>
                  {punishment.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Staff */}
        <div className="space-y-2">
          <Label htmlFor="staff">Authorizing Staff *</Label>
          <Select
            value={formData.staff}
            onValueChange={handleStaffChange}
            disabled={isViewMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select staff member" />
            </SelectTrigger>
            <SelectContent>
              {staff.map((staffMember) => (
                <SelectItem key={staffMember.id} value={staffMember.id}>
                  {staffMember.name} ({staffMember.force_number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Staff Name (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="staff_name">Staff Name</Label>
          <Input
            id="staff_name"
            value={formData.staff_name}
            disabled
            className="bg-gray-50"
          />
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="start_datetime">Start Date *</Label>
          <Input
            id="start_datetime"
            type="datetime-local"
            value={formData.start_datetime ? formData.start_datetime.slice(0, 16) : ""}
            onChange={(e) => handleChange("start_datetime", e.target.value)}
            disabled={isViewMode}
          />
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label htmlFor="end_datetime">End Date *</Label>
          <Input
            id="end_datetime"
            type="datetime-local"
            value={formData.end_datetime ? formData.end_datetime.slice(0, 16) : ""}
            onChange={(e) => handleChange("end_datetime", e.target.value)}
            disabled={isViewMode}
          />
        </div>

        {/* Duration (auto-calculated) */}
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (days)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            disabled
            className="bg-gray-50"
          />
        </div>

        {/* Diet */}
        <div className="space-y-2">
          <Label htmlFor="diet">Diet</Label>
          <Input
            id="diet"
            value={formData.diet}
            onChange={(e) => handleChange("diet", e.target.value)}
            disabled={isViewMode}
            placeholder="e.g., Regular, Restricted, Special"
          />
        </div>

        {/* Monetary Value */}
        <div className="space-y-2">
          <Label htmlFor="monetary_value">Monetary Value</Label>
          <Input
            id="monetary_value"
            value={formData.monetary_value}
            onChange={(e) => handleChange("monetary_value", e.target.value)}
            disabled={isViewMode}
            placeholder="Enter amount if applicable"
          />
        </div>

        {/* Stage */}
        <div className="space-y-2">
          <Label htmlFor="stage">Stage</Label>
          <Select
            value={formData.stage}
            onValueChange={(value) => handleChange("stage", value)}
            disabled={isViewMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              {stages.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Earning Grade */}
        <div className="space-y-2">
          <Label htmlFor="earning_grade">Earning Grade</Label>
          <Select
            value={formData.earning_grade}
            onValueChange={(value) => handleChange("earning_grade", value)}
            disabled={isViewMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select earning grade" />
            </SelectTrigger>
            <SelectContent>
              {grades.map((grade) => (
                <SelectItem key={grade.id} value={grade.id}>
                  {grade.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Commissioner General */}
        <div className="space-y-2">
          <Label htmlFor="commissioner_general">Commissioner General Approval</Label>
          <Input
            id="commissioner_general"
            value={formData.commissioner_general}
            onChange={(e) => handleChange("commissioner_general", e.target.value)}
            disabled={isViewMode}
            placeholder="e.g., Approved, Pending, Denied"
          />
        </div>
      </div>

      {/* Remarks */}
      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          value={formData.remarks}
          onChange={(e) => handleChange("remarks", e.target.value)}
          disabled={isViewMode}
          rows={4}
          placeholder="Additional remarks or notes..."
        />
      </div>

      {/* Form Actions */}
      {!isViewMode && (
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Punishment</Button>
        </div>
      )}

      {isViewMode && (
        <div className="flex justify-end">
          <Button type="button" onClick={onCancel}>
            Close
          </Button>
        </div>
      )}
    </form>
  );
}
