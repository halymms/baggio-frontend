'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import {
  getInadimplenciaData,
  getInadimplenciaFechamentos,
  patchInadimplenciaAbertoAtualizado,
  syncInadimplenciaReferencia,
} from '@/services/api';
import type {
  InadimplenciaAcumulado12Meses,
  InadimplenciaFechamento,
  InadimplenciaRow,
} from '@/types/properfy';
import styles from './inadimplencia.module.scss';

function formatCurrency(value: unknown) {
  if (value == null || value === '') return '—';
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue);
}

function formatPercent(value: unknown) {
  if (value == null || value === '') return '—';
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return '—';
  return `${numericValue.toFixed(2)}%`;
}

function formatDate(value: unknown) {
  if (!value) return '—';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function monthLabel(mes: number, ano: number) {
  return new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
}

export default function InadimplenciaPage() {
  const [fechamentos, setFechamentos] = useState<InadimplenciaFechamento[]>([]);
  const [acumulado, setAcumulado] = useState<InadimplenciaAcumulado12Meses | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [syncingKey, setSyncingKey] = useState<string | null>(null);

  const [detailMes, setDetailMes] = useState<number | null>(null);
  const [detailAno, setDetailAno] = useState<number | null>(null);
  const [detailLabel, setDetailLabel] = useState('');
  const [detailRows, setDetailRows] = useState<InadimplenciaRow[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailSyncedAt, setDetailSyncedAt] = useState<string | null>(null);

  const refKey = (mes: number, ano: number) => `${ano}-${mes}`;

  const loadFechamentos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getInadimplenciaFechamentos();
      setFechamentos(response.data || []);
      setAcumulado(response.acumulado_12_meses || null);

      const drafts: Record<string, string> = {};
      for (const row of response.data || []) {
        const key = refKey(row.mes_referencia, row.ano_referencia);
        drafts[key] =
          row.valor_aberto_atualizado != null ? String(row.valor_aberto_atualizado) : '';
      }
      setDraftValues(drafts);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar os fechamentos de inadimplência.');
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (mes: number, ano: number) => {
    setDetailLoading(true);
    try {
      const response = await getInadimplenciaData(mes, ano);
      setDetailMes(mes);
      setDetailAno(ano);
      setDetailLabel(response.label);
      setDetailRows(response.data || []);
      setDetailSyncedAt(response.synced_at);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar o detalhe pendente da referência.');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    void loadFechamentos();
  }, []);

  const handleSaveAbertoAtualizado = async (row: InadimplenciaFechamento) => {
    const key = refKey(row.mes_referencia, row.ano_referencia);
    const raw = draftValues[key];
    const valor = Number(String(raw).replace(',', '.'));
    if (!Number.isFinite(valor) || valor < 0) {
      setError('Informe um valor em aberto atualizado válido (>= 0).');
      return;
    }

    setSavingKey(key);
    setError(null);
    try {
      const response = await patchInadimplenciaAbertoAtualizado(
        row.mes_referencia,
        row.ano_referencia,
        valor
      );
      setFechamentos((current) =>
        current.map((item) =>
          item.mes_referencia === row.mes_referencia && item.ano_referencia === row.ano_referencia
            ? response.fechamento
            : item
        )
      );
    } catch (err) {
      console.error(err);
      setError('Não foi possível salvar o valor em aberto atualizado.');
    } finally {
      setSavingKey(null);
    }
  };

  const handleVerPendente = async (row: InadimplenciaFechamento) => {
    const key = refKey(row.mes_referencia, row.ano_referencia);
    setSyncingKey(key);
    setError(null);
    try {
      const synced = await syncInadimplenciaReferencia(
        row.mes_referencia,
        row.ano_referencia
      );
      if (synced.fechamento) {
        setFechamentos((current) =>
          current.map((item) =>
            item.mes_referencia === row.mes_referencia &&
            item.ano_referencia === row.ano_referencia
              ? synced.fechamento!
              : item
          )
        );
      }
      await loadDetail(row.mes_referencia, row.ano_referencia);
    } catch (err) {
      console.error(err);
      setError('Não foi possível atualizar o pendente da referência.');
    } finally {
      setSyncingKey(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Link className={styles.backLink} href="/dashboard/financial">
            <ArrowLeftIcon width={18} height={18} />
            Voltar ao financeiro
          </Link>
          <h1 className={styles.title}>Inadimplência</h1>
          <p className={styles.subtitle}>
            Fechamento por referência: pago dia 1 e aberto dia 16 são fixos; valores atuais e
            aberto atualizado podem ser revisados a qualquer momento.
          </p>
        </div>
        <div className={styles.actionsGroup}>
          <button className={styles.refreshButton} onClick={() => void loadFechamentos()}>
            <ArrowPathIcon width={18} height={18} />
            Atualizar
          </button>
        </div>
      </div>

      <div className={styles.summaryCard}>
        <div>
          <p className={styles.summaryLabel}>Acumulado 12 meses</p>
          <p className={styles.summaryValue}>{formatPercent(acumulado?.percentual)}</p>
        </div>
        <div>
          <p className={styles.summaryLabel}>Total em aberto (12m)</p>
          <p className={styles.summaryValue}>{formatCurrency(acumulado?.total_aberto)}</p>
        </div>
        <div>
          <p className={styles.summaryLabel}>Total gerado (12m)</p>
          <p className={styles.summaryValue}>{formatCurrency(acumulado?.total_gerado)}</p>
        </div>
        <div>
          <p className={styles.summaryLabel}>Janela 12m</p>
          <p className={styles.summaryValue}>
            {acumulado
              ? `${monthLabel(acumulado.from.mes, acumulado.from.ano)} → ${monthLabel(
                  acumulado.to.mes,
                  acumulado.to.ano
                )}`
              : '—'}
          </p>
        </div>
      </div>

      {error ? <div className={styles.stateCard}>{error}</div> : null}

      {loading ? (
        <div className={styles.stateCard}>Carregando fechamentos…</div>
      ) : fechamentos.length === 0 ? (
        <div className={styles.stateCard}>
          Nenhum fechamento encontrado. Execute o sync com
          {' '}
          <code>npm run db:sync:inadimplencia</code>
          {' '}
          na API ou
          {' '}
          <code>POST /api/properfy/inadimplencia/sync</code>
          .
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Referência</th>
                <th>Pago dia 1</th>
                <th>Aberto dia 16</th>
                <th>% Fechamento</th>
                <th>Aberto atualizado</th>
                <th>% Acum. atualizada</th>
                <th>Pago atual</th>
                <th>Aberto atual</th>
                <th>% Atual</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {fechamentos.map((row) => {
                const key = refKey(row.mes_referencia, row.ano_referencia);
                return (
                  <tr key={key}>
                    <td>{row.dte_reference || '—'}</td>
                    <td>{formatCurrency(row.valor_pago_dia_1)}</td>
                    <td>{formatCurrency(row.valor_aberto_dia_16)}</td>
                    <td>{formatPercent(row.inadimplencia_fechamento_pct)}</td>
                    <td>
                      <div className={styles.inlineEdit}>
                        <input
                          className={styles.numberInput}
                          type="number"
                          min="0"
                          step="0.01"
                          value={draftValues[key] ?? ''}
                          onChange={(event) => {
                            setDraftValues((current) => ({
                              ...current,
                              [key]: event.target.value,
                            }));
                          }}
                          placeholder="0,00"
                        />
                        <button
                          className={styles.smallButton}
                          disabled={savingKey === key}
                          onClick={() => void handleSaveAbertoAtualizado(row)}
                        >
                          {savingKey === key ? '…' : 'Salvar'}
                        </button>
                      </div>
                    </td>
                    <td>{formatPercent(row.inadimplencia_acumulada_atualizada_pct)}</td>
                    <td>{formatCurrency(row.valor_pago_atual)}</td>
                    <td>{formatCurrency(row.valor_aberto_atual)}</td>
                    <td>{formatPercent(row.inadimplencia_atual_pct)}</td>
                    <td>
                      <button
                        className={styles.smallButton}
                        disabled={syncingKey === key}
                        onClick={() => void handleVerPendente(row)}
                      >
                        {syncingKey === key ? 'Atualizando…' : 'Ver pendente'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {detailMes && detailAno ? (
        <section className={styles.detailSection}>
          <div className={styles.detailHeader}>
            <div>
              <h2 className={styles.detailTitle}>Pendente — {detailLabel}</h2>
              <p className={styles.subtitle}>
                Último sync: {formatDateTime(detailSyncedAt)} · {detailRows.length} itens
              </p>
            </div>
            <button
              className={styles.refreshButton}
              onClick={() => {
                setDetailMes(null);
                setDetailAno(null);
                setDetailRows([]);
              }}
            >
              Fechar detalhe
            </button>
          </div>

          {detailLoading ? (
            <div className={styles.stateCard}>Carregando detalhe…</div>
          ) : detailRows.length === 0 ? (
            <div className={styles.stateCard}>Nenhum item em aberto para esta referência.</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Inquilino</th>
                    <th>Identificador</th>
                    <th>Status</th>
                    <th>Status financeiro</th>
                    <th>Status FS</th>
                    <th>Vencimento</th>
                    <th>Valor</th>
                    <th>Banco</th>
                  </tr>
                </thead>
                <tbody>
                  {detailRows.map((row) => (
                    <tr key={row.fs_id}>
                      <td>{row.renter_name || '—'}</td>
                      <td>{row.chr_identifier || '—'}</td>
                      <td>{row.status || '—'}</td>
                      <td>{row.status_fin || '—'}</td>
                      <td>{row.status_fs || '—'}</td>
                      <td>{formatDate(row.dte_due)}</td>
                      <td>{formatCurrency(row.dcm_amount)}</td>
                      <td>{row.chr_bank || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
