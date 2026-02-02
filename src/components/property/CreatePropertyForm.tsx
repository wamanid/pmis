import React, {useEffect, useState, useRef, useMemo, useCallback} from "react";
import { useForm, Controller } from 'react-hook-form';
import { requiredValidation } from '../../utils/validation';
import axiosInstance from "../../services/axiosInstance";
import {
  getStationVisitors2,
  PrisonerItem,
  Visitor,
  fetchVisitorsPaginated
} from "../../services/stationServices/visitorsServices/VisitorsService";
import {
  addProperty,
  DefaultPropertyItem,
  getPropertyStatuses,
  getPropertyTypes, PrisonerProperty, Property,
  PropertyBag, updateProperty,
  fetchPropertyStatusesPaginated,
  fetchPropertyTypesPaginated,
  fetchPropertyBagsPaginated,
  fetchItemCategoriesPaginated,
  fetchMeasurementUnitsPaginated,
  fetchPropertyById
} from "../../services/propertyServices/propertyService";
import PropertyItem from "./PropertyItem";
import {getNextOfKins, NextOfKinResponse, fetchNextOfKinPaginated} from "../../services/admission/nextOfKinService";
import {
  getItemCategories, getUnits,
  getVisitorItems2,
  ItemCategory, ItemStatus,
  Unit,
  VisitorItem,
  fetchVisitorItemsPaginated
} from "../../services/stationServices/visitorsServices/visitorItem";
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import BiometricCapture from '../common/BiometricCapture';
import SearchableSelect from '../common/SearchableSelect';
import CustomPrisonerSearch from '../common/CustomPrisonerSearch';
import PropertyStatusChangeForm from './PropertyStatusChangeForm';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { DialogFooter } from '../ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  User,
  Tag,
  DollarSign,
  FileText,
  AlertCircle,
  Check,
  ChevronsUpDown,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '../ui/utils';
import {
    getPropertyTypeUtil,
    handleCatchError,
    handleEmptyList, handleResponseError,
    handleServerError
} from "../../services/stationServices/utils";

interface ChildProps {
  prisoners: PrisonerItem;
  setIsCreateDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setNewDialogLoader: React.Dispatch<React.SetStateAction<boolean>>;
  setLoaderText: React.Dispatch<React.SetStateAction<string>>;
  setIsNextCreateDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setProperties: React.Dispatch<React.SetStateAction<PrisonerProperty[]>>;
  selectedProperty: PrisonerProperty
  propertyStatuses: Unit[]
  propertyTypes: Unit[]
  setDataTableRefreshKey: React.Dispatch<React.SetStateAction<number>>;
  setPrisonerInfo: React.Dispatch<React.SetStateAction<{prisoner: string; prisonerName: string; prisonerNumber: string}>>;
}


const CreatePropertyForm: React.FC<ChildProps> = ({ prisoners, setIsCreateDialogOpen, setNewDialogLoader,
                                                    setLoaderText, setIsNextCreateDialogOpen,
                                                    setProperties, selectedProperty, propertyStatuses, propertyTypes, setDataTableRefreshKey, setPrisonerInfo: setParentPrisonerInfo}) => {
    // Edit mode detection
    const mode = selectedProperty ? "edit" : "add";
    const isOpen = true; // Form is open when component is rendered
    
    // React Hook Form setup
    const { control, formState: { errors }, trigger, clearErrors, setError, handleSubmit } = useForm({
      mode: 'onSubmit',
      reValidateMode: 'onChange'
    });
    
    // Initialization refs
    const isPrisonerInitialized = useRef(false);
    const isVisitorInitialized = useRef(false);
    const propertyItemRef = useRef<{ syncTextFields: () => any; getData: () => DefaultPropertyItem }>(null);
    
    // Store complete prisoner details for Next of Kin dialog
    const [selectedPrisonerDetails, setSelectedPrisonerDetails] = useState<{id: string, name: string, number: string} | null>(null);
    
    // Prisoner state with edit mode initialization
    const [prisonerInfo, setPrisonerInfo] = useState(() => ({
      prisoner: selectedProperty?.prisoner || ''
    }));
    const [localPrisonerValue, setLocalPrisonerValue] = useState<string | null>(() => {
      if (selectedProperty && selectedProperty.prisoner) {
        isPrisonerInitialized.current = true;
        return selectedProperty.prisoner;
      }
      return null;
    });
    
    // Visitor state with edit mode initialization
    const [visitorInfo, setVisitorInfo] = useState(() => ({
      visitor: selectedProperty?.visitor || ''
    }));
    const [localVisitorValue, setLocalVisitorValue] = useState<string | null>(() => {
      if (selectedProperty && selectedProperty.visitor) {
        isVisitorInitialized.current = true;
        return selectedProperty.visitor;
      }
      return null;
    });
    
    // Remove old client-side state arrays - now using server-side pagination
    // const [visitors, setVisitors] = useState<Visitor[]>([]); // REMOVED
    // Temporarily keep these until PropertyItem is converted to SearchableSelect
    const [itemCategories, setItemCategories] = useState<ItemCategory[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [propertyBags, setPropertyBags] = useState<PropertyBag[]>([]);
    
    const [loading, setLoading] = useState({ visitor: false, property: false, type: false })
    const [nextOfKins, setNextOfKins] = useState<NextOfKinResponse[]>([])
    const [isPropertyItemsOpen, setIsPropertyItemsOpen] = useState(true);
    
    // Track validation errors per property item
    const [propertyItemValidationErrors, setPropertyItemValidationErrors] = useState<Record<string, Record<string, string>>>({});
    
   // Initialize propertyItems with selectedProperty data if in edit mode
   const [propertyItems, setPropertyItems] = useState<DefaultPropertyItem[]>(() => {
      if (selectedProperty) {
        return [{
          id: '1',
          property_type: selectedProperty.property_type,
          property_category: '', // Property category will be fetched when property_item is loaded
          property_item: selectedProperty.property_item,
          measurement_unit: selectedProperty.measurement_unit,
          property_bag: selectedProperty.property_bag,
          next_of_kin: selectedProperty.next_of_kin,
          property_status: selectedProperty.property_status,
          quantity: selectedProperty.quantity,
          amount: selectedProperty.amount || '',
          note: selectedProperty.note,
          destination: selectedProperty.destination,
          visitor_item: selectedProperty.visitor_item || '',
          currency: selectedProperty.currency || '',
        }];
      }
      return [{
        id: '1',
        property_type: "",
        property_category: '',
        property_item: '',
        measurement_unit: '',
        property_bag: '',
        next_of_kin: '',
        property_status: '',
        quantity: '',
        amount: '',
        note: '',
        destination: '',
        visitor_item: '',
        currency: '',
      }];
    });
    const [visitorItems, setVisitorItems] = useState<VisitorItem[]>([])
    const [typeLoader, setTypeLoader] = useState(false)
    const [biometricData, setBiometricData] = useState('');

    // Memoize handleUpdatePropertyItem to prevent unnecessary re-renders
    const handleUpdatePropertyItem = useCallback((itemId: string, updatedFields: Partial<typeof propertyItems[0]>) => {
      setPropertyItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, ...updatedFields } : item
        )
      );
    }, []); // Empty deps - function never changes

    const onSubmit = async () => {
        // Validate required fields
        if (!prisonerInfo.prisoner) {
          setError('prisoner', { 
            type: 'manual', 
            message: 'Prisoner is required' 
          });
          toast.error("Prisoner is required");
          return;
        }
        
        // Get all field data from PropertyItem ref (avoids parent state entirely)
        let item = propertyItems[0];
        if (propertyItemRef.current) {
          const itemData = propertyItemRef.current.getData();
          item = { ...item, ...itemData };
        }
        
        // Validate property item required fields and build error object
        const validationErrors: string[] = [];
        const itemErrors: Record<string, string> = {};
        
        if (!item.property_type) {
          validationErrors.push("Property Type is required");
          itemErrors.property_type = "Property Type is required";
        }
        // Only validate property_category in add mode (not edit mode)
        if (!selectedProperty && !item.property_category) {
          validationErrors.push("Property Category is required");
          itemErrors.property_category = "Property Category is required";
        }
        if (!item.property_item) {
          validationErrors.push("Property Item is required");
          itemErrors.property_item = "Property Item is required";
        }
        if (!item.measurement_unit) {
          validationErrors.push("Measurement Unit is required");
          itemErrors.measurement_unit = "Measurement Unit is required";
        }
        if (!item.property_bag) {
          validationErrors.push("Property Bag is required");
          itemErrors.property_bag = "Property Bag is required";
        }
        if (!item.property_status) {
          validationErrors.push("Property Status is required");
          itemErrors.property_status = "Property Status is required";
        }
        if (!item.quantity || item.quantity.trim() === '') {
          validationErrors.push("Quantity is required");
          itemErrors.quantity = "Quantity is required";
        }
        
        if (validationErrors.length > 0) {
          // Set validation errors for this property item
          setPropertyItemValidationErrors({ [item.id]: itemErrors });
          toast.error(validationErrors.join(", "));
          return;
        }
        
        // Clear validation errors if all fields are valid
        setPropertyItemValidationErrors({});

        const property: Property = {
          prisoner: prisonerInfo.prisoner,
          visitor: visitorInfo.visitor,
          biometric_consent: biometricData !== "",
          is_active: true,
          deleted_datetime: null,
          deleted_by: null,
          property_type: item.property_type,
          property_item: item.property_item,
          measurement_unit: item.measurement_unit,
          property_bag: item.property_bag,
          currency: item.currency,
          next_of_kin: item.next_of_kin,
          property_status: item.property_status,
          quantity: item.quantity,
          amount: item.amount,
          note: item.note,
          destination: item.destination,
          visitor_item: item.visitor_item,
        }
        // console.log(property)
        try {
          if (selectedProperty === null) {
             const response = await addProperty(property)
              if (handleResponseError(response)) return

             // Fetch the complete property with all _name fields for display
             const createdProperty = response as PrisonerProperty;
             const fullPropertyResponse = await fetchPropertyById(createdProperty.id);
             
             if ('error' in fullPropertyResponse) {
               // Fallback to response if fetch fails
               setProperties(prev => ([createdProperty, ...prev]));
             } else {
               // Use the full property with all display names
               setProperties(prev => ([fullPropertyResponse, ...prev]));
             }
             
             // Trigger DataTable refresh by incrementing key
             setDataTableRefreshKey(prev => prev + 1);
             toast.success("Property created successfully");
          }
          else {
             const response = await updateProperty(property, selectedProperty.id)
             
             // Fetch the updated property with all _name fields
             const fullPropertyResponse = await fetchPropertyById(selectedProperty.id);
             
             setProperties(prev =>
                prev.map(item =>
                  item.id === selectedProperty.id ? 
                    ('error' in fullPropertyResponse ? response as PrisonerProperty : fullPropertyResponse) : 
                    item
                )
             );
             
             // Trigger DataTable refresh by incrementing key
             setDataTableRefreshKey(prev => prev + 1);
             toast.success("Property updated successfully");
          }

          resetFields()
          setIsCreateDialogOpen(false)
        }catch (error) {
          handleCatchError(error)
        }
    }

    function resetFields () {
      setPrisonerInfo({prisoner: ""})
      setVisitorInfo({visitor: ""})
      setPropertyItems([{
        id: '1',
        property_type: '',
        property_category: '',
        property_item: '',
        measurement_unit: '',
        property_bag: '',
        next_of_kin: '',
        property_status: '',
        quantity: '',
        amount: '',
        note: '',
        destination: '',
        visitor_item: '',
        currency: '',
      }])
      setBiometricData("")
    }

    // Sync prisoner details to parent whenever they change
    useEffect(() => {
      if (selectedPrisonerDetails) {
        setParentPrisonerInfo({
          prisoner: selectedPrisonerDetails.id,
          prisonerName: selectedPrisonerDetails.name,
          prisonerNumber: selectedPrisonerDetails.number
        });
      } else {
        setParentPrisonerInfo({
          prisoner: '',
          prisonerName: '',
          prisonerNumber: ''
        });
      }
    }, [selectedPrisonerDetails]);

    // Sync local state with record data (edit mode)
    useEffect(() => {
      if (selectedProperty && mode === "edit") {
        if (selectedProperty.prisoner) {
          setLocalPrisonerValue(selectedProperty.prisoner);
          setPrisonerInfo(prev => ({ ...prev, prisoner: selectedProperty.prisoner }));
          isPrisonerInitialized.current = true;
          // Set prisoner details for Next of Kin dialog in edit mode
          setSelectedPrisonerDetails({
            id: selectedProperty.prisoner,
            name: selectedProperty.prisoner_name || '',
            number: '' // Prisoner number not available in property response
          });
        }
        if (selectedProperty.visitor) {
          setLocalVisitorValue(selectedProperty.visitor);
          setVisitorInfo(prev => ({ ...prev, visitor: selectedProperty.visitor }));
          isVisitorInitialized.current = true;
        }
      } else if (mode === "add") {
        // Reset for add mode
        setLocalPrisonerValue(null);
        setLocalVisitorValue(null);
        setPrisonerInfo({ prisoner: '' });
        setVisitorInfo({ visitor: '' });
        isPrisonerInitialized.current = false;
        isVisitorInitialized.current = false;
        setSelectedPrisonerDetails(null);
      }
    }, [selectedProperty, mode]);

    // Clear visitor and related fields when prisoner changes (except during initial edit mode load)
    useEffect(() => {
      if (!prisonerInfo.prisoner) return;
      
      // Skip if this is the initial edit mode load
      if (mode === "edit" && selectedProperty?.prisoner === prisonerInfo.prisoner && isPrisonerInitialized.current) {
        return;
      }
      
      // Clear visitor selection when prisoner changes
      if (visitorInfo.visitor) {
        setLocalVisitorValue(null);
        setVisitorInfo({ visitor: '' });
        setVisitorItems([]);
        
        // Clear all property item fields when prisoner changes
        setPropertyItems([{
          id: '1',
          property_type: '',
          property_category: '',
          property_item: '',
          measurement_unit: '',
          property_bag: '',
          next_of_kin: '',
          property_status: '',
          quantity: '',
          amount: '',
          note: '',
          destination: '',
          visitor_item: '',
          currency: '',
        }]);
        
        toast.info("Visitor and property details cleared. Please enter details for the new prisoner.");
      } else {
        // Even if no visitor was selected, clear all fields when prisoner changes
        setPropertyItems([{
          id: '1',
          property_type: '',
          property_category: '',
          property_item: '',
          measurement_unit: '',
          property_bag: '',
          next_of_kin: '',
          property_status: '',
          quantity: '',
          amount: '',
          note: '',
          destination: '',
          visitor_item: '',
          currency: '',
        }]);
      }
    }, [prisonerInfo.prisoner]);

    // Fetch next of kin when prisoner changes
    useEffect(() => {
      if (!prisonerInfo.prisoner) return;
      
      // Skip if editing and value hasn't changed
      if (mode === "edit" && selectedProperty?.prisoner === prisonerInfo.prisoner) return;

      const controller = new AbortController();
      
      const fetchNextOfKin = async () => {
        try {
          const response = await getNextOfKins(prisonerInfo.prisoner);
          if (handleServerError(response, setNewDialogLoader)) return;
          if ("results" in response) {
            setNextOfKins(response.results);
            if (response.results.length === 0) {
              toast.info("The selected prisoner has no registered next of kin.");
            }
          }
        } catch (error: any) {
          // Silence cancellation errors
          if (error.name === 'CanceledError' || error.name === 'AbortError' || 
              error.code === 'ERR_CANCELED') return;
          handleCatchError(error);
        }
      };

      fetchNextOfKin();

      return () => controller.abort();
    }, [prisonerInfo.prisoner, mode, selectedProperty?.prisoner]);

    // Check if selected prisoner has visitors
    useEffect(() => {
      if (!prisonerInfo.prisoner) return;
      
      // Skip if editing
      if (mode === "edit" && selectedProperty?.prisoner === prisonerInfo.prisoner) return;

      const checkVisitors = async () => {
        try {
          const response = await fetchVisitorsPaginated(1, '', prisonerInfo.prisoner);
          if (response.count === 0 || !response.results || response.results.length === 0) {
            toast.info("The selected prisoner has no registered visitors.");
          }
        } catch (error: any) {
          // Silence errors - just a notification check
        }
      };

      // Small delay to avoid showing notification too early
      const timer = setTimeout(checkVisitors, 500);
      return () => clearTimeout(timer);
    }, [prisonerInfo.prisoner, mode, selectedProperty?.prisoner]);

    // Fetch visitor items when visitor changes
    useEffect(() => {
      if (!visitorInfo.visitor) {
        setVisitorItems([]);
        // Clear visitor_item selection in property items when visitor is cleared
        setPropertyItems(prevItems => 
          prevItems.map(item => ({
            ...item,
            visitor_item: ''
          }))
        );
        return;
      }

      const controller = new AbortController();
      
      const fetchItems = async () => {
        try {
          setLoaderText("Fetching Visitor items, Please wait...");
          setNewDialogLoader(true);
          const response = await getVisitorItems2(visitorInfo.visitor);
          if (handleServerError(response, setNewDialogLoader)) return;
          if ("results" in response) {
            setVisitorItems(response.results);
            if (response.results.length === 0 && mode === "add") {
              toast.info("The selected visitor has no registered items.");
            }
          }
        } catch (error: any) {
          // Silence cancellation errors
          if (error.name === 'CanceledError' || error.name === 'AbortError' || 
              error.code === 'ERR_CANCELED') return;
          handleCatchError(error);
        } finally {
          setNewDialogLoader(false);
        }
      };

      fetchItems();

      return () => controller.abort();
    }, [visitorInfo.visitor, mode]);

  // Derive initialItem for prisoner dropdown (edit mode)
  const initialPrisonerItem = (selectedProperty && mode === "edit" && selectedProperty.prisoner && selectedProperty.prisoner_name)
    ? { id: selectedProperty.prisoner, full_name: selectedProperty.prisoner_name }
    : undefined;

  // Derive initialItem for visitor dropdown (edit mode)
  const initialVisitorItem = (selectedProperty && mode === "edit" && selectedProperty.visitor && selectedProperty.visitor_name)
    ? { id: selectedProperty.visitor, first_name: selectedProperty.visitor_name.split(' ')[0] || '', middle_name: selectedProperty.visitor_name.split(' ')[1] || '', last_name: selectedProperty.visitor_name.split(' ')[2] || '' }
    : undefined;

  return (
      <div className="h-full" style={{marginTop: '10px'}}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Prisoner Information Section */}
          <Card className="border-2" style={{borderColor: '#650000'}}>
            <div className="p-4">
              <h3 className="mb-4" style={{color: '#650000'}}>Prisoner Information</h3>
              <div className="space-y-2">
                <Label htmlFor="prisoner">Prisoner <span className="text-red-500">*</span></Label>
                <Controller
                  name="prisoner"
                  control={control}
                  rules={requiredValidation("Prisoner")}
                  defaultValue={selectedProperty?.prisoner || null}
                  render={({ field }) => (
                    <CustomPrisonerSearch
                      key={`prisoner-${isOpen}-${selectedProperty?.id}`}
                      value={localPrisonerValue}
                      onChange={(v) => {
                        setLocalPrisonerValue(v ?? null);
                        setPrisonerInfo(prev => ({ ...prev, prisoner: v || '' }));
                        field.onChange(v ?? null);
                        if (v) clearErrors('prisoner');
                        
                        // Clear prisoner details when prisoner is cleared
                        if (!v) {
                          setSelectedPrisonerDetails(null);
                        }
                      }}
                      onSelectItem={(prisoner: any) => {
                        if (prisoner) {
                          // Store complete prisoner details directly from selection
                          setSelectedPrisonerDetails({
                            id: prisoner.id,
                            name: prisoner.full_name || '',
                            number: prisoner.prisoner_number_value || prisoner.prisoner_number || ''
                          });
                        } else {
                          setSelectedPrisonerDetails(null);
                        }
                      }}
                      disabled={mode === "edit"}
                      placeholder="Search prisoner by name or number..."
                      initialItems={initialPrisonerItem ? [initialPrisonerItem] : []}
                    />
                  )}
                />
                {errors.prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(errors.prisoner as any).message}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Visitor Information Section */}
          <Card className="border-2" style={{borderColor: '#650000'}}>
            <div className="p-4">
              <h3 className="mb-4" style={{color: '#650000'}}>Visitor Information</h3>
              <div className="space-y-2">
                <Label htmlFor="visitor">Visitor (Optional)</Label>
                <SearchableSelect
                  key={`visitor-${isOpen}-${selectedProperty?.id}`}
                  value={localVisitorValue}
                  onChange={(v) => {
                    setLocalVisitorValue(v ?? null);
                    setVisitorInfo(prev => ({ ...prev, visitor: v || '' }));
                  }}
                  disabled={!prisonerInfo.prisoner}
                  fetchPaginated={async (opts, signal) => {
                    const response = await fetchVisitorsPaginated(
                      opts.page || 1, 
                      opts.search || '', 
                      prisonerInfo.prisoner
                    );
                    return {
                      items: response.results || [],
                      count: response.count,
                      next: response.next
                    };
                  }}
                  renderItem={(visitor: any) => {
                    const fullName = `${visitor.first_name || ''} ${visitor.middle_name || ''} ${visitor.last_name || ''}`.replace(/\s+/g, ' ').trim();
                    return (
                      <div className="flex flex-col">
                        <span>{fullName}</span>
                        <span className="text-xs text-gray-500">
                          ID: {visitor.id_number || 'N/A'} | Phone: {visitor.contact_no || 'N/A'}
                        </span>
                      </div>
                    );
                  }}
                  labelField="first_name"
                  placeholder="Search visitor by name, ID, or phone..."
                  initialItem={initialVisitorItem}
                />
              </div>
            </div>
          </Card>
            <Collapsible open={isPropertyItemsOpen} onOpenChange={setIsPropertyItemsOpen}>
              <Card className="border-2" style={{borderColor: isPropertyItemsOpen ? '#650000' : '#e5e7eb'}}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                    <h3 className="flex items-center gap-2" style={{color: '#650000'}}>
                      <Package className="h-5 w-5"/>
                      {/*Property Items*/}
                      Property Item
                      {/*<Badge variant="secondary">{propertyItems.length}</Badge>*/}
                    </h3>
                    {/*<div className="flex items-center gap-2">*/}
                    {/*  <Button*/}
                    {/*    type="button"*/}
                    {/*    onClick={(e) => {*/}
                    {/*      e.stopPropagation();*/}
                    {/*      handleAddPropertyItem();*/}
                    {/*    }}*/}
                    {/*    size="sm"*/}
                    {/*    style={{ backgroundColor: '#650000' }}*/}
                    {/*  >*/}
                    {/*    <Plus className="h-4 w-4 mr-2" />*/}
                    {/*    Add Item*/}
                    {/*  </Button>*/}
                    {/*  {isPropertyItemsOpen ? (*/}
                    {/*    <ChevronUp className="h-5 w-5" style={{ color: '#650000' }} />*/}
                    {/*  ) : (*/}
                    {/*    <ChevronDown className="h-5 w-5" style={{ color: '#650000' }} />*/}
                    {/*  )}*/}
                    {/*</div>*/}
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="p-4 pt-0 space-y-4">
                    {propertyItems.map((item, index) => (
                        <PropertyItem
                            ref={propertyItemRef}
                            key={item.id}
                            item={item}
                            propertyItems={propertyItems}
                            index={index}
                            setPropertyItems={setPropertyItems}
                            visitorItems={visitorItems}
                            setNewDialogLoader={setNewDialogLoader}
                            setLoaderText={setLoaderText}
                            nextOfKins={nextOfKins}
                            setIsNextCreateDialogOpen={setIsNextCreateDialogOpen}
                            onUpdate={handleUpdatePropertyItem}
                            propertyTypes={propertyTypes}
                            propertyStatuses={propertyStatuses}
                            loading={loading}
                            setLoading={setLoading}
                            prisonerInfo={prisonerInfo}
                            visitorInfo={visitorInfo}
                            itemCategories={itemCategories}
                            units={units}
                            selectedProperty={selectedProperty}
                            propertyBags={propertyBags}
                            validationErrorsFromParent={propertyItemValidationErrors[item.id]}
                            selectedPrisonerDetails={selectedPrisonerDetails}
                            setParentPrisonerInfo={setParentPrisonerInfo}
                        />
                    ))}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
             <Card className="border-2" style={{borderColor: '#650000'}}>
                <div className="p-4">
                  <h3 className="mb-4" style={{color: '#650000'}}>Biometric Capture/Verification</h3>
                  <BiometricCapture
                      value={biometricData}
                      onChange={setBiometricData}
                      label="Prisoner Fingerprint Verification"
                  />
                </div>
              </Card>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" style={{backgroundColor: '#650000'}}>
                {
                  selectedProperty === null ? "Create Property" : "Update Property"
                }
                {/*Create {propertyItems.length} {propertyItems.length > 1 ? 'Properties' : 'Property'}*/}
              </Button>
            </DialogFooter>

        </form>
      </div>
  );
}

export default CreatePropertyForm