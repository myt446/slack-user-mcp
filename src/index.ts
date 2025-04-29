#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { validateEnvironment } from './config/environment.js';
import { SlackClient } from './services/slack-client.js';
import { createServer } from './server.js';
import { fileURLToPath } from 'url';

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

// ESモジュールでのエントリーポイントチェック
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
  import.meta.url.endsWith(process.argv[1]);

if (isMainModule) {
  main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
  });
} 