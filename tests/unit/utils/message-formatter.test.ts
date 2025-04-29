import { convertTextToBlocks, processTextContent } from '../../../src/utils/message-formatter';
import { describe, it, expect } from '@jest/globals';

describe('MessageFormatter', () => {
  describe('convertTextToBlocks', () => {
    it('should convert simple text to a section block', () => {
      const text = 'Hello, world!';
      const result = convertTextToBlocks(text);

      expect(result).toEqual([
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Hello, world!'
          }
        }
      ]);
    });

    it('should handle JSON blocks if provided', () => {
      const jsonBlocks = JSON.stringify([
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'This is a JSON block'
          }
        }
      ]);

      const result = convertTextToBlocks(jsonBlocks);

      expect(result).toEqual([
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'This is a JSON block'
          }
        }
      ]);
    });

    it('should handle headings', () => {
      const text = '# Main Heading\nContent';
      const result = convertTextToBlocks(text);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Main Heading',
          emoji: true
        }
      });
    });

    it('should handle code blocks', () => {
      const text = 'Some text\n```\nconst x = 1;\n```\nMore text';
      const result = convertTextToBlocks(text);

      expect(result).toHaveLength(3);
      expect(result[1]).toEqual({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '```\nconst x = 1;\n```'
        }
      });
    });

    it('should handle code blocks with language', () => {
      const text = 'Some text\n```javascript\nconst x = 1;\n```\nMore text';
      const result = convertTextToBlocks(text);

      expect(result[1]).toEqual({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '```javascript\nconst x = 1;\n```'
        }
      });
    });
  });

  describe('processTextContent', () => {
    it('should process headers', () => {
      const blocks: any[] = [];
      processTextContent('# Header', blocks);

      expect(blocks).toEqual([
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'Header',
            emoji: true
          }
        }
      ]);
    });

    it('should process paragraphs with dividers', () => {
      const blocks: any[] = [];
      processTextContent('Paragraph 1\n\nParagraph 2', blocks);

      expect(blocks).toHaveLength(3); // 2 paragraphs + 1 divider
      expect(blocks[1]).toEqual({ type: 'divider' });
    });
  });
}); 