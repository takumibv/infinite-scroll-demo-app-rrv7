// モックAPIユーティリティ
export interface Item {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

export interface FetchItemsResponse {
  items: Item[];
  hasMore: boolean;
  totalCount: number;
}

const TOTAL_ITEMS = 200;
const ITEMS_PER_PAGE = 20;

// ダミーデータを生成
const generateItem = (id: number): Item => ({
  id,
  title: `Item ${id}`,
  description: `This is a description for item ${id}. It contains some sample text to demonstrate the infinite scroll functionality.`,
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
});

// 全アイテムを生成（メモリに保持）
const allItems: Item[] = Array.from({ length: TOTAL_ITEMS }, (_, i) => generateItem(i + 1));

// APIレスポンスをシミュレート
export async function fetchItems({
  page = 1,
  limit = ITEMS_PER_PAGE
}: {
  page?: number;
  limit?: number;
}): Promise<FetchItemsResponse> {
  // ネットワーク遅延をシミュレート
  await new Promise(resolve => setTimeout(resolve, 500));

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const items = allItems.slice(startIndex, endIndex);
  const hasMore = endIndex < allItems.length;

  return {
    items,
    hasMore,
    totalCount: allItems.length,
  };
}