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
    servers: [{ url: "https://orgspher.onrender.com" },],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ["./routes/*.js"],
};


const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };


// dev url https://orgspher.onrender.com
// base url http://localhost:5000/