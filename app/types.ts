export interface Article {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

export interface FetchArticlesResponse {
  articles: Article[];
  hasMore: boolean;
  totalCount: number;
}