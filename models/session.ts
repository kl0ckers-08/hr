import mongoose, { Schema, Document } from "mongoose";

interface ISession extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    token: string;
    createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        token: { type: String, required: true },
        createdAt: { type: Date, default: Date.now, expires: "1d" }, // expires in 1 day
    }
);

export default mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);



