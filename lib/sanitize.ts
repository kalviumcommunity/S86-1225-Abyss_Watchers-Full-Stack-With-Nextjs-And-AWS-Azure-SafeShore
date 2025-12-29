import sanitizeHtml from "sanitize-html";

export const sanitizeInput = (input: string): string => {
  if (typeof input !== "string") return input;
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
};

export const sanitizeObjectStrings = (obj: any): any => {
  if (!obj || typeof obj !== "object") return obj;
  const out: any = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    const v = obj[key];
    if (typeof v === "string") out[key] = sanitizeInput(v);
    else if (v && typeof v === "object") out[key] = sanitizeObjectStrings(v);
    else out[key] = v;
  }
  return out;
};

export default sanitizeInput;
