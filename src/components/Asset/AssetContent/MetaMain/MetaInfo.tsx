import AssetType from '@shared/AssetType'
import Time from '@shared/atoms/Time'
import Publisher from '@shared/Publisher'
import { getServiceByName } from '@utils/ddo'
import React, { ReactElement } from 'react'
import styles from './MetaInfo.module.css'
import mockedRecords from 'content/static_data/mocked-medical-records.json'

export default function MetaInfo({
  asset,
  nftPublisher
}: {
  asset: AssetExtended
  nftPublisher: string
}): ReactElement {
  const isCompute = Boolean(getServiceByName(asset, 'compute'))
  const accessType = isCompute ? 'compute' : 'access'
  const nftOwner = asset?.nft?.owner

  let type = ''
  if (asset?.id == mockedRecords.MedicalRecords[0].did) {
    type = mockedRecords.MedicalRecords[0].title
  } else if (asset?.id == mockedRecords.MedicalRecords[1].did) {
    type = mockedRecords.MedicalRecords[1].title
  } else if (asset?.id == mockedRecords.MedicalRecords[2].did) {
    type = mockedRecords.MedicalRecords[2].title
  } else if (asset?.id == mockedRecords.MedicalRecords[3].did) {
    type = mockedRecords.MedicalRecords[3].title
  } else if (asset?.id == mockedRecords.MedicalRecords[4].did) {
    type = mockedRecords.MedicalRecords[4].title
  } else {
    type = asset?.metadata?.type.toString()
  }

  return (
    <div className={styles.wrapper}>
      <AssetType
        type={type}
        accessType={accessType}
        className={styles.assetType}
      />
      <div className={styles.byline}>
        <p>
          Published <Time date={asset?.metadata.created} relative />
          {nftPublisher && nftPublisher !== nftOwner && (
            <span>
              {' by '} <Publisher account={nftPublisher} />
            </span>
          )}
          {asset?.metadata.created !== asset?.metadata.updated && (
            <>
              {' — '}
              <span className={styles.updated}>
                updated <Time date={asset?.metadata.updated} relative />
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
