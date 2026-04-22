import dayjs from 'dayjs';
import { ECPWarningType, UIConformaData } from '~/types/conforma';

export const computeDaysUntil = (dateStr: string): number => {
  return dayjs(dateStr).diff(dayjs(), 'day');
};

export const getWarningMessage = (data: UIConformaData): string => {
  const days = data.daysUntilEvent ?? 0;
  if (data.warningType === 'expiring-exception') {
    return `Warning! Builds will start failing in ${days} days due to "${data.title}" - exception expires`;
  }
  if (data.warningType === 'upcoming-activation') {
    return `Warning! New policy rule "${data.title}" activates in ${days} days - ensure compliance`;
  }
  return '';
};

export const getRemediationGuidance = (data: UIConformaData): string => {
  if (data.solution) {
    return data.solution;
  }
  if (data.warningType === 'expiring-exception') {
    return 'If an extension is needed, work with prodsec and releng. Otherwise, the exception will be automatically removed when the clean-up expired policies workflow runs.';
  }
  if (data.warningType === 'upcoming-activation') {
    return 'Review the new policy rule requirements and update your build pipeline to ensure compliance before the activation date.';
  }
  return '';
};

export const extractUpcomingWarnings = (
  results: UIConformaData[],
  thresholdDays: number = 30,
): UIConformaData[] => {
  return results.filter(
    (r) => r.warningType && r.daysUntilEvent != null && r.daysUntilEvent > 0 && r.daysUntilEvent <= thresholdDays,
  );
};

export const computeWarningFields = (
  effectiveOn?: string,
  effectiveUntil?: string,
): { warningType?: ECPWarningType; daysUntilEvent?: number } => {
  if (effectiveUntil) {
    const days = computeDaysUntil(effectiveUntil);
    if (days > 0) {
      return { warningType: 'expiring-exception', daysUntilEvent: days };
    }
  }
  if (effectiveOn) {
    const days = computeDaysUntil(effectiveOn);
    if (days > 0) {
      return { warningType: 'upcoming-activation', daysUntilEvent: days };
    }
  }
  return {};
};
