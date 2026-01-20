import React, { useState, useEffect } from "react";
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
  Fingerprint,
  Loader2,
  RotateCcw,
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { toast } from "sonner@2.0.3";
import { useFilters } from "../../contexts/FilterContext";
import { PrisonerCategorySelect } from "../common/PrisonerCategorySelect";
import PrisonerSearchScreenWider from "../common/PrisonerSearchScreen-wider";
import PrisonerBioDataForm from "./prisoner-biodata/PrisonerBioDataForm";
import { 
  Prisoner, 
  PrisonerBiodata,
  NextOfKin,
  DebtorInformation,
  ChildRecord,
  ArmedPersonnel} from "../../models/admission";
import { generatePrisonerNumber, getPrisonerById } from "../../services/admission";
import { getAdmissionTypes, AdmissionType } from "../../services/admissionService";

const PrisonerAdmissionScreen: React.FC = () => {
  const { station } = useFilters();
  const [currentStep, setCurrentStep] = useState(1);
  const [admissionType, setAdmissionType] = useState("");
  const [prisonerCategory, setPrisonerCategory] = useState("");
  const [isConscious, setIsConscious] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<PrisonerBiodata[]>([]);
  const [selectedPrisoner, setSelectedPrisoner] = useState<PrisonerBiodata | null>(null);
  const [showRemandAlert, setShowRemandAlert] = useState(false);
  const [generatedPersonalNumber, setGeneratedPersonalNumber] = useState("");
  const [generatedPrisonerNumber, setGeneratedPrisonerNumber] = useState("");
  const [prisonerId, setPrisonerId] = useState<string | null>(null);
  const [isGeneratingPrisonerNumber, setIsGeneratingPrisonerNumber] = useState(false);
  const [children, setChildren] = useState<ChildRecord[]>([]);
  const [currentChild, setCurrentChild] = useState<ChildRecord | null>(null);
  const [showChildForm, setShowChildForm] = useState(false);
  const [nextOfKin, setNextOfKin] = useState<NextOfKin[]>([]);
  const [currentNextOfKin, setCurrentNextOfKin] = useState<NextOfKin | null>(null);
  const [showNextOfKinForm, setShowNextOfKinForm] = useState(false);
  const [armedPersonnelData, setArmedPersonnelData] = useState<ArmedPersonnel | null>(null);
  const [bioData, setBioData] = useState<PrisonerBiodata | null>(null);
  const [searchMode, setSearchMode] = useState<"regular" | "biometric">("regular");
  const [isScanning, setIsScanning] = useState(false);
  const [scannedFingerprint, setScannedFingerprint] = useState("");
  
  // Admission types state
  const [admissionTypes, setAdmissionTypes] = useState<AdmissionType[]>([]);
  const [loadingAdmissionTypes, setLoadingAdmissionTypes] = useState(false);

  // Fetch admission types on component mount
  useEffect(() => {
    const fetchAdmissionTypes = async () => {
      setLoadingAdmissionTypes(true);
      try {
        const response = await getAdmissionTypes();
        setAdmissionTypes(response);
      } catch (error) {
        console.error("Error fetching admission types:", error);
        toast.error("Failed to load admission types");
      } finally {
        setLoadingAdmissionTypes(false);
      }
    };

    fetchAdmissionTypes();
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<PrisonerBiodata>();

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

  const {
    register: registerArmedPersonnel,
    handleSubmit: handleSubmitArmedPersonnel,
    setValue: setArmedPersonnelValue,
    watch: watchArmedPersonnel,
    reset: resetArmedPersonnel,
    control: controlArmedPersonnel,
    formState: { errors: armedPersonnelErrors },
  } = useForm<ArmedPersonnel>();

  // Watch form values for selects
  const watchSex = watch("sex");
  const watchNationality = watch("nationality");
  const watchMaritalStatus = watch("marital_status");
  const watchEducationLevel = watch("education_level");
  const watchEmploymentStatus = watch("employment_status");
  const watchReligion = watch("religion");
  const watchIdType = watch("id_type");
  const watchStatusOfWomen = watch("status_of_women");
  const isArmedPersonnel = watch("armed_personnel");
  const watchArmedForce = watchArmedPersonnel("armed_force");
  const watchArmedForceStatus = watchArmedPersonnel("armed_forces_status");

  // Check for existing prisoner data and form state on component mount
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        // Load prisoner number reservation
        const storedReservation = localStorage.getItem("pmis_prisoner_number_reservation");
        
        if (storedReservation) {
          const reservation = JSON.parse(storedReservation);
          
          // Check if prisoner_id exists in the stored reservation
          if (reservation.prisoner_id) {
            // Fetch prisoner details from API
            const prisonerData = await getPrisonerById(reservation.prisoner_id);
            
            // Populate the prisoner number fields with the values from API
            setGeneratedPrisonerNumber(prisonerData.prisoner_number_value || "");
            setGeneratedPersonalNumber(prisonerData.prisoner_personal_number_value || "");
            setPrisonerId(prisonerData.id);
            
            toast.success("Prisoner data loaded from previous session");
          }
        }

        // Load form state
        const storedFormState = localStorage.getItem("pmis_admission_form_state");
        if (storedFormState) {
          const formState = JSON.parse(storedFormState);
          
          // Restore admission setup state
          if (formState.admissionType) setAdmissionType(formState.admissionType);
          if (formState.prisonerCategory) setPrisonerCategory(formState.prisonerCategory);
          if (formState.isConscious !== undefined) setIsConscious(formState.isConscious);
          if (formState.currentStep) setCurrentStep(formState.currentStep);
          if (formState.children) setChildren(formState.children);
          if (formState.nextOfKin) setNextOfKin(formState.nextOfKin);
        }
      } catch (error) {
        console.error("Error loading existing data:", error);
        // Don't show error toast as this is a background operation
      }
    };

    loadExistingData();
  }, []);

  // Save form state to localStorage whenever it changes
  useEffect(() => {
    // Only save if there's actual data (not initial empty state)
    if (admissionType || prisonerCategory || children.length > 0 || nextOfKin.length > 0) {
      const formState = {
        admissionType,
        prisonerCategory,
        isConscious,
        currentStep,
        children,
        nextOfKin,
      };

      localStorage.setItem("pmis_admission_form_state", JSON.stringify(formState));
    }
  }, [admissionType, prisonerCategory, isConscious, currentStep, children, nextOfKin]);

  // Search for existing prisoner
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    // Mock search - in real app, this would call the API
    const results = mockExistingPrisoners.filter(
      (p) =>
        p.prisoner_number_value
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        p.prisoner_personal_number_value
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        p.id_number
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        `${p.first_name} ${p.surname}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );

    setSearchResults(results);

    if (results.length === 0) {
      toast.info("No existing records found");
    }
  };

  // Biometric search handler
  const handleBiometricScan = async () => {
    setIsScanning(true);
    setSearchResults([]);
    toast.info("Initializing fingerprint scanner...");

    // Simulate fingerprint scanning process
    setTimeout(() => {
      toast.info("Place finger on scanner...");
    }, 1000);

    // Simulate scan completion and search
    setTimeout(() => {
      // Mock scanned fingerprint data - in real app, this would come from hardware
      const mockScannedFingerprint = "FP-001-RIGHT-THUMB-A1B2C3D4E5"; // Simulating John Doe's fingerprint
      setScannedFingerprint(mockScannedFingerprint);

      // Search for matching fingerprint
      const results = mockExistingPrisoners.filter(
        (p) => p.finger_print === mockScannedFingerprint,
      );

      setSearchResults(results);
      setIsScanning(false);

      if (results.length === 0) {
        toast.error("No matching fingerprint found in the system");
      } else {
        toast.success(
          `Fingerprint matched! Found ${results.length} record(s)`,
        );
      }
    }, 3000);
  };

  // Select prisoner from search results
  const handleSelectPrisoner = (prisoner: PrisonerBiodata) => {
    setSelectedPrisoner(prisoner);
    setBioData(prisoner);

    // Check if prisoner is active remand
    if (
      prisoner.prisoner_number_value &&
      prisonerCategory === "REMAND"
    ) {
      setShowRemandAlert(true);
    }

    setSearchResults([]);
    setSearchTerm("");
    // toast.success("Prisoner record loaded");
  };

  // Populate from API prisoner biodata response into local bioData state
  const handlePrisonerBiodataLoaded = (biodata: PrisonerBiodata | null) => {
    if (!biodata) return;

    const mapped: PrisonerBiodata = {
      // id: biodata.id,
      first_name: biodata.first_name ?? undefined,
      middle_name: biodata.middle_name ?? undefined,
      surname: biodata.surname ?? undefined,
      date_of_birth: biodata.date_of_birth ?? undefined,
      id_number: biodata.id_number ?? undefined,
      employment_description: biodata.employment_description ?? undefined,
      employer: biodata.employer ?? undefined,
      also_known_as: biodata.also_known_as ?? undefined,
      fathers_name: biodata.fathers_name ?? undefined,
      mothers_name: biodata.mothers_name ?? undefined,
      finger_print: biodata.finger_print ?? undefined,
      habitual_criminal: biodata.habitual_criminal ?? undefined,
      height: biodata.height ?? undefined,
      description: biodata.description ?? undefined,
      marks: biodata.marks ?? undefined,
      date_of_admission: biodata.date_of_admission ?? undefined,
      deformity: biodata.deformity ?? undefined,
      age_on_admission: biodata.age_on_admission ?? undefined,
      sex: biodata.sex?.id,
      sex_name: biodata.sex_name ?? undefined,
      nationality: biodata.nationality?.id,
      nationality_name: biodata.nationality_name ?? undefined,
      education_level: biodata.education_level?.id,
      employment_status: biodata.employment_status?.id,
      tribe: biodata.tribe?.id,
      marital_status: biodata.marital_status?.id,
      address_region: biodata.address_region?.id,
      address_district: biodata.address_district?.id,
      address_county: biodata.address_county?.id,
      address_sub_county: biodata.address_sub_county?.id,
      address_parish: biodata.address_parish?.id,
      address_village: biodata.address_village?.id,
      status_of_women: biodata.status_of_women?.id,
      id_type: biodata.id_type?.id,
      permanent_region: biodata.permanent_region?.id,
      permanent_district: biodata.permanent_district?.id,
      permanent_county: biodata.permanent_county?.id,
      permanent_sub_county: biodata.permanent_sub_county?.id,
      permanent_parish: biodata.permanent_parish?.id,
      permanent_village: biodata.permanent_village?.id,
      religion: biodata.religion?.id,
      highest_education: biodata.highest_education?.id,
      build: biodata.build?.id,
      face: biodata.face?.id,
      eyes: biodata.eyes?.id,
      mouth: biodata.mouth?.id,
      speech: biodata.speech?.id,
      teeth: biodata.teeth?.id,
      lips: biodata.lips?.id,
      ears: biodata.ears?.id,
      hair: biodata.hair?.id,
      desired_district_of_release: biodata.desired_district_of_release?.id,
      prisoner_class: biodata.prisoner_class?.id,
    };

    setBioData(mapped);
  };

  // Populate biodata form
  const populateBioDataForm = (prisoner: PrisonerBiodata) => {
    Object.keys(prisoner).forEach((key) => {
      setValue(
        key as keyof PrisonerBiodata,
        prisoner[key as keyof PrisonerBiodata],
      );
    });
  };

  // Generate new prisoner numbers via API
  const generatePrisonerNumbers = async () => {
    try {
      setIsGeneratingPrisonerNumber(true);

      const categoryParam = prisonerCategory;
      const personalNumberParam = selectedPrisoner?.prisoner_personal_number;

      if (!station) {
        toast.error("Please select a station from the top navigation filter before generating prisoner numbers");
        return;
      }

      if (!categoryParam) {
        toast.error("Please select a prisoner category before generating numbers");
        return;
      }

      const response = await generatePrisonerNumber({
        category: categoryParam,
        prisoner_personal_number: personalNumberParam,
      });

      setGeneratedPersonalNumber(
        response.prisoner_personal_number_details.prisoner_personal_number,
      );
      setGeneratedPrisonerNumber(response.prisoner_number);
      setPrisonerId(response.prisoner_id);

      localStorage.setItem(
        "pmis_prisoner_number_reservation",
        JSON.stringify(response),
      );

      toast.success("Prisoner number generated successfully");
    } catch (error) {
      console.error("Error generating prisoner number:", error);
      toast.error("Failed to generate prisoner number");
    } finally {
      setIsGeneratingPrisonerNumber(false);
    }
  };

  // Handle admission type change
  const handleAdmissionTypeChange = (value: string) => {
    setAdmissionType(value);
    // All admission types allow prisoner search
    // User must manually generate prisoner numbers
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

      // Must have generated prisoner numbers before proceeding
      if (!generatedPrisonerNumber || !generatedPersonalNumber) {
        toast.error("Please generate prisoner numbers before proceeding");
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
  const onSubmitBioData = (data: PrisonerBiodata) => {
    console.log("BioData submitted:", data);

    setBioData(data);

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
    const currentBioData = bioData || (watch() as PrisonerBiodata);
    handleFinalSubmit(currentBioData, data);
  };

  // Child handlers
  const onSubmitChild = (data: ChildRecord) => {
    if (currentChild) {
      // Editing existing child
      setChildren(
        children.map((c) =>
          c.id === currentChild.id
            ? { ...data, id: currentChild.id }
            : c,
        ),
      );
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
      setChildValue(
        key as keyof ChildRecord,
        child[key as keyof ChildRecord],
      );
    });
    setShowChildForm(true);
  };

  const handleDeleteChild = (childId: string) => {
    setChildren(children.filter((c) => c.id !== childId));
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
      setNextOfKin(
        nextOfKin.map((nok) =>
          nok.id === currentNextOfKin.id
            ? { ...data, id: currentNextOfKin.id }
            : nok,
        ),
      );
      toast.success("Next of Kin updated successfully!");
    } else {
      // Adding new next of kin
      const newNextOfKin = {
        ...data,
        id: Date.now().toString(),
      };
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
      setNextOfKinValue(
        key as keyof NextOfKin,
        nok[key as keyof NextOfKin],
      );
    });
    setShowNextOfKinForm(true);
  };

  const handleDeleteNextOfKin = (nokId: string) => {
    setNextOfKin(nextOfKin.filter((nok) => nok.id !== nokId));
    toast.success("Next of Kin removed");
  };

  const handleCancelNextOfKinForm = () => {
    setShowNextOfKinForm(false);
    setCurrentNextOfKin(null);
    resetNextOfKin();
  };

  // Final submission
  const handleFinalSubmit = (
    bioData: PrisonerBiodata,
    debtorData: DebtorInformation | null,
  ) => {
    // Get armed personnel data if checkbox is checked
    const armedPersonnelInfo = bioData.armed_personnel
      ? watchArmedPersonnel()
      : null;

    const admissionData = {
      admission_type: admissionType,
      prisoner_category: prisonerCategory,
      is_conscious: isConscious,
      prisoner_id: prisonerId,
      prisoner_personal_number:
        generatedPersonalNumber ||
        selectedPrisoner?.prisoner_personal_number,
      prisoner_number:
        generatedPrisonerNumber ||
        selectedPrisoner?.prisoner_number_value,
      bio_data: bioData,
      debtor_info: debtorData,
      children: children,
      next_of_kin: nextOfKin,
      armed_personnel: armedPersonnelInfo,
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
    setPrisonerId(null);
    setChildren([]);
    setShowChildForm(false);
    setCurrentChild(null);
    setNextOfKin([]);
    setShowNextOfKinForm(false);
    setCurrentNextOfKin(null);
    setArmedPersonnelData(null);
    setSearchMode("regular");
    setIsScanning(false);
    setScannedFingerprint("");
    reset();
    resetChild();
    resetNextOfKin();
    resetArmedPersonnel();
    
    // Clear localStorage
    localStorage.removeItem("pmis_prisoner_number_reservation");
    localStorage.removeItem("pmis_admission_form_state");
    localStorage.removeItem("pmis_biodata_form_state");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[#650000]">Prisoner Admission</h1>
          <p className="text-gray-600">
            Register new prisoner admission and capture biodata
            information
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            resetForm();
            toast.success("Admission draft cleared. Starting a new admission.");
          }}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          New Admission
        </Button>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 1
                    ? "bg-[#650000] text-white"
                    : "bg-gray-200"
                }`}
              >
                1
              </div>
              <span
                className={
                  currentStep >= 1
                    ? "text-[#650000]"
                    : "text-gray-500"
                }
              >
                Admission Setup
              </span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-4">
              <div
                className={`h-full transition-all ${
                  currentStep >= 2 ? "bg-[#650000]" : ""
                }`}
                style={{
                  width: currentStep >= 2 ? "100%" : "0%",
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 2
                    ? "bg-[#650000] text-white"
                    : "bg-gray-200"
                }`}
              >
                2
              </div>
              <span
                className={
                  currentStep >= 2
                    ? "text-[#650000]"
                    : "text-gray-500"
                }
              >
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
                    style={{
                      width: currentStep >= 3 ? "100%" : "0%",
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      currentStep >= 3
                        ? "bg-[#650000] text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    3
                  </div>
                  <span
                    className={
                      currentStep >= 3
                        ? "text-[#650000]"
                        : "text-gray-500"
                    }
                  >
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
                Admission Type{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Select
                value={admissionType}
                onValueChange={handleAdmissionTypeChange}
                disabled={loadingAdmissionTypes}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingAdmissionTypes ? "Loading..." : "Select admission type"} />
                </SelectTrigger>
                <SelectContent>
                  {loadingAdmissionTypes ? (
                    <SelectItem value="loading" disabled>
                      Loading admission types...
                    </SelectItem>
                  ) : admissionTypes.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No admission types available
                    </SelectItem>
                  ) : (
                    admissionTypes.map((type: AdmissionType) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Prisoner Category */}
            <div>
              <Label>
                Prisoner Category{" "}
                <span className="text-red-500">*</span>
              </Label>
              <PrisonerCategorySelect
                value={prisonerCategory}
                onValueChange={handleCategoryChange}
                placeholder="Select prisoner category"
              />
            </div>

            {/* Consciousness Check */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="conscious"
                checked={isConscious}
                onCheckedChange={(checked) =>
                  setIsConscious(checked as boolean)
                }
              />
              <Label
                htmlFor="conscious"
                className="cursor-pointer"
              >
                Is prisoner conscious?
              </Label>
            </div>

            {/* Remand Alert */}
            {showRemandAlert && (
              <Alert className="border-yellow-500 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Warning: This prisoner has an active remand
                  record. Please verify before proceeding.
                </AlertDescription>
              </Alert>
            )}

            {/* Search Section - Available for all admission types */}
            {/* Hide search if prisoner number is already generated */}
            {admissionType && !generatedPrisonerNumber && (
              <div className="space-y-4">
                <Separator />
                <div>
                  <h3 className="text-[#650000] mb-3 flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search Existing Prisoner
                  </h3>

                  {/* Search Mode Tabs */}
                  <Tabs
                    value={searchMode}
                    onValueChange={(value) =>
                      setSearchMode(value as "regular" | "biometric")
                    }
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="regular">
                        <Search className="h-4 w-4 mr-2" />
                        Regular Search
                      </TabsTrigger>
                      <TabsTrigger value="biometric">
                        <Fingerprint className="h-4 w-4 mr-2" />
                        Biometric Search
                      </TabsTrigger>
                    </TabsList>

                    {/* Regular Search Tab */}
                    <TabsContent value="regular" className="space-y-3">
                      <PrisonerSearchScreenWider
                        showTitle={false}
                        label="Search Prisoner"
                        onPrisonerBiodataLoaded={handlePrisonerBiodataLoaded}
                        onPrisonerSelect={(prisoner: Prisoner) => {
                          // Convert Prisoner to PrisonerBiodata format
                          const bioData: PrisonerBiodata = {
                            id: prisoner.id,
                            prisoner_number_value: prisoner.prisoner_number_value,
                            prisoner_personal_number_value: prisoner.prisoner_personal_number_value,
                            prisoner_personal_number: prisoner.prisoner_personal_number,
                            first_name: prisoner.first_name,
                            surname: prisoner.last_name,
                            middle_name: '',
                          };
                          handleSelectPrisoner(bioData);
                        }}
                      />
                    </TabsContent>

                    {/* Biometric Search Tab */}
                    <TabsContent
                      value="biometric"
                      className="space-y-4"
                    >
                      <p className="text-sm text-gray-600">
                        Use fingerprint scanner to identify prisoner
                      </p>

                      <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-lg">
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={`p-6 rounded-full ${
                              isScanning
                                ? "bg-[#650000] animate-pulse"
                                : "bg-gray-100"
                            }`}
                          >
                            {isScanning ? (
                              <Loader2 className="h-12 w-12 text-white animate-spin" />
                            ) : (
                              <Fingerprint className="h-12 w-12 text-[#650000]" />
                            )}
                          </div>
                          <div className="text-center">
                            <p className="text-sm">
                              {isScanning
                                ? "Scanning fingerprint..."
                                : "Ready to scan"}
                            </p>
                            {scannedFingerprint && !isScanning && (
                              <p className="text-xs text-gray-500 mt-1">
                                Last scan: {scannedFingerprint}
                              </p>
                            )}
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={handleBiometricScan}
                          disabled={isScanning}
                          className="bg-[#650000] hover:bg-[#4a0000]"
                        >
                          {isScanning ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Scanning...
                            </>
                          ) : (
                            <>
                              <Fingerprint className="h-4 w-4 mr-2" />
                              Start Fingerprint Scan
                            </>
                          )}
                        </Button>
                      </div>

                      <Alert className="border-blue-500 bg-blue-50">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800 text-sm">
                          Ensure the fingerprint scanner is properly
                          connected and the prisoner's finger is clean
                          and dry for optimal results.
                        </AlertDescription>
                      </Alert>
                    </TabsContent>
                  </Tabs>

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
                          onClick={() =>
                            handleSelectPrisoner(prisoner)
                          }
                        >
                          <div>
                            <p>
                              {prisoner.first_name}{" "}
                              {prisoner.middle_name}{" "}
                              {prisoner.surname}
                            </p>
                            <p className="text-sm text-gray-600">
                              {prisoner.prisoner_number_value} |{" "}
                              {prisoner.id_number}
                            </p>
                            {searchMode === "biometric" &&
                              prisoner.finger_print && (
                                <p className="text-xs text-gray-500 mt-1">
                                  <Fingerprint className="h-3 w-3 inline mr-1" />
                                  {prisoner.finger_print}
                                </p>
                              )}
                          </div>
                          <Button size="sm" variant="outline">
                            Select
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Generated Numbers */}
            {(generatedPersonalNumber || generatedPrisonerNumber) && (
              <div className="space-y-2">
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Personal Number</Label>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#650000]">
                        {generatedPersonalNumber}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Prisoner Number</Label>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#650000]">
                        {generatedPrisonerNumber}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={generatePrisonerNumbers}
                disabled={isGeneratingPrisonerNumber || !!generatedPrisonerNumber}
              >
                {isGeneratingPrisonerNumber
                  ? "Generating Prisoner Number..."
                  : "Generate Prisoner Number"}
              </Button>
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

            <PrisonerBioDataForm
              bioData={bioData}
              onSubmit={(data) => onSubmitBioData(data as PrisonerBiodata)}
              onCancel={handlePreviousStep}
              prisonerCategory={prisonerCategory}
            />
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
                  <Label htmlFor="value_of_debt">
                    Value of Debt
                  </Label>
                  <Input
                    id="value_of_debt"
                    {...registerDebtor("value_of_debt")}
                    placeholder="Enter debt amount"
                  />
                </div>

                <div>
                  <Label htmlFor="creditor_name">
                    Creditor Name
                  </Label>
                  <Input
                    id="creditor_name"
                    {...registerDebtor("creditor_name")}
                    placeholder="Enter creditor name"
                  />
                </div>

                <div>
                  <Label htmlFor="date_of_committal">
                    Date of Committal
                  </Label>
                  <Input
                    id="date_of_committal"
                    type="date"
                    {...registerDebtor("date_of_committal")}
                  />
                </div>

                <div>
                  <Label htmlFor="subsistence_allowance">
                    Subsistence Allowance
                  </Label>
                  <Input
                    id="subsistence_allowance"
                    {...registerDebtor("subsistence_allowance")}
                    placeholder="Enter allowance"
                  />
                </div>

                <div>
                  <Label htmlFor="rate_per_day">
                    Rate Per Day
                  </Label>
                  <Input
                    id="rate_per_day"
                    {...registerDebtor("rate_per_day")}
                    placeholder="Enter daily rate"
                  />
                </div>

                <div>
                  <Label htmlFor="amount_received">
                    Amount Received
                  </Label>
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
                  <Label htmlFor="amount_for_full_days">
                    Amount for Full Days
                  </Label>
                  <Input
                    id="amount_for_full_days"
                    {...registerDebtor("amount_for_full_days")}
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <Label htmlFor="previous_convictions_count">
                    Previous Convictions
                  </Label>
                  <Input
                    id="previous_convictions_count"
                    type="number"
                    {...registerDebtor(
                      "previous_convictions_count",
                    )}
                    placeholder="Number of previous convictions"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="next_of_kin_details">
                    Next of Kin Details
                  </Label>
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
                      <Label
                        htmlFor="escapee"
                        className="cursor-pointer"
                      >
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
                      <Label
                        htmlFor="armed_personnel"
                        className="cursor-pointer"
                      >
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
                      <Label
                        htmlFor="extremely_violent"
                        className="cursor-pointer"
                      >
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
                      <Label
                        htmlFor="life_or_death_imprisonment"
                        className="cursor-pointer"
                      >
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
                      <Label
                        htmlFor="lodger"
                        className="cursor-pointer"
                      >
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
                      <Label
                        htmlFor="commital"
                        className="cursor-pointer"
                      >
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
                <Button
                  type="submit"
                  className="bg-[#650000] hover:bg-[#4a0000]"
                >
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