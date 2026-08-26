import "server-only";

import { createPrismaClient } from "@/lib/create-prisma-client";

type AppPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as { prisma?: AppPrismaClient };
let prisma = globalForPrisma.prisma;

function getPrismaClient() {
  if (!prisma) {
    prisma = createPrismaClient();
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  }
  return prisma;
}

export const db = new Proxy({} as AppPrismaClient, {
  get(_target, property) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
