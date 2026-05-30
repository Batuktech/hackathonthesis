import { Type } from "@google/genai";
import type { Schema } from "@google/genai";

export const orchestratorSystemPrompt = [
  "Та бол дипломын хамгаалалтын зохицуулагч (Thesis Defense Orchestrator) юм.",
  "Та дөрвөн мэргэшсэн агентыг удирдан зохицуулна.",
  "Та дипломыг өөрөө хэзээ ч шууд дүгнэхгүй.",
  "Таны үүрэг бол даалгавар хуваарилах, үр дүнг шалгах, зөрчлийг шийдвэрлэх, эцсийн тайланг нэгтгэх явдал юм.",
  "Бүх гаралт монгол хэл дээр байна.",
  "Зөвхөн бүтэцлэгдсэн өгөгдөл буцаана.",
].join(" ");

export const structureSystemPrompt = [
  "Та бол академик дипломын бүтцийн үнэлгээний эксперт юм.",
  "Таны үүрэг бол дипломын зохион байгуулалт болон академик форматыг шалгах явдал.",
  "Гарчгийн хуудас, хураангуй, агуулга, оршил, судалгааны тойм, арга зүй, үр дүн, хэлэлцүүлэг, дүгнэлт, ном зүй зэрэг хэсгүүдийн бүрэн байдал, логик дараалал, академик стандартыг үнэл.",
  "Дэлгэрэнгүй үндэслэл өг.",
  "Зөвхөн монгол хэл дээр хариул.",
].join(" ");

export const aiUsageSystemPrompt = [
  "Та бол хиймэл оюун ухаанаар бичигдсэн эсэх болон эх сурвалжийн үнэлгээний эксперт юм.",
  "Хэл шинжлэлийн шинж тэмдэг, бичлэгийн тогтвортой байдал, стилометрийн хэв маяг, давтагдсан бүтэц, хэт ерөнхий академик хэллэг, эшлэлийн нягтрал зэрэгт тулгуурлан AI-аар бичигдсэн магадлалыг тооцоол.",
  "Үндэслэлгүй буруутгал бүү хий. Нотолгоонд тулгуурласан үндэслэл өг.",
  "Зөвхөн монгол хэл дээр хариул.",
].join(" ");

export const presentationSystemPrompt = [
  "Та бол академик илтгэлийн үнэлгээний эксперт юм.",
  "Илтгэлийн текстийн чанар, харилцааны үр нөлөө, техникийн тайлбарын гүн, илтгэх ур чадвар, өөртөө итгэлтэй байдал, сэдвийн ойлголт, хамгаалалтад бэлэн байдлыг шинжил.",
  "Зөвхөн монгол хэл дээр хариул.",
].join(" ");

export const committeeSystemPrompt = [
  "Та бол их сургуулийн дипломын хамгаалалтын комисс юм.",
  "Өмнөх бүх агентуудын дүгнэлтийг хянана.",
  "Дүгнэлтүүдийг хооронд нь сөргүүлэн шалгаж, зөрчлийг илрүүлнэ.",
  "Эцсийн хамгаалалтын оноо болон зөвлөмжийг гаргана.",
  "Зөвхөн монгол хэл дээр хариул.",
].join(" ");

const stringArray: Schema = { type: Type.ARRAY, items: { type: Type.STRING } };

export const structureSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    structureScore: { type: Type.INTEGER },
    strengths: stringArray,
    weaknesses: stringArray,
    missingSections: stringArray,
    recommendations: stringArray,
    summary: { type: Type.STRING },
    reasoning: stringArray,
    findings: stringArray,
  },
  required: ["structureScore", "strengths", "weaknesses", "missingSections", "recommendations", "summary", "reasoning", "findings"],
};

export const aiUsageSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    aiProbability: { type: Type.INTEGER },
    humanProbability: { type: Type.INTEGER },
    originalityScore: { type: Type.INTEGER },
    riskLevel: { type: Type.STRING },
    analysis: stringArray,
    recommendations: stringArray,
    summary: { type: Type.STRING },
    reasoning: stringArray,
    findings: stringArray,
  },
  required: ["aiProbability", "humanProbability", "originalityScore", "riskLevel", "analysis", "recommendations", "summary", "reasoning", "findings"],
};

export const presentationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    speakingScore: { type: Type.INTEGER },
    clarityScore: { type: Type.INTEGER },
    confidenceScore: { type: Type.INTEGER },
    technicalScore: { type: Type.INTEGER },
    strengths: stringArray,
    weaknesses: stringArray,
    recommendations: stringArray,
    summary: { type: Type.STRING },
    reasoning: stringArray,
    findings: stringArray,
  },
  required: ["speakingScore", "clarityScore", "confidenceScore", "technicalScore", "strengths", "weaknesses", "recommendations", "summary", "reasoning", "findings"],
};

export const conversationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    rounds: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          round: { type: Type.INTEGER },
          title: { type: Type.STRING },
          messages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                speaker: { type: Type.STRING },
                message: { type: Type.STRING },
              },
              required: ["speaker", "message"],
            },
          },
        },
        required: ["round", "title", "messages"],
      },
    },
  },
  required: ["rounds"],
};

export const committeeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    finalScore: { type: Type.INTEGER },
    grade: { type: Type.STRING },
    committeeFeedback: stringArray,
    criticalIssues: stringArray,
    defenseReadiness: { type: Type.STRING },
    finalRecommendation: { type: Type.STRING },
    summary: { type: Type.STRING },
    reasoning: stringArray,
  },
  required: ["finalScore", "grade", "committeeFeedback", "criticalIssues", "defenseReadiness", "finalRecommendation", "summary", "reasoning"],
};
