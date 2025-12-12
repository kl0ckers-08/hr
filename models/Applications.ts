import { Schema, model, models } from "mongoose";

const ApplicationSchema = new Schema(
    {
        jobId: {
            type: Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        jobTitle: {
            type: String,
            required: true,
            default: "Unknown Job 123",
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
        phone: {  // ADD THIS
            type: String,
            default: "",
        },
        department: {  // ADD THIS
            type: String,
            default: "",
        },
        coverLetter: {
            type: String,
            default: "",
        },
        resume: {
            filename: String,
            size: Number,
            mimeType: String,
            fileId: String,
            uploadedAt: Date,
        },
        applicationLetter: {
            filename: String,
            size: Number,
            mimeType: String,
            fileId: String,
            uploadedAt: Date,
        },
        supportingDocs: [
            {
                filename: String,
                size: Number,
                mimeType: String,
                fileId: String,
                uploadedAt: Date,
            }
        ],
        validId: {
            filename: String,
            size: Number,
            mimeType: String,
            fileId: String,
            uploadedAt: Date,
        },
        portfolio: {
            filename: String,
            size: Number,
            mimeType: String,
            fileId: String,
            uploadedAt: Date,
        },
        certificates: [
            {
                filename: String,
                size: Number,
                mimeType: String,
                fileId: String,
                uploadedAt: Date,
            }
        ],
        requestedDocsSubmitted: {
            type: Boolean,
            default: false,
        },
        requestedDocsSubmittedAt: Date,
        contract: {
            filename: String,
            size: Number,
            mimeType: String,
            fileId: String, 
            uploadedAt: Date,
        },
        signedContract: {
            filename: String,
            size: Number,
            mimeType: String,
            fileId: String,   
            uploadedAt: Date,
        },
        status: {
            type: String,
            enum: ["pending", "reviewed", "shortlisted", "rejected", "hired"],
            default: "pending",
        },
        // ADD THESE NEW FIELDS FOR ONBOARDING
        onboardingStatus: {
            type: String,
            enum: ["pending", "in_progress", "completed"],
            default: "pending",
        },
        transferredToHR2: {
            type: Boolean,
            default: false,
        },
        transferredAt: {
            type: Date,
            default: null,
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
ApplicationSchema.index({ jobId: 1 });
ApplicationSchema.index({ userId: 1 });
ApplicationSchema.index({ email: 1 });
ApplicationSchema.index({ appliedAt: -1 });
ApplicationSchema.index({ status: 1 }); // ADD THIS INDEX
ApplicationSchema.index({ onboardingStatus: 1 }); // ADD THIS INDEX
ApplicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

export const Application = models.Application || model("Application", ApplicationSchema);