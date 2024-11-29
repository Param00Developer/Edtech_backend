import { StatusCodes } from "http-status-codes";

const INTERNAL_SERVER_ERROR = {
  customErrorCode: 1000,
  message: "Something went wrong",
  httpCode: StatusCodes.INTERNAL_SERVER_ERROR,
};

const BAD_REQUEST = {
  customErrorCode: 1002,
  message: "Bad request",
  httpCode: StatusCodes.BAD_REQUEST,
};

const NOT_AUTHORIZED = {
  message: "User not Authorized",
  httpCode: StatusCodes.UNAUTHORIZED,
  customErrorCode: 1003,
};


const RESOURCE_NOT_FOUND = {
  customErrorCode: 1004,
  message: "Resource not found",
  httpCode: StatusCodes.NOT_FOUND,
};


const errorConstants = {
  INTERNAL_SERVER_ERROR,
  BAD_REQUEST,
  NOT_AUTHORIZED,
  RESOURCE_NOT_FOUND
};
export default errorConstants;
