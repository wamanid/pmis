import React, {useEffect, useState} from "react";
import {
  getStationVisitors2,
  PrisonerItem,
  Visitor
} from "../../services/stationServices/visitorsServices/VisitorsService";
import {
  addProperty,
  DefaultPropertyItem,
  getPropertyStatuses,
  getPropertyTypes, PrisonerProperty, Property,
  PropertyBag
} from "../../services/stationServices/propertyService";
import PropertyItem from "./PropertyItem";
import {getNextOfKins, NextOfKinResponse} from "../../services/admission/nextOfKinService";
import {
  getItemCategories, getUnits,
  getVisitorItems2,
  ItemCategory, ItemStatus,
  Unit,
  VisitorItem
} from "../../services/stationServices/visitorsServices/visitorItem";
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import BiometricCapture from '../common/BiometricCapture';
import PropertyStatusChangeForm from './PropertyStatusChangeForm';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { DialogFooter } from '../ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { toast } from 'sonner@2.0.3';
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
import {handleCatchError, handleEmptyList, handleServerError} from "../../services/stationServices/utils";

interface ChildProps {
  prisoners: PrisonerItem;
  setIsCreateDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setNewDialogLoader: React.Dispatch<React.SetStateAction<boolean>>;
  setLoaderText: React.Dispatch<React.SetStateAction<string>>;
  setIsNextCreateDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setProperties: React.Dispatch<React.SetStateAction<PrisonerProperty[]>>;
}


const CreatePropertyForm: React.FC<ChildProps> = ({ prisoners, setIsCreateDialogOpen, setNewDialogLoader,
                                                    setLoaderText, setIsNextCreateDialogOpen, setProperties}) => {
    const [openPrisoner, setOpenPrisoner] = useState(false);
    const [openVisitor, setOpenVisitor] = useState(false);
    const [prisonerInfo, setPrisonerInfo] = useState({
    prisoner: ''
  });
    const [visitorInfo, setVisitorInfo] = useState({
    visitor: ''
  });
    const [loading, setLoading] = useState({ visitor: false, property: false, type: false })
    const [isLoadingVisitors, setIsLoadingVisitors] = useState(false);
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [nextOfKins, setNextOfKins] = useState<NextOfKinResponse[]>([])
    const [isPropertyItemsOpen, setIsPropertyItemsOpen] = useState(true);
    const [propertyItems, setPropertyItems] = useState<DefaultPropertyItem[]>([{
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
  }]);
    const [visitorItems, setVisitorItems] = useState<VisitorItem[]>([])
    const [typeLoader, setTypeLoader] = useState(false)
    const [propertyTypes, setPropertyTypes] = useState<Unit[]>([])
    // const [propertyItems, setPropertyItems] = useState<PropertyItem[]>([])
    const [propertyStatuses, setPropertyStatuses] = useState<Unit[]>([])
    const [propertyBags, setPropertyBags] = useState<PropertyBag[]>([])
    const [biometricData, setBiometricData] = useState('');
    const [itemCategories, setItemCategories] = useState<ItemCategory[]>([])
    const [units, setUnits] = useState<Unit[]>([])


    const handleUpdatePropertyItem = (itemId: string, updatedFields: Partial<typeof propertyItems[0]>) => {
      setPropertyItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, ...updatedFields } : item
        )
      );
    };

    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        const item = propertyItems[0]

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
          const response = await addProperty(property)
          setProperties(prev => ([response, ...prev]))
          resetFields()
          toast.success("Property created successfully");
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
      }])
      setBiometricData("")
    }

    useEffect(() => {
      if (prisonerInfo.prisoner) {
        setLoaderText("Fetching Visitor Information, Please wait...")
        setNewDialogLoader(true)
        // setLoading({visitor: false, property: false, type: false})
        setVisitors([])
        fetchVisitorData(prisonerInfo.prisoner)
      }
    }, [prisonerInfo]);

    useEffect(() => {
      if (visitorInfo.visitor) {
        setLoaderText("Fetching Visitor items, Please wait...")
        setNewDialogLoader(true)
        // setLoading(prev =>({...prev, property: false}))
        setVisitorItems([])
        fetchVisitorItems(visitorInfo.visitor)
      }
    }, [visitorInfo]);

    async function fetchVisitorData(prisonerId) {
      try {
          const response2 = await getNextOfKins(prisonerInfo.prisoner)
          populateList(response2, "There are no next of kins for this prisoner", setNextOfKins)

          const response = await getStationVisitors2(prisonerId)
          populateList(response, "There are no visitors for the selected prisoner", setVisitors)

         const response1 = await getPropertyTypes()
         populateLists(response1, "There are no property types", setPropertyTypes)

         const response3 = await getPropertyStatuses()
         populateLists(response3, "There are no property statuses", setPropertyStatuses)

         const response11 = await getItemCategories()
         populateLists(response11, "There are no item categories", setItemCategories)

         const response41 = await getUnits()
         populateLists(response41, "There are no item categories", setUnits)

      }catch (error) {
        handleCatchError(error)
      }finally {
         setNewDialogLoader(false)
      }
    }

    async function fetchVisitorItems(visitorId) {
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
      }])
      try {
          const response = await getVisitorItems2(visitorId)
          if(handleServerError(response, setNewDialogLoader)) return
          populateList(response, "There are no visitor items for the selected visitor", setVisitorItems)

      }catch (error) {
        handleCatchError(error)
      }finally {
         setNewDialogLoader(false)
      }
    }

  function populateList(response: any, msg: string, setData: any) {
    if(handleServerError(response, setNewDialogLoader)) return

    if ("results" in response) {
      const data = response.results
      handleEmptyList(data, msg, setNewDialogLoader)
      // if (msg === "There are no visitors for the selected prisoner" && data.length) {
      //   // setLoading(prev => ({...prev, visitor: true}))
      // }
      // if (msg === "There are no visitor items for the selected visitor" && data.length) {
      //   // setLoading(prev => ({...prev, property: true}))
      // }
      setData(data)
    }
  }

  function populateLists(response: any, msg: string, setData: any) {
    if(handleServerError(response, setNewDialogLoader)) return

    if ("results" in response) {
      const data = response.results
      setData(data)
    }
  }

  return (
      <div className="h-full" style={{marginTop: '10px'}}>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Prisoner Information Section */}
          <Card className="border-2" style={{borderColor: '#650000'}}>
            <div className="p-4">
              <h3 className="mb-4" style={{color: '#650000'}}>Prisoner Information</h3>
              <div className="space-y-2">
                <Label htmlFor="prisoner">Prisoner *</Label>
                <Popover open={openPrisoner} onOpenChange={setOpenPrisoner}>
                  <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openPrisoner}
                        className="w-full justify-between"
                        type="button"
                    >
                      {prisonerInfo.prisoner ? (
                          (() => {
                            const prisoner = prisoners.find((p) => p.id === prisonerInfo.prisoner);
                            return prisoner ? (
                                <div className="flex items-center gap-2">
                                  <span>{prisoner.full_name}</span>
                                  <span className="text-gray-500">({prisoner.prisoner_number_value})</span>
                                </div>
                            ) : "Select prisoner...";
                          })()
                      ) : "Select prisoner..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search prisoner..."/>
                      <CommandList>
                        <CommandEmpty>No prisoner found.</CommandEmpty>
                        <CommandGroup>
                          {prisoners.map((prisoner) => (
                              <CommandItem
                                  key={prisoner.id}
                                  value={prisoner.full_name + ' ' + prisoner.prisoner_number_value}
                                  onSelect={() => {
                                    setPrisonerInfo({prisoner: prisoner.id});
                                    setOpenPrisoner(false);
                                  }}
                              >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        prisonerInfo.prisoner === prisoner.id ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                <div className="flex flex-col">
                                  <span>{prisoner.full_name}</span>
                                  <span
                                      className="text-xs text-gray-500">Prisoner Number: {prisoner.prisoner_number_value}</span>
                                </div>
                              </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {prisonerInfo.prisoner && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Prisoner Number:</span>
                          <span
                              className="ml-2">{prisoners.find((p) => p.id === prisonerInfo.prisoner)?.prisoner_number_value}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Full Name:</span>
                          <span
                              className="ml-2">{prisoners.find((p) => p.id === prisonerInfo.prisoner)?.full_name}</span>
                        </div>
                      </div>
                    </div>
                )}
              </div>
            </div>
          </Card>

          {/* Visitor Information Section */}
          <Card className="border-2" style={{borderColor: '#650000'}}>
            <div className="p-4">
              <h3 className="mb-4" style={{color: '#650000'}}>Visitor Information</h3>
              <div className="space-y-2">
                <Label htmlFor="visitor">Visitor</Label>
                <Popover open={openVisitor} onOpenChange={setOpenVisitor}>
                  <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openVisitor}
                        className="w-full justify-between"
                        type="button"
                        disabled={isLoadingVisitors}
                    >
                      {visitorInfo.visitor ? (
                          (() => {
                            const visitor = visitors.find((v) => v.id === visitorInfo.visitor);
                            return visitor ? `${visitor.first_name} ${visitor.middle_name} ${visitor.last_name}`.replace(/\s+/g, ' ').trim() : "Select visitor...";
                          })()
                      ) : "Select visitor..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search by name, ID, or phone..."/>
                      <CommandList>
                        <CommandEmpty>
                          {isLoadingVisitors ? "Loading visitors..." : "No visitor found."}
                        </CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                              value="none"
                              onSelect={() => {
                                setVisitorInfo({visitor: ''});
                                setOpenVisitor(false);
                              }}
                          >
                            <Check
                                className={cn(
                                    "mr-2 h-4 w-4",
                                    visitorInfo.visitor === '' ? "opacity-100" : "opacity-0"
                                )}
                            />
                            None
                          </CommandItem>
                          {visitors.map((visitor) => {
                            const fullName = `${visitor.first_name} ${visitor.middle_name} ${visitor.last_name}`.replace(/\s+/g, ' ').trim();
                            const searchValue = `${fullName} ${visitor.id_number} ${visitor.contact_no}`;
                            return (
                                <CommandItem
                                    key={visitor.id}
                                    value={searchValue}
                                    onSelect={() => {
                                      setVisitorInfo({visitor: visitor.id});
                                      setOpenVisitor(false);
                                    }}
                                >
                                  <Check
                                      className={cn(
                                          "mr-2 h-4 w-4",
                                          visitorInfo.visitor === visitor.id ? "opacity-100" : "opacity-0"
                                      )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{fullName}</span>
                                    <span className="text-xs text-gray-500">
                                    ID: {visitor.id_number} | Phone: {visitor.contact_no}
                                  </span>
                                  </div>
                                </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {visitorInfo.visitor && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Visitor Name:</span>
                          <span className="ml-2">
                          {(() => {
                            const visitor = visitors.find((v) => v.id === visitorInfo.visitor);
                            return visitor ? `${visitor.first_name} ${visitor.middle_name} ${visitor.last_name}`.replace(/\s+/g, ' ').trim() : '';
                          })()}
                        </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Phone Number:</span>
                          <span
                              className="ml-2">{visitors.find((v) => v.id === visitorInfo.visitor)?.contact_no}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">ID Number:</span>
                          <span
                              className="ml-2">{visitors.find((v) => v.id === visitorInfo.visitor)?.id_number}</span>
                        </div>
                      </div>
                    </div>
                )}
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
                                  Create {propertyItems.length} {propertyItems.length > 1 ? 'Properties' : 'Property'}
                                </Button>
                              </DialogFooter>

        </form>
      </div>
  );
}

export default CreatePropertyForm