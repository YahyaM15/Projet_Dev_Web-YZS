import 'dotenv/config';

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createApp } from './app';
import { AlertController } from './controllers/alert-controller';
import { AuditLogController } from './controllers/audit-log-controller';
import { AuthController } from './controllers/auth-controller';
import { ResourceController } from './controllers/resource-controller';
import { AlertDao } from './dao/alert.dao';
import { AuditLogDao } from './dao/audit-log.dao';
import { CounterDao } from './dao/counter.dao';
import { MetricDao } from './dao/metric.dao';
import { UserDao } from './dao/user.dao';
import { createApiRouter } from './routes';
import { AlertService } from './services/alert.service';
import { AuthService } from './services/auth.service';
import { CalculationService } from './services/calculation.service';
import { GeocodingService } from './services/geocoding.service';
import { ResourceService } from './services/resource.service';
import { ConsumptionSimulator } from './simulator';

const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl === undefined) {
  throw new Error('DATABASE_URL must be configured.');
}

const prisma = new PrismaClient(
  databaseUrl.startsWith('prisma+postgres://')
    ? { accelerateUrl: databaseUrl }
    : { adapter: new PrismaPg(databaseUrl) },
);

const jwtSecret = process.env.JWT_SECRET ?? 'development-secret-change-me';
if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET === undefined) {
  throw new Error('JWT_SECRET must be configured in production.');
}

const userDao = new UserDao(prisma);
const counterDao = new CounterDao(prisma);
const metricDao = new MetricDao(prisma);
const alertDao = new AlertDao(prisma);
const auditLogDao = new AuditLogDao(prisma);

const simulatorInterval = Number(process.env.SIMULATOR_INTERVAL_MS);
const resolvedSimulatorInterval = Number.isInteger(simulatorInterval) && simulatorInterval >= 5_000
  ? simulatorInterval
  : 30_000;
const simulatorEnabled = process.env.NODE_ENV !== 'production'
  && process.env.AUTO_SIMULATOR !== 'false';
const simulator = simulatorEnabled
  ? new ConsumptionSimulator(prisma, resolvedSimulatorInterval)
  : undefined;

const authService = new AuthService(userDao, jwtSecret);
const calculationService = new CalculationService(metricDao);
const resourceService = new ResourceService(
  counterDao,
  calculationService,
  new GeocodingService(),
  simulator,
);
const alertService = new AlertService(alertDao, counterDao);

const configuredPort = Number(process.env.PORT);
const port = Number.isInteger(configuredPort) && configuredPort > 0 ? configuredPort : 5000;

const app = createApp({
  apiRouter: createApiRouter({
    jwtSecret,
    authController: new AuthController(authService),
    resourceController: new ResourceController(resourceService),
    alertController: new AlertController(alertService),
    auditLogController: new AuditLogController(auditLogDao),
  }),
});

let server: ReturnType<typeof app.listen> | undefined;

const startServer = async (): Promise<void> => {
  // Existing counters created before automatic geocoding are repaired once
  // when the server starts. Failures are logged without blocking the API.
  await resourceService.geocodeMissingCounters();

  server = app.listen(port, (): void => {
    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log(`📚 Swagger UI available at http://localhost:${port}/api-docs`);
    simulator?.start();
  });
};

void startServer().catch((error: unknown): void => {
  console.error('💥 Failed to start server:', error);
  process.exit(1);
});

const shutdown = (signal: NodeJS.Signals): void => {
  console.log(`\n🛑 ${signal} received. Closing server...`);
  simulator?.stop();

  if (server === undefined) {
    void prisma.$disconnect().finally(() => process.exit(0));
    return;
  }

  server.close((serverError?: Error): void => {
    void prisma
      .$disconnect()
      .then((): void => {
        console.log('✅ Prisma disconnected.');
        process.exit(serverError === undefined ? 0 : 1);
      })
      .catch((disconnectError: unknown): void => {
        console.error('Failed to disconnect Prisma.', disconnectError);
        process.exit(1);
      });
  });
};

process.once('SIGINT', (): void => shutdown('SIGINT'));
process.once('SIGTERM', (): void => shutdown('SIGTERM'));

process.on('uncaughtException', (err: Error): void => {
  console.error('💥 Uncaught exception:', err);
});
process.on('unhandledRejection', (reason: unknown): void => {
  console.error('💥 Unhandled rejection:', reason);
});
