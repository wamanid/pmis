import React, {useState} from "react";
import {NextOfKinResponse} from "../../services/admission/nextOfKinService";
import {
    DefaultPropertyItem, getPropertyStatuses,
    getPropertyTypes,
    PropertyBag,
    PropertyItem
} from "../../services/stationServices/propertyService";
import {Unit, VisitorItem} from "../../services/stationServices/visitorsServices/visitorItem";
import {Card} from "../ui/card";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "../ui/collapsible";
import {Check, ChevronDown, ChevronsUpDown, ChevronUp, Plus, Tag, Trash2} from "lucide-react";
import {Badge} from "../ui/badge";
import {Button} from "../ui/button";
import {Label} from "../ui/label";
import {Popover, PopoverContent, PopoverTrigger} from "../ui/popover";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "../ui/command";
import {cn} from "../ui/utils";
import {Input} from "../ui/input";
import {Textarea} from "../ui/textarea";
import {handleCatchError, handleEmptyList, handleServerError} from "../../services/stationServices/utils";
import {toast} from "sonner";

interface ChildProps {
  setPropertyItems: React.Dispatch<React.SetStateAction<DefaultPropertyItem[]>>;
  item: DefaultPropertyItem
  propertyItems: DefaultPropertyItem
  index: number
  visitorItems: VisitorItem
  setNewDialogLoader: React.Dispatch<React.SetStateAction<boolean>>;
  setLoaderText: React.Dispatch<React.SetStateAction<string>>;
  nextOfKins: React.Dispatch<React.SetStateAction<NextOfKinResponse[]>>;
  setIsNextCreateDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  // onUpdate: (itemId: string, updatedFields: Partial<DefaultPropertyItem>) => void;
  onUpdate: (itemId: string, field: string, value: any) => void;
  propertyTypes: Unit
  propertyStatuses: Unit
}

// export default function PropertyItem() {
// const PropertyItem React.FC<ChildProps> = ({ }) => {
const PropertyItem: React.FC<ChildProps> = ({ setPropertyItems, index, item, visitorItems,
                                                setNewDialogLoader, setLoaderText, nextOfKins,
                                                setIsNextCreateDialogOpen, propertyItems, onUpdate, propertyTypes,
                                                propertyStatuses }) => {

    const [isItemOpen, setIsItemOpen] = useState(true);
    const [openPropertyType, setOpenPropertyType] = useState(false);
    const [openPropertyCategory, setOpenPropertyCategory] = useState(false);
    const [openPropertyItem, setOpenPropertyItem] = useState(false);
    const [openMeasurementUnit, setOpenMeasurementUnit] = useState(false);
    const [openPropertyBag, setOpenPropertyBag] = useState(false);
    const [openPropertyStatus, setOpenPropertyStatus] = useState(false);
    const [openNextOfKin, setOpenNextOfKin] = useState(false);
    const [openVisitorItem, setOpenVisitorItem] = useState(false);
    const [visitorItemSearch, setVisitorItemSearch] = useState('');

    const [typeLoader, setTypeLoader] = useState(true)
    // const [propertyTypes, setPropertyTypes] = useState<Unit[]>([])
    const [propertyItemsX, setPropertyItemsX] = useState<PropertyItem[]>([])
    // const [propertyStatuses, setPropertyStatuses] = useState<Unit[]>([])
    const [propertyBags, setPropertyBags] = useState<PropertyBag[]>([])

    const filteredVisitorItems = visitorItems.filter((visitorItem) => {
      const searchLower = visitorItemSearch.toLowerCase();
      return (
        visitorItem.visitor_name.toLowerCase().includes(searchLower) ||
        visitorItem.item_name.toLowerCase().includes(searchLower)
      );
    });

    const propertyTypeName = item.property_type
      ? propertyTypes.find((t) => t.id === item.property_type)?.name
      : null;
    const propertyItemName = item.property_item
      ? propertyItemsX.find((i) => i.id === item.property_item)?.name
      : null;

    const handleVisitorItemSelect = async (visitorItem: VisitorItem) => {
      // Populate fields from selected visitor item
        onUpdate(item.id, "quantity", visitorItem.quantity.toString());
        onUpdate(item.id, "amount", visitorItem.amount);
        onUpdate(item.id, "visitor_item", visitorItem.id);
        onUpdate(item.id, "property_category", visitorItem.item_category);
        onUpdate(item.id, "measurement_unit", visitorItem.measurement_unit);

      setOpenVisitorItem(false);

      await fetchPropertyData(visitorItem)
    };

    async function fetchPropertyData(visitorItem: VisitorItem) {
       setNewDialogLoader(true)
       setLoaderText("Fetching Property information")
       setTypeLoader(false)
        try {

           if (!propertyTypes.length){
               toast.error("There are no property types")
               return
           }

           if (!propertyStatuses.length){
               toast.error("There are no property statuses")
               return
           }

            // const response2 = await getPropertyItems(visitorItem.item_category)
            // const ok2 = populateListX(response2, "There are no property items", setPropertyItems)
            // if(!ok2) return

            // const response4 = await getPropertyBags(prisonerInfo.prisoner, visitorItem.item_category)
            // const ok4 = populateListX(response4, "There are no property bags for this prisoner", setPropertyBags)
            // if(!ok4) return

            setTypeLoader(true)

        }catch (error) {
          handleCatchError(error)
        }finally {
          setNewDialogLoader(false)
        }
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

    function handleChange (name: string, value: string){
        onUpdate(item.id, name, value);
    }

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
          const { name, value } = e.target;
          onUpdate(item.id, name, value);
          // Use the name from the input's 'name' attribute
          // onUpdate(item.id, { [name]: value });
    };

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
              {/* Search Visitor Items */}
              <div className="space-y-2 md:col-span-2">
                <Label>Select Visitor Item *</Label>
                <Popover open={openVisitorItem} onOpenChange={setOpenVisitorItem}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between" type="button">
                      <span className="text-gray-500">
                      {item.visitor_item
                          ? (() => {
                              const visitorItem = visitorItems.find((t) => t.id === item.visitor_item);
                              return visitorItem
                                ? `${visitorItem.item_name} (${visitorItem.category_name})`
                                : "Search by item name...";
                            })()
                          : "Search by item name..."
                      }
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" style={{ width: '600px' }}>
                    <Command>
                      <CommandInput
                        placeholder="Search by item name..."
                        value={visitorItemSearch}
                        onValueChange={setVisitorItemSearch}
                      />
                      <CommandList>
                        <CommandEmpty>No visitor items found.</CommandEmpty>
                        <CommandGroup>
                          {filteredVisitorItems.map((visitorItem) => (
                            <CommandItem
                              key={visitorItem.id}
                              value={`${visitorItem.item_name}`}
                              onSelect={() => handleVisitorItemSelect(visitorItem)}
                            >
                              <div className="flex flex-col w-full mb-5">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{visitorItem.item_name} ({visitorItem.category_name})</span>
                                  {/*<Badge variant="secondary">{visitorItem.item_name}</Badge>*/}
                                </div>
                                <div className="flex gap-4 text-sm text-gray-600 mt-1">
                                  {/*<span>ID: {visitorItem.visitor_id_number}</span>*/}
                                  {/*<span>Phone: {visitorItem.visitor_phone}</span>*/}
                                  <span>Bag: {visitorItem.bag_no}</span>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {
                typeLoader && (
                    <>
                       {/* Property Type */}
                        <div className="space-y-2">
                          <Label>Property Type *</Label>
                          <Popover open={openPropertyType} onOpenChange={setOpenPropertyType}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" className="w-full justify-between" type="button">
                                {item.property_type
                                  ? propertyTypes.find((t) => t.id === item.property_type)?.name
                                  : "Select property type..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search property type..." />
                                <CommandList>
                                  <CommandEmpty>No type found.</CommandEmpty>
                                  <CommandGroup>
                                    {propertyTypes.map((type) => (
                                      <CommandItem
                                        key={type.id}
                                        value={type.name}
                                        onSelect={() => {
                                          handleChange("property_type", type.id)
                                          setOpenPropertyType(false);
                                        }}
                                      >
                                        <Check className={cn("mr-2 h-4 w-4", item.property_type === type.id ? "opacity-100" : "opacity-0")} />
                                        {type.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Property Category */}
                        <div className="space-y-2">
                          <Label>Property Category *</Label>
                          <Popover open={openPropertyCategory} onOpenChange={setOpenPropertyCategory}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" className="w-full justify-between" type="button" disabled={true}>
                                {item.property_category
                                  ? visitorItems.find((i) => i.item_category === item.property_category)?.category_name
                                  : ""}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search category..." />
                                <CommandList>
                                  <CommandEmpty>No category found.</CommandEmpty>
                                  <CommandGroup>
                                    {/*{mockPropertyCategories.map((category) => (*/}
                                    {/*  <CommandItem*/}
                                    {/*    key={category.id}*/}
                                    {/*    value={category.name}*/}
                                    {/*    onSelect={() => {*/}
                                    {/*      onUpdate(item.id, 'property_category', category.id);*/}
                                    {/*      setOpenPropertyCategory(false);*/}
                                    {/*    }}*/}
                                    {/*  >*/}
                                    {/*    <Check className={cn("mr-2 h-4 w-4", item.property_category === category.id ? "opacity-100" : "opacity-0")} />*/}
                                    {/*    {category.name}*/}
                                    {/*  </CommandItem>*/}
                                    {/*))}*/}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Property Item */}
                        <div className="space-y-2">
                          <Label>Property Item *</Label>
                          <Popover open={openPropertyItem} onOpenChange={setOpenPropertyItem}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" className="w-full justify-between" type="button">
                                {item.property_item
                                  ? propertyItemsX.find((i) => i.id === item.property_item)?.name
                                  : "Select item..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search item..." />
                                <CommandList>
                                  <CommandEmpty>No item found.</CommandEmpty>
                                  <CommandGroup>
                                    {propertyItemsX.map((propertyItem) => (
                                      <CommandItem
                                        key={propertyItem.id}
                                        value={propertyItem.name}
                                        onSelect={() => {
                                          handleChange("property_item", propertyItem.id)
                                          setOpenPropertyItem(false);
                                        }}
                                      >
                                        <Check className={cn("mr-2 h-4 w-4", item.property_item === propertyItem.id ? "opacity-100" : "opacity-0")} />
                                        {propertyItem.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Measurement Unit */}
                        <div className="space-y-2">
                          <Label>Measurement Unit</Label>
                          <Popover open={openMeasurementUnit} onOpenChange={setOpenMeasurementUnit}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" className="w-full justify-between" type="button" disabled={true}>
                               {item.measurement_unit
                                  ? visitorItems.find((i) => i.measurement_unit === item.measurement_unit)?.measurement_unit_name
                                  : ""}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search unit..." />
                                <CommandList>
                                  <CommandEmpty>No unit found.</CommandEmpty>
                                  <CommandGroup>
                                    {/*{mockMeasurementUnits.map((unit) => (*/}
                                    {/*  <CommandItem*/}
                                    {/*    key={unit.id}*/}
                                    {/*    value={unit.name}*/}
                                    {/*    onSelect={() => {*/}
                                    {/*      onUpdate(item.id, 'measurement_unit', unit.id);*/}
                                    {/*      setOpenMeasurementUnit(false);*/}
                                    {/*    }}*/}
                                    {/*  >*/}
                                    {/*    <Check className={cn("mr-2 h-4 w-4", item.measurement_unit === unit.id ? "opacity-100" : "opacity-0")} />*/}
                                    {/*    {unit.name}*/}
                                    {/*  </CommandItem>*/}
                                    {/*))}*/}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2">
                          <Label>Quantity *</Label>
                          <Input
                            type="text"
                            value={item.quantity}
                            placeholder="Enter quantity"
                            required
                            disabled={true}
                          />
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                          <Label>Amount (UGX)</Label>
                          <Input
                            type="number"
                            value={item.amount}
                            placeholder="Enter amount"
                            disabled={true}
                          />
                        </div>

                        {/* Property Bag */}
                        <div className="space-y-2">
                          <Label>Property Bag *</Label>
                          <Popover open={openPropertyBag} onOpenChange={setOpenPropertyBag}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" className="w-full justify-between" type="button">
                                {item.property_bag
                                  ? propertyBags.find((b) => b.id === item.property_bag)?.bag_number
                                  : "Select bag..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search bag..." />
                                <CommandList>
                                  <CommandEmpty>No bag found.</CommandEmpty>
                                  <CommandGroup>
                                    {propertyBags.map((bag) => (
                                      <CommandItem
                                        key={bag.id}
                                        value={bag.bag_number}
                                        onSelect={() => {
                                            handleChange("property_bag", bag.id)
                                          setOpenPropertyBag(false);
                                        }}
                                      >
                                        <Check className={cn("mr-2 h-4 w-4", item.property_bag === bag.id ? "opacity-100" : "opacity-0")} />
                                        {bag.bag_number}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Property Status */}
                        <div className="space-y-2">
                          <Label>Property Status *</Label>
                          <Popover open={openPropertyStatus} onOpenChange={setOpenPropertyStatus}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" className="w-full justify-between" type="button">
                                {item.property_status
                                  ? propertyStatuses.find((s) => s.id === item.property_status)?.name
                                  : "Select status..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search status..." />
                                <CommandList>
                                  <CommandEmpty>No status found.</CommandEmpty>
                                  <CommandGroup>
                                    {propertyStatuses.map((status) => (
                                      <CommandItem
                                        key={status.id}
                                        value={status.name}
                                        onSelect={() => {
                                            handleChange("property_status", status.id)
                                          setOpenPropertyStatus(false);
                                        }}
                                      >
                                        <Check className={cn("mr-2 h-4 w-4", item.property_status === status.id ? "opacity-100" : "opacity-0")} />
                                        {status.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Next of Kin */}
                        <div className="space-y-2">
                          <Label>Next of Kin</Label>
                          <div className="flex gap-2">
                            <Popover open={openNextOfKin} onOpenChange={setOpenNextOfKin}>
                              <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" className="flex-1 justify-between" type="button">
                                  {item.next_of_kin && item.next_of_kin !== 'none'
                                    ? nextOfKins.find((nok) => nok.id === item.next_of_kin)?.full_name + ' (' + nextOfKins.find((nok) => nok.id === item.next_of_kin)?.relationship_name + ')'
                                    : "Select next of kin..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search next of kin..." />
                                <CommandList>
                                  <CommandEmpty>No next of kin found.</CommandEmpty>
                                  <CommandGroup>
                                    <CommandItem
                                      value="none"
                                      onSelect={() => {
                                          handleChange("next_of_kin", "none")
                                        setOpenNextOfKin(false);
                                      }}
                                    >
                                      <Check className={cn("mr-2 h-4 w-4", item.next_of_kin === 'none' ? "opacity-100" : "opacity-0")} />
                                      None
                                    </CommandItem>
                                    {nextOfKins.map((nok) => (
                                      <CommandItem
                                        key={nok.id}
                                        value={nok.full_name + ' ' + nok.relationship}
                                        onSelect={() => {
                                            handleChange("next_of_kin", nok.id)
                                          setOpenNextOfKin(false);
                                        }}
                                      >
                                        <Check className={cn("mr-2 h-4 w-4", item.next_of_kin === nok.id ? "opacity-100" : "opacity-0")} />
                                        {nok.full_name} ({nok.relationship_name})
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          {/*<Button*/}
                          {/*  type="button"*/}
                          {/*  variant="outline"*/}
                          {/*  size="icon"*/}
                          {/*  className="shrink-0"*/}
                          {/*  onClick={() => setIsNextOfKinDialogOpen(true)}*/}
                          {/*  title="Add New Next of Kin"*/}
                          {/*  style={{ borderColor: '#650000' }}*/}
                          {/*>*/}
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            onClick={() => setIsNextCreateDialogOpen(true)}
                            title="Add New Next of Kin"
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
                            value={item.destination}
                            onChange={handleInput}
                            placeholder="Enter destination"
                          />
                        </div>

                        {/* Note */}
                        <div className="space-y-2 md:col-span-2">
                          <Label>Notes</Label>
                          <Textarea
                            value={item.note}
                            name="note"
                            onChange={handleInput}
                            placeholder="Enter any additional notes"
                            rows={2}
                          />
                        </div>
                    </>
                )
              }
            </div>
            </div>{/* End content wrapper */}
          </CollapsibleContent>
        </Card>
      </Collapsible>
    )
}

export default PropertyItem