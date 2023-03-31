import React, { useState, ChangeEvent, ReactElement } from 'react'
import SearchIcon from '@images/search.svg'
import InputElement from '@shared/FormInput/InputElement'
import styles from './assetAccess.module.css'
import Data from 'content/static_data/doctor-dict.json'

export type DataProps = {
  first_name: string
  last_name: string
  email: string
  gender: string
  wallet_address: string
  visible?: boolean
}

const doctorData: DataProps[] = Data.map((obj) => ({ ...obj, visible: true }))
const firstEntry: DataProps = doctorData[0]
doctorData[0].visible = false

export default function AssetAccess(): ReactElement {
  const [searchValue, setSearchValue] = useState('')
  const [accessList, setAccessList] = useState([firstEntry])

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setSearchValue(e.target.value)
    e.target.value = ''
  }

  const handleGrantButtonClick = (entity: DataProps) => {
    const selectedValue = doctorData.find(
      (item) =>
        item.first_name === entity.first_name &&
        item.last_name === entity.last_name
    )
    // Add the selected entry to the Access Granted area
    setAccessList([selectedValue, ...accessList])
    // Mark the selected entry as invisible in the selection pool
    selectedValue.visible = false
  }
  const handleRevokeButtonClick = (entity: DataProps) => {
    const selectedValue = doctorData.find(
      (item) =>
        item.first_name === entity.first_name &&
        item.last_name === entity.last_name
    )
    // Mark the selected entry as visible in the selection pool
    selectedValue.visible = true
    // Remove the selected entry from the Access Granted area
    setAccessList(accessList.filter((value) => value !== selectedValue))
  }

  return (
    <div>
      <h3 className={styles.heading}>Grant Access</h3>

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
              <div style={{ color: 'black', fontSize: 14 }}>
                Dr. {entity.first_name} {entity.last_name}
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
        <h3 className={styles.heading}>People Currently with Access</h3>
      </div>
      <div className={styles.scroll}>
        {accessList &&
          accessList.map((entity) => (
            <div
              className={styles.box}
              key={entity.first_name + entity.last_name}
            >
              <div style={{ color: 'black', fontSize: 14 }}>
                Dr. {entity.first_name} {entity.last_name}
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
    </div>
  )
}
