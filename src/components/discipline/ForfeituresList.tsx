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
import ForfeituresForm from "./ForfeituresForm";

interface Forfeiture {
  id: string;
  forfeiture_difference: string;
  forfeiture_type: string;
  forfeiture_current_value: string;
  forfeiture_new_value: string;
  due_date: string;
  disciplinary_punishment_instituted: string;
}

export default function ForfeituresList() {
  const [forfeitures, setForfeitures] = useState<Forfeiture[]>([]);
  const [filteredForfeitures, setFilteredForfeitures] = useState<Forfeiture[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedForfeiture, setSelectedForfeiture] = useState<Forfeiture | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchForfeitures();
  }, []);

  useEffect(() => {
    filterForfeitures();
  }, [searchTerm, forfeitures]);

  const fetchForfeitures = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/disciplinary-management/api/forfeitures/');
      // const data = await response.json();
      // setForfeitures(data.results);
      
      // Mock data
      const mockData: Forfeiture[] = [
        {
          id: "1",
          forfeiture_difference: "150",
          forfeiture_type: "Earnings Deduction",
          forfeiture_current_value: "500.00",
          forfeiture_new_value: "350",
          due_date: "2025-11-30T23:59:59Z",
          disciplinary_punishment_instituted: "pun-1",
        },
        {
          id: "2",
          forfeiture_difference: "200",
          forfeiture_type: "Property Seizure",
          forfeiture_current_value: "1000.00",
          forfeiture_new_value: "800",
          due_date: "2025-12-15T23:59:59Z",
          disciplinary_punishment_instituted: "pun-2",
        },
      ];
      setForfeitures(mockData);
    } catch (error) {
      console.error("Error fetching forfeitures:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterForfeitures = () => {
    if (!searchTerm) {
      setFilteredForfeitures(forfeitures);
      return;
    }

    const filtered = forfeitures.filter(
      (forfeiture) =>
        forfeiture.forfeiture_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        forfeiture.forfeiture_difference.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredForfeitures(filtered);
  };

  const handleAdd = () => {
    setSelectedForfeiture(null);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (forfeiture: Forfeiture) => {
    setSelectedForfeiture(forfeiture);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleView = (forfeiture: Forfeiture) => {
    setSelectedForfeiture(forfeiture);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this forfeiture record?")) {
      try {
        // TODO: Replace with actual API call
        // await fetch(`/api/disciplinary-management/api/forfeitures/${id}/`, {
        //   method: 'DELETE',
        // });
        setForfeitures(forfeitures.filter((forfeiture) => forfeiture.id !== id));
      } catch (error) {
        console.error("Error deleting forfeiture:", error);
      }
    }
  };

  const handleSave = async (data: Partial<Forfeiture>) => {
    try {
      if (selectedForfeiture) {
        // Update existing
        // TODO: Replace with actual API call
        setForfeitures(
          forfeitures.map((forfeiture) =>
            forfeiture.id === selectedForfeiture.id ? { ...forfeiture, ...data } : forfeiture
          )
        );
      } else {
        // Create new
        // TODO: Replace with actual API call
        const newForfeiture = { id: Date.now().toString(), ...data } as Forfeiture;
        setForfeitures([...forfeitures, newForfeiture]);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving forfeiture:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getTotalForfeited = () => {
    return forfeitures.reduce((sum, f) => sum + parseFloat(f.forfeiture_difference || "0"), 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Forfeitures</h1>
        <p className="text-muted-foreground">
          Manage monetary forfeitures and deductions for disciplinary punishments
        </p>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
              <Input
                placeholder="Search by forfeiture type or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="size-4" />
              Add Forfeiture
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Forfeitures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{forfeitures.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${getTotalForfeited().toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {forfeitures.filter(f => isOverdue(f.due_date)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{filteredForfeitures.length}</div>
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
                  <TableHead className="text-white font-bold">Forfeiture Type</TableHead>
                  <TableHead className="text-white font-bold">Current Value</TableHead>
                  <TableHead className="text-white font-bold">New Value</TableHead>
                  <TableHead className="text-white font-bold">Difference</TableHead>
                  <TableHead className="text-white font-bold">Due Date</TableHead>
                  <TableHead className="text-white font-bold">Status</TableHead>
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
                ) : filteredForfeitures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No forfeitures found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredForfeitures.map((forfeiture) => (
                    <TableRow key={forfeiture.id}>
                      <TableCell>{forfeiture.forfeiture_type}</TableCell>
                      <TableCell>${parseFloat(forfeiture.forfeiture_current_value).toFixed(2)}</TableCell>
                      <TableCell>${parseFloat(forfeiture.forfeiture_new_value).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">
                          -${parseFloat(forfeiture.forfeiture_difference).toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(forfeiture.due_date)}</TableCell>
                      <TableCell>
                        {isOverdue(forfeiture.due_date) ? (
                          <Badge variant="destructive">Overdue</Badge>
                        ) : (
                          <Badge className="bg-[#34D399]">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(forfeiture)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(forfeiture)}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(forfeiture.id)}
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
                ? "View Forfeiture Details"
                : selectedForfeiture
                ? "Edit Forfeiture"
                : "Add New Forfeiture"}
            </DialogTitle>
          </DialogHeader>
          <ForfeituresForm
            data={selectedForfeiture}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
            isViewMode={isViewMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
