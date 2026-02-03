import {ErrorResponse} from "../stationServices/visitorsServices/VisitorsService";
import axiosInstance from "../axiosInstance";
import {WardsResponse} from "../stationServices/housingService";
import {Paginated} from "../stationServices/utils";
import {Unit} from "../stationServices/visitorsServices/visitorItem";

// API Endpoint Constants
export const PROPERTY_API_ENDPOINTS = {
  PROPERTIES: '/property-management/properties/',
  PROPERTY_TYPES: '/property-management/types/',
  PROPERTY_ITEMS: '/system-administration/items/',
  PROPERTY_BAGS: '/property-management/bags/',
  PROPERTY_STATUSES: '/property-management/statuses/',
  ITEM_CATEGORIES: '/system-administration/item-categories/',
  MEASUREMENT_UNITS: '/system-administration/measurement-units/',
  CURRENCIES: '/system-administration/currencies/',
} as const;

export interface DefaultPropertyItem {
  id: string;
  property_type: string;
  property_category: string;
  property_item: string;
  measurement_unit: string;
  property_bag: string;
  next_of_kin: string;
  property_status: string;
  quantity: string;
  amount: string;
  note: string;
  destination: string;
  visitor_item: string;
  currency: string;
}

export interface Property {
  is_active: boolean;
  deleted_datetime: string | null;
  quantity: string;
  amount: string;
  biometric_consent: boolean;
  note: string;
  destination: string;
  deleted_by: number | null;
  prisoner: string;
  property_type: string;
  property_item: string;
  measurement_unit: string;
  property_bag: string;
  currency: string;
  next_of_kin: string;
  visitor: string;
  visitor_item: string;
  property_status: string;
}

export interface PrisonerProperty {
  id: string;
  prisoner_name: string;
  property_type_name: string;
  property_item_name: string;
  measurement_unit_name: string;
  property_bag_number: string;
  property_status_name: string;
  currency_name: string;
  currency_symbol: string;
  next_of_kin_name: string;
  visitor_name: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  quantity: string;
  amount: string;
  biometric_consent: boolean;
  note: string;
  destination: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  prisoner: string;
  property_type: string;
  property_item: string;
  measurement_unit: string;
  property_bag: string;
  currency: string;
  next_of_kin: string;
  visitor: string;
  visitor_item: string;
  property_status: string;
}

export interface PropertyItem {
  id: string;
  property_category_name: string;
  station_name: string;
  status_name: string;
  created_datetime: string;
  is_active: boolean;
  name: string;
  description: string;
  price: string;
  is_money: boolean;
  remark: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  station: string;
  property_category: string;
  status: string;
}

export interface PropertyBag {
  id: string;
  prisoner_name: string;
  property_category_name: string;
  shelf_number: string;
  created_datetime: string;
  is_active: boolean;
  bag_number: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  prisoner: string;
  station: string;
  property_category: string;
  shelf: string;
}

export type PropertyResponse = PrisonerProperty | ErrorResponse;
export type PropertiesResponse<T> = Paginated<T> | ErrorResponse
export type PropertyTypesResponse<T> = Paginated<T> | ErrorResponse
export type PropertyItemsResponse<T> = Paginated<T> | ErrorResponse
export type PropertyBagsResponse<T> = Paginated<T> | ErrorResponse
export type PropertyStatusResponse<T> = Paginated<T> | ErrorResponse

export const addProperty = async (property: Property) : Promise<PropertyResponse> => {
  const response = await axiosInstance.post<PropertyResponse>(PROPERTY_API_ENDPOINTS.PROPERTIES, property);
  return response.data;
}

export const updateProperty = async (property: Property, id: string) : Promise<PropertyResponse> => {
  const response = await axiosInstance.put<PropertyResponse>(`${PROPERTY_API_ENDPOINTS.PROPERTIES}${id}/`, property);
  return response.data;
}

export const deleteProperty = async (id: string) : Promise<{ message: string } | { error: string }> => {
  try {
    await axiosInstance.delete(`${PROPERTY_API_ENDPOINTS.PROPERTIES}${id}/`);

    return { message: "Property deleted successfully" }

  } catch (error: any) {
    return {
      error: "Failed to delete property."
    };
  }
}

export const getProperties = async <T = PrisonerProperty>() : Promise<PropertiesResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>(PROPERTY_API_ENDPOINTS.PROPERTIES);
  return response.data;
}

export const getPropertyTypes = async <T = Unit>() : Promise<PropertyTypesResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>(PROPERTY_API_ENDPOINTS.PROPERTY_TYPES);
  return response.data;
}

export const getPropertyItems = async <T = PropertyItem>(property_category: string) : Promise<PropertyItemsResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>(PROPERTY_API_ENDPOINTS.ITEM_CATEGORIES, {
    params: {
      property_category
    }
  });
  return response.data;
}

export const getPropertyBags = async <T = PropertyBag>(prisoner: string, property_category?: string) : Promise<PropertyBagsResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>(PROPERTY_API_ENDPOINTS.PROPERTY_BAGS, {
    params: {
      prisoner,
      ...(property_category && { property_category })
    }
  });
  return response.data;
}

export const getPropertyStatuses = async <T = Unit>() : Promise<PropertyStatusResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>(PROPERTY_API_ENDPOINTS.PROPERTY_STATUSES);
  return response.data;
}

// Fetch property by ID for edit mode (Option B pattern)
export const fetchPropertyById = async (id: string): Promise<PrisonerProperty | ErrorResponse> => {
  try {
    const response = await axiosInstance.get<PrisonerProperty>(`${PROPERTY_API_ENDPOINTS.PROPERTIES}${id}/`);
    return response.data;
  } catch (error: any) {
    return {
      error: error.response?.data?.error || error.message || "Failed to fetch property details"
    };
  }
}

// Paginated fetch functions for SearchableSelect
export const fetchPropertyTypesPaginated = async (page: number, search: string = '') => {
  const response = await axiosInstance.get(PROPERTY_API_ENDPOINTS.PROPERTY_TYPES, {
    params: {
      page,
      page_size: 50,
      search,
    }
  });
  return response.data;
};

export const fetchPropertyStatusesPaginated = async (page: number, search: string = '') => {
  const response = await axiosInstance.get(PROPERTY_API_ENDPOINTS.PROPERTY_STATUSES, {
    params: {
      page,
      page_size: 50,
      search,
    }
  });
  return response.data;
};

export const fetchPropertyItemsPaginated = async (page: number, search: string = '', categoryId?: string) => {
  const response = await axiosInstance.get(PROPERTY_API_ENDPOINTS.PROPERTY_ITEMS, {
    params: {
      page,
      page_size: 50,
      search,
      ...(categoryId && { property_category: categoryId })
    }
  });
  return response.data;
};

export const fetchPropertyBagsPaginated = async (page: number, search: string = '', prisonerId?: string, categoryId?: string) => {
  const response = await axiosInstance.get(PROPERTY_API_ENDPOINTS.PROPERTY_BAGS, {
    params: {
      page,
      page_size: 50,
      search,
      ...(prisonerId && { prisoner: prisonerId }),
      ...(categoryId && { property_category: categoryId })
    }
  });
  return response.data;
};

export const fetchItemCategoriesPaginated = async (page: number, search: string = '') => {
  const response = await axiosInstance.get(PROPERTY_API_ENDPOINTS.ITEM_CATEGORIES, {
    params: {
      page,
      page_size: 50,
      search,
    }
  });
  return response.data;
};

export const fetchMeasurementUnitsPaginated = async (page: number, search: string = '') => {
  const response = await axiosInstance.get(PROPERTY_API_ENDPOINTS.MEASUREMENT_UNITS, {
    params: {
      page,
      page_size: 50,
      search,
    }
  });
  return response.data;
};

export const fetchCurrenciesPaginated = async (page: number, search: string = '') => {
  const response = await axiosInstance.get(PROPERTY_API_ENDPOINTS.CURRENCIES, {
    params: {
      page,
      page_size: 50,
      search,
    }
  });
  return response.data;
};
