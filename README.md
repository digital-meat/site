# Digital Meat 公式ウェブサイト

黒背景 + 緑文字のターミナル風バンドホームページ。GitHub Pages でホスティング。

## ファイル構成

```
index.html          ... メインページ（編集不要）
style.css           ... スタイル（編集不要）
app.js              ... レンダリング処理（編集不要）
content/
  site.json         ... バンド情報・メンバー・SNSリンク
  lives.json        ... ライブ情報
  news.json         ... ニュース・お知らせ
  images/           ... フライヤー画像などを格納
```

**コンテンツの更新は `content/` フォルダ内の JSON ファイルを編集するだけです。**
HTML・CSS・JS を触る必要はありません。

---

## コンテンツ更新方法

### GitHub の Web UI から編集する場合（推奨）

1. GitHub でこのリポジトリを開く
2. `content/lives.json` や `content/news.json` をクリック
3. 右上の鉛筆アイコン（Edit this file）をクリック
4. JSON を編集
5. 「Commit changes」ボタンで保存

### ライブ情報を追加する (`content/lives.json`)

`lives` 配列に以下の形式でオブジェクトを追加：

```json
{
  "id": "event-2026-04-01",
  "title": "ライブタイトル",
  "date": "2026-04-01",
  "open": "18:00",
  "start": "18:30",
  "venue": "会場名",
  "address": "住所",
  "price": "前売 ¥3,000 / 当日 ¥3,500（+1D ¥600）",
  "flyer": "content/images/event-2026-04-01.jpg",
  "description": "補足説明があれば",
  "links": [
    { "url": "https://example.com/ticket", "label": "チケット予約" }
  ],
  "visible": true
}
```

| フィールド | 必須 | 説明 |
|---|---|---|
| `id` | Yes | ユニークな識別子（何でもOK） |
| `title` | Yes | ライブ/イベント名 |
| `date` | Yes | 日付（`YYYY-MM-DD` 形式） |
| `open` | No | 開場時間 |
| `start` | No | 開演時間 |
| `venue` | No | 会場名 |
| `address` | No | 住所 |
| `price` | No | 料金 |
| `flyer` | No | フライヤー画像のパス |
| `description` | No | 補足説明 |
| `links` | No | 関連リンクの配列 |
| `visible` | Yes | `true` で表示、`false` で非表示 |

### フライヤー画像をアップロードする

1. GitHub で `content/images/` フォルダを開く
2. 「Add file」→「Upload files」で画像をアップロード
3. `lives.json` の `flyer` フィールドにパスを設定（例: `"content/images/live-2026-04-01.jpg"`）

### ニュースを追加する (`content/news.json`)

`news` 配列に以下の形式で追加：

```json
{
  "id": "news-id",
  "date": "2026-03-01",
  "title": "ニュースタイトル",
  "body": "ニュース本文をここに書く。",
  "visible": true
}
```

### メンバー情報・SNS を編集する (`content/site.json`)

`members` 配列や `sns` 配列を直接編集してください。

---

## GitHub Pages の設定

1. リポジトリの Settings → Pages を開く
2. Source を「Deploy from a branch」にする
3. Branch を `main`（または使用するブランチ）、フォルダを `/ (root)` に設定
4. Save

---

## ローカルでの確認

```bash
# Python が入っている場合
python3 -m http.server 8000

# ブラウザで http://localhost:8000 を開く
```
