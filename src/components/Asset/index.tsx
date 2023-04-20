import React, { useState, useEffect, ReactElement } from 'react'
import { useRouter } from 'next/router'
import Page from '@shared/Page'
import Alert from '@shared/atoms/Alert'
import Loader from '@shared/atoms/Loader'
import { useAsset } from '@context/Asset'
import AssetContent from './AssetContent'
import mockedRecords from 'content/static_data/mocked-medical-records.json'

export default function AssetDetails({ uri }: { uri: string }): ReactElement {
  const router = useRouter()
  const { asset, title, error, isInPurgatory, loading } = useAsset()
  let record_title = ''
  if (asset?.id == mockedRecords.MedicalRecords[2].did) {
    record_title =
      mockedRecords.MedicalRecords[2].title +
      ' on ' +
      mockedRecords.MedicalRecords[2].date
  } else {
    record_title = title
  }

  const [pageTitle, setPageTitle] = useState<string>()

  useEffect(() => {
    if (!asset || error) {
      setPageTitle(record_title || 'Could not retrieve asset')
      return
    }
    setPageTitle(isInPurgatory ? '' : record_title)
  }, [asset, error, isInPurgatory, router, record_title, uri])

  return asset && pageTitle !== undefined && !loading ? (
    <Page title={pageTitle} uri={uri}>
      <AssetContent asset={asset} />
    </Page>
  ) : error ? (
    <Page title={pageTitle} noPageHeader uri={uri}>
      <Alert title={pageTitle} text={error} state={'error'} />
    </Page>
  ) : (
    <Page title={undefined} uri={uri}>
      <Loader />
    </Page>
  )
}
