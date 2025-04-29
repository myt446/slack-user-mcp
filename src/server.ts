import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { SlackClient } from './services/slack-client.js';
import { allTools } from './tools/definitions.js';
import { setupToolHandlers } from './tools/handlers.js';

/**
 * MCPサーバーを作成
 * @param slackClient SlackClientインスタンス
 * @returns 設定済みのMCPサーバーインスタンス
 */
export function createServer(slackClient: SlackClient) {
  // サーバーの初期化
  const server = new Server(
    {
      name: "Slack MCP Server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // ツールハンドラーの設定
  const toolHandler = setupToolHandlers(slackClient);

  // ツール実行リクエストのハンドラー
  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      console.error("Received CallToolRequest:", request);
      try {
        if (!request.params.arguments) {
          throw new Error("No arguments provided");
        }

        // ツールを実行して結果を取得
        const result = await toolHandler(request.params.name, request.params.arguments);

        // 結果をJSON文字列化して返す
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: error instanceof Error ? error.message : String(error),
              }),
            },
          ],
        };
      }
    }
  );

  // ツール一覧リクエストのハンドラー
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error("Received ListToolsRequest");
    return { tools: allTools };
  });

  return server;
} 