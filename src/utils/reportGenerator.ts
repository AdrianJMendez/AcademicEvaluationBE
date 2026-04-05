import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import PDFDocument from 'pdfkit';
import { ScoreCalculationResult } from './requestScoring';

type PdfReportDocument = InstanceType<typeof PDFDocument>;

const LOGO_URL = 'https://blogs.unah.edu.hn/assets/Uploads/logo-unah-4.png';
const PAGE_MARGIN = 72;
const CONTENT_WIDTH = 451.28;
const COLORS = {
  blue: '#003B73',
  yellow: '#F2B705',
  ink: '#1F2937',
  muted: '#4B5563',
  border: '#D1D5DB',
  lightBlue: '#EEF4FB',
  lightYellow: '#FFF8E1',
  success: '#0F766E',
  warning: '#B45309',
  white: '#FFFFFF'
};

export interface GeneratedRequestReport {
  buffer: Buffer;
  fileName: string;
  mimeType: 'application/pdf';
}

function fetchRemoteBuffer(url: string, redirects = 3): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, (response) => {
      if (
        response.statusCode &&
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location &&
        redirects > 0
      ) {
        response.resume();
        resolve(fetchRemoteBuffer(response.headers.location, redirects - 1));
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`No se pudo descargar el recurso remoto (${response.statusCode ?? 'sin codigo'}).`));
        return;
      }

      const chunks: Buffer[] = [];
      response.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      response.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function getImageBuffer(imageUrl: string): Promise<Buffer | null> {
  try {
    if (!imageUrl) {
      return null;
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return await fetchRemoteBuffer(imageUrl);
    }

    const normalizedPath = imageUrl.startsWith('/storage')
      ? path.join(process.cwd(), imageUrl.replace('/storage', 'storage'))
      : path.isAbsolute(imageUrl)
        ? imageUrl
        : path.join(process.cwd(), imageUrl);

    if (!fs.existsSync(normalizedPath)) {
      return null;
    }

    return await fs.promises.readFile(normalizedPath);
  } catch {
    return null;
  }
}

function formatDate(value: string | Date | null | undefined) {
  if (!value) {
    return 'No disponible';
  }

  return new Date(value).toLocaleString('es-HN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatScore(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '0.00';
  }

  return Number(value).toFixed(2);
}

function ensureSpace(doc: PdfReportDocument, requiredHeight: number) {
  if (doc.y + requiredHeight > doc.page.height - PAGE_MARGIN) {
    doc.addPage();
  }
}

function writeParagraph(doc: PdfReportDocument, text: string, options?: PDFKit.Mixins.TextOptions) {
  doc
    .font('Times-Roman')
    .fontSize(12)
    .fillColor(COLORS.ink)
    .text(text, PAGE_MARGIN, doc.y, {
      width: CONTENT_WIDTH,
      align: 'justify',
      lineGap: 4,
      paragraphGap: 8,
      ...options
    });
}

function writeLabelValue(doc: PdfReportDocument, label: string, value: string) {
  ensureSpace(doc, 22);
  doc
    .font('Times-Bold')
    .fontSize(12)
    .fillColor(COLORS.ink)
    .text(`${label}: `, PAGE_MARGIN, doc.y, {
      width: CONTENT_WIDTH,
      continued: true
    });

  doc
    .font('Times-Roman')
    .text(value, {
      width: CONTENT_WIDTH,
      lineGap: 4
    });
}

function drawPageChrome(doc: PdfReportDocument, pageNumber: number, showHeader: boolean) {
  if (showHeader) {
    doc
      .font('Times-Roman')
      .fontSize(10)
      .fillColor(COLORS.muted)
      .text('Informe tecnico de evaluacion administrativa', PAGE_MARGIN, 34, {
        width: CONTENT_WIDTH - 50
      });

    doc
      .moveTo(PAGE_MARGIN, 52)
      .lineTo(doc.page.width - PAGE_MARGIN, 52)
      .lineWidth(0.8)
      .strokeColor(COLORS.border)
      .stroke();
  }

  doc
    .moveTo(PAGE_MARGIN, doc.page.height - 52)
    .lineTo(doc.page.width - PAGE_MARGIN, doc.page.height - 52)
    .lineWidth(0.8)
    .strokeColor(COLORS.border)
    .stroke();

  doc
    .font('Times-Roman')
    .fontSize(9.5)
    .fillColor(COLORS.muted)
    .text(String(pageNumber), doc.page.width - PAGE_MARGIN - 20, 34, {
      width: 20,
      align: 'right'
    });
}

function drawSectionTitle(doc: PdfReportDocument, title: string) {
  ensureSpace(doc, 42);
  doc
    .font('Times-Bold')
    .fontSize(16)
    .fillColor(COLORS.blue)
    .text(title, PAGE_MARGIN, doc.y, {
      width: CONTENT_WIDTH
    });

  const lineY = doc.y + 4;
  doc
    .moveTo(PAGE_MARGIN, lineY)
    .lineTo(doc.page.width - PAGE_MARGIN, lineY)
    .lineWidth(1.5)
    .strokeColor(COLORS.yellow)
    .stroke();

  doc.moveDown(0.8);
}

function getHonorDecision(finalScore: number | null | undefined) {
  const score = Number(finalScore ?? 0);

  if (score >= 95) {
    return {
      status: 'Aprobado',
      honor: 'Summa Cum Laude',
      reason: 'La calificacion final se encuentra entre 95% y 100%, por lo que procede el otorgamiento de Summa Cum Laude.',
      accent: COLORS.success
    };
  }

  if (score >= 90) {
    return {
      status: 'Aprobado',
      honor: 'Magna Cum Laude',
      reason: 'La calificacion final se encuentra entre 90% y 94%, por lo que procede el otorgamiento de Magna Cum Laude.',
      accent: COLORS.success
    };
  }

  if (score >= 80) {
    return {
      status: 'Aprobado',
      honor: 'Cum Laude',
      reason: 'La calificacion final se encuentra entre 80% y 89%, por lo que procede el otorgamiento de Cum Laude.',
      accent: COLORS.success
    };
  }

  return {
    status: 'Denegado',
    honor: 'Sin honor academico',
    reason: 'La calificacion final es inferior al minimo institucional de 80%, por lo que la solicitud no califica para recibir honor academico.',
    accent: COLORS.warning
  };
}

function impactLabel(impactLevel: string | null | undefined) {
  switch (impactLevel) {
    case 'high-impact':
      return 'Alto impacto';
    case 'low-impact':
      return 'Impacto moderado';
    case 'no-impact':
      return 'Sin impacto';
    default:
      return 'Sin evaluar';
  }
}

function drawCoverPage(doc: PdfReportDocument, detail: any, decision: ReturnType<typeof getHonorDecision>, logoBuffer: Buffer | null) {
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(COLORS.white);
  doc.rect(0, 0, doc.page.width, 18).fill(COLORS.blue);
  doc.rect(0, doc.page.height - 18, doc.page.width, 18).fill(COLORS.yellow);

  if (logoBuffer) {
    doc.image(logoBuffer, doc.page.width / 2 - 75, 84, { fit: [150, 150], align: 'center' });
  }

  doc
    .font('Times-Bold')
    .fontSize(20)
    .fillColor(COLORS.blue)
    .text('Universidad Nacional Autonoma de Honduras', PAGE_MARGIN, 258, {
      width: CONTENT_WIDTH,
      align: 'center'
    });

  doc
    .font('Times-Bold')
    .fontSize(18)
    .fillColor(COLORS.ink)
    .text('Sistema Semi Automatico De Calificacion Para Recibir Honores Academicos', PAGE_MARGIN, 300, {
      width: CONTENT_WIDTH,
      align: 'center'
    });

  doc
    .font('Times-Bold')
    .fontSize(17)
    .fillColor(COLORS.ink)
    .text('Informe Tecnico de Evaluacion Administrativa', PAGE_MARGIN, 366, {
      width: CONTENT_WIDTH,
      align: 'center'
    });

  doc
    .roundedRect(PAGE_MARGIN, 434, CONTENT_WIDTH, 150, 10)
    .fillAndStroke(COLORS.lightBlue, COLORS.border);

  doc
    .font('Times-Roman')
    .fontSize(13)
    .fillColor(COLORS.ink)
    .text(`Solicitud No. ${detail.idRequest}`, PAGE_MARGIN + 24, 460, { width: CONTENT_WIDTH - 48, align: 'center' })
    .text(`Estudiante: ${detail.student?.name ?? 'No disponible'}`, PAGE_MARGIN + 24, 492, { width: CONTENT_WIDTH - 48, align: 'center' })
    .text(`Numero de cuenta: ${detail.student?.accountNumber ?? 'No disponible'}`, PAGE_MARGIN + 24, 524, { width: CONTENT_WIDTH - 48, align: 'center' })
    .text(`Carrera: ${detail.career?.careerName ?? 'No disponible'}`, PAGE_MARGIN + 24, 556, { width: CONTENT_WIDTH - 48, align: 'center' });

  doc
    .font('Times-Bold')
    .fontSize(14)
    .fillColor(decision.accent)
    .text(`Resultado institucional: ${decision.status} - ${decision.honor}`, PAGE_MARGIN, 624, {
      width: CONTENT_WIDTH,
      align: 'center'
    });

  doc
    .font('Times-Roman')
    .fontSize(12)
    .fillColor(COLORS.muted)
    .text(`Fecha de emision: ${formatDate(detail.reviewedAt ?? new Date())}`, PAGE_MARGIN, 680, {
      width: CONTENT_WIDTH,
      align: 'center'
    });
}

function drawIndexPage(doc: PdfReportDocument) {
  drawSectionTitle(doc, 'Indice');

  writeParagraph(
    doc,
    'El presente informe se estructura en secciones consecutivas que detallan el contexto general de la solicitud, la metodologia de evaluacion automatica, la decision administrativa resultante, las discrepancias revisadas y las evidencias asociadas.'
  );

  const items = [
    '1. Introduccion',
    '2. Datos generales de la solicitud',
    '3. Metodologia de calificacion',
    '4. Resultado y decision institucional',
    '5. Discrepancias, justificaciones y comentarios',
    '6. Evidencias visuales anexas',
    '7. Conclusion administrativa'
  ];

  items.forEach((item) => {
    doc
      .font('Times-Roman')
      .fontSize(12.5)
      .fillColor(COLORS.ink)
      .text(item, PAGE_MARGIN + 18, doc.y + 2, {
        width: CONTENT_WIDTH - 18
      });
    doc.moveDown(0.8);
  });
}

function drawScoreTable(doc: PdfReportDocument, detail: any, scoreSummary: ScoreCalculationResult) {
  const rows = [
    ['Nota base institucional', formatScore(scoreSummary.baseScore)],
    ['Penalizacion por volumen de discrepancias', formatScore(scoreSummary.discrepancyPenalty)],
    ['Penalizacion por retraso academico acumulado', formatScore(scoreSummary.delayPenaltyOnly)],
    ['Ajuste positivo por justificaciones de alto impacto', formatScore(scoreSummary.positiveImpactAdjustment)],
    ['Ajuste negativo por justificaciones con baja o nula incidencia', formatScore(Math.abs(scoreSummary.negativeImpactAdjustment))],
    ['Nota final automatica', `${formatScore(detail.finalScore ?? scoreSummary.finalScore)}%`]
  ];

  ensureSpace(doc, 210);
  const tableTop = doc.y;
  const firstColumnWidth = 320;
  const secondColumnWidth = CONTENT_WIDTH - firstColumnWidth;
  const rowHeight = 28;

  doc.rect(PAGE_MARGIN, tableTop, CONTENT_WIDTH, rowHeight).fillAndStroke(COLORS.blue, COLORS.blue);

  doc
    .font('Times-Bold')
    .fontSize(12)
    .fillColor(COLORS.white)
    .text('Concepto de evaluacion', PAGE_MARGIN + 10, tableTop + 8, {
      width: firstColumnWidth - 20
    })
    .text('Valor', PAGE_MARGIN + firstColumnWidth + 10, tableTop + 8, {
      width: secondColumnWidth - 20,
      align: 'right'
    });

  let y = tableTop + rowHeight;

  rows.forEach((row, index) => {
    doc
      .rect(PAGE_MARGIN, y, CONTENT_WIDTH, rowHeight)
      .fillAndStroke(index % 2 === 0 ? COLORS.lightBlue : COLORS.lightYellow, COLORS.border);

    doc
      .font('Times-Roman')
      .fontSize(11.5)
      .fillColor(COLORS.ink)
      .text(row[0], PAGE_MARGIN + 10, y + 8, {
        width: firstColumnWidth - 20
      })
      .text(row[1], PAGE_MARGIN + firstColumnWidth + 10, y + 8, {
        width: secondColumnWidth - 20,
        align: 'right'
      });

    y += rowHeight;
  });

  doc.y = y + 12;
}

function drawDecisionBlock(doc: PdfReportDocument, detail: any, decision: ReturnType<typeof getHonorDecision>) {
  ensureSpace(doc, 120);
  const top = doc.y;

  doc
    .roundedRect(PAGE_MARGIN, top, CONTENT_WIDTH, 100, 10)
    .fillAndStroke(COLORS.lightYellow, COLORS.border);

  doc
    .font('Times-Bold')
    .fontSize(14)
    .fillColor(decision.accent)
    .text(`Decision: ${decision.status}`, PAGE_MARGIN + 16, top + 14, {
      width: CONTENT_WIDTH - 32
    });

  doc
    .font('Times-Bold')
    .fontSize(13)
    .fillColor(COLORS.ink)
    .text(`Reconocimiento determinado: ${decision.honor}`, PAGE_MARGIN + 16, top + 40, {
      width: CONTENT_WIDTH - 32
    });

  doc
    .font('Times-Roman')
    .fontSize(12)
    .fillColor(COLORS.ink)
    .text(
      `${decision.reason} La nota final registrada es ${formatScore(detail.finalScore)}%.`,
      PAGE_MARGIN + 16,
      top + 64,
      {
        width: CONTENT_WIDTH - 32,
        align: 'justify',
        lineGap: 3
      }
    );

  doc.y = top + 118;
}

function drawMethodologyExplanation(doc: PdfReportDocument, scoreSummary: ScoreCalculationResult) {
  writeParagraph(
    doc,
    'La calificacion parte de una nota base de 100 puntos. A partir de dicha base, el sistema aplica una penalizacion estructural por la cantidad total de discrepancias detectadas y por la diferencia acumulada entre el periodo academico esperado y el realmente cursado. Posteriormente, se incorpora la valoracion del empleado para cada discrepancia, tomando como referencia la justificacion con mayor incidencia academica asociada a la misma.'
  );

  writeParagraph(
    doc,
    'Cuando una discrepancia es evaluada como sin impacto, el sistema interpreta que la situacion descrita no afecto materialmente el avance academico del estudiante; por tanto, la responsabilidad de dicha discrepancia recae en su gestion academica y la penalizacion aplicada es severa. Las discrepancias sin soporte suficiente o sin justificacion valida reciben un castigo adicional.'
  );

  writeParagraph(
    doc,
    `En esta revision se registraron ${scoreSummary.discrepanciesCount} discrepancias. De ellas, ${scoreSummary.impactBuckets.highImpact} fueron calificadas con alto impacto, ${scoreSummary.impactBuckets.lowImpact} con impacto moderado, ${scoreSummary.impactBuckets.noImpact} sin impacto valido y ${scoreSummary.impactBuckets.missing} quedaron sin sustento suficiente.`
  );
}

function drawDiscrepancySection(doc: PdfReportDocument, detail: any) {
  const discrepancies = detail.discrepancies ?? [];

  if (discrepancies.length === 0) {
    writeParagraph(doc, 'No se registraron discrepancias asociadas a la solicitud analizada.');
    return;
  }

  discrepancies.forEach((discrepancy: any, index: number) => {
    ensureSpace(doc, 176);

    const headerTop = doc.y;
    doc
      .roundedRect(PAGE_MARGIN, headerTop, CONTENT_WIDTH, 34, 8)
      .fillAndStroke(COLORS.lightBlue, COLORS.border);

    doc
      .font('Times-Bold')
      .fontSize(13)
      .fillColor(COLORS.blue)
      .text(`Discrepancia ${index + 1}. ${discrepancy.discrepancyType?.typeName ?? 'Sin clasificacion'}`, PAGE_MARGIN + 12, headerTop + 10, {
        width: CONTENT_WIDTH - 24
      });

    doc.y = headerTop + 46;
    writeLabelValue(doc, 'Periodo esperado', `${discrepancy.expectedPeriod ?? 'No disponible'}`);
    writeLabelValue(doc, 'Periodo real', `${discrepancy.actualPeriod ?? 'No disponible'}`);
    writeLabelValue(doc, 'Diferencia registrada', `${discrepancy.periodDifference ?? 'No disponible'}`);
    writeLabelValue(doc, 'Severidad reportada', discrepancy.severity ?? 'No disponible');

    if (discrepancy.description) {
      writeLabelValue(doc, 'Descripcion academica', discrepancy.description);
    }

    const justifications = discrepancy.justifications ?? [];

    if (justifications.length === 0) {
      writeParagraph(doc, 'No se registraron justificaciones asociadas a esta discrepancia.');
      doc.moveDown(0.3);
      return;
    }

    justifications.forEach((justification: any, justificationIndex: number) => {
      ensureSpace(doc, 144);
      const boxTop = doc.y;

      doc
        .roundedRect(PAGE_MARGIN + 10, boxTop, CONTENT_WIDTH - 20, 116, 8)
        .fillAndStroke(COLORS.white, COLORS.border);

      doc
        .font('Times-Bold')
        .fontSize(12.5)
        .fillColor(COLORS.ink)
        .text(`Justificacion ${justificationIndex + 1}. ${justification.title ?? 'Sin titulo'}`, PAGE_MARGIN + 24, boxTop + 12, {
          width: CONTENT_WIDTH - 48
        });

      doc
        .font('Times-Roman')
        .fontSize(11.5)
        .fillColor(COLORS.ink)
        .text(justification.description ?? 'No se proporciono descripcion adicional.', PAGE_MARGIN + 24, boxTop + 36, {
          width: CONTENT_WIDTH - 48,
          align: 'justify',
          lineGap: 3
        });

      doc
        .font('Times-Bold')
        .fontSize(11.5)
        .text('Parametro asignado por el evaluador: ', PAGE_MARGIN + 24, boxTop + 78, {
          continued: true
        });

      doc
        .font('Times-Roman')
        .text(impactLabel(justification.impactLevel), {
          width: CONTENT_WIDTH - 48
        });

      doc
        .font('Times-Bold')
        .fontSize(11.5)
        .text('Comentarios del evaluador: ', PAGE_MARGIN + 24, boxTop + 96, {
          continued: true
        });

      doc
        .font('Times-Roman')
        .text(justification.employeeComments ?? 'Sin comentarios adicionales.', {
          width: CONTENT_WIDTH - 48
        });

      doc.y = boxTop + 130;
    });
  });
}

async function drawEvidenceSection(doc: PdfReportDocument, detail: any) {
  const images = detail.requestImages ?? [];

  if (images.length === 0) {
    writeParagraph(doc, 'No se registraron evidencias visuales asociadas a la presente solicitud.');
    return;
  }

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    ensureSpace(doc, 320);

    doc
      .font('Times-Bold')
      .fontSize(12.5)
      .fillColor(COLORS.ink)
      .text(`Figura ${index + 1}. ${image.imageName ?? 'Evidencia adjunta'}`, PAGE_MARGIN, doc.y, {
        width: CONTENT_WIDTH
      });

    doc.moveDown(0.4);

    const evidenceBuffer = await getImageBuffer(image.imageUrl ?? image.thumbnailUrl ?? '');

    if (evidenceBuffer) {
      const imageTop = doc.y;
      doc.image(evidenceBuffer, PAGE_MARGIN, imageTop, {
        fit: [CONTENT_WIDTH, 260],
        align: 'center',
        valign: 'center'
      });
      doc.y = imageTop + 274;
      continue;
    }

    const placeholderTop = doc.y;
    doc
      .roundedRect(PAGE_MARGIN, placeholderTop, CONTENT_WIDTH, 160, 8)
      .fillAndStroke(COLORS.lightBlue, COLORS.border);

    doc
      .font('Times-Roman')
      .fontSize(12)
      .fillColor(COLORS.muted)
      .text(
        'No fue posible incorporar esta evidencia visual dentro del documento PDF. La evidencia permanece disponible para su consulta desde el detalle administrativo de la solicitud.',
        PAGE_MARGIN + 20,
        placeholderTop + 56,
        {
          width: CONTENT_WIDTH - 40,
          align: 'justify',
          lineGap: 4
        }
      );

    doc.y = placeholderTop + 176;
  }
}

function attachPageDecorator(doc: PdfReportDocument) {
  let currentPage = 1;
  drawPageChrome(doc, currentPage, false);
  doc.y = PAGE_MARGIN;

  doc.on('pageAdded', () => {
    currentPage += 1;
    drawPageChrome(doc, currentPage, true);
    doc.y = 72;
  });
}

export async function generateRequestReport(detail: any, scoreSummary: ScoreCalculationResult): Promise<GeneratedRequestReport> {
  const logoBuffer = await getImageBuffer(LOGO_URL);
  const decision = getHonorDecision(detail.finalScore ?? scoreSummary.finalScore);
  const fileName = `solicitud-${detail.idRequest}-informe.pdf`;
  const mimeType: 'application/pdf' = 'application/pdf';

  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: PAGE_MARGIN
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    doc.on('error', reject);
    doc.on('end', () => {
      resolve({
        buffer: Buffer.concat(chunks),
        fileName,
        mimeType
      });
    });

    attachPageDecorator(doc);
    drawCoverPage(doc, detail, decision, logoBuffer);

    doc.addPage();
    drawIndexPage(doc);

    doc.addPage();
    drawSectionTitle(doc, 'Introduccion');
    writeParagraph(
      doc,
      'El presente informe tecnico documenta el proceso de evaluacion administrativa aplicado a una solicitud de reconocimiento de honor academico. Su finalidad es dejar constancia formal del analisis realizado sobre las discrepancias detectadas en la trayectoria academica del estudiante, las justificaciones presentadas y la calificacion automatica obtenida a partir de la valoracion emitida por el personal evaluador.'
    );
    writeParagraph(
      doc,
      'El documento se emite para fines de control interno y trazabilidad institucional. Asimismo, permite explicar de forma clara por que la solicitud es aprobada o denegada, incluyendo los elementos que incidieron directamente en la nota final calculada por el sistema.'
    );

    drawSectionTitle(doc, 'Datos generales de la solicitud');
    writeLabelValue(doc, 'Numero de solicitud', `${detail.idRequest}`);
    writeLabelValue(doc, 'Estudiante', detail.student?.name ?? 'No disponible');
    writeLabelValue(doc, 'Numero de cuenta', detail.student?.accountNumber ?? 'No disponible');
    writeLabelValue(doc, 'Correo electronico', detail.student?.email ?? 'No disponible');
    writeLabelValue(doc, 'Carrera', detail.career?.careerName ?? 'No disponible');
    writeLabelValue(doc, 'Codigo de carrera', detail.career?.careerCode ?? 'No disponible');
    writeLabelValue(doc, 'Facultad', detail.career?.facultyName ?? 'No disponible');
    writeLabelValue(doc, 'Evaluador responsable', detail.reviewer?.name ?? 'No disponible');
    writeLabelValue(doc, 'Correo del evaluador', detail.reviewer?.email ?? 'No disponible');
    writeLabelValue(doc, 'Fecha de envio', formatDate(detail.submittedAt));
    writeLabelValue(doc, 'Fecha de revision', formatDate(detail.reviewedAt));

    doc.addPage();
    drawSectionTitle(doc, 'Metodologia de calificacion');
    drawMethodologyExplanation(doc, scoreSummary);
    drawScoreTable(doc, detail, scoreSummary);
    writeParagraph(
      doc,
      'La nota final indicada en este informe fue generada automaticamente por el sistema con base en la forma en que el empleado juzgo cada justificacion. El sistema no otorga ni modifica manualmente la calificacion final fuera de los parametros de evaluacion registrados durante la revision.'
    );

    drawSectionTitle(doc, 'Resultado y decision institucional');
    drawDecisionBlock(doc, detail, decision);
    writeLabelValue(doc, 'Nota final automatica', `${formatScore(detail.finalScore ?? scoreSummary.finalScore)}%`);
    writeLabelValue(doc, 'Estado final', detail.status?.statusName ?? 'No disponible');
    writeLabelValue(doc, 'Observaciones generales de la solicitud', detail.notes ?? 'Sin observaciones generales adicionales.');

    doc.addPage();
    drawSectionTitle(doc, 'Discrepancias, justificaciones y comentarios');
    drawDiscrepancySection(doc, detail);

    doc.addPage();
    drawSectionTitle(doc, 'Evidencias visuales anexas');
    await drawEvidenceSection(doc, detail);

    drawSectionTitle(doc, 'Conclusion administrativa');
    writeParagraph(
      doc,
      decision.status === 'Aprobado'
        ? `Con base en la nota final automatica de ${formatScore(detail.finalScore ?? scoreSummary.finalScore)}%, y en virtud de la valoracion emitida sobre las justificaciones asociadas a las discrepancias registradas, se concluye que la solicitud cumple con el umbral institucional para otorgar el honor academico ${decision.honor}.`
        : `Con base en la nota final automatica de ${formatScore(detail.finalScore ?? scoreSummary.finalScore)}%, y en virtud de la valoracion emitida sobre las justificaciones asociadas a las discrepancias registradas, se concluye que la solicitud no alcanza el umbral institucional minimo de 80% requerido para el otorgamiento de honores academicos.`
    );
    writeParagraph(
      doc,
      'Este informe constituye un respaldo tecnico-administrativo del resultado emitido por el sistema y debe interpretarse conjuntamente con el expediente digital de la solicitud, incluyendo los comentarios del evaluador y las evidencias disponibles en el modulo administrativo.'
    );

    doc.end();
  });
}
