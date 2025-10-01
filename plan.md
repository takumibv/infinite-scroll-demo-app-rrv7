## 📝 記事構成案

### **1. イントロダクション**
- React Router v7 の概要
- 無限スクロールのユースケース
- この記事で学べること

### **2. React Router v7 の基本概念**

#### **2.1 loader の役割**
loaderはルートレベルでのデータフェッチングを担当し、コンポーネントがレンダリングされる前にデータを読み込みます。

```typescript
// 初期データの読み込み
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";
  
  const data = await fetchItems({ page: parseInt(page) });
  
  return json({
    items: data.items,
    hasMore: data.hasMore,
    currentPage: parseInt(page)
  });
}
```

**loader の特徴:**
- ルートに紐づいたデータフェッチング
- SSR/SSG との相性が良い
- 初期表示に必要なデータの取得に適している

#### **2.2 useFetcher の役割**
useFetcherは、ナビゲーションを発生させずにアクションやローダーと連携できるフックです。

```typescript
function InfiniteScrollList() {
  const { items } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof loader>();
  const [allItems, setAllItems] = useState(items);
  
  // 追加データの読み込み
  const loadMore = () => {
    const nextPage = Math.floor(allItems.length / ITEMS_PER_PAGE) + 1;
    fetcher.load(`/items?page=${nextPage}`);
  };
  
  // fetcherからデータが返ってきたら統合
  useEffect(() => {
    if (fetcher.data?.items) {
      setAllItems(prev => [...prev, ...fetcher.data.items]);
    }
  }, [fetcher.data]);
}
```

**useFetcher の特徴:**
- ナビゲーションなしでサーバーとのデータやり取りが可能
- `fetcher.state` で読み込み状態を追跡
- 複数の同時リクエストを管理できる
- 無限スクロールコンテナの実装に適している

#### **2.3 useRevalidator の役割**
useRevalidatorは、通常のデータミューテーション以外の理由（ウィンドウフォーカスやポーリングなど）でページデータを再検証するためのフックです。

```typescript
function InfiniteScrollWithRevalidation() {
  const revalidator = useRevalidator();
  
  // ウィンドウにフォーカスが戻った時にデータを更新
  useEffect(() => {
    const handleFocus = () => {
      if (revalidator.state === "idle") {
        revalidator.revalidate();
      }
    };
    
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [revalidator]);
}
```

**useRevalidator の注意点:**
- 通常のCRUD操作には不要（Form、useSubmit、useFetcherが自動的に再検証を行う）
- ポーリングやウィンドウフォーカス時の更新など、特殊なケースで使用

### **3. 実装例: 完全な無限スクロール**

#### **3.1 基本的な実装**
```typescript
// routes/items.tsx
import { json, type LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { useEffect, useRef, useState } from "react";

const ITEMS_PER_PAGE = 20;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  
  const response = await fetch(
    `https://api.example.com/items?page=${page}&limit=${ITEMS_PER_PAGE}`
  );
  const data = await response.json();
  
  return json({
    items: data.items,
    hasMore: data.hasMore,
    currentPage: page
  });
}

export default function ItemsPage() {
  const initialData = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof loader>();
  
  const [allItems, setAllItems] = useState(initialData.items);
  const [page, setPage] = useState(initialData.currentPage);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  
  const observerTarget = useRef<HTMLDivElement>(null);
  
  // Intersection Observer で自動読み込み
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && fetcher.state === "idle") {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1.0 }
    );
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => observer.disconnect();
  }, [hasMore, fetcher.state]);
  
  // ページが変更されたらデータを取得
  useEffect(() => {
    if (page > initialData.currentPage) {
      fetcher.load(`/items?page=${page}`);
    }
  }, [page]);
  
  // fetcherからデータが返ってきたら統合
  useEffect(() => {
    if (fetcher.data) {
      setAllItems(prev => [...prev, ...fetcher.data.items]);
      setHasMore(fetcher.data.hasMore);
    }
  }, [fetcher.data]);
  
  return (
    <div>
      <h1>Items List</h1>
      <div className="items-grid">
        {allItems.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
      
      {/* ローディングインジケーター */}
      {fetcher.state === "loading" && (
        <div className="loading">Loading more items...</div>
      )}
      
      {/* Intersection Observer のターゲット */}
      {hasMore && <div ref={observerTarget} style={{ height: "20px" }} />}
      
      {!hasMore && <div className="end">No more items to load</div>}
    </div>
  );
}
```

#### **3.2 useRevalidator を活用した実装**
無限スクロールで新しいアイテムが追加されたことを検知したい場合：

```typescript
export default function ItemsPageWithRevalidation() {
  const initialData = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof loader>();
  const revalidator = useRevalidator();
  
  // ... 上記の状態管理
  
  // 定期的にトップページを再検証して新規アイテムをチェック
  useEffect(() => {
    const interval = setInterval(() => {
      if (revalidator.state === "idle") {
        // 最初のページだけを再検証
        revalidator.revalidate();
      }
    }, 60000); // 1分ごと
    
    return () => clearInterval(interval);
  }, [revalidator]);
  
  // 再検証されたデータで先頭のアイテムを更新
  useEffect(() => {
    if (revalidator.state === "idle" && initialData.items) {
      setAllItems(prev => {
        const newIds = new Set(initialData.items.map(i => i.id));
        const existingItems = prev.filter(i => !newIds.has(i.id));
        return [...initialData.items, ...existingItems];
      });
    }
  }, [revalidator.state, initialData]);
  
  // ...
}
```

### **4. パフォーマンス最適化のヒント**

1. **重複読み込みの防止**
   - `fetcher.state` をチェック
   - ページ番号の管理を適切に

2. **メモリ管理**
   - 仮想スクロールの検討
   - 古いアイテムの削除機能

3. **スケルトンローダー**
   - ローディング中のUX向上

### **5. まとめ**

**3つの機能の使い分け:**
- **loader**: 初期データの取得
- **useFetcher**: 追加データの取得（無限スクロールのコア）
- **useRevalidator**: リアルタイム更新や定期的なデータ再検証

---

この構成で記事を書くと、読者が React Router v7 の機能を理解しながら、実践的な無限スクロールを実装できるようになります。コード例も実用的で、そのまま使えるものを提供しています。

記事を書く際に、さらに詳しい説明が必要な部分や、追加したい内容があればお知らせください！