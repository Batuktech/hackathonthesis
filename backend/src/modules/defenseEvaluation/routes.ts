import { PassThrough } from "stream";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { AppError } from "../../shared/errors";
import { orchestrateDefense } from "./orchestrator";
import type { DefenseStreamEvent } from "./types";

async function readMultipart(request: FastifyRequest) {
  let pdfBuffer: Buffer | undefined;
  let fileName = "thesis.pdf";
  let transcript = "";

  for await (const part of request.parts()) {
    if (part.type === "file") {
      if (part.mimetype !== "application/pdf" && !part.filename.toLowerCase().endsWith(".pdf")) {
        throw new AppError("Зөвхөн PDF файл оруулна уу.", 415);
      }
      fileName = part.filename || fileName;
      pdfBuffer = await part.toBuffer();
    } else if (part.fieldname === "transcript") {
      transcript = String(part.value ?? "");
    }
  }

  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new AppError("Дипломын PDF файл шаардлагатай.", 400);
  }
  if (transcript.trim().length < 20) {
    throw new AppError("Илтгэлийн текстийг дор хаяж 20 тэмдэгтээр оруулна уу.", 400);
  }

  return { pdfBuffer, fileName, transcript: transcript.trim() };
}

export async function defenseEvaluationRoutes(app: FastifyInstance) {
  app.post("/defense-evaluation/analyze", { preHandler: app.requireAuth }, async (request, reply) => {
    const { pdfBuffer, fileName, transcript } = await readMultipart(request);

    const stream = new PassThrough();
    reply.header("Content-Type", "text/event-stream; charset=utf-8");
    reply.header("Cache-Control", "no-cache, no-transform");
    reply.header("Connection", "keep-alive");
    reply.header("X-Accel-Buffering", "no");

    const emit = (event: DefenseStreamEvent) => {
      stream.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    void orchestrateDefense({ pdfBuffer, transcript, fileName, emit })
      .then((result) => {
        emit({ type: "final", result });
        stream.end();
      })
      .catch((error: unknown) => {
        const message = error instanceof AppError ? error.message : "Шинжилгээ хийх явцад алдаа гарлаа.";
        request.log.error({ error }, "defense evaluation failed");
        emit({ type: "error", message });
        stream.end();
      });

    return reply.send(stream);
  });
}
