# Ubuntu環境でのセットアップ手順

## 1. Gitのインストールと設定

### Gitのインストール確認
```bash
git --version
```

インストールされていない場合:
```bash
sudo apt update
sudo apt install git -y
```

### Gitの初期設定（初回のみ）
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 2. SSH鍵の設定（推奨）

### SSH鍵の生成
```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
```

Enterキーを3回押してデフォルト設定で作成

### SSH鍵をGitHubに登録
```bash
cat ~/.ssh/id_ed25519.pub
```

表示された公開鍵をコピーして、GitHubの設定に追加:
1. GitHubにログイン
2. Settings → SSH and GPG keys
3. New SSH key をクリック
4. コピーした公開鍵を貼り付けて保存

### SSH接続の確認
```bash
ssh -T git@github.com
```

「Hi username! You've successfully authenticated...」と表示されればOK

## 3. プロジェクトのクローン

### リポジトリをクローン
```bash
# ホームディレクトリに移動（任意）
cd ~

# リポジトリをクローン
git clone git@github.com:olaid/B-Routes.git
# または HTTPS の場合
# git clone https://github.com/your-username/B-Routes.git

# プロジェクトディレクトリに移動
cd B-Routes
```

## 4. Node.jsのインストール

### Node.jsのバージョン確認
```bash
node --version
npm --version
```

インストールされていない、またはバージョンが古い場合:

#### 方法1: NodeSourceリポジトリからインストール（推奨）
```bash
# Node.js 20.x をインストール
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# インストール確認
node --version
npm --version
```

#### 方法2: nvmを使用（複数バージョン管理が必要な場合）
```bash
# nvmのインストール
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# シェルを再読み込み
source ~/.bashrc

# Node.js 20をインストール
nvm install 20
nvm use 20
```

## 5. プロジェクトの依存関係をインストール

```bash
# プロジェクトディレクトリで実行
cd ~/B-Routes

# 依存関係をインストール
npm install
```

## 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスして動作確認

## 7. よく使うコマンド

### 開発サーバーの起動
```bash
npm run dev
```

### プロダクションビルド
```bash
npm run build
```

### ビルド結果のプレビュー
```bash
npm run preview
```

### 最新の変更を取得
```bash
git pull
```

### 変更をコミットしてプッシュ
```bash
git add .
git commit -m "変更内容の説明"
git push
```

## トラブルシューティング

### npm install でエラーが出る場合
```bash
# node_modulesとpackage-lock.jsonを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### ポート5173が既に使用されている場合
```bash
# 使用中のプロセスを確認
lsof -i :5173

# プロセスを終了（PIDを確認して）
kill -9 <PID>
```

### 権限エラーが出る場合
```bash
# node_modulesの権限を修正
sudo chown -R $USER:$USER node_modules
```

## 次のステップ

1. `public/images/routes/` ディレクトリにルート画像を配置
2. `public/data/areas.json` にNotionからエクスポートしたデータを反映
3. 開発を開始！

