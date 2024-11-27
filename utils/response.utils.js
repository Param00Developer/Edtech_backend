import statusCodes from "http-status-codes";

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
  