import { Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * チャンネル一覧取得ツール
 */
export const listChannelsTool: Tool = {
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

/**
 * メッセージ投稿ツール
 */
export const postMessageTool: Tool = {
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

/**
 * スレッド返信ツール
 */
export const replyToThreadTool: Tool = {
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

/**
 * リアクション追加ツール
 */
export const addReactionTool: Tool = {
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

/**
 * チャンネル履歴取得ツール
 */
export const getChannelHistoryTool: Tool = {
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

/**
 * スレッド返信取得ツール
 */
export const getThreadRepliesTool: Tool = {
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

/**
 * ユーザー一覧取得ツール
 */
export const getUsersTool: Tool = {
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

/**
 * ユーザープロファイル取得ツール
 */
export const getUserProfileTool: Tool = {
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

/**
 * メッセージ検索ツール
 */
export const searchMessagesTool: Tool = {
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

/**
 * 情報メッセージ送信ツール
 */
export const sendInfoMessageTool: Tool = {
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

/**
 * 成功メッセージ送信ツール
 */
export const sendSuccessMessageTool: Tool = {
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

/**
 * 警告メッセージ送信ツール
 */
export const sendWarningMessageTool: Tool = {
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

/**
 * エラーメッセージ送信ツール
 */
export const sendErrorMessageTool: Tool = {
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

/**
 * コードスニペット送信ツール
 */
export const sendCodeSnippetTool: Tool = {
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

/**
 * 全ツールの配列
 */
export const allTools = [
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
]; 