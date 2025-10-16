import type { PrismaService } from '../services/prisma.service';

export type RequestContext = {
  prisma?: PrismaService;
  service?: any;
  pendingServiceClass?: any;
  user?: { id: string; scopes: string[] };
};
