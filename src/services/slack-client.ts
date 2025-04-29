// import { MessageOptions } from '@/types/slack';
// import { convertTextToBlocks } from '@/utils/message-formatter';

import { MessageOptions } from "@/types/slack.js";
import { convertTextToBlocks } from "@/utils/message-formatter.js";

/**
 * Slack APIとの通信を担当するクライアントクラス
 */
export class SlackClient {
  private headers: { Authorization: string; "Content-Type": string };
  private isUserToken: boolean;

  /**
   * @param token Slack APIトークン
   */
  constructor(token: string) {
    this.headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    this.isUserToken = token.startsWith('xoxp-');
  }

  /**
   * 公開チャンネル一覧を取得
   * @param limit 取得数上限
   * @param cursor ページネーション用カーソル
   * @returns チャンネル一覧のレスポンス
   */
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

  /**
   * チャンネルにメッセージを投稿
   * @param channel_id チャンネルID
   * @param text メッセージテキスト
   * @param options メッセージオプション
   * @returns Slack APIレスポンス
   */
  async postMessage(
    channel_id: string,
    text: string,
    options: MessageOptions = {}
  ): Promise<any> {
    // BlockKitブロックを決定
    const blocks = options.blocks ||
      (options.mrkdwn !== false ? convertTextToBlocks(text) : null);

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

  /**
   * スレッドに返信
   * @param channel_id チャンネルID
   * @param thread_ts 親メッセージのタイムスタンプ
   * @param text 返信テキスト
   * @param options メッセージオプション
   * @returns Slack APIレスポンス
   */
  async postReply(
    channel_id: string,
    thread_ts: string,
    text: string,
    options: MessageOptions = {}
  ): Promise<any> {
    // BlockKitブロックを決定
    const blocks = options.blocks ||
      (options.mrkdwn !== false ? convertTextToBlocks(text) : null);

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

  /**
   * メッセージにリアクションを追加
   * @param channel_id チャンネルID
   * @param timestamp メッセージのタイムスタンプ
   * @param reaction リアクション絵文字名
   * @returns Slack APIレスポンス
   */
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

  /**
   * チャンネルの履歴を取得
   * @param channel_id チャンネルID
   * @param limit 取得数上限
   * @returns チャンネル履歴のレスポンス
   */
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

  /**
   * スレッドの返信を取得
   * @param channel_id チャンネルID
   * @param thread_ts 親メッセージのタイムスタンプ
   * @returns スレッド返信のレスポンス
   */
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

  /**
   * ユーザー一覧を取得
   * @param limit 取得数上限
   * @param cursor ページネーション用カーソル
   * @returns ユーザー一覧のレスポンス
   */
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

  /**
   * ユーザープロファイルを取得
   * @param user_id ユーザーID
   * @returns ユーザープロファイルのレスポンス
   */
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

  /**
   * チャンネル名からIDを取得
   * @param channelName チャンネル名
   * @returns チャンネルID
   */
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

  /**
   * メッセージを検索
   * @param query 検索クエリ
   * @param channel_id チャンネルID
   * @param count 取得数上限
   * @param sort ソート順
   * @param sort_dir ソート方向
   * @returns 検索結果のレスポンス
   */
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

  /**
   * 情報メッセージを送信
   * @param channel_id チャンネルID
   * @param title タイトル
   * @param text メッセージ本文
   * @param thread_ts スレッドのタイムスタンプ
   * @returns Slack APIレスポンス
   */
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

  /**
   * 成功メッセージを送信
   * @param channel_id チャンネルID
   * @param title タイトル
   * @param text メッセージ本文
   * @param thread_ts スレッドのタイムスタンプ
   * @returns Slack APIレスポンス
   */
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

  /**
   * 警告メッセージを送信
   * @param channel_id チャンネルID
   * @param title タイトル
   * @param text メッセージ本文
   * @param thread_ts スレッドのタイムスタンプ
   * @returns Slack APIレスポンス
   */
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

  /**
   * エラーメッセージを送信
   * @param channel_id チャンネルID
   * @param title タイトル
   * @param text メッセージ本文
   * @param thread_ts スレッドのタイムスタンプ
   * @returns Slack APIレスポンス
   */
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

  /**
   * コードスニペットを送信
   * @param channel_id チャンネルID
   * @param title タイトル
   * @param code コード内容
   * @param language プログラミング言語
   * @param thread_ts スレッドのタイムスタンプ
   * @returns Slack APIレスポンス
   */
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