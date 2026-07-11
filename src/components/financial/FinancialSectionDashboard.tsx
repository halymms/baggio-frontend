'use client';

import type { FinancialSection } from '@/types/properfy';
import { SECTION_LABELS } from '@/lib/financial/constants';
import { RentalDashboardContent } from './RentalDashboardContent';
import { SalesDashboardContent } from './SalesDashboardContent';

interface FinancialSectionDashboardProps {
  section: FinancialSection;
}

export function FinancialSectionDashboard({
  section,
}: FinancialSectionDashboardProps) {
  const labels = SECTION_LABELS[section];

  if (section === 2) {
    return (
      <SalesDashboardContent
        title={labels.title}
        subtitle={labels.subtitle}
        section={section}
      />
    );
  }

  return (
    <RentalDashboardContent
      title={labels.title}
      subtitle={labels.subtitle}
      section={section}
    />
  );
}
