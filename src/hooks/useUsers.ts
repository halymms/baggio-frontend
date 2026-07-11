'use client';

import { useCallback, useEffect, useState } from 'react';
import { getUsers } from '@/services/api';
import {
  getApiErrorMessage,
  isForbiddenError,
  isUnauthorizedError,
} from '@/lib/apiError';
import type { User } from '@/types/user';

export function useUsers(enabled: boolean) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setUsers([]);
      if (isUnauthorizedError(err)) {
        return;
      }
      if (isForbiddenError(err)) {
        setError('Acesso negado: permissão insuficiente.');
        return;
      }
      setError(
        getApiErrorMessage(err, 'Não foi possível carregar os usuários.')
      );
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
}
