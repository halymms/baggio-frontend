const API_URL = 'http://localhost:4000';

export function usePropertyApi() {

    const rentalContractReportList = async (month: number, year: number) => {
        const lastDay = new Date(year, month, 0).getDate();
        const pad = (n: number) => String(n).padStart(2, '0');
        const start = `${year}-${pad(month)}-01`;
        const end = `${year}-${pad(month)}-${pad(lastDay)}`;

        const res = await fetch(`${API_URL}/api/rental/contract/report/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dteStart: [start, end],
                chrStatus: ['REGULAR'],
            })
        });
        return res.json();
    };

    const terminatedContractReport = async (month: number, year: number) => {
        const lastDay = new Date(year, month, 0).getDate();
        const pad = (n: number) => String(n).padStart(2, '0');
        const start = `${year}-${pad(month)}-01`;
        const end = `${year}-${pad(month)}-${pad(lastDay)}`;

        const res = await fetch(`${API_URL}/api/rental/contract/terminated/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dteTerminationEnd: [start, end] })
        });
        return res.json();
    };

    const removedPropertyReport = async (month: number, year: number) => {
        const lastDay = new Date(year, month, 0).getDate();
        const pad = (n: number) => String(n).padStart(2, '0');
        const start = `${year}-${pad(month)}-01`;
        const end = `${year}-${pad(month)}-${pad(lastDay)}`;

        const res = await fetch(`${API_URL}/api/property/property/report/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                activeContract: ['INACTIVE'],
                chrStatus: ['REMOVED'],
                dteTermination: [start, end],
            })
        });
        return res.json();
    };

    const advertisedPropertyReport = async () => {
        const pad = (n: number) => String(n).padStart(2, '0');
        const now = new Date();

        const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const start = `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}-01`;
        const end = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(lastDay)}`;

        const res = await fetch(`${API_URL}/api/property/property/report/advertised`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dteNewListing: [start, end] }),
        });
        return res.json() as Promise<{
            lastMonths: { month: string; contractsAmount: number }[];
            purposes: Record<string, { amount: number; value: number }>;
        }>;
    };

    const activeContractCount = async (): Promise<number> => {
        const res = await fetch(`${API_URL}/api/property/property/active/count`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        return typeof data.count === 'number' ? data.count : 0;
    };

    const activeContractSummary = async (month: number, year: number) => {
        const res = await fetch(`${API_URL}/api/rental/contract/active/summary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ month, year }),
        });
        return res.json() as Promise<{
            count: number;
            contractType: Record<string, number>;
            guarantees: Record<string, number>;
            pcf: Record<string, number>;
            readjustments: Record<string, number>;
            valuesByContractType: Record<string, number>;
            totalValue: number;
        }>;
    };

    const activeContractTimeseries = async (month: number, year: number) => {
        const res = await fetch(`${API_URL}/api/rental/contract/active/timeseries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ month, year }),
        });
        return res.json() as Promise<{
            lastMonths: { month: string; contractsAmount: number }[];
        }>;
    };

    const removedTimeseries = async (month: number, year: number) => {
        const res = await fetch(`${API_URL}/api/property/property/removed/timeseries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ month, year }),
        });
        return res.json() as Promise<{
            lastMonths: { month: string; count: number }[];
        }>;
    };

    const terminatedTimeseries = async (month: number, year: number) => {
        const res = await fetch(`${API_URL}/api/rental/contract/terminated/timeseries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ month, year }),
        });
        return res.json() as Promise<{
            lastMonths: { month: string; count: number; value: number }[];
        }>;
    };

    const terminatedContractCount = async (month: number, year: number): Promise<number> => {
        const res = await fetch(`${API_URL}/api/rental/contract/terminated/count`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ month, year }),
        });
        const data = await res.json();
        return typeof data.count === 'number' ? data.count : 0;
    };

    const rentalContractOptions = async () => {
        const res = await fetch(`${API_URL}/api/rental/contract/options`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return res.json();
    };

    return {
        rentalContractReportList,
        terminatedContractReport,
        removedPropertyReport,
        rentalContractOptions,
        activeContractCount,
        advertisedPropertyReport,
        activeContractSummary,
        activeContractTimeseries,
        terminatedContractCount,
        terminatedTimeseries,
        removedTimeseries,
    }
}