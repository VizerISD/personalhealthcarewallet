import { useAsset } from '@context/Asset'
import { useWeb3 } from '@context/Web3'
import { Asset } from '@oceanprotocol/lib'
import AddToken from '@shared/AddToken'
import ExplorerLink from '@shared/ExplorerLink'
import Publisher from '@shared/Publisher'
import React, { ReactElement } from 'react'
import styles from './MetaAsset.module.css'
import mockedRecords from 'content/static_data/mocked-medical-records.json'
import accountAttributes from 'content/static_data/account-attributes-health.json'

function getName(accountAddress: string): string | undefined {
  const account = accountAttributes.accountAddresses.find(
    (address) => address.accountAddress === accountAddress
  )
  return account?.abacAttributes?.subjectAttributes?.name
}

export default function MetaAsset({
  asset,
  isBlockscoutExplorer
}: {
  asset: AssetExtended
  isBlockscoutExplorer: boolean
}): ReactElement {
  const { isAssetNetwork } = useAsset()
  const { accountId, web3ProviderInfo } = useWeb3()

  const dataTokenSymbol = asset?.datatokens[0]?.symbol

  let owner = ''
  if (
    asset?.id == mockedRecords.MedicalRecords[0].did ||
    asset?.id == mockedRecords.MedicalRecords[1].did ||
    asset?.id == mockedRecords.MedicalRecords[2].did ||
    asset?.id == mockedRecords.MedicalRecords[3].did ||
    asset?.id == mockedRecords.MedicalRecords[4].did
  ) {
    owner = getName(accountId)
  } else {
    owner = asset?.nft?.owner
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.owner}>Owned by {owner}</span>
      <span>
        <ExplorerLink
          className={styles.datatoken}
          networkId={asset?.chainId}
          path={
            isBlockscoutExplorer
              ? `tokens/${asset?.services[0].datatokenAddress}`
              : `token/${asset?.services[0].datatokenAddress}`
          }
        >
          {`Accessed with ${dataTokenSymbol}`}
        </ExplorerLink>
        {web3ProviderInfo?.name === 'MetaMask' && isAssetNetwork && (
          <span className={styles.addWrap}>
            <AddToken
              address={asset?.services[0].datatokenAddress}
              symbol={(asset as Asset)?.datatokens[0]?.symbol}
              text={`Add ${(asset as Asset)?.datatokens[0]?.symbol} to wallet`}
              className={styles.add}
              minimal
            />
          </span>
        )}
      </span>
    </div>
  )
}
