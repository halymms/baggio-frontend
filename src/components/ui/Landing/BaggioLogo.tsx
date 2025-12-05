import Image from 'next/image'
import styles from './baggioLogo.module.scss'

interface BaggioLogoProps {
  width?: number;
  height?: number;
}

export function BaggioLogo({ width, height }: BaggioLogoProps) {
  return (
    <div className={styles.logoContainer}>
      <div className={styles.logoContent}>
        <Image src="/baggio-logo.png" alt="Baggio Logo" width={width || 120} height={height || 40} />
      </div>
    </div>
  )
}