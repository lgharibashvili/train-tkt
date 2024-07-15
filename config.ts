import { byClass, excludeDates } from "./filters";
import { CarriageClass, Station } from "./ticket-types";

export const config = {
  date: "2024-07-16",
  from: Station.TBILISI,
  to: Station.BATUMI,
  ticketsNeeded: 2,
  interval: "5s",

  filters: [
    byClass([CarriageClass.Second, CarriageClass.First]),
    excludeDates([
      new Date("2024-07-16T02:30:00.000Z"),
      new Date("2024-07-16T06:25:00.000Z"),
      new Date("2024-07-16T13:05:00.000Z"),
    ]),
  ],
};
