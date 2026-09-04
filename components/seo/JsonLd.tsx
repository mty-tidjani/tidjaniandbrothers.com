export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Escape `<` so a value containing "</script>" can't prematurely close
      // this tag. `data` is always built server-side from our own DB content
      // (admin-authored, same trust boundary as contentHtml elsewhere).
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
