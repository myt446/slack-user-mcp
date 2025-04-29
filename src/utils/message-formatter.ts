// メッセージをBlockKit形式に変換するユーティリティ関数

/**
 * マークダウンテキストをBlockKit形式に変換する
 * @param text マークダウンテキスト
 * @returns BlockKit形式のブロック配列
 */
export function convertTextToBlocks(text: string): any[] {
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
        processTextContent(textBefore, blocks);
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
        text: "```" + (language ? language : "") + "\n" + codeContent.trim() + "\n```"
      }
    });

    lastIndex = match.index + match[0].length;
  }

  // 残りのテキストを処理
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex).trim();
    if (remainingText) {
      processTextContent(remainingText, blocks);
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

/**
 * 箇条書きのテキストを処理して変換する
 * @param text 箇条書きテキスト
 * @returns 変換後のテキスト
 */
function processListItems(text: string): string {
  const lines = text.split('\n');
  const processedLines = lines.map(line => {
    // アスタリスク記号の箇条書きを変換
    if (line.trim().match(/^\*\s+/)) {
      return line.replace(/^(\s*)\*\s+/, '$1• ');
    }
    // ハイフン記号の箇条書きを変換
    else if (line.trim().match(/^\-\s+/)) {
      return line.replace(/^(\s*)\-\s+/, '$1• ');
    }
    // 数字箇条書きはそのまま保持
    else {
      return line;
    }
  });

  return processedLines.join('\n');
}

/**
 * テキストに箇条書きが含まれているかチェック
 * @param text チェックするテキスト
 * @returns 箇条書きが含まれているかの真偽値
 */
function containsListItems(text: string): boolean {
  const lines = text.split('\n');
  // 行の先頭（インデント可）が * か - か 数字. で始まる行が1つでもあればtrue
  return lines.some(line => line.trim().match(/^(\*|\-|\d+\.)\s+/));
}

/**
 * テキストを分析して適切なBlockKit要素に変換
 * @param text 処理するテキスト
 * @param blocks 変換結果を追加するブロック配列
 */
export function processTextContent(text: string, blocks: any[]): void {
  // 箇条書きのチェック - 単一のセクションとして処理
  if (containsListItems(text) && !text.includes("\n\n")) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: processListItems(text)
      }
    });
    return;
  }

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
      // 箇条書きの処理
      else if (containsListItems(trimmedParagraph)) {
        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: processListItems(trimmedParagraph)
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
    // 行で分割
    const lines = text.split('\n');
    let currentIndex = 0;

    // 見出しの処理
    if (lines[0].startsWith('# ')) {
      blocks.push({
        type: "header",
        text: {
          type: "plain_text",
          text: lines[0].substring(2).trim(),
          emoji: true
        }
      });
      currentIndex = 1;

      // 見出し後の残りのコンテンツがあれば追加
      if (lines.length > 1) {
        const remainingText = lines.slice(currentIndex).join('\n');
        if (containsListItems(remainingText)) {
          blocks.push({
            type: "section",
            text: {
              type: "mrkdwn",
              text: processListItems(remainingText)
            }
          });
        } else {
          blocks.push({
            type: "section",
            text: {
              type: "mrkdwn",
              text: remainingText
            }
          });
        }
      }
    }
    // 中見出しと小見出し
    else if (lines[0].startsWith('## ') || lines[0].startsWith('### ')) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*" + lines[0].replace(/^#+\s+/, '') + "*"
        }
      });
      currentIndex = 1;

      // 見出し後の残りのコンテンツがあれば追加
      if (lines.length > 1) {
        const remainingText = lines.slice(currentIndex).join('\n');
        if (containsListItems(remainingText)) {
          blocks.push({
            type: "section",
            text: {
              type: "mrkdwn",
              text: processListItems(remainingText)
            }
          });
        } else {
          blocks.push({
            type: "section",
            text: {
              type: "mrkdwn",
              text: remainingText
            }
          });
        }
      }
    }
    // 箇条書きの処理
    else if (containsListItems(text)) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: processListItems(text)
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