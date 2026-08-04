type HighlightTextProps = {
  query: string;
  text: string;
};

export function HighlightText({ query, text }: HighlightTextProps) {
  if (!query) return text;

  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-[#FDE68A]/70 px-0.5 text-[#0F172A]">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}
