import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFetcher } from 'react-router';
import { useInView } from 'react-intersection-observer';
import type { Article } from '~/types';

// ローダーから返されるデータの型
export interface InfiniteScrollLoaderData {
  items: Article[];
  hasMore: boolean;
  currentPage: number;
  totalCount: number;
}

// カスタムフックのオプション
export interface UseInfiniteScrollOptions {
  initialData: InfiniteScrollLoaderData;
  rootMargin?: string;
}

// カスタムフックの戻り値
export interface UseInfiniteScrollReturn {
  // データ
  allItems: Article[];
  hasMore: boolean;
  totalCount: number;
  currentPage: number;

  // 状態
  isLoading: boolean;

  // Observer ref
  observerRef: (node?: Element | null) => void;
  inView: boolean;

  // アクション
  loadMore: () => void;
  refresh: () => void;
  reset: () => void;
}

export function useInfiniteScroll({
  initialData,
  rootMargin = '100px'
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const fetcher = useFetcher<InfiniteScrollLoaderData>();

  // 状態管理
  const [allItems, setAllItems] = useState<Article[]>(initialData.items);
  const [page, setPage] = useState(initialData.currentPage);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [isLoading, setIsLoading] = useState(false);

  // Intersection Observer のセットアップ
  const { ref: observerRef, inView } = useInView({
    threshold: 0,
    rootMargin,
  });

  // 新しいページのデータ取得
  const loadMore = useCallback(() => {
    if (hasMore && fetcher.state === 'idle' && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      setIsLoading(true);
      fetcher.load(`/api/articles?page=${nextPage}`);
    }
  }, [hasMore, fetcher, page, isLoading]);

  // Intersection Observer がトリガーされたら読み込み
  useEffect(() => {
    if (inView && hasMore && fetcher.state === 'idle' && !isLoading) {
      loadMore();
    }
  }, [inView, hasMore, fetcher.state, loadMore, isLoading]);

  // 重複を排除してアイテムを追加するヘルパー関数
  const mergeItems = useCallback((existingItems: Article[], newItems: Article[], prepend = false) => {
    const existingIds = new Set(existingItems.map(item => item.id));
    const uniqueNewItems = newItems.filter(item => !existingIds.has(item.id));
    return prepend ? [...uniqueNewItems, ...existingItems] : [...existingItems, ...uniqueNewItems];
  }, []);

  // fetcherからデータが返ってきたら統合
  useEffect(() => {
    if (fetcher.data?.items) {
      setAllItems(prev => mergeItems(prev, fetcher.data!.items));
      setHasMore(fetcher.data.hasMore);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [fetcher.data, mergeItems]);


  // 手動リフレッシュ
  const refresh = useCallback(() => {
    if (fetcher.state === 'idle' && !isLoading) {
      // APIエンドポイントから新しいデータを取得
      setIsLoading(true);
      fetcher.load(`/api/articles?page=1&refresh=true`);

      // リフレッシュ後はページをリセット
      setPage(1);
      setAllItems([]);
    }
  }, [fetcher, isLoading]);

  // リセット機能
  const reset = useCallback(() => {
    setAllItems(initialData.items);
    setPage(initialData.currentPage);
    setHasMore(initialData.hasMore);
  }, [initialData]);


  // メモ化された戻り値
  return useMemo(() => ({
    // データ
    allItems,
    hasMore,
    totalCount: initialData.totalCount,
    currentPage: page,

    // 状態
    isLoading,

    // Observer ref
    observerRef,
    inView,

    // アクション
    loadMore,
    refresh,
    reset,
  }), [
    allItems,
    hasMore,
    initialData.totalCount,
    page,
    isLoading,
    observerRef,
    inView,
    loadMore,
    refresh,
    reset,
  ]);
}