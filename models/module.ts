import { Schema, model, models } from "mongoose";

interface ITopic {
    title: string;
    content: string;
    order: number;
}

interface IQuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
}

interface IModule {
    title: string;
    description: string;
    category: string;
    numberOfTopics: number;
    duration: string;
    targetRoles: string[];
    topics: ITopic[];
    quizQuestions: IQuizQuestion[];
    fileName?: string;
    filePath?: string;
    createdAt?: Date;
}

const TopicSchema = new Schema<ITopic>({
    title: { type: String, required: true },
    content: { type: String, required: true },
    order: { type: Number, required: true },
});

const QuizQuestionSchema = new Schema<IQuizQuestion>({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
});

const ModuleSchema = new Schema<IModule>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: String, required: true },
        numberOfTopics: { type: Number, required: true, default: 1 },
        duration: { type: String, default: "4h" },
        targetRoles: { type: [String], default: [] },
        topics: [TopicSchema],
        quizQuestions: [QuizQuestionSchema],
        fileName: { type: String },
        filePath: { type: String },
    },
    { timestamps: true }
);

const Module = models.Module || model<IModule>("Module", ModuleSchema);

export default Module;
 