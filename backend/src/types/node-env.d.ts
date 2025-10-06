declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET: string;
      POSTGRES_PRISMA_URL: string;
      POSTGRES_URL_NON_POOLING?: string;
      PORT?: string | number;
      FRONTEND_AUTHORIZED_URL: string;
    }
  }
}
