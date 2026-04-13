export interface CreateCheerRequest {
  message: string;
  pointsPerRecipient: number;
  recipientIds: string[];
}

export interface CheerRecipientDTO {
  id: string;
  recipientId: string;
  recipientFirstName: string;
  recipientLastName: string;
  recipientEmail: string;
  pointsAwarded: number;
}

export interface CheerDTO {
  id: string;
  senderId: string;
  senderFirstName: string;
  senderLastName: string;
  senderEmail: string;
  message: string;
  pointsPerRecipient: number;
  createdAt: string;
  recipients: CheerRecipientDTO[];
}

export type FeedSortBy = 'createdAt' | 'points';
export type FeedSortDirection = 'asc' | 'desc';
export type FeedFilterMode = 'all' | 'directedAtMe';

export interface FeedQueryOptions {
  sortBy: FeedSortBy;
  sortDir: FeedSortDirection;
  filterMode: FeedFilterMode;
}

export interface ErrorResponse {
  error: string;
  details: string[];
}
