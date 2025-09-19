import { format, formatDistanceStrict } from "date-fns";
import { enUS } from "date-fns/locale";

interface formatEmailDatesProps {
  requestedAt: Date;
  expireAt: Date;
}

export function formatEmailDates({
  requestedAt,
  expireAt,
}: formatEmailDatesProps) {
  const requestedAtFormatted = format(requestedAt, "d MMMM yyyy, HH:mm 'UTC'", {
    locale: enUS,
  });

  const relativeExpire = formatDistanceStrict(expireAt, requestedAt, {
    locale: enUS,
  });

  return {
    requestedAt: requestedAtFormatted,
    relativeExpire,
  };
}
