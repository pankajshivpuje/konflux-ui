import dayjs from 'dayjs';

type WarningFields = {
  daysUntilEvent?: number;
  warningType?: 'expiring-exception' | 'upcoming-activation';
  effectiveUntil?: string;
};

export const computeWarningFields = (
  effectiveOn?: string,
  effectiveUntil?: string,
): WarningFields => {
  const now = dayjs();

  if (effectiveUntil) {
    const until = dayjs(effectiveUntil);
    if (until.isValid() && until.isAfter(now)) {
      return {
        daysUntilEvent: until.diff(now, 'day'),
        warningType: 'expiring-exception',
        effectiveUntil,
      };
    }
  }

  if (effectiveOn) {
    const on = dayjs(effectiveOn);
    if (on.isValid() && on.isAfter(now)) {
      return {
        daysUntilEvent: on.diff(now, 'day'),
        warningType: 'upcoming-activation',
      };
    }
  }

  return {};
};
