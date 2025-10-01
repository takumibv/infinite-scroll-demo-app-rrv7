import { type LoaderFunctionArgs } from "react-router";
import { fetchArticles, addNewArticles } from "~/utils/mockApi";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const isRefresh = url.searchParams.get("refresh") === "true";

  // リフレッシュ時は新しい記事を追加
  if (isRefresh && page === 1) {
    addNewArticles(20);
  }

  const data = await fetchArticles({ page, limit });

  return {
    articles: data.articles,
    hasMore: data.hasMore,
    currentPage: page,
    totalCount: data.totalCount,
  };
}