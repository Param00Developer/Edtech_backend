class AppError extends Error {
    customErrorCode;
    metaData;
    httpCode;
    originalError;
  
    constructor(errorInfo, { message, originalError, metaData } ) {
      if (!errorInfo) {
        throw new Error('Invalid call to AppError');
      }
  
      super(message || errorInfo.message);
  
      this.customErrorCode = errorInfo.customErrorCode;
      this.metaData = metaData || {};
  
      if (errorInfo.httpCode) {
        this.httpCode = errorInfo.httpCode;
      }
  
      if (originalError) {
        this.originalError = originalError;
      }
    }
  }
  
  export default AppError;
  