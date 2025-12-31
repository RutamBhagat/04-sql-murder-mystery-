import { env } from "@04-sql-murder-mystery-/env/server";
import { PrismaLibSql } from "@prisma/adapter-libsql";

import { PrismaClient } from "../prisma/generated/client";

const adapter = new PrismaLibSql({
  url: env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
