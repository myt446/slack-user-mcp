/**
 * 必要な環境変数が設定されているか確認し、設定されていればそれらを返す
 * @returns トークンとチームIDのオブジェクト
 */
export function validateEnvironment() {
  const token = process.env.SLACK_TOKEN || process.env.SLACK_BOT_TOKEN;
  const teamId = process.env.SLACK_TEAM_ID;

  if (!token || !teamId) {
    throw new Error("環境変数 SLACK_TOKEN（またはSLACK_BOT_TOKEN）とSLACK_TEAM_IDを設定してください");
  }

  return { token, teamId };
} 