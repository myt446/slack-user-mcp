// Type definitions for tool arguments
export interface ListChannelsArgs {
  limit?: number;
  cursor?: string;
}

export interface PostMessageArgs {
  channel_id: string;
  text: string;
  blocks?: any[];      // カスタムブロック
  mrkdwn?: boolean;    // マークダウン形式かどうか
}

export interface ReplyToThreadArgs {
  channel_id: string;
  thread_ts: string;
  text: string;
  blocks?: any[];      // カスタムブロック
  mrkdwn?: boolean;    // マークダウン形式かどうか
}

export interface AddReactionArgs {
  channel_id: string;
  timestamp: string;
  reaction: string;
}

export interface GetChannelHistoryArgs {
  channel_id: string;
  limit?: number;
}

export interface GetThreadRepliesArgs {
  channel_id: string;
  thread_ts: string;
}

export interface GetUsersArgs {
  cursor?: string;
  limit?: number;
}

export interface GetUserProfileArgs {
  user_id: string;
}

export interface SearchMessagesArgs {
  query: string;
  channel_id?: string;
  channel_name?: string;
  count?: number;
  sort?: string;
  sort_dir?: string;
}

export interface MessageOptions {
  blocks?: any[];    // カスタムBlockKit要素
  mrkdwn?: boolean;  // trueの場合マークダウンとして処理
}

// 各特殊メッセージタイプの引数
export interface InfoMessageArgs {
  channel_id: string;
  title: string;
  text: string;
  thread_ts?: string;
}

export interface CodeSnippetArgs {
  channel_id: string;
  title: string;
  code: string;
  language?: string;
  thread_ts?: string;
} 