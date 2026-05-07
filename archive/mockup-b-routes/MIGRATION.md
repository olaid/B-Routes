# Ubuntu環境への移行手順

## 方法1: Gitリポジトリを使用（推奨）

### Windows側での作業

1. **GitHub/GitLabにリポジトリを作成**
   - GitHubまたはGitLabで新しいリモートリポジトリを作成

2. **リモートリポジトリを追加**
   ```bash
   git remote add origin <リポジトリのURL>
   git branch -M main
   git push -u origin main
   ```

### Ubuntu側での作業

1. **リポジトリをクローン**
   ```bash
   git clone <リポジトリのURL>
   cd B-Routes
   ```

2. **依存関係をインストール**
   ```bash
   npm install
   ```

3. **開発サーバーを起動**
   ```bash
   npm run dev
   ```

## 方法2: ファイルを直接コピー

### SCPを使用する場合（SSH接続が必要）

Windows側（PowerShell）:
```powershell
scp -r C:\Users\mori\Desktop\B-Routes user@ubuntu-server:/path/to/destination/
```

### 共有フォルダを使用する場合

1. WindowsとUbuntu間で共有フォルダを設定
2. B-Routesフォルダを共有フォルダにコピー
3. Ubuntu側で共有フォルダからコピー

### USBメモリを使用する場合

1. B-RoutesフォルダをUSBメモリにコピー
2. Ubuntu側でUSBメモリをマウント
3. ファイルをコピー

## 方法3: WSLを使用している場合

WSL内に直接移動:
```bash
# WSL内で
cd /mnt/c/Users/mori/Desktop/B-Routes
```

または、WSL内にコピー:
```bash
cp -r /mnt/c/Users/mori/Desktop/B-Routes ~/B-Routes
```

## 移行後の確認事項

1. **Node.jsのバージョン確認**
   ```bash
   node --version
   npm --version
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **動作確認**
   ```bash
   npm run dev
   ```

4. **画像ファイルの確認**
   - `public/images/routes/` ディレクトリに画像が配置されているか確認
   - 必要に応じて画像をコピー

## 注意事項

- `.git` ディレクトリは既に作成済みです
- `node_modules` は `.gitignore` に含まれているため、移行後は `npm install` が必要です
- 画像ファイル（`public/images/routes/`）はGitに含まれていない場合があるため、別途コピーが必要な場合があります

