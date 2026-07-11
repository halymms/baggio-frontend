'use client';

import * as XLSX from 'xlsx';
import { BriefcaseIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import styles from '@/app/dashboard/financial/financial.module.scss';

export type RentalAnnualClosingRow = {
  month: string;
  receitaBruta: number | null;
  totalDespesasPessoal: number | null;
  totalDespesasPessoalExtras: number | null;
  despesasNormais: number | null;
  receitaLiquida: number | null;
  fundoDeReserva: number | null;
  resultadoLiquido: number | null;
  folhaPagamento: number | null;
  calculoFolhaPagamento: number | null;
  investimentos: number | null;
  impostos: number | null;
  totalDespesas: number | null;
  lucroLiquido: number | null;
  comissaoGestores: number | null;
  retirada: number | null;
};

export type SalesAnnualClosingRow = {
  month: string;
  receitaBruta: number | null;
  totalDespesasPessoal: number | null;
  despesasNormais: number | null;
  receitaLiquida: number | null;
  fundoDeReserva: number | null;
  fundoInovacaoFetched: number | null;
  resultadoLiquido: number | null;
  folhaPagamento: number | null;
  investimentos: number | null;
  impostos: number | null;
  totalDespesas: number | null;
  lucroLiquido: number | null;
  comissaoGestores: number | null;
  retirada: number | null;
};

type AnnualClosingTableBaseProps = {
  formatBRL: (value: number) => string;
  onExport?: () => void;
};

export type AnnualClosingTableProps = AnnualClosingTableBaseProps &
  (
    | { section: 1; annualClosingData: RentalAnnualClosingRow[] }
    | { section: 2; annualClosingData: SalesAnnualClosingRow[] }
  );

function formatCell(
  value: number | null | undefined,
  formatBRL: (value: number) => string
): string {
  if (value === null || value === undefined) return '---';
  return formatBRL(value);
}

function exportRentalToExcel(data: RentalAnnualClosingRow[]) {
  const exportData = data.map((row) => ({
    Mês: row.month,
    'Receita Bruta': row.receitaBruta ?? '',
    'Despesas com Pessoal': row.totalDespesasPessoalExtras ?? '',
    'Despesas Normais': row.despesasNormais ?? '',
    'Receita Liquida': row.receitaLiquida ?? '',
    'Fundo de Inovação 5%': row.fundoDeReserva ?? '',
    'Fundo de Reserva 5%': row.fundoDeReserva ?? '',
    'Resultado Líquido': row.resultadoLiquido ?? '',
    'Folha de Pagamento': row.calculoFolhaPagamento ?? '',
    Investimentos: row.investimentos ?? '',
    Impostos: row.impostos ?? '',
    Despesas: row.totalDespesas ?? '',
    'Lucro Líquido': row.lucroLiquido ?? '',
    'Comissão Gestores':
      row.comissaoGestores !== null && row.comissaoGestores !== undefined
        ? -Math.abs(row.comissaoGestores)
        : '',
    Retirada: row.retirada ?? '',
  }));
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Fechamento Anual');
  XLSX.writeFile(workbook, 'fechamento_anual.xlsx');
}

function exportSalesToExcel(data: SalesAnnualClosingRow[]) {
  const exportData = data.map((row) => ({
    Mês: row.month,
    'Receita Bruta': row.receitaBruta ?? '',
    'Despesas com Pessoal': row.totalDespesasPessoal ?? '',
    'Despesas Normais': row.despesasNormais ?? '',
    'Receita Liquida': row.receitaLiquida ?? '',
    'Fundo de Inovação 5%': row.fundoInovacaoFetched ?? '',
    'Fundo de Reserva 5%': row.fundoDeReserva ?? '',
    'Resultado Líquido': row.resultadoLiquido ?? '',
    'Folha de Pagamento': row.folhaPagamento ?? '',
    Investimentos: row.investimentos ?? '',
    Impostos: row.impostos ?? '',
    Despesas: row.totalDespesas ?? '',
    'Lucro Líquido': row.lucroLiquido ?? '',
    'Comissão Gestores': row.comissaoGestores ?? '',
    Retirada: row.retirada ?? '',
  }));
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Fechamento Anual');
  XLSX.writeFile(workbook, 'fechamento_anual.xlsx');
}

const RENTAL_HEADERS = [
  'Mês',
  'Receita Bruta',
  'Despesas com Pessoal Extras',
  'Despesas Normais',
  'Receita Liquida',
  'Fundo de Inovação 5%',
  'Fundo de Reserva 5%',
  'Resultado Líquido',
  'Folha de Pagamento',
  'Investimentos',
  'Impostos',
  'Despesas',
  'Lucro Líquido',
  'Comissão Gestores',
  'Retirada',
] as const;

const SALES_HEADERS = [
  'Mês',
  'Receita Bruta',
  'Despesas com Pessoal',
  'Despesas Normais',
  'Receita Liquida',
  'Fundo de Inovação 5%',
  'Fundo de Reserva 5%',
  'Resultado Líquido',
  'Folha de Pagamento',
  'Investimentos',
  'Impostos',
  'Despesas',
  'Lucro Líquido',
  'Comissão Gestores',
  'Retirada',
] as const;

function RentalRowCells({
  row,
  formatBRL,
}: {
  row: RentalAnnualClosingRow;
  formatBRL: (value: number) => string;
}) {
  return (
    <>
      <td>{row.month}</td>
      <td>{formatCell(row.receitaBruta, formatBRL)}</td>
      <td>{formatCell(row.totalDespesasPessoalExtras, formatBRL)}</td>
      <td>{formatCell(row.despesasNormais, formatBRL)}</td>
      <td>{formatCell(row.receitaLiquida, formatBRL)}</td>
      <td>{formatCell(row.fundoDeReserva, formatBRL)}</td>
      <td>{formatBRL(0)}</td>
      <td>{formatCell(row.resultadoLiquido, formatBRL)}</td>
      <td>{formatCell(row.calculoFolhaPagamento, formatBRL)}</td>
      <td>{formatCell(row.investimentos, formatBRL)}</td>
      <td>{formatCell(row.impostos, formatBRL)}</td>
      <td>{formatCell(row.totalDespesas, formatBRL)}</td>
      <td>{formatCell(row.lucroLiquido, formatBRL)}</td>
      <td>
        {row.comissaoGestores !== null
          ? formatBRL(-Math.abs(row.comissaoGestores))
          : '---'}
      </td>
      <td>{formatCell(row.retirada, formatBRL)}</td>
    </>
  );
}

function SalesRowCells({
  row,
  formatBRL,
}: {
  row: SalesAnnualClosingRow;
  formatBRL: (value: number) => string;
}) {
  return (
    <>
      <td>{row.month}</td>
      <td>{formatCell(row.receitaBruta, formatBRL)}</td>
      <td>{formatCell(row.totalDespesasPessoal, formatBRL)}</td>
      <td>{formatCell(row.despesasNormais, formatBRL)}</td>
      <td>{formatCell(row.receitaLiquida, formatBRL)}</td>
      <td>{formatCell(row.fundoInovacaoFetched, formatBRL)}</td>
      <td>{formatBRL(0)}</td>
      <td>{formatCell(row.resultadoLiquido, formatBRL)}</td>
      <td>{formatCell(row.folhaPagamento, formatBRL)}</td>
      <td>{formatCell(row.investimentos, formatBRL)}</td>
      <td>{formatCell(row.impostos, formatBRL)}</td>
      <td>{formatCell(row.totalDespesas, formatBRL)}</td>
      <td>{formatCell(row.lucroLiquido, formatBRL)}</td>
      <td>{formatCell(row.comissaoGestores, formatBRL)}</td>
      <td>{formatCell(row.retirada, formatBRL)}</td>
    </>
  );
}

export function AnnualClosingTable({
  annualClosingData,
  formatBRL,
  section,
  onExport,
}: AnnualClosingTableProps) {
  const headers = section === 1 ? RENTAL_HEADERS : SALES_HEADERS;

  const handleExport = () => {
    if (onExport) {
      onExport();
      return;
    }
    if (!annualClosingData || annualClosingData.length === 0) return;
    if (section === 1) {
      exportRentalToExcel(annualClosingData as RentalAnnualClosingRow[]);
    } else {
      exportSalesToExcel(annualClosingData as SalesAnnualClosingRow[]);
    }
  };

  return (
    <div className={styles.annualClosingDataContainer}>
      <div className={styles.annualClosingDataTitle}>
        <h4 className={styles.annualClosingDataTitleText}>
          <BriefcaseIcon width={20} height={20} /> Dados do Fechamento
        </h4>
        <button
          type="button"
          onClick={handleExport}
          className={styles.annualClosingDataExportButton}
        >
          <TableCellsIcon width={20} height={20} /> Exportar para Excel
        </button>
      </div>
      <div className={styles.annualClosingDataContent}>
        <div className={styles.anualClosingDataTableContainer}>
          <table className={styles.annualClosingDataTable}>
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section === 1
                ? (annualClosingData as RentalAnnualClosingRow[]).map((row, idx) => (
                    <tr
                      key={idx}
                      style={{ background: idx % 2 === 0 ? '#ccf' : '#99f' }}
                    >
                      <RentalRowCells row={row} formatBRL={formatBRL} />
                    </tr>
                  ))
                : (annualClosingData as SalesAnnualClosingRow[]).map((row, idx) => (
                    <tr
                      key={idx}
                      style={{ background: idx % 2 === 0 ? '#ccf' : '#99f' }}
                    >
                      <SalesRowCells row={row} formatBRL={formatBRL} />
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
