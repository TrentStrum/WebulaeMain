'use client';

import { Input } from '@/src/components/ui/input';
import { useBlogPosts } from '@/src/hooks/react-query/useBlog';

import { Search, SlidersHorizontal } from 'lucide-react';

import { useState } from 'react';
import { Filters } from './[slug]/components/Filters';
import { Button } from '@/src/components/ui/button';
import { BlogPostSkeleton } from './[slug]/components/BlogPostSkeleton';
import { BlogPostCard } from './[slug]/components/BlogPostCard';
import { BlogPost } from '@/src/types/blog.types';

export default function BlogPostsPage() {
	const [searchTerm, setSearchTerm] = useState('');
	const [sortBy, setSortBy] = useState('newest');
	const [showFilters, setShowFilters] = useState(false);

	const { data: blogPosts, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
		useBlogPosts({ searchTerm, sortBy });

	const handleSearch = (value: string) => {
		setSearchTerm(value);
		refetch();
	};

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
				) : blogPosts?.pages[0]?.length === 0 ? (
					<p className="text-center text-muted-foreground py-8">No articles found.</p>
				) : (
					<>
						<div className="space-y-6">
							{blogPosts?.pages[0]?.map((post: BlogPost) => (
								<BlogPostCard key={post.id} post={post} />
							))}
						</div>
						<div id="scroll-sentinel" className="h-4 mt-6" />
						{isFetchingNextPage && <p className="text-center py-4">Loading more articles...</p>}
					</>
				)}
			</div>
		</div>
	);
}
