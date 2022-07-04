import { registerAs } from '@nestjs/config';

export default registerAs('auth0', () => ({
  domain: process.env.AUTH0_DOMAIN,
  client_id: process.env.AUTH0_CLIENT_ID,
  client_secret: process.env.AUTH0_CLIENT_ID_SECRET,
}));
