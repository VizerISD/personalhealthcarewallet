import React, { ReactElement } from 'react'
import Table, { TableOceanColumn } from '@shared/atoms/Table'
import Time from '@shared/atoms/Time'
import AssetTitle from '@shared/AssetList/AssetListTitle'
import { useProfile } from '@context/Profile'
import { useUserPreferences } from '@context/UserPreferences'

const columns: TableOceanColumn<DownloadedAsset>[] = [
  {
    name: 'Dataset',
    selector: (row) => <AssetTitle asset={row.asset} />
  },
  {
    name: 'Time',
    selector: (row) => <Time date={row.timestamp.toString()} relative isUnix />
  },
  {
    name: 'Most Recently Accessed By...',
    selector: () => <text>Dr. Zacherie Sirett</text>
  }
]

export default function ComputeDownloads({
  accountId
}: {
  accountId: string
}): ReactElement {
  const { downloads, isDownloadsLoading } = useProfile()
  const { chainIds } = useUserPreferences()

  return accountId ? (
    <Table
      columns={columns}
      data={downloads}
      paginationPerPage={10}
      isLoading={isDownloadsLoading}
      emptyMessage={chainIds.length === 0 ? 'No network selected' : null}
    />
  ) : (
    <div>Please connect your Web3 wallet.</div>
  )
}
