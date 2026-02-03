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
import PrivilegeForfeituresForm from "./PrivilegeForfeituresForm";

interface PrivilegeForfeiture {
  id: string;
  privilege_name: string;
  duration: number;
  punishment_instituted: string;
  privilege: string;
}

export default function PrivilegeForfeituresList() {
  const [forfeitures, setForfeitures] = useState<PrivilegeForfeiture[]>([]);
  const [filteredForfeitures, setFilteredForfeitures] = useState<PrivilegeForfeiture[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedForfeiture, setSelectedForfeiture] = useState<PrivilegeForfeiture | null>(null);
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
      // const response = await fetch('/api/disciplinary-management/api/privilege-forfeitures/');
      // const data = await response.json();
      // setForfeitures(data.results);
      
      // Mock data
      const mockData: PrivilegeForfeiture[] = [
        {
          id: "1",
          privilege_name: "Recreation Time",
          duration: 14,
          punishment_instituted: "pun-1",
          privilege: "priv-1",
        },
        {
          id: "2",
          privilege_name: "Visitation Rights",
          duration: 30,
          punishment_instituted: "pun-2",
          privilege: "priv-2",
        },
        {
          id: "3",
          privilege_name: "Library Access",
          duration: 7,
          punishment_instituted: "pun-1",
          privilege: "priv-3",
        },
      ];
      setForfeitures(mockData);
    } catch (error) {
      console.error("Error fetching privilege forfeitures:", error);
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
        forfeiture.privilege_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredForfeitures(filtered);
  };

  const handleAdd = () => {
    setSelectedForfeiture(null);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (forfeiture: PrivilegeForfeiture) => {
    setSelectedForfeiture(forfeiture);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleView = (forfeiture: PrivilegeForfeiture) => {
    setSelectedForfeiture(forfeiture);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this privilege forfeiture?")) {
      try {
        // TODO: Replace with actual API call
        // await fetch(`/api/disciplinary-management/api/privilege-forfeitures/${id}/`, {
        //   method: 'DELETE',
        // });
        setForfeitures(forfeitures.filter((forfeiture) => forfeiture.id !== id));
      } catch (error) {
        console.error("Error deleting privilege forfeiture:", error);
      }
    }
  };

  const handleSave = async (data: Partial<PrivilegeForfeiture>) => {
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
        const newForfeiture = { id: Date.now().toString(), ...data } as PrivilegeForfeiture;
        setForfeitures([...forfeitures, newForfeiture]);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving privilege forfeiture:", error);
    }
  };

  const getDurationBadge = (duration: number) => {
    if (duration <= 7) {
      return <Badge className="bg-[#34D399]">{duration} days</Badge>;
    } else if (duration <= 30) {
      return <Badge className="bg-[#EF4444]">{duration} days</Badge>;
    } else {
      return <Badge variant="destructive">{duration} days</Badge>;
    }
  };

  const getTotalDays = () => {
    return forfeitures.reduce((sum, f) => sum + f.duration, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Privilege Forfeitures</h1>
        <p className="text-muted-foreground">
          Manage privilege forfeitures as part of disciplinary punishments
        </p>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
              <Input
                placeholder="Search by privilege name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="size-4" />
              Add Privilege Forfeiture
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
            <CardTitle className="text-sm">Total Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{getTotalDays()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {forfeitures.length > 0 ? Math.round(getTotalDays() / forfeitures.length) : 0} days
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
                  <TableHead className="text-white font-bold">Privilege Name</TableHead>
                  <TableHead className="text-white font-bold">Duration</TableHead>
                  <TableHead className="text-white font-bold">Punishment Reference</TableHead>
                  <TableHead className="text-white font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredForfeitures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No privilege forfeitures found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredForfeitures.map((forfeiture) => (
                    <TableRow key={forfeiture.id}>
                      <TableCell>{forfeiture.privilege_name}</TableCell>
                      <TableCell>{getDurationBadge(forfeiture.duration)}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {forfeiture.punishment_instituted}
                        </code>
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
                ? "View Privilege Forfeiture"
                : selectedForfeiture
                ? "Edit Privilege Forfeiture"
                : "Add New Privilege Forfeiture"}
            </DialogTitle>
          </DialogHeader>
          <PrivilegeForfeituresForm
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
