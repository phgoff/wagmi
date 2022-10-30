import { FetchBalanceArgs, FetchBalanceResult, fetchBalance } from '@wagmi/core'
import * as React from 'react'

import { QueryConfig, QueryFunctionArgs } from '../../types'
import { useBlockNumber } from '../network-status'
import { useChainId, useQuery } from '../utils'

export type UseBalanceArgs = Partial<FetchBalanceArgs> & {
  /** Subscribe to changes */
  watch?: boolean
}

export type UseBalanceConfig = QueryConfig<FetchBalanceResult, Error>

type QueryKeyArgs = Partial<FetchBalanceArgs>
type QueryKeyConfig = Pick<UseBalanceConfig, 'cacheKey'>

function queryKey({
  addressOrName,
  chainId,
  cacheKey,
  formatUnits,
  token,
}: QueryKeyArgs & QueryKeyConfig) {
  return [
    {
      entity: 'balance',
      addressOrName,
      chainId,
      cacheKey,
      formatUnits,
      token,
    },
  ] as const
}

const queryFn = ({
  queryKey: [{ addressOrName, chainId, formatUnits, token }],
}: QueryFunctionArgs<typeof queryKey>) => {
  if (!addressOrName) throw new Error('address is required')
  return fetchBalance({ addressOrName, chainId, formatUnits, token })
}

export function useBalance({
  addressOrName,
  cacheTime,
  chainId: chainId_,
  cacheKey,
  enabled = true,
  formatUnits,
  staleTime,
  suspense,
  token,
  watch,
  onError,
  onSettled,
  onSuccess,
}: UseBalanceArgs & UseBalanceConfig = {}) {
  const chainId = useChainId({ chainId: chainId_ })
  const balanceQuery = useQuery(
    queryKey({ addressOrName, chainId, cacheKey, formatUnits, token }),
    queryFn,
    {
      cacheTime,
      enabled: Boolean(enabled && addressOrName),
      staleTime,
      suspense,
      onError,
      onSettled,
      onSuccess,
    },
  )

  const { data: blockNumber } = useBlockNumber({ chainId, watch })
  React.useEffect(() => {
    if (!enabled) return
    if (!watch) return
    if (!blockNumber) return
    if (!addressOrName) return
    balanceQuery.refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber])

  return balanceQuery
}
