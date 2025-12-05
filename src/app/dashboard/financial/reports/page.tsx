'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link'
import { realtimeReportData, getItemData, upsertItemData } from '@/services/api';
import { PencilIcon, DocumentCheckIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

import styles from './reports.module.scss';

async function fetchObservacao(itemId: number, mes: number, ano: number) {
  const data = await getItemData(itemId, mes, ano);
  return data?.observacao ?? '';
}
async function saveObservacao(itemId: number, observacao: string, mes: number, ano: number, method: 'POST' | 'PUT', planejado?: number | null) {
  // Para manter compatibilidade, sempre envia o planejado atual (se houver)
  const res = await upsertItemData(itemId, planejado ?? null, mes, ano, method, observacao);
  if (!res.ok) {
    let errorMsg = '';
    try {
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const json = await res.json();
        errorMsg = JSON.stringify(json);
      } else {
        errorMsg = await res.text();
      }
    } catch (e) {
      errorMsg = 'Erro desconhecido ao ler resposta';
    }
    console.error('Erro ao salvar observação:', res.status, errorMsg);
    alert(`Erro ao salvar observação (status ${res.status}):\n${errorMsg}`);
  }
  return res.ok;
}
// Função para buscar todos os realizados do ano, agrupando por index, de forma sequencial
async function fetchRealizadoMediaAnoPorIndex(ano: number, companies: number[], onPartialUpdate?: (partial: Record<string, number[]>) => void) {
  const meses = Array.from({ length: 12 }, (_, i) => i);
  const realizadoPorIndex: Record<string, number[]> = {};
  for (const mes of meses) {
    const startDate = new Date(ano, mes, 1);
    const endDate = new Date(ano, mes + 1, 0);
    const body = {
      section: null,
      companies,
      dteRange: [
        startDate.toISOString(),
        endDate.toISOString()
      ]
    };
    const res = await realtimeReportData(body);
    const mesItens = Array.isArray(res?.original) ? res.original : [];
    for (const item of mesItens) {
      if (!item.index) continue;
      if (!realizadoPorIndex[item.index]) realizadoPorIndex[item.index] = [];
      if (typeof item.amount === 'number') realizadoPorIndex[item.index].push(item.amount);
    }
    if (onPartialUpdate) onPartialUpdate({ ...realizadoPorIndex });
  }
  // Calcular média
  const mediaPorIndex: Record<string, number> = {};
  for (const [index, amounts] of Object.entries(realizadoPorIndex)) {
    if (amounts.length > 0) {
      const sum = amounts.reduce((a, b) => a + b, 0);
      mediaPorIndex[index] = sum / amounts.length;
    } else {
      mediaPorIndex[index] = 0;
    }
  }
  return mediaPorIndex;
}
// Funções utilitárias para buscar e atualizar o planejado usando services/api.ts
async function fetchPlanned(itemId: number, mes: number, ano: number) {
  const data = await getItemData(itemId, mes, ano);
  return data?.planejado ?? null;
}
async function savePlanned(itemId: number, planejado: number, mes: number, ano: number, method: 'POST' | 'PUT') {
  const res = await upsertItemData(itemId, planejado, mes, ano, method);
  if (!res.ok) {
    let errorMsg = '';
    try {
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const json = await res.json();
        errorMsg = JSON.stringify(json);
      } else {
        errorMsg = await res.text();
      }
    } catch (e) {
      errorMsg = 'Erro desconhecido ao ler resposta';
    }
    console.error('Erro ao salvar planejado:', res.status, errorMsg);
    alert(`Erro ao salvar planejado (status ${res.status}):\n${errorMsg}`);
  }
  return res.ok;
}

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function Page() {
  const searchParams = useSearchParams();
  const month = searchParams.get('month');
  const year = searchParams.get('year');
  // Estado para filtro de seção
  const [selectedSection, setSelectedSection] = useState<number>(Number(searchParams.get('section')) || 1);
  const section = selectedSection;
  const monthLabel = month !== null ? months[Number(month)] : '';
  const [realizadoMediaMap, setRealizadoMediaMap] = useState<Record<string, number | null>>({});
   // Estado para armazenar observações buscadas
  const [observacaoMap, setObservacaoMap] = useState<Record<number, string>>({});
  // Estado para edição inline de observação
  const [editingObsId, setEditingObsId] = useState<number | null>(null);
  const [editObsValue, setEditObsValue] = useState<string>("");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Para edição inline
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  // Estado para armazenar planejados buscados
  const [plannedMap, setPlannedMap] = useState<Record<number, number | null>>({});

  // Carrega dados principais
  useEffect(() => {
    if (!month || !year) return;
    setLoading(true);
    setError(null);
    const startDate = new Date(Number(year), Number(month), 1);
    const endDate = new Date(Number(year), Number(month) + 1, 0);
    const body = {
      section: selectedSection ? Number(selectedSection) : null,
      companies: [1, 3, 4, 5, 6, 8, 9],
      dteRange: [
        startDate.toISOString(),
        endDate.toISOString()
      ]
    };
    realtimeReportData(body)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setError('Erro ao buscar dados');
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [month, year, selectedSection]);

  // Carrega planejados apenas quando data.original muda
  useEffect(() => {
    if (!data || !Array.isArray(data.original) || !month || !year) return;
    let isMounted = true;
    const mesNum = Number(month);
    const anoNum = Number(year);
    Promise.all(data.original.map(async (item: any) => {
      const planned = await fetchPlanned(item.id, mesNum, anoNum);
      return [item.id, planned];
    })).then(entries => {
      if (isMounted) setPlannedMap(Object.fromEntries(entries));
    });
    return () => { isMounted = false; };
  }, [data, month, year]);

  useEffect(() => {
    if (loading || !data || !Array.isArray(data.original) || !year) return;
    let isMounted = true;
    const anoNum = Number(year);
    const companies = [1, 3, 4, 5, 6, 8, 9];
    fetchRealizadoMediaAnoPorIndex(
      anoNum,
      companies,
      (partial) => {
        // Atualiza progressivamente se quiser mostrar carregamento parcial
        if (isMounted) {
          // Não calcula média parcial, só atualiza se quiser mostrar progresso
        }
      }
    ).then((mediaPorIndex) => {
      if (isMounted) setRealizadoMediaMap(mediaPorIndex);
    });
    return () => { isMounted = false; };
  }, [data, year, loading]);

   useEffect(() => {
    if (!data || !Array.isArray(data.original) || !month || !year) return;
    let isMounted = true;
    const mesNum = Number(month);
    const anoNum = Number(year);
    Promise.all(data.original.map(async (item: any) => {
      const obs = await fetchObservacao(item.id, mesNum, anoNum);
      return [item.id, obs];
    })).then(entries => {
      if (isMounted) setObservacaoMap(Object.fromEntries(entries));
    });
    return () => { isMounted = false; };
  }, [data, month, year]);

  return (
    <div className={styles.reportsPage}>
      <Link 
        className={styles.backLink}
        href="/dashboard/financial"
      ><ArrowUturnLeftIcon width={20} height={20}/> Voltar</Link>
      <div className={styles.reportsHeader}>
        <div className={styles.reportsTitle}>
          <h1 className={styles.reportsTitleText}>Fechamento</h1>
          {month && year && (
            <p className={styles.reportsDate}>Contas do mês de <b>{monthLabel}/{year}</b></p>
          )}
        </div>
        <div className={styles.reportsSection}>
          <label htmlFor="sectionSelect" style={{ marginRight: 8 }}>Filtrar:</label>
          <select
            id="sectionSelect"
            value={selectedSection}
            onChange={e => {
              const newSection = Number(e.target.value);
              setSelectedSection(newSection);
              // Atualiza a URL sem recarregar a página
              const params = new URLSearchParams(window.location.search);
              params.set('section', String(newSection));
              window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
            }}
            style={{ padding: '4px 8px', borderRadius: 4 }}
          >
            <option value={1}>Locação</option>
            <option value={2}>Vendas</option>
          </select>
        </div>
      </div>
      {loading && <p>Carregando...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
        {data && Array.isArray(data.original) && (
          <div className={styles.reportsTableContainer}>
            <table className={styles.reportsTable}>
              <thead className={styles.reportsTableHeader}>
                <tr className={styles.reportsTableRow}>
                  <th className={styles.reportsTableCell}>#</th>
                  <th className={styles.reportsTableCell} style={{ textAlign: 'left'}}>Serviço</th>
                  <th className={styles.reportsTableCell} style={{ textAlign: 'left'}}>Realizado</th>
                  <th className={styles.reportsTableCell} style={{ textAlign: 'left'}}>Planejado</th>
                  <th className={styles.reportsTableCell} style={{ textAlign: 'left'}}>Resultado</th>
                  <th className={styles.reportsTableCell} style={{ textAlign: 'left'}}>Média</th>
                  <th className={styles.reportsTableCell} style={{ textAlign: 'left'}}>Observações</th>
                </tr>
              </thead>
              <tbody className={styles.reportsTableBody}>
                {data.original.map((item: any) => (
                  <tr key={item.id} className={styles.reportsTableRow}>
                    <td className={styles.reportsTableCell}>{item.index}</td>
                    <td className={styles.reportsTableCell}>{item.service}</td>
                    <td className={styles.reportsTableCell}>
                      {
                        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount ?? 0)
                      }
                    </td>
                    <td className={styles.reportsTableCell}>
                      {editingId === item.id ? (
                        <span className={styles.observacaoCell}>
                          <input
                            type="text"
                            value={editValue}
                            onChange={e => {
                              // Remove tudo que não for número
                              const raw = e.target.value.replaceAll(/[^\d]/g, "");
                              // Formata para BRL
                              const num = Number(raw) / 100;
                              setEditValue(num ? num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : "");
                            }}
                            style={{ width: 120 }}
                            inputMode="numeric"
                          />
                          <button
                            style={{ marginLeft: 4 }}
                            className={styles.editObsButton}
                            onClick={async () => {
                              const mesNum = Number(month);
                              const anoNum = Number(year);
                              const exists = plannedMap[item.id] !== null && plannedMap[item.id] !== undefined;
                              const method = exists ? 'PUT' : 'POST';
                              // Extrai número do valor formatado
                              const raw = editValue.replaceAll(/[^\d]/g, "");
                              const value = Number(raw) / 100;
                              const ok = await savePlanned(item.id, value, mesNum, anoNum, method);
                              if (ok) {
                                setPlannedMap(prev => ({ ...prev, [item.id]: value }));
                                setEditingId(null);
                              }
                            }}
                          >
                            <DocumentCheckIcon width={20} height={20} color='#34c759'/>
                          </button>
                        </span>
                      ) : (
                        <span className={styles.observacaoCell}>
                          {plannedMap[item.id] !== null && plannedMap[item.id] !== undefined
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plannedMap[item.id] ?? 0)
                            : '-'}
                          <button
                            className={styles.editObsButton}
                            onClick={() => {
                              setEditingId(item.id);
                              setEditValue(plannedMap[item.id] !== null && plannedMap[item.id] !== undefined ? String(plannedMap[item.id]) : "");
                            }}
                          >
                            <PencilIcon width={20} height={20} color='#1e3a5f'/>
                          </button>
                        </span>
                      )}
                    </td>
                    <td className={styles.reportsTableCell}>
                      {(() => {
                        const planned = plannedMap[item.id];
                          if (planned === null || planned === undefined) {
                            // Se não há planejado, exibe o realizado
                            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount ?? 0);
                          }
                        const result = Math.abs((item.amount ?? 0) - planned);
                        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result);
                      })()}
                    </td>
                    <td className={styles.reportsTableCell}>
                      {realizadoMediaMap[item.index] !== null && realizadoMediaMap[item.index] !== undefined
                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(realizadoMediaMap[item.index] ?? 0)
                        : '-'}
                    </td>
                    <td className={styles.reportsTableCell}>
                      {editingObsId === item.id ? (
                        <span className={styles.observacaoCell}>
                          <input
                            type="text"
                            value={editObsValue}
                            onChange={e => setEditObsValue(e.target.value)}
                            style={{ width: 180 }}
                          />
                          <button
                            className={styles.editObsButton}
                            onClick={async () => {
                              const mesNum = Number(month);
                              const anoNum = Number(year);
                              const planned = plannedMap[item.id] ?? null;
                              const exists = observacaoMap[item.id] !== undefined && observacaoMap[item.id] !== '';
                              const method = exists ? 'PUT' : 'POST';
                              const ok = await saveObservacao(item.id, editObsValue, mesNum, anoNum, method, planned);
                              if (ok) {
                                setObservacaoMap(prev => ({ ...prev, [item.id]: editObsValue }));
                                setEditingObsId(null);
                              }
                            }}
                          >
                            <DocumentCheckIcon width={20} height={20} color='#34c759'/>
                          </button>
                        </span>
                      ) : (
                        <span className={styles.observacaoCell}>
                          {observacaoMap[item.id] && observacaoMap[item.id].trim() !== ''
                            ? observacaoMap[item.id]
                            : '-'}
                          <button
                            className={styles.editObsButton}
                            onClick={() => {
                              setEditingObsId(item.id);
                              setEditObsValue(observacaoMap[item.id] ?? '');
                            }}
                          >
                            <PencilIcon width={20} height={20} color='#1e3a5f'/>
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
