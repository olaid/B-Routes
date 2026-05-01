# B-Routes - ボルダリングルート公開サイト

ボルダリングのローカルルートを公開するWebアプリケーションです。

## 機能

- **エリア選択画面**: 地図上にエリアを塗り分けて表示
- **壁の地図画面**: 地図上に壁の位置をピンで表示
- **壁のルート一覧**: `/area/:areaId/wall/:wallId` でその壁のルートを一覧し、詳細へ遷移
- **ルート詳細画面**: 岩の画像にルートの線、スタートホールド、重要なポイントを重ねて表示
- **管理画面**: 壁とルートの追加・編集（Supabase 利用時は DB / Storage に保存）

## 技術スタック

- Vue 3 (Composition API) + TypeScript
- Vite
- Vue Router
- Leaflet (地図表示)
- Canvas API (ベクターデータ描画)
- Supabase（任意: `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` を設定すると Postgres + Storage を使用。未設定時は `public/data/areas.json` のみ読み取り）

## セットアップ

### 必要な環境

- Node.js 18以上
- npm または yarn

### Ubuntu/Linux環境でのセットアップ

```bash
# Node.jsのインストール（未インストールの場合）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# プロジェクトの依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

### Windows環境でのセットアップ

```bash
npm install
npm run dev
```

### Supabase（管理画面の保存・画像アップロード）

1. [Supabase](https://supabase.com/) でプロジェクトを作成する。
2. ルートの `.env` に `.env.example` を参考に `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を設定する。
3. SQL エディタまたは CLI で `supabase/migrations/` 内の SQL を上から順に実行し、テーブル・RLS・シード・Storage バケット `route-images` を作成する。  
   （バケット作成が SQL で失敗する場合はダッシュボードの Storage から同名の公開バケットを手動作成し、ポリシーはマイグレーションを参考に設定する。）

未設定の場合、公開サイトはローカルの `public/data/areas.json` から読み込みます。管理画面の保存・削除・Storage アップロードは Supabase 設定後に利用できます。

### ビルド

```bash
npm run build
```

### プレビュー

```bash
npm run preview
```

## データ構造

**Supabase 未設定時**: データの参照元は `public/data/areas.json` のみです。

**Supabase 設定時**: 正は Postgres（`areas` / `walls` / `routes` テーブル）と Storage（ルート画像）です。スキーマは `supabase/migrations/20250501100000_initial_schema.sql` を参照してください。

階層構造:
- エリア (Area)
  - 壁 (Wall)
    - ルート (Route)

## 画像の配置

ルートの画像は `public/images/routes/` ディレクトリに配置してください。
`areas.json` の `imageUrl` フィールドで画像のパスを指定します。

例: `/images/routes/route1.svg`（リポジトリにサンプル SVG を同梱）

## 開発

### プロジェクト構造

```
src/
├── components/     # 再利用可能なコンポーネント
├── views/         # ページコンポーネント
├── composables/   # Composition API のロジック
├── types/         # TypeScript型定義
└── router/        # ルーティング設定
```

## ライセンス

MIT

