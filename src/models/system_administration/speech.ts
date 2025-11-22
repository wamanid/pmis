/**
 * Speech Model
 * Represents a speech type in the system
 */

export interface Speech {
  id: string;
  name: string;
  description?: string;
}

/**
 * Paginated response for speeches
 */
export interface SpeechListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Speech[];
}

/**
 * Query parameters for fetching speeches
 */
export interface SpeechQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

/**
 * Parameters for creating a new speech
 */
export interface CreateSpeechParams {
  name: string;
  description?: string;
}

/**
 * Parameters for updating an existing speech
 */
export interface UpdateSpeechParams extends Partial<CreateSpeechParams> {}
