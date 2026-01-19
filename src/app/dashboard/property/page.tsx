import styles from './property.module.scss';

export default function Page() {
    return (
        <div className={styles.propertyPageContainer}>
            <div className={styles.propertyPageHeader}>
                <h1 className={styles.propertyPageTitle}>Imóveis</h1>
                <p className={styles.propertyPageSubtitle}>Lorem ipsum dolor sit amet</p>
            </div>
            <div className={styles.mainInfoContainer}>

            </div>
        </div>
    )
}