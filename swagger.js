const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Project API",
      version: "1.0.0",
    },
     servers: [
      {
        url: "https://real-estate-backend-pi-steel.vercel.app", // 👈 بدون /api
        description: "Vercel deployment",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

module.exports = swaggerJsdoc(options);
