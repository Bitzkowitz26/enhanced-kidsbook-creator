// Enhanced Kids Book Creator - Main Application
class EnhancedKidsBookCreator {
    constructor() {
        console.log('Enhanced KidsBook Creator initializing...');
        
        this.currentScreen = 'welcome-screen';
        this.currentChapterIndex = -1;
        this.currentPreviewPage = 0;
        this.chapterEditor = null;
        
        this.bookData = {
            title: '',
            age: '',
            length: '',
            artStyle: '',
            storyPrompt: '',
            chapters: [],
            author: 'Young Author',
            images: {},
            approved: false
        };
        
        this.uploadedFiles = [];
        this.generatedImages = {};
        
        this.init();
    }

    init() {
        console.log('Initializing application...');
        this.bindEvents();
        this.initializeQuill();
        this.showScreen('welcome-screen');
    }

    bindEvents() {
        // File upload events
        const uploadZone = document.getElementById('upload-zone');
        const fileInput = document.getElementById('file-input');
        
        if (uploadZone && fileInput) {
            uploadZone.addEventListener('click', () => fileInput.click());
            uploadZone.addEventListener('dragover', this.handleDragOver.bind(this));
            uploadZone.addEventListener('drop', this.handleDrop.bind(this));
            fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        }

        // Form validation
        const storyForm = document.getElementById('story-form');
        if (storyForm) {
            const inputs = storyForm.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('change', this.validateStoryForm.bind(this));
                input.addEventListener('input', this.validateStoryForm.bind(this));
            });
        }
    }

    initializeQuill() {
        // Initialize Quill editor for chapter editing
        if (typeof Quill !== 'undefined') {
            const editorElement = document.getElementById('chapter-editor');
            if (editorElement) {
                this.chapterEditor = new Quill('#chapter-editor', {
                    theme: 'snow',
                    modules: {
                        toolbar: [
                            ['bold', 'italic', 'underline'],
                            ['blockquote', 'code-block'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            [{ 'size': ['small', false, 'large', 'huge'] }],
                            [{ 'color': [] }, { 'background': [] }],
                            ['clean']
                        ]
                    }
                });
            }
        }
    }

    showScreen(screenId) {
        console.log('Showing screen:', screenId);
        
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
            
            // Screen-specific initialization
            if (screenId === 'chapter-management-screen') {
                this.renderChapterList();
            } else if (screenId === 'preview-screen') {
                this.renderPreview();
            }
        }
        
        window.scrollTo(0, 0);
    }

    showLoading(title = 'Processing...', message = 'Please wait while we work on your book') {
        document.getElementById('loading-title').textContent = title;
        document.getElementById('loading-message').textContent = message;
        this.showScreen('loading-screen');
    }

    validateStoryForm() {
        const title = document.getElementById('story-title')?.value.trim() || '';
        const prompt = document.getElementById('story-prompt')?.value.trim() || '';
        const age = document.getElementById('child-age')?.value || '';
        const length = document.getElementById('book-length')?.value || '';
        const artStyle = document.getElementById('art-style')?.value || '';
        
        const isValid = title.length > 0 && prompt.length >= 10 && age && length && artStyle;
        
        const generateBtn = document.getElementById('generate-story-btn');
        if (generateBtn) {
            generateBtn.disabled = !isValid;
        }
        
        return isValid;
    }

    // Story Generation
    async generateStory() {
        if (!this.validateStoryForm()) {
            alert('Please fill in all required fields');
            return;
        }

        // Collect form data
        this.bookData.title = document.getElementById('story-title').value.trim();
        this.bookData.storyPrompt = document.getElementById('story-prompt').value.trim();
        this.bookData.age = document.getElementById('child-age').value;
        this.bookData.length = document.getElementById('book-length').value;
        this.bookData.artStyle = document.getElementById('art-style').value;

        this.showLoading('Generating Story...', 'Creating chapters and content for your book');

        try {
            // Simulate API call for story generation
            await this.simulateStoryGeneration();
            this.showScreen('chapter-management-screen');
        } catch (error) {
            console.error('Error generating story:', error);
            alert('Error generating story. Please try again.');
            this.showScreen('create-new-screen');
        }
    }

    async simulateStoryGeneration() {
        // Simulate story generation with demo content
        const chapterCount = this.bookData.length === 'short' ? 4 : 
                           this.bookData.length === 'medium' ? 6 : 8;
        
        this.bookData.chapters = [];
        
        for (let i = 0; i < chapterCount; i++) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time
            
            this.bookData.chapters.push({
                id: `chapter-${i + 1}`,
                title: `Chapter ${i + 1}: ${this.generateChapterTitle(i + 1)}`,
                content: this.generateChapterContent(i + 1),
                imagePrompt: this.generateImagePrompt(i + 1),
                imageUrl: null,
                hasImage: false
            });
        }
    }

    generateChapterTitle(chapterNum) {
        const titles = [
            'The Beginning of Adventure',
            'A New Discovery',
            'Facing Challenges',
            'Making Friends',
            'The Big Problem',
            'Finding Solutions',
            'Working Together',
            'The Happy Ending'
        ];
        return titles[chapterNum - 1] || `Adventure Continues - Part ${chapterNum}`;
    }

    generateChapterContent(chapterNum) {
        const ageGroup = this.bookData.age;
        const storyTheme = this.bookData.storyPrompt;
        
        // Generate age-appropriate content based on the story prompt
        const baseContent = `This is chapter ${chapterNum} of your story about ${storyTheme}. `;
        
        if (ageGroup === '3-5') {
            return baseContent + 'The characters learn something new and exciting happens. Everyone is happy and safe.';
        } else if (ageGroup === '6-8') {
            return baseContent + 'Our hero faces a small challenge but finds a creative way to solve it with the help of friends.';
        } else if (ageGroup === '9-12') {
            return baseContent + 'The adventure continues as our characters discover more about themselves and the world around them.';
        } else {
            return baseContent + 'Complex emotions and relationships develop as the story explores deeper themes.';
        }
    }

    generateImagePrompt(chapterNum) {
        const style = this.bookData.artStyle;
        const theme = this.bookData.storyPrompt;
        return `${style} illustration of ${theme}, chapter ${chapterNum}, child-friendly, colorful, engaging`;
    }

    // Chapter Management
    renderChapterList() {
        const container = document.getElementById('chapters-container');
        if (!container) return;

        container.innerHTML = '';

        this.bookData.chapters.forEach((chapter, index) => {
            const chapterElement = this.createChapterElement(chapter, index);
            container.appendChild(chapterElement);
        });
    }

    createChapterElement(chapter, index) {
        const div = document.createElement('div');
        div.className = 'chapter-item';
        div.innerHTML = `
            <div class="chapter-header">
                <h4 class="chapter-title">${chapter.title}</h4>
                <div class="chapter-actions">
                    <button class="btn btn-secondary btn-small" onclick="app.editChapter(${index})">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="app.deleteChapter(${index})">
                        🗑️ Delete
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="app.moveChapter(${index}, ${index - 1})" ${index === 0 ? 'disabled' : ''}>
                        ↑
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="app.moveChapter(${index}, ${index + 1})" ${index === this.bookData.chapters.length - 1 ? 'disabled' : ''}>
                        ↓
                    </button>
                </div>
            </div>
            <div class="chapter-content">
                ${chapter.content.substring(0, 150)}${chapter.content.length > 150 ? '...' : ''}
            </div>
            <div class="chapter-image-container">
                ${chapter.hasImage ? 
                    `<img src="${chapter.imageUrl}" alt="${chapter.title}" class="chapter-image">` :
                    `<div class="chapter-image-placeholder">
                        <span>No image generated yet</span>
                        <button class="btn btn-secondary btn-small mt-2" onclick="app.generateSingleImage(${index})">
                            🎨 Generate Image
                        </button>
                    </div>`
                }
            </div>
        `;
        return div;
    }

    editChapter(index) {
        this.currentChapterIndex = index;
        const chapter = this.bookData.chapters[index];
        
        // Populate editor
        document.getElementById('chapter-title-input').value = chapter.title;
        
        if (this.chapterEditor) {
            this.chapterEditor.setText(chapter.content);
        }
        
        // Show chapter image if exists
        const imageContainer = document.getElementById('chapter-image-container');
        if (chapter.hasImage) {
            imageContainer.innerHTML = `<img src="${chapter.imageUrl}" alt="${chapter.title}" class="chapter-image">`;
        } else {
            imageContainer.innerHTML = `
                <div class="chapter-image-placeholder">
                    Click "Generate Image" to create an illustration for this chapter
                </div>
            `;
        }
        
        this.showScreen('chapter-editor-screen');
    }

    saveChapter() {
        if (this.currentChapterIndex === -1) return;
        
        const chapter = this.bookData.chapters[this.currentChapterIndex];
        chapter.title = document.getElementById('chapter-title-input').value;
        
        if (this.chapterEditor) {
            chapter.content = this.chapterEditor.getText();
        }
        
        this.showScreen('chapter-management-screen');
    }

    addNewChapter() {
        const newChapter = {
            id: `chapter-${this.bookData.chapters.length + 1}`,
            title: `Chapter ${this.bookData.chapters.length + 1}: New Chapter`,
            content: 'Write your chapter content here...',
            imagePrompt: '',
            imageUrl: null,
            hasImage: false
        };
        
        this.bookData.chapters.push(newChapter);
        this.renderChapterList();
    }

    deleteChapter(index) {
        if (confirm('Are you sure you want to delete this chapter?')) {
            this.bookData.chapters.splice(index, 1);
            this.renderChapterList();
        }
    }

    moveChapter(fromIndex, toIndex) {
        if (toIndex < 0 || toIndex >= this.bookData.chapters.length) return;
        
        const chapter = this.bookData.chapters.splice(fromIndex, 1)[0];
        this.bookData.chapters.splice(toIndex, 0, chapter);
        this.renderChapterList();
    }

    // Image Generation
    async generateImages() {
        this.showLoading('Generating Images...', 'Creating AI illustrations for your chapters');
        
        try {
            for (let i = 0; i < this.bookData.chapters.length; i++) {
                await this.generateSingleImage(i, false);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
            }
            
            this.showScreen('chapter-management-screen');
        } catch (error) {
            console.error('Error generating images:', error);
            alert('Error generating images. Please try again.');
            this.showScreen('chapter-management-screen');
        }
    }

    async generateSingleImage(chapterIndex, showScreen = true) {
        const chapter = this.bookData.chapters[chapterIndex];
        
        if (showScreen) {
            this.showLoading('Generating Image...', `Creating illustration for ${chapter.title}`);
        }
        
        try {
            // Simulate image generation
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // For demo purposes, use a placeholder image service
            const imageUrl = `https://picsum.photos/400/300?random=${chapterIndex + 1}`;
            
            chapter.imageUrl = imageUrl;
            chapter.hasImage = true;
            
            if (showScreen) {
                this.showScreen('chapter-management-screen');
            }
        } catch (error) {
            console.error('Error generating image:', error);
            if (showScreen) {
                alert('Error generating image. Please try again.');
                this.showScreen('chapter-management-screen');
            }
        }
    }

    async generateChapterImage() {
        if (this.currentChapterIndex === -1) return;
        await this.generateSingleImage(this.currentChapterIndex, false);
        
        // Update the image container
        const chapter = this.bookData.chapters[this.currentChapterIndex];
        const imageContainer = document.getElementById('chapter-image-container');
        if (chapter.hasImage) {
            imageContainer.innerHTML = `<img src="${chapter.imageUrl}" alt="${chapter.title}" class="chapter-image">`;
        }
    }

    async regenerateChapterImage() {
        if (this.currentChapterIndex === -1) return;
        
        // Clear existing image
        const chapter = this.bookData.chapters[this.currentChapterIndex];
        chapter.hasImage = false;
        chapter.imageUrl = null;
        
        // Generate new image
        await this.generateChapterImage();
    }

    // File Upload Handling
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
    }

    processFiles(files) {
        const supportedTypes = ['.txt', '.docx', '.pdf'];
        const validFiles = files.filter(file => {
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            return supportedTypes.includes(extension);
        });

        if (validFiles.length === 0) {
            alert('Please upload supported file types: .txt, .docx, .pdf');
            return;
        }

        validFiles.forEach(file => {
            this.uploadedFiles.push({
                file: file,
                name: file.name,
                size: this.formatFileSize(file.size),
                type: file.type,
                status: 'pending'
            });
        });

        this.renderUploadedFiles();
        this.updateProcessButton();
    }

    renderUploadedFiles() {
        const container = document.getElementById('uploaded-files');
        if (!container) return;

        container.innerHTML = '';

        this.uploadedFiles.forEach((fileData, index) => {
            const fileElement = this.createFileElement(fileData, index);
            container.appendChild(fileElement);
        });
    }

    createFileElement(fileData, index) {
        const div = document.createElement('div');
        div.className = 'uploaded-file';
        
        const icon = this.getFileIcon(fileData.name);
        const statusBadge = this.getStatusBadge(fileData.status);
        
        div.innerHTML = `
            <div class="file-icon">${icon}</div>
            <div class="file-info">
                <div class="file-name">${fileData.name}</div>
                <div class="file-meta">${fileData.size} • ${statusBadge}</div>
            </div>
            <div class="file-actions">
                <button class="btn btn-secondary btn-small" onclick="app.removeUploadedFile(${index})">
                    🗑️ Remove
                </button>
            </div>
        `;
        
        return div;
    }

    getFileIcon(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf': return '📄';
            case 'docx': case 'doc': return '📝';
            case 'txt': return '📄';
            default: return '📄';
        }
    }

    getStatusBadge(status) {
        switch (status) {
            case 'pending': return '<span class="status-badge warning">Pending</span>';
            case 'processed': return '<span class="status-badge success">Processed</span>';
            case 'error': return '<span class="status-badge error">Error</span>';
            default: return '<span class="status-badge">Unknown</span>';
        }
    }

    removeUploadedFile(index) {
        this.uploadedFiles.splice(index, 1);
        this.renderUploadedFiles();
        this.updateProcessButton();
    }

    updateProcessButton() {
        const processBtn = document.getElementById('process-uploads-btn');
        if (processBtn) {
            processBtn.disabled = this.uploadedFiles.length === 0;
        }
    }

    async processUploads() {
        if (this.uploadedFiles.length === 0) return;

        this.showLoading('Processing Files...', 'Extracting content from uploaded files');

        try {
            // Process each file
            for (let i = 0; i < this.uploadedFiles.length; i++) {
                const fileData = this.uploadedFiles[i];
                await this.processFile(fileData);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Convert processed files to chapters
            this.convertFilesToChapters();
            this.showScreen('chapter-management-screen');
        } catch (error) {
            console.error('Error processing files:', error);
            alert('Error processing files. Please try again.');
            this.showScreen('upload-screen');
        }
    }

    async processFile(fileData) {
        // Simulate file processing
        fileData.status = 'processed';
        
        // Extract text content (simulated)
        fileData.extractedText = `Content extracted from ${fileData.name}. This would contain the actual text content from the uploaded file.`;
    }

    convertFilesToChapters() {
        this.bookData.chapters = [];
        
        this.uploadedFiles.forEach((fileData, index) => {
            if (fileData.status === 'processed') {
                this.bookData.chapters.push({
                    id: `chapter-${index + 1}`,
                    title: `Chapter ${index + 1}: ${fileData.name.replace(/\.[^/.]+$/, "")}`,
                    content: fileData.extractedText,
                    imagePrompt: `Illustration for ${fileData.name}`,
                    imageUrl: null,
                    hasImage: false
                });
            }
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Google Drive Integration (Demo)
    connectGoogleDrive() {
        alert('Google Drive integration would be implemented here with proper API keys and authentication.');
    }

    // Preview Functionality
    renderPreview() {
        const container = document.getElementById('preview-pages');
        if (!container) return;

        container.innerHTML = '';
        this.currentPreviewPage = 0;

        // Create title page
        const titlePage = this.createTitlePage();
        container.appendChild(titlePage);

        // Create chapter pages
        this.bookData.chapters.forEach((chapter, index) => {
            const chapterPage = this.createChapterPage(chapter, index + 1);
            container.appendChild(chapterPage);
        });

        this.updatePreviewNavigation();
        this.showPreviewPage(0);
    }

    createTitlePage() {
        const div = document.createElement('div');
        div.className = 'preview-page';
        div.innerHTML = `
            <div style="text-align: center; padding: 4rem 2rem;">
                <h1 style="font-size: 3rem; margin-bottom: 2rem; color: var(--primary-color);">
                    ${this.bookData.title || 'My Story'}
                </h1>
                <p style="font-size: 1.5rem; color: var(--text-secondary); margin-bottom: 3rem;">
                    By ${this.bookData.author}
                </p>
                <div style="font-size: 1rem; color: var(--text-light);">
                    Age Group: ${this.bookData.age}<br>
                    Art Style: ${this.bookData.artStyle}<br>
                    Chapters: ${this.bookData.chapters.length}
                </div>
            </div>
        `;
        return div;
    }

    createChapterPage(chapter, pageNum) {
        const div = document.createElement('div');
        div.className = 'preview-page';
        div.innerHTML = `
            <div style="padding: 2rem;">
                <h2 style="color: var(--primary-color); margin-bottom: 2rem; text-align: center;">
                    ${chapter.title}
                </h2>
                ${chapter.hasImage ? 
                    `<div style="text-align: center; margin-bottom: 2rem;">
                        <img src="${chapter.imageUrl}" alt="${chapter.title}" 
                             style="max-width: 100%; height: 300px; object-fit: cover; border-radius: 12px;">
                    </div>` : 
                    `<div style="text-align: center; margin-bottom: 2rem; padding: 3rem; background: var(--bg-accent); border-radius: 12px; color: var(--text-light);">
                        Image will be generated here
                    </div>`
                }
                <div style="font-size: 1.1rem; line-height: 1.8; color: var(--text-primary);">
                    ${chapter.content.replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
        return div;
    }

    showPreviewPage(pageIndex) {
        const pages = document.querySelectorAll('.preview-page');
        pages.forEach((page, index) => {
            page.classList.toggle('active', index === pageIndex);
        });
        
        this.currentPreviewPage = pageIndex;
        this.updatePreviewNavigation();
    }

    updatePreviewNavigation() {
        const totalPages = document.querySelectorAll('.preview-page').length;
        const indicator = document.getElementById('page-indicator');
        const prevBtn = document.getElementById('prev-page-btn');
        const nextBtn = document.getElementById('next-page-btn');

        if (indicator) {
            indicator.textContent = `Page ${this.currentPreviewPage + 1} of ${totalPages}`;
        }

        if (prevBtn) {
            prevBtn.disabled = this.currentPreviewPage === 0;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPreviewPage === totalPages - 1;
        }
    }

    previousPage() {
        if (this.currentPreviewPage > 0) {
            this.showPreviewPage(this.currentPreviewPage - 1);
        }
    }

    nextPage() {
        const totalPages = document.querySelectorAll('.preview-page').length;
        if (this.currentPreviewPage < totalPages - 1) {
            this.showPreviewPage(this.currentPreviewPage + 1);
        }
    }

    showPreview() {
        if (this.bookData.chapters.length === 0) {
            alert('Please add some chapters first');
            return;
        }
        this.showScreen('preview-screen');
    }

    approveForExport() {
        this.bookData.approved = true;
        this.showScreen('export-screen');
    }

    // Export Functions
    async exportPDF() {
        this.showLoading('Exporting PDF...', 'Creating your PDF book');
        
        try {
            // Simulate PDF generation
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // For demo purposes, create a simple PDF
            if (typeof jsPDF !== 'undefined') {
                const { jsPDF } = window.jsPDF;
                const doc = new jsPDF();
                
                // Add title page
                doc.setFontSize(24);
                doc.text(this.bookData.title || 'My Story', 20, 30);
                doc.setFontSize(16);
                doc.text(`By ${this.bookData.author}`, 20, 50);
                
                // Add chapters
                this.bookData.chapters.forEach((chapter, index) => {
                    doc.addPage();
                    doc.setFontSize(18);
                    doc.text(chapter.title, 20, 30);
                    doc.setFontSize(12);
                    const splitText = doc.splitTextToSize(chapter.content, 170);
                    doc.text(splitText, 20, 50);
                });
                
                doc.save(`${this.bookData.title || 'my-story'}.pdf`);
            } else {
                // Fallback: create a text file
                this.downloadTextFile();
            }
            
            this.showScreen('export-screen');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Error exporting PDF. Please try again.');
            this.showScreen('export-screen');
        }
    }

    async exportEPUB() {
        alert('EPUB export would be implemented here with a proper EPUB library.');
    }

    exportJSON() {
        const dataStr = JSON.stringify(this.bookData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.bookData.title || 'my-story'}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    downloadTextFile() {
        let content = `${this.bookData.title || 'My Story'}\n`;
        content += `By ${this.bookData.author}\n\n`;
        
        this.bookData.chapters.forEach((chapter, index) => {
            content += `${chapter.title}\n`;
            content += `${chapter.content}\n\n`;
        });
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.bookData.title || 'my-story'}.txt`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // Navigation
    goBack() {
        switch (this.currentScreen) {
            case 'create-new-screen':
            case 'upload-screen':
                this.showScreen('welcome-screen');
                break;
            case 'chapter-management-screen':
                this.showScreen('welcome-screen');
                break;
            case 'chapter-editor-screen':
                this.showScreen('chapter-management-screen');
                break;
            case 'preview-screen':
                this.showScreen('chapter-management-screen');
                break;
            case 'export-screen':
                this.showScreen('preview-screen');
                break;
            default:
                this.showScreen('welcome-screen');
        }
    }

    createAnother() {
        // Reset all data
        this.bookData = {
            title: '',
            age: '',
            length: '',
            artStyle: '',
            storyPrompt: '',
            chapters: [],
            author: 'Young Author',
            images: {},
            approved: false
        };
        
        this.uploadedFiles = [];
        this.generatedImages = {};
        this.currentChapterIndex = -1;
        this.currentPreviewPage = 0;
        
        // Clear forms
        const forms = document.querySelectorAll('form');
        forms.forEach(form => form.reset());
        
        if (this.chapterEditor) {
            this.chapterEditor.setText('');
        }
        
        this.showScreen('welcome-screen');
    }
}

// Initialize the application when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new EnhancedKidsBookCreator();
    // Make app globally available for onclick handlers
    window.app = app;
});

// Fallback for immediate access
window.app = {
    showScreen: (screenId) => console.log('App not yet initialized, showing:', screenId)
};