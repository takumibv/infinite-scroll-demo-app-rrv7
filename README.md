# React Router v7 無限スクロールデモ

React Router v7を使用した無限スクロールとバーチャルリストの実装デモアプリケーションです。

## 機能

- 📜 **無限スクロール**: Intersection Observer APIを使用した自動ローディング
- ⚡ **バーチャルリスト**: @tanstack/react-virtualによる効率的なレンダリング
- 🔄 **手動リフレッシュ**: 新しいアイテムを動的に追加
- ⏰ **自動リフレッシュ**: 30秒ごとの自動更新（トグル可能）
- 🎯 **型安全**: TypeScriptによる完全な型定義
- 🚀 **SSR対応**: React Router v7のサーバーサイドレンダリング

## 技術スタック

- **React Router v7**: フルスタックWebフレームワーク
- **React 18**: UI構築ライブラリ
- **TypeScript**: 型安全な開発
- **Material-UI (MUI)**: UIコンポーネント
- **@tanstack/react-virtual**: バーチャルスクロール
- **react-intersection-observer**: スクロール検知
- **Vite**: 高速な開発サーバーとビルドツール

## セットアップ

### 必要要件

- Node.js 18以上
- npm または pnpm

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

アプリケーションは http://localhost:5173 でアクセスできます。

## スクリプト

```bash
npm run dev       # 開発サーバーを起動
npm run build     # プロダクションビルド
npm run start     # プロダクションサーバーを起動
npm run typecheck # TypeScript型チェック
```

## プロジェクト構成

```
app/
├── routes/
│   └── home.tsx          # 無限スクロールページ
├── hooks/
│   └── useInfiniteScroll.ts  # カスタムフック
├── components/
│   └── ItemCard.tsx      # アイテムカードコンポーネント
├── utils/
│   └── mockApi.ts        # モックAPI
└── root.tsx              # ルートレイアウト
```

## 主な機能の説明

### 無限スクロール

- ページ下部に到達すると自動的に次のデータを取得
- Intersection Observer APIを使用した効率的な検知
- ローディング状態とエラーハンドリング

### 手動リフレッシュ

- 「Manual Refresh」ボタンで新しいアイテムを追加
- 重複排除ロジックによる安全なデータ統合
- URLパラメータを使用したリフレッシュ状態の管理

### 自動リフレッシュ

- 30秒ごとに自動的にデータを更新（設定可能）
- トグルボタンでON/OFF切り替え可能
- React Routerのrevalidatorを使用

### カスタムフック (useInfiniteScroll)

データ取得ロジックをカプセル化したカスタムフック：

```typescript
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
  autoRefreshInterval: 30000, // オプション
});
```

## 開発ガイド

### 型安全性

- `any`型の使用は禁止
- 適切な型定義または`unknown`型を使用
- 型ガードによる型の絞り込み

### React Router v7のパターン

- `loader`関数による初期データ取得
- `useFetcher`によるクライアントサイドデータ更新
- 型安全なルーティング

## ライセンス

MIT