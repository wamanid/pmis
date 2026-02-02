import React, {useState, useImperativeHandle, forwardRef} from "react";
import {NextOfKinResponse, fetchNextOfKinPaginated} from "../../services/admission/nextOfKinService";
import {
    DefaultPropertyItem, getPropertyBags, getPropertyItems, getPropertyStatuses,
    getPropertyTypes, PrisonerProperty,
    PropertyBag,
    PropertyItem,
    fetchPropertyTypesPaginated,
    fetchPropertyStatusesPaginated,
    fetchPropertyBagsPaginated,
    fetchItemCategoriesPaginated,
    fetchMeasurementUnitsPaginated,
    fetchPropertyItemsPaginated,
    fetchCurrenciesPaginated
} from "../../services/propertyServices/propertyService";
import {ItemCategory, Unit, VisitorItem, fetchVisitorItemsPaginated} from "../../services/stationServices/visitorsServices/visitorItem";
import axiosInstance from "../../services/axiosInstance";
import {Card} from "../ui/card";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "../ui/collapsible";
import {Check, ChevronDown, ChevronsUpDown, ChevronUp, Plus, Tag, Trash2} from "lucide-react";
import SearchableSelect from "../common/SearchableSelect";
import {Badge} from "../ui/badge";
import {Button} from "../ui/button";
import {Label} from "../ui/label";
import {Popover, PopoverContent, PopoverTrigger} from "../ui/popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "../ui/command";
import {cn} from "../ui/utils";
import {Input} from "../ui/input";
import {Textarea} from "../ui/textarea";
import {
    getPropertyTypeUtil,
    handleCatchError,
    handleEmptyList,
    handleServerError
} from "../../services/stationServices/utils";
import {toast} from "sonner";

interface ChildProps {
  setPropertyItems: React.Dispatch<React.SetStateAction<DefaultPropertyItem[]>>;
  item: DefaultPropertyItem
  propertyItems: DefaultPropertyItem[]
  index: number
  visitorItems: VisitorItem[]
  setNewDialogLoader: React.Dispatch<React.SetStateAction<boolean>>;
  setLoaderText: React.Dispatch<React.SetStateAction<string>>;
  nextOfKins: NextOfKinResponse[]
  setIsNextCreateDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onUpdate: (itemId: string, updatedFields: Partial<DefaultPropertyItem>) => void;
  // onUpdate: (itemId: string, field: string, value: any) => void;
  propertyTypes: Unit[]
  propertyStatuses: Unit[]
  loading: any
  setLoading: React.Dispatch<React.SetStateAction<any>>;
  prisonerInfo: any
  visitorInfo: any
  itemCategories: ItemCategory[]
  units: Unit[]
  selectedProperty: PrisonerProperty
  propertyBags: PropertyBag[]
  validationErrorsFromParent?: Record<string, string>;
  selectedPrisonerDetails: {id: string, name: string, number: string} | null;
  setParentPrisonerInfo: React.Dispatch<React.SetStateAction<{prisoner: string; prisonerName: string; prisonerNumber: string}>>;
}

// export default function PropertyItem() {
// const PropertyItem React.FC<ChildProps> = ({ }) => {
const PropertyItem = forwardRef<{ syncTextFields: () => any; getData: () => DefaultPropertyItem }, ChildProps>(({ setPropertyItems, index, item, visitorItems,
                                                setNewDialogLoader, setLoaderText, nextOfKins,
                                                setIsNextCreateDialogOpen, propertyItems, onUpdate, propertyTypes,
                                                propertyStatuses, loading, setLoading, prisonerInfo, visitorInfo,
                                                itemCategories, units, selectedProperty, propertyBags, validationErrorsFromParent,
                                                selectedPrisonerDetails, setParentPrisonerInfo }, ref) => {

    const [isItemOpen, setIsItemOpen] = useState(true);
    
    // Validation errors state
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    
    // Local state for SearchableSelect dropdowns - Initialize with item values for edit mode
    const [localVisitorItem, setLocalVisitorItem] = useState<string | null>(() => item.visitor_item || null);
    const [localPropertyType, setLocalPropertyType] = useState<string | null>(() => item.property_type || null);
    const [localPropertyCategory, setLocalPropertyCategory] = useState<string | null>(() => item.property_category || null);
    const [localPropertyItem, setLocalPropertyItem] = useState<string | null>(() => item.property_item || null);
    const [localMeasurementUnit, setLocalMeasurementUnit] = useState<string | null>(() => item.measurement_unit || null);
    const [localPropertyBag, setLocalPropertyBag] = useState<string | null>(() => item.property_bag || null);
    const [localPropertyStatus, setLocalPropertyStatus] = useState<string | null>(() => item.property_status || null);
    const [localNextOfKin, setLocalNextOfKin] = useState<string | null>(() => item.next_of_kin || null);
    const [localCurrency, setLocalCurrency] = useState<string | null>(() => item.currency || null);
    
    // Local state for text inputs - prevents API calls on every keystroke
    const [localQuantity, setLocalQuantity] = useState<string>(() => item.quantity || '');
    const [localAmount, setLocalAmount] = useState<string>(() => item.amount || '');
    const [localNote, setLocalNote] = useState<string>(() => item.note || '');
    const [localDestination, setLocalDestination] = useState<string>(() => item.destination || '');
    
    // Sync local state when item prop changes (important for edit mode)
    React.useEffect(() => {
        setLocalVisitorItem(item.visitor_item || null);
        setLocalPropertyType(item.property_type || null);
        setLocalPropertyCategory(item.property_category || null);
        setLocalPropertyItem(item.property_item || null);
        setLocalMeasurementUnit(item.measurement_unit || null);
        setLocalPropertyBag(item.property_bag || null);
        setLocalPropertyStatus(item.property_status || null);
        setLocalNextOfKin(item.next_of_kin || null);
        setLocalCurrency(item.currency || null);
        
        // Sync text inputs
        setLocalQuantity(item.quantity || '');
        setLocalAmount(item.amount || '');
        setLocalNote(item.note || '');
        setLocalDestination(item.destination || '');
    }, [item.visitor_item, item.property_type, item.property_category, item.property_item, 
        item.measurement_unit, item.property_bag, item.property_status, item.next_of_kin, item.currency,
        item.quantity, item.amount, item.note, item.destination]);

    // Receive validation errors from parent
    React.useEffect(() => {
        if (validationErrorsFromParent) {
            setValidationErrors(validationErrorsFromParent);
        }
    }, [validationErrorsFromParent]);

    const [typeLoader, setTypeLoader] = useState(false)
    const [propertyItemsX, setPropertyItemsX] = useState<PropertyItem[]>([])

    // Derive initialItem objects for edit mode (using selectedProperty with _name fields)
    const mode = selectedProperty ? "edit" : "add";
    
    // Use React.useMemo to derive initialItem objects so they update when dependencies change
    const initialVisitorItem = React.useMemo(() => {
        if (selectedProperty && mode === "edit" && item.visitor_item && visitorItems.length > 0) {
            return visitorItems.find(vi => vi.id === item.visitor_item);
        }
        return undefined;
    }, [selectedProperty, mode, item.visitor_item, visitorItems]);
    
    const initialPropertyType = React.useMemo(() => {
        if (selectedProperty && mode === "edit" && item.property_type && selectedProperty.property_type_name) {
            return { id: item.property_type, name: selectedProperty.property_type_name };
        }
        return undefined;
    }, [selectedProperty, mode, item.property_type, selectedProperty?.property_type_name]);

    // Derive initialItem objects directly (not useMemo) per SEARCHABLE_DROPDOWN_EDIT_MODE_GUIDE.md
    const initialPropertyItem = (selectedProperty && mode === "edit" && item.property_item && selectedProperty.property_item_name)
        ? { id: item.property_item, name: selectedProperty.property_item_name }
        : undefined;

    const initialMeasurementUnit = (selectedProperty && mode === "edit" && item.measurement_unit && selectedProperty.measurement_unit_name)
        ? { id: item.measurement_unit, name: selectedProperty.measurement_unit_name }
        : undefined;
    
    const initialPropertyBag = React.useMemo(() => {
        if (selectedProperty && mode === "edit" && item.property_bag && selectedProperty.property_bag_number) {
            return { id: item.property_bag, bag_number: selectedProperty.property_bag_number };
        }
        return undefined;
    }, [selectedProperty, mode, item.property_bag, selectedProperty?.property_bag_number]);
    
    const initialPropertyStatus = React.useMemo(() => {
        if (selectedProperty && mode === "edit" && item.property_status && selectedProperty.property_status_name) {
            return { id: item.property_status, name: selectedProperty.property_status_name };
        }
        return undefined;
    }, [selectedProperty, mode, item.property_status, selectedProperty?.property_status_name]);
    
    const initialNextOfKin = React.useMemo(() => {
        if (selectedProperty && mode === "edit" && item.next_of_kin && selectedProperty.next_of_kin_name) {
            return { id: item.next_of_kin, full_name: selectedProperty.next_of_kin_name };
        }
        return undefined;
    }, [selectedProperty, mode, item.next_of_kin, selectedProperty?.next_of_kin_name]);

    const propertyTypeName = item.property_type
      ? propertyTypes.find((t) => t.id === item.property_type)?.name
      : null;
    const propertyItemName = item.property_item
      ? propertyItemsX.find((i) => i.id === item.property_item)?.name
      : null;

    const handleVisitorItemSelect = async (visitorItemId: string, visitorItemData: any) => {
        const propertyTypeId = getPropertyTypeUtil(propertyTypes);
        
        // Update ALL local state fields that should be auto-populated
        setLocalVisitorItem(visitorItemId);
        setLocalQuantity(visitorItemData.quantity?.toString() || '');
        setLocalPropertyType(propertyTypeId);
        setLocalAmount(visitorItemData.amount?.toString() || '');
        setLocalPropertyCategory(visitorItemData.item_category || null);
        setLocalPropertyItem(visitorItemData.item || null);
        setLocalMeasurementUnit(visitorItemData.measurement_unit || null);
        setLocalCurrency(visitorItemData.currency || null);

      await fetchPropertyData(visitorItemData)
    };

    async function fetchPropertyData(visitorItem: VisitorItem) {
       setNewDialogLoader(true)
       setLoaderText("Fetching Property information")
       // setLoading(prev => ({...prev, type: false}))
        try {

           if (!propertyTypes.length){
               toast.error("There are no property types")
               return
           }

           if (!propertyStatuses.length){
               toast.error("There are no property statuses")
               return
           }

            await getPropertyData(visitorItem.item_category)

            // setLoading(prev => ({...prev, type: true}))

        }catch (error) {
          handleCatchError(error)
        }finally {
          setNewDialogLoader(false)
        }
    }

    async function getPropertyItemsInfo(categoryId: string) {
         setNewDialogLoader(true)
         setLoaderText("Fetching Property information")
        try {
             await getPropertyData(categoryId)
        }catch (error) {
          handleCatchError(error)
        }finally {
          setNewDialogLoader(false)
        }

    }

    async function getPropertyData(categoryId: string) {
         const response2 = await getPropertyItems(categoryId)
         const ok2 = populateListX(response2, "There are no property items", setPropertyItemsX)
         if(!ok2) return
    }

    function populateListX(response: any, msg: string, setData: any) {
      if(handleServerError(response, setNewDialogLoader)) return false

      if ("results" in response) {
        const data = response.results
        if (handleEmptyList(data, msg, setNewDialogLoader)) return false
        setData(data)
        return true
      }

      return false
    }

    // Update local state for dropdown changes (NO parent update - prevents API refetches)
    function handleChange (name: string, value: string){
        // Update appropriate local state based on field name
        switch(name) {
          case 'property_type':
            setLocalPropertyType(value);
            break;
          case 'property_category':
            setLocalPropertyCategory(value);
            break;
          case 'property_item':
            setLocalPropertyItem(value);
            break;
          case 'measurement_unit':
            setLocalMeasurementUnit(value);
            break;
          case 'currency':
            setLocalCurrency(value);
            break;
          case 'property_bag':
            setLocalPropertyBag(value);
            break;
          case 'property_status':
            setLocalPropertyStatus(value);
            break;
          case 'next_of_kin':
            setLocalNextOfKin(value);
            break;
          case 'visitor_item':
            setLocalVisitorItem(value);
            break;
        }
        
        // Clear validation error when field is filled
        if (value && validationErrors[name]) {
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
          });
        }
    }

    // Update local state on every keystroke (no API call)
    const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          const { name, value } = e.target;
          
          // Update local state based on field name
          switch(name) {
            case 'quantity':
              setLocalQuantity(value);
              break;
            case 'amount':
              setLocalAmount(value);
              break;
            case 'note':
              setLocalNote(value);
              break;
            case 'destination':
              setLocalDestination(value);
              break;
          }
          
          // Clear validation error when field is filled
          if (value && validationErrors[name]) {
            setValidationErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[name];
              return newErrors;
            });
          }
    };
    
    // Sync local text state to parent (called before form submission)
    React.useImperativeHandle(ref, () => ({
      syncTextFields: () => {
        // Return the complete item data instead of calling onUpdate
        return {
          quantity: localQuantity,
          amount: localAmount,
          note: localNote,
          destination: localDestination
        };
      },
      // Expose method to get all current field values
      getData: () => ({
        id: item.id,
        property_type: localPropertyType || '',
        property_category: localPropertyCategory || '',
        property_item: localPropertyItem || '',
        measurement_unit: localMeasurementUnit || '',
        property_bag: localPropertyBag || '',
        next_of_kin: localNextOfKin || '',
        property_status: localPropertyStatus || '',
        quantity: localQuantity,
        amount: localAmount,
        note: localNote,
        destination: localDestination,
        visitor_item: localVisitorItem || '',
        currency: localCurrency || ''
      })
    }), [localQuantity, localAmount, localNote, localDestination, localVisitorItem, 
        localPropertyType, localPropertyCategory, localPropertyItem, localMeasurementUnit,
        localPropertyBag, localPropertyStatus, localNextOfKin, localCurrency, item.id]);

    return (
        <Collapsible open={isItemOpen} onOpenChange={setIsItemOpen}>
        <Card className="relative border-2" style={{ borderColor: isItemOpen ? '#650000' : '#e5e7eb' }}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" style={{ color: '#650000' }} />
                  {/*<h4 className="font-medium">Item #{index + 1}</h4>*/}
                  <h4 className="font-medium">Item Details</h4>
                </div>
                {!isItemOpen && (propertyTypeName || propertyItemName) && (
                  <div className="flex gap-2">
                    {propertyTypeName && (
                      <Badge variant="secondary">{propertyTypeName}</Badge>
                    )}
                    {propertyItemName && (
                      <Badge variant="outline">{propertyItemName}</Badge>
                    )}
                  </div>
                )}
              </div>
              {/*<div className="flex items-center gap-2">*/}
              {/*  {canRemove && (*/}
              {/*    <Button*/}
              {/*      type="button"*/}
              {/*      variant="ghost"*/}
              {/*      size="sm"*/}
              {/*      className="hover:bg-red-50"*/}
              {/*      onClick={(e) => {*/}
              {/*        e.stopPropagation();*/}
              {/*        onRemove(item.id);*/}
              {/*      }}*/}
              {/*    >*/}
              {/*      <Trash2 className="h-4 w-4 text-red-600" />*/}
              {/*    </Button>*/}
              {/*  )}*/}
              {/*  {isItemOpen ? (*/}
              {/*    <ChevronUp className="h-5 w-5" style={{ color: '#650000' }} />*/}
              {/*  ) : (*/}
              {/*    <ChevronDown className="h-5 w-5" style={{ color: '#650000' }} />*/}
              {/*  )}*/}
              {/*</div>*/}
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="px-4 pb-4">{/* Content wrapper */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Visitor Item - SearchableSelect */}
              {
                  !!visitorInfo.visitor && (
                       <div className="space-y-2 md:col-span-2">
                        <Label>Select Visitor Item (Optional)</Label>
                        <SearchableSelect
                          key={`visitor-item-${selectedProperty?.id || 'new'}-${item.visitor_item}`}
                          value={localVisitorItem}
                          onChange={(v) => {
                            setLocalVisitorItem(v ?? null);
                            // Fetch full item data to populate other fields
                            if (v) {
                              fetchVisitorItemsPaginated(1, '', visitorInfo.visitor, false).then(response => {
                                const selectedItem = response.results?.find((item: any) => item.id === v);
                                if (selectedItem) {
                                  handleVisitorItemSelect(v, selectedItem);
                                }
                              });
                            } else {
                              // Clear visitor item local state
                              setLocalVisitorItem(null);
                              setLocalPropertyCategory(null);
                              setLocalPropertyItem(null);
                              setLocalMeasurementUnit(null);
                              setLocalCurrency(null);
                            }
                          }}
                          fetchPaginated={async (opts, signal) => {
                            const response = await fetchVisitorItemsPaginated(
                              opts.page || 1,
                              opts.search || '',
                              visitorInfo.visitor,
                              false
                            );
                            return {
                              items: response.results || [],
                              count: response.count,
                              next: response.next
                            };
                          }}
                          renderItem={(visitorItem: any) => (
                            <div className="flex flex-col w-full">
                              <span className="font-medium">{visitorItem.item_name} ({visitorItem.category_name})</span>
                              <span className="text-xs text-gray-500">Bag: {visitorItem.bag_no}</span>
                            </div>
                          )}
                          labelField="item_name"
                          placeholder="Search by item name..."
                          initialItem={initialVisitorItem}
                        />
                      </div>
                  )
              }

              <>
                   {/* Property Type - SearchableSelect */}
                    <div className="space-y-2">
                      <Label>Property Type <span className="text-red-500">*</span></Label>
                      {localVisitorItem ? (
                        <Input
                          value={propertyTypes.find(type => type.name === "Incoming Supplementary")?.name || "Incoming Supplementary"}
                          disabled
                          className="bg-gray-100"
                        />
                      ) : (
                        <>
                        <SearchableSelect
                          key={`property-type-${selectedProperty?.id || 'new'}-${item.property_type}`}
                          value={localPropertyType}
                          onChange={(v) => {
                            setLocalPropertyType(v ?? null);
                            handleChange("property_type", v || '');
                          }}
                          fetchPaginated={async (opts, signal) => {
                            const response = await fetchPropertyTypesPaginated(opts.page || 1, opts.search || '');
                            return {
                              items: response.results || [],
                              count: response.count,
                              next: response.next
                            };
                          }}
                          labelField="name"
                          placeholder="Select property type..."
                          initialItem={initialPropertyType}
                        />
                        {validationErrors.property_type && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.property_type}</p>
                        )}
                        </>
                      )}
                    </div>

                    {/* Property Category - SearchableSelect (Hidden in edit mode) */}
                    {mode === "add" && (
                      <div className="space-y-2">
                        <Label>Property Category <span className="text-red-500">*</span></Label>
                        {localVisitorItem ? (
                          <Input
                            value={visitorItems.find(vi => vi.id === localVisitorItem)?.category_name || ''}
                            disabled
                            className="bg-gray-100"
                          />
                        ) : (
                          <>
                            <SearchableSelect
                              value={localPropertyCategory}
                              onChange={(v) => {
                                setLocalPropertyCategory(v ?? null);
                                handleChange("property_category", v || '');
                                if (v) {
                                  getPropertyItemsInfo(v);
                                }
                              }}
                              fetchPaginated={async (opts, signal) => {
                                const response = await fetchItemCategoriesPaginated(opts.page || 1, opts.search || '');
                                return {
                                  items: response.results || [],
                                  count: response.count,
                                  next: response.next
                                };
                              }}
                              labelField="name"
                              placeholder="Select category..."
                            />
                            {validationErrors.property_category && (
                              <p className="text-red-500 text-sm mt-1">{validationErrors.property_category}</p>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Property Item - Note: This uses /system-administration/items/ API */}
                    <div className="space-y-2">
                      <Label>Property Item <span className="text-red-500">*</span></Label>
                      {localVisitorItem ? (
                        <Input
                          value={visitorItems.find(vi => vi.id === localVisitorItem)?.item_name || ''}
                          disabled
                          className="bg-gray-100"
                        />
                      ) : (
                        <>
                          <SearchableSelect
                            key={`property-item-${selectedProperty?.id || 'new'}-${mode}-${localPropertyCategory}`}
                            value={localPropertyItem}
                            onChange={(v) => {
                              setLocalPropertyItem(v ?? null);
                              handleChange("property_item", v || '');
                            }}
                            fetchPaginated={async (opts, signal) => {
                              const response = await fetchPropertyItemsPaginated(
                                opts.page || 1,
                                opts.search || '',
                                localPropertyCategory || undefined
                              );
                              return {
                                items: response.results || [],
                                count: response.count,
                                next: response.next
                              };
                            }}
                            labelField="name"
                            placeholder="Select item..."
                            initialItem={initialPropertyItem}
                          />
                          {validationErrors.property_item && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.property_item}</p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Measurement Unit - SearchableSelect */}
                    <div className="space-y-2">
                      <Label>Measurement Unit</Label>
                      {localVisitorItem ? (
                        <Input
                          value={visitorItems.find(vi => vi.id === localVisitorItem)?.measurement_unit_name || ''}
                          disabled
                          className="bg-gray-100"
                        />
                      ) : (
                        <SearchableSelect
                          key={`measurement-unit-${selectedProperty?.id || 'new'}-${mode}`}
                          value={localMeasurementUnit}
                          onChange={(v) => {
                            setLocalMeasurementUnit(v ?? null);
                            handleChange('measurement_unit', v || '');
                          }}
                          fetchPaginated={async (opts, signal) => {
                            const response = await fetchMeasurementUnitsPaginated(opts.page || 1, opts.search || '');
                            return {
                              items: response.results || [],
                              count: response.count,
                              next: response.next
                            };
                          }}
                          labelField="name"
                          placeholder="Select unit..."
                          initialItem={initialMeasurementUnit}
                        />
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                      <Label>Quantity <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        name="quantity"
                        value={localQuantity}
                        placeholder="Enter quantity"
                        onChange={handleInput}
                        disabled={ localVisitorItem !== null && localVisitorItem !== "" }
                        min="1"
                      />
                      {validationErrors.quantity && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.quantity}</p>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input
                        name="amount"
                        type="number"
                        value={localAmount}
                        onChange={handleInput}
                        placeholder="Enter amount"
                        disabled={ localVisitorItem !== null && localVisitorItem !== "" }
                      />
                    </div>

                    {/* Currency - SearchableSelect */}
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      {localVisitorItem ? (
                        <Input
                          value={visitorItems.find(vi => vi.id === localVisitorItem)?.currency_name || ''}
                          disabled
                          className="bg-gray-100"
                        />
                      ) : (
                        <SearchableSelect
                          key={`currency-${selectedProperty?.id || 'new'}-${mode}`}
                          value={localCurrency}
                          onChange={(v) => {
                            setLocalCurrency(v ?? null);
                            handleChange('currency', v || '');
                          }}
                          fetchPaginated={async (opts, signal) => {
                            const response = await fetchCurrenciesPaginated(opts.page || 1, opts.search || '');
                            return {
                              items: response.results || [],
                              count: response.count,
                              next: response.next
                            };
                          }}
                          labelField="name"
                          placeholder="Select currency..."
                        />
                      )}
                    </div>

                    {/* Property Bag - SearchableSelect */}
                    <div className="space-y-2">
                      <Label>Property Bag <span className="text-red-500">*</span></Label>
                      <>
                        <SearchableSelect
                          key={`property-bag-${selectedProperty?.id || 'new'}-${item.property_bag}`}
                          value={localPropertyBag}
                          onChange={(v) => {
                            setLocalPropertyBag(v ?? null);
                            handleChange("property_bag", v || '');
                          }}
                          fetchPaginated={async (opts, signal) => {
                            const response = await fetchPropertyBagsPaginated(opts.page || 1, opts.search || '');
                            return {
                              items: response.results || [],
                              count: response.count,
                              next: response.next
                            };
                          }}
                          labelField="bag_number"
                          placeholder="Select bag..."
                          initialItem={initialPropertyBag}
                        />
                        {validationErrors.property_bag && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.property_bag}</p>
                        )}
                      </>
                    </div>

                    {/* Property Status - SearchableSelect */}
                    <div className="space-y-2">
                      <Label>Property Status <span className="text-red-500">*</span></Label>
                      <>
                        <SearchableSelect
                          key={`property-status-${selectedProperty?.id || 'new'}-${item.property_status}`}
                          value={localPropertyStatus}
                          onChange={(v) => {
                              setLocalPropertyStatus(v ?? null);
                              handleChange("property_status", v || '');
                            }}
                            fetchPaginated={async (opts, signal) => {
                              const response = await fetchPropertyStatusesPaginated(opts.page || 1, opts.search || '');
                              return {
                                items: response.results || [],
                                count: response.count,
                                next: response.next
                              };
                            }}
                            labelField="name"
                            placeholder="Select status..."
                            initialItem={initialPropertyStatus}
                        />
                        {validationErrors.property_status && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.property_status}</p>
                        )}
                      </>
                    </div>

                    {/* Next of Kin - SearchableSelect */}
                    <div className="space-y-2">
                      <Label>Next of Kin</Label>
                      <div className="flex gap-2">
                        <SearchableSelect
                          key={`next-of-kin-${selectedProperty?.id || 'new'}-${item.next_of_kin}`}
                          value={localNextOfKin}
                          onChange={(v) => {
                            setLocalNextOfKin(v ?? null);
                            handleChange("next_of_kin", v || 'none');
                          }}
                          disabled={!prisonerInfo.prisoner}
                          fetchPaginated={async (opts, signal) => {
                            const response = await fetchNextOfKinPaginated(
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
                          renderItem={(nok: any) => (
                            <span>{nok.full_name} ({nok.relationship_name})</span>
                          )}
                          labelField="full_name"
                          placeholder={!prisonerInfo.prisoner ? "Select a prisoner first..." : "Select next of kin..."}
                          className="flex-1"
                          initialItem={initialNextOfKin}
                        />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() => {
                          // Update parent prisoner info before opening dialog
                          if (selectedPrisonerDetails) {
                            setParentPrisonerInfo({
                              prisoner: selectedPrisonerDetails.id,
                              prisonerName: selectedPrisonerDetails.name,
                              prisonerNumber: selectedPrisonerDetails.number
                            });
                          } else if (prisonerInfo.prisoner) {
                            // Fallback: If prisoner is selected but details not captured, still allow opening
                            setParentPrisonerInfo({
                              prisoner: prisonerInfo.prisoner,
                              prisonerName: '',
                              prisonerNumber: ''
                            });
                          }
                          // Small delay to ensure state propagates before opening dialog
                          setTimeout(() => {
                            setIsNextCreateDialogOpen(true);
                          }, 10);
                        }}
                        disabled={!prisonerInfo.prisoner}
                        title={!prisonerInfo.prisoner ? "Select a prisoner first" : "Add New Next of Kin"}
                        style={{ borderColor: '#650000' }}
                      >
                        <Plus className="h-5 w-5" style={{ color: '#650000' }} />
                      </Button>
                    </div>
                  </div>

                    {/* Destination */}
                    <div className="space-y-2">
                      <Label>Destination</Label>
                      <Input
                        type="text"
                        name="destination"
                        value={localDestination}
                        onChange={handleInput}
                        placeholder="Enter destination"
                      />
                    </div>

                    {/* Note */}
                    <div className="space-y-2 md:col-span-2">
                      <Label>Notes</Label>
                      <Textarea
                        value={localNote}
                        name="note"
                        onChange={handleInput}
                        placeholder="Enter any additional notes"
                        rows={2}
                      />
                    </div>
                </>
            </div>
            </div>{/* End content wrapper */}
          </CollapsibleContent>
        </Card>
      </Collapsible>
    )
}
);

PropertyItem.displayName = 'PropertyItem';

export default PropertyItem