import React, { ReactElement, useEffect, useState } from 'react'
import styles from './index.module.css'
import Link from 'next/link'
import { accountTruncate } from '@utils/web3'
import { getEnsName } from '@utils/ens'
import { useIsMounted } from '@hooks/useIsMounted'
import { useWeb3 } from '@context/Web3'
import accountAttributes from 'content/static_data/account-attributes-health.json'

export interface PublisherProps {
  account: string
  minimal?: boolean
  className?: string
}

function getOwner(accountAddress: string): string | undefined {
  const account = accountAttributes.accountAddresses.find(
    (address) => address.accountAddress === accountAddress
  )
  return account?.abacAttributes?.subjectAttributes?.name
}

export default function Publisher({
  account,
  minimal,
  className
}: PublisherProps): ReactElement {
  const isMounted = useIsMounted()
  const [name, setName] = useState(accountTruncate(account))
  const { accountId } = useWeb3()

  const owner = getOwner(accountId)

  useEffect(() => {
    if (!account || account === '') return

    // set default name on hook
    // to avoid side effect (UI not updating on account's change)
    setName(accountTruncate(account))

    async function getExternalName() {
      const accountEns = await getEnsName(account)
      if (accountEns && isMounted()) {
        setName(accountEns)
      }
    }
    getExternalName()
  }, [account, isMounted])

  return (
    <div className={`${styles.publisher} ${className || ''}`}>
      {minimal ? (
        owner
      ) : (
        <>
          <Link href={`/profile/${owner}`}>
            <a title="Show profile page.">{owner}</a>
          </Link>
        </>
      )}
    </div>
  )
}
