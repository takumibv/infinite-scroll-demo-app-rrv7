import { useLoaderData } from "react-router";
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
import { fetchItems } from "~/utils/mockApi";
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll";

export async function loader() {
  // 初回ロード時は最初のページのデータのみ取得
  const data = await fetchItems({ page: 1, limit: 20 });
  return {
    items: data.items,
    hasMore: data.hasMore,
    currentPage: 1,
    totalCount: data.totalCount,
  };
}

export default function Home() {
  const data = useLoaderData<typeof loader>();
  const { allItems, hasMore, isLoading, observerRef, refresh, reset } = useInfiniteScroll({
    initialData: data,
  });

  return (
    <Container sx={{ p: 4 }}>
      <Typography variant="h4" component="h1">
        Items ({allItems.length})
      </Typography>
      <Button onClick={refresh}>Refresh</Button>
      <Button onClick={reset}>Reset</Button>

      <List sx={{ mt: 2.5 }}>
        {allItems.map((item) => (
          <ListItem key={item.id}>
            <ListItemText>
              <Typography variant="subtitle1" component="strong">
                {item.title}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
                {item.description}
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
