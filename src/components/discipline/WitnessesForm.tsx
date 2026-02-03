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

interface WitnessesFormProps {
  data?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isViewMode?: boolean;
}

export default function WitnessesForm({
  data,
  onSave,
  onCancel,
  isViewMode = false,
}: WitnessesFormProps) {
  const [formData, setFormData] = useState({
    witness_type_name: "",
    witness_name: "",
    external_witness: "",
    cross_examination: "",
    cross_examination_document: "",
    description: "",
    disciplinary_proceedings: "",
    witness_type: "",
    prisoner_witness: "",
    staff_witness: "",
  });

  const [proceedings, setProceedings] = useState<any[]>([]);
  const [witnessTypes, setWitnessTypes] = useState<any[]>([]);
  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
    fetchDropdownData();
  }, [data]);

  const fetchDropdownData = async () => {
    try {
      setProceedings([
        { id: "proc-1", offence_name: "Insubordination" },
        { id: "proc-2", offence_name: "Fighting" },
      ]);
      
      setWitnessTypes([
        { id: "type-1", name: "Staff" },
        { id: "type-2", name: "Prisoner" },
        { id: "type-3", name: "External" },
      ]);
      
      setPrisoners([
        { id: "prisoner-1", name: "John Doe", prison_number: "P001" },
        { id: "prisoner-2", name: "Jane Wilson", prison_number: "P002" },
        { id: "prisoner-3", name: "Michael Johnson", prison_number: "P003" },
      ]);
      
      setStaff([
        { id: "staff-1", name: "Officer Brown", force_number: "PF11111" },
        { id: "staff-2", name: "Officer White", force_number: "PF22222" },
      ]);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleWitnessTypeChange = (value: string) => {
    const witnessType = witnessTypes.find((w) => w.id === value);
    if (witnessType) {
      setFormData((prev) => ({
        ...prev,
        witness_type: value,
        witness_type_name: witnessType.name,
        // Reset witness selection fields when type changes
        prisoner_witness: "",
        staff_witness: "",
        external_witness: "",
        witness_name: "",
      }));
    }
  };

  const handlePrisonerWitnessChange = (value: string) => {
    const prisoner = prisoners.find((p) => p.id === value);
    if (prisoner) {
      setFormData((prev) => ({
        ...prev,
        prisoner_witness: value,
        witness_name: prisoner.name,
      }));
    }
  };

  const handleStaffWitnessChange = (value: string) => {
    const staffMember = staff.find((s) => s.id === value);
    if (staffMember) {
      setFormData((prev) => ({
        ...prev,
        staff_witness: value,
        witness_name: staffMember.name,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isViewMode) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Disciplinary Proceedings */}
        <div className="space-y-2">
          <Label htmlFor="disciplinary_proceedings">Disciplinary Proceedings *</Label>
          <Select
            value={formData.disciplinary_proceedings}
            onValueChange={(value) => handleChange("disciplinary_proceedings", value)}
            disabled={isViewMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select proceeding" />
            </SelectTrigger>
            <SelectContent>
              {proceedings.map((proceeding) => (
                <SelectItem key={proceeding.id} value={proceeding.id}>
                  {proceeding.offence_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Witness Type */}
        <div className="space-y-2">
          <Label htmlFor="witness_type">Witness Type *</Label>
          <Select
            value={formData.witness_type}
            onValueChange={handleWitnessTypeChange}
            disabled={isViewMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select witness type" />
            </SelectTrigger>
            <SelectContent>
              {witnessTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Conditional Witness Selection based on Type */}
        {formData.witness_type_name === "Staff" && (
          <div className="space-y-2">
            <Label htmlFor="staff_witness">Staff Witness *</Label>
            <Select
              value={formData.staff_witness}
              onValueChange={handleStaffWitnessChange}
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
        )}

        {formData.witness_type_name === "Prisoner" && (
          <div className="space-y-2">
            <Label htmlFor="prisoner_witness">Prisoner Witness *</Label>
            <Select
              value={formData.prisoner_witness}
              onValueChange={handlePrisonerWitnessChange}
              disabled={isViewMode}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select prisoner" />
              </SelectTrigger>
              <SelectContent>
                {prisoners.map((prisoner) => (
                  <SelectItem key={prisoner.id} value={prisoner.id}>
                    {prisoner.name} ({prisoner.prison_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {formData.witness_type_name === "External" && (
          <div className="space-y-2">
            <Label htmlFor="external_witness">External Witness Details *</Label>
            <Input
              id="external_witness"
              value={formData.external_witness}
              onChange={(e) => handleChange("external_witness", e.target.value)}
              disabled={isViewMode}
              placeholder="e.g., Medical Professional, Expert, etc."
            />
          </div>
        )}

        {formData.witness_type_name === "External" && (
          <div className="space-y-2">
            <Label htmlFor="witness_name">Witness Name *</Label>
            <Input
              id="witness_name"
              value={formData.witness_name}
              onChange={(e) => handleChange("witness_name", e.target.value)}
              disabled={isViewMode}
              placeholder="Enter external witness name"
            />
          </div>
        )}

        {/* Cross Examination Document */}
        <div className="space-y-2">
          <Label htmlFor="cross_examination_document">Cross Examination Document</Label>
          <Input
            id="cross_examination_document"
            value={formData.cross_examination_document}
            onChange={(e) => handleChange("cross_examination_document", e.target.value)}
            disabled={isViewMode}
            placeholder="Document filename or reference"
          />
        </div>
      </div>

      {/* Cross Examination */}
      <div className="space-y-2">
        <Label htmlFor="cross_examination">Cross Examination Details</Label>
        <Textarea
          id="cross_examination"
          value={formData.cross_examination}
          onChange={(e) => handleChange("cross_examination", e.target.value)}
          disabled={isViewMode}
          rows={4}
          placeholder="Details of cross examination testimony..."
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          disabled={isViewMode}
          rows={3}
          placeholder="Additional description or notes..."
        />
      </div>

      {/* Form Actions */}
      {!isViewMode && (
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Witness</Button>
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
