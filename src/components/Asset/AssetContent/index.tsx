import React, { ReactElement, useState, useEffect } from 'react'
import Markdown from '@shared/Markdown'
import MetaFull from './MetaFull'
import MetaSecondary from './MetaSecondary'
import AssetActions from '../AssetActions'
import { useUserPreferences } from '@context/UserPreferences'
import Bookmark from './Bookmark'
import { useAsset } from '@context/Asset'
import Alert from '@shared/atoms/Alert'
import DebugOutput from '@shared/DebugOutput'
import MetaMain from './MetaMain'
import EditHistory from './EditHistory'
import styles from './index.module.css'
import NetworkName from '@shared/NetworkName'
import content from '../../../../content/purgatory.json'
import Web3 from 'web3'
import Button from '@shared/atoms/Button'
import IndividualUseVisualization from './IndividualUseVisualization'
import TransactionHistoryVisualization from './TransactionHistoryVisualization'
import Tooltip from '@shared/atoms/Tooltip'

export default function AssetContent({
  asset
}: {
  asset: AssetExtended
}): ReactElement {
  const { isInPurgatory, purgatoryData, isOwner, isAssetNetwork } = useAsset()
  const { debug } = useUserPreferences()
  const [receipts, setReceipts] = useState([])
  const [nftPublisher, setNftPublisher] = useState<string>()

  useEffect(() => {
    setNftPublisher(
      Web3.utils.toChecksumAddress(
        receipts?.find((e) => e.type === 'METADATA_CREATED')?.nft?.owner
      )
    )
  }, [receipts])

  return (
    <>
      <article className={styles.grid}>
        <div className={styles.individualUse}>
          <div className={styles.visualizationHeader}>
            <h3>Most Frequent Accessors</h3>
            <Tooltip
              content={
                <Markdown
                  text={
                    "Click on the name below each bar to visit the accessor's profile page."
                  }
                />
              }
            />
          </div>
          <IndividualUseVisualization width={1125} height={400} events={true} />
        </div>

        <div className={styles.transactionHistory}>
          <div className={styles.visualizationHeader}>
            <h3>Medical Record Access History</h3>
            <Tooltip
              content={
                <Markdown
                  text={
                    'Hover over a circle in the top timeline to details about the access event. Drag the cursor over the bottom timeline to resize.'
                  }
                />
              }
            />
          </div>
          <TransactionHistoryVisualization
            width={1125}
            height={400}
            events={true}
          />
        </div>

        <div>
          <div className={styles.content}>
            <MetaMain asset={asset} nftPublisher={nftPublisher} />
            {asset?.accessDetails?.datatoken !== null && (
              <Bookmark did={asset?.id} />
            )}
            {isInPurgatory === true ? (
              <Alert
                title={content.asset.title}
                badge={`Reason: ${purgatoryData?.reason}`}
                text={content.asset.description}
                state="error"
              />
            ) : (
              <>
                <Markdown
                  className={styles.description}
                  text={asset?.metadata?.description || ''}
                />
                <MetaSecondary ddo={asset} />
              </>
            )}
            <MetaFull ddo={asset} />
            <EditHistory receipts={receipts} setReceipts={setReceipts} />
            {debug === true && <DebugOutput title="DDO" output={asset} />}
          </div>
        </div>

        <div className={styles.actions}>
          <AssetActions asset={asset} />
          {isOwner && isAssetNetwork && (
            <div className={styles.ownerActions}>
              <Button style="text" size="small" to={`/asset/${asset?.id}/edit`}>
                Edit Asset
              </Button>
            </div>
          )}
        </div>
      </article>
    </>
  )
}
