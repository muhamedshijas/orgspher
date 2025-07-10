import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "OrgSphere API Docs",
      version: "1.0.0",
      description: "Membership Management System - Swagger Documentation"
    },
    servers: [
      {
        url: "http://localhost:5000", // change if deploying
      }
    ]
  },
  apis: ["./routes/*.js"], // path to your route files with Swagger comments
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
