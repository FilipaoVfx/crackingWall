export const CHARSETS = {
  standard: ' .:-=+*#%@',
  detailed: ' .\'`^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  blocks: ' ░▒▓█',
  minimal: ' .oO@',
  binary: ' █',
  retro: ' .-+*=#@',
} as const;

export type CharsetName = keyof typeof CHARSETS;

export const DEFAULT_CHARSET: CharsetName = 'standard';
