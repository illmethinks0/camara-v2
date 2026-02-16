import crypto from 'node:crypto';

export const TEMPLATE_VERSION = 'camara-template-v1';

export type AnnexKind = 'annex_2' | 'annex_3' | 'annex_5';

export interface PdfSignature {
  role: 'administrator' | 'instructor' | 'participant';
  name: string;
  signedAt: string;
}

export interface AnnexPdfInput {
  annexType: AnnexKind;
  participant: {
    fullName: string;
    idNumber: string;
    email: string;
    phone: string;
  };
  course: {
    name: string;
    durationHours: number;
    startDate: string;
    endDate: string;
  };
  phaseLabel: string;
  generatedAt: string;
  attendanceSummary?: string;
  instructorNotes?: string;
  signatures: PdfSignature[];
}

function escapePdfText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function createPdfBuffer(lines: string[]): Buffer {
  const streamLines = ['BT', '/F1 11 Tf'];
  let currentY = 800;

  for (const line of lines) {
    streamLines.push(`1 0 0 1 40 ${currentY} Tm (${escapePdfText(line)}) Tj`);
    currentY -= 14;
  }

  streamLines.push('ET');
  const streamContent = streamLines.join('\n');

  const objects: string[] = [];
  objects.push('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj');
  objects.push('2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj');
  objects.push(
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj'
  );
  objects.push('4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj');
  objects.push(
    `5 0 obj << /Length ${Buffer.byteLength(streamContent, 'utf8')} >> stream\n${streamContent}\nendstream endobj`
  );

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${object}\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'utf8');
}

function formatSignatureLine(signature: PdfSignature): string {
  return `- ${signature.role.toUpperCase()}: ${signature.name} (${signature.signedAt})`;
}

export function buildAnnexPdf(input: AnnexPdfInput): { buffer: Buffer; contentHash: string } {
  const baseLines = [
    'CAMARA DE COMERCIO DE MENORCA',
    `Plantilla: ${TEMPLATE_VERSION}`,
    `Documento: ${input.annexType.toUpperCase()} (${input.phaseLabel})`,
    `Fecha emision: ${input.generatedAt}`,
    '',
    'DATOS DEL PARTICIPANTE',
    `Nombre: ${input.participant.fullName}`,
    `DNI/NIE: ${input.participant.idNumber}`,
    `Email: ${input.participant.email}`,
    `Telefono: ${input.participant.phone}`,
    '',
    'DATOS DEL PROGRAMA',
    `Programa: ${input.course.name}`,
    `Duracion: ${input.course.durationHours} horas`,
    `Fechas: ${input.course.startDate} - ${input.course.endDate}`,
    '',
  ];

  if (input.annexType === 'annex_2') {
    baseLines.push(
      'ANEXO 2 - FASE DIAGNOSTICO',
      'Objetivo: Registrar situacion inicial y compromiso de participacion.',
      'Texto demo: El participante autoriza la gestion academica del itinerario.',
      ''
    );
  }

  if (input.annexType === 'annex_3') {
    baseLines.push(
      'ANEXO 3 - PROGRESO FORMATIVO',
      `Resumen asistencia: ${input.attendanceSummary ?? 'Sin sesiones registradas'}`,
      `Observaciones instructor: ${input.instructorNotes ?? 'Sin observaciones'}`,
      ''
    );
  }

  if (input.annexType === 'annex_5') {
    baseLines.push(
      'ANEXO 5 - CERTIFICADO DE FINALIZACION',
      'La Camara certifica que el participante ha completado satisfactoriamente',
      'el programa formativo y ha cumplido con los requisitos de seguimiento.',
      ''
    );
  }

  baseLines.push('FIRMAS REGISTRADAS');

  if (input.signatures.length === 0) {
    baseLines.push('- Pendiente de firma');
  } else {
    for (const signature of input.signatures) {
      baseLines.push(formatSignatureLine(signature));
    }
  }

  baseLines.push('', 'Documento generado para demo Madrid 2026.');

  const buffer = createPdfBuffer(baseLines);
  const contentHash = crypto.createHash('sha256').update(buffer).digest('hex');

  return { buffer, contentHash };
}
