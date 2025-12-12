// scripts/seedTrainingPrograms.js
const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const trainingProgramSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["Workshop", "Seminar", "Webinar", "Conference"], default: "Workshop" },
  description: String,
  date: { type: Date, required: true },
  time: String,
  location: String,
  facilitator: String,
  maxParticipants: { type: Number, default: 50 },
  registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: { type: String, enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"], default: "Upcoming" },
  rating: { type: Number, min: 0, max: 5 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const TrainingProgram = mongoose.models.TrainingProgram || mongoose.model("TrainingProgram", trainingProgramSchema);

const trainingPrograms = [
  {
    title: "Teaching Excellence Workshop",
    type: "Workshop",
    description: "Interactive workshop on modern teaching methodologies",
    date: new Date("2025-11-20"),
    time: "9:00 AM - 4:00 PM",
    location: "Room 301",
    facilitator: "Dr. Sarah Williams",
    maxParticipants: 20,
    registrations: [],
    attendees: [],
    status: "Upcoming",
  },
  {
    title: "AI in Education Seminar",
    type: "Seminar",
    description: "Exploring AI applications in educational settings",
    date: new Date("2025-11-20"),
    time: "2:00 PM - 5:00 PM",
    location: "Auditorium",
    facilitator: "Prof. Michael Chen",
    maxParticipants: 15,
    registrations: [],
    attendees: [],
    status: "Upcoming",
  },
  {
    title: "Digital Learning Tools Workshop",
    type: "Workshop",
    description: "Hands-on training for digital learning platforms",
    date: new Date("2025-12-05"),
    time: "10:00 AM - 3:00 PM",
    location: "Computer Lab A",
    facilitator: "Ms. Emily Rodriguez",
    maxParticipants: 25,
    registrations: [],
    attendees: [],
    status: "Upcoming",
  },
  {
    title: "Leadership Development Program",
    type: "Conference",
    description: "Building leadership skills for educators",
    date: new Date("2025-10-15"),
    time: "9:00 AM - 5:00 PM",
    location: "Conference Hall",
    facilitator: "Dr. James Anderson",
    maxParticipants: 30,
    registrations: [],
    attendees: [],
    status: "Completed",
    rating: 4.5,
  },
  {
    title: "Classroom Management Strategies",
    type: "Webinar",
    description: "Effective techniques for classroom management",
    date: new Date("2025-09-28"),
    time: "2:00 PM - 4:00 PM",
    location: "Online",
    facilitator: "Dr. Lisa Thompson",
    maxParticipants: 50,
    registrations: [],
    attendees: [],
    status: "Completed",
    rating: 4.2,
  },
];

async function seedTrainingPrograms() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing training programs
    await TrainingProgram.deleteMany({});
    console.log("Cleared existing training programs");

    // Insert new training programs
    const result = await TrainingProgram.insertMany(trainingPrograms);
    console.log(`Inserted ${result.length} training programs`);

    console.log("\nTraining Programs seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding training programs:", error);
    process.exit(1);
  }
}

seedTrainingPrograms();
