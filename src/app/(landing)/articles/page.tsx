'use client';

import { SlidersHorizontal, Search } from 'lucide-react';
import { useState } from 'react';

import { BlogPostCard } from '@/src/components/blog/BlogPostCard';
import { BlogPostSkeleton } from '@/src/components/skeletons/blogPage-skeleton';
import { Filters } from '@/src/components/blog/Filters';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { useBlogPosts } from '@/src/hooks/react-query/useBlog';

export default function ArticlesPage() {
	const [searchTerm, setSearchTerm] = useState('');
	const [sortBy, setSortBy] = useState('newest');
	const [showFilters, setShowFilters] = useState(false);

	const {
		data: blogPosts,
		isLoading,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
		refetch,
	} = useBlogPosts({ searchTerm, sortBy });

	const handleSearch = (value: string) => {
		setSearchTerm(value);
		refetch();
	};

	const posts = blogPosts?.pages?.flat() || [];

	return (
		<div className="container py-8">
			<div className="max-w-4xl mx-auto">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
					<h1 className="text-4xl font-bold">Articles</h1>
					<div className="flex items-center gap-2 w-full sm:w-auto">
						<div className="relative flex-1 sm:flex-initial">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
							<Input
								placeholder="Search articles..."
								className="pl-9 w-full"
								value={searchTerm}
								onChange={(e) => handleSearch(e.target.value)}
							/>
						</div>
						<Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
							<SlidersHorizontal className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{showFilters && <Filters sortBy={sortBy} setSortBy={setSortBy} />}

				{isLoading ? (
					<BlogPostSkeleton />
				) : posts.length === 0 ? (
					<p className="text-center text-muted-foreground py-8">No articles found.</p>
				) : (
					<>
						<div className="space-y-6">
							{posts.map((post) => (
								<BlogPostCard key={post.id} post={post} />
							))}
						</div>
						{hasNextPage && (
							<div className="flex justify-center mt-8">
								<Button
									onClick={() => fetchNextPage()}
									disabled={isFetchingNextPage}
									variant="outline"
								>
									{isFetchingNextPage ? 'Loading more...' : 'Load More'}
								</Button>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
