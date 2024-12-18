// Import dependencies
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

// Initialize the app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Define Schemas and Models
const QuestionSchema = new mongoose.Schema({
  type: { type: String, required: true },
  label: String,
  options: [String],
  image: String,
});

const FormSchema = new mongoose.Schema({
  title: String,
  headerImage: String,
  questions: [QuestionSchema],
  responses: [{ type: mongoose.Schema.Types.Mixed }],
});

const Form = mongoose.model("Form", FormSchema);

// API Endpoints
// 1. Create a form
app.post("/forms", async (req, res) => {
  try {
    const form = new Form(req.body);
    await form.save();
    res.status(201).json(form);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all forms
app.get("/forms", async (req, res) => {
  try {
    const forms = await Form.find(); // Fetch all forms from the database
    res.status(200).json(forms); // Return forms as JSON
  } catch (error) {
    res.status(500).json({ error: error.message }); // Handle errors
  }
});

// 2. Get a form by ID
app.get("/forms/:id", async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    res.status(200).json(form);
  } catch (error) {
    res.status(404).json({ error: "Form not found" });
  }
});

// 3. Submit a form response
app.post("/forms/:id/response", async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    form.responses.push(req.body);
    await form.save();
    res.status(200).json(form);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
