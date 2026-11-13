'use client';
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from './property.module.scss';
import { usePropertyApi } from "@/services/usePropertyApi";
import { Options } from "./_shared";
import { ActiveContracts } from "./ActiveContracts";
import { TerminatedContracts } from "./TerminatedContracts";
import { RemovedProperties } from "./RemovedProperties";
import { AdvertisedProperties } from "./AdvertisedProperties";

const TABS = [
    { key: 'ACTIVE', label: 'Contratos Ativos', Component: ActiveContracts },
    { key: 'TERMINATED', label: 'Contratos Rescindidos', Component: TerminatedContracts },
    { key: 'REMOVED', label: 'Imóveis Baixados', Component: RemovedProperties },
    { key: 'ADVERTISED', label: 'Imóveis Divulgados', Component: AdvertisedProperties },
] as const;

type TabKey = typeof TABS[number]['key'];

const DEFAULT_TAB: TabKey = 'ACTIVE';

function isTabKey(value: string | undefined): value is TabKey {
    return TABS.some(t => t.key === value);
}

function PropertyPageContent() {
    const [options, setOptions] = useState<Options>({});

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // A aba ativa vem da URL (?tab=...). Sem parâmetro ou com valor inválido, abre Contratos Ativos.
    const param = searchParams.get('tab')?.toUpperCase();
    const activeTab: TabKey = isTabKey(param) ? param : DEFAULT_TAB;

    const { rentalContractOptions } = usePropertyApi();

    useEffect(() => {
        rentalContractOptions().then(setOptions);
    }, []);

    const selectTab = (key: TabKey) => {
        router.replace(`${pathname}?tab=${key}`, { scroll: false });
    };

    const ActiveComponent = TABS.find(t => t.key === activeTab)!.Component;

    return (
        <div className={styles.propertyPageContainer}>
            <div className={styles.propertyPageHeader}>
                <h1 className={styles.propertyPageTitle}>Imóveis</h1>
                <p className={styles.propertyPageSubtitle}>Visão geral dos contratos de locação e da carteira de imóveis</p>
            </div>
            <div className={styles.tabsContainer}>
                {TABS.map(({ key, label }) => (
                    <button
                        key={key}
                        className={`${styles.tabButton} ${activeTab === key ? styles.tabButtonActive : ''}`}
                        onClick={() => selectTab(key)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <ActiveComponent options={options} />
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={null}>
            <PropertyPageContent />
        </Suspense>
    );
}
