import { SlackClient } from '../../../src/services/slack-client.js';
import { jest } from '@jest/globals';

// グローバルなfetchのモック
global.fetch = jest.fn();

describe('SlackClient', () => {
  let slackClient: SlackClient;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.SLACK_TEAM_ID = 'test-team-id';
    slackClient = new SlackClient('test-token');
  });

  describe('getChannels', () => {
    it('should call the Slack API and return channels', async () => {
      const mockResponse = { ok: true, channels: [{ id: 'C123', name: 'general' }] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await slackClient.getChannels();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('conversations.list'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('postMessage', () => {
    it('should post a message to a channel', async () => {
      const mockResponse = { ok: true, ts: '1234.5678' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await slackClient.postMessage('C123', 'Hello, world!');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://slack.com/api/chat.postMessage',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Hello, world!')
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('sendInfoMessage', () => {
    it('should send an info message with the correct format', async () => {
      const mockResponse = { ok: true, ts: '1234.5678' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await slackClient.sendInfoMessage('C123', 'Info Title', 'Info Message');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://slack.com/api/chat.postMessage',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Info Title')
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getChannelIdByName', () => {
    it('should return the channel ID for a given channel name', async () => {
      const mockResponse = {
        ok: true,
        channels: [
          { id: 'C123', name: 'general' },
          { id: 'C456', name: 'random' }
        ]
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await slackClient.getChannelIdByName('random');

      expect(result).toEqual('C456');
    });

    it('should handle channel names with # prefix', async () => {
      const mockResponse = {
        ok: true,
        channels: [
          { id: 'C123', name: 'general' },
          { id: 'C456', name: 'random' }
        ]
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await slackClient.getChannelIdByName('#random');

      expect(result).toEqual('C456');
    });
  });
}); 