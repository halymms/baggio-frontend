import { FINANCIAL_COMPANY_IDS } from './constants';
import type { FinancialSection, RealtimeReportParams } from '@/types/properfy';

export function buildRealtimeReportBody(
  section: FinancialSection,
  year: number,
  month: number
): RealtimeReportParams {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  return buildRealtimeReportBodyFromRange(section, startDate, endDate);
}

export function buildRealtimeReportBodyFromRange(
  section: FinancialSection,
  startDate: Date,
  endDate: Date
): RealtimeReportParams {
  return {
    section,
    companies: [...FINANCIAL_COMPANY_IDS],
    dteRange: [startDate.toISOString(), endDate.toISOString()],
  };
}
