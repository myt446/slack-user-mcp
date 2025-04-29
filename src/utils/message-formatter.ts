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
        text: "```" + (language ? language : "") + "\n" + codeContent + "```"
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
 * テキストを分析して適切なBlockKit要素に変換
 * @param text 処理するテキスト
 * @param blocks 変換結果を追加するブロック配列
 */
export function processTextContent(text: string, blocks: any[]): void {
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