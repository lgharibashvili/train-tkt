import z from "zod";
import { config } from "../config";
import datetime from "../lib/datetime";
import logger from "../lib/logger";
import "../lib/promise-effect";
import { client } from "./client";

function parseDate(timestamp: string) {
  // Server returns timestamps in UTC which we convert to Tbilisi time
  return datetime.tz(timestamp, config.tz);
}

export const Place = z.object({
  Train: z.object({
    TrainId: z.string(),
    TrainNumber: z.number(),
    Name: z.string(),
    IsTwoStorey: z.boolean(),
  }),
  Rank: z.object({
    CarriageRankId: z.number(),
    Name: z.string(),
  }),
  CarriageClass: z.object({
    CarriageClassId: z.number(),
    Name: z.string(),
    CarriageName: z.string(),
  }),
  LeavingDateTime: z.string().transform(parseDate),
  EnteringDateTime: z.string().transform(parseDate),
  MoneyAmount: z.number(),
  AvailableCount: z.number().nullable(),
});
export type Place = z.infer<typeof Place>;

export const TicketTypesData = z.object({
  Places: z.array(Place),
});

export enum Station {
  TBILISI = 56014,
  BATUMI = 57151,
}

export const CarriageClass = {
  First: "I Class",
  Second: "II Class",
  Business: "BusinessClass",
};

type GetTicketTypesParams = {
  leavingDate: Date;
  fromStation: Station;
  toStation: Station;
};

export async function getTicketTypes({
  leavingDate,
  fromStation,
  toStation,
}: GetTicketTypesParams) {
  const data = await client
    .get("ticketTypes", {
      leavingDate: leavingDate.toISOString(),
      fromStationNumber: fromStation.toString(),
      toStationNumber: toStation.toString(),
    })
    .effect((data) => logger.debug(data, "GET ticketTypes:"))
    .then((data) => TicketTypesData.parse(data));
  return data.Places;
}
