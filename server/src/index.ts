import 'dotenv/config';

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createApp } from './app';
import { AlertController } from './controllers/alert-controller';
import { AuthController } from './controllers/auth-controller';
import { ResourceController } from './controllers/resource-controller';
import { AlertDao } from './dao/alert.dao';
import { CounterDao } from './dao/counter.dao';
import { MetricDao } from './dao/metric.dao';
import { UserDao } from './dao/user.dao';
import { createApiRouter } from './routes';
import { AlertService } from './services/alert.service';
import { AuthService } from './services/auth.service';
import { CalculationService } from './services/calculation.service';
import { ResourceService } from './services/resource.service';

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

const authService = new AuthService(userDao, jwtSecret);
const calculationService = new CalculationService(metricDao);
const resourceService = new ResourceService(counterDao, calculationService);
const alertService = new AlertService(alertDao, counterDao);

const configuredPort = Number(process.env.PORT);
const port = Number.isInteger(configuredPort) && configuredPort > 0
  ? configuredPort
  : 5000;

const app = createApp({
  apiRouter: createApiRouter({
    jwtSecret,
    authController: new AuthController(authService),
    resourceController: new ResourceController(resourceService),
    alertController: new AlertController(alertService),
  }),
});

const server = app.listen(port, (): void => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`📚 Swagger UI available at http://localhost:${port}/api-docs`);
});

const shutdown = (signal: NodeJS.Signals): void => {
  console.log(`\n🛑 ${signal} received. Closing server...`);
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
