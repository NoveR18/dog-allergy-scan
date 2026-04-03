export function clsx(
  ...parts: Array<string | number | false | null | undefined>
): string {
  return parts
    .filter((p) => typeof p === "string" || typeof p === "number")
    .join(" ");
}
