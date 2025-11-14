import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form@7.55.0";
import {
  Search,
  User,
  Eye,
  Edit,
  Filter,
  Download,
  AlertCircle,
  CheckCircle,
  Shield,
  X,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { toast } from "sonner@2.0.3";

// Interfaces
interface PrisonerBioData {
  id?: string;
  prisoner_personal_number_value?: string;
  prisoner_number_value?: string;
  sex_name?: string;
  nationality_name?: string;
  current_age_value?: number;
  first_name: string;
  middle_name: string;
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
  sex: string;
  birth_region?: string;
  birth_district?: string;
  birth_county?: string;
  birth_sub_county?: string;
  birth_parish?: string;
  birth_village?: string;
  education_level?: string;
  employment_status?: string;
  tribe?: string;
  nationality: string;
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
  escapee?: boolean;
  armed_personnel?: boolean;
  extremely_violent?: boolean;
  life_or_death_imprisonment?: boolean;
  lodger?: boolean;
  previous_convictions_count?: number;
  commital?: boolean;
  arrest_region?: string;
  arrest_district?: string;
  arrest_county?: string;
  arrest_sub_county?: string;
  arrest_parish?: string;
  arrest_village?: string;
}

interface Prisoner {
  id: string;
  prison_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  habitual: boolean;
  is_dangerous: boolean;
  avg_security_rating: number;
  is_active: boolean;
  created_datetime: string;
  created_by: number;
  created_by_details?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  updated_datetime: string;
  updated_by: number;
}

// Mock data
const mockSexOptions = [
  { id: "sex-1", name: "Male" },
  { id: "sex-2", name: "Female" },
];

const mockNationalities = [
  { id: "nationality-1", name: "Ugandan" },
  { id: "nationality-2", name: "Kenyan" },
  { id: "nationality-3", name: "Tanzanian" },
  { id: "nationality-4", name: "Rwandan" },
];

const mockMaritalStatuses = [
  { id: "marital-1", name: "Single" },
  { id: "marital-2", name: "Married" },
  { id: "marital-3", name: "Divorced" },
  { id: "marital-4", name: "Widowed" },
];

const mockEducationLevels = [
  { id: "edu-1", name: "None" },
  { id: "edu-2", name: "Primary" },
  { id: "edu-3", name: "Secondary" },
  { id: "edu-4", name: "Tertiary" },
  { id: "edu-5", name: "University" },
];

const mockEmploymentStatuses = [
  { id: "emp-1", name: "Employed" },
  { id: "emp-2", name: "Unemployed" },
  { id: "emp-3", name: "Self-Employed" },
  { id: "emp-4", name: "Student" },
];

const mockReligions = [
  { id: "rel-1", name: "Christianity" },
  { id: "rel-2", name: "Islam" },
  { id: "rel-3", name: "Hinduism" },
  { id: "rel-4", name: "Other" },
];

const mockIdTypes = [
  { id: "id-1", name: "National ID" },
  { id: "id-2", name: "Passport" },
  { id: "id-3", name: "Driving Permit" },
  { id: "id-4", name: "Other" },
];

const mockPrisoners: Prisoner[] = [
  {
    id: "1",
    prison_number: "PN-2024-001",
    first_name: "John",
    last_name: "Doe",
    full_name: "John Paul Doe",
    habitual: true,
    is_dangerous: false,
    avg_security_rating: 3,
    is_active: true,
    created_datetime: "2024-10-01T10:00:00Z",
    created_by: 1,
    created_by_details: {
      id: 1,
      username: "admin",
      email: "admin@example.com",
      first_name: "Admin",
      last_name: "User",
    },
    updated_datetime: "2024-10-15T14:30:00Z",
    updated_by: 1,
  },
  {
    id: "2",
    prison_number: "PN-2024-002",
    first_name: "Jane",
    last_name: "Smith",
    full_name: "Jane Marie Smith",
    habitual: false,
    is_dangerous: true,
    avg_security_rating: 5,
    is_active: true,
    created_datetime: "2024-10-05T11:00:00Z",
    created_by: 1,
    created_by_details: {
      id: 1,
      username: "admin",
      email: "admin@example.com",
      first_name: "Admin",
      last_name: "User",
    },
    updated_datetime: "2024-10-20T09:15:00Z",
    updated_by: 1,
  },
  {
    id: "3",
    prison_number: "PN-2024-003",
    first_name: "Robert",
    last_name: "Johnson",
    full_name: "Robert Lee Johnson",
    habitual: false,
    is_dangerous: false,
    avg_security_rating: 2,
    is_active: true,
    created_datetime: "2024-10-10T08:30:00Z",
    created_by: 1,
    created_by_details: {
      id: 1,
      username: "admin",
      email: "admin@example.com",
      first_name: "Admin",
      last_name: "User",
    },
    updated_datetime: "2024-10-18T16:45:00Z",
    updated_by: 1,
  },
];

const PrisonerListScreen: React.FC = () => {
  const [prisoners, setPrisoners] = useState<Prisoner[]>(mockPrisoners);
  const [filteredPrisoners, setFilteredPrisoners] = useState<Prisoner[]>(mockPrisoners);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDangerous, setFilterDangerous] = useState<string>("all");
  const [filterHabitual, setFilterHabitual] = useState<string>("all");
  const [selectedPrisoner, setSelectedPrisoner] = useState<Prisoner | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<PrisonerBioData>();

  // Watch form values
  const watchSex = watch("sex");
  const watchNationality = watch("nationality");
  const watchMaritalStatus = watch("marital_status");
  const watchEducationLevel = watch("education_level");
  const watchEmploymentStatus = watch("employment_status");
  const watchReligion = watch("religion");
  const watchIdType = watch("id_type");

  // Filter prisoners
  useEffect(() => {
    let filtered = [...prisoners];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.prison_number.toLowerCase().includes(query) ||
          p.first_name.toLowerCase().includes(query) ||
          p.last_name.toLowerCase().includes(query) ||
          p.full_name.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((p) =>
        filterStatus === "active" ? p.is_active : !p.is_active
      );
    }

    // Dangerous filter
    if (filterDangerous !== "all") {
      filtered = filtered.filter((p) =>
        filterDangerous === "yes" ? p.is_dangerous : !p.is_dangerous
      );
    }

    // Habitual filter
    if (filterHabitual !== "all") {
      filtered = filtered.filter((p) =>
        filterHabitual === "yes" ? p.habitual : !p.habitual
      );
    }

    setFilteredPrisoners(filtered);
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterDangerous, filterHabitual, prisoners]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPrisoners = filteredPrisoners.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPrisoners.length / itemsPerPage);

  const handleView = (prisoner: Prisoner) => {
    setSelectedPrisoner(prisoner);
    setIsEditMode(false);
    // Populate form with prisoner data
    // In real implementation, fetch full prisoner details from API
    setIsViewDialogOpen(true);
  };

  const handleEdit = (prisoner: Prisoner) => {
    setSelectedPrisoner(prisoner);
    setIsEditMode(true);
    // Populate form with prisoner data
    // In real implementation, fetch full prisoner details from API
    setIsViewDialogOpen(true);
  };

  const onSubmit = (data: PrisonerBioData) => {
    console.log("Updated prisoner data:", data);
    // TODO: Call API to update prisoner
    toast.success("Prisoner updated successfully!");
    setIsViewDialogOpen(false);
    reset();
  };

  const getSecurityRatingBadge = (rating: number) => {
    if (rating >= 4) {
      return <Badge variant="destructive">High Risk ({rating})</Badge>;
    } else if (rating >= 2) {
      return <Badge variant="secondary">Medium Risk ({rating})</Badge>;
    } else {
      return <Badge variant="default">Low Risk ({rating})</Badge>;
    }
  };

  const handleExport = () => {
    toast.info("Exporting prisoner list...");
    // TODO: Implement export functionality
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Admitted Prisoners</h1>
        <p className="text-muted-foreground">
          View and manage all admitted prisoners in the system
        </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dangerous">Dangerous</Label>
              <Select value={filterDangerous} onValueChange={setFilterDangerous}>
                <SelectTrigger id="dangerous">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Dangerous</SelectItem>
                  <SelectItem value="no">Not Dangerous</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="habitual">Habitual Criminal</Label>
              <Select value={filterHabitual} onValueChange={setFilterHabitual}>
                <SelectTrigger id="habitual">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Habitual</SelectItem>
                  <SelectItem value="no">Not Habitual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {currentPrisoners.length} of {filteredPrisoners.length} prisoners
            </p>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prisoners Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Prisoner Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prison Number</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Security Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Habitual</TableHead>
                  <TableHead>Dangerous</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPrisoners.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No prisoners found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentPrisoners.map((prisoner) => (
                    <TableRow key={prisoner.id}>
                      <TableCell>{prisoner.prison_number}</TableCell>
                      <TableCell>{prisoner.full_name}</TableCell>
                      <TableCell>
                        {getSecurityRatingBadge(prisoner.avg_security_rating)}
                      </TableCell>
                      <TableCell>
                        {prisoner.is_active ? (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {prisoner.habitual ? (
                          <Badge variant="secondary">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Yes
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {prisoner.is_dangerous ? (
                          <Badge variant="destructive">
                            <Shield className="h-3 w-3 mr-1" />
                            Yes
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(prisoner.created_datetime).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(prisoner)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(prisoner)}
                          >
                            <Edit className="h-4 w-4" />
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
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View/Edit Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Prisoner" : "View Prisoner Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedPrisoner?.prison_number} - {selectedPrisoner?.full_name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="address">Address</TabsTrigger>
                <TabsTrigger value="physical">Physical</TabsTrigger>
                <TabsTrigger value="record">Record</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      {...register("first_name", { required: true })}
                      placeholder="Enter first name"
                      disabled={!isEditMode}
                    />
                  </div>

                  <div>
                    <Label htmlFor="middle_name">Middle Name</Label>
                    <Input
                      id="middle_name"
                      {...register("middle_name")}
                      placeholder="Enter middle name"
                      disabled={!isEditMode}
                    />
                  </div>

                  <div>
                    <Label htmlFor="surname">Surname *</Label>
                    <Input
                      id="surname"
                      {...register("surname", { required: true })}
                      placeholder="Enter surname"
                      disabled={!isEditMode}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      {...register("date_of_birth", { required: true })}
                      disabled={!isEditMode}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sex">Sex *</Label>
                    <Controller
                      name="sex"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!isEditMode}
                        >
                          <SelectTrigger id="sex">
                            <SelectValue placeholder="Select Sex" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockSexOptions.map((sex) => (
                              <SelectItem key={sex.id} value={sex.id}>
                                {sex.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div>
                    <Label htmlFor="nationality">Nationality *</Label>
                    <Controller
                      name="nationality"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!isEditMode}
                        >
                          <SelectTrigger id="nationality">
                            <SelectValue placeholder="Select Nationality" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockNationalities.map((nat) => (
                              <SelectItem key={nat.id} value={nat.id}>
                                {nat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_of_admission">Date of Admission *</Label>
                    <Input
                      id="date_of_admission"
                      type="date"
                      {...register("date_of_admission", { required: true })}
                      disabled={!isEditMode}
                    />
                  </div>

                  <div>
                    <Label htmlFor="id_number">ID Number</Label>
                    <Input
                      id="id_number"
                      {...register("id_number")}
                      placeholder="Enter ID number"
                      disabled={!isEditMode}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="marital_status">Marital Status</Label>
                    <Controller
                      name="marital_status"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!isEditMode}
                        >
                          <SelectTrigger id="marital_status">
                            <SelectValue placeholder="Select Marital Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockMaritalStatuses.map((status) => (
                              <SelectItem key={status.id} value={status.id}>
                                {status.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div>
                    <Label htmlFor="religion">Religion</Label>
                    <Controller
                      name="religion"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!isEditMode}
                        >
                          <SelectTrigger id="religion">
                            <SelectValue placeholder="Select Religion" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockReligions.map((rel) => (
                              <SelectItem key={rel.id} value={rel.id}>
                                {rel.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tribe">Tribe</Label>
                    <Input
                      id="tribe"
                      {...register("tribe")}
                      placeholder="Enter tribe"
                      disabled={!isEditMode}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="education_level">Education Level</Label>
                    <Controller
                      name="education_level"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!isEditMode}
                        >
                          <SelectTrigger id="education_level">
                            <SelectValue placeholder="Select Education Level" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockEducationLevels.map((edu) => (
                              <SelectItem key={edu.id} value={edu.id}>
                                {edu.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div>
                    <Label htmlFor="employment_status">Employment Status</Label>
                    <Controller
                      name="employment_status"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!isEditMode}
                        >
                          <SelectTrigger id="employment_status">
                            <SelectValue placeholder="Select Employment Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockEmploymentStatuses.map((emp) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fathers_name">Father's Name</Label>
                    <Input
                      id="fathers_name"
                      {...register("fathers_name")}
                      placeholder="Enter father's name"
                      disabled={!isEditMode}
                    />
                  </div>

                  <div>
                    <Label htmlFor="mothers_name">Mother's Name</Label>
                    <Input
                      id="mothers_name"
                      {...register("mothers_name")}
                      placeholder="Enter mother's name"
                      disabled={!isEditMode}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Controller
                      name="habitual_criminal"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <Checkbox
                          id="habitual_criminal"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!isEditMode}
                        />
                      )}
                    />
                    <Label htmlFor="habitual_criminal" className="cursor-pointer">
                      Habitual Criminal
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Controller
                      name="deformity"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <Checkbox
                          id="deformity"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!isEditMode}
                        />
                      )}
                    />
                    <Label htmlFor="deformity" className="cursor-pointer">
                      Has Deformity
                    </Label>
                  </div>
                </div>
              </TabsContent>

              {/* Address Tab */}
              <TabsContent value="address" className="space-y-4 mt-4">
                <h4 className="text-sm text-gray-600">Current Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Region</Label>
                    <Input
                      {...register("address_region")}
                      placeholder="Enter region"
                      disabled={!isEditMode}
                    />
                  </div>
                  <div>
                    <Label>District</Label>
                    <Input
                      {...register("address_district")}
                      placeholder="Enter district"
                      disabled={!isEditMode}
                    />
                  </div>
                  <div>
                    <Label>County</Label>
                    <Input
                      {...register("address_county")}
                      placeholder="Enter county"
                      disabled={!isEditMode}
                    />
                  </div>
                  <div>
                    <Label>Sub County</Label>
                    <Input
                      {...register("address_sub_county")}
                      placeholder="Enter sub county"
                      disabled={!isEditMode}
                    />
                  </div>
                  <div>
                    <Label>Parish</Label>
                    <Input
                      {...register("address_parish")}
                      placeholder="Enter parish"
                      disabled={!isEditMode}
                    />
                  </div>
                  <div>
                    <Label>Village</Label>
                    <Input
                      {...register("address_village")}
                      placeholder="Enter village"
                      disabled={!isEditMode}
                    />
                  </div>
                </div>

                <Separator />

                <h4 className="text-sm text-gray-600">Permanent Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Region</Label>
                    <Input
                      {...register("permanent_region")}
                      placeholder="Enter region"
                      disabled={!isEditMode}
                    />
                  </div>
                  <div>
                    <Label>District</Label>
                    <Input
                      {...register("permanent_district")}
                      placeholder="Enter district"
                      disabled={!isEditMode}
                    />
                  </div>
                  <div>
                    <Label>County</Label>
                    <Input
                      {...register("permanent_county")}
                      placeholder="Enter county"
                      disabled={!isEditMode}
                    />
                  </div>
                  <div>
                    <Label>Sub County</Label>
                    <Input
                      {...register("permanent_sub_county")}
                      placeholder="Enter sub county"
                      disabled={!isEditMode}
                    />
                  </div>
                  <div>
                    <Label>Parish</Label>
                    <Input
                      {...register("permanent_parish")}
                      placeholder="Enter parish"
                      disabled={!isEditMode}
                    />
                  </div>
                  <div>
                    <Label>Village</Label>
                    <Input
                      {...register("permanent_village")}
                      placeholder="Enter village"
                      disabled={!isEditMode}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Physical Characteristics Tab */}
              <TabsContent value="physical" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      {...register("height")}
                      placeholder="Enter height in cm"
                      disabled={!isEditMode}
                    />
                  </div>

                  <div>
                    <Label htmlFor="build">Build</Label>
                    <Input
                      id="build"
                      {...register("build")}
                      placeholder="e.g., Slim, Medium"
                      disabled={!isEditMode}
                    />
                  </div>

                  <div>
                    <Label htmlFor="face">Face</Label>
                    <Input
                      id="face"
                      {...register("face")}
                      placeholder="Face description"
                      disabled={!isEditMode}
                    />
                  </div>

                  <div>
                    <Label htmlFor="eyes">Eyes</Label>
                    <Input
                      id="eyes"
                      {...register("eyes")}
                      placeholder="Eye description"
                      disabled={!isEditMode}
                    />
                  </div>

                  <div>
                    <Label htmlFor="hair">Hair</Label>
                    <Input
                      id="hair"
                      {...register("hair")}
                      placeholder="Hair description"
                      disabled={!isEditMode}
                    />
                  </div>

                  <div>
                    <Label htmlFor="marks">Distinguishing Marks</Label>
                    <Input
                      id="marks"
                      {...register("marks")}
                      placeholder="Scars, tattoos, etc."
                      disabled={!isEditMode}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">General Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Enter general physical description"
                    rows={3}
                    disabled={!isEditMode}
                  />
                </div>
              </TabsContent>

              {/* Prisoner Record Tab */}
              <TabsContent value="record" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <h4 className="mb-4">Prisoner Tagging</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Controller
                        name="escapee"
                        control={control}
                        defaultValue={false}
                        render={({ field }) => (
                          <Checkbox
                            id="escapee"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!isEditMode}
                          />
                        )}
                      />
                      <Label htmlFor="escapee" className="cursor-pointer">
                        Escapee
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Controller
                        name="armed_personnel"
                        control={control}
                        defaultValue={false}
                        render={({ field }) => (
                          <Checkbox
                            id="armed_personnel"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!isEditMode}
                          />
                        )}
                      />
                      <Label htmlFor="armed_personnel" className="cursor-pointer">
                        Armed Personnel
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Controller
                        name="extremely_violent"
                        control={control}
                        defaultValue={false}
                        render={({ field }) => (
                          <Checkbox
                            id="extremely_violent"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!isEditMode}
                          />
                        )}
                      />
                      <Label htmlFor="extremely_violent" className="cursor-pointer">
                        Extremely Violent
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Controller
                        name="life_or_death_imprisonment"
                        control={control}
                        defaultValue={false}
                        render={({ field }) => (
                          <Checkbox
                            id="life_or_death_imprisonment"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!isEditMode}
                          />
                        )}
                      />
                      <Label
                        htmlFor="life_or_death_imprisonment"
                        className="cursor-pointer"
                      >
                        Life or Death Imprisonment
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Controller
                        name="lodger"
                        control={control}
                        defaultValue={false}
                        render={({ field }) => (
                          <Checkbox
                            id="lodger"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!isEditMode}
                          />
                        )}
                      />
                      <Label htmlFor="lodger" className="cursor-pointer">
                        Lodger
                      </Label>
                    </div>

                    <div>
                      <Label htmlFor="previous_convictions_count">
                        Previous Convictions Count
                      </Label>
                      <Input
                        id="previous_convictions_count"
                        type="number"
                        {...register("previous_convictions_count")}
                        placeholder="Number of previous convictions"
                        disabled={!isEditMode}
                      />
                    </div>
                  </div>

                  <Separator />

                  <h4 className="mb-4">Arrest Location</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="arrest_region">Arrest Region</Label>
                      <Input
                        id="arrest_region"
                        {...register("arrest_region")}
                        placeholder="Enter arrest region"
                        disabled={!isEditMode}
                      />
                    </div>

                    <div>
                      <Label htmlFor="arrest_district">Arrest District</Label>
                      <Input
                        id="arrest_district"
                        {...register("arrest_district")}
                        placeholder="Enter arrest district"
                        disabled={!isEditMode}
                      />
                    </div>

                    <div>
                      <Label htmlFor="arrest_county">Arrest County</Label>
                      <Input
                        id="arrest_county"
                        {...register("arrest_county")}
                        placeholder="Enter arrest county"
                        disabled={!isEditMode}
                      />
                    </div>

                    <div>
                      <Label htmlFor="arrest_village">Arrest Village</Label>
                      <Input
                        id="arrest_village"
                        {...register("arrest_village")}
                        placeholder="Enter arrest village"
                        disabled={!isEditMode}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsViewDialogOpen(false);
                  reset();
                }}
              >
                {isEditMode ? "Cancel" : "Close"}
              </Button>
              {isEditMode && (
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Save Changes
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrisonerListScreen;
