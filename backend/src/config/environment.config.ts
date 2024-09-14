import * as dotenv from 'dotenv';
import * as env from 'env-var';

dotenv.config();

export const FRONTEND_CALLBACK =
  process.env.VERCEL_ENV === 'preview' || process.env.FORCE_LAMBDA_API === '1'
    ? `https://${process.env.VERCEL_BRANCH_URL!}`
    : env.get('FRONTEND_CALLBACK').required().asString();

export const JWT_SECRET = env.get('JWT_SECRET').required().asString();

export const AUTHSCH_CLIENT_ID = env
  .get('AUTHSCH_CLIENT_ID')
  .required()
  .asString();

export const AUTHSCH_CLIENT_SECRET = env
  .get('AUTHSCH_CLIENT_SECRET')
  .required()
  .asString();
