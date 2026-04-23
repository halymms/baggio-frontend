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
        const res = await fetch(`${API_URL}/api/property/property/report/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activeContract: ['ACTIVE'] })
        });
        const data = await res.json();
        return Array.isArray(data.data) ? data.data.length : 0;
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
    }
}