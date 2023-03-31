import React, { ReactElement } from 'react'
import { useUserPreferences } from '@context/UserPreferences'
import ExplorerLink from '@shared/ExplorerLink'
import NetworkName from '@shared/NetworkName'
import Jellyfish from '@oceanprotocol/art/creatures/jellyfish/jellyfish-grid.svg'
import Copy from '@shared/atoms/Copy'
import Avatar from '@shared/atoms/Avatar'
import styles from './Account.module.css'
import { useProfile } from '@context/Profile'
import { accountTruncate } from '@utils/web3'
import accountAttributes from 'content/static_data/account-attributes-health.json'

function getRole(accountAddress: string): string | undefined {
  const account = accountAttributes.accountAddresses.find(
    (address) => address.accountAddress === accountAddress
  )
  return account?.abacAttributes?.subjectAttributes?.role
}

function getName(accountAddress: string): string | undefined {
  const account = accountAttributes.accountAddresses.find(
    (address) => address.accountAddress === accountAddress
  )
  return account?.abacAttributes?.subjectAttributes?.name
}

export default function Account({
  accountId
}: {
  accountId: string
}): ReactElement {
  const { chainIds } = useUserPreferences()
  const { profile } = useProfile()
  const role = getRole(accountId)
  const name = getName(accountId)

  console.log('profile.name:\n')
  console.log(name)

  return (
    <div className={styles.account}>
      <figure className={styles.imageWrap}>
        {accountId ? (
          <Avatar
            accountId={accountId}
            src={profile?.avatar}
            className={styles.image}
          />
        ) : (
          <Jellyfish className={styles.image} />
        )}
      </figure>

      <div>
        <h3 className={styles.name}>{name || accountTruncate(accountId)}</h3>
        {role && <span className={styles.tag}>{role}</span>}
      </div>
    </div>
  )
}
