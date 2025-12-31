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
  }),
);

app.get("/", (c) => {
  return c.text("OK");
});

import { serve } from "@hono/node-server";
import prisma from "@04-sql-murder-mystery-/db";

app.get(
  "/report",
  zValidator(
    "query",
    z
      .object({
        id: z.coerce.number().optional(),
        date: z.coerce.number().optional(),
        type: z.string().optional(),
        description: z.string().optional(),
        city: z.string().optional(),
      })
      .refine((obj) => Object.values(obj).some((v) => v !== undefined), {
        message: "Report must include at least one field",
      }),
  ),
  async (c) => {
    const { date, type, city } = c.req.valid("query");
    const mystery = await prisma.crime_scene_report.findMany({
      where: {
        date,
        type,
        city,
      },
    });
    return c.json(mystery);
  },
);

const WitnessSchema = z
  .array(
    z
      .object({
        id: z.coerce.number().optional(),
        name: z.string().optional(),
        license_id: z.coerce.number().optional(),
        address_street_name: z.string().optional(),
        ssn: z.string().optional(),
      })
      .refine((obj) => Object.values(obj).some((v) => v !== undefined), {
        message: "Witness must include at least one field",
      }),
  )
  .nonempty("At least one witness is required");

app.post("/witness", zValidator("json", WitnessSchema), async (c) => {
  const data = c.req.valid("json");
  const witnesses = await Promise.all(
    data.map((witness) => {
      return prisma.person.findFirst({
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
    }),
  );
  const filteredWitnesses = witnesses.filter((witness) => witness !== null);
  return c.json(filteredWitnesses);
});

app.get(
  "/gym",
  zValidator(
    "query",
    z.object({
      check_in_date: z.coerce.number(),
      check_in_time: z.coerce.number(),
      check_out_time: z.coerce.number(),
    }),
  ),
  async (c) => {
    const { check_in_date, check_in_time, check_out_time } = c.req.valid("query");
    const gym = await prisma.get_fit_now_check_in.findMany({
      where: {
        check_in_date,
        check_in_time: {
          lte: check_in_time,
        },
        check_out_time: {
          gte: check_out_time,
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
  },
);

app.get("/solicitor", async (c) => {
  const solicitor_drivers_license = await prisma.drivers_license.findMany({
    where: {
      car_make: {
        contains: "Tesla",
      },
      car_model: {
        contains: "Model S",
      },
      hair_color: {
        contains: "red",
      },
      height: {
        gte: 65,
        lte: 67,
      },
      person: {
        some: {
          facebook_event_checkin: {
            some: {
              event_name: {
                contains: "SQL Symphony Concert",
              },
            },
          },
        },
      },
    },
    include: {
      person: {
        include: {
          interview: true,
          income: true,
          facebook_event_checkin: true,
        },
      },
    },
  });
  return c.json(solicitor_drivers_license);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
