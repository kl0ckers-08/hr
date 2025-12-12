// lib/gridfs.ts
import { GridFSBucket } from "mongodb";
import mongoose from "./mongodb";


export function getGridFSBucket(bucketName = "applicationFiles") {
const db = mongoose.connection.db;
if (!db) throw new Error("Database connection not established");
return new GridFSBucket(db, { bucketName });
}