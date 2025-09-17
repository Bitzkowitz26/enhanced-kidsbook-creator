// Enhanced Story Generation API
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

        res.status(200).json({
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
}

async function generateStoryStructure({ title, storyPrompt, age, chapterCount, artStyle }) {
    // This would integrate with OpenAI, Claude, or other AI services
    // For now, we'll create a structured response
    
    const chapters = [];
    
    for (let i = 0; i < chapterCount; i++) {
        const chapterTitle = await generateChapterTitle(i + 1, storyPrompt, age);
        const chapterContent = await generateChapterContent(i + 1, storyPrompt, age, chapterCount);
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

async function generateChapterTitle(chapterNum, storyPrompt, age) {
    // Age-appropriate chapter titles based on story progression
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
    
    // Customize based on story prompt
    if (storyPrompt.toLowerCase().includes('adventure')) {
        return `Chapter ${chapterNum}: ${baseTitle} of the Adventure`;
    } else if (storyPrompt.toLowerCase().includes('magic')) {
        return `Chapter ${chapterNum}: ${baseTitle} - A Magical Tale`;
    } else if (storyPrompt.toLowerCase().includes('animal')) {
        return `Chapter ${chapterNum}: ${baseTitle} in the Animal Kingdom`;
    }
    
    return `Chapter ${chapterNum}: ${baseTitle}`;
}

async function generateChapterContent(chapterNum, storyPrompt, age, totalChapters) {
    // Generate age-appropriate content
    const contentLength = age === '3-5' ? 'short' : age === '6-8' ? 'medium' : 'long';
    
    // Story progression based on chapter position
    const progression = chapterNum / totalChapters;
    
    let content = '';
    
    if (progression <= 0.25) {
        // Beginning - Introduction
        content = generateIntroductionContent(storyPrompt, age);
    } else if (progression <= 0.5) {
        // Rising action
        content = generateRisingActionContent(storyPrompt, age);
    } else if (progression <= 0.75) {
        // Climax/Problem
        content = generateClimaxContent(storyPrompt, age);
    } else {
        // Resolution
        content = generateResolutionContent(storyPrompt, age);
    }
    
    return adjustContentForAge(content, age);
}

function generateIntroductionContent(storyPrompt, age) {
    const themes = extractThemes(storyPrompt);
    
    if (themes.includes('adventure')) {
        return "Our story begins in a wonderful place where exciting adventures are about to unfold. The main character is curious and brave, ready to explore the world around them.";
    } else if (themes.includes('friendship')) {
        return "In a cozy neighborhood, someone special is about to make new friends and learn important lessons about kindness and caring.";
    } else if (themes.includes('magic')) {
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
        // Simpler vocabulary and shorter sentences
        return content.replace(/extraordinary/g, 'special')
                     .replace(/challenging/g, 'hard')
                     .replace(/magnificent/g, 'beautiful');
    } else if (age === '13+') {
        // More complex themes and vocabulary
        return content + " The experience taught valuable life lessons about perseverance, empathy, and personal growth.";
    }
    
    return content;
}

function extractThemes(storyPrompt) {
    const themes = [];
    const prompt = storyPrompt.toLowerCase();
    
    if (prompt.includes('adventure') || prompt.includes('journey') || prompt.includes('explore')) {
        themes.push('adventure');
    }
    if (prompt.includes('friend') || prompt.includes('together') || prompt.includes('help')) {
        themes.push('friendship');
    }
    if (prompt.includes('magic') || prompt.includes('wizard') || prompt.includes('fairy')) {
        themes.push('magic');
    }
    if (prompt.includes('animal') || prompt.includes('pet') || prompt.includes('forest')) {
        themes.push('nature');
    }
    
    return themes;
}

function generateImagePrompt(chapterTitle, chapterContent, artStyle) {
    const style = artStyle.toLowerCase();
    const styleDescriptor = {
        'cartoon': 'colorful cartoon style',
        'watercolor': 'soft watercolor painting',
        'digital': 'digital art illustration',
        'hand-drawn': 'hand-drawn sketch style',
        'realistic': 'realistic illustration'
    }[style] || 'colorful illustration';

    return `${styleDescriptor}, ${chapterTitle}, child-friendly, bright colors, engaging scene, book illustration, ${chapterContent.substring(0, 100)}`;
}