import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Badge } from "../../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import { toast } from "sonner@2.0.3";
import PrisonerBioDataForm from "./PrisonerBioDataForm";

export interface PrisonerBioData {
  id?: string;
  is_active: boolean;
  deleted_datetime?: string;
  first_name: string;
  middle_name?: string;
  surname: string;
  photo?: string;
  date_of_birth: string;
  employment_description?: string;
  employer?: string;
  also_known_as?: string;
  finger_print?: string;
  fathers_name?: string;
  mothers_name?: string;
  estimated_age_of_pregnancy?: number;
  id_number?: string;
  habitual_criminal?: boolean;
  height?: string;
  description?: string;
  marks?: string;
  date_of_admission: string;
  deformity?: boolean;
  age_on_admission?: number;
  created_by?: number;
  updated_by?: number;
  deleted_by?: number;
  prisoner_personal_number?: string;
  prisoner_number?: string;
  sex?: string;
  sex_name?: string;
  birth_region?: string;
  birth_district?: string;
  birth_county?: string;
  birth_sub_county?: string;
  birth_parish?: string;
  birth_village?: string;
  education_level?: string;
  employment_status?: string;
  tribe?: string;
  nationality?: string;
  nationality_name?: string;
  marital_status?: string;
  address_region?: string;
  address_district?: string;
  address_county?: string;
  address_sub_county?: string;
  address_parish?: string;
  address_village?: string;
  status_of_women?: string;
  id_type?: string;
  permanent_region?: string;
  permanent_district?: string;
  permanent_county?: string;
  permanent_sub_county?: string;
  permanent_parish?: string;
  permanent_village?: string;
  continent?: string;
  district_of_origin?: string;
  country_of_origin?: string;
  religion?: string;
  highest_education?: string;
  build?: string;
  face?: string;
  eyes?: string;
  mouth?: string;
  speech?: string;
  teeth?: string;
  lips?: string;
  ears?: string;
  hair?: string;
  desired_district_of_release?: string;
  prisoner_class?: string;
  security_rating?: "Low" | "Medium" | "High" | "Maximum";
}

// Mock data for demonstration
const mockBioData: PrisonerBioData[] = [
  {
    id: "1",
    is_active: true,
    first_name: "John",
    middle_name: "Paul",
    surname: "Doe",
    date_of_birth: "1990-05-15",
    date_of_admission: "2024-10-01",
    prisoner_personal_number: "PP-2024-001",
    prisoner_number: "PN-2024-001",
    sex_name: "Male",
    nationality_name: "Ugandan",
    habitual_criminal: false,
    deformity: false,
    age_on_admission: 34,
    height: "175",
    security_rating: "Low",
  },
  {
    id: "2",
    is_active: true,
    first_name: "Jane",
    middle_name: "Marie",
    surname: "Smith",
    date_of_birth: "1985-08-22",
    date_of_admission: "2024-09-15",
    prisoner_personal_number: "PP-2024-002",
    prisoner_number: "PN-2024-002",
    sex_name: "Female",
    nationality_name: "Kenyan",
    habitual_criminal: true,
    deformity: false,
    age_on_admission: 39,
    height: "165",
    security_rating: "High",
  },
  {
    id: "3",
    is_active: false,
    first_name: "Robert",
    middle_name: "Lee",
    surname: "Johnson",
    date_of_birth: "1995-03-10",
    date_of_admission: "2024-08-20",
    prisoner_personal_number: "PP-2024-003",
    prisoner_number: "PN-2024-003",
    sex_name: "Male",
    nationality_name: "Ugandan",
    habitual_criminal: false,
    deformity: true,
    age_on_admission: 29,
    height: "182",
    security_rating: "Medium",
  },
];

interface PrisonerBioDataListProps {
  onNavigate?: (page: string, prisonerId?: string) => void;
}

const PrisonerBioDataList: React.FC<
  PrisonerBioDataListProps
> = ({ onNavigate }) => {
  const [bioDataList, setBioDataList] =
    useState<PrisonerBioData[]>(mockBioData);
  const [filteredData, setFilteredData] =
    useState<PrisonerBioData[]>(mockBioData);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] =
    useState<string>("all");
  const [filterHabitual, setFilterHabitual] =
    useState<string>("all");
  const [filterSex, setFilterSex] = useState<string>("all");
  const [filterSecurityRating, setFilterSecurityRating] =
    useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<
    keyof PrisonerBioData
  >("date_of_admission");
  const [sortDirection, setSortDirection] = useState<
    "asc" | "desc"
  >("desc");

  const [selectedBioData, setSelectedBioData] =
    useState<PrisonerBioData | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] =
    useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
    useState(false);

  // Filter and search
  useEffect(() => {
    let filtered = [...bioDataList];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (data) =>
          data.first_name?.toLowerCase().includes(query) ||
          data.middle_name?.toLowerCase().includes(query) ||
          data.surname?.toLowerCase().includes(query) ||
          data.prisoner_number?.toLowerCase().includes(query) ||
          data.prisoner_personal_number
            ?.toLowerCase()
            .includes(query) ||
          data.id_number?.toLowerCase().includes(query),
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((data) =>
        filterStatus === "active"
          ? data.is_active
          : !data.is_active,
      );
    }

    // Habitual filter
    if (filterHabitual !== "all") {
      filtered = filtered.filter((data) =>
        filterHabitual === "yes"
          ? data.habitual_criminal
          : !data.habitual_criminal,
      );
    }

    // Sex filter
    if (filterSex !== "all") {
      filtered = filtered.filter(
        (data) => data.sex_name === filterSex,
      );
    }

    // Security Rating filter
    if (filterSecurityRating !== "all") {
      filtered = filtered.filter(
        (data) => data.security_rating === filterSecurityRating,
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      if (aValue < bValue)
        return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue)
        return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [
    searchQuery,
    filterStatus,
    filterHabitual,
    filterSex,
    filterSecurityRating,
    bioDataList,
    sortField,
    sortDirection,
  ]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(
    filteredData.length / itemsPerPage,
  );

  const handleSort = (field: keyof PrisonerBioData) => {
    if (sortField === field) {
      setSortDirection(
        sortDirection === "asc" ? "desc" : "asc",
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSecurityRatingColor = (rating?: string) => {
    switch (rating) {
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Maximum":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleView = (bioData: PrisonerBioData) => {
    if (onNavigate && bioData.id) {
      onNavigate(
        "admissions-management-prisoner-biodata-detail",
        bioData.id,
      );
    }
  };

  const handleEdit = (bioData: PrisonerBioData) => {
    setSelectedBioData(bioData);
    setIsEditMode(true);
    setIsFormDialogOpen(true);
  };

  const handleDelete = (bioData: PrisonerBioData) => {
    setSelectedBioData(bioData);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedBioData) {
      setBioDataList(
        bioDataList.filter(
          (data) => data.id !== selectedBioData.id,
        ),
      );
      toast.success("Bio data deleted successfully!");
      setIsDeleteDialogOpen(false);
      setSelectedBioData(null);
    }
  };

  const handleAddNew = () => {
    setSelectedBioData(null);
    setIsEditMode(false);
    setIsFormDialogOpen(true);
  };

  const handleFormSubmit = (data: PrisonerBioData) => {
    if (isEditMode && selectedBioData) {
      // Update existing
      setBioDataList(
        bioDataList.map((item) =>
          item.id === selectedBioData.id
            ? { ...data, id: selectedBioData.id }
            : item,
        ),
      );
      toast.success("Bio data updated successfully!");
    } else {
      // Add new
      const newData = { ...data, id: Date.now().toString() };
      setBioDataList([...bioDataList, newData]);
      toast.success("Bio data created successfully!");
    }
    setIsFormDialogOpen(false);
    setSelectedBioData(null);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    const csv = [
      [
        "ID",
        "Name",
        "Prisoner Number",
        "Date of Birth",
        "Date of Admission",
        "Status",
      ],
      ...filteredData.map((data) => [
        data.id,
        `${data.first_name} ${data.middle_name || ""} ${data.surname}`.trim(),
        data.prisoner_number,
        data.date_of_birth,
        data.date_of_admission,
        data.is_active ? "Active" : "Inactive",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prisoner-biodata-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Data exported successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1>Prisoner Bio Data</h1>
          <p className="text-muted-foreground">
            Manage prisoner biographical information
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Bio Data
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, number..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Status
                  </SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="habitual">
                Habitual Criminal
              </Label>
              <Select
                value={filterHabitual}
                onValueChange={setFilterHabitual}
              >
                <SelectTrigger id="habitual">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <Select
                value={filterSex}
                onValueChange={setFilterSex}
              >
                <SelectTrigger id="sex">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="security">Security Rating</Label>
              <Select
                value={filterSecurityRating}
                onValueChange={setFilterSecurityRating}
              >
                <SelectTrigger id="security">
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Ratings
                  </SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Maximum">
                    Maximum
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="perPage">Records per page</Label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) =>
                  setItemsPerPage(Number(value))
                }
              >
                <SelectTrigger id="perPage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">
                    10 per page
                  </SelectItem>
                  <SelectItem value="25">
                    25 per page
                  </SelectItem>
                  <SelectItem value="50">
                    50 per page
                  </SelectItem>
                  <SelectItem value="100">
                    100 per page
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredData.length)}{" "}
              of {filteredData.length} records
            </p>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button
                      onClick={() =>
                        handleSort("prisoner_number")
                      }
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      Prisoner Number
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort("first_name")}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      Full Name
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>Sex</TableHead>
                  <TableHead>Nationality</TableHead>
                  <TableHead>
                    <button
                      onClick={() =>
                        handleSort("date_of_admission")
                      }
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      Admission Date
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>Habitual</TableHead>
                  <TableHead>
                    <button
                      onClick={() =>
                        handleSort("security_rating")
                      }
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      Security Rating
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No bio data records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentData.map((data) => (
                    <TableRow key={data.id}>
                      <TableCell>
                        {data.prisoner_number ||
                          data.prisoner_personal_number ||
                          "N/A"}
                      </TableCell>
                      <TableCell>
                        {`${data.first_name} ${data.middle_name || ""} ${data.surname}`.trim()}
                      </TableCell>
                      <TableCell>
                        {data.sex_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {data.nationality_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {data.date_of_admission
                          ? new Date(
                              data.date_of_admission,
                            ).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {data.habitual_criminal ? (
                          <Badge variant="secondary">Yes</Badge>
                        ) : (
                          <span className="text-muted-foreground">
                            No
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {data.security_rating ? (
                          <Badge
                            variant="outline"
                            className={getSecurityRatingColor(
                              data.security_rating,
                            )}
                          >
                            {data.security_rating}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">
                            N/A
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {data.is_active ? (
                          <Badge variant="default">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(data)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(data)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(data)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.max(1, p - 1))
                }
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(totalPages, 5) },
                  (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  },
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(totalPages, p + 1),
                  )
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-xl md:w-80 max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode
                ? "Edit Prisoner Bio Data"
                : "Add New Prisoner Bio Data"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? `Editing ${selectedBioData?.prisoner_number}`
                : "Enter prisoner biographical information"}
            </DialogDescription>
          </DialogHeader>
          <PrisonerBioDataForm
            bioData={selectedBioData}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the bio data for{" "}
              {selectedBioData?.first_name}{" "}
              {selectedBioData?.surname}. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PrisonerBioDataList;