import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { AppError } from "../shared/errors";

function getZodErrorMessage(error: ZodError): string {
  const issues = error.issues;
  if (issues.length === 0) return "Буруу өгөгдөл оруулсан байна.";
  
  const firstIssue = issues[0];
  const path = firstIssue.path.join(".");
  
  if (firstIssue.message.includes("Invalid enum")) {
    return `Буруу утга оруулсан байна: ${path}. Зөв утга сонгоно уу.`;
  }
  if (firstIssue.message.includes("Required")) {
    return `Заавал оруулах талбар хоосон байна: ${path}`;
  }
  if (firstIssue.message.includes("email")) {
    return "Имэйл хаяг буруу форматтай байна.";
  }
  if (firstIssue.message.includes("too_small")) {
    return `${path} хэт богино байна.`;
  }
  
  return `Буруу өгөгдөл: ${path} - ${firstIssue.message}`;
}

function getPrismaErrorMessage(error: Error & { code?: string; meta?: any }): string | null {
  const prismaCode = error.code;
  const meta = error.meta;
  
  // Prisma unique constraint violation
  if (prismaCode === "P2002") {
    const target = meta?.target?.join?.(", ") || "";
    if (target.includes("email")) return "Имэйл хаяг аль хэдийн бүртгэгдсэн байна.";
    if (target.includes("studentCode")) return "Оюутны код аль хэдийн бүртгэгдсэн байна.";
    if (target.includes("teacherCode")) return "Багшийн код аль хэдийн бүртгэгдсэн байна.";
    if (target.includes("name")) return "Нэр аль хэдийн бүртгэгдсэн байна.";
    return "Давхардсан өгөгдөл олдлоо. Өөр утга оруулна уу.";
  }
  
  // Prisma foreign key constraint violation
  if (prismaCode === "P2003") {
    return "Холбогдох мэдээлэл олдсонгүй. Эхлээд холбогдох мэдээллийг бүртгэнэ үү.";
  }
  
  // Prisma record not found
  if (prismaCode === "P2025") {
    return "Мэдээлэл олдсонгүй.";
  }
  
  // Prisma required value missing
  if (prismaCode === "P2011") {
    return "Заавал оруулах талбар хоосон байна.";
  }
  
  // Prisma invalid value
  if (prismaCode === "P2006" || prismaCode === "P2007") {
    return "Буруу өгөгдөл оруулсан байна.";
  }
  
  return null;
}

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    request.log.error({ error, code: (error as any).code, meta: (error as any).meta }, "request failed");
    if (error instanceof AppError) {
      reply.status(error.statusCode).send({ success: false, message: error.message });
      return;
    }
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      reply.status(400).send({
        success: false,
        message: getZodErrorMessage(error),
      });
      return;
    }
    
    const statusCode = (error as Error & { statusCode?: number }).statusCode ?? 500;
    
    if (statusCode >= 500) {
      const prismaMessage = getPrismaErrorMessage(error as Error & { code?: string; meta?: any });
      if (prismaMessage) {
        reply.status(400).send({
          success: false,
          message: prismaMessage,
        });
        return;
      }
    }
    
    const handledError = error as Error;
    reply.status(statusCode).send({
      success: false,
      message: statusCode >= 500 ? "Internal server error" : handledError.message,
    });
  });
}
