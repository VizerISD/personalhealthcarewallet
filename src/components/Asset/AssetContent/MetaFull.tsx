import React, { ReactElement } from 'react'
import MetaItem from './MetaItem'
import styles from './MetaFull.module.css'
import Publisher from '@shared/Publisher'
import { useAsset } from '@context/Asset'
import { Asset } from '@oceanprotocol/lib'

export default function MetaFull({ ddo }: { ddo: Asset }): ReactElement {
  const { isInPurgatory } = useAsset()

  function DockerImage() {
    const containerInfo = ddo?.metadata?.algorithm?.container
    const { image, tag } = containerInfo
    return <span>{`${image}:${tag}`}</span>
  }

  return ddo ? (
    <div className={styles.metaFull}>
      {!isInPurgatory && (
        <MetaItem title="Data Author" content={ddo?.metadata?.author} />
      )}
      <MetaItem
        title="Owner"
        content={<Publisher account={ddo?.nft?.owner} />}
      />

      {ddo?.metadata?.type === 'algorithm' && ddo?.metadata?.algorithm && (
        <MetaItem title="Docker Image" content={<DockerImage />} />
      )}
      <MetaItem title="DID" content={<code>{ddo?.id}</code>} />

      <MetaItem title="author - NEW" content={ddo?.metadata?.author} />
      <MetaItem
        title="algorithm - NEW"
        content={ddo?.metadata?.algorithm?.container?.tag}
      />
      <MetaItem title="created - NEW" content={ddo?.metadata?.created} />
      <MetaItem title="categories - NEW" content={ddo?.metadata?.categories} />
      <MetaItem
        title="additionalInformation - NEW"
        content={ddo?.metadata?.additionalInformation[0]}
      />
      <MetaItem title="license - NEW" content={ddo?.metadata?.license} />
      <MetaItem title="links[0] - NEW" content={ddo?.metadata?.links[0]} />
      <MetaItem title="links[1] - NEW" content={ddo?.metadata?.links[1]} />
      <MetaItem title="links[2] - NEW" content={ddo?.metadata?.links[2]} />
      <MetaItem title="type - NEW" content={ddo?.metadata?.type} />
    </div>
  ) : null
}
