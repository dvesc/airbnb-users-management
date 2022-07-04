import { registerAs } from '@nestjs/config';

export default registerAs('mongo', () => ({
  uri: `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`,
}));
