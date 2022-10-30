import { FetchFeeDataArgs, FetchFeeDataResult, fetchFeeData } from '@wagmi/core'
import * as React from 'react'

import { QueryConfig, QueryFunctionArgs } from '../../types'
import { useBlockNumber } from '../network-status'
import { useChainId, useQuery } from '../utils'

export type UseFeeDataArgs = Partial<FetchFeeDataArgs> & {
  /** Subscribe to changes */
  watch?: boolean
}
export type UseFeedDataConfig = QueryConfig<FetchFeeDataResult, Error>

type QueryKeyArgs = Partial<FetchFeeDataArgs>
type QueryKeyConfig = Pick<UseFeedDataConfig, 'cacheKey'>

function queryKey({
  cacheKey,
  chainId,
  formatUnits,
}: QueryKeyArgs & QueryKeyConfig) {
  return [{ entity: 'feeData', cacheKey, chainId, formatUnits }] as const
}

const queryFn = ({
  queryKey: [{ chainId, formatUnits }],
}: QueryFunctionArgs<typeof queryKey>) => {
  return fetchFeeData({ chainId, formatUnits })
}

export function useFeeData({
  cacheKey,
  cacheTime,
  chainId: chainId_,
  enabled = true,
  formatUnits = 'wei',
  staleTime,
  suspense,
  watch,
  onError,
  onSettled,
  onSuccess,
}: UseFeeDataArgs & UseFeedDataConfig = {}) {
  const chainId = useChainId({ chainId: chainId_ })

  const feeDataQuery = useQuery(
    queryKey({ cacheKey, chainId, formatUnits }),
    queryFn,
    {
      cacheTime,
      enabled,
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
    feeDataQuery.refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber])

  return feeDataQuery
}
