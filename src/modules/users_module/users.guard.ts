import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UsersModuleService } from './users.service';
import { Users_vo } from './entities/users_module.entity';
import { Nonexistent_user_exception } from 'src/errors/nonexistent_use_exception';
import { Foreign_user_exception } from 'src/errors/foreign_user_exception';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');

@Injectable()
export class usersModuleGuard implements CanActivate {
  //CONSTRUCTOR----------------------------------------------------------------
  constructor(private users_services: UsersModuleService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.getArgByIndex(0),
      token = req.headers.authorization.split(' ')[1],
      //decodificamos el token
      payload = jwt.decode(token, { complete: true }).payload,
      auth0_id = payload.sub; //de auth0

    //obtenemos el id del usuario del req y la consultamos
    const coincidence: Users_vo | undefined =
      await this.users_services.get_user_by_id(req.params.user_id);

    //Comprobamos que exista dicho usuario
    if (!coincidence) throw new Nonexistent_user_exception();

    //Comprobamos que ese usuario sea el mismo que emitio el token
    if (`auth0|${coincidence.auth0_id}` != auth0_id)
      throw new Foreign_user_exception();

    return true;
  }
}
