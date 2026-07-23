import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL must be configured.');

const prisma = new PrismaClient(
  databaseUrl.startsWith('prisma+postgres://')
    ? { accelerateUrl: databaseUrl }
    : { adapter: new PrismaPg(databaseUrl) },
);

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await argon2.hash('TestPassword123!');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: { password: hashedPassword },
    create: {
      email: 'user@example.com',
      password: hashedPassword,
      name: 'Utilisateur',
      role: 'RESIDENTIAL',
    },
  });

  const metersData = [
    { serialNumber: 'WTR-001', type: 'WATER' as const, location: 'Casablanca, Rue 1', latitude: 33.5731, longitude: -7.5898, userId: admin.id },
    { serialNumber: 'WTR-002', type: 'WATER' as const, location: 'Rabat, Avenue 2', latitude: 33.9716, longitude: -6.8498, userId: user.id },
    { serialNumber: 'WTR-003', type: 'WATER' as const, location: 'Tanger, Place 3', latitude: 35.7673, longitude: -5.7998, userId: user.id },
    { serialNumber: 'ELC-001', type: 'ELECTRICITY' as const, location: 'Casablanca, Rue 4', latitude: 33.5898, longitude: -7.6031, userId: admin.id },
    { serialNumber: 'ELC-002', type: 'ELECTRICITY' as const, location: 'Rabat, Avenue 5', latitude: 33.9806, longitude: -6.8667, userId: user.id },
    { serialNumber: 'ELC-003', type: 'ELECTRICITY' as const, location: 'Tanger, Place 6', latitude: 35.7646, longitude: -5.8050, userId: user.id },
  ];

  const meters = await Promise.all(
    metersData.map((m) =>
      prisma.meter.upsert({
        where: { serialNumber: m.serialNumber },
        update: {},
        create: m,
      }),
    ),
  );

  const now = new Date();
  for (const meter of meters) {
    const records = [];
    for (let d = 0; d < 30; d++) {
      for (let h = 0; h < 24; h++) {
        const baseValue = meter.type === 'WATER' ? 15 + Math.random() * 10 : 120 + Math.random() * 80;
        const hourFactor = (h >= 6 && h <= 9) || (h >= 18 && h <= 22) ? 1.5 : 0.7;
        const value = Math.round(baseValue * hourFactor * 100) / 100;
        records.push({
          meterId: meter.id,
          value,
          recordDate: new Date(now.getTime() - ((30 - d - 1) * 86400000 + (23 - h) * 3600000)),
          isAnomaly: false,
        });
      }
    }
    await prisma.consumptionRecord.createMany({ data: records, skipDuplicates: true });
  }

  const alerts = [
    { meterId: meters[0].id, type: 'WATER' as const, message: 'Consommation excessive détectée sur WTR-001', severity: 'HIGH' as const, isResolved: false },
    { meterId: meters[3].id, type: 'ELECTRICITY' as const, message: 'Pic de consommation inhabituel sur ELC-001', severity: 'CRITICAL' as const, isResolved: false },
    { meterId: meters[1].id, type: 'WATER' as const, message: 'Fuite potentielle détectée sur WTR-002', severity: 'MEDIUM' as const, isResolved: false },
    { meterId: meters[4].id, type: 'ELECTRICITY' as const, message: 'Variation anormale détectée sur ELC-002', severity: 'LOW' as const, isResolved: true },
  ];

  for (const alert of alerts) {
    await prisma.alert.create({ data: alert });
  }

  const auditLogs = [
    { action: 'REGISTER' as const, email: 'admin@example.com', ipAddress: '192.168.1.1', details: 'Admin created' },
    { action: 'LOGIN_SUCCESS' as const, userId: admin.id, email: 'admin@example.com', ipAddress: '192.168.1.1' },
    { action: 'LOGIN_SUCCESS' as const, userId: user.id, email: 'user@example.com', ipAddress: '192.168.1.2' },
    { action: 'LOGIN_FAILED' as const, email: 'unknown@test.com', ipAddress: '10.0.0.1', details: 'Invalid password' },
    { action: 'LOGIN_FAILED' as const, email: 'admin@example.com', ipAddress: '203.0.113.5', details: 'Wrong password attempt' },
    { action: 'LOGIN_FAILED' as const, email: 'admin@example.com', ipAddress: '203.0.113.5', details: 'Brute force attempt' },
    { action: 'LOGIN_SUCCESS' as const, userId: admin.id, email: 'admin@example.com', ipAddress: '203.0.113.5' },
    { action: 'RECORD_CREATED' as const, userId: admin.id, email: 'admin@example.com', ipAddress: '192.168.1.1', details: 'Bulk import: 720 records' },
    { action: 'ANOMALY_DETECTED' as const, userId: admin.id, email: 'admin@example.com', ipAddress: '192.168.1.1', details: 'Water meter WTR-001: 3.2x daily average' },
    { action: 'ANOMALY_DETECTED' as const, userId: user.id, email: 'user@example.com', ipAddress: '192.168.1.2', details: 'Electric meter ELC-001: 2.8x daily average' },
    { action: 'THRESHOLD_CONFIGURED' as const, userId: admin.id, email: 'admin@example.com', ipAddress: '192.168.1.1', details: 'Water threshold set to 150L/day' },
    { action: 'COUNTER_CREATED' as const, userId: admin.id, email: 'admin@example.com', ipAddress: '192.168.1.1', details: 'Meter ELC-003 created' },
  ];

  for (const log of auditLogs) {
    await prisma.auditLog.create({ data: log });
  }

  console.log('✅ Seed complete: 2 users, 6 meters, 4320 records, 4 alerts, 12 audit logs');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
