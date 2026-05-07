import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { UpdateSettingsRequest } from './types';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: api.getMe,
    retry: false,
    staleTime: Infinity,
  });
}

export function useOverview() {
  return useQuery({
    queryKey: ['overview'],
    queryFn: api.getOverview,
    refetchInterval: 15_000,
  });
}

export function usePositions() {
  return useQuery({
    queryKey: ['positions'],
    queryFn: api.getPositions,
    refetchInterval: 10_000,
  });
}

export function useClosePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.closePosition(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['positions'] });
      qc.invalidateQueries({ queryKey: ['overview'] });
    },
  });
}

export function useTrades(page: number, perPage: number, sortBy = 'closed_at', sortOrder = 'desc') {
  return useQuery({
    queryKey: ['trades', page, perPage, sortBy, sortOrder],
    queryFn: () => api.getTrades(page, perPage, sortBy, sortOrder),
  });
}

export function usePerformance() {
  return useQuery({
    queryKey: ['performance'],
    queryFn: api.getPerformance,
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: api.getSettings,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<UpdateSettingsRequest>) => api.updateSettings(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}

export function useAddBlacklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { token_address: string; chain?: string; reason?: string }) => api.addBlacklist(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}

export function useRemoveBlacklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { address: string; chain?: string; addedBy?: number }) =>
      api.removeBlacklist(params.address, params.chain, params.addedBy),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}

export function useToggleAutoTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enabled: boolean) => api.toggleAutoTrade(enabled),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      qc.invalidateQueries({ queryKey: ['overview'] });
    },
  });
}

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: api.getWallet,
  });
}
