import { byClass, byTimeRanges, Filter } from "./filters";
import { CarriageClass, Station } from "./requests/ticket-types";

type Config = {
  date: string;
  from: Station;
  to: Station;
  ticketsNeeded: number;
  interval: string;
  filters: Filter[];
  tz: string;
};

export const config: Config = {
  date: "2024-08-24",
  from: Station.TBILISI,
  to: Station.BATUMI,
  ticketsNeeded: 2,
  interval: "5s",

  filters: [
    byTimeRanges([["12:30 pm", "3:30 pm"]]),
    byClass([CarriageClass.Second]),
  ],

  // These settings should usually be left as is
  tz: "Asia/Tbilisi",
};
