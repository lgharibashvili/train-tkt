import { Place } from "./ticket-types";

export const byClass =
  (carriageName: string | Array<string>) => (place: Place) =>
    (Array.isArray(carriageName) ? carriageName : [carriageName]).includes(
      place.CarriageClass.CarriageName,
    );

export const byAvailable = (place: Place) =>
  place.AvailableCount !== null && place.AvailableCount > 0;

export const excludeDates = (dates: Array<Date>) => (place: Place) =>
  !dates
    .map((date) => date.toISOString())
    .includes(place.LeavingDateTime.toISOString());
