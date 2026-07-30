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
```

**コンテンツの更新は `content/` フォルダ内の JSON ファイルを編集するだけです。**
HTML・CSS・JS を触る必要はありません。

> **JSON の書き方をミスった場合**: サイト上に赤いエラーメッセージが表示されます。カンマの過不足、閉じカッコの漏れなどを確認してください。

> **ライブの日付が過ぎると**: 自動的にトップから消えます。`lives.json` から消す必要はありません。

---

## コンテンツ更新方法

### GitHub の Web UI から編集する場合（推奨）

1. GitHub でこのリポジトリを開く
2. `content/lives.json` をクリック
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
  "description": "補足説明があれば",
  "detail": "18:00〜18:30 バンドA / 18:40〜19:10 Digital Meat / 19:20〜19:50 バンドB",
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
| `date` | Yes | 日付（`YYYY-MM-DD` 形式）。過ぎたら自動で非表示 |
| `open` | No | 開場時間 |
| `start` | No | 開演時間 |
| `venue` | No | 会場名 |
| `address` | No | 住所 |
| `price` | No | 料金 |
| `description` | No | 補足説明（サマリー行にも表示される） |
| `detail` | No | タイムテーブル（`時間 バンド名 / 時間 バンド名` 形式。テーブル表示される） |
| `links` | No | 関連リンクの配列 |
| `visible` | Yes | `true` で表示、`false` で非表示 |

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
python3 -m http.server 8000
# ブラウザで http://localhost:8000 を開く
```
