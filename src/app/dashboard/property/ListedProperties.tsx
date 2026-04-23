'use client';
import styles from './property.module.scss';
import { Options } from "./_shared";

export function ListedProperties({ options }: { options: Options }) {
    return (
        <div className={styles.chartsGrid}>
            <p>Imóveis Angariados</p>
        </div>
    );
}
