import type { TextChunk } from "./knowledgeTypes";

export function chunkText(text: string, maxCharacters = 1000): TextChunk[] {
  if (!text || !text.trim()) return [];

  const chunks: TextChunk[] = [];
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  let position = 0;
  let chunkIndex = 0;

  while (position < normalized.length) {
    let end = Math.min(position + maxCharacters, normalized.length);

    if (end < normalized.length) {
      const minEnd = position + Math.floor(maxCharacters * 0.4);

      // Prefer paragraph boundary
      const paraBreak = normalized.lastIndexOf("\n\n", end);
      if (paraBreak > minEnd) {
        end = paraBreak;
      } else {
        // Prefer sentence boundary
        const sentenceBreak = Math.max(
          normalized.lastIndexOf(". ", end),
          normalized.lastIndexOf("! ", end),
          normalized.lastIndexOf("? ", end),
          normalized.lastIndexOf(".\n", end)
        );
        if (sentenceBreak > minEnd) {
          end = sentenceBreak + 1;
        } else {
          // Word boundary fallback
          const wordBreak = normalized.lastIndexOf(" ", end);
          if (wordBreak > minEnd) end = wordBreak;
        }
      }
    }

    const content = normalized.slice(position, end).trim();
    if (content) {
      chunks.push({ chunkIndex, content, charStart: position, charEnd: end });
      chunkIndex++;
    }

    position = end + 1;
    if (position >= normalized.length) break;
  }

  return chunks;
}
