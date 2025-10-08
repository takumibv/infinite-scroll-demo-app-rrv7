import {
  Box,
  Button,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Container,
} from "@mui/material";
import { fetchArticles } from "~/utils/mockApi";
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll";
import type { Route } from "./+types/homeWithCustomHooks";

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
  const { allArticles, hasMore, isLoading, observerRef, refresh } = useInfiniteScroll({
    initialData: loaderData,
  });

  return (
    <Container sx={{ p: 4 }}>
      <Typography variant="h4" component="h1">
        Articles ({allArticles.length})
      </Typography>
      <Button onClick={refresh}>Refresh</Button>

      <List sx={{ mt: 2.5 }}>
        {allArticles.map((article) => (
          <ListItem key={article.id}>
            <ListItemText>
              <Typography variant="subtitle1" component="strong">
                {article.title}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
                {article.description}
              </Typography>
            </ListItemText>
          </ListItem>
        ))}
      </List>

      {hasMore && (
        <Box ref={observerRef} sx={{ p: 2.5, textAlign: "center" }}>
          {isLoading ? <CircularProgress size={24} /> : "Scroll for more"}
        </Box>
      )}

      {!hasMore && (
        <Box sx={{ p: 2.5, textAlign: "center", color: "text.secondary" }}>End of list</Box>
      )}
    </Container>
  );
}
