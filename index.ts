import { playAudioFile } from "audic";
import "colors";
import ms from "ms";
import { config } from "./config";
import logger from "./lib/logger";
import {
  bookSeat,
  getFreePlaces as getFreeSeats,
  Seat,
  startDraftOrder,
} from "./requests/order";
import { getTicketTypes as getPlaces, Place } from "./requests/ticket-types";

const DEFAULT_FILTERS = [
  /*byAvailable*/
];

class Executor {
  private retries = 0;
  private interval: NodeJS.Timeout | null = null;

  start() {
    if (this.interval) {
      throw new Error("Already started");
    }
    this.interval = setInterval(() => {
      this.callback().catch((err) => console.error(err));
    }, ms(config.interval));
  }

  stop() {
    clearInterval(this.interval);
  }

  private async callback() {
    this.retries++;
    console.log();
    logger.info(`Checking for tickets... (${this.retries})`);
    const tickets = await this.findTickets();
    if (tickets.length) {
      console.log("Booking tickets...");
      await this.bookTickets(tickets);
      this.stop();
      await this.playRingtone();
      process.exit(0);
    }
  }

  private filterPlaces(places: Place[]) {
    const filters = DEFAULT_FILTERS.concat(config.filters);
    const filteredPlaces: Place[] = [];
    for (const place of places) {
      const firstReason = filters
        .values()
        .map((filter) => filter(place))
        .filter((result) => result !== true)
        .next().value;
      const log = `- ${place.LeavingDateTime.format("LT")} ${place.CarriageClass.Name} ${place.MoneyAmount}₾`;
      if (!firstReason) {
        filteredPlaces.push(place);
        logger.info(log.blue);
      } else {
        logger.info(`${log} (${firstReason})`.red);
      }
    }
    return filteredPlaces;
  }

  private async findTickets(): Promise<[Place, Seat][]> {
    const places = await getPlaces({
      leavingDate: new Date(config.date),
      fromStation: config.from,
      toStation: config.to,
    });
    if (places.length) {
      logger.info(
        `Found ${places.length} ${pluralize("place", places.length)}:`,
      );
    } else {
      logger.info("No places found".red);
      return [];
    }
    const filteredPlaces = this.filterPlaces(places);
    if (!filteredPlaces) {
      logger.info("No places matching filter".red);
      return [];
    }
    const seats = (
      await Promise.all(
        filteredPlaces.map((place) =>
          getFreeSeats(place, config.from, config.to).then((seats) =>
            seats.map((seat): [Place, Seat] => [place, seat]),
          ),
        ),
      )
    ).flat();
    return seats;
  }

  private bookTickets(tickets: [Place, Seat][]) {
    return Promise.all(
      tickets.slice(0, config.ticketsNeeded).map(async ([place, seat]) => {
        const orderKey = await startDraftOrder(place, config.from, config.to);
        await bookSeat(orderKey, place, seat, config.from, config.to);
        logger.info(`Book the seat: ${this.getDataFillingURL(orderKey).cyan}`);
      }),
    );
  }

  private getDataFillingURL(orderKey: string) {
    return (
      "https://tkt.ge/railway/datafilling?" +
      new URLSearchParams({
        orderkey: orderKey,
      })
    );
  }

  private playRingtone() {
    return playAudioFile("./ringtone.wav");
  }
}

function pluralize(singular: string, n: number) {
  return n === 1 ? singular : singular + "s";
}

const executor = new Executor();
executor.start();
