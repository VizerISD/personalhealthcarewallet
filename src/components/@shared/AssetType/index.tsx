import React, { ReactElement } from 'react'
import { useAsset } from '@context/Asset'
import styles from './index.module.css'
import Compute from '@images/compute.svg'
import Download from '@images/download.svg'
import Lock from '@images/lock.svg'
import mockedRecords from 'content/static_data/mocked-medical-records.json'

export default function AssetType({
  type,
  accessType,
  className
}: {
  type: string
  accessType: string
  className?: string
}): ReactElement {
  const { asset } = useAsset()

  if (asset?.id == mockedRecords.MedicalRecords[2].did) {
    var record_type = mockedRecords.MedicalRecords[2].title
  } else {
    var record_type = asset?.metadata?.type.toString()
  }

  return (
    <div className={className || null}>
      {accessType === 'access' ? (
        <Download role="img" aria-label="Download" className={styles.icon} />
      ) : accessType === 'compute' && type === 'algorithm' ? (
        <Lock role="img" aria-label="Private" className={styles.icon} />
      ) : (
        <Compute role="img" aria-label="Compute" className={styles.icon} />
      )}

      <div className={styles.typeLabel}>{(type = record_type)}</div>
    </div>
  )
}
