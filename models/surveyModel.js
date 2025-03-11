const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fields: [{ key: String, value: String }],
});

const DepartmentSchema = new mongoose.Schema({
  departmentName: { type: String, required: true },
  sections: [SectionSchema],
});

const SurveySchema = new mongoose.Schema({
  department: DepartmentSchema,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Survey", SurveySchema);
