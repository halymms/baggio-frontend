'use client';
import { useEffect, useState } from "react";
import styles from './property.module.scss';
import { usePropertyApi } from "@/services/usePropertyApi";
import { Options } from "./_shared";
import { ActiveContracts } from "./ActiveContracts";
import { TerminatedContracts } from "./TerminatedContracts";
import { RemovedProperties } from "./RemovedProperties";

type Tab = 'ativos' | 'rescindidos' | 'baixados';

export default function Page() {
    const [options, setOptions] = useState<Options>({});
    const [activeTab, setActiveTab] = useState<Tab>('ativos');

    const { rentalContractOptions } = usePropertyApi();

    useEffect(() => {
        rentalContractOptions().then(setOptions);
    }, []);

    return (
        <div className={styles.propertyPageContainer}>
            <div className={styles.propertyPageHeader}>
                <h1 className={styles.propertyPageTitle}>Imóveis</h1>
                <p className={styles.propertyPageSubtitle}>Lorem ipsum dolor sit amet</p>
            </div>
            <div className={styles.tabsContainer}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'ativos' ? styles.tabButtonActive : ''}`}
                    onClick={() => setActiveTab('ativos')}
                >
                    Contratos Ativos
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'rescindidos' ? styles.tabButtonActive : ''}`}
                    onClick={() => setActiveTab('rescindidos')}
                >
                    Contratos Rescindidos
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'baixados' ? styles.tabButtonActive : ''}`}
                    onClick={() => setActiveTab('baixados')}
                >
                    Imóveis Baixados
                </button>
            </div>

            {activeTab === 'ativos' && <ActiveContracts options={options} />}
            {activeTab === 'rescindidos' && <TerminatedContracts options={options} />}
            {activeTab === 'baixados' && <RemovedProperties options={options} />}
        </div>
    );
}
