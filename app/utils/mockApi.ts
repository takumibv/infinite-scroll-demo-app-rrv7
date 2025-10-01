// モックAPIユーティリティ
import type { Article } from '~/types';

export interface FetchItemsResponse {
  items: Article[];
  hasMore: boolean;
  totalCount: number;
}

const INITIAL_ITEMS = 200;
const ITEMS_PER_PAGE = 20;
let currentMaxId = INITIAL_ITEMS;

// ダミーデータを生成
const generateItem = (id: number): Article => ({
  id,
  title: `Article ${id}`,
  description: `This is a description for article ${id}. It contains some sample text to demonstrate the infinite scroll functionality.`,
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
});

// 全アイテムを生成（メモリに保持、動的に追加可能）
let allItems: Article[] = Array.from({ length: INITIAL_ITEMS }, (_, i) => generateItem(i + 1));

// 新しいアイテムを追加する関数
export function addNewItems(count: number = 20): void {
  const newItems: Article[] = [];
  for (let i = 0; i < count; i++) {
    currentMaxId++;
    // 新しいアイテムを先頭に追加（最新のアイテムが上に来るように）
    newItems.push(generateItem(currentMaxId));
  }
  // 配列の先頭に新しいアイテムを追加
  allItems = [...newItems, ...allItems];
}

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