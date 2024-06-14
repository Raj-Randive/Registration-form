import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import fs from "fs/promises";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";

const app = express();
const port = 5000;

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Multer error:", err);
    res.status(500).send({ error: "Multer error occurred" });
  } else {
    next(err);
  }
});

app.use(bodyParser.json());
app.use(cors());

const uri =
  "mongodb+srv://raj:raj1919@cluster0.a6uyrol.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

const Schema = mongoose.Schema;

const registrationSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  contact: { type: String, required: true },
  gender: { type: String, required: true },
  qualification: { type: String, required: true },
  file: { type: String },
  fileSize: { type: String }, // Add fileSize field to store file size
});

const Registration = mongoose.model("Registration", registrationSchema);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Route to handle registration with file upload
app.post("/register", upload.single("file"), async (req, res) => {
  const { firstName, lastName, email, contact, qualification, gender } =
    req.body;
  const file = req.file ? req.file.path : null;

  let fileSize = null; // Initialize fileSize

  // Calculate file size if file is uploaded
  if (file) {
    try {
      const stats = await fs.stat(file);
      fileSize = stats.size;
      if (fileSize / (1024 * 1024) < 1) {
        // In KBs
        fileSize = (fileSize / 1024).toFixed(2);
        fileSize += " KB";
      } else {
        // In MBs
        fileSize = (fileSize / (1024 * 1024)).toFixed(2);
        fileSize += " MB";
      }
    } catch (error) {
      console.error("Error getting file size:", error);
    }
  }

  const newRegistration = new Registration({
    firstName,
    lastName,
    email,
    contact,
    qualification,
    gender,
    file,
    fileSize,
  });

  newRegistration
    .save()
    .then(() => res.status(200).send({ message: "Registration successful" }))
    .catch((err) => res.status(400).send({ error: err.message }));
});

app.get("/uploads/:fileName", (req, res) => {
  const __dirname = process.cwd();
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, "uploads", fileName);
  res.sendFile(filePath);
});

app.get("/registrations", (req, res) => {
  Registration.find()
    .then((registrations) => res.json(registrations))
    .catch((err) => res.status(400).send({ error: err.message }));
});

app.delete("/registrations/:id", async (req, res) => {
  try {
    const registrationId = req.params.id;
    await Registration.findByIdAndDelete(registrationId);
    res.status(200).send({ message: "Registration deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .send({ message: "There was an error deleting the registration", error });
  }
});

// Route to handle updating a registration with or without a file upload
app.put("/registrations/:id", upload.single("file"), async (req, res) => {
  const { firstName, lastName, email, contact, qualification, gender } =
    req.body;
  const file = req.file ? req.file.path : null;

  let fileSize = null; // Initialize fileSize

  if (file) {
    try {
      const stats = await fs.stat(file);
      fileSize = stats.size;
      if (fileSize / (1024 * 1024) < 1) {
        // In KBs
        fileSize = (fileSize / 1024).toFixed(2);
        fileSize += " KB";
      } else {
        // In MBs
        fileSize = (fileSize / (1024 * 1024)).toFixed(2);
        fileSize += " MB";
      }
    } catch (error) {
      console.error("Error getting file size:", error);
    }
  }

  try {
    const registrationId = req.params.id;
    const updateData = {
      firstName,
      lastName,
      email,
      contact,
      qualification,
      gender,
    };

    if (file) {
      updateData.file = file;
      updateData.fileSize = fileSize;
    }

    const updatedRegistration = await Registration.findByIdAndUpdate(
      registrationId,
      updateData,
      { new: true }
    );

    if (!updatedRegistration) {
      return res.status(404).send({ message: "Registration not found" });
    }

    res.status(200).send({ message: "Registration updated successfully" });
  } catch (error) {
    res
      .status(500)
      .send({ message: "There was an error updating the registration", error });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
