import { gmail_v1 } from "googleapis";
import { TEmailMessage } from "../../types/email.type";

const decodeQuotedPrintableBytes = (value: string): Buffer =>
  Buffer.from(
    value.replace(/=([0-9A-Fa-f]{2})/g, (_, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    ),
    "binary",
  );

const decodeEncodedWord = (word: string): string => {
  const match = /^=\?([^?]+)\?([BbQq])\?([^?]*)\?=$/.exec(word);
  if (!match) return word;

  const charset = match[1];
  const encoding = match[2];
  const text = match[3];

  if (!charset || !encoding || text === undefined) return word;

  try {
    const bytes =
      encoding.toUpperCase() === "B"
        ? Buffer.from(text, "base64")
        : decodeQuotedPrintableBytes(text.replace(/_/g, " "));

    return new TextDecoder(charset).decode(bytes);
  } catch {
    return word;
  }
};

const decodeMimeWords = (value: string): string =>
  value.replace(/=\?[^?]+\?[BbQq]\?[^?]*\?=/g, (word) =>
    decodeEncodedWord(word),
  );

const findHeader = (
  headers: gmail_v1.Schema$MessagePartHeader[] | undefined,
  name: string,
): string =>
  decodeMimeWords(
    headers?.find((header) => header.name?.toLowerCase() === name.toLowerCase())
      ?.value ?? "",
  );

const decodeBody = (data: string | null | undefined): string =>
  data ? Buffer.from(data, "base64url").toString("utf8") : "";

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

const stripHtml = (html: string): string =>
  decodeHtmlEntities(
    html
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();

const collectBodies = (
  part: gmail_v1.Schema$MessagePart | undefined,
  collected: { plain: string[]; html: string[] },
): void => {
  if (!part) return;

  const isContainer = Boolean(part.mimeType?.startsWith("multipart/"));
  const isAttachment = Boolean(part.filename);
  const decoded =
    isContainer || isAttachment ? "" : decodeBody(part.body?.data);

  if (decoded) {
    if (part.mimeType === "text/html") {
      collected.html.push(decoded);
    } else if (!part.mimeType || part.mimeType === "text/plain") {
      collected.plain.push(decoded);
    }
  }

  part.parts?.forEach((child) => collectBodies(child, collected));
};

const parseReceivedAt = (message: gmail_v1.Schema$Message): Date => {
  const headerDate = new Date(findHeader(message.payload?.headers, "date"));

  if (!Number.isNaN(headerDate.getTime())) return headerDate;

  const internalDate = message.internalDate
    ? Number(message.internalDate)
    : Number.NaN;

  return Number.isNaN(internalDate) ? new Date() : new Date(internalDate);
};

export const parseGmailMessage = (
  message: gmail_v1.Schema$Message,
): TEmailMessage => {
  const headers = message.payload?.headers;
  const collected: { plain: string[]; html: string[] } = {
    plain: [],
    html: [],
  };

  collectBodies(message.payload, collected);

  const html = collected.html.join("\n") || null;
  const body = (
    collected.plain.join("\n") ||
    (html ? stripHtml(html) : "") ||
    message.snippet ||
    ""
  ).trim();

  return {
    id: message.id ?? "",
    threadId: message.threadId ?? "",
    from: findHeader(headers, "from"),
    to: findHeader(headers, "to")
      .split(",")
      .map((recipient) => recipient.trim())
      .filter(Boolean),
    subject: findHeader(headers, "subject"),
    body,
    html,
    snippet: message.snippet ?? "",
    receivedAt: parseReceivedAt(message),
    labels: message.labelIds ?? [],
  };
};
