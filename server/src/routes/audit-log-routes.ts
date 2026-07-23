import { Role } from '@prisma/client';
import { Router } from 'express';
import { AuditLogController } from '../controllers/audit-log-controller';
import { authenticate } from '../middlewares/auth-middleware';
import { requireRole } from '../middlewares/rbac-middleware';

export const createAuditLogRouter = (controller: AuditLogController, jwtSecret: string): Router => {
  const router = Router();
  router.use(authenticate(jwtSecret));
  router.use(requireRole(Role.ADMIN, Role.MANAGER));

  router.get('/', controller.getAll);

  return router;
};
