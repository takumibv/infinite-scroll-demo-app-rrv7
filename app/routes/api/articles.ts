import { type LoaderFunctionArgs } from "react-router";
import { fetchItems, addNewItems } from "~/utils/mockApi";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const isRefresh = url.searchParams.get("refresh") === "true";

  // リフレッシュ時は新しいアイテムを追加
  if (isRefresh && page === 1) {
    addNewItems(20);
  }

  const data = await fetchItems({ page, limit });

  return {
    items: data.items,
    hasMore: data.hasMore,
    currentPage: page,
    totalCount: data.totalCount,
  };
}