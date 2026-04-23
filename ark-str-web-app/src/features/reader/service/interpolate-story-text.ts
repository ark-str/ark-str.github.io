const nicknamePattern = /\{@nickname\}/gi;

export function interpolateStoryText(text: string, variables: { nickName: string }) {
  return text.replace(nicknamePattern, () => variables.nickName);
}
