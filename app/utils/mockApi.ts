// モックAPIユーティリティ
import type { Article } from '~/types';

export interface FetchArticlesResponse {
  articles: Article[];
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

// 全記事を生成（メモリに保持、動的に追加可能）
let allArticles: Article[] = Array.from({ length: INITIAL_ITEMS }, (_, i) => generateItem(i + 1));

// 新しい記事を追加する関数
export function addNewArticles(count: number = 20): void {
  const newArticles: Article[] = [];
  for (let i = 0; i < count; i++) {
    currentMaxId++;
    // 新しい記事を先頭に追加（最新の記事が上に来るように）
    newArticles.push(generateItem(currentMaxId));
  }
  // 配列の先頭に新しい記事を追加
  allArticles = [...newArticles, ...allArticles];
}

// APIレスポンスをシミュレート
export async function fetchArticles({
  page = 1,
  limit = ITEMS_PER_PAGE
}: {
  page?: number;
  limit?: number;
}): Promise<FetchArticlesResponse> {
  // ネットワーク遅延をシミュレート
  await new Promise(resolve => setTimeout(resolve, 500));

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const articles = allArticles.slice(startIndex, endIndex);
  const hasMore = endIndex < allArticles.length;

  return {
    articles,
    hasMore,
    totalCount: allArticles.length,
  };
}