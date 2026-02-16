import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'CamaraMenorca2025';
const TEMPLATE_VERSION = 'camara-template-v1';

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.signature.deleteMany();
  await prisma.annex.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.phase.deleteMany();
  await prisma.instructorAssignment.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.user.deleteMany();
  await prisma.course.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const [course] = await Promise.all([
    prisma.course.create({
      data: {
        name: 'Programa de Emprendimiento Digital 2025',
        description: 'Programa demostrativo para Camara de Comercio Menorca',
        durationHours: 120,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-04-30'),
      },
    }),
  ]);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@camara-menorca.es',
      role: 'administrator',
      name: 'Ana Garcia Ruiz',
      passwordHash,
    },
  });

  await prisma.user.create({
    data: {
      email: 'godmode@camara-menorca.es',
      role: 'administrator',
      name: 'God Mode Admin',
      passwordHash,
    },
  });

  const instructor1 = await prisma.user.create({
    data: {
      email: 'instructor1@camara-menorca.es',
      role: 'instructor',
      name: 'Carlos Martinez Lopez',
      passwordHash,
    },
  });

  const instructor2 = await prisma.user.create({
    data: {
      email: 'instructor2@camara-menorca.es',
      role: 'instructor',
      name: 'Isabel Fernandez Torres',
      passwordHash,
    },
  });

  const participantUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'participant1@camara-menorca.es',
        role: 'participant',
        name: 'Miguel Sanchez Vega',
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: 'participant2@camara-menorca.es',
        role: 'participant',
        name: 'Laura Rodriguez Mora',
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: 'participant3@camara-menorca.es',
        role: 'participant',
        name: 'David Hernandez Cruz',
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: 'participant4@camara-menorca.es',
        role: 'participant',
        name: 'Sofia Lopez Navarro',
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: 'participant5@camara-menorca.es',
        role: 'participant',
        name: 'Javier Morales Ruiz',
        passwordHash,
      },
    }),
  ]);

  const participants = await Promise.all([
    prisma.participant.create({
      data: {
        userId: participantUsers[0].id,
        courseId: course.id,
        firstName: 'Miguel',
        lastName: 'Sanchez Vega',
        idNumber: '43256789X',
        email: 'participant1@camara-menorca.es',
        phone: '+34 611 111 111',
        currentPhase: 'diagnostic',
      },
    }),
    prisma.participant.create({
      data: {
        userId: participantUsers[1].id,
        courseId: course.id,
        firstName: 'Laura',
        lastName: 'Rodriguez Mora',
        idNumber: '54123456W',
        email: 'participant2@camara-menorca.es',
        phone: '+34 622 222 222',
        currentPhase: 'training',
      },
    }),
    prisma.participant.create({
      data: {
        userId: participantUsers[2].id,
        courseId: course.id,
        firstName: 'David',
        lastName: 'Hernandez Cruz',
        idNumber: '55111222J',
        email: 'participant3@camara-menorca.es',
        phone: '+34 633 333 333',
        currentPhase: 'diagnostic',
      },
    }),
    prisma.participant.create({
      data: {
        userId: participantUsers[3].id,
        courseId: course.id,
        firstName: 'Sofia',
        lastName: 'Lopez Navarro',
        idNumber: '66777888K',
        email: 'participant4@camara-menorca.es',
        phone: '+34 644 444 444',
        currentPhase: 'completion',
      },
    }),
    prisma.participant.create({
      data: {
        userId: participantUsers[4].id,
        courseId: course.id,
        firstName: 'Javier',
        lastName: 'Morales Ruiz',
        idNumber: '77888999L',
        email: 'participant5@camara-menorca.es',
        phone: '+34 655 555 555',
        currentPhase: 'training',
      },
    }),
  ]);

  await prisma.instructorAssignment.createMany({
    data: [
      { instructorId: instructor1.id, participantId: participants[0].id },
      { instructorId: instructor1.id, participantId: participants[1].id },
      { instructorId: instructor1.id, participantId: participants[3].id },
      { instructorId: instructor2.id, participantId: participants[2].id },
      { instructorId: instructor2.id, participantId: participants[4].id },
    ],
  });

  const [miguelPhases, lauraPhases, davidPhases, sofiaPhases, javierPhases] = await Promise.all([
    createDefaultPhases(participants[0].id, 'diagnostic'),
    createDefaultPhases(participants[1].id, 'training'),
    createDefaultPhases(participants[2].id, 'diagnostic'),
    createDefaultPhases(participants[3].id, 'completion'),
    createDefaultPhases(participants[4].id, 'training'),
  ]);

  const lauraAnnex2 = await createAnnex(participants[1].id, lauraPhases.diagnostic.id, 'annex_2', true);
  const sofiaAnnex2 = await createAnnex(participants[3].id, sofiaPhases.diagnostic.id, 'annex_2', true);
  const sofiaAnnex3 = await createAnnex(participants[3].id, sofiaPhases.training.id, 'annex_3', true);
  const sofiaAnnex5 = await createAnnex(participants[3].id, sofiaPhases.completion.id, 'annex_5', true);

  await prisma.signature.createMany({
    data: [
      {
        annexId: lauraAnnex2.id,
        participantId: participants[1].id,
        signerUserId: participantUsers[1].id,
        actorRole: 'participant',
        typedName: 'Laura Rodriguez Mora',
        phaseSnapshot: 'diagnostic',
      },
      {
        annexId: lauraAnnex2.id,
        participantId: participants[1].id,
        signerUserId: instructor1.id,
        actorRole: 'instructor',
        typedName: 'Carlos Martinez Lopez',
        phaseSnapshot: 'diagnostic',
      },
      {
        annexId: sofiaAnnex2.id,
        participantId: participants[3].id,
        signerUserId: participantUsers[3].id,
        actorRole: 'participant',
        typedName: 'Sofia Lopez Navarro',
        phaseSnapshot: 'diagnostic',
      },
      {
        annexId: sofiaAnnex3.id,
        participantId: participants[3].id,
        signerUserId: instructor1.id,
        actorRole: 'instructor',
        typedName: 'Carlos Martinez Lopez',
        phaseSnapshot: 'training',
      },
      {
        annexId: sofiaAnnex5.id,
        participantId: participants[3].id,
        signerUserId: participantUsers[3].id,
        actorRole: 'participant',
        typedName: 'Sofia Lopez Navarro',
        phaseSnapshot: 'completion',
      },
      {
        annexId: sofiaAnnex5.id,
        participantId: participants[3].id,
        signerUserId: instructor1.id,
        actorRole: 'instructor',
        typedName: 'Carlos Martinez Lopez',
        phaseSnapshot: 'completion',
      },
      {
        annexId: sofiaAnnex5.id,
        participantId: participants[3].id,
        signerUserId: admin.id,
        actorRole: 'administrator',
        typedName: 'Ana Garcia Ruiz',
        phaseSnapshot: 'completion',
      },
    ],
  });

  await prisma.attendanceRecord.createMany({
    data: [
      {
        participantId: participants[1].id,
        instructorId: instructor1.id,
        sessionDate: new Date('2025-01-22'),
        hours: 4,
        notes: 'Excelente participacion en la sesion de hoy.',
      },
      {
        participantId: participants[1].id,
        instructorId: instructor1.id,
        sessionDate: new Date('2025-01-29'),
        hours: 4,
        notes: 'Avance constante en modulo practico.',
      },
    ],
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      action: 'seed_initialized',
      resourceType: 'system',
      resourceId: 'demo-data',
      context: { participants: participants.length },
    },
  });

  console.log('Seed completado: cuentas demo y datos iniciales listos.');
  console.log('Super admin: godmode@camara-menorca.es / CamaraMenorca2025');
}

async function createDefaultPhases(participantId: string, currentPhase: 'diagnostic' | 'training' | 'completion') {
  const diagnosticStatus = currentPhase === 'diagnostic' ? 'in_progress' : 'completed';
  const trainingStatus = currentPhase === 'diagnostic' ? 'not_started' : currentPhase === 'training' ? 'in_progress' : 'completed';
  const completionStatus = currentPhase === 'completion' ? 'in_progress' : 'not_started';

  const [diagnostic, training, completion] = await Promise.all([
    prisma.phase.create({
      data: {
        participantId,
        phaseType: 'diagnostic',
        status: diagnosticStatus,
        startedAt: new Date('2025-01-15'),
        completedAt: diagnosticStatus === 'completed' ? new Date('2025-01-20') : null,
      },
    }),
    prisma.phase.create({
      data: {
        participantId,
        phaseType: 'training',
        status: trainingStatus,
        startedAt: trainingStatus === 'not_started' ? null : new Date('2025-01-22'),
        completedAt: trainingStatus === 'completed' ? new Date('2025-03-20') : null,
      },
    }),
    prisma.phase.create({
      data: {
        participantId,
        phaseType: 'completion',
        status: completionStatus,
        startedAt: completionStatus === 'in_progress' ? new Date('2025-03-25') : null,
      },
    }),
  ]);

  return { diagnostic, training, completion };
}

async function createAnnex(
  participantId: string,
  phaseId: string,
  annexType: 'annex_2' | 'annex_3' | 'annex_5',
  signed: boolean
) {
  const fileName = `${annexType}-${participantId}.pdf`;
  const storagePath = `annexes/${participantId}/${fileName}`;
  const contentHash = crypto.createHash('sha256').update(`${participantId}:${phaseId}:${annexType}`).digest('hex');

  return prisma.annex.create({
    data: {
      participantId,
      phaseId,
      annexType,
      status: signed ? 'signed' : 'generated',
      templateVersion: TEMPLATE_VERSION,
      fileName,
      storagePath,
      contentHash,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
