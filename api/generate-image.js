// Enhanced Image Generation API
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
        const { prompt, artStyle, chapterTitle, chapterContent, characterConsistency } = req.body;

        if (!prompt || !artStyle) {
            return res.status(400).json({ error: 'Missing required fields: prompt and artStyle' });
        }

        // Generate image based on the prompt and style
        const imageResult = await generateImage({
            prompt,
            artStyle,
            chapterTitle,
            chapterContent,
            characterConsistency
        });

        res.status(200).json({
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
}

async function generateImage({ prompt, artStyle, chapterTitle, chapterContent, characterConsistency }) {
    // This would integrate with DALL-E, Midjourney, Stable Diffusion, or other AI image services
    // For demo purposes, we'll return placeholder images with different styles
    
    const enhancedPrompt = enhancePromptForStyle(prompt, artStyle);
    const safetyPrompt = addSafetyGuidelines(enhancedPrompt);
    
    // In a real implementation, you would call an AI image service here
    // For now, we'll simulate with placeholder images
    const imageUrl = await generatePlaceholderImage(safetyPrompt, artStyle);
    
    return {
        url: imageUrl,
        prompt: safetyPrompt,
        style: artStyle,
        metadata: {
            generatedAt: new Date().toISOString(),
            chapterTitle: chapterTitle || 'Untitled Chapter',
            characterConsistency: characterConsistency || false
        }
    };
}

function enhancePromptForStyle(basePrompt, artStyle) {
    const styleEnhancements = {
        'cartoon': 'vibrant cartoon style, bold outlines, bright colors, child-friendly characters, animated look',
        'watercolor': 'soft watercolor painting, gentle brushstrokes, flowing colors, artistic texture, dreamy atmosphere',
        'digital': 'digital art illustration, clean lines, modern style, polished finish, contemporary look',
        'hand-drawn': 'hand-drawn illustration, sketch-like quality, artistic lines, traditional art feel',
        'realistic': 'realistic illustration, detailed artwork, lifelike characters, natural lighting'
    };

    const enhancement = styleEnhancements[artStyle.toLowerCase()] || 'colorful illustration';
    return `${basePrompt}, ${enhancement}`;
}

function addSafetyGuidelines(prompt) {
    // Add safety guidelines for child-appropriate content
    const safetyAdditions = [
        'child-safe content',
        'appropriate for children',
        'wholesome and positive',
        'no scary or inappropriate elements',
        'bright and cheerful',
        'educational and inspiring'
    ];

    return `${prompt}, ${safetyAdditions.join(', ')}`;
}

async function generatePlaceholderImage(prompt, artStyle) {
    // For demo purposes, return different placeholder images based on style
    // In production, this would call actual AI image generation services
    
    const styleSeeds = {
        'cartoon': Math.floor(Math.random() * 100) + 1,
        'watercolor': Math.floor(Math.random() * 100) + 101,
        'digital': Math.floor(Math.random() * 100) + 201,
        'hand-drawn': Math.floor(Math.random() * 100) + 301,
        'realistic': Math.floor(Math.random() * 100) + 401
    };

    const seed = styleSeeds[artStyle.toLowerCase()] || Math.floor(Math.random() * 500) + 1;
    
    // Using picsum for demo - in production, use actual AI image generation
    return `https://picsum.photos/seed/${seed}/600/400`;
}

// Character consistency helper functions
export async function generateConsistentCharacter(characterDescription, artStyle) {
    // This would maintain character consistency across chapters
    const characterPrompt = `${characterDescription}, consistent character design, same appearance, ${artStyle} style`;
    return await generateImage({
        prompt: characterPrompt,
        artStyle: artStyle,
        characterConsistency: true
    });
}

export function createCharacterReference(characterData) {
    // Create a character reference sheet for consistency
    return {
        id: generateCharacterId(),
        name: characterData.name,
        description: characterData.description,
        visualFeatures: characterData.visualFeatures,
        artStyle: characterData.artStyle,
        referenceImages: characterData.referenceImages || [],
        createdAt: new Date().toISOString()
    };
}

function generateCharacterId() {
    return 'char_' + Math.random().toString(36).substr(2, 9);
}

// Batch image generation for multiple chapters
export async function generateChapterImages(chapters, artStyle, characterReferences = []) {
    const results = [];
    
    for (const chapter of chapters) {
        try {
            const imagePrompt = createChapterImagePrompt(chapter, characterReferences);
            const image = await generateImage({
                prompt: imagePrompt,
                artStyle: artStyle,
                chapterTitle: chapter.title,
                chapterContent: chapter.content,
                characterConsistency: characterReferences.length > 0
            });
            
            results.push({
                chapterId: chapter.id,
                success: true,
                image: image
            });
        } catch (error) {
            results.push({
                chapterId: chapter.id,
                success: false,
                error: error.message
            });
        }
    }
    
    return results;
}

function createChapterImagePrompt(chapter, characterReferences) {
    let prompt = chapter.imagePrompt || `Illustration for ${chapter.title}`;
    
    // Add character consistency if references exist
    if (characterReferences.length > 0) {
        const characterDescriptions = characterReferences.map(char => char.description).join(', ');
        prompt += `, featuring ${characterDescriptions}`;
    }
    
    // Extract key elements from chapter content
    const keyElements = extractVisualElements(chapter.content);
    if (keyElements.length > 0) {
        prompt += `, showing ${keyElements.join(', ')}`;
    }
    
    return prompt;
}

function extractVisualElements(content) {
    const elements = [];
    const text = content.toLowerCase();
    
    // Extract common visual elements
    const visualKeywords = [
        'forest', 'castle', 'mountain', 'ocean', 'garden', 'house', 'tree',
        'animal', 'bird', 'cat', 'dog', 'rabbit', 'bear', 'dragon',
        'magic', 'sparkle', 'rainbow', 'star', 'moon', 'sun',
        'adventure', 'journey', 'path', 'bridge', 'door', 'window'
    ];
    
    visualKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
            elements.push(keyword);
        }
    });
    
    return elements.slice(0, 3); // Limit to top 3 elements
}