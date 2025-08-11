
export interface WingErrorDetails {
    [key: string]: any;
  }
  
  export interface WingCoreError {
    status: number;
    code: string;
    message: string;
    details?: WingErrorDetails;
  }
  
  export interface WingResponse {
    success: boolean;
    error: WingCoreError;
    data: any;
  }
  