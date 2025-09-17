const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 54035;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static('.'));

// API Routes
app.post('/api/generate-story', async (req, res) => {
    try {
        const { title, storyPrompt, age, length, artStyle } = req.body;

        if (!title || !storyPrompt || !age || !length || !artStyle) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Determine chapter count
        const chapterCount = length === 'short' ? 4 : length === 'medium' ? 6 : 8;

        // Generate story structure
        const story = await generateStoryStructure({
            title,
            storyPrompt,
            age,
            chapterCount,
            artStyle
        });

        res.json({
            success: true,
            story: story
        });

    } catch (error) {
        console.error('Story generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate story',
            details: error.message 
        });
    }
});

app.post('/api/generate-image', async (req, res) => {
    try {
        const { prompt, artStyle, chapterTitle, chapterContent } = req.body;

        if (!prompt || !artStyle) {
            return res.status(400).json({ error: 'Missing required fields: prompt and artStyle' });
        }

        // Generate image (simulated)
        const imageResult = await generateImage({
            prompt,
            artStyle,
            chapterTitle,
            chapterContent
        });

        res.json({
            success: true,
            image: imageResult
        });

    } catch (error) {
        console.error('Image generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate image',
            details: error.message 
        });
    }
});

app.post('/api/process-upload', async (req, res) => {
    try {
        // For demo purposes, simulate file processing
        const processedFiles = [{
            originalName: 'demo-chapter.txt',
            size: 1024,
            type: '.txt',
            extractedText: 'This is a demo chapter extracted from an uploaded file. In a real implementation, this would contain the actual content from the uploaded document.',
            status: 'success',
            error: null,
            wordCount: 25,
            processedAt: new Date().toISOString()
        }];

        res.json({
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
});

// Helper functions
async function generateStoryStructure({ title, storyPrompt, age, chapterCount, artStyle }) {
    const chapters = [];
    
    for (let i = 0; i < chapterCount; i++) {
        const chapterTitle = generateChapterTitle(i + 1, storyPrompt, age);
        const chapterContent = generateChapterContent(i + 1, storyPrompt, age, chapterCount);
        const imagePrompt = generateImagePrompt(chapterTitle, chapterContent, artStyle);
        
        chapters.push({
            id: `chapter-${i + 1}`,
            title: chapterTitle,
            content: chapterContent,
            imagePrompt: imagePrompt,
            imageUrl: null,
            hasImage: false
        });
    }

    return {
        title,
        chapters,
        metadata: {
            age,
            length: chapterCount,
            artStyle,
            generatedAt: new Date().toISOString()
        }
    };
}

function generateChapterTitle(chapterNum, storyPrompt, age) {
    const storyArc = [
        'The Beginning',
        'A New Discovery',
        'The Challenge',
        'Making Friends',
        'The Big Problem',
        'Finding Solutions',
        'Working Together',
        'The Happy Ending'
    ];

    const baseTitle = storyArc[chapterNum - 1] || `Chapter ${chapterNum}`;
    
    if (storyPrompt.toLowerCase().includes('adventure')) {
        return `Chapter ${chapterNum}: ${baseTitle} of the Adventure`;
    } else if (storyPrompt.toLowerCase().includes('magic')) {
        return `Chapter ${chapterNum}: ${baseTitle} - A Magical Tale`;
    } else if (storyPrompt.toLowerCase().includes('animal')) {
        return `Chapter ${chapterNum}: ${baseTitle} in the Animal Kingdom`;
    }
    
    return `Chapter ${chapterNum}: ${baseTitle}`;
}

function generateChapterContent(chapterNum, storyPrompt, age, totalChapters) {
    const progression = chapterNum / totalChapters;
    
    let content = '';
    
    if (progression <= 0.25) {
        content = generateIntroductionContent(storyPrompt, age);
    } else if (progression <= 0.5) {
        content = generateRisingActionContent(storyPrompt, age);
    } else if (progression <= 0.75) {
        content = generateClimaxContent(storyPrompt, age);
    } else {
        content = generateResolutionContent(storyPrompt, age);
    }
    
    return adjustContentForAge(content, age);
}

function generateIntroductionContent(storyPrompt, age) {
    if (storyPrompt.toLowerCase().includes('adventure')) {
        return "Our story begins in a wonderful place where exciting adventures are about to unfold. The main character is curious and brave, ready to explore the world around them.";
    } else if (storyPrompt.toLowerCase().includes('friendship')) {
        return "In a cozy neighborhood, someone special is about to make new friends and learn important lessons about kindness and caring.";
    } else if (storyPrompt.toLowerCase().includes('magic')) {
        return "In a land where magic sparkles in the air, something extraordinary is about to happen that will change everything.";
    }
    
    return "Once upon a time, in a place filled with wonder and possibility, our story begins with someone very special who is about to embark on an amazing journey.";
}

function generateRisingActionContent(storyPrompt, age) {
    return "As our adventure continues, new discoveries are made and interesting characters are met along the way. Each step forward brings new excitement and learning opportunities.";
}

function generateClimaxContent(storyPrompt, age) {
    if (age === '3-5') {
        return "A small challenge appears, but it's nothing that can't be solved with creativity, kindness, and the help of friends.";
    } else {
        return "The biggest challenge of the journey appears, testing everything our characters have learned. But they're ready to face it together.";
    }
}

function generateResolutionContent(storyPrompt, age) {
    return "With teamwork, creativity, and kindness, everything works out wonderfully. Our characters have learned valuable lessons and made lasting friendships. The adventure ends with joy and the promise of more wonderful times ahead.";
}

function adjustContentForAge(content, age) {
    if (age === '3-5') {
        return content.replace(/extraordinary/g, 'special')
                     .replace(/challenging/g, 'hard')
                     .replace(/magnificent/g, 'beautiful');
    } else if (age === '13+') {
        return content + " The experience taught valuable life lessons about perseverance, empathy, and personal growth.";
    }
    
    return content;
}

function generateImagePrompt(chapterTitle, chapterContent, artStyle) {
    const styleDescriptor = {
        'cartoon': 'colorful cartoon style',
        'watercolor': 'soft watercolor painting',
        'digital': 'digital art illustration',
        'hand-drawn': 'hand-drawn sketch style',
        'realistic': 'realistic illustration'
    }[artStyle.toLowerCase()] || 'colorful illustration';

    return `${styleDescriptor}, ${chapterTitle}, child-friendly, bright colors, engaging scene, book illustration`;
}

async function generateImage({ prompt, artStyle, chapterTitle, chapterContent }) {
    // Simulate image generation with placeholder
    const seed = Math.floor(Math.random() * 1000) + 1;
    const imageUrl = `https://picsum.photos/seed/${seed}/600/400`;
    
    return {
        url: imageUrl,
        prompt: prompt,
        style: artStyle,
        metadata: {
            generatedAt: new Date().toISOString(),
            chapterTitle: chapterTitle || 'Untitled Chapter'
        }
    };
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Enhanced KidsBook Creator server running on http://localhost:${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
});

module.exports = app;