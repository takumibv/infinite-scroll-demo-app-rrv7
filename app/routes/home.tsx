import {
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Container,
} from "@mui/material";
import { fetchArticles } from "~/utils/mockApi";
import type { Route } from "./+types/home";
import { useFetcher } from "react-router";
import type { Article, FetchArticlesResponse } from "~/types";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

export async function loader() {
  // 初回ロード時は最初のページのデータのみ取得
  const data = await fetchArticles({ page: 1, limit: 20 });
  return {
    articles: data.articles,
    hasMore: data.hasMore,
    currentPage: 1,
    totalCount: data.totalCount,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<FetchArticlesResponse>();

  // 状態管理を追加
  const [articles, setArticles] = useState<Article[]>(loaderData.articles);
  const [page, setPage] = useState(loaderData.currentPage);
  const [hasMore, setHasMore] = useState(loaderData.hasMore);
  const [isLoading, setIsLoading] = useState(false);

  // 新しいページのデータ取得
  const loadMore = useCallback(() => {
    if (hasMore && fetcher.state === "idle" && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      setIsLoading(true);
      fetcher.load(`/api/articles?page=${nextPage}`);
    }
  }, [hasMore, page, fetcher, isLoading]);

  // fetcher からデータが返ってきたら統合する
  useEffect(() => {
    const data = fetcher.data;
    if (data?.articles) {
      setArticles((prev) => [...prev, ...data.articles]);
      setHasMore(data.hasMore);
      setTimeout(() => {
        // データ取得が完了したらローディングを解除
        setIsLoading(false);
      }, 100);
    }
  }, [fetcher.data]);

  // Intersection Observer のセットアップ
  const { ref: observerRef, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  // Intersection Observer がトリガーされたら読み込み
  useEffect(() => {
    if (inView && hasMore && fetcher.state === "idle" && !isLoading) {
      loadMore();
    }
  }, [inView, hasMore, fetcher.state, loadMore, isLoading]);

  return (
    <Container sx={{ p: 4 }}>
      <Typography variant="h4" component="h1">
        Articles ({articles.length})
      </Typography>

      <List sx={{ mt: 2.5 }}>
        {articles.map((article) => (
          <ListItem key={article.id}>
            <ListItemText>
              <Typography variant="subtitle1">{article.title}</Typography>
              <Typography variant="body2">{article.description}</Typography>
            </ListItemText>
          </ListItem>
        ))}
      </List>

      {hasMore && (
        <Box ref={observerRef} sx={{ p: 2.5, textAlign: "center" }}>
          {isLoading ? <CircularProgress size={24} /> : <p>スクロールしてさらに読み込む</p>}
        </Box>
      )}

      {!hasMore && (
        <Box sx={{ p: 2.5, textAlign: "center", color: "text.secondary" }}>End of list</Box>
      )}
    </Container>
  );
}
