export type HtmlToDocxFunction = (
  html: string,
  headerHTMLString?: string | undefined,
  options?: {
    table?: { row?: { cantSplit?: boolean } };
    footer?: boolean;
    pageNumber?: boolean;
  },
) => Promise<Blob>;

declare module "html-to-docx" {
  const htmlToDocx: HtmlToDocxFunction;
  export default htmlToDocx;
}
