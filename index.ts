import { playAudioFile } from "audic";
import "colors";
import ms from "ms";
import { config } from "./config";
import { byAvailable } from "./filters";
import {
  bookSeat,
  getFreePlaces as getFreeSeats,
  startDraftOrder,
} from "./order";
import { getTicketTypes as getPlaces } from "./ticket-types";

function getDataFillingURL(orderKey: string) {
  return (
    "https://tkt.ge/railway/datafilling?" +
    new URLSearchParams({
      orderkey: orderKey,
    })
  );
}

function playRingtone() {
  return playAudioFile("./ringtone.wav");
}

async function findTickets(): Promise<boolean> {
  const places = await getPlaces({
    leavingDate: new Date(config.date),
    fromStation: config.from,
    toStation: config.to,
  });
  console.log(
    "Found places:",
    places.map((p) => [
      p.LeavingDateTime,
      p.LeavingDateTime.toLocaleTimeString(),
      p.CarriageClass.Name,
    ]),
  );
  let filteredPlaces = places.filter(byAvailable);
  for (const filter of config.filters) {
    filteredPlaces = filteredPlaces.filter(filter);
  }
  const place = filteredPlaces[0];
  if (!place) {
    console.log("No places matching filter".red);
    return false;
  }
  const seats = await getFreeSeats(place, config.from, config.to);
  if (!seats.length) {
    return false;
  }
  await Promise.all(
    seats.slice(0, config.ticketsNeeded).map(async (seat) => {
      const orderKey = await startDraftOrder(place, config.from, config.to);
      await bookSeat(orderKey, place, seat, config.from, config.to);
      console.log("Book the seat:", getDataFillingURL(orderKey).cyan);
    }),
  );
  return true;
}

let retries = 0;
const interval = setInterval(() => {
  retries++;
  console.log(`${retries}: Checking for tickets...`);
  findTickets()
    .catch((err) => {
      console.error(err);
    })
    .then((found) => {
      if (found) {
        clearInterval(interval);
        playRingtone().then(() => process.exit(0));
      }
    });
}, ms(config.interval));
