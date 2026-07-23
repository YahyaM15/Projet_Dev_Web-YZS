import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Resource Manager API',
      version: '1.0.0',
      description: 'API pour la gestion des ressources (eau, électricité)',
    },
    servers: [{ url: '/api/v1' }],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
