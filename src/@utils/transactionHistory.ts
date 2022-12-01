import { LoggerInstance } from '@oceanprotocol/lib'
import { gql, OperationResult } from 'urql'
import { getEnsName } from './ens'
import { fetchData, getQueryContext } from './subgraph'

const transactionalHistoryQuery = gql`
  query TransactionalHistoryQuery($datatokenId: ID!) {
    token(id: $datatokenId) {
      id
      symbol
      name
      publishMarketFeeAddress
      publishMarketFeeToken
      publishMarketFeeAmount
      orders {
        tx
        serviceIndex
        createdTimestamp
        payer {
          id
        }
        consumer {
          id
        }
        amount
        estimatedUSDValue
        lastPriceToken
        lastPriceValue
      }
      dispensers {
        id
        active
        isMinter
        maxBalance
        token {
          id
          name
          symbol
        }
      }
    }
  }
`

async function getNames(
  txhistory: TransactionHistory
): Promise<TransactionHistory> {
  const promiseList = []
  for (let i = 0; i < txhistory.token.orders.length; i++) {
    promiseList.push([
      getEnsName(txhistory.token.orders[i].payer.id),
      getEnsName(txhistory.token.orders[i].consumer.id)
    ])
  }
  for (let i = 0; i < promiseList.length; i++) {
    txhistory.token.orders[i].payer.name = (await promiseList[i][0]) || null
    txhistory.token.orders[i].consumer.name = (await promiseList[i][1]) || null
  }
  return txhistory
}

function convertDates(txhistory: TransactionHistory): TransactionHistory {
  for (let i = 0; i < txhistory.token.orders.length; i++) {
    txhistory.token.orders[i].createdTimestamp = new Date(
      txhistory.token.orders[i].createdTimestamp.valueOf() * 1000
    )
    console.log(txhistory.token.orders[i].createdTimestamp)
  }
  return txhistory
}

export async function getTransactionHistory(
  chainId: number,
  datatokenAddress: string
): Promise<TransactionHistory> {
  try {
    console.log(`tx chainId: ${chainId}`)
    console.log(`tx datatokenAddress: ${datatokenAddress}`)
    const queryContext = getQueryContext(Number(chainId))
    const tokenQueryResult: OperationResult<
      TransactionHistory,
      { datatokenId: string }
    > = await fetchData(
      transactionalHistoryQuery,
      {
        datatokenId: datatokenAddress.toLowerCase()
      },
      queryContext
    )

    // Adding the names takes 3s to load the visualization when the tx count is ~87
    // TODO: Improve the getNames runtime to under 1s
    const txhistory: TransactionHistory = convertDates(tokenQueryResult.data)
    // const txhistory: TransactionHistory = await getNames(tokenQueryResult.data)

    console.log(`order size = ${txhistory.token.orders.length}`)
    console.log(`tx history query result: ${JSON.stringify(txhistory)}`)
    return txhistory
  } catch (error) {
    LoggerInstance.error('Error getting transaction history: ', error.message)
  }
}
