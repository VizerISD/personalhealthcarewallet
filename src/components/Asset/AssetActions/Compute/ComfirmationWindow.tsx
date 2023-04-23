import React, { ReactElement, useState } from 'react'
import Button from '@shared/atoms/Button'
import styles from './assetAccess.module.css'

export type EntityProps = {
  first_name: string
  last_name: string
  email: string
  gender: string
  wallet_address: string
  visible?: boolean
}

export default function ConfirmationWindow({
  currentEntity
}: {
  currentEntity: EntityProps
}): ReactElement {
  const [open, setOpen] = useState(true)

  const handleYesClick = () => {
    // close the popup
    // add the entity to the list of granted entities
  }

  return (
    <div className={styles.fullScreen}>
      <div className={styles.centerContainer}>
        <div className={styles.confirmationWindow}>
          <h3>GRANT ACCESS CONFIRMATION WINDOW</h3>
          <p>
            Granting access to{' '}
            <a
              className={styles.accountName}
              href={`../profile/${currentEntity.wallet_address}`}
            >
              Dr. {currentEntity.first_name} {currentEntity.last_name}
            </a>{' '}
            will allow them to view and download this medical record. Permission
            can be revoked later at any time.
          </p>
          <Button className={styles.yesButton}>YES</Button>
          <Button className={styles.noButton}>NO</Button>
        </div>
      </div>
    </div>
  )
}
