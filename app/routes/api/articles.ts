import { type LoaderFunctionArgs } from "react-router";
import { fetchArticles } from "~/utils/mockApi";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");

  const data = await fetchArticles({ page });

  return {
    articles: data.articles,
    hasMore: data.hasMore,
    currentPage: page,
    totalCount: data.totalCount,
  };
}