const express = require("express");
const router = express.Router();
const Survey = require("../models/surveyModel");

// POST API to insert survey data
router.post("/", async (req, res) => {
    try {
      const requestData = req.body; // Incoming JSON data
  
      // Extract department name (key of JSON)
      const departmentName = Object.keys(requestData)[0];
  
      // Convert nested JSON to sections format
      const sections = Object.entries(requestData[departmentName]).map(
        ([sectionName, sectionData]) => ({
          name: sectionName,
          fields: Array.isArray(sectionData)
            ? sectionData.map((field) => ({ key: field.key, value: field.value }))
            : Object.entries(sectionData).map(([key, value]) => ({
                key,
                value: typeof value === "object" ? JSON.stringify(value) : value,
              })),
        })
      );
  
      // Construct document to insert
      const newSurvey = new Survey({
        department: {
          departmentName,
          sections,
        },
      });
  
      await newSurvey.save();
      res.status(201).json({ message: "Survey data saved successfully!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// GET API to fetch all survey data
router.get("/", async (req, res) => {
  try {
    const surveys = await Survey.find();
    res.status(200).json(surveys);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/departments", async (req, res) => {
  try {
    const departments = await Survey.find({}, "department.departmentName _id");

    // Transform the response
    const formattedDepartments = departments.map((dept) => ({
      _id: dept._id,
      departmentName: dept.department.departmentName,
    }));

    res.status(200).json(formattedDepartments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/sections/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the department by its _id
    const survey = await Survey.findById(id);

    if (!survey) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Extract section _id and name
    const sections = survey.department.sections.map((section) => ({
      _id: section._id,
      name: section.name,
    }));

    res.status(200).json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET API to fetch key-value pairs inside a specific section of a department
router.get("/:departmentId/sections/:sectionId", async (req, res) => {
  try {
    const { departmentId, sectionId } = req.params;

    // Find the department by its _id
    const survey = await Survey.findById(departmentId);

    if (!survey) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Find the section inside the department
    const section = survey.department.sections.find(
      (sec) => sec._id.toString() === sectionId
    );

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Extract key-value pairs from the section
    const fields = section.fields.map((field) => ({
      key: field.key,
      value: field.value,
    }));

    res.status(200).json({
      sectionId: section._id,
      sectionName: section.name,
      fields,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
