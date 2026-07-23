import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const databaseUrl = process.env.DATABASE_URL!;
const prisma = new PrismaClient(
  databaseUrl.startsWith('prisma+postgres://')
    ? { accelerateUrl: databaseUrl }
    : { adapter: new PrismaPg(databaseUrl) },
);

async function simulate() {
  console.log('🤖 Simulator started. Generating consumption data every 5s...');

  const getRandomMeter = async () => {
    const meters = await prisma.meter.findMany();
    return meters[Math.floor(Math.random() * meters.length)];
  };

  setInterval(async () => {
    try {
      const meter = await getRandomMeter();
      const baseValue = meter.type === 'WATER' ? 10 + Math.random() * 20 : 100 + Math.random() * 100;
      const value = Math.round(baseValue * 100) / 100;

      await prisma.consumptionRecord.create({
        data: { meterId: meter.id, value, recordDate: new Date() },
      });

      const recent = await prisma.consumptionRecord.findMany({
        where: { meterId: meter.id },
        orderBy: { recordDate: 'desc' },
        take: 10,
      });
      const avg = recent.reduce((s, r) => s + r.value, 0) / recent.length;

      if (value > avg * 1.5) {
        await prisma.alert.create({
          data: {
            meterId: meter.id,
            type: meter.type,
            message: `⚠️ Consommation anormale: ${value.toFixed(1)} (moyenne: ${avg.toFixed(1)})`,
            severity: value > avg * 2 ? 'HIGH' : 'MEDIUM',
          },
        });
        console.log(`🔔 Alert created for ${meter.serialNumber}: ${value.toFixed(1)} vs avg ${avg.toFixed(1)}`);
      }

      console.log(`📊 ${meter.serialNumber}: ${value.toFixed(1)} ${meter.type === 'WATER' ? 'L' : 'Wh'}`);
    } catch (err) {
      console.error('Simulator error:', err);
    }
  }, 5000);
}

simulate();
