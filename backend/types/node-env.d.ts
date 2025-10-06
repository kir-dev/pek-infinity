declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'development' | 'production' | 'test' | (string & {});
    PORT?: string;
    POSTGRES_PRISMA_URL?: string;
    POSTGRES_URL_NON_POOLING?: string;
  }
}
