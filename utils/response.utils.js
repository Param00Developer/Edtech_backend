import statusCodes from "http-status-codes";
import AppError from "./appError.utils";

export const ErrorResponse = (request, response, error) => {
  const httpStatusCode =
    error instanceof AppError
      ? error.httpCode
      : statusCodes.INTERNAL_SERVER_ERROR;

  const errorObj = {
    success: false,
    statusCodes: httpStatusCode,
    message: error.message,
    customErrorCode: error.customErrorCode,
    metaData: error.metaData,
    stack: null,
  };

  if (process.env.NODE_ENV !== "production") {
    let errorStack;
    if (error.stack) {
      errorStack = error.stack;
    } else {
      errorStack = error.error ? error.error.stack : undefined;
    }

    errorObj.stack = errorStack;
  }

  console.error({
    message: errorObj.message,
    errorObj,
    source: "errorResponse",
  });

  response.status(httpStatusCode).json(errorObj);
};

export const SuccessResponse = (
    request,
    response,
    result,
    httpCode = statusCodes.OK
  ) => {
    const responseObj = {
      success: true,
      statusCodes: httpCode,
      ...result,
    };
  
    return response.status(httpCode).json(responseObj);
  };
  