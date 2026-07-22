import path from 'node:path';

import swaggerJSDoc, { Options } from 'swagger-jsdoc';

const toGlobPath = (relativePath: string): string => {
  return path.resolve(__dirname, relativePath).replaceAll('\\', '/');
};

const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Smart Resource Management API',
      version: '1.0.0',
      description:
        'API for intelligent water and electricity resource management.',
    },
    servers: [{ url: 'http://localhost:5000/api/v1' }],
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication and user profile operations.' },
      { name: 'Resources', description: 'Meters and consumption records.' },
      { name: 'Alerts', description: 'Resource alert operations.' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste the JWT returned by the login endpoint.',
        },
      },
    },
  },
  apis: [
    toGlobPath('../routes/**/*.ts'),
    toGlobPath('../controllers/**/*.ts'),
  ],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
