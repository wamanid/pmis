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

interface PunishmentBookFormProps {
  data?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isViewMode?: boolean;
}

export default function PunishmentBookForm({
  data,
  onSave,
  onCancel,
  isViewMode = false,
}: PunishmentBookFormProps) {
  const [formData, setFormData] = useState({
    prisoner_name: "",
    staff_name: "",
    staff_force_number: "",
    staff_rank: "",
    medic_directions: "",
    prisoner: "",
    staff_authority: "",
  });

  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
    fetchPrisoners();
    fetchStaff();
  }, [data]);

  const fetchPrisoners = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/admission/api/prisoner-records/');
      // const data = await response.json();
      // setPrisoners(data.results);
      
      setPrisoners([
        { id: "prisoner-1", name: "John Doe", prison_number: "P001" },
        { id: "prisoner-2", name: "Jane Wilson", prison_number: "P002" },
      ]);
    } catch (error) {
      console.error("Error fetching prisoners:", error);
    }
  };

  const fetchStaff = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/staff-profiles/');
      // const data = await response.json();
      // setStaff(data.results);
      
      setStaff([
        { id: "staff-1", name: "Officer Smith", force_number: "PF12345", rank: "Sergeant" },
        { id: "staff-2", name: "Officer Johnson", force_number: "PF67890", rank: "Lieutenant" },
      ]);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePrisonerChange = (value: string) => {
    const prisoner = prisoners.find((p) => p.id === value);
    if (prisoner) {
      setFormData((prev) => ({
        ...prev,
        prisoner: value,
        prisoner_name: prisoner.name,
      }));
    }
  };

  const handleStaffChange = (value: string) => {
    const staffMember = staff.find((s) => s.id === value);
    if (staffMember) {
      setFormData((prev) => ({
        ...prev,
        staff_authority: value,
        staff_name: staffMember.name,
        staff_force_number: staffMember.force_number,
        staff_rank: staffMember.rank,
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
        {/* Prisoner Selection */}
        <div className="space-y-2">
          <Label htmlFor="prisoner">Prisoner *</Label>
          <Select
            value={formData.prisoner}
            onValueChange={handlePrisonerChange}
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

        {/* Prisoner Name (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="prisoner_name">Prisoner Name</Label>
          <Input
            id="prisoner_name"
            value={formData.prisoner_name}
            disabled
            className="bg-gray-50"
          />
        </div>

        {/* Staff Authority Selection */}
        <div className="space-y-2">
          <Label htmlFor="staff_authority">Staff Authority *</Label>
          <Select
            value={formData.staff_authority}
            onValueChange={handleStaffChange}
            disabled={isViewMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select staff" />
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

        {/* Staff Force Number (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="staff_force_number">Force Number</Label>
          <Input
            id="staff_force_number"
            value={formData.staff_force_number}
            disabled
            className="bg-gray-50"
          />
        </div>

        {/* Staff Rank (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="staff_rank">Rank</Label>
          <Input
            id="staff_rank"
            value={formData.staff_rank}
            disabled
            className="bg-gray-50"
          />
        </div>
      </div>

      {/* Medic Directions */}
      <div className="space-y-2">
        <Label htmlFor="medic_directions">Medic Directions</Label>
        <Textarea
          id="medic_directions"
          value={formData.medic_directions}
          onChange={(e) => handleChange("medic_directions", e.target.value)}
          disabled={isViewMode}
          rows={4}
          placeholder="Enter medical directions or requirements..."
        />
      </div>

      {/* Form Actions */}
      {!isViewMode && (
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Punishment Book</Button>
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
