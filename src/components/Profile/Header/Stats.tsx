import { LoggerInstance } from '@oceanprotocol/lib'
import React, { useEffect, useState, ReactElement } from 'react'
import { useUserPreferences } from '@context/UserPreferences'
import Conversion from '@shared/Price/Conversion'
import NumberUnit from './NumberUnit'
import styles from './Stats.module.css'
import { useProfile } from '@context/Profile'
import { getAccessDetailsForAssets } from '@utils/accessDetailsAndPricing'
import { getLocked } from '@utils/veAllocation'
import PriceUnit from '@shared/Price/PriceUnit'
import Button from '@shared/atoms/Button'
import { useWeb3 } from '@context/Web3'

const mockedMedicalRecords = require('content/static_data/mocked-medical-records.json')

export default function Stats({
  accountId
}: {
  accountId: string
}): ReactElement {
  const web3 = useWeb3()
  const { chainIds } = useUserPreferences()
  const { assets, assetsTotal, sales } = useProfile()

  const [totalSales, setTotalSales] = useState(0)
  const [lockedOcean, setLockedOcean] = useState(0)

  useEffect(() => {
    async function getLockedOcean() {
      if (!accountId) return
      const locked = await getLocked(accountId, chainIds)
      setLockedOcean(locked)
    }
    getLockedOcean()
  }, [accountId, chainIds])

  useEffect(() => {
    if (!assets || !accountId || !chainIds) return

    async function getPublisherTotalSales() {
      try {
        const assetsPrices = await getAccessDetailsForAssets(assets)
        let count = 0
        for (const priceInfo of assetsPrices) {
          if (priceInfo?.accessDetails?.price && priceInfo.stats.orders > 0) {
            count +=
              parseInt(priceInfo.accessDetails.price) * priceInfo.stats.orders
          }
        }
        setTotalSales(count)
      } catch (error) {
        LoggerInstance.error(error.message)
      }
    }
    getPublisherTotalSales()
  }, [assets, accountId, chainIds])

  return (
    <div className={styles.stats}>
      <NumberUnit
        label="Number of Medical Records"
        value={mockedMedicalRecords.MedicalRecords.length}
      />
      <NumberUnit label="Number of People with Access" value="5" />
    </div>
  )
}
