# B-Routes - ボルダリングルート公開サイト

ボルダリングのローカルルートを公開するWebアプリケーションです。

## 機能

- **エリア選択画面**: 地図上にエリアを塗り分けて表示
- **壁選択画面**: 地図上に壁の位置をピンで表示
- **ルート詳細画面**: 岩の画像にルートの線、スタートホールド、重要なポイントを重ねて表示
- **管理画面**: 壁とルートの追加・編集機能

## 技術スタック

- Vue 3 (Composition API) + TypeScript
- Vite
- Vue Router
- Leaflet (地図表示)
- Canvas API (ベクターデータ描画)

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

### ビルド

```bash
npm run build
```

### プレビュー

```bash
npm run preview
```

## データ構造

データは `public/data/areas.json` に保存されています。

階層構造:
- エリア (Area)
  - 壁 (Wall)
    - ルート (Route)

## 画像の配置

ルートの画像は `public/images/routes/` ディレクトリに配置してください。
`areas.json` の `imageUrl` フィールドで画像のパスを指定します。

例: `/images/routes/route1.jpg`

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

