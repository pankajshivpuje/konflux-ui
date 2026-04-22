import dayjs from 'dayjs';
import { CONFORMA_RESULT_STATUS, UIConformaData } from '~/types/conforma';
import {
  computeDaysUntil,
  computeWarningFields,
  extractUpcomingWarnings,
  getRemediationGuidance,
  getWarningMessage,
} from '../ecp-warning-utils';

describe('ecp-warning-utils', () => {
  describe('computeDaysUntil', () => {
    it('should return positive days for future dates', () => {
      const futureDate = dayjs().add(10, 'day').toISOString();
      expect(computeDaysUntil(futureDate)).toBe(10);
    });

    it('should return negative days for past dates', () => {
      const pastDate = dayjs().subtract(5, 'day').toISOString();
      expect(computeDaysUntil(pastDate)).toBe(-5);
    });

    it('should return 0 for today', () => {
      const today = dayjs().toISOString();
      expect(computeDaysUntil(today)).toBe(0);
    });
  });

  describe('getWarningMessage', () => {
    it('should return expiring exception message', () => {
      const data: UIConformaData = {
        title: 'CVE threshold',
        description: 'test',
        status: CONFORMA_RESULT_STATUS.warnings,
        component: 'comp',
        warningType: 'expiring-exception',
        daysUntilEvent: 15,
      };
      expect(getWarningMessage(data)).toBe(
        'Warning! Builds will start failing in 15 days due to "CVE threshold" - exception expires',
      );
    });

    it('should return upcoming activation message', () => {
      const data: UIConformaData = {
        title: 'SLSA v1.0',
        description: 'test',
        status: CONFORMA_RESULT_STATUS.warnings,
        component: 'comp',
        warningType: 'upcoming-activation',
        daysUntilEvent: 10,
      };
      expect(getWarningMessage(data)).toBe(
        'Warning! New policy rule "SLSA v1.0" activates in 10 days - ensure compliance',
      );
    });

    it('should return empty string for no warning type', () => {
      const data: UIConformaData = {
        title: 'Test',
        description: 'test',
        status: CONFORMA_RESULT_STATUS.successes,
        component: 'comp',
      };
      expect(getWarningMessage(data)).toBe('');
    });
  });

  describe('getRemediationGuidance', () => {
    it('should return solution field when present', () => {
      const data: UIConformaData = {
        title: 'Test',
        description: 'test',
        status: CONFORMA_RESULT_STATUS.warnings,
        component: 'comp',
        warningType: 'expiring-exception',
        solution: 'Fix the CVEs',
      };
      expect(getRemediationGuidance(data)).toBe('Fix the CVEs');
    });

    it('should return default expiring exception guidance when no solution', () => {
      const data: UIConformaData = {
        title: 'Test',
        description: 'test',
        status: CONFORMA_RESULT_STATUS.warnings,
        component: 'comp',
        warningType: 'expiring-exception',
      };
      expect(getRemediationGuidance(data)).toContain('work with prodsec and releng');
    });

    it('should return default upcoming activation guidance when no solution', () => {
      const data: UIConformaData = {
        title: 'Test',
        description: 'test',
        status: CONFORMA_RESULT_STATUS.warnings,
        component: 'comp',
        warningType: 'upcoming-activation',
      };
      expect(getRemediationGuidance(data)).toContain('ensure compliance before the activation date');
    });
  });

  describe('extractUpcomingWarnings', () => {
    const makeWarning = (
      warningType: 'expiring-exception' | 'upcoming-activation',
      daysUntilEvent: number,
    ): UIConformaData => ({
      title: 'Test',
      description: 'test',
      status: CONFORMA_RESULT_STATUS.warnings,
      component: 'comp',
      warningType,
      daysUntilEvent,
    });

    it('should return warnings within default 30-day threshold', () => {
      const results: UIConformaData[] = [
        makeWarning('expiring-exception', 15),
        makeWarning('upcoming-activation', 10),
        makeWarning('expiring-exception', 45), // beyond threshold
      ];
      const warnings = extractUpcomingWarnings(results);
      expect(warnings).toHaveLength(2);
    });

    it('should respect custom threshold', () => {
      const results: UIConformaData[] = [
        makeWarning('expiring-exception', 15),
        makeWarning('upcoming-activation', 10),
      ];
      const warnings = extractUpcomingWarnings(results, 12);
      expect(warnings).toHaveLength(1);
      expect(warnings[0].daysUntilEvent).toBe(10);
    });

    it('should exclude past events (negative days)', () => {
      const results: UIConformaData[] = [makeWarning('expiring-exception', -5)];
      expect(extractUpcomingWarnings(results)).toHaveLength(0);
    });

    it('should exclude results without warningType', () => {
      const results: UIConformaData[] = [
        {
          title: 'Test',
          description: 'test',
          status: CONFORMA_RESULT_STATUS.violations,
          component: 'comp',
        },
      ];
      expect(extractUpcomingWarnings(results)).toHaveLength(0);
    });
  });

  describe('computeWarningFields', () => {
    it('should return expiring-exception when effective_until is future', () => {
      const futureDate = dayjs().add(15, 'day').toISOString();
      const result = computeWarningFields(undefined, futureDate);
      expect(result.warningType).toBe('expiring-exception');
      expect(result.daysUntilEvent).toBe(15);
    });

    it('should return upcoming-activation when effective_on is future', () => {
      const futureDate = dayjs().add(10, 'day').toISOString();
      const result = computeWarningFields(futureDate, undefined);
      expect(result.warningType).toBe('upcoming-activation');
      expect(result.daysUntilEvent).toBe(10);
    });

    it('should prioritize effective_until over effective_on when both are future', () => {
      const futureUntil = dayjs().add(15, 'day').toISOString();
      const futureOn = dayjs().add(10, 'day').toISOString();
      const result = computeWarningFields(futureOn, futureUntil);
      expect(result.warningType).toBe('expiring-exception');
    });

    it('should return empty object when both dates are in the past', () => {
      const pastDate = dayjs().subtract(5, 'day').toISOString();
      const result = computeWarningFields(pastDate, pastDate);
      expect(result.warningType).toBeUndefined();
      expect(result.daysUntilEvent).toBeUndefined();
    });

    it('should return empty object when no dates provided', () => {
      const result = computeWarningFields(undefined, undefined);
      expect(result).toEqual({});
    });
  });
});
