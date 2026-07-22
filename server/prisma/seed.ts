import 'dotenv/config';

import { PrismaClient, ResourceType, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl === undefined) {
  throw new Error('DATABASE_URL must be configured before seeding.');
}

const prisma = new PrismaClient(
  databaseUrl.startsWith('prisma+postgres://')
    ? { accelerateUrl: databaseUrl }
    : { adapter: new PrismaPg(databaseUrl) },
);

const main = async (): Promise<void> => {
  const password = await bcrypt.hash('TestPassword123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'test.user@example.com' },
    update: { name: 'Test User', password, role: Role.RESIDENTIAL },
    create: {
      email: 'test.user@example.com',
      name: 'Test User',
      password,
      role: Role.RESIDENTIAL,
    },
  });

  const waterMeter = await prisma.meter.upsert({
    where: { serialNumber: 'WATER-TEST-001' },
    update: { userId: user.id, location: '12 Rue des Fleurs, Casablanca' },
    create: {
      serialNumber: 'WATER-TEST-001',
      type: ResourceType.WATER,
      location: '12 Rue des Fleurs, Casablanca',
      userId: user.id,
    },
  });
  const electricityMeter = await prisma.meter.upsert({
    where: { serialNumber: 'ELECTRICITY-TEST-001' },
    update: { userId: user.id, location: '12 Rue des Fleurs, Casablanca' },
    create: {
      serialNumber: 'ELECTRICITY-TEST-001',
      type: ResourceType.ELECTRICITY,
      location: '12 Rue des Fleurs, Casablanca',
      userId: user.id,
    },
  });

  await prisma.consumptionRecord.deleteMany({
    where: { meterId: { in: [waterMeter.id, electricityMeter.id] } },
  });
  await prisma.alert.deleteMany({
    where: { meterId: { in: [waterMeter.id, electricityMeter.id] } },
  });

  await prisma.consumptionRecord.createMany({
    data: [
      { meterId: waterMeter.id, value: 112, recordDate: new Date('2026-07-01T08:00:00Z') },
      { meterId: waterMeter.id, value: 118, recordDate: new Date('2026-07-08T08:00:00Z') },
      { meterId: waterMeter.id, value: 126, recordDate: new Date('2026-07-15T08:00:00Z') },
      { meterId: electricityMeter.id, value: 320, recordDate: new Date('2026-07-01T08:00:00Z') },
      { meterId: electricityMeter.id, value: 355, recordDate: new Date('2026-07-08T08:00:00Z') },
      { meterId: electricityMeter.id, value: 540, recordDate: new Date('2026-07-15T08:00:00Z'), isAnomaly: true },
    ],
  });

  await prisma.alert.createMany({
    data: [
      {
        meterId: electricityMeter.id,
        type: ResourceType.ELECTRICITY,
        message: 'Electricity consumption exceeded the configured threshold.',
        severity: 'HIGH',
      },
      {
        meterId: waterMeter.id,
        type: ResourceType.WATER,
        message: 'Water consumption exceeded the configured threshold.',
        severity: 'MEDIUM',
      },
    ],
  });
};

main()
  .then((): void => console.log('Database seed completed.'))
  .catch((error: unknown): void => {
    console.error('Database seed failed.', error);
    process.exitCode = 1;
  })
  .finally(async (): Promise<void> => {
    await prisma.$disconnect();
  });
