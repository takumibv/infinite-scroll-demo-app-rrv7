# React Router v7 無限スクロールデモ

React Router v7 を使用した無限スクロールの実装デモアプリケーションです。

## セットアップ

### 必要要件

- Node.js 18 以上
- npm または pnpm

### インストールと起動

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

アプリケーションは http://localhost:5173 でアクセスできます。

### その他のスクリプト

```bash
npm run build     # プロダクションビルド
npm run start     # プロダクションサーバーを起動
npm run typecheck # TypeScript型チェック
```

## プロジェクト構成

```
app/
├── routes/
│   ├── home.tsx                      # 無限スクロールページ(基本実装)
│   ├── homeWithCustomHooks.tsx       # カスタムフック版の実装
│   └── api/
│       └── articles.ts               # 記事取得APIエンドポイント
├── hooks/
│   └── useInfiniteScroll.ts          # 無限スクロール用カスタムフック
├── utils/
│   └── mockApi.ts                    # モックAPIデータ生成
└── root.tsx                          # アプリケーションルートレイアウト
```
