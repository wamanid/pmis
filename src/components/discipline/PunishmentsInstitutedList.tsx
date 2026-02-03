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
import PunishmentsInstitutedForm from "./PunishmentsInstitutedForm";

interface PunishmentInstituted {
  id: string;
  punishment_name: string;
  staff_name: string;
  staff_force_number: string;
  staff_rank: string;
  start_datetime: string;
  end_datetime: string;
  diet: string;
  duration: number;
  monetary_value: string;
  commissioner_general: string;
  remarks: string;
  offence: string;
  disciplinary_punishment: string;
  stage: string;
  earning_grade: string;
  staff: string;
}

export default function PunishmentsInstitutedList() {
  const [punishments, setPunishments] = useState<PunishmentInstituted[]>([]);
  const [filteredPunishments, setFilteredPunishments] = useState<PunishmentInstituted[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPunishment, setSelectedPunishment] = useState<PunishmentInstituted | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPunishments();
  }, []);

  useEffect(() => {
    filterPunishments();
  }, [searchTerm, punishments]);

  const fetchPunishments = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/disciplinary-management/api/punishments-instituted/');
      // const data = await response.json();
      // setPunishments(data.results);
      
      // Mock data
      const mockData: PunishmentInstituted[] = [
        {
          id: "1",
          punishment_name: "Solitary Confinement",
          staff_name: "Officer Brown",
          staff_force_number: "PF11111",
          staff_rank: "Captain",
          start_datetime: "2025-11-20T08:00:00Z",
          end_datetime: "2025-11-27T08:00:00Z",
          diet: "Regular",
          duration: 7,
          monetary_value: "0",
          commissioner_general: "Approved",
          remarks: "Standard disciplinary action",
          offence: "off-1",
          disciplinary_punishment: "pun-1",
          stage: "stage-1",
          earning_grade: "grade-1",
          staff: "staff-1",
        },
        {
          id: "2",
          punishment_name: "Loss of Privileges",
          staff_name: "Officer White",
          staff_force_number: "PF22222",
          staff_rank: "Lieutenant",
          start_datetime: "2025-11-21T08:00:00Z",
          end_datetime: "2025-11-28T08:00:00Z",
          diet: "Restricted",
          duration: 14,
          monetary_value: "500",
          commissioner_general: "Pending",
          remarks: "Recreation privileges suspended",
          offence: "off-2",
          disciplinary_punishment: "pun-2",
          stage: "stage-2",
          earning_grade: "grade-2",
          staff: "staff-2",
        },
      ];
      setPunishments(mockData);
    } catch (error) {
      console.error("Error fetching punishments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterPunishments = () => {
    if (!searchTerm) {
      setFilteredPunishments(punishments);
      return;
    }

    const filtered = punishments.filter(
      (punishment) =>
        punishment.punishment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        punishment.staff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        punishment.staff_force_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPunishments(filtered);
  };

  const handleAdd = () => {
    setSelectedPunishment(null);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (punishment: PunishmentInstituted) => {
    setSelectedPunishment(punishment);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleView = (punishment: PunishmentInstituted) => {
    setSelectedPunishment(punishment);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this punishment record?")) {
      try {
        // TODO: Replace with actual API call
        // await fetch(`/api/disciplinary-management/api/punishments-instituted/${id}/`, {
        //   method: 'DELETE',
        // });
        setPunishments(punishments.filter((punishment) => punishment.id !== id));
      } catch (error) {
        console.error("Error deleting punishment:", error);
      }
    }
  };

  const handleSave = async (data: Partial<PunishmentInstituted>) => {
    try {
      if (selectedPunishment) {
        // Update existing
        // TODO: Replace with actual API call
        setPunishments(
          punishments.map((punishment) =>
            punishment.id === selectedPunishment.id ? { ...punishment, ...data } : punishment
          )
        );
      } else {
        // Create new
        // TODO: Replace with actual API call
        const newPunishment = { id: Date.now().toString(), ...data } as PunishmentInstituted;
        setPunishments([...punishments, newPunishment]);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving punishment:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return <Badge variant="secondary">Scheduled</Badge>;
    } else if (now > end) {
      return <Badge variant="outline">Completed</Badge>;
    } else {
      return <Badge className="bg-[#34D399]">Active</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Punishments Instituted</h1>
        <p className="text-muted-foreground">
          Manage and track instituted punishments for disciplinary offences
        </p>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
              <Input
                placeholder="Search by punishment name, staff name, or force number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="size-4" />
              Add Punishment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Punishments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{punishments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {punishments.filter(p => {
                const now = new Date();
                const start = new Date(p.start_datetime);
                const end = new Date(p.end_datetime);
                return now >= start && now <= end;
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {punishments.filter(p => new Date() > new Date(p.end_datetime)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{filteredPunishments.length}</div>
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
                  <TableHead className="text-white font-bold">Punishment</TableHead>
                  <TableHead className="text-white font-bold">Status</TableHead>
                  <TableHead className="text-white font-bold">Staff</TableHead>
                  <TableHead className="text-white font-bold">Start Date</TableHead>
                  <TableHead className="text-white font-bold">End Date</TableHead>
                  <TableHead className="text-white font-bold">Duration</TableHead>
                  <TableHead className="text-white font-bold">Monetary Value</TableHead>
                  <TableHead className="text-white font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredPunishments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No punishments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPunishments.map((punishment) => (
                    <TableRow key={punishment.id}>
                      <TableCell>{punishment.punishment_name}</TableCell>
                      <TableCell>
                        {getStatusBadge(punishment.start_datetime, punishment.end_datetime)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{punishment.staff_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {punishment.staff_force_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(punishment.start_datetime)}</TableCell>
                      <TableCell>{formatDate(punishment.end_datetime)}</TableCell>
                      <TableCell>{punishment.duration} days</TableCell>
                      <TableCell>${punishment.monetary_value}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(punishment)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(punishment)}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(punishment.id)}
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
                ? "View Punishment Details"
                : selectedPunishment
                ? "Edit Punishment"
                : "Add New Punishment"}
            </DialogTitle>
          </DialogHeader>
          <PunishmentsInstitutedForm
            data={selectedPunishment}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
            isViewMode={isViewMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
