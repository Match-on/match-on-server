import { HttpException, HttpStatus } from '@nestjs/common';

interface BaseResponse {
  isSuccess: boolean;
  code: number;
  message: string;
}
const response = ({ isSuccess, code, message }: BaseResponse, result?: object | null) => {
  return {
    isSuccess: isSuccess,
    code: code,
    message: message,
    result: result,
  };
};

const errResponse = ({ isSuccess, code, message }: BaseResponse) => {
  throw new HttpException({ isSuccess, code, message }, HttpStatus.OK);
};

export { BaseResponse, response, errResponse };
