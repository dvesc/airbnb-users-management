import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ManagementClient = require('auth0').ManagementClient;

@Injectable()
export class Auth0_service {
  private auth0: any;
  public constructor(private readonly config_service: ConfigService) {
    this.auth0 = new ManagementClient({
      domain: this.config_service.get('auth0.domain'),
      clientId: this.config_service.get('auth0.client_id'),
      clientSecret: this.config_service.get('auth0.client_secret'),
      scope: 'read:users update:users',
    });
  }

  register_user = async (name: string, email: string, password: string) => {
    const user_created = await this.auth0.users.create({
      email: email,
      password: password,
      connection: 'Username-Password-Authentication', //conecction type
    });
    const auth0_id = user_created.identities[0].user_id; //el objeto creado es complejo, lo cierto es que ahi esta el id

    //le editamos el nombre al usuario una vez creado
    const params = { id: 'auth0|' + auth0_id }; //esto debe ir asi
    this.auth0.users.update(params, { name: name });

    return auth0_id;
  };

  update_user = async (auth0_id: string, data: any): Promise<void> => {
    const params = { id: 'auth0|' + auth0_id }; //esto debe ir asi
    await this.auth0.users.update(params, data);
  };

  delete_user = async (auth0_id: string): Promise<void> => {
    const params = { id: 'auth0|' + auth0_id }; //esto debe ir asi
    await this.auth0.users.delete(params);
  };
}
