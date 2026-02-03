import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import OffencesCommittedForm from "./OffencesCommittedForm";

interface OffenceCommitted {
  id: string;
  offence_name: string;
  reported_by_staff_name: string;
  reported_by_staff_force_number: string;
  recorded_by_name: string;
  recorded_by_force_number: string;
  remarks: string;
  place_of_offence: string;
  complainant: string;
  particulars_of_offence: string;
  offence_date: string;
  punishment_book: string;
  disciplinary_offence: string;
  reported_by_staff: string;
  reported_by_prisoner: string;
  recorded_by: string;
  rules_and_regulations: string;
}

export default function OffencesCommittedList() {
  const [offences, setOffences] = useState<OffenceCommitted[]>([]);
  const [filteredOffences, setFilteredOffences] = useState<OffenceCommitted[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOffence, setSelectedOffence] = useState<OffenceCommitted | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOffences();
  }, []);

  useEffect(() => {
    filterOffences();
  }, [searchTerm, offences]);

  const fetchOffences = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/disciplinary-management/api/offences-committed/');
      // const data = await response.json();
      // setOffences(data.results);
      
      // Mock data
      const mockData: OffenceCommitted[] = [
        {
          id: "1",
          offence_name: "Insubordination",
          reported_by_staff_name: "Officer Brown",
          reported_by_staff_force_number: "PF11111",
          recorded_by_name: "Officer Green",
          recorded_by_force_number: "PF22222",
          remarks: "Verbal altercation with staff",
          place_of_offence: "Cell Block A",
          complainant: "Officer Brown",
          particulars_of_offence: "Refused to follow direct orders",
          offence_date: "2025-11-20T10:30:00Z",
          punishment_book: "pb-1",
          disciplinary_offence: "off-1",
          reported_by_staff: "staff-1",
          reported_by_prisoner: "",
          recorded_by: "staff-2",
          rules_and_regulations: "rule-1",
        },
        {
          id: "2",
          offence_name: "Fighting",
          reported_by_staff_name: "Officer White",
          reported_by_staff_force_number: "PF33333",
          recorded_by_name: "Officer Black",
          recorded_by_force_number: "PF44444",
          remarks: "Physical altercation with another inmate",
          place_of_offence: "Recreation Yard",
          complainant: "Officer White",
          particulars_of_offence: "Engaged in physical fight during recreation time",
          offence_date: "2025-11-21T14:15:00Z",
          punishment_book: "pb-2",
          disciplinary_offence: "off-2",
          reported_by_staff: "staff-3",
          reported_by_prisoner: "",
          recorded_by: "staff-4",
          rules_and_regulations: "rule-2",
        },
      ];
      setOffences(mockData);
    } catch (error) {
      console.error("Error fetching offences:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterOffences = () => {
    if (!searchTerm) {
      setFilteredOffences(offences);
      return;
    }

    const filtered = offences.filter(
      (offence) =>
        offence.offence_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offence.reported_by_staff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offence.place_of_offence.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOffences(filtered);
  };

  const handleAdd = () => {
    setSelectedOffence(null);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (offence: OffenceCommitted) => {
    setSelectedOffence(offence);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleView = (offence: OffenceCommitted) => {
    setSelectedOffence(offence);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this offence record?")) {
      try {
        // TODO: Replace with actual API call
        // await fetch(`/api/disciplinary-management/api/offences-committed/${id}/`, {
        //   method: 'DELETE',
        // });
        setOffences(offences.filter((offence) => offence.id !== id));
      } catch (error) {
        console.error("Error deleting offence:", error);
      }
    }
  };

  const handleSave = async (data: Partial<OffenceCommitted>) => {
    try {
      if (selectedOffence) {
        // Update existing
        // TODO: Replace with actual API call
        setOffences(
          offences.map((offence) =>
            offence.id === selectedOffence.id ? { ...offence, ...data } : offence
          )
        );
      } else {
        // Create new
        // TODO: Replace with actual API call
        const newOffence = { id: Date.now().toString(), ...data } as OffenceCommitted;
        setOffences([...offences, newOffence]);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving offence:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Offences Committed</h1>
        <p className="text-muted-foreground">
          Manage and track disciplinary offences committed by prisoners
        </p>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
              <Input
                placeholder="Search by offence name, staff name, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="size-4" />
              Add Offence
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Offences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{offences.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{filteredOffences.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {offences.filter(o => new Date(o.offence_date).getMonth() === new Date().getMonth()).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  <TableHead className="text-white font-bold">Offence</TableHead>
                  <TableHead className="text-white font-bold">Date</TableHead>
                  <TableHead className="text-white font-bold">Location</TableHead>
                  <TableHead className="text-white font-bold">Reported By</TableHead>
                  <TableHead className="text-white font-bold">Complainant</TableHead>
                  <TableHead className="text-white font-bold">Particulars</TableHead>
                  <TableHead className="text-white font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredOffences.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No offences found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOffences.map((offence) => (
                    <TableRow key={offence.id}>
                      <TableCell>
                        <Badge variant="destructive">{offence.offence_name}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(offence.offence_date)}</TableCell>
                      <TableCell>{offence.place_of_offence}</TableCell>
                      <TableCell>
                        <div>
                          <div>{offence.reported_by_staff_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {offence.reported_by_staff_force_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{offence.complainant}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {offence.particulars_of_offence}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(offence)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(offence)}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(offence.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[1400px] max-h-[90vh] overflow-y-auto resize">
          <DialogHeader>
            <DialogTitle>
              {isViewMode
                ? "View Offence Details"
                : selectedOffence
                ? "Edit Offence"
                : "Add New Offence"}
            </DialogTitle>
          </DialogHeader>
          <OffencesCommittedForm
            data={selectedOffence}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
            isViewMode={isViewMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
