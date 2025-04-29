#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { validateEnvironment } from './config/environment.js';
import { SlackClient } from './services/slack-client.js';
import { createServer } from './server.js';

/**
 * メインアプリケーション関数
 */
export async function main() {
  try {
    // 環境変数のバリデーション
    const { token, teamId } = validateEnvironment();
    console.error("Starting Slack MCP Server...");

    // Slackクライアントの作成
    const slackClient = new SlackClient(token);

    // サーバーの作成
    const server = createServer(slackClient);

    // 標準入出力トランスポートの作成と接続
    const transport = new StdioServerTransport();
    console.error("Connecting server to transport...");
    await server.connect(transport);

    console.error("Slack MCP Server running on stdio");
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

// このifチェックを追加することでテスト時に自動実行を防ぎます
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
  });
} 