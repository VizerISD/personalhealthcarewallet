import React, { ReactElement } from 'react'
import Table, { TableOceanColumn } from '@shared/atoms/Table'
import Time from '@shared/atoms/Time'

// Importing the mocked medical records data from the JSON file
const mockedMedicalRecords = require('content/static_data/mocked-medical-records.json')

// Defining the table columns using the TableOceanColumn type
const columns: TableOceanColumn<MedicalRecord>[] = [
  {
    name: 'Medical Record Name',
    selector: (row) => <span>{row.name}</span>
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
