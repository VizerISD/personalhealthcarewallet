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

  let record_type = ''
  if (asset?.id == mockedRecords.MedicalRecords[0].did) {
    record_type = mockedRecords.MedicalRecords[0].title
  } else if (asset?.id == mockedRecords.MedicalRecords[1].did) {
    record_type = mockedRecords.MedicalRecords[1].title
  } else if (asset?.id == mockedRecords.MedicalRecords[2].did) {
    record_type = mockedRecords.MedicalRecords[2].title
  } else if (asset?.id == mockedRecords.MedicalRecords[3].did) {
    record_type = mockedRecords.MedicalRecords[3].title
  } else if (asset?.id == mockedRecords.MedicalRecords[4].did) {
    record_type = mockedRecords.MedicalRecords[4].title
  } else {
    record_type = asset?.metadata?.type.toString()
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
