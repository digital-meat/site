# Digital Meat 公式ウェブサイト

Digital Meat の日英対応公式サイト。黒とグリーンの既存ターミナル調を継承し、公式ロゴを使用しています。GitHub Pages で公開する静的サイトです。

## 公開ページ

- `/` — 日本語 Home
- `/live/` — 日本語 Live（今後の予定／過去ログ）
- `/about/` — 日本語 About
- `/contact/` — 日本語 Contact
- `/en/` 以下 — 各ページの英語版

初期公開範囲に楽曲一覧、歌詞、制作中音源、News、問い合わせフォームは含めません。

## コンテンツ更新

日常的な情報更新は `content/` 内の JSON を編集します。

```text
content/
  site.json    バンド名、結成日、メンバー、公式SNS
  lives.json   ライブ情報
```

`lives.json` の `visible` が `false` の項目は表示されません。日付を過ぎた項目は削除されず、Live ページの Archive に自動で移ります。今後の予定がない場合は、その旨を案内します。

ライブ情報の基本形式:

```json
{
  "id": "event-2026-09-01",
  "title": "イベント名",
  "date": "2026-09-01",
  "open": "18:00",
  "start": "18:30",
  "venue": "会場名",
  "address": "住所",
  "price": "料金",
  "description": "補足",
  "detail": "18:30 バンドA / 19:10 Digital Meat",
  "links": [
    { "url": "https://example.com/", "label": "イベント詳細" }
  ],
  "visible": true
}
```

## ロゴ

`assets/logo/` には受領原本からコピーした公式透過白ロゴを配置しています。

- `official-b-white.svg` — デスクトップヘッダー
- `official-a-white.svg` — モバイルヘッダー

原本は管理プロジェクトの `assets-inbox/logo-original/` にあり、このリポジトリからは変更しません。

## ローカル確認

リポジトリ直下で:

```bash
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000/` を開きます。`file://` では JSON の読み込みが制限されるため、必ずローカルサーバーを使用してください。

## 公開

GitHub への push と GitHub Pages の公開操作は人間が手動で行います。
