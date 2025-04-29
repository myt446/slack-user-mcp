#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// Type definitions for tool arguments
interface ListChannelsArgs {
  limit?: number;
  cursor?: string;
}

interface PostMessageArgs {
  channel_id: string;
  text: string;
  blocks?: any[];      // 追加：カスタムブロック
  mrkdwn?: boolean;    // 追加：マークダウン形式かどうか
}

interface ReplyToThreadArgs {
  channel_id: string;
  thread_ts: string;
  text: string;
  blocks?: any[];      // 追加：カスタムブロック
  mrkdwn?: boolean;    // 追加：マークダウン形式かどうか
}

interface AddReactionArgs {
  channel_id: string;
  timestamp: string;
  reaction: string;
}

interface GetChannelHistoryArgs {
  channel_id: string;
  limit?: number;
}

interface GetThreadRepliesArgs {
  channel_id: string;
  thread_ts: string;
}

interface GetUsersArgs {
  cursor?: string;
  limit?: number;
}

interface GetUserProfileArgs {
  user_id: string;
}

interface SearchMessagesArgs {
  query: string;
  channel_id?: string;
  channel_name?: string;
  count?: number;
  sort?: string;
  sort_dir?: string;
}

interface MessageOptions {
  blocks?: any[];    // カスタムBlockKit要素
  mrkdwn?: boolean;  // trueの場合マークダウンとして処理
}

// 新しいツールタイプの引数
interface InfoMessageArgs {
  channel_id: string;
  title: string;
  text: string;
  thread_ts?: string;
}

interface CodeSnippetArgs {
  channel_id: string;
  title: string;
  code: string;
  language?: string;
  thread_ts?: string;
}

// Tool definitions
const listChannelsTool: Tool = {
  name: "slack_list_channels",
  description: "List public channels in the workspace with pagination",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description:
          "Maximum number of channels to return (default 100, max 200)",
        default: 100,
      },
      cursor: {
        type: "string",
        description: "Pagination cursor for next page of results",
      },
    },
  },
};

const postMessageTool: Tool = {
  name: "slack_post_message",
  description: "Post a new message to a Slack channel",
  inputSchema: {
    type: "object",
    properties: {
      channel_id: {
        type: "string",
        description: "The ID of the channel to post to",
      },
      text: {
        type: "string",
        description: "The message text to post",
      },
    },
    required: ["channel_id", "text"],
  },
};

const replyToThreadTool: Tool = {
  name: "slack_reply_to_thread",
  description: "Reply to a specific message thread in Slack",
  inputSchema: {
    type: "object",
    properties: {
      channel_id: {
        type: "string",
        description: "The ID of the channel containing the thread",
      },
      thread_ts: {
        type: "string",
        description: "The timestamp of the parent message in the format '1234567890.123456'. Timestamps in the format without the period can be converted by adding the period such that 6 numbers come after it.",
      },
      text: {
        type: "string",
        description: "The reply text",
      },
    },
    required: ["channel_id", "thread_ts", "text"],
  },
};

const addReactionTool: Tool = {
  name: "slack_add_reaction",
  description: "Add a reaction emoji to a message",
  inputSchema: {
    type: "object",
    properties: {
      channel_id: {
        type: "string",
        description: "The ID of the channel containing the message",
      },
      timestamp: {
        type: "string",
        description: "The timestamp of the message to react to",
      },
      reaction: {
        type: "string",
        description: "The name of the emoji reaction (without ::)",
      },
    },
    required: ["channel_id", "timestamp", "reaction"],
  },
};

const getChannelHistoryTool: Tool = {
  name: "slack_get_channel_history",
  description: "Get recent messages from a channel",
  inputSchema: {
    type: "object",
    properties: {
      channel_id: {
        type: "string",
        description: "The ID of the channel",
      },
      limit: {
        type: "number",
        description: "Number of messages to retrieve (default 10)",
        default: 10,
      },
    },
    required: ["channel_id"],
  },
};

const getThreadRepliesTool: Tool = {
  name: "slack_get_thread_replies",
  description: "Get all replies in a message thread",
  inputSchema: {
    type: "object",
    properties: {
      channel_id: {
        type: "string",
        description: "The ID of the channel containing the thread",
      },
      thread_ts: {
        type: "string",
        description: "The timestamp of the parent message in the format '1234567890.123456'. Timestamps in the format without the period can be converted by adding the period such that 6 numbers come after it.",
      },
    },
    required: ["channel_id", "thread_ts"],
  },
};

const getUsersTool: Tool = {
  name: "slack_get_users",
  description:
    "Get a list of all users in the workspace with their basic profile information",
  inputSchema: {
    type: "object",
    properties: {
      cursor: {
        type: "string",
        description: "Pagination cursor for next page of results",
      },
      limit: {
        type: "number",
        description: "Maximum number of users to return (default 100, max 200)",
        default: 100,
      },
    },
  },
};

const getUserProfileTool: Tool = {
  name: "slack_get_user_profile",
  description: "Get detailed profile information for a specific user",
  inputSchema: {
    type: "object",
    properties: {
      user_id: {
        type: "string",
        description: "The ID of the user",
      },
    },
    required: ["user_id"],
  },
};

const searchMessagesTool: Tool = {
  name: "slack_search_messages",
  description: "Slackワークスペース内のメッセージを検索する",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "検索クエリ",
      },
      channel_id: {
        type: "string",
        description: "特定のチャンネルIDで検索を制限（省略可）",
      },
      channel_name: {
        type: "string",
        description: "特定のチャンネル名で検索を制限（省略可、channel_idが優先されます）",
      },
      count: {
        type: "number",
        description: "返す結果の数（デフォルト20、最大100）",
        default: 20,
      },
      sort: {
        type: "string",
        description: "ソート基準（timestamp、score）",
        default: "timestamp",
      },
      sort_dir: {
        type: "string",
        description: "ソート方向（asc、desc）",
        default: "desc",
      },
    },
    required: ["query"],
  },
};

// ここから新しいツール定義を追加
const sendInfoMessageTool: Tool = {
  name: "slack_send_info_message",
  description: "情報メッセージを送信する",
  inputSchema: {
    type: "object",
    properties: {
      channel_id: {
        type: "string",
        description: "送信先チャンネルID",
      },
      title: {
        type: "string",
        description: "メッセージのタイトル",
      },
      text: {
        type: "string",
        description: "メッセージの本文（マークダウン形式可）",
      },
      thread_ts: {
        type: "string",
        description: "返信先のスレッドタイムスタンプ（省略可）",
      },
    },
    required: ["channel_id", "title", "text"],
  },
};

const sendSuccessMessageTool: Tool = {
  name: "slack_send_success_message",
  description: "成功メッセージを送信する",
  inputSchema: {
    type: "object",
    properties: {
      channel_id: {
        type: "string",
        description: "送信先チャンネルID",
      },
      title: {
        type: "string",
        description: "メッセージのタイトル",
      },
      text: {
        type: "string",
        description: "メッセージの本文（マークダウン形式可）",
      },
      thread_ts: {
        type: "string",
        description: "返信先のスレッドタイムスタンプ（省略可）",
      },
    },
    required: ["channel_id", "title", "text"],
  },
};

const sendWarningMessageTool: Tool = {
  name: "slack_send_warning_message",
  description: "警告メッセージを送信する",
  inputSchema: {
    type: "object",
    properties: {
      channel_id: {
        type: "string",
        description: "送信先チャンネルID",
      },
      title: {
        type: "string",
        description: "メッセージのタイトル",
      },
      text: {
        type: "string",
        description: "メッセージの本文（マークダウン形式可）",
      },
      thread_ts: {
        type: "string",
        description: "返信先のスレッドタイムスタンプ（省略可）",
      },
    },
    required: ["channel_id", "title", "text"],
  },
};

const sendErrorMessageTool: Tool = {
  name: "slack_send_error_message",
  description: "エラーメッセージを送信する",
  inputSchema: {
    type: "object",
    properties: {
      channel_id: {
        type: "string",
        description: "送信先チャンネルID",
      },
      title: {
        type: "string",
        description: "メッセージのタイトル",
      },
      text: {
        type: "string",
        description: "メッセージの本文（マークダウン形式可）",
      },
      thread_ts: {
        type: "string",
        description: "返信先のスレッドタイムスタンプ（省略可）",
      },
    },
    required: ["channel_id", "title", "text"],
  },
};

const sendCodeSnippetTool: Tool = {
  name: "slack_send_code_snippet",
  description: "コードスニペットを送信する",
  inputSchema: {
    type: "object",
    properties: {
      channel_id: {
        type: "string",
        description: "送信先チャンネルID",
      },
      title: {
        type: "string",
        description: "スニペットのタイトル",
      },
      code: {
        type: "string",
        description: "コードスニペットの内容",
      },
      language: {
        type: "string",
        description: "コードの言語（省略可）",
      },
      thread_ts: {
        type: "string",
        description: "返信先のスレッドタイムスタンプ（省略可）",
      },
    },
    required: ["channel_id", "code"],
  },
};

class SlackClient {
  private headers: { Authorization: string; "Content-Type": string };
  private isUserToken: boolean;

  constructor(token: string) {
    this.headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    this.isUserToken = token.startsWith('xoxp-');
  }

  async getChannels(limit: number = 100, cursor?: string): Promise<any> {
    const params = new URLSearchParams({
      types: "public_channel",
      exclude_archived: "true",
      limit: Math.min(limit, 200).toString(),
      team_id: process.env.SLACK_TEAM_ID!,
    });

    if (cursor) {
      params.append("cursor", cursor);
    }

    const response = await fetch(
      `https://slack.com/api/conversations.list?${params}`,
      { headers: this.headers },
    );

    return response.json();
  }

  async postMessage(
    channel_id: string,
    text: string,
    options: MessageOptions = {}
  ): Promise<any> {
    // BlockKitブロックを決定
    const blocks = options.blocks ||
      (options.mrkdwn !== false ? this.convertTextToBlocks(text) : null);

    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        channel: channel_id,
        text: text, // 通知用のフォールバックテキスト
        blocks: blocks, // BlockKit形式のブロック
        as_user: this.isUserToken,
        mrkdwn: options.mrkdwn !== false, // デフォルトはtrue
      }),
    });

    return response.json();
  }

  async postReply(
    channel_id: string,
    thread_ts: string,
    text: string,
    options: MessageOptions = {}
  ): Promise<any> {
    // BlockKitブロックを決定
    const blocks = options.blocks ||
      (options.mrkdwn !== false ? this.convertTextToBlocks(text) : null);

    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        channel: channel_id,
        thread_ts: thread_ts,
        text: text, // 通知用のフォールバックテキスト
        blocks: blocks, // BlockKit形式のブロック
        as_user: this.isUserToken,
        mrkdwn: options.mrkdwn !== false, // デフォルトはtrue
      }),
    });

    return response.json();
  }

  // マークダウンテキストをBlockKit形式に変換するヘルパーメソッド
  private convertTextToBlocks(text: string): any[] {
    try {
      // テキストが既にJSON形式のブロック配列かどうかを確認
      const parsedBlocks = JSON.parse(text);
      if (Array.isArray(parsedBlocks) && parsedBlocks.length > 0 && parsedBlocks[0].type) {
        return parsedBlocks;
      }
    } catch (e) {
      // JSONとして解析できない場合は通常のテキストとして扱う
    }

    // コードブロックを分離（```で囲まれたコード）
    const blocks: any[] = [];
    const codeBlockRegex = /```([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // コードブロック前のテキストを処理
      if (match.index > lastIndex) {
        const textBefore = text.substring(lastIndex, match.index).trim();
        if (textBefore) {
          this.processTextContent(textBefore, blocks);
        }
      }

      // コードブロックを追加
      let codeContent = match[1];
      let language = "";

      // 言語指定がある場合は抽出
      const firstLineBreak = codeContent.indexOf('\n');
      if (firstLineBreak > 0) {
        const possibleLang = codeContent.substring(0, firstLineBreak).trim();
        if (possibleLang && !possibleLang.includes(' ')) {
          language = possibleLang;
          codeContent = codeContent.substring(firstLineBreak + 1);
        }
      }

      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "```" + (language ? language : "") + "\n" + codeContent + "```"
        }
      });

      lastIndex = match.index + match[0].length;
    }

    // 残りのテキストを処理
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex).trim();
      if (remainingText) {
        this.processTextContent(remainingText, blocks);
      }
    }

    // ブロックが空の場合は単一のブロックを返す
    if (blocks.length === 0) {
      return [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: text
          }
        }
      ];
    }

    return blocks;
  }

  // テキストを分析して適切なBlockKit要素に変換
  private processTextContent(text: string, blocks: any[]): void {
    // 空行で段落を分割
    if (text.includes("\n\n")) {
      const paragraphs = text.split("\n\n");

      for (const paragraph of paragraphs) {
        const trimmedParagraph = paragraph.trim();
        if (!trimmedParagraph) continue;

        // 見出しの処理
        if (trimmedParagraph.startsWith('# ')) {
          blocks.push({
            type: "header",
            text: {
              type: "plain_text",
              text: trimmedParagraph.substring(2).trim(),
              emoji: true
            }
          });
        }
        // 中見出しと小見出し（BlockKitは一種類のヘッダーしかサポートしないため、セクションとして扱う）
        else if (trimmedParagraph.startsWith('## ') || trimmedParagraph.startsWith('### ')) {
          blocks.push({
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*" + trimmedParagraph.replace(/^#+\s+/, '') + "*"
            }
          });
        }
        // リストの処理（行ごとに * または - で始まるもの）
        else if (/^[*\-]\s+/.test(trimmedParagraph.split('\n')[0])) {
          blocks.push({
            type: "section",
            text: {
              type: "mrkdwn",
              text: trimmedParagraph
            }
          });
        }
        // 引用の処理（> で始まる行）
        else if (trimmedParagraph.startsWith('> ')) {
          blocks.push({
            type: "section",
            text: {
              type: "mrkdwn",
              text: trimmedParagraph
            }
          });
        }
        // 通常のテキストブロック
        else {
          blocks.push({
            type: "section",
            text: {
              type: "mrkdwn",
              text: trimmedParagraph
            }
          });
        }

        // 段落間の区切り（最後の段落には追加しない）
        if (paragraph !== paragraphs[paragraphs.length - 1]) {
          blocks.push({
            type: "divider"
          });
        }
      }
    } else {
      // 単一段落の処理
      // 見出しの処理
      if (text.startsWith('# ')) {
        blocks.push({
          type: "header",
          text: {
            type: "plain_text",
            text: text.substring(2).trim(),
            emoji: true
          }
        });
      }
      // 中見出しと小見出し
      else if (text.startsWith('## ') || text.startsWith('### ')) {
        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*" + text.replace(/^#+\s+/, '') + "*"
          }
        });
      }
      // その他のテキスト
      else {
        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: text
          }
        });
      }
    }
  }

  async addReaction(
    channel_id: string,
    timestamp: string,
    reaction: string,
  ): Promise<any> {
    const response = await fetch("https://slack.com/api/reactions.add", {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        channel: channel_id,
        timestamp: timestamp,
        name: reaction,
      }),
    });

    return response.json();
  }

  async getChannelHistory(
    channel_id: string,
    limit: number = 10,
  ): Promise<any> {
    const params = new URLSearchParams({
      channel: channel_id,
      limit: limit.toString(),
    });

    const response = await fetch(
      `https://slack.com/api/conversations.history?${params}`,
      { headers: this.headers },
    );

    return response.json();
  }

  async getThreadReplies(channel_id: string, thread_ts: string): Promise<any> {
    const params = new URLSearchParams({
      channel: channel_id,
      ts: thread_ts,
    });

    const response = await fetch(
      `https://slack.com/api/conversations.replies?${params}`,
      { headers: this.headers },
    );

    return response.json();
  }

  async getUsers(limit: number = 100, cursor?: string): Promise<any> {
    const params = new URLSearchParams({
      limit: Math.min(limit, 200).toString(),
      team_id: process.env.SLACK_TEAM_ID!,
    });

    if (cursor) {
      params.append("cursor", cursor);
    }

    const response = await fetch(`https://slack.com/api/users.list?${params}`, {
      headers: this.headers,
    });

    return response.json();
  }

  async getUserProfile(user_id: string): Promise<any> {
    const params = new URLSearchParams({
      user: user_id,
      include_labels: "true",
    });

    const response = await fetch(
      `https://slack.com/api/users.profile.get?${params}`,
      { headers: this.headers },
    );

    return response.json();
  }

  async getChannelIdByName(channelName: string): Promise<string | undefined> {
    const response = await this.getChannels(200);
    if (!response.ok) {
      throw new Error(`Failed to get channels: ${response.error}`);
    }
    const channel = response.channels.find(
      (c: any) => c.name === channelName || c.name === channelName.replace('#', '')
    );
    return channel ? channel.id : undefined;
  }

  async searchMessages(
    query: string,
    channel_id?: string,
    count: number = 20,
    sort: string = "timestamp",
    sort_dir: string = "desc"
  ): Promise<any> {
    const params = new URLSearchParams({
      query,
      count: Math.min(count, 100).toString(),
      sort,
      sort_dir,
    });
    if (channel_id) {
      params.append("channel", channel_id);
    }
    const response = await fetch(
      `https://slack.com/api/search.messages?${params}`,
      { headers: this.headers },
    );
    return response.json();
  }

  // 情報メッセージを送信
  async sendInfoMessage(
    channel_id: string,
    title: string,
    text: string,
    thread_ts?: string
  ): Promise<any> {
    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: title,
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: text
        }
      },
      {
        type: "divider"
      }
    ];

    const options = { blocks };

    if (thread_ts) {
      return this.postReply(channel_id, thread_ts, title, options);
    } else {
      return this.postMessage(channel_id, title, options);
    }
  }

  // 成功メッセージを送信
  async sendSuccessMessage(
    channel_id: string,
    title: string,
    text: string,
    thread_ts?: string
  ): Promise<any> {
    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `:white_check_mark: ${title}`,
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: text
        }
      },
      {
        type: "divider"
      }
    ];

    const options = { blocks };

    if (thread_ts) {
      return this.postReply(channel_id, thread_ts, title, options);
    } else {
      return this.postMessage(channel_id, title, options);
    }
  }

  // 警告メッセージを送信
  async sendWarningMessage(
    channel_id: string,
    title: string,
    text: string,
    thread_ts?: string
  ): Promise<any> {
    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `:warning: ${title}`,
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: text
        }
      },
      {
        type: "divider"
      }
    ];

    const options = { blocks };

    if (thread_ts) {
      return this.postReply(channel_id, thread_ts, title, options);
    } else {
      return this.postMessage(channel_id, title, options);
    }
  }

  // エラーメッセージを送信
  async sendErrorMessage(
    channel_id: string,
    title: string,
    text: string,
    thread_ts?: string
  ): Promise<any> {
    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `:x: ${title}`,
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: text
        }
      },
      {
        type: "divider"
      }
    ];

    const options = { blocks };

    if (thread_ts) {
      return this.postReply(channel_id, thread_ts, title, options);
    } else {
      return this.postMessage(channel_id, title, options);
    }
  }

  // コードスニペットを送信
  async sendCodeSnippet(
    channel_id: string,
    title: string,
    code: string,
    language: string = "",
    thread_ts?: string
  ): Promise<any> {
    const codeWithBackticks = "```" + (language ? language + "\n" : "") + code + "```";

    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: title ? `*${title}*` : "コードスニペット"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: codeWithBackticks
        }
      }
    ];

    const options = { blocks };

    if (thread_ts) {
      return this.postReply(channel_id, thread_ts, title || "コードスニペット", options);
    } else {
      return this.postMessage(channel_id, title || "コードスニペット", options);
    }
  }
}

async function main() {
  const token = process.env.SLACK_TOKEN || process.env.SLACK_BOT_TOKEN;
  const teamId = process.env.SLACK_TEAM_ID;

  if (!token || !teamId) {
    console.error(
      "Please set SLACK_TOKEN (or SLACK_BOT_TOKEN) and SLACK_TEAM_ID environment variables",
    );
    process.exit(1);
  }

  console.error("Starting Slack MCP Server...");
  const server = new Server(
    {
      name: "Slack MCP Server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  const slackClient = new SlackClient(token);

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      console.error("Received CallToolRequest:", request);
      try {
        if (!request.params.arguments) {
          throw new Error("No arguments provided");
        }

        switch (request.params.name) {
          case "slack_list_channels": {
            const args = request.params
              .arguments as unknown as ListChannelsArgs;
            const response = await slackClient.getChannels(
              args.limit,
              args.cursor,
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "slack_post_message": {
            const args = request.params.arguments as unknown as PostMessageArgs;
            if (!args.channel_id || !args.text) {
              throw new Error(
                "Missing required arguments: channel_id and text"
              );
            }
            const response = await slackClient.postMessage(
              args.channel_id,
              args.text,
              {
                blocks: args.blocks,
                mrkdwn: args.mrkdwn
              }
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "slack_reply_to_thread": {
            const args = request.params
              .arguments as unknown as ReplyToThreadArgs;
            if (!args.channel_id || !args.thread_ts || !args.text) {
              throw new Error(
                "Missing required arguments: channel_id, thread_ts, and text"
              );
            }
            const response = await slackClient.postReply(
              args.channel_id,
              args.thread_ts,
              args.text,
              {
                blocks: args.blocks,
                mrkdwn: args.mrkdwn
              }
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "slack_add_reaction": {
            const args = request.params.arguments as unknown as AddReactionArgs;
            if (!args.channel_id || !args.timestamp || !args.reaction) {
              throw new Error(
                "Missing required arguments: channel_id, timestamp, and reaction",
              );
            }
            const response = await slackClient.addReaction(
              args.channel_id,
              args.timestamp,
              args.reaction,
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "slack_get_channel_history": {
            const args = request.params
              .arguments as unknown as GetChannelHistoryArgs;
            if (!args.channel_id) {
              throw new Error("Missing required argument: channel_id");
            }
            const response = await slackClient.getChannelHistory(
              args.channel_id,
              args.limit,
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "slack_get_thread_replies": {
            const args = request.params
              .arguments as unknown as GetThreadRepliesArgs;
            if (!args.channel_id || !args.thread_ts) {
              throw new Error(
                "Missing required arguments: channel_id and thread_ts",
              );
            }
            const response = await slackClient.getThreadReplies(
              args.channel_id,
              args.thread_ts,
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "slack_get_users": {
            const args = request.params.arguments as unknown as GetUsersArgs;
            const response = await slackClient.getUsers(
              args.limit,
              args.cursor,
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "slack_get_user_profile": {
            const args = request.params
              .arguments as unknown as GetUserProfileArgs;
            if (!args.user_id) {
              throw new Error("Missing required argument: user_id");
            }
            const response = await slackClient.getUserProfile(args.user_id);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "slack_search_messages": {
            const args = request.params.arguments as unknown as SearchMessagesArgs;
            if (!args.query) {
              throw new Error("Missing required argument: query");
            }
            let channelId: string | undefined = args.channel_id;
            if (!channelId && args.channel_name) {
              channelId = await slackClient.getChannelIdByName(args.channel_name);
              if (!channelId) {
                throw new Error(`Channel not found with name: ${args.channel_name}`);
              }
            }
            const response = await slackClient.searchMessages(
              args.query,
              channelId,
              args.count,
              args.sort,
              args.sort_dir,
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          // 新しいツールのケースを追加
          case "slack_send_info_message": {
            const args = request.params.arguments as unknown as InfoMessageArgs;
            if (!args.channel_id || !args.title || !args.text) {
              throw new Error("Missing required arguments: channel_id, title, and text");
            }
            const response = await slackClient.sendInfoMessage(
              args.channel_id,
              args.title,
              args.text,
              args.thread_ts
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "slack_send_success_message": {
            const args = request.params.arguments as unknown as InfoMessageArgs;
            if (!args.channel_id || !args.title || !args.text) {
              throw new Error("Missing required arguments: channel_id, title, and text");
            }
            const response = await slackClient.sendSuccessMessage(
              args.channel_id,
              args.title,
              args.text,
              args.thread_ts
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "slack_send_warning_message": {
            const args = request.params.arguments as unknown as InfoMessageArgs;
            if (!args.channel_id || !args.title || !args.text) {
              throw new Error("Missing required arguments: channel_id, title, and text");
            }
            const response = await slackClient.sendWarningMessage(
              args.channel_id,
              args.title,
              args.text,
              args.thread_ts
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "slack_send_error_message": {
            const args = request.params.arguments as unknown as InfoMessageArgs;
            if (!args.channel_id || !args.title || !args.text) {
              throw new Error("Missing required arguments: channel_id, title, and text");
            }
            const response = await slackClient.sendErrorMessage(
              args.channel_id,
              args.title,
              args.text,
              args.thread_ts
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "slack_send_code_snippet": {
            const args = request.params.arguments as unknown as CodeSnippetArgs;
            if (!args.channel_id || !args.code) {
              throw new Error("Missing required arguments: channel_id and code");
            }
            const response = await slackClient.sendCodeSnippet(
              args.channel_id,
              args.title || "",
              args.code,
              args.language,
              args.thread_ts
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        console.error("Error executing tool:", error);
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
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error("Received ListToolsRequest");
    return {
      tools: [
        listChannelsTool,
        postMessageTool,
        replyToThreadTool,
        addReactionTool,
        getChannelHistoryTool,
        getThreadRepliesTool,
        getUsersTool,
        getUserProfileTool,
        searchMessagesTool,
        sendInfoMessageTool,
        sendSuccessMessageTool,
        sendWarningMessageTool,
        sendErrorMessageTool,
        sendCodeSnippetTool,
      ],
    };
  });

  const transport = new StdioServerTransport();
  console.error("Connecting server to transport...");
  await server.connect(transport);

  console.error("Slack MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
