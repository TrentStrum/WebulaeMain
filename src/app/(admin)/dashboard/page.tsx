'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { DashboardSkeleton } from '@/src/components/skeletons/dashboard-skeleton';
import { useToast } from '@/src/hooks/helpers/use-toast';
import { supabaseClient } from '@/src/lib/supabaseClient';
import { useDashboardStats } from '@/src/hooks/helpers/use-dashboard-stats';

export default function AdminDashboard() {
	const { projectStats, userStats, isLoading: isLoadingStats, loadStats } = useDashboardStats();
	const [isCheckingAccess, setIsCheckingAccess] = useState(true);
	const router = useRouter();
	const { toast } = useToast();

	const checkAdminAccess = useCallback(async () => {
		try {
			const {
				data: { session },
			} = await supabaseClient.auth.getSession();
			if (!session) {
				router.push('/login');
				return false;
			}

			const { data: profile } = await supabaseClient
				.from('profiles')
				.select('role')
				.eq('id', session.user.id)
				.single();

			if (!profile || profile.role !== 'admin') {
				router.push('/');
				toast({
					title: 'Access Denied',
					description: 'You do not have permission to access this page.',
					variant: 'destructive',
				});
				return false;
			}

			return true;
		} catch (error) {
			console.error('Error checking admin access:', error);
			router.push('/login');
			return false;
		} finally {
			setIsCheckingAccess(false);
		}
	}, [router, toast]);

	useEffect(() => {
		const initializeDashboard = async () => {
			const hasAccess = await checkAdminAccess();
			if (hasAccess) {
				await loadStats();
			}
		};

		initializeDashboard();
	}, [checkAdminAccess, loadStats]);

	if (isCheckingAccess || isLoadingStats) {
		return <DashboardSkeleton />;
	}

	return (
		<div className="container py-8">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Admin Dashboard</h1>
				<div className="space-x-4">
					<Button asChild>
						<Link href="/admin/projects/new">
							<Plus className="mr-2 h-4 w-4" />
							New Project
						</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href="/admin/users">
							<Users className="mr-2 h-4 w-4" />
							Manage Users
						</Link>
					</Button>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-3 mb-8">
				<Card>
					<CardHeader>
						<CardTitle>Total Projects</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">{projectStats.total}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Active Projects</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">{projectStats.active}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Completed Projects</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">{projectStats.completed}</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-8 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button className="w-full justify-start" asChild>
							<Link href="/admin/projects">View All Projects</Link>
						</Button>
						<Button className="w-full justify-start" asChild>
							<Link href="/blog/admin">Manage Blog Posts</Link>
						</Button>
						<Button className="w-full justify-start" asChild>
							<Link href="/admin/settings">System Settings</Link>
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>User Statistics</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<span>Total Users</span>
								<Badge variant="secondary">{userStats.total}</Badge>
							</div>
							<div className="flex justify-between items-center">
								<span>Active Clients</span>
								<Badge variant="secondary">{userStats.clients}</Badge>
							</div>
							<div className="flex justify-between items-center">
								<span>Developers</span>
								<Badge variant="secondary">{userStats.developers}</Badge>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
