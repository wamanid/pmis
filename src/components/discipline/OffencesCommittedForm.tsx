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

interface OffencesCommittedFormProps {
  data?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isViewMode?: boolean;
}

export default function OffencesCommittedForm({
  data,
  onSave,
  onCancel,
  isViewMode = false,
}: OffencesCommittedFormProps) {
  const [formData, setFormData] = useState({
    offence_name: "",
    reported_by_staff_name: "",
    reported_by_staff_force_number: "",
    recorded_by_name: "",
    recorded_by_force_number: "",
    remarks: "",
    place_of_offence: "",
    complainant: "",
    particulars_of_offence: "",
    offence_date: "",
    punishment_book: "",
    disciplinary_offence: "",
    reported_by_staff: "",
    reported_by_prisoner: "",
    recorded_by: "",
    rules_and_regulations: "",
  });

  const [punishmentBooks, setPunishmentBooks] = useState<any[]>([]);
  const [offences, setOffences] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
    fetchDropdownData();
  }, [data]);

  const fetchDropdownData = async () => {
    try {
      // TODO: Replace with actual API calls
      setPunishmentBooks([
        { id: "pb-1", prisoner_name: "John Doe" },
        { id: "pb-2", prisoner_name: "Jane Wilson" },
      ]);
      
      setOffences([
        { id: "off-1", name: "Insubordination" },
        { id: "off-2", name: "Fighting" },
        { id: "off-3", name: "Theft" },
      ]);
      
      setStaff([
        { id: "staff-1", name: "Officer Brown", force_number: "PF11111" },
        { id: "staff-2", name: "Officer Green", force_number: "PF22222" },
      ]);
      
      setPrisoners([
        { id: "prisoner-1", name: "John Doe", prison_number: "P001" },
        { id: "prisoner-2", name: "Jane Wilson", prison_number: "P002" },
      ]);
      
      setRules([
        { id: "rule-1", name: "Rule 45 - Conduct" },
        { id: "rule-2", name: "Rule 46 - Violence" },
      ]);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOffenceChange = (value: string) => {
    const offence = offences.find((o) => o.id === value);
    if (offence) {
      setFormData((prev) => ({
        ...prev,
        disciplinary_offence: value,
        offence_name: offence.name,
      }));
    }
  };

  const handleReportedByStaffChange = (value: string) => {
    const staffMember = staff.find((s) => s.id === value);
    if (staffMember) {
      setFormData((prev) => ({
        ...prev,
        reported_by_staff: value,
        reported_by_staff_name: staffMember.name,
        reported_by_staff_force_number: staffMember.force_number,
      }));
    }
  };

  const handleRecordedByChange = (value: string) => {
    const staffMember = staff.find((s) => s.id === value);
    if (staffMember) {
      setFormData((prev) => ({
        ...prev,
        recorded_by: value,
        recorded_by_name: staffMember.name,
        recorded_by_force_number: staffMember.force_number,
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
        {/* Punishment Book */}
        <div className="space-y-2">
          <Label htmlFor="punishment_book">Punishment Book *</Label>
          <Select
            value={formData.punishment_book}
            onValueChange={(value) => handleChange("punishment_book", value)}
            disabled={isViewMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select punishment book" />
            </SelectTrigger>
            <SelectContent>
              {punishmentBooks.map((book) => (
                <SelectItem key={book.id} value={book.id}>
                  {book.prisoner_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Disciplinary Offence */}
        <div className="space-y-2">
          <Label htmlFor="disciplinary_offence">Disciplinary Offence *</Label>
          <Select
            value={formData.disciplinary_offence}
            onValueChange={handleOffenceChange}
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

        {/* Offence Date */}
        <div className="space-y-2">
          <Label htmlFor="offence_date">Offence Date *</Label>
          <Input
            id="offence_date"
            type="datetime-local"
            value={formData.offence_date ? formData.offence_date.slice(0, 16) : ""}
            onChange={(e) => handleChange("offence_date", e.target.value)}
            disabled={isViewMode}
          />
        </div>

        {/* Place of Offence */}
        <div className="space-y-2">
          <Label htmlFor="place_of_offence">Place of Offence *</Label>
          <Input
            id="place_of_offence"
            value={formData.place_of_offence}
            onChange={(e) => handleChange("place_of_offence", e.target.value)}
            disabled={isViewMode}
            placeholder="Enter location where offence occurred"
          />
        </div>

        {/* Reported By Staff */}
        <div className="space-y-2">
          <Label htmlFor="reported_by_staff">Reported By (Staff)</Label>
          <Select
            value={formData.reported_by_staff}
            onValueChange={handleReportedByStaffChange}
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

        {/* Reported By Prisoner */}
        <div className="space-y-2">
          <Label htmlFor="reported_by_prisoner">Reported By (Prisoner)</Label>
          <Select
            value={formData.reported_by_prisoner}
            onValueChange={(value) => handleChange("reported_by_prisoner", value)}
            disabled={isViewMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select prisoner (optional)" />
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

        {/* Recorded By */}
        <div className="space-y-2">
          <Label htmlFor="recorded_by">Recorded By *</Label>
          <Select
            value={formData.recorded_by}
            onValueChange={handleRecordedByChange}
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

        {/* Rules and Regulations */}
        <div className="space-y-2">
          <Label htmlFor="rules_and_regulations">Rules and Regulations</Label>
          <Select
            value={formData.rules_and_regulations}
            onValueChange={(value) => handleChange("rules_and_regulations", value)}
            disabled={isViewMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select applicable rule" />
            </SelectTrigger>
            <SelectContent>
              {rules.map((rule) => (
                <SelectItem key={rule.id} value={rule.id}>
                  {rule.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Complainant */}
        <div className="space-y-2">
          <Label htmlFor="complainant">Complainant</Label>
          <Input
            id="complainant"
            value={formData.complainant}
            onChange={(e) => handleChange("complainant", e.target.value)}
            disabled={isViewMode}
            placeholder="Enter complainant name"
          />
        </div>
      </div>

      {/* Particulars of Offence */}
      <div className="space-y-2">
        <Label htmlFor="particulars_of_offence">Particulars of Offence *</Label>
        <Textarea
          id="particulars_of_offence"
          value={formData.particulars_of_offence}
          onChange={(e) => handleChange("particulars_of_offence", e.target.value)}
          disabled={isViewMode}
          rows={4}
          placeholder="Describe the offence in detail..."
        />
      </div>

      {/* Remarks */}
      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          value={formData.remarks}
          onChange={(e) => handleChange("remarks", e.target.value)}
          disabled={isViewMode}
          rows={3}
          placeholder="Additional remarks or notes..."
        />
      </div>

      {/* Form Actions */}
      {!isViewMode && (
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Offence</Button>
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
