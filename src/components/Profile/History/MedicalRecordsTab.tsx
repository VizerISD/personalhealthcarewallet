import React, { ReactElement } from 'react'
import Link from 'next/link'
import Table, { TableOceanColumn } from '@shared/atoms/Table'
import styles from '@shared/AssetList/AssetListTitle.module.css'

import Time from '@shared/atoms/Time'

// Importing the mocked medical records data from the JSON file
import mockedMedicalRecords from 'content/static_data/mocked-medical-records.json'

// MedicalRecord interface from the mocked medical records data
export interface MedicalRecord {
  title: string
  date: string
  did: string
  most_recently_accessed_by: string
  accessor_id: string
}

// Defining the table columns using the TableOceanColumn type
const columns: TableOceanColumn<MedicalRecord>[] = [
  {
    name: 'Medical Record Name',
    selector: (row) => (
      <h3 className={styles.title}>
        <Link href={`/asset/${row.did}`}>
          <a>{row.title}</a>
        </Link>
      </h3>
    )
  },
  {
    name: 'Date',
    selector: (row) => <Time date={row.date} />
  },
  {
    name: 'Most Recently Accessed By',
    selector: (row) => <span>{row.most_recently_accessed_by}</span>
  }
]

// Defining the MedicalRecordTable component
export default function MedicalRecordTable(): ReactElement {
  // Rendering the Table component and passing the table columns, data, and other props
  return (
    <Table
      columns={columns}
      data={mockedMedicalRecords.MedicalRecords}
      paginationPerPage={10}
      emptyMessage={'No medical records found'}
    />
  )
}
