export interface StyleFilter {
  id: string;
  name: string;
  description: string;
  price: number;
  preview: string;
  gradient: string;
}

export interface RenderResult {
  id: string;
  originalImage: string;
  styledImage: string;
  filter: StyleFilter;
  timestamp: Date;
}

export interface PaymentStatus {
  status: 'idle' | 'processing' | 'success' | 'error';
  transactionId?: string;
  error?: string;
}

export interface UploadState {
  file: File | null;
  preview: string | null;
  isUploading: boolean;
}