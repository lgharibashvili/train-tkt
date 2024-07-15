import z from "zod";
import { client } from "./client";
import { Place, Station } from "./ticket-types";

const DraftOrderData = z.object({
  OrderKey: z.string(),
});

export async function startDraftOrder(
  place: Place,
  stationFrom: Station,
  stationTo: Station,
) {
  const data = await client
    .post("draft", {
      isForDisabledPerson: false,
      isTwoWay: false,
      outboundPlace: {
        adultQuantity: 1,
        childQuantity: 0,
        carriageClassId: place.CarriageClass.CarriageClassId,
        carriageRankId: place.Rank.CarriageRankId,
        enteringDate: place.EnteringDateTime.toISOString(),
        leavingDate: place.LeavingDateTime.toISOString(),
        stationFromNumber: stationFrom,
        stationToNumber: stationTo,
        trainId: place.Train.TrainId,
        trainNumber: place.Train.TrainNumber,
      },
      returnPlace: null,
    })
    .then((data) => DraftOrderData.parse(data));
  return data.OrderKey;
}

export const Seat = z.object({
  PlaceId: z.number(),
  PlaceNumber: z.number(),
  PlaceTypeId: z.number(),
  PlaceTypeName: z.string(),
  WagonNumber: z.number(),
  WagonId: z.string(),
});
export type Seat = z.infer<typeof Seat>;

const MapData = z.object({
  FreePlaces: z.array(Seat),
});

export async function getFreePlaces(
  place: Place,
  fromStation: Station,
  toStation: Station,
) {
  const data = await client
    .get("map", {
      trainId: place.Train.TrainId,
      wagonClassId: place.CarriageClass.CarriageClassId.toString(),
      wagonRankId: place.Rank.CarriageRankId.toString(),
      sourceStation: fromStation.toString(),
      destinationStation: toStation.toString(),
    })
    .then((data) => MapData.parse(data));
  return data.FreePlaces;
}

const BookSeatData = z.object({
  OrderDetailsId: z.number(),
  PurchaseId: z.string(),
});

export async function bookSeat(
  orderKey: string,
  place: Place,
  seat: Seat,
  fromStation: Station,
  toStation: Station,
) {
  return client
    .post(
      "bookseat",
      {},
      {
        sourceStation: fromStation.toString(),
        destinationStation: toStation.toString(),
        teenCount: "0",
        adultCount: "1",
        trainId: place.Train.TrainId,
        wagonId: seat.WagonId,
        placeId: seat.PlaceId.toString(),
        wagonClassId: place.CarriageClass.CarriageClassId.toString(),
        wagonRankId: place.Rank.CarriageRankId.toString(),
        trainNumber: place.Train.TrainNumber.toString(),
        wagonTypeId: seat.PlaceTypeId.toString(),
        leavingDate: place.LeavingDateTime.toISOString(),
        enteringDate: place.EnteringDateTime.toISOString(),
        placeTypeName: seat.PlaceTypeName,
        isBackPlace: "false",
        orderKey: orderKey,
      },
    )
    .then((data) => BookSeatData.parse(data));
}
