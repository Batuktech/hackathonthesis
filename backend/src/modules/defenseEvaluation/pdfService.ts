import { PDFParse } from "pdf-parse";
import { AppError } from "../../shared/errors";

const MAX_CHARS = 60000;

export async function extractPdfText(buffer: Buffer): Promise<string> {
  let parser: PDFParse | null = null;
  try {
    parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    const text = result.text
      .replace(/^-- \d+ of \d+ --$/gm, "")
      .replace(/[\t\f\r ]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    if (!text) {
      throw new AppError("PDF файлаас текст уншиж чадсангүй. Зурган PDF байж магадгүй.", 422);
    }
    return text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("PDF файлыг боловсруулахад алдаа гарлаа.", 422);
  } finally {
    if (parser) await parser.destroy().catch(() => undefined);
  }
}
