# B-Routes

池亀ボルダーのクライミングエリア・岩・ルートを地図とSVGトポで閲覧できるWebアプリ。
エリア地図では、現在地から「そのエリアの中心点」までの方角・直線距離をオーバーレイ表示します（道なき道前提の目安）。

> 旧モックアップ実装は `archive/mockup-b-routes/` に退避しています。本プロジェクトは完全新規構築です。

## 構成

```
B-Routes/
├─ apps/
│  └─ web/                # 公開サイト＋管理画面 (React + Vite + TypeScript, SPA)
├─ supabase/
│  ├─ migrations/         # Postgres スキーマ・RLS・Storage 定義
│  └─ seed/               # 初期データ（旧 areas.json から変換）
├─ scripts/
│  └─ migrate-mockup-data.mjs   # 旧モックデータを新スキーマへ変換
├─ archive/
│  └─ mockup-b-routes/    # 旧 Vue 実装（凍結）
└─ .github/workflows/     # CI（lint / type / build / test / e2e）
```

## 技術スタック

- フロント: React 19 + Vite 6 + TypeScript（SPA）
- 地図: Leaflet + react-leaflet（国土地理院 地理院タイル・標準地図）
- 状態: React の標準フックを基本に、必要なら最小限のストア
- バックエンド: Supabase（Postgres / Auth / Storage）。マジックリンク認証
- PWA: `vite-plugin-pwa`（アプリ本体・直近エリアデータ・最近見た画像）
- ホスティング: Cloudflare Pages

## セットアップ

```bash
# 依存インストール
cd apps/web
npm install

# 開発サーバ
npm run dev
```

環境変数（`apps/web/.env.local` に設定。コミット禁止）：

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

未設定でも `supabase/seed/areas.seed.json` をフォールバックとして閲覧画面は動作します。

## スクリプト（`apps/web` 内）

| 用途 | コマンド |
| ---- | ---- |
| 開発 | `npm run dev` |
| 型チェック | `npm run typecheck` |
| Lint | `npm run lint` |
| 単体テスト | `npm run test` |
| E2E | `npm run e2e` |
| 本番ビルド | `npm run build` |
| プレビュー | `npm run preview` |

## ライセンス

MIT
