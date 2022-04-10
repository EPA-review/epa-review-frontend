export function anonymizeText(
  text: string,
  tags: { start: number; end: number; name: string }[]
) {
  const sortedTags = tags?.sort((a, b) => a.start - b.start);

  let result = text;
  let offset = 0;
  sortedTags?.forEach((tag) => {
    const start = tag.start + offset;
    const end = tag.end + offset;

    const previousPart = result.substring(0, start);
    const replacingPart = result.substring(start, end);
    const nextPart = result.substring(end);

    result = `${previousPart}${tag.name}${nextPart}`;
    offset += tag.name.length - replacingPart.length;
  });

  return result;
}
