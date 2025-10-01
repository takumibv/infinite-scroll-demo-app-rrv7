import { type LoaderFunctionArgs, useLoaderData } from 'react-router';
import {
  Container,
  Typography,
  Box,
  LinearProgress,
  Paper,
  Chip,
  Button,
  Alert,
} from '@mui/material';
import { fetchItems, addNewItems } from '~/utils/mockApi';
import ItemCard from '~/components/ItemCard';
import { useInfiniteScroll, type InfiniteScrollLoaderData } from '~/hooks/useInfiniteScroll';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const ITEMS_PER_PAGE = 20;

// ローダー関数: 初期データの取得
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const isRefresh = url.searchParams.get('refresh') === 'true';

  // リフレッシュの場合、新しいアイテムを追加
  if (isRefresh && page === 1) {
    addNewItems(20); // 20個の新しいアイテムを追加
  }

  await sleep(1000);

  const data = await fetchItems({ page, limit: ITEMS_PER_PAGE });

  return {
    items: data.items,
    hasMore: data.hasMore,
    currentPage: page,
    totalCount: data.totalCount,
  } satisfies InfiniteScrollLoaderData;
}

// メタデータ
export function meta() {
  return [
    { title: 'Infinite Scroll Demo - React Router v7' },
    {
      name: 'description',
      content: 'Demonstration of infinite scroll with React Router v7, useFetcher, and virtual scrolling',
    },
  ];
}

export default function ItemsPage() {
  const initialData = useLoaderData<typeof loader>();

  // カスタムフックを使用してデータ取得層を管理
  const {
    allItems,
    hasMore,
    totalCount,
    currentPage,
    isLoading,
    isRefreshing,
    autoRefresh,
    observerRef,
    inView,
    refresh,
    reset,
    toggleAutoRefresh,
  } = useInfiniteScroll({
    initialData,
    rootMargin: '100px',
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* ヘッダー */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Infinite Scroll Demo
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            React Router v7 with loader, useFetcher, and useRevalidator
          </Typography>

          {/* ステータス表示 */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip
              label={`Total: ${allItems.length} / ${totalCount}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`Page: ${currentPage}`}
              color="secondary"
              variant="outlined"
            />
            {isLoading && (
              <Chip label="Loading..." color="info" />
            )}
            {isRefreshing && (
              <Chip label="Refreshing..." color="warning" />
            )}
            {!hasMore && (
              <Chip label="All items loaded" color="success" />
            )}
          </Box>

          {/* コントロールボタン */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={refresh}
              disabled={isRefreshing}
            >
              Manual Refresh
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={toggleAutoRefresh}
              color={autoRefresh ? 'success' : 'inherit'}
            >
              Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={reset}
              color="error"
            >
              Reset
            </Button>
          </Box>
        </Paper>

        {/* 自動更新の通知 */}
        {autoRefresh && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Auto-refresh is enabled. The list will check for new items every 30 seconds.
          </Alert>
        )}

        {/* アイテムグリッド */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {allItems.map((item, index) => (
            <Box key={`${item.id}-${index}`}>
              <ItemCard item={item} />
            </Box>
          ))}
        </Box>

        {/* ローディングインジケーター */}
        {isLoading && (
          <Box sx={{ mt: 4 }}>
            <LinearProgress />
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 2 }}
            >
              Loading more items...
            </Typography>
          </Box>
        )}

        {/* Intersection Observer のターゲット */}
        {hasMore && (
          <Box
            ref={observerRef}
            sx={{
              height: '20px',
              mt: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {!isLoading && inView && (
              <Typography variant="caption" color="text.disabled">
                Scroll to load more
              </Typography>
            )}
          </Box>
        )}

        {/* 終了メッセージ */}
        {!hasMore && (
          <Paper
            elevation={0}
            sx={{
              mt: 4,
              p: 3,
              textAlign: 'center',
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              🎉 All items loaded!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You've reached the end of the list ({totalCount} items)
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
}