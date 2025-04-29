# Slack User MCP

ModelContextProtocol (MCP) 用 Slack 統合サーバー。AIアシスタントから Slack API を利用可能にします。

## 機能

- Slack チャンネル一覧の取得
- メッセージの投稿
- スレッドへの返信
- リアクションの追加
- チャンネル履歴の取得
- スレッド返信の取得
- ユーザー一覧とプロファイル情報の取得
- メッセージ検索
- 様々な形式のメッセージ送信（情報、成功、警告、エラー、コードスニペット）

## セットアップ

```bash
# 依存関係のインストール
npm install

# ビルド
npm run build
```

## 環境変数

以下の環境変数を設定する必要があります：

- `SLACK_TOKEN` または `SLACK_BOT_TOKEN`: Slack API トークン
- `SLACK_TEAM_ID`: Slack チームの ID

## 使用方法

```bash
# サーバーの起動
npm start

# 開発モード（変更監視）
npm run dev

# テスト実行
npm test
```

## プロジェクト構造

```
├── src/
│   ├── config/         # 環境変数などの設定
│   ├── types/          # 型定義
│   ├── tools/          # ツール定義とハンドラー
│   ├── services/       # SlackClientクラス
│   ├── utils/          # ユーティリティ関数
│   ├── server.ts       # MCPサーバー設定
│   └── index.ts        # エントリーポイント
├── tests/
│   ├── unit/           # ユニットテスト
│   └── integration/    # 統合テスト
├── jest.config.js      # Jestの設定
└── package.json
```

## ライセンス

ISC
