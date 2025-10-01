import { type LoaderFunctionArgs, useLoaderData, useFetcher, useRevalidator } from 'react-router';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
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
import { fetchItems, type Item } from '~/utils/mockApi';
import ItemCard from '~/components/ItemCard';

const ITEMS_PER_PAGE = 20;

// ローダー関数: 初期データの取得
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');

  const data = await fetchItems({ page, limit: ITEMS_PER_PAGE });

  return {
    items: data.items,
    hasMore: data.hasMore,
    currentPage: page,
    totalCount: data.totalCount,
  };
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
  const fetcher = useFetcher<typeof loader>();
  const revalidator = useRevalidator();

  // 状態管理
  const [allItems, setAllItems] = useState<Item[]>(initialData.items);
  const [page, setPage] = useState(initialData.currentPage);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Intersection Observer のセットアップ
  const { ref: observerRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
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

  // fetcherからデータが返ってきたら統合
  useEffect(() => {
    if (fetcher.data?.items) {
      setAllItems(prev => [...prev, ...fetcher.data!.items]);
      setHasMore(fetcher.data.hasMore);
    }
  }, [fetcher.data]);

  // 自動更新機能（useRevalidatorの例）
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (revalidator.state === 'idle') {
        revalidator.revalidate();
      }
    }, 30000); // 30秒ごとに更新

    return () => clearInterval(interval);
  }, [autoRefresh, revalidator]);

  // 再検証されたデータで先頭のアイテムを更新
  useEffect(() => {
    if (revalidator.state === 'idle' && initialData.items) {
      // 新しいアイテムがあるかチェック
      const newIds = new Set(initialData.items.map(i => i.id));
      const hasNewItems = initialData.items.some(
        item => !allItems.find(existing => existing.id === item.id)
      );

      if (hasNewItems) {
        // 重複を避けながら新しいアイテムを追加
        setAllItems(prev => {
          const existingIds = new Set(prev.map(i => i.id));
          const newItems = initialData.items.filter(i => !existingIds.has(i.id));
          return [...newItems, ...prev];
        });
      }
    }
  }, [revalidator.state, initialData.items]);

  // 手動リフレッシュ
  const handleManualRefresh = () => {
    if (revalidator.state === 'idle') {
      revalidator.revalidate();
    }
  };

  // リセット機能
  const handleReset = () => {
    setAllItems(initialData.items);
    setPage(initialData.currentPage);
    setHasMore(initialData.hasMore);
  };

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
              label={`Total: ${allItems.length} / ${initialData.totalCount}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`Page: ${page}`}
              color="secondary"
              variant="outlined"
            />
            {fetcher.state === 'loading' && (
              <Chip label="Loading..." color="info" />
            )}
            {revalidator.state === 'loading' && (
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
              onClick={handleManualRefresh}
              disabled={revalidator.state === 'loading'}
            >
              Manual Refresh
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setAutoRefresh(!autoRefresh)}
              color={autoRefresh ? 'success' : 'inherit'}
            >
              Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleReset}
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
        {fetcher.state === 'loading' && (
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
            {!fetcher.state && inView && (
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
              You've reached the end of the list ({initialData.totalCount} items)
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
}