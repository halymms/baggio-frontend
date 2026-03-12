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
        rentalContractOptions,
    }
}