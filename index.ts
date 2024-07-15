import { playAudioFile } from "audic";
import "colors";
import ms from "ms";
import { byAvailable, byClass } from "./filters";
import {
  bookSeat,
  getFreePlaces as getFreeSeats,
  startDraftOrder,
} from "./order";
import {
  CarriageClass,
  Station,
  getTicketTypes as getPlaces,
} from "./ticket-types";

const FROM = Station.TBILISI;
const TO = Station.BATUMI;
const TICKETS_NEEDED = 2;
const INTERVAL = "20s";

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
    leavingDate: new Date("2024-07-15"),
    fromStation: FROM,
    toStation: TO,
  });
  const filteredPlaces = places
    .filter(byAvailable)
    .filter(byClass([CarriageClass.Second, CarriageClass.First]));
  const place = filteredPlaces[0];
  if (!place) {
    return false;
  }
  const seats = await getFreeSeats(place, FROM, TO);
  if (!seats.length) {
    return false;
  }
  await Promise.all(
    seats.slice(0, TICKETS_NEEDED).map(async (seat) => {
      const orderKey = await startDraftOrder(place, FROM, TO);
      await bookSeat(orderKey, place, seat, FROM, TO);
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
      clearInterval(interval);
      process.exit(1);
    })
    .then((found) => {
      if (found) {
        clearInterval(interval);
        playRingtone().then(() => process.exit(0));
      }
    });
}, ms(INTERVAL));

// Nino Lomtadze 01017007453
// Ana Tsakadze 01019081293
