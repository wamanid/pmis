import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form@7.55.0";
import {
  Search,
  User,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Save,
  ArrowRight,
  ArrowLeft,
  FileText,
  Users,
  MapPin,
  Briefcase,
  Info,
  DollarSign,
  Upload,
  X,
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
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { toast } from "sonner@2.0.3";

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

interface NextOfKin {
  id?: string;
  full_name?: string;
  first_name: string;
  middle_name?: string;
  surname: string;
  phone_number?: string;
  alternate_phone_number?: string;
  id_number?: string;
  lc1?: string;
  discharge_property?: boolean;
  relationship?: string;
  sex?: string;
  id_type?: string;
  address_region?: string;
  address_district?: string;
  address_county?: string;
  address_sub_county?: string;
  address_parish?: string;
  address_village?: string;
}

interface DebtorInformation {
  id?: string;
  photo?: string;
  escapee?: boolean;
  armed_personnel?: boolean;
  extremely_violent?: boolean;
  life_or_death_imprisonment?: boolean;
  lodger?: boolean;
  previous_convictions_count?: number;
  commital?: boolean;
  date_of_committal?: string;
  subsistence_allowance?: string;
  rate_per_day?: string;
  amount_received?: string;
  days_paid?: number;
  amount_for_full_days?: string;
  value_of_debt?: string;
  creditor_name?: string;
  next_of_kin_details?: string;
  prison_station?: string;
  arrest_region?: string;
  arrest_district?: string;
  arrest_county?: string;
  arrest_sub_county?: string;
  arrest_parish?: string;
  arrest_village?: string;
  prisoner_class?: string;
}

interface ChildRecord {
  id?: string;
  name: string;
  date_of_birth: string;
  fathers_name?: string;
  mothers_name?: string;
  sex?: string;
  photo?: string;
  physical_condition?: string;
  child_record?: string;
  medical_condition?: string;
  medical_report?: string;
  probation_report?: string;
  description?: string;
  age_on_admission?: number;
  relation?: string;
  hospital_of_birth?: string;
  district_of_birth?: string;
}

// Mock data for dropdowns
const admissionTypes = [
  { id: "NEW", name: "New Prisoner" },
  { id: "REOFFENDER", name: "Reoffender" },
  { id: "RECAPTURED", name: "Recaptured Prisoner" },
  { id: "TRANSFER", name: "Transfer" },
  { id: "LODGER", name: "Lodger" },
];

const prisonerCategories = [
  { id: "DEBTOR", name: "Debtor" },
  { id: "REMAND", name: "Remand" },
  { id: "CONVICT", name: "Convict" },
];

const mockRegions = [
  { id: "region-1", name: "Central Region" },
  { id: "region-2", name: "Eastern Region" },
  { id: "region-3", name: "Northern Region" },
  { id: "region-4", name: "Western Region" },
];

const mockDistricts = [
  { id: "district-1", name: "Kampala" },
  { id: "district-2", name: "Wakiso" },
  { id: "district-3", name: "Mukono" },
  { id: "district-4", name: "Jinja" },
];

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

// Mock existing prisoners for search
const mockExistingPrisoners: PrisonerBioData[] = [
  {
    id: "prisoner-1",
    prisoner_personal_number_value: "PP-2024-001",
    prisoner_number_value: "PN-2024-001",
    first_name: "John",
    middle_name: "Paul",
    surname: "Doe",
    date_of_birth: "1990-05-15",
    id_number: "CM90123456789",
    sex: "sex-1",
    sex_name: "Male",
    nationality: "nationality-1",
    nationality_name: "Ugandan",
    date_of_admission: "2024-01-15",
    height: "175",
    fathers_name: "Michael Doe",
    mothers_name: "Sarah Doe",
    marital_status: "marital-1",
    education_level: "edu-3",
    employment_status: "emp-2",
    tribe: "Muganda",
    religion: "rel-1",
  },
  {
    id: "prisoner-2",
    prisoner_personal_number_value: "PP-2024-002",
    prisoner_number_value: "PN-2024-002",
    first_name: "Jane",
    middle_name: "Marie",
    surname: "Smith",
    date_of_birth: "1985-08-20",
    id_number: "CM85987654321",
    sex: "sex-2",
    sex_name: "Female",
    nationality: "nationality-1",
    nationality_name: "Ugandan",
    date_of_admission: "2024-03-10",
    height: "165",
    fathers_name: "Robert Smith",
    mothers_name: "Mary Smith",
    marital_status: "marital-2",
    education_level: "edu-4",
    employment_status: "emp-1",
    tribe: "Musoga",
    religion: "rel-1",
  },
];

const PrisonerAdmissionScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [admissionType, setAdmissionType] = useState("");
  const [prisonerCategory, setPrisonerCategory] = useState("");
  const [isConscious, setIsConscious] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<PrisonerBioData[]>([]);
  const [selectedPrisoner, setSelectedPrisoner] = useState<PrisonerBioData | null>(null);
  const [showRemandAlert, setShowRemandAlert] = useState(false);
  const [generatedPersonalNumber, setGeneratedPersonalNumber] = useState("");
  const [generatedPrisonerNumber, setGeneratedPrisonerNumber] = useState("");
  const [hasChildren, setHasChildren] = useState(false);
  const [children, setChildren] = useState<ChildRecord[]>([]);
  const [currentChild, setCurrentChild] = useState<ChildRecord | null>(null);
  const [showChildForm, setShowChildForm] = useState(false);
  const [nextOfKin, setNextOfKin] = useState<NextOfKin[]>([]);
  const [currentNextOfKin, setCurrentNextOfKin] = useState<NextOfKin | null>(null);
  const [showNextOfKinForm, setShowNextOfKinForm] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<PrisonerBioData>();

  const {
    register: registerDebtor,
    handleSubmit: handleSubmitDebtor,
    setValue: setDebtorValue,
    watch: watchDebtor,
    control: controlDebtor,
    formState: { errors: debtorErrors },
  } = useForm<DebtorInformation>();

  const {
    register: registerChild,
    handleSubmit: handleSubmitChild,
    setValue: setChildValue,
    watch: watchChild,
    reset: resetChild,
    formState: { errors: childErrors },
  } = useForm<ChildRecord>();

  const {
    register: registerNextOfKin,
    handleSubmit: handleSubmitNextOfKin,
    setValue: setNextOfKinValue,
    watch: watchNextOfKin,
    reset: resetNextOfKin,
    control: controlNextOfKin,
    formState: { errors: nextOfKinErrors },
  } = useForm<NextOfKin>();

  // Watch form values for selects
  const watchSex = watch("sex");
  const watchNationality = watch("nationality");
  const watchMaritalStatus = watch("marital_status");
  const watchEducationLevel = watch("education_level");
  const watchEmploymentStatus = watch("employment_status");
  const watchReligion = watch("religion");
  const watchIdType = watch("id_type");

  // Search for existing prisoner
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    // Mock search - in real app, this would call the API
    const results = mockExistingPrisoners.filter(
      (p) =>
        p.prisoner_number_value?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.prisoner_personal_number_value?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${p.first_name} ${p.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSearchResults(results);

    if (results.length === 0) {
      toast.info("No existing records found");
    }
  };

  // Select prisoner from search results
  const handleSelectPrisoner = (prisoner: PrisonerBioData) => {
    setSelectedPrisoner(prisoner);
    populateBioDataForm(prisoner);

    // Check if prisoner is active remand
    if (prisoner.prisoner_number_value && prisonerCategory === "REMAND") {
      setShowRemandAlert(true);
    }

    setSearchResults([]);
    setSearchTerm("");
    toast.success("Prisoner record loaded");
  };

  // Populate biodata form
  const populateBioDataForm = (prisoner: PrisonerBioData) => {
    Object.keys(prisoner).forEach((key) => {
      setValue(key as keyof PrisonerBioData, prisoner[key as keyof PrisonerBioData]);
    });
  };

  // Generate new prisoner numbers
  const generatePrisonerNumbers = () => {
    // Mock generation - in real app, this would call the API
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000);
    setGeneratedPersonalNumber(`PP-${year}-${String(random).padStart(4, "0")}`);
    setGeneratedPrisonerNumber(`PN-${year}-${String(random).padStart(4, "0")}`);
    toast.success("Prisoner numbers generated");
  };

  // Handle admission type change
  const handleAdmissionTypeChange = (value: string) => {
    setAdmissionType(value);

    if (value === "NEW") {
      // For new prisoner, generate numbers immediately
      generatePrisonerNumbers();
      setSelectedPrisoner(null);
      reset();
    } else {
      // For others, they need to search first
      setGeneratedPersonalNumber("");
      setGeneratedPrisonerNumber("");
    }
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setPrisonerCategory(value);

    // Check remand alert if prisoner already selected
    if (selectedPrisoner && value === "REMAND") {
      setShowRemandAlert(true);
    } else {
      setShowRemandAlert(false);
    }
  };

  // Move to next step
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!admissionType) {
        toast.error("Please select admission type");
        return;
      }
      if (!prisonerCategory) {
        toast.error("Please select prisoner category");
        return;
      }

      // For non-new prisoners, they must search and select a prisoner
      if (admissionType !== "NEW" && !selectedPrisoner) {
        toast.error("Please search and select an existing prisoner");
        return;
      }
    }

    setCurrentStep(currentStep + 1);
  };

  // Move to previous step
  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Submit biodata form
  const onSubmitBioData = (data: PrisonerBioData) => {
    console.log("BioData submitted:", data);

    // If category is debtor, move to debtor info step
    if (prisonerCategory === "DEBTOR") {
      setCurrentStep(3);
    } else {
      // Submit final admission
      handleFinalSubmit(data, null);
    }
  };

  // Submit debtor form
  const onSubmitDebtor = (data: DebtorInformation) => {
    console.log("Debtor info submitted:", data);
    const bioData = watch();
    handleFinalSubmit(bioData, data);
  };

  // Child handlers
  const onSubmitChild = (data: ChildRecord) => {
    if (currentChild) {
      // Editing existing child
      setChildren(children.map(c => c.id === currentChild.id ? { ...data, id: currentChild.id } : c));
      toast.success("Child record updated successfully!");
    } else {
      // Adding new child
      const newChild = { ...data, id: Date.now().toString() };
      setChildren([...children, newChild]);
      toast.success("Child record added successfully!");
    }
    setShowChildForm(false);
    setCurrentChild(null);
    resetChild();
  };

  const handleAddChild = () => {
    setCurrentChild(null);
    resetChild();
    setShowChildForm(true);
  };

  const handleEditChild = (child: ChildRecord) => {
    setCurrentChild(child);
    // Populate form with child data
    Object.keys(child).forEach((key) => {
      setChildValue(key as keyof ChildRecord, child[key as keyof ChildRecord]);
    });
    setShowChildForm(true);
  };

  const handleDeleteChild = (childId: string) => {
    setChildren(children.filter(c => c.id !== childId));
    toast.success("Child record removed");
  };

  const handleCancelChildForm = () => {
    setShowChildForm(false);
    setCurrentChild(null);
    resetChild();
  };

  // Next of Kin handlers
  const onSubmitNextOfKin = (data: NextOfKin) => {
    if (currentNextOfKin) {
      // Editing existing next of kin
      setNextOfKin(nextOfKin.map(nok => nok.id === currentNextOfKin.id ? { ...data, id: currentNextOfKin.id } : nok));
      toast.success("Next of Kin updated successfully!");
    } else {
      // Adding new next of kin
      const newNextOfKin = { ...data, id: Date.now().toString() };
      setNextOfKin([...nextOfKin, newNextOfKin]);
      toast.success("Next of Kin added successfully!");
    }
    setShowNextOfKinForm(false);
    setCurrentNextOfKin(null);
    resetNextOfKin();
  };

  const handleAddNextOfKin = () => {
    setCurrentNextOfKin(null);
    resetNextOfKin();
    setShowNextOfKinForm(true);
  };

  const handleEditNextOfKin = (nok: NextOfKin) => {
    setCurrentNextOfKin(nok);
    // Populate form with next of kin data
    Object.keys(nok).forEach((key) => {
      setNextOfKinValue(key as keyof NextOfKin, nok[key as keyof NextOfKin]);
    });
    setShowNextOfKinForm(true);
  };

  const handleDeleteNextOfKin = (nokId: string) => {
    setNextOfKin(nextOfKin.filter(nok => nok.id !== nokId));
    toast.success("Next of Kin removed");
  };

  const handleCancelNextOfKinForm = () => {
    setShowNextOfKinForm(false);
    setCurrentNextOfKin(null);
    resetNextOfKin();
  };

  // Final submission
  const handleFinalSubmit = (bioData: PrisonerBioData, debtorData: DebtorInformation | null) => {
    const admissionData = {
      admission_type: admissionType,
      prisoner_category: prisonerCategory,
      is_conscious: isConscious,
      prisoner_personal_number: generatedPersonalNumber || selectedPrisoner?.prisoner_personal_number_value,
      prisoner_number: generatedPrisonerNumber || selectedPrisoner?.prisoner_number_value,
      bio_data: bioData,
      debtor_info: debtorData,
      children: children,
      next_of_kin: nextOfKin,
    };

    console.log("Final admission data:", admissionData);
    toast.success("Prisoner admission completed successfully!");

    // Reset form
    setTimeout(() => {
      resetForm();
    }, 1500);
  };

  // Reset form
  const resetForm = () => {
    setCurrentStep(1);
    setAdmissionType("");
    setPrisonerCategory("");
    setIsConscious(true);
    setSearchTerm("");
    setSearchResults([]);
    setSelectedPrisoner(null);
    setShowRemandAlert(false);
    setGeneratedPersonalNumber("");
    setGeneratedPrisonerNumber("");
    setHasChildren(false);
    setChildren([]);
    setShowChildForm(false);
    setCurrentChild(null);
    setNextOfKin([]);
    setShowNextOfKinForm(false);
    setCurrentNextOfKin(null);
    reset();
    resetChild();
    resetNextOfKin();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#650000]">Prisoner Admission</h1>
        <p className="text-gray-600">
          Register new prisoner admission and capture biodata information
        </p>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 1 ? "bg-[#650000] text-white" : "bg-gray-200"
                }`}
              >
                1
              </div>
              <span className={currentStep >= 1 ? "text-[#650000]" : "text-gray-500"}>
                Admission Setup
              </span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-4">
              <div
                className={`h-full transition-all ${
                  currentStep >= 2 ? "bg-[#650000]" : ""
                }`}
                style={{ width: currentStep >= 2 ? "100%" : "0%" }}
              />
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 2 ? "bg-[#650000] text-white" : "bg-gray-200"
                }`}
              >
                2
              </div>
              <span className={currentStep >= 2 ? "text-[#650000]" : "text-gray-500"}>
                Biodata Form
              </span>
            </div>
            {prisonerCategory === "DEBTOR" && (
              <>
                <div className="flex-1 h-0.5 bg-gray-200 mx-4">
                  <div
                    className={`h-full transition-all ${
                      currentStep >= 3 ? "bg-[#650000]" : ""
                    }`}
                    style={{ width: currentStep >= 3 ? "100%" : "0%" }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      currentStep >= 3 ? "bg-[#650000] text-white" : "bg-gray-200"
                    }`}
                  >
                    3
                  </div>
                  <span className={currentStep >= 3 ? "text-[#650000]" : "text-gray-500"}>
                    Debtor Information
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Admission Setup */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[#650000] flex items-center gap-2">
              <User className="h-5 w-5" />
              Admission Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Admission Type */}
            <div>
              <Label>
                Admission Type <span className="text-red-500">*</span>
              </Label>
              <Select value={admissionType} onValueChange={handleAdmissionTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select admission type" />
                </SelectTrigger>
                <SelectContent>
                  {admissionTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prisoner Category */}
            <div>
              <Label>
                Prisoner Category <span className="text-red-500">*</span>
              </Label>
              <Select value={prisonerCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select prisoner category" />
                </SelectTrigger>
                <SelectContent>
                  {prisonerCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Consciousness Check */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="conscious"
                checked={isConscious}
                onCheckedChange={(checked) => setIsConscious(checked as boolean)}
              />
              <Label htmlFor="conscious" className="cursor-pointer">
                Is prisoner conscious?
              </Label>
            </div>

            {/* Remand Alert */}
            {showRemandAlert && (
              <Alert className="border-yellow-500 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Warning: This prisoner has an active remand record. Please verify before
                  proceeding.
                </AlertDescription>
              </Alert>
            )}

            {/* Search Section - Only for non-new prisoners */}
            {admissionType && admissionType !== "NEW" && (
              <div className="space-y-4">
                <Separator />
                <div>
                  <h3 className="text-[#650000] mb-3 flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search Existing Prisoner
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Search by prisoner number, personal number, ID number, or name
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter search term..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <Button
                      type="button"
                      onClick={handleSearch}
                      className="bg-[#650000] hover:bg-[#4a0000]"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="mt-4 border rounded-lg p-4 space-y-2">
                      <p className="text-sm">
                        Found {searchResults.length} result(s):
                      </p>
                      {searchResults.map((prisoner) => (
                        <div
                          key={prisoner.id}
                          className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleSelectPrisoner(prisoner)}
                        >
                          <div>
                            <p>
                              {prisoner.first_name} {prisoner.middle_name} {prisoner.surname}
                            </p>
                            <p className="text-sm text-gray-600">
                              {prisoner.prisoner_number_value} | {prisoner.id_number}
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            Select
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Selected Prisoner */}
                  {selectedPrisoner && (
                    <Alert className="mt-4 border-green-500 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>Selected:</strong> {selectedPrisoner.first_name}{" "}
                        {selectedPrisoner.surname} ({selectedPrisoner.prisoner_number_value})
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            )}

            {/* Generated Numbers - for new prisoners */}
            {admissionType === "NEW" && generatedPersonalNumber && (
              <div className="space-y-2">
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Personal Number</Label>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#650000]">{generatedPersonalNumber}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Prisoner Number</Label>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#650000]">{generatedPrisonerNumber}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleNextStep}
                className="bg-[#650000] hover:bg-[#4a0000]"
              >
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Biodata Form */}
      {currentStep === 2 && (
        <form onSubmit={handleSubmit(onSubmitBioData)}>
          <Card>
            <CardHeader>
              <CardTitle className="text-[#650000] flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Prisoner Biodata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="personal" className="space-y-4">
                <TabsList className="grid w-full grid-cols-7">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="identification">Identification</TabsTrigger>
                  <TabsTrigger value="address">Address</TabsTrigger>
                  <TabsTrigger value="physical">Physical</TabsTrigger>
                  <TabsTrigger value="record">Record</TabsTrigger>
                  <TabsTrigger value="next_of_kin">Next of Kin</TabsTrigger>
                  <TabsTrigger value="other">Other</TabsTrigger>
                </TabsList>

                {/* Personal Information Tab */}
                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="first_name">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="first_name"
                        {...register("first_name", { required: "First name is required" })}
                        placeholder="Enter first name"
                      />
                      {errors.first_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="middle_name">Middle Name</Label>
                      <Input
                        id="middle_name"
                        {...register("middle_name")}
                        placeholder="Enter middle name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="surname">
                        Surname <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="surname"
                        {...register("surname", { required: "Surname is required" })}
                        placeholder="Enter surname"
                      />
                      {errors.surname && (
                        <p className="text-red-500 text-sm mt-1">{errors.surname.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="also_known_as">Also Known As</Label>
                      <Input
                        id="also_known_as"
                        {...register("also_known_as")}
                        placeholder="Aliases"
                      />
                    </div>

                    <div>
                      <Label htmlFor="date_of_birth">
                        Date of Birth <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        {...register("date_of_birth", { required: "Date of birth is required" })}
                      />
                      {errors.date_of_birth && (
                        <p className="text-red-500 text-sm mt-1">{errors.date_of_birth.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="sex">
                        Sex <span className="text-red-500">*</span>
                      </Label>
                      <Select value={watchSex} onValueChange={(value) => setValue("sex", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockSexOptions.map((sex) => (
                            <SelectItem key={sex.id} value={sex.id}>
                              {sex.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="nationality">
                        Nationality <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={watchNationality}
                        onValueChange={(value) => setValue("nationality", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select nationality" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockNationalities.map((nat) => (
                            <SelectItem key={nat.id} value={nat.id}>
                              {nat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="marital_status">Marital Status</Label>
                      <Select
                        value={watchMaritalStatus}
                        onValueChange={(value) => setValue("marital_status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockMaritalStatuses.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="religion">Religion</Label>
                      <Select
                        value={watchReligion}
                        onValueChange={(value) => setValue("religion", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select religion" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockReligions.map((rel) => (
                            <SelectItem key={rel.id} value={rel.id}>
                              {rel.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="fathers_name">Father's Name</Label>
                      <Input
                        id="fathers_name"
                        {...register("fathers_name")}
                        placeholder="Enter father's name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="mothers_name">Mother's Name</Label>
                      <Input
                        id="mothers_name"
                        {...register("mothers_name")}
                        placeholder="Enter mother's name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="tribe">Tribe</Label>
                      <Input id="tribe" {...register("tribe")} placeholder="Enter tribe" />
                    </div>
                  </div>
                </TabsContent>

                {/* Identification Tab */}
                <TabsContent value="identification" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="id_type">ID Type</Label>
                      <Select
                        value={watchIdType}
                        onValueChange={(value) => setValue("id_type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select ID type" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockIdTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="id_number">ID Number</Label>
                      <Input
                        id="id_number"
                        {...register("id_number")}
                        placeholder="Enter ID number"
                      />
                    </div>

                    <div>
                      <Label htmlFor="education_level">Education Level</Label>
                      <Select
                        value={watchEducationLevel}
                        onValueChange={(value) => setValue("education_level", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select education level" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockEducationLevels.map((level) => (
                            <SelectItem key={level.id} value={level.id}>
                              {level.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="employment_status">Employment Status</Label>
                      <Select
                        value={watchEmploymentStatus}
                        onValueChange={(value) => setValue("employment_status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select employment status" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockEmploymentStatuses.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="employer">Employer</Label>
                      <Input
                        id="employer"
                        {...register("employer")}
                        placeholder="Enter employer name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="employment_description">Employment Description</Label>
                      <Input
                        id="employment_description"
                        {...register("employment_description")}
                        placeholder="Describe employment"
                      />
                    </div>

                    <div>
                      <Label htmlFor="date_of_admission">
                        Date of Admission <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="date_of_admission"
                        type="date"
                        {...register("date_of_admission", {
                          required: "Date of admission is required",
                        })}
                      />
                      {errors.date_of_admission && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.date_of_admission.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 pt-6">
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
                            />
                          )}
                        />
                        <Label htmlFor="deformity" className="cursor-pointer">
                          Has Deformity
                        </Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Address Tab */}
                <TabsContent value="address" className="space-y-4">
                  <h4 className="text-sm text-gray-600">Current Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Region</Label>
                      <Input {...register("address_region")} placeholder="Enter region" />
                    </div>
                    <div>
                      <Label>District</Label>
                      <Input {...register("address_district")} placeholder="Enter district" />
                    </div>
                    <div>
                      <Label>County</Label>
                      <Input {...register("address_county")} placeholder="Enter county" />
                    </div>
                    <div>
                      <Label>Sub County</Label>
                      <Input {...register("address_sub_county")} placeholder="Enter sub county" />
                    </div>
                    <div>
                      <Label>Parish</Label>
                      <Input {...register("address_parish")} placeholder="Enter parish" />
                    </div>
                    <div>
                      <Label>Village</Label>
                      <Input {...register("address_village")} placeholder="Enter village" />
                    </div>
                  </div>

                  <Separator />

                  <h4 className="text-sm text-gray-600">Permanent Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Region</Label>
                      <Input {...register("permanent_region")} placeholder="Enter region" />
                    </div>
                    <div>
                      <Label>District</Label>
                      <Input {...register("permanent_district")} placeholder="Enter district" />
                    </div>
                    <div>
                      <Label>County</Label>
                      <Input {...register("permanent_county")} placeholder="Enter county" />
                    </div>
                    <div>
                      <Label>Sub County</Label>
                      <Input
                        {...register("permanent_sub_county")}
                        placeholder="Enter sub county"
                      />
                    </div>
                    <div>
                      <Label>Parish</Label>
                      <Input {...register("permanent_parish")} placeholder="Enter parish" />
                    </div>
                    <div>
                      <Label>Village</Label>
                      <Input {...register("permanent_village")} placeholder="Enter village" />
                    </div>
                  </div>
                </TabsContent>

                {/* Physical Characteristics Tab */}
                <TabsContent value="physical" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        {...register("height")}
                        placeholder="Enter height in cm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="build">Build</Label>
                      <Input id="build" {...register("build")} placeholder="e.g., Slim, Medium" />
                    </div>

                    <div>
                      <Label htmlFor="face">Face</Label>
                      <Input id="face" {...register("face")} placeholder="Face description" />
                    </div>

                    <div>
                      <Label htmlFor="eyes">Eyes</Label>
                      <Input id="eyes" {...register("eyes")} placeholder="Eye description" />
                    </div>

                    <div>
                      <Label htmlFor="mouth">Mouth</Label>
                      <Input id="mouth" {...register("mouth")} placeholder="Mouth description" />
                    </div>

                    <div>
                      <Label htmlFor="teeth">Teeth</Label>
                      <Input id="teeth" {...register("teeth")} placeholder="Teeth description" />
                    </div>

                    <div>
                      <Label htmlFor="lips">Lips</Label>
                      <Input id="lips" {...register("lips")} placeholder="Lips description" />
                    </div>

                    <div>
                      <Label htmlFor="ears">Ears</Label>
                      <Input id="ears" {...register("ears")} placeholder="Ears description" />
                    </div>

                    <div>
                      <Label htmlFor="hair">Hair</Label>
                      <Input id="hair" {...register("hair")} placeholder="Hair description" />
                    </div>

                    <div>
                      <Label htmlFor="speech">Speech</Label>
                      <Input id="speech" {...register("speech")} placeholder="Speech pattern" />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="marks">Distinguishing Marks</Label>
                      <Textarea
                        id="marks"
                        {...register("marks")}
                        placeholder="Describe any scars, tattoos, birthmarks..."
                        rows={3}
                      />
                    </div>

                    <div className="md:col-span-3">
                      <Label htmlFor="description">General Description</Label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        placeholder="Overall physical description..."
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Prisoner Record Tab */}
                <TabsContent value="record" className="space-y-4">
                  <div className="space-y-4">
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
                            />
                          )}
                        />
                        <Label htmlFor="life_or_death_imprisonment" className="cursor-pointer">
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
                            />
                          )}
                        />
                        <Label htmlFor="lodger" className="cursor-pointer">
                          Lodger
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Controller
                          name="commital"
                          control={control}
                          defaultValue={false}
                          render={({ field }) => (
                            <Checkbox
                              id="commital"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Label htmlFor="commital" className="cursor-pointer">
                          Commital
                        </Label>
                      </div>

                      <div>
                        <Label htmlFor="previous_convictions_count">Previous Convictions Count</Label>
                        <Input
                          id="previous_convictions_count"
                          type="number"
                          {...register("previous_convictions_count")}
                          placeholder="Number of previous convictions"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="mb-4">Arrest Location</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="arrest_region">Arrest Region</Label>
                          <Input
                            id="arrest_region"
                            {...register("arrest_region")}
                            placeholder="Enter arrest region"
                          />
                        </div>

                        <div>
                          <Label htmlFor="arrest_district">Arrest District</Label>
                          <Input
                            id="arrest_district"
                            {...register("arrest_district")}
                            placeholder="Enter arrest district"
                          />
                        </div>

                        <div>
                          <Label htmlFor="arrest_county">Arrest County</Label>
                          <Input
                            id="arrest_county"
                            {...register("arrest_county")}
                            placeholder="Enter arrest county"
                          />
                        </div>

                        <div>
                          <Label htmlFor="arrest_sub_county">Arrest Sub County</Label>
                          <Input
                            id="arrest_sub_county"
                            {...register("arrest_sub_county")}
                            placeholder="Enter arrest sub county"
                          />
                        </div>

                        <div>
                          <Label htmlFor="arrest_parish">Arrest Parish</Label>
                          <Input
                            id="arrest_parish"
                            {...register("arrest_parish")}
                            placeholder="Enter arrest parish"
                          />
                        </div>

                        <div>
                          <Label htmlFor="arrest_village">Arrest Village</Label>
                          <Input
                            id="arrest_village"
                            {...register("arrest_village")}
                            placeholder="Enter arrest village"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Next of Kin Tab */}
                <TabsContent value="next_of_kin" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm">Next of Kin Records</h4>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddNextOfKin}
                        className="bg-[#650000] hover:bg-[#4a0000]"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Next of Kin
                      </Button>
                    </div>

                    {nextOfKin.length > 0 && (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Relationship</TableHead>
                            <TableHead>Phone Number</TableHead>
                            <TableHead>ID Number</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {nextOfKin.map((nok) => (
                            <TableRow key={nok.id}>
                              <TableCell>{`${nok.first_name} ${nok.middle_name || ''} ${nok.surname}`}</TableCell>
                              <TableCell>{nok.relationship}</TableCell>
                              <TableCell>{nok.phone_number}</TableCell>
                              <TableCell>{nok.id_number}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditNextOfKin(nok)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteNextOfKin(nok.id!)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}

                    {/* Next of Kin Form Dialog */}
                    {showNextOfKinForm && (
                      <Card className="border-2 border-[#650000]">
                        <CardHeader>
                          <CardTitle className="text-[#650000]">
                            {currentNextOfKin ? "Edit Next of Kin" : "Add Next of Kin"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={handleSubmitNextOfKin(onSubmitNextOfKin)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="nok_first_name">
                                  First Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id="nok_first_name"
                                  {...registerNextOfKin("first_name", { required: "First name is required" })}
                                  placeholder="Enter first name"
                                />
                                {nextOfKinErrors.first_name && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {nextOfKinErrors.first_name.message}
                                  </p>
                                )}
                              </div>

                              <div>
                                <Label htmlFor="nok_middle_name">Middle Name</Label>
                                <Input
                                  id="nok_middle_name"
                                  {...registerNextOfKin("middle_name")}
                                  placeholder="Enter middle name"
                                />
                              </div>

                              <div>
                                <Label htmlFor="nok_surname">
                                  Surname <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id="nok_surname"
                                  {...registerNextOfKin("surname", { required: "Surname is required" })}
                                  placeholder="Enter surname"
                                />
                                {nextOfKinErrors.surname && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {nextOfKinErrors.surname.message}
                                  </p>
                                )}
                              </div>

                              <div>
                                <Label htmlFor="nok_relationship">Relationship</Label>
                                <Input
                                  id="nok_relationship"
                                  {...registerNextOfKin("relationship")}
                                  placeholder="e.g., Father, Mother, Spouse"
                                />
                              </div>

                              <div>
                                <Label htmlFor="nok_sex">Sex</Label>
                                <Select
                                  value={watchNextOfKin("sex")}
                                  onValueChange={(value) => setNextOfKinValue("sex", value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select sex" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label htmlFor="nok_phone">Phone Number</Label>
                                <Input
                                  id="nok_phone"
                                  {...registerNextOfKin("phone_number")}
                                  placeholder="+256700000000"
                                />
                              </div>

                              <div>
                                <Label htmlFor="nok_alt_phone">Alternate Phone Number</Label>
                                <Input
                                  id="nok_alt_phone"
                                  {...registerNextOfKin("alternate_phone_number")}
                                  placeholder="+256700000000"
                                />
                              </div>

                              <div>
                                <Label htmlFor="nok_id_type">ID Type</Label>
                                <Input
                                  id="nok_id_type"
                                  {...registerNextOfKin("id_type")}
                                  placeholder="e.g., National ID, Passport"
                                />
                              </div>

                              <div>
                                <Label htmlFor="nok_id_number">ID Number</Label>
                                <Input
                                  id="nok_id_number"
                                  {...registerNextOfKin("id_number")}
                                  placeholder="Enter ID number"
                                />
                              </div>

                              <div>
                                <Label htmlFor="nok_lc1">LC1 Chairman</Label>
                                <Input
                                  id="nok_lc1"
                                  {...registerNextOfKin("lc1")}
                                  placeholder="LC1 name"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <Controller
                                  name="discharge_property"
                                  control={controlNextOfKin}
                                  defaultValue={false}
                                  render={({ field }) => (
                                    <Checkbox
                                      id="discharge_property"
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  )}
                                />
                                <Label htmlFor="discharge_property" className="cursor-pointer">
                                  Discharge Property to this person
                                </Label>
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="mb-4">Next of Kin Address</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="nok_address_region">Region</Label>
                                  <Input
                                    id="nok_address_region"
                                    {...registerNextOfKin("address_region")}
                                    placeholder="Enter region"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="nok_address_district">District</Label>
                                  <Input
                                    id="nok_address_district"
                                    {...registerNextOfKin("address_district")}
                                    placeholder="Enter district"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="nok_address_county">County</Label>
                                  <Input
                                    id="nok_address_county"
                                    {...registerNextOfKin("address_county")}
                                    placeholder="Enter county"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="nok_address_sub_county">Sub County</Label>
                                  <Input
                                    id="nok_address_sub_county"
                                    {...registerNextOfKin("address_sub_county")}
                                    placeholder="Enter sub county"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="nok_address_parish">Parish</Label>
                                  <Input
                                    id="nok_address_parish"
                                    {...registerNextOfKin("address_parish")}
                                    placeholder="Enter parish"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="nok_address_village">Village</Label>
                                  <Input
                                    id="nok_address_village"
                                    {...registerNextOfKin("address_village")}
                                    placeholder="Enter village"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancelNextOfKinForm}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" className="bg-[#650000] hover:bg-[#4a0000]">
                                <Save className="h-4 w-4 mr-2" />
                                {currentNextOfKin ? "Update Next of Kin" : "Add Next of Kin"}
                              </Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                {/* Other Information Tab */}
                <TabsContent value="other" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="photo">Photo Upload</Label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload photo</p>
                        <Input
                          id="photo"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          {...register("photo")}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="finger_print">Fingerprint Upload</Label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload fingerprint</p>
                        <Input
                          id="finger_print"
                          type="file"
                          className="hidden"
                          {...register("finger_print")}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="age_on_admission">Age on Admission</Label>
                      <Input
                        id="age_on_admission"
                        type="number"
                        {...register("age_on_admission")}
                        placeholder="Enter age"
                      />
                    </div>

                    <div>
                      <Label htmlFor="estimated_age_of_pregnancy">
                        Estimated Age of Pregnancy (weeks)
                      </Label>
                      <Input
                        id="estimated_age_of_pregnancy"
                        type="number"
                        {...register("estimated_age_of_pregnancy")}
                        placeholder="If applicable"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Children Section - Only visible for Female prisoners */}
              {watchSex === "sex-2" && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-2 pb-4 border-b">
                    <Checkbox
                      id="has_children"
                      checked={hasChildren}
                      onCheckedChange={(checked) => setHasChildren(checked as boolean)}
                    />
                    <Label htmlFor="has_children" className="cursor-pointer">
                      Prisoner has children
                    </Label>
                  </div>

                  {hasChildren && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm">Children Records</h4>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAddChild}
                          className="bg-[#650000] hover:bg-[#4a0000]"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Child
                        </Button>
                      </div>

                      {children.length > 0 && (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Date of Birth</TableHead>
                              <TableHead>Sex</TableHead>
                              <TableHead>Age on Admission</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {children.map((child) => (
                              <TableRow key={child.id}>
                                <TableCell>{child.name}</TableCell>
                                <TableCell>{child.date_of_birth}</TableCell>
                                <TableCell>{child.sex}</TableCell>
                                <TableCell>{child.age_on_admission}</TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditChild(child)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleDeleteChild(child.id!)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}

                      {/* Child Form Dialog */}
                      {showChildForm && (
                        <Card className="border-2 border-[#650000]">
                          <CardHeader>
                            <CardTitle className="text-[#650000]">
                              {currentChild ? "Edit Child Record" : "Add Child Record"}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <form onSubmit={handleSubmitChild(onSubmitChild)} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="child_name">
                                    Child Name <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="child_name"
                                    {...registerChild("name", { required: "Name is required" })}
                                    placeholder="Enter child's name"
                                  />
                                  {childErrors.name && (
                                    <p className="text-red-500 text-sm mt-1">
                                      {childErrors.name.message}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <Label htmlFor="child_dob">
                                    Date of Birth <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="child_dob"
                                    type="date"
                                    {...registerChild("date_of_birth", {
                                      required: "Date of birth is required",
                                    })}
                                  />
                                  {childErrors.date_of_birth && (
                                    <p className="text-red-500 text-sm mt-1">
                                      {childErrors.date_of_birth.message}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <Label htmlFor="child_sex">Sex</Label>
                                  <Select
                                    value={watchChild("sex")}
                                    onValueChange={(value) => setChildValue("sex", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select sex" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="male">Male</SelectItem>
                                      <SelectItem value="female">Female</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label htmlFor="child_age">Age on Admission</Label>
                                  <Input
                                    id="child_age"
                                    type="number"
                                    {...registerChild("age_on_admission")}
                                    placeholder="Age in years"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="fathers_name">Father's Name</Label>
                                  <Input
                                    id="fathers_name"
                                    {...registerChild("fathers_name")}
                                    placeholder="Enter father's name"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="mothers_name">Mother's Name</Label>
                                  <Input
                                    id="mothers_name"
                                    {...registerChild("mothers_name")}
                                    placeholder="Enter mother's name"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="hospital_of_birth">Hospital of Birth</Label>
                                  <Input
                                    id="hospital_of_birth"
                                    {...registerChild("hospital_of_birth")}
                                    placeholder="Enter hospital"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="district_of_birth">District of Birth</Label>
                                  <Input
                                    id="district_of_birth"
                                    {...registerChild("district_of_birth")}
                                    placeholder="Enter district"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="relation">Relation to Prisoner</Label>
                                  <Input
                                    id="relation"
                                    {...registerChild("relation")}
                                    placeholder="e.g., Son, Daughter"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="physical_condition">Physical Condition</Label>
                                  <Input
                                    id="physical_condition"
                                    {...registerChild("physical_condition")}
                                    placeholder="Describe physical condition"
                                  />
                                </div>

                                <div className="md:col-span-2">
                                  <Label htmlFor="medical_condition">Medical Condition</Label>
                                  <Textarea
                                    id="medical_condition"
                                    {...registerChild("medical_condition")}
                                    placeholder="Describe any medical conditions..."
                                    rows={2}
                                  />
                                </div>

                                <div className="md:col-span-2">
                                  <Label htmlFor="child_description">Description</Label>
                                  <Textarea
                                    id="child_description"
                                    {...registerChild("description")}
                                    placeholder="Additional information about the child..."
                                    rows={2}
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="child_photo">Photo Upload</Label>
                                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                                    <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                                    <p className="text-sm text-gray-600">Click to upload</p>
                                    <Input
                                      id="child_photo"
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      {...registerChild("photo")}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={handleCancelChildForm}
                                >
                                  Cancel
                                </Button>
                                <Button type="submit" className="bg-[#650000] hover:bg-[#4a0000]">
                                  <Save className="h-4 w-4 mr-2" />
                                  {currentChild ? "Update Child" : "Add Child"}
                                </Button>
                              </div>
                            </form>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousStep}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button type="submit" className="bg-[#650000] hover:bg-[#4a0000]">
                  {prisonerCategory === "DEBTOR" ? (
                    <>
                      Next <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Submit Admission
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {/* Step 3: Debtor Information (Only for Debtor category) */}
      {currentStep === 3 && prisonerCategory === "DEBTOR" && (
        <form onSubmit={handleSubmitDebtor(onSubmitDebtor)}>
          <Card>
            <CardHeader>
              <CardTitle className="text-[#650000] flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Debtor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="value_of_debt">Value of Debt</Label>
                  <Input
                    id="value_of_debt"
                    {...registerDebtor("value_of_debt")}
                    placeholder="Enter debt amount"
                  />
                </div>

                <div>
                  <Label htmlFor="creditor_name">Creditor Name</Label>
                  <Input
                    id="creditor_name"
                    {...registerDebtor("creditor_name")}
                    placeholder="Enter creditor name"
                  />
                </div>

                <div>
                  <Label htmlFor="date_of_committal">Date of Committal</Label>
                  <Input
                    id="date_of_committal"
                    type="date"
                    {...registerDebtor("date_of_committal")}
                  />
                </div>

                <div>
                  <Label htmlFor="subsistence_allowance">Subsistence Allowance</Label>
                  <Input
                    id="subsistence_allowance"
                    {...registerDebtor("subsistence_allowance")}
                    placeholder="Enter allowance"
                  />
                </div>

                <div>
                  <Label htmlFor="rate_per_day">Rate Per Day</Label>
                  <Input
                    id="rate_per_day"
                    {...registerDebtor("rate_per_day")}
                    placeholder="Enter daily rate"
                  />
                </div>

                <div>
                  <Label htmlFor="amount_received">Amount Received</Label>
                  <Input
                    id="amount_received"
                    {...registerDebtor("amount_received")}
                    placeholder="Enter amount received"
                  />
                </div>

                <div>
                  <Label htmlFor="days_paid">Days Paid</Label>
                  <Input
                    id="days_paid"
                    type="number"
                    {...registerDebtor("days_paid")}
                    placeholder="Enter number of days"
                  />
                </div>

                <div>
                  <Label htmlFor="amount_for_full_days">Amount for Full Days</Label>
                  <Input
                    id="amount_for_full_days"
                    {...registerDebtor("amount_for_full_days")}
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <Label htmlFor="previous_convictions_count">Previous Convictions</Label>
                  <Input
                    id="previous_convictions_count"
                    type="number"
                    {...registerDebtor("previous_convictions_count")}
                    placeholder="Number of previous convictions"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="next_of_kin_details">Next of Kin Details</Label>
                  <Textarea
                    id="next_of_kin_details"
                    {...registerDebtor("next_of_kin_details")}
                    placeholder="Enter next of kin information..."
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Controller
                        name="escapee"
                        control={controlDebtor}
                        defaultValue={false}
                        render={({ field }) => (
                          <Checkbox
                            id="escapee"
                            checked={field.value}
                            onCheckedChange={field.onChange}
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
                        control={controlDebtor}
                        defaultValue={false}
                        render={({ field }) => (
                          <Checkbox
                            id="armed_personnel"
                            checked={field.value}
                            onCheckedChange={field.onChange}
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
                        control={controlDebtor}
                        defaultValue={false}
                        render={({ field }) => (
                          <Checkbox
                            id="extremely_violent"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label htmlFor="extremely_violent" className="cursor-pointer">
                        Extremely Violent
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Controller
                        name="life_or_death_imprisonment"
                        control={controlDebtor}
                        defaultValue={false}
                        render={({ field }) => (
                          <Checkbox
                            id="life_or_death_imprisonment"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label htmlFor="life_or_death_imprisonment" className="cursor-pointer">
                        Life/Death Imprisonment
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Controller
                        name="lodger"
                        control={controlDebtor}
                        defaultValue={false}
                        render={({ field }) => (
                          <Checkbox
                            id="lodger"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label htmlFor="lodger" className="cursor-pointer">
                        Lodger
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Controller
                        name="commital"
                        control={controlDebtor}
                        defaultValue={false}
                        render={({ field }) => (
                          <Checkbox
                            id="commital"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label htmlFor="commital" className="cursor-pointer">
                        Committal
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousStep}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button type="submit" className="bg-[#650000] hover:bg-[#4a0000]">
                  <Save className="h-4 w-4 mr-2" />
                  Submit Admission
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
};

export default PrisonerAdmissionScreen;
