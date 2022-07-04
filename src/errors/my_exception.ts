import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

export class My_exception extends HttpException {
  constructor(msg: string, name: string, status: number) {
    super(
      {
        status,
        error: name,
        message: msg,
      },
      //Este status es el de la peticion no del body
      status,
    );
  }
}
