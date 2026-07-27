import swaggerJSDoc from "swagger-jsdoc";
import { env } from "./env";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "EcoVision AI Enterprise API",
      version: "1.0.0",
      description: "Production-ready RESTful and WebSocket API for AI-Powered Waste Segregation & Circular Economy Platform.",
      contact: {
        name: "EcoVision Engineering Team",
        email: "api@ecovision.ai",
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./server/routes/*.ts", "./server/docs/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
