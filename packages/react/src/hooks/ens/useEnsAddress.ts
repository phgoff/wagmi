import {
  FetchEnsAddressArgs,
  FetchEnsAddressResult,
  fetchEnsAddress,
} from '@wagmi/core'

import { QueryConfig, QueryFunctionArgs } from '../../types'
import { useChainId, useQuery } from '../utils'

export type UseEnsAddressArgs = Partial<FetchEnsAddressArgs>
export type UseEnsAddressConfig = QueryConfig<FetchEnsAddressResult, Error>

type QueryKeyArgs = UseEnsAddressArgs
type QueryKeyConfig = Pick<UseEnsAddressConfig, 'cacheKey'>

function queryKey({ chainId, cacheKey, name }: QueryKeyArgs & QueryKeyConfig) {
  return [{ entity: 'ensAddress', chainId, cacheKey, name }] as const
}

const queryFn = ({
  queryKey: [{ chainId, name }],
}: QueryFunctionArgs<typeof queryKey>) => {
  if (!name) throw new Error('name is required')
  return fetchEnsAddress({ chainId, name })
}

export function useEnsAddress({
  cacheTime,
  chainId: chainId_,
  cacheKey,
  enabled = true,
  name,
  staleTime = 1_000 * 60 * 60 * 24, // 24 hours
  suspense,
  onError,
  onSettled,
  onSuccess,
}: UseEnsAddressArgs & UseEnsAddressConfig = {}) {
  const chainId = useChainId({ chainId: chainId_ })

  return useQuery(queryKey({ chainId, cacheKey, name }), queryFn, {
    cacheTime,
    enabled: Boolean(enabled && chainId && name),
    staleTime,
    suspense,
    onError,
    onSettled,
    onSuccess,
  })
}
