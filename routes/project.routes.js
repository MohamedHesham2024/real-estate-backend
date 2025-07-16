const express = require("express");
const multer = require("multer");
const path = require("path");
const Project = require("../models/project.model");
const router = express.Router();

// إعداد رفع الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "")),
});

const upload = multer({ storage });

/**
 * @swagger
 * components:
 *   schemas:
 *     Media:
 *       type: object
 *       properties:
 *         index:
 *           type: integer
 *         file_link:
 *           type: string
 *         file_type:
 *           type: string
 *     Project:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *         media:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Media'
 */

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create new project with media files
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               categories:
 *                 type: string
 *                 description: JSON stringified array of categories
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 */
router.post("/", upload.array("media"), async (req, res) => {
  try {
    const { title, description, categories } = req.body;
    const files = req.files;

    let parsedCategories;
    try {
      parsedCategories = JSON.parse(categories);
    } catch (e) {
      parsedCategories = categories.split(",").map((c) => c.trim());
    }

    const media = files.map((file, index) => ({
      index,
      file_link: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
      file_type: file.mimetype,
    }));

    const project = new Project({
      title,
      description,
      categories: parsedCategories,
      media,
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects with optional category filter
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: A list of projects and all available categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projects:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *                 allCategories:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { categories: category } : {};
    const projects = await Project.find(filter);

    // استخراج كل الـ categories بدون تكرار
    const allCategories = new Set();
    const all = await Project.find();
    all.forEach((p) => p.categories.forEach((c) => allCategories.add(c)));

    res.json({ projects, allCategories: [...allCategories] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the project
 *     responses:
 *       200:
 *         description: A single project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 */
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
