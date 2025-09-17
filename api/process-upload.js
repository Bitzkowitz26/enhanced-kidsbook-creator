// File Upload Processing API
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { files, fields } = await parseForm(req);
        const processedFiles = [];

        for (const file of Object.values(files)) {
            const fileArray = Array.isArray(file) ? file : [file];
            
            for (const singleFile of fileArray) {
                const processed = await processUploadedFile(singleFile);
                processedFiles.push(processed);
            }
        }

        res.status(200).json({
            success: true,
            files: processedFiles
        });

    } catch (error) {
        console.error('File processing error:', error);
        res.status(500).json({ 
            error: 'Failed to process uploaded files',
            details: error.message 
        });
    }
}

function parseForm(req) {
    return new Promise((resolve, reject) => {
        const form = formidable({
            maxFileSize: 10 * 1024 * 1024, // 10MB limit
            allowEmptyFiles: false,
            multiples: true
        });

        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields, files });
        });
    });
}

async function processUploadedFile(file) {
    const fileExtension = path.extname(file.originalFilename).toLowerCase();
    const fileName = file.originalFilename;
    const fileSize = file.size;

    let extractedText = '';
    let processingStatus = 'success';
    let error = null;

    try {
        switch (fileExtension) {
            case '.txt':
                extractedText = await processTxtFile(file.filepath);
                break;
            case '.docx':
                extractedText = await processDocxFile(file.filepath);
                break;
            case '.pdf':
                extractedText = await processPdfFile(file.filepath);
                break;
            default:
                throw new Error(`Unsupported file type: ${fileExtension}`);
        }

        // Clean and validate extracted text
        extractedText = cleanExtractedText(extractedText);
        
        if (extractedText.length < 10) {
            throw new Error('Extracted text is too short or empty');
        }

    } catch (err) {
        processingStatus = 'error';
        error = err.message;
        extractedText = '';
    }

    // Clean up temporary file
    try {
        fs.unlinkSync(file.filepath);
    } catch (cleanupError) {
        console.warn('Failed to cleanup temporary file:', cleanupError);
    }

    return {
        originalName: fileName,
        size: fileSize,
        type: fileExtension,
        extractedText: extractedText,
        status: processingStatus,
        error: error,
        wordCount: extractedText.split(/\s+/).length,
        processedAt: new Date().toISOString()
    };
}

async function processTxtFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

async function processDocxFile(filePath) {
    // For demo purposes, simulate DOCX processing
    // In production, you would use libraries like 'mammoth' or 'docx-parser'
    try {
        // Simulated DOCX content extraction
        const simulatedContent = `
        This is extracted content from a DOCX file.
        
        Chapter 1: The Beginning
        Once upon a time, in a magical land far away, there lived a brave little character who was about to embark on the greatest adventure of their life.
        
        Chapter 2: The Journey Begins
        With a heart full of courage and a mind full of wonder, our hero set out on a path that would lead to amazing discoveries and new friendships.
        
        Chapter 3: Challenges and Growth
        Along the way, challenges appeared that tested our character's resolve, but each obstacle became a stepping stone to greater wisdom and strength.
        
        Chapter 4: The Resolution
        In the end, all the lessons learned and friendships made created a beautiful story of growth, courage, and the magic that exists in believing in oneself.
        `;
        
        return simulatedContent.trim();
    } catch (error) {
        throw new Error(`Failed to process DOCX file: ${error.message}`);
    }
}

async function processPdfFile(filePath) {
    // For demo purposes, simulate PDF processing
    // In production, you would use libraries like 'pdf-parse' or 'pdf2pic'
    try {
        // Simulated PDF content extraction
        const simulatedContent = `
        Extracted text from PDF document.
        
        The Adventure of Little Explorer
        
        Page 1:
        In a cozy village nestled between rolling hills and sparkling streams, lived a curious child named Alex who loved to explore and discover new things.
        
        Page 2:
        One sunny morning, Alex found a mysterious map hidden in the attic, showing a path to a secret garden filled with magical creatures and wonderful surprises.
        
        Page 3:
        Following the map's winding path, Alex met friendly animals who became companions on this exciting journey of discovery and friendship.
        
        Page 4:
        The secret garden was more beautiful than Alex had ever imagined, filled with colorful flowers, singing birds, and the most amazing adventures waiting to unfold.
        `;
        
        return simulatedContent.trim();
    } catch (error) {
        throw new Error(`Failed to process PDF file: ${error.message}`);
    }
}

function cleanExtractedText(text) {
    if (!text) return '';
    
    return text
        // Remove excessive whitespace
        .replace(/\s+/g, ' ')
        // Remove special characters that might cause issues
        .replace(/[^\w\s\.,!?;:'"()-]/g, '')
        // Trim whitespace
        .trim()
        // Ensure proper sentence spacing
        .replace(/\.\s*/g, '. ')
        .replace(/\?\s*/g, '? ')
        .replace(/!\s*/g, '! ');
}

// Helper function to split text into chapters
export function splitIntoChapters(text) {
    const chapters = [];
    
    // Try to detect chapter markers
    const chapterMarkers = [
        /chapter\s+\d+/gi,
        /part\s+\d+/gi,
        /section\s+\d+/gi,
        /\d+\./g
    ];
    
    let splitText = [text];
    
    // Try each marker pattern
    for (const marker of chapterMarkers) {
        const matches = text.match(marker);
        if (matches && matches.length > 1) {
            splitText = text.split(marker);
            break;
        }
    }
    
    // If no markers found, split by paragraphs or length
    if (splitText.length === 1) {
        splitText = splitByLength(text, 500); // Split into ~500 word chunks
    }
    
    // Create chapter objects
    splitText.forEach((chunk, index) => {
        if (chunk.trim().length > 50) { // Only include substantial chunks
            chapters.push({
                id: `chapter-${index + 1}`,
                title: `Chapter ${index + 1}`,
                content: chunk.trim(),
                wordCount: chunk.trim().split(/\s+/).length
            });
        }
    });
    
    return chapters;
}

function splitByLength(text, maxWords) {
    const words = text.split(/\s+/);
    const chunks = [];
    
    for (let i = 0; i < words.length; i += maxWords) {
        const chunk = words.slice(i, i + maxWords).join(' ');
        chunks.push(chunk);
    }
    
    return chunks;
}

// Google Docs integration helper
export async function processGoogleDoc(docId, accessToken) {
    // This would integrate with Google Docs API
    // For demo purposes, return simulated content
    
    try {
        // In production, you would use Google Docs API:
        // const response = await fetch(`https://docs.googleapis.com/v1/documents/${docId}`, {
        //     headers: { Authorization: `Bearer ${accessToken}` }
        // });
        
        // Simulated Google Docs content
        const simulatedDoc = {
            title: "My Story from Google Docs",
            content: `
            The Magical Forest Adventure
            
            Chapter 1: Into the Woods
            Sarah stepped carefully into the enchanted forest, where every tree seemed to whisper secrets and every flower glowed with its own inner light.
            
            Chapter 2: Meeting the Forest Friends
            Soon, Sarah met a wise old owl, a playful squirrel, and a gentle deer who would become her guides on this magical journey.
            
            Chapter 3: The Hidden Treasure
            Together, they discovered a hidden clearing where a treasure chest filled with kindness, courage, and friendship waited to be found.
            
            Chapter 4: The Journey Home
            With her new friends and the treasures in her heart, Sarah found her way home, knowing that the magic of the forest would always be with her.
            `
        };
        
        return {
            title: simulatedDoc.title,
            content: simulatedDoc.content.trim(),
            chapters: splitIntoChapters(simulatedDoc.content),
            source: 'google-docs',
            processedAt: new Date().toISOString()
        };
        
    } catch (error) {
        throw new Error(`Failed to process Google Doc: ${error.message}`);
    }
}