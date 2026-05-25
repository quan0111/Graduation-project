type DateInput = string | number | Date | null | undefined;

const pad = (value: number) => String(value).padStart(2, "0");

const parseDate = (value: DateInput) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value: DateInput, fallback = "-") => {
  const date = parseDate(value);
  if (!date) return fallback;

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

export const formatDateTime = (value: DateInput, fallback = "-") => {
  const date = parseDate(value);
  if (!date) return fallback;

  return `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const formatShortDateTime = (value: DateInput, fallback = "-") => {
  const date = parseDate(value);
  if (!date) return fallback;

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
