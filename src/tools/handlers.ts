import { SlackClient } from '../services/slack-client.js';
import {
  ListChannelsArgs,
  PostMessageArgs,
  ReplyToThreadArgs,
  AddReactionArgs,
  GetChannelHistoryArgs,
  GetThreadRepliesArgs,
  GetUsersArgs,
  GetUserProfileArgs,
  SearchMessagesArgs,
  InfoMessageArgs,
  CodeSnippetArgs
} from '../types/slack.js';

/**
 * ツールのハンドリング関数を設定する
 * @param slackClient SlackClientインスタンス
 * @returns ツール名と引数から適切な処理を実行して結果を返す関数
 */
export function setupToolHandlers(slackClient: SlackClient) {
  /**
   * ツールを実行する関数
   * @param toolName ツール名
   * @param args ツール引数
   * @returns ツール実行結果
   */
  return async (toolName: string, args: any) => {
    try {
      switch (toolName) {
        case "slack_list_channels": {
          const typedArgs = args as ListChannelsArgs;
          return await slackClient.getChannels(typedArgs.limit, typedArgs.cursor);
        }

        case "slack_post_message": {
          const typedArgs = args as PostMessageArgs;
          const missingArgs = [];
          if (!typedArgs.channel_id) missingArgs.push('channel_id');
          if (!typedArgs.text) missingArgs.push('text');

          if (missingArgs.length > 0) {
            throw new Error(`Missing required arguments: ${missingArgs.join(' and ')}`);
          }

          return await slackClient.postMessage(
            typedArgs.channel_id,
            typedArgs.text,
            {
              blocks: typedArgs.blocks,
              mrkdwn: typedArgs.mrkdwn
            }
          );
        }

        case "slack_reply_to_thread": {
          const typedArgs = args as ReplyToThreadArgs;
          if (!typedArgs.channel_id || !typedArgs.thread_ts || !typedArgs.text) {
            throw new Error("Missing required arguments: channel_id, thread_ts, and text");
          }
          return await slackClient.postReply(
            typedArgs.channel_id,
            typedArgs.thread_ts,
            typedArgs.text,
            {
              blocks: typedArgs.blocks,
              mrkdwn: typedArgs.mrkdwn
            }
          );
        }

        case "slack_add_reaction": {
          const typedArgs = args as AddReactionArgs;
          if (!typedArgs.channel_id || !typedArgs.timestamp || !typedArgs.reaction) {
            throw new Error("Missing required arguments: channel_id, timestamp, and reaction");
          }
          return await slackClient.addReaction(
            typedArgs.channel_id,
            typedArgs.timestamp,
            typedArgs.reaction
          );
        }

        case "slack_get_channel_history": {
          const typedArgs = args as GetChannelHistoryArgs;
          if (!typedArgs.channel_id) {
            throw new Error("Missing required argument: channel_id");
          }
          return await slackClient.getChannelHistory(
            typedArgs.channel_id,
            typedArgs.limit
          );
        }

        case "slack_get_thread_replies": {
          const typedArgs = args as GetThreadRepliesArgs;
          if (!typedArgs.channel_id || !typedArgs.thread_ts) {
            throw new Error("Missing required arguments: channel_id and thread_ts");
          }
          return await slackClient.getThreadReplies(
            typedArgs.channel_id,
            typedArgs.thread_ts
          );
        }

        case "slack_get_users": {
          const typedArgs = args as GetUsersArgs;
          return await slackClient.getUsers(
            typedArgs.limit,
            typedArgs.cursor
          );
        }

        case "slack_get_user_profile": {
          const typedArgs = args as GetUserProfileArgs;
          if (!typedArgs.user_id) {
            throw new Error("Missing required argument: user_id");
          }
          return await slackClient.getUserProfile(typedArgs.user_id);
        }

        case "slack_search_messages": {
          const typedArgs = args as SearchMessagesArgs;
          if (!typedArgs.query) {
            throw new Error("Missing required argument: query");
          }
          let channelId: string | undefined = typedArgs.channel_id;
          if (!channelId && typedArgs.channel_name) {
            channelId = await slackClient.getChannelIdByName(typedArgs.channel_name);
            if (!channelId) {
              throw new Error(`Channel not found with name: ${typedArgs.channel_name}`);
            }
          }
          return await slackClient.searchMessages(
            typedArgs.query,
            channelId,
            typedArgs.count,
            typedArgs.sort,
            typedArgs.sort_dir
          );
        }

        case "slack_send_info_message": {
          const typedArgs = args as InfoMessageArgs;
          if (!typedArgs.channel_id || !typedArgs.title || !typedArgs.text) {
            throw new Error("Missing required arguments: channel_id, title, and text");
          }
          return await slackClient.sendInfoMessage(
            typedArgs.channel_id,
            typedArgs.title,
            typedArgs.text,
            typedArgs.thread_ts
          );
        }

        case "slack_send_success_message": {
          const typedArgs = args as InfoMessageArgs;
          if (!typedArgs.channel_id || !typedArgs.title || !typedArgs.text) {
            throw new Error("Missing required arguments: channel_id, title, and text");
          }
          return await slackClient.sendSuccessMessage(
            typedArgs.channel_id,
            typedArgs.title,
            typedArgs.text,
            typedArgs.thread_ts
          );
        }

        case "slack_send_warning_message": {
          const typedArgs = args as InfoMessageArgs;
          if (!typedArgs.channel_id || !typedArgs.title || !typedArgs.text) {
            throw new Error("Missing required arguments: channel_id, title, and text");
          }
          return await slackClient.sendWarningMessage(
            typedArgs.channel_id,
            typedArgs.title,
            typedArgs.text,
            typedArgs.thread_ts
          );
        }

        case "slack_send_error_message": {
          const typedArgs = args as InfoMessageArgs;
          if (!typedArgs.channel_id || !typedArgs.title || !typedArgs.text) {
            throw new Error("Missing required arguments: channel_id, title, and text");
          }
          return await slackClient.sendErrorMessage(
            typedArgs.channel_id,
            typedArgs.title,
            typedArgs.text,
            typedArgs.thread_ts
          );
        }

        case "slack_send_code_snippet": {
          const typedArgs = args as CodeSnippetArgs;
          if (!typedArgs.channel_id || !typedArgs.code) {
            throw new Error("Missing required arguments: channel_id and code");
          }
          return await slackClient.sendCodeSnippet(
            typedArgs.channel_id,
            typedArgs.title || "",
            typedArgs.code,
            typedArgs.language,
            typedArgs.thread_ts
          );
        }

        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error) {
      console.error("Error executing tool:", error);
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };
} 