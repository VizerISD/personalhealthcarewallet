import React, { useState, ChangeEvent, ReactElement, useEffect } from 'react'
import SearchIcon from '@images/search.svg'
import InputElement from '@shared/FormInput/InputElement'
import styles from './assetAccess.module.css'
import Data from 'content/static_data/doctor-dict.json'
import Button from '@shared/atoms/Button'
import mockedRecords from 'content/static_data/mocked-medical-records.json'
import { useAsset } from '@context/Asset'

export type DataProps = {
  first_name: string
  last_name: string
  email: string
  gender: string
  wallet_address: string
  visible?: boolean
}

const doctorData: DataProps[] = Data.map((obj) => ({ ...obj, visible: true }))
const initialValue: DataProps = doctorData[0]

export default function AssetAccess(): ReactElement {
  const { asset } = useAsset()

  const [searchValue, setSearchValue] = useState('')
  const [showConfirmationWindow, setShowConfirmationWindow] = useState(false)
  const [currentEntity, setCurrentEntity] = useState(initialValue)
  const [modalResult, setModalResult] = useState(false)
  const [permissionAction, setPermissionAction] = useState('')
  const [accessList, setAccessList] = useState([])

  useEffect(() => {
    let firstEntry

    if (asset?.id === mockedRecords.MedicalRecords[1].did) {
      firstEntry = [doctorData[1]]
      doctorData[1].visible = false
    } else if (asset?.id === mockedRecords.MedicalRecords[2].did) {
      firstEntry = [doctorData[1]]
      doctorData[1].visible = false
    } else if (asset?.id === mockedRecords.MedicalRecords[3].did) {
      firstEntry = [doctorData[7]]
      doctorData[7].visible = false
    } else if (asset?.id === mockedRecords.MedicalRecords[4].did) {
      firstEntry = [doctorData[753], doctorData[2]]
      doctorData[753].visible = false
      doctorData[2].visible = false
    } else {
      firstEntry = [doctorData[0]]
      doctorData[0].visible = false
    }

    // Set the accessList state based on the firstEntry value
    setAccessList(firstEntry)
  }, [asset])

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setSearchValue(e.target.value)
    e.target.value = ''
  }

  const handleCancelClick = () => {
    setShowConfirmationWindow(false)
    setModalResult(false)
  }
  const handleConfirmClick = () => {
    setShowConfirmationWindow(false)
    setModalResult(true)
  }

  const handleGrantButtonClick = (entity: DataProps) => {
    setCurrentEntity(entity)
    setModalResult(false)
    setPermissionAction('grant')
    setShowConfirmationWindow(true)
  }

  const handleRevokeButtonClick = (entity: DataProps) => {
    setCurrentEntity(entity)
    setModalResult(false)
    setPermissionAction('revoke')
    setShowConfirmationWindow(true)
  }

  useEffect(() => {
    if (modalResult && permissionAction === 'grant') {
      const selectedValue = doctorData.find(
        (item) =>
          item.first_name === currentEntity.first_name &&
          item.last_name === currentEntity.last_name
      )
      // Add the selected entry to the Access Granted area
      setAccessList([selectedValue, ...accessList])
      // Mark the selected entry as invisible in the selection pool
      selectedValue.visible = false
      // Reset modalResult to false
      setModalResult(false)
    } else if (modalResult && permissionAction === 'revoke') {
      const selectedValue = doctorData.find(
        (item) =>
          item.first_name === currentEntity.first_name &&
          item.last_name === currentEntity.last_name
      )
      // Mark the selected entry as visible in the selection pool
      selectedValue.visible = true
      // Remove the selected entry from the Access Granted area
      setAccessList(accessList.filter((value) => value !== selectedValue))
      // Reset modalResult to false
      setModalResult(false)
    }
  }, [
    accessList,
    currentEntity.first_name,
    currentEntity.last_name,
    modalResult,
    permissionAction
  ])

  return (
    <div>
      <h4 className={styles.heading}>Grant Access</h4>

      <form className={styles.searchBox}>
        <InputElement
          type="search"
          name="search"
          placeholder={'Search by first name...'}
          value={searchValue}
          onChange={handleChange}
          required
          size="small"
          className={styles.input}
        />
        <button className={styles.button}>
          <SearchIcon className={styles.searchIcon} />
        </button>
      </form>

      <div className={styles.scroll}>
        {doctorData
          .filter((entity) => {
            if (entity.visible === true) {
              if (searchValue === '') {
                return entity
              } else if (
                entity.first_name
                  .toLowerCase()
                  .startsWith(searchValue.toLowerCase())
              ) {
                return entity
              }
            }
          })
          .map((entity) => (
            <div
              className={styles.box}
              key={entity.first_name + entity.last_name}
            >
              <div className={styles.accountName}>
                <a href={`../profile/${entity.wallet_address}`}>
                  Dr. {entity.first_name} {entity.last_name}
                </a>{' '}
              </div>
              <button
                className={styles.grantAccessButton}
                onClick={() => handleGrantButtonClick(entity)}
              >
                GRANT
              </button>
            </div>
          ))}
      </div>

      <div>
        <h4 className={styles.heading}>People Currently with Access</h4>
      </div>
      <div className={styles.scroll}>
        {accessList &&
          accessList.map((entity) => (
            <div
              className={styles.box}
              key={entity.first_name + entity.last_name}
            >
              <div className={styles.accountName}>
                <a href={`../profile/${entity.wallet_address}`}>
                  Dr. {entity.first_name} {entity.last_name}
                </a>
              </div>
              <button
                className={styles.revokeAccessButton}
                onClick={() => handleRevokeButtonClick(entity)}
              >
                REVOKE
              </button>
            </div>
          ))}
      </div>

      {showConfirmationWindow && (
        <div className={styles.fullScreen}>
          <div className={styles.centerContainer}>
            {permissionAction === 'grant' && (
              <div className={styles.grantAccessConfirmationWindow}>
                <h3>Are you sure you wish to grant access?</h3>
                <p>
                  Granting access to{' '}
                  <a
                    className={styles.accountName}
                    href={`../profile/${currentEntity.wallet_address}`}
                  >
                    Dr. {currentEntity.first_name} {currentEntity.last_name}
                  </a>{' '}
                  will allow them to view and download this medical record.
                  Permission can be revoked later at any time.
                </p>
                <div className={styles.buttonContainer}>
                  <Button onClick={handleConfirmClick}>CONFIRM</Button>
                  <Button onClick={handleCancelClick}>CANCEL</Button>
                </div>
              </div>
            )}
            {permissionAction === 'revoke' && (
              <div className={styles.revokeAccessConfirmationWindow}>
                <h3>Are you sure you wish to revoke access?</h3>
                <p>
                  Revoking access to{' '}
                  <a
                    className={styles.accountName}
                    href={`../profile/${currentEntity.wallet_address}`}
                  >
                    Dr. {currentEntity.first_name} {currentEntity.last_name}
                  </a>{' '}
                  will prevent them from viewing and downloading this medical
                  record. Permission can be granted later at any time.
                </p>
                <div className={styles.buttonContainer}>
                  <Button onClick={handleConfirmClick}>CONFIRM</Button>
                  <Button onClick={handleCancelClick}>CANCEL</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
