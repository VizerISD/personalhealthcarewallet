import React, { ReactElement } from 'react'
import PageProfile from './profile'
import Page from '@shared/Page'
import { useRouter } from 'next/router'
import { useMarketMetadata } from '@context/MarketMetadata'

export default function PageHome(): ReactElement {
  const { siteContent } = useMarketMetadata()
  const router = useRouter()

  return (
    <Page
      title={siteContent?.siteTitle}
      description={siteContent?.siteTagline}
      uri={router.route}
      headerCenter
    >
      <PageProfile />
    </Page>
  )
}
