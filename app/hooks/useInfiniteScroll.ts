import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFetcher, useRevalidator, useNavigate } from 'react-router';
import { useInView } from 'react-intersection-observer';
import type { Item } from '~/utils/mockApi';

// ローダーから返されるデータの型
export interface InfiniteScrollLoaderData {
  items: Item[];
  hasMore: boolean;
  currentPage: number;
  totalCount: number;
}

// カスタムフックのオプション
export interface UseInfiniteScrollOptions {
  initialData: InfiniteScrollLoaderData;
  rootMargin?: string;
  autoRefreshInterval?: number;
}

// カスタムフックの戻り値
export interface UseInfiniteScrollReturn {
  // データ
  allItems: Item[];
  hasMore: boolean;
  totalCount: number;
  currentPage: number;

  // 状態
  isLoading: boolean;
  isRefreshing: boolean;
  autoRefresh: boolean;

  // Observer ref
  observerRef: (node?: Element | null) => void;
  inView: boolean;

  // アクション
  loadMore: () => void;
  refresh: () => void;
  reset: () => void;
  toggleAutoRefresh: () => void;
}

export function useInfiniteScroll({
  initialData,
  rootMargin = '100px',
  autoRefreshInterval = 30000
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const fetcher = useFetcher<InfiniteScrollLoaderData>();
  const revalidator = useRevalidator();
  const navigate = useNavigate();

  // 状態管理
  const [allItems, setAllItems] = useState<Item[]>(initialData.items);
  const [page, setPage] = useState(initialData.currentPage);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Intersection Observer のセットアップ
  const { ref: observerRef, inView } = useInView({
    threshold: 0,
    rootMargin,
  });

  // 新しいページのデータ取得
  const loadMore = useCallback(() => {
    if (hasMore && fetcher.state === 'idle') {
      const nextPage = page + 1;
      setPage(nextPage);
      fetcher.load(`/items?page=${nextPage}`);
    }
  }, [hasMore, fetcher, page]);

  // Intersection Observer がトリガーされたら読み込み
  useEffect(() => {
    if (inView && hasMore && fetcher.state === 'idle') {
      loadMore();
    }
  }, [inView, hasMore, fetcher.state, loadMore]);

  // 重複を排除してアイテムを追加するヘルパー関数
  const mergeItems = useCallback((existingItems: Item[], newItems: Item[], prepend = false) => {
    const existingIds = new Set(existingItems.map(item => item.id));
    const uniqueNewItems = newItems.filter(item => !existingIds.has(item.id));
    return prepend ? [...uniqueNewItems, ...existingItems] : [...existingItems, ...uniqueNewItems];
  }, []);

  // fetcherからデータが返ってきたら統合
  useEffect(() => {
    if (fetcher.data?.items) {
      setAllItems(prev => mergeItems(prev, fetcher.data!.items));
      setHasMore(fetcher.data.hasMore);
    }
  }, [fetcher.data, mergeItems]);

  // 自動更新機能
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (revalidator.state === 'idle') {
        revalidator.revalidate();
      }
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, revalidator, autoRefreshInterval]);

  // 再検証されたデータで先頭のアイテムを更新
  useEffect(() => {
    if (revalidator.state === 'idle' && initialData.items.length > 0) {
      // 新しいアイテムがあるかチェック
      const hasNewItems = initialData.items.some(
        item => !allItems.find(existing => existing.id === item.id)
      );

      if (hasNewItems) {
        // 重複を避けながら新しいアイテムを先頭に追加
        setAllItems(prev => mergeItems(prev, initialData.items, true));
      }
    }
  }, [revalidator.state, initialData.items, allItems, mergeItems]);

  // 手動リフレッシュ
  const refresh = useCallback(() => {
    if (revalidator.state === 'idle') {
      // URLにrefreshパラメータを追加してナビゲート
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set('refresh', 'true');
      navigate(`?${searchParams.toString()}`, { replace: true });

      // 再検証を実行
      revalidator.revalidate();

      // パラメータを削除
      setTimeout(() => {
        searchParams.delete('refresh');
        const newSearch = searchParams.toString();
        navigate(newSearch ? `?${newSearch}` : '.', { replace: true });
      }, 500);
    }
  }, [revalidator, navigate]);

  // リセット機能
  const reset = useCallback(() => {
    setAllItems(initialData.items);
    setPage(initialData.currentPage);
    setHasMore(initialData.hasMore);
    setAutoRefresh(false);
  }, [initialData]);

  // 自動更新のトグル
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  // メモ化された戻り値
  return useMemo(() => ({
    // データ
    allItems,
    hasMore,
    totalCount: initialData.totalCount,
    currentPage: page,

    // 状態
    isLoading: fetcher.state === 'loading',
    isRefreshing: revalidator.state === 'loading',
    autoRefresh,

    // Observer ref
    observerRef,
    inView,

    // アクション
    loadMore,
    refresh,
    reset,
    toggleAutoRefresh,
  }), [
    allItems,
    hasMore,
    initialData.totalCount,
    page,
    fetcher.state,
    revalidator.state,
    autoRefresh,
    observerRef,
    inView,
    loadMore,
    refresh,
    reset,
    toggleAutoRefresh,
  ]);
}