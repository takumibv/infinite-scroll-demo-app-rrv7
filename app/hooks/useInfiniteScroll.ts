import { useState, useEffect, useCallback, useMemo } from "react";
import { useFetcher } from "react-router";
import { useInView } from "react-intersection-observer";
import type { Article } from "~/types";

// ローダーから返されるデータの型
export interface InfiniteScrollLoaderData {
  articles: Article[];
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
  allArticles: Article[];
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
}

export function useInfiniteScroll({
  initialData,
  rootMargin = "100px",
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const fetcher = useFetcher<InfiniteScrollLoaderData>();

  // 状態管理
  const [articles, setArticles] = useState<Article[]>(initialData.articles);
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
    if (hasMore && fetcher.state === "idle" && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      setIsLoading(true);
      fetcher.load(`/api/articles?page=${nextPage}`);
    }
  }, [hasMore, page, fetcher, isLoading]);

  // Intersection Observer がトリガーされたら読み込み
  useEffect(() => {
    if (inView && hasMore && fetcher.state === "idle" && !isLoading) {
      loadMore();
    }
  }, [inView, hasMore, fetcher.state, loadMore, isLoading]);

  // 重複を排除して記事を追加するヘルパー関数
  const mergeArticles = useCallback(
    (existingArticles: Article[], newArticles: Article[], prepend = false) => {
      const existingIds = new Set(existingArticles.map((article) => article.id));
      const uniqueNewArticles = newArticles.filter((article) => !existingIds.has(article.id));
      return prepend
        ? [...uniqueNewArticles, ...existingArticles]
        : [...existingArticles, ...uniqueNewArticles];
    },
    []
  );

  // fetcherからデータが返ってきたら統合
  useEffect(() => {
    const data = fetcher.data;
    if (data?.articles) {
      setArticles((prev) => [...prev, ...data.articles]);
      setHasMore(data.hasMore);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [fetcher.data, mergeArticles]);

  // 手動リフレッシュ
  const refresh = useCallback(() => {
    if (fetcher.state === "idle" && !isLoading) {
      // APIエンドポイントから新しいデータを取得
      setIsLoading(true);
      fetcher.load("/api/articles?page=1");

      // リフレッシュ後は状態をリセット
      setArticles([]);
      setPage(1);
      setHasMore(true);
    }
  }, [fetcher, isLoading]);

  // メモ化された戻り値
  return useMemo(
    () => ({
      // データ
      allArticles: articles,
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
    }),
    [
      articles,
      hasMore,
      page,
      initialData.totalCount,
      isLoading,
      observerRef,
      inView,
      loadMore,
      refresh,
    ]
  );
}
