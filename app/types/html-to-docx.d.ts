declare module "html-to-docx" {
  function htmlToDocx(
    html: string,
    headerHTMLString?: string | undefined,
    options?: {
      table?: { row?: { cantSplit?: boolean } };
      footer?: boolean;
      pageNumber?: boolean;
    },
  ): Promise<Blob>;

  export default htmlToDocx;
}
