import { Dayjs } from "dayjs";
import { config } from "./config";
import datetime from "./lib/datetime";
import { Place } from "./requests/ticket-types";

export type Filter = (place: Place) => true | string;

export const byClass =
  (carriageName: string | Array<string>): Filter =>
  (place) => {
    const carriages = Array.isArray(carriageName)
      ? carriageName
      : [carriageName];
    return (
      carriages.includes(place.CarriageClass.CarriageName) ||
      carriages.map((carriage) => `not ${carriage}`).join(", ")
    );
  };

function setTime(date: Dayjs, time: string) {
  const parsedTime = datetime.tz(time, config.tz);
  return date.hour(parsedTime.hour()).minute(parsedTime.minute());
}

type TimeFilter = [from: string | undefined, to?: string | undefined];
export const byTimeRanges =
  (filters: Array<TimeFilter>): Filter =>
  (place) => {
    const reasons = [];
    const time = place.LeavingDateTime;
    return (
      filters.some(([from, to]) => {
        if (from && time.isBefore(setTime(time, from), "minute")) {
          reasons.push(`before ${from}`);
          return false;
        }
        if (to && time.isAfter(setTime(time, to), "minute")) {
          reasons.push(`after ${to}`);
          return false;
        }
        return true;
      }) || reasons.join(", ")
    );
  };

export const byAvailable: Filter = (place) =>
  (place.AvailableCount !== null && place.AvailableCount > 0) || "unavailable";
