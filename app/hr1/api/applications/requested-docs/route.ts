// app/hr1/api/applications/requested-docs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { connectDB } from '@/lib/mongodb';
import { Application } from '@/models/Applications';

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const validateFile = (file: File): string | null => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) return `Invalid type: ${file.name}`;
    if (file.size > MAX_SIZE) return `File too large: ${file.name}`;
    return null;
};

async function uploadToGridFS(file: File, bucket: GridFSBucket): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadStream = bucket.openUploadStream(file.name, {
                metadata: {
                    originalName: file.name,
                    size: file.size,
                    uploadedAt: new Date(),
                    contentType: file.type,
                },
            });
            uploadStream.on('finish', () => resolve(uploadStream.id.toString()));
            uploadStream.on('error', reject);
            uploadStream.end(buffer);
        } catch (err) {
            reject(err);
        }
    });
}

async function handle(request: NextRequest) {
    try {
        const formData = await request.formData();
        const applicationId = formData.get('applicationId')?.toString();

        if (!applicationId || !Types.ObjectId.isValid(applicationId)) {
            return NextResponse.json({ error: 'Valid applicationId is required' }, { status: 400 });
        }

        const validId = formData.get('validId');
        const portfolio = formData.get('portfolio');
        const certificates = formData.getAll('certificates');

        if (!(validId instanceof File) || !(portfolio instanceof File) || certificates.length === 0) {
            return NextResponse.json({ error: 'validId, portfolio, and certificates are required' }, { status: 400 });
        }

        const certFiles = certificates.filter((c): c is File => c instanceof File);
        if (certFiles.length === 0) {
            return NextResponse.json({ error: 'At least one certificate file is required' }, { status: 400 });
        }

        const errors = [
            validateFile(validId),
            validateFile(portfolio),
            ...certFiles.map(validateFile),
        ].filter(Boolean) as string[];
        if (errors.length) {
            return NextResponse.json({ error: errors[0] }, { status: 400 });
        }

        await connectDB();
        const db = mongoose.connection.db;
        if (!db) throw new Error('Database connection not established');
        const bucket = new GridFSBucket(db, { bucketName: 'applicationFiles' });

        const [validIdId, portfolioId, certIds] = await Promise.all([
            uploadToGridFS(validId, bucket),
            uploadToGridFS(portfolio, bucket),
            Promise.all(certFiles.map((f) => uploadToGridFS(f, bucket))),
        ]);

        const now = new Date();
        const validIdDoc = { filename: validId.name, size: validId.size, mimeType: validId.type, fileId: validIdId, uploadedAt: now };
        const portfolioDoc = { filename: portfolio.name, size: portfolio.size, mimeType: portfolio.type, fileId: portfolioId, uploadedAt: now };
        const certificateDocs = certFiles.map((f, i) => ({
            filename: f.name,
            size: f.size,
            mimeType: f.type,
            fileId: certIds[i],
            uploadedAt: now,
        }));

        const result = await Application.updateOne(
            { _id: new Types.ObjectId(applicationId) },
            {
                $set: {
                    validId: validIdDoc,
                    portfolio: portfolioDoc,
                    certificates: certificateDocs,
                    requestedDocsSubmitted: true,
                    requestedDocsSubmittedAt: now,
                },
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Documents submitted', documents: { validId: validIdDoc, portfolio: portfolioDoc, certificates: certificateDocs } });
    } catch (err) {
        console.error('requested-docs error:', err);
        return NextResponse.json({ error: 'Failed to submit documents' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    return handle(req);
}

export async function PATCH(req: NextRequest) {
    return handle(req);
}