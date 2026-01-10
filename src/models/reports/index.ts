export interface UserDetails {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface ReportFilter {
  field: string;
  operator: string;
  value: any;
  logical?: string;
}

export interface QueryDefinition {
  model: string;
  fields: string[];
  joins?: Array<{ field: string; type: string }>;
  group_by?: string[];
  aggregates?: Array<{
    field: string;
    function: string;
    alias: string;
  }>;
  filters?: ReportFilter[];
  order_by?: string[];
}

export interface AvailableFilter {
  field: string;
  label: string;
  type: string;
  operators: string[];
  required: boolean;
}

export interface RecentExecution {
  id: number;
  report: number;
  report_name: string;
  executed_by: number;
  executed_by_details: UserDetails;
  executed_at: string;
  runtime_parameters: Record<string, any>;
  execution_time_ms: number;
  row_count: number;
  success: boolean;
  error_message: string;
  cache_key: string;
}

export interface Report {
  id: number;
  module: string;
  name: string;
  description: string;
  scope: string;
  created_by: number;
  created_by_username?: string;
  created_by_details?: UserDetails;
  group: string | null;
  group_details: any | null;
  query_definition?: QueryDefinition;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_executed_at: string | null;
  execution_count: number;
  permissions?: any[];
  recent_executions?: RecentExecution[];
  available_filters?: AvailableFilter[];
}

export interface ReportsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Report[];
}

export interface ReportExecutionRequest {
  use_cache: boolean;
  runtime_parameters?: Record<string, any>;
}

export interface ReportExecutionResponse {
  data: Record<string, any>[];
  count: number;
  execution_time_ms: number;
  sql_query: string;
  success: boolean;
  cached: boolean;
  execution_id: number;
}

// Metadata interfaces for report creation
export interface AppMetadata {
  app_label: string;
  name: string;
  models_count: number;
}

export interface ModelMetadata {
  name: string;
  app_label: string;
  model_path: string;
  verbose_name: string;
  verbose_name_plural: string;
  fields_count: number;
}

export interface FieldOperator {
  value: string;
  label: string;
}

export interface FieldMetadata {
  name: string;
  verbose_name: string;
  type: string;
  ui_type: string;
  is_relation: boolean;
  null: boolean;
  blank: boolean;
  default: any;
  help_text: string;
  related_model?: string;
  relation_type?: string;
  operators: FieldOperator[];
}

export interface ReportJoin {
  field: string;
  type: string;
}

export interface ReportAggregate {
  field: string;
  function: string;
  alias: string;
}

export interface ReportFilter {
  field: string;
  operator: string;
  value: any;
  logical?: string;
}

export interface CreateReportRequest {
  name: string;
  description: string;
  module: string;
  scope: string;
  group?: string | null;
  query_definition: {
    model: string;
    fields: string[];
    joins?: ReportJoin[];
    group_by?: string[];
    aggregates?: ReportAggregate[];
    filters?: ReportFilter[];
    order_by?: string[];
  };
}
