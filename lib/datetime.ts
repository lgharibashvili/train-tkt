import dayjs from "dayjs";
import parserPlugin from "dayjs-parser";
import localizedFormat from "dayjs/plugin/localizedFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(parserPlugin);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

const datetime = dayjs;
export default datetime;
