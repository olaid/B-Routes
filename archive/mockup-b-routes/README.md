# B-Routes - ボルダリングルート公開サイト

ボルダリングのローカルルートを公開するWebアプリケーションです。
地図から岩を選び、現在地からの方角と直線距離を目安として確認できます。

## 機能

- **エリア選択画面**: 地図上にエリアを塗り分けて表示
- **壁の地図画面**: 地図上に壁の位置をピンで表示
- **方角・距離パネル**: 選択した岩までの直線距離と北基準の方角を表示（道案内ではなく目安）
- **壁のルート一覧**: `/area/:areaId/wall/:wallId` でその壁のルートを一覧し、詳細へ遷移
- **ルート詳細画面**: 岩の画像に SVG ベクターでルートの線、スタートホールド、重要なポイントを重ねて表示
- **管理画面**: Supabase Auth でログインした管理者が壁とルートを追加・編集

## 技術スタック

- Vue 3 (Composition API) + TypeScript
- Vite
- Vue Router
- Leaflet (地図表示)
- SVG (閲覧時のベクターデータ描画)
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
4. Supabase Auth で管理者メールを使えるようにし、`/admin/login` からマジックリンクでログインする。

未設定の場合、公開サイトはローカルの `public/data/areas.json` から読み込みます。管理画面は Supabase 設定後のみ利用できます。

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

詳細な要件・データモデル・MVP 範囲は `docs/product-spec.md` を参照してください。

## 画像の配置

ローカル JSON 運用時のルート画像は `public/images/routes/` ディレクトリに配置してください。
`areas.json` の `imageUrl` フィールドで画像のパスを指定します。

例: `/images/routes/route1.jpg`（写真を `public/images/routes/` に置き、ルート線は SVG で重ねる）

Supabase 運用時は Storage の `route-images` バケットへアップロードし、公開 URL を `routes.image_url` に保存します。

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

