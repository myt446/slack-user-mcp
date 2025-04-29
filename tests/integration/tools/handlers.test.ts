// import { SlackClient } from '../../../src/services/slack-client.js';
import { SlackClient } from '../../../src/services/slack-client';
import { setupToolHandlers } from '../../../src/tools/handlers';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// SlackClientのメソッドをモック
jest.mock('../../../src/services/slack-client', () => {
  const originalModule = jest.requireActual('../../../src/services/slack-client');

  return {
    ...originalModule,
    SlackClient: function () {
      return {
        getChannels: jest.fn().mockResolvedValue({ ok: true, channels: [] }),
        postMessage: jest.fn().mockResolvedValue({ ok: true, ts: '1234.5678' }),
        postReply: jest.fn().mockResolvedValue({ ok: true, ts: '1234.5678' }),
        addReaction: jest.fn().mockResolvedValue({ ok: true }),
        getChannelHistory: jest.fn().mockResolvedValue({ ok: true, messages: [] }),
        getThreadReplies: jest.fn().mockResolvedValue({ ok: true, messages: [] }),
        getUsers: jest.fn().mockResolvedValue({ ok: true, members: [] }),
        getUserProfile: jest.fn().mockResolvedValue({ ok: true, profile: {} }),
        getChannelIdByName: jest.fn().mockResolvedValue('C123'),
        searchMessages: jest.fn().mockResolvedValue({ ok: true, messages: { matches: [] } }),
        sendInfoMessage: jest.fn().mockResolvedValue({ ok: true, ts: '1234.5678' }),
        sendSuccessMessage: jest.fn().mockResolvedValue({ ok: true, ts: '1234.5678' }),
        sendWarningMessage: jest.fn().mockResolvedValue({ ok: true, ts: '1234.5678' }),
        sendErrorMessage: jest.fn().mockResolvedValue({ ok: true, ts: '1234.5678' }),
        sendCodeSnippet: jest.fn().mockResolvedValue({ ok: true, ts: '1234.5678' })
      };
    }
  };
});

describe('Tool Handlers', () => {
  let slackClient: any;
  let handleTool: ReturnType<typeof setupToolHandlers>;

  beforeEach(() => {
    jest.clearAllMocks();
    slackClient = new SlackClient('test-token');
    handleTool = setupToolHandlers(slackClient);
  });

  describe('slack_list_channels', () => {
    it('should call getChannels with correct parameters', async () => {
      await handleTool('slack_list_channels', { limit: 50, cursor: 'next_cursor' });

      expect(slackClient.getChannels).toHaveBeenCalledWith(50, 'next_cursor');
    });
  });

  describe('slack_post_message', () => {
    it('should call postMessage with correct parameters', async () => {
      await handleTool('slack_post_message', {
        channel_id: 'C123',
        text: 'Hello, world!',
        mrkdwn: true
      });

      expect(slackClient.postMessage).toHaveBeenCalledWith(
        'C123',
        'Hello, world!',
        { blocks: undefined, mrkdwn: true }
      );
    });

    it('should throw error if required parameters are missing', async () => {
      const result = await handleTool('slack_post_message', { channel_id: 'C123' });

      expect(result).toHaveProperty('error');
      expect(result.error).toContain('Missing required arguments');
    });
  });

  describe('slack_send_info_message', () => {
    it('should call sendInfoMessage with correct parameters', async () => {
      await handleTool('slack_send_info_message', {
        channel_id: 'C123',
        title: 'Info Title',
        text: 'Info Message',
        thread_ts: '1234.5678'
      });

      expect(slackClient.sendInfoMessage).toHaveBeenCalledWith(
        'C123',
        'Info Title',
        'Info Message',
        '1234.5678'
      );
    });
  });

  describe('slack_search_messages', () => {
    it('should handle channel_name parameter', async () => {
      await handleTool('slack_search_messages', {
        query: 'search term',
        channel_name: 'general'
      });

      expect(slackClient.getChannelIdByName).toHaveBeenCalledWith('general');
      expect(slackClient.searchMessages).toHaveBeenCalledWith(
        'search term',
        'C123',
        undefined,
        undefined,
        undefined
      );
    });
  });
}); 