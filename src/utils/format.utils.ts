import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";

dayjs.extend(relativeTime);
dayjs.locale("fr");

export const getTimeRemaining = (expiresAt: string | null): string => {
  if (!expiresAt) return "";
  const now = dayjs();
  const expiry = dayjs(expiresAt);

  if (now.isAfter(expiry)) return "Expirée";

  const diffMinutes = expiry.diff(now, "minute");
  if (diffMinutes > 60) return `Expire dans ${expiry.fromNow()}`;
  if (diffMinutes <= 0) return "Expire dans moins d'1 min";
  return `Expire dans ${diffMinutes} min`;
};
