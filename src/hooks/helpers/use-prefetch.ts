import { useCallback } from 'react';

import { useAuthState } from '@/src/hooks/auth/use-auth-state';
import { cachePrefetch } from '@/src/lib/cache/queryCache';


export function usePrefetch(): { prefetchUserData: () => Promise<void> } {
	const { user } = useAuthState();

	const prefetchUserData = useCallback(async (): Promise<void> => {
		if (!user?.id) return;

		try {
			// Prefetch critical user data in parallel
			await Promise.all([
				cachePrefetch.user(user.id),
				cachePrefetch.projects(user.id),
				cachePrefetch.subscriptions(user.id),
			]);
		} catch (error) {
			console.error('Error prefetching user data:', error);
		}
	}, [user?.id]);

	return { prefetchUserData };
}
