interface Order {
  tx: string
  serviceIndex: number
  createdTimestamp: number
  payer: {
    id: string
    name: string
  }
  consumer: {
    id: string
    name: string
  }
  amount: string
  estimatedUSDValue: string
  lastPriceToken: string
  lastPriceValue: string
}

interface TransactionHistory {
  token: {
    id: string
    symbol: string
    name: string
    publishMarketFeeAddress: string
    publishMarketFeeToken: string
    publishMarketFeeAmount: string
    orders: [Orders]
    dispensers: [
      {
        id: string
        active: boolean
        isMinter: boolean
        maxBalance: string
        token: {
          id: string
          name: string
          symbol: string
        }
      }
    ]
  }
}
