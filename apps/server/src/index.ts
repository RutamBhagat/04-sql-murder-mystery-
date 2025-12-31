import { env } from "@04-sql-murder-mystery-/env/server";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
  })
);

app.get("/", (c) => {
  return c.text("OK");
});

import { serve } from "@hono/node-server";
import prisma from "@04-sql-murder-mystery-/db";

app.get("/report", async (c) => {
  const { date, type, city } = c.req.query();
  const mystery = await prisma.crime_scene_report.findMany({
    where: {
      date: date ? Number(date) : undefined,
      type: type ? type : undefined,
      city: city ? city : undefined,
    },
  });
  return c.json(mystery);
});

const WitnessSchema = z.array(
  z.object({
    id: z.number().optional(),
    name: z.string().optional(),
    license_id: z.number().optional(),
    address_street_name: z.string().optional(),
    ssn: z.string().optional(),
  })
);

app.post("/witness", zValidator("json", WitnessSchema), async (c) => {
  const data = c.req.valid("json");
  let emptyData = true;
  if (data.length === 0) {
    return c.json({ error: "No data provided" }, 400);
  }
  for (const item of data) {
    if (!!item) {
      emptyData = false;
      break;
    }
  }
  if (emptyData) {
    return c.json({ error: "No data provided" }, 400);
  }
  const witnesses = [];
  for (const witness of data) {
    const witnessData = await prisma.person.findFirst({
      where: {
        id: witness.id,
        name: witness.name ? { contains: witness.name } : undefined,
        license_id: witness.license_id,
        address_street_name: witness.address_street_name
          ? { contains: witness.address_street_name }
          : undefined,
        ssn: witness.ssn,
      },
      include: {
        interview: true,
        drivers_license: true,
        income: true,
        facebook_event_checkin: true,
        get_fit_now_member: {
          include: {
            get_fit_now_check_in: true,
          },
        },
      },
    });
    if (witnessData) {
      witnesses.push(witnessData);
    }
  }
  return c.json(witnesses);
});

app.get("/gym", async (c) => {
  const gym = await prisma.get_fit_now_check_in.findMany({
    where: {
      check_in_date: 20180109,
      check_in_time: {
        lte: 1700,
      },
      check_out_time: {
        gte: 1600,
      },
    },
    include: {
      get_fit_now_member: {
        include: {
          person: true,
        },
      },
    },
  });
  return c.json(gym);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
