const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const projectRoutes = require("./routes/project.routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
require("dotenv").config();
const swaggerUiAssetPath = require("swagger-ui-dist").getAbsoluteFSPath();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/swagger-ui", express.static(swaggerUiAssetPath));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use("/api/projects", projectRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});
app.get("/api-swagger", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Swagger UI</title>
        <link href="/swagger-ui/swagger-ui.css" rel="stylesheet">
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="/swagger-ui/swagger-ui-bundle.js"></script>
        <script>
          SwaggerUIBundle({ url: '/swagger.json', dom_id: '#swagger-ui' });
        </script>
      </body>
    </html>
  `);
});
app.listen(3000, () => {
  console.log("Server running");
});
