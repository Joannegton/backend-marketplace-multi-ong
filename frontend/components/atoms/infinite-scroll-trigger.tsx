import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface InfiniteScrollTriggerProps {
    onLoadMore: () => void;
    hasMore: boolean;
    isLoading: boolean;
}

export function InfiniteScrollTrigger({ onLoadMore, hasMore, isLoading }: Readonly<InfiniteScrollTriggerProps>) {
    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: '100px',
    });

    useEffect(() => {
        if (inView && hasMore && !isLoading) {
            onLoadMore();
        }
    }, [inView, hasMore, isLoading, onLoadMore]);

    if (!hasMore) return null;

    return (
        <div ref={ref} className="h-4" />
    );
}