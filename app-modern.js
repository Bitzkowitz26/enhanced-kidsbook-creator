// Modern KidsBook Creator - Enhanced JavaScript with all features

class KidsBookCreator {
    constructor() {
        this.currentStep = 1;
        this.characterImage = null;
        this.storyData = null;
        this.generatedImages = {};
        this.currentBook = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.showSection('hero');
    }
    
    setupEventListeners() {
        // Character upload
        const characterUpload = document.getElementById('characterUpload');
        const characterFile = document.getElementById('characterFile');
        
        if (characterUpload && characterFile) {
            characterUpload.addEventListener('click', () => characterFile.click());
            characterUpload.addEventListener('dragover', this.handleDragOver.bind(this));
            characterUpload.addEventListener('drop', this.handleDrop.bind(this));
            characterFile.addEventListener('change', this.handleFileSelect.bind(this));
        }
        
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('href').substring(1);
                this.showSection(section);
                this.updateActiveNavLink(link);
            });
        });
    }
    
    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section, .hero').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
        
        // Special handling for create section
        if (sectionId === 'create') {
            this.resetCreateFlow();
        }
    }
    
    updateActiveNavLink(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }
    
    resetCreateFlow() {
        this.currentStep = 1;
        this.showStep(1);
        this.clearForm();
    }
    
    showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.step-card').forEach(card => {
            card.style.display = 'none';
            card.classList.remove('active');
        });
        
        // Show current step
        const currentStepCard = document.getElementById(`step${stepNumber}`);
        if (currentStepCard) {
            currentStepCard.style.display = 'block';
            currentStepCard.classList.add('active');
        }
        
        this.currentStep = stepNumber;
    }
    
    nextStep(stepNumber) {
        if (this.validateCurrentStep()) {
            this.showStep(stepNumber);
        }
    }
    
    prevStep(stepNumber) {
        this.showStep(stepNumber);
    }
    
    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                const characterName = document.getElementById('characterName').value;
                if (!characterName.trim()) {
                    this.showError('Please enter a character name');
                    return false;
                }
                return true;
            case 2:
                const storyTitle = document.getElementById('storyTitle').value;
                const storyDescription = document.getElementById('storyDescription').value;
                if (!storyTitle.trim() || !storyDescription.trim()) {
                    this.showError('Please fill in all story details');
                    return false;
                }
                return true;
            default:
                return true;
        }
    }
    
    // File handling
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.style.borderColor = 'var(--primary-color)';
        e.currentTarget.style.background = 'var(--gray-50)';
    }
    
    handleDrop(e) {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processCharacterImage(files[0]);
        }
        this.resetUploadArea(e.currentTarget);
    }
    
    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processCharacterImage(file);
        }
    }
    
    processCharacterImage(file) {
        if (!file.type.startsWith('image/')) {
            this.showError('Please select an image file');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.characterImage = e.target.result;
            this.showCharacterPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }
    
    showCharacterPreview(imageSrc) {
        const placeholder = document.querySelector('.upload-placeholder');
        const preview = document.getElementById('characterPreview');
        const image = document.getElementById('characterImage');
        
        if (placeholder && preview && image) {
            placeholder.style.display = 'none';
            preview.style.display = 'block';
            image.src = imageSrc;
        }
    }
    
    removeCharacterImage() {
        this.characterImage = null;
        const placeholder = document.querySelector('.upload-placeholder');
        const preview = document.getElementById('characterPreview');
        
        if (placeholder && preview) {
            placeholder.style.display = 'block';
            preview.style.display = 'none';
        }
    }
    
    resetUploadArea(area) {
        area.style.borderColor = 'var(--gray-300)';
        area.style.background = '';
    }
    
    // Story generation
    async generateStory() {
        const storyData = this.collectStoryData();
        
        if (!this.validateStoryData(storyData)) {
            return;
        }
        
        this.showLoading('Generating your magical story...', 'Our AI is crafting your personalized adventure');
        
        try {
            const response = await fetch('/api/generate-story', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(storyData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to generate story');
            }
            
            const result = await response.json();
            this.storyData = result;
            
            this.hideLoading();
            this.displayStoryPreview(result);
            this.showStep(3);
            
        } catch (error) {
            this.hideLoading();
            this.showError('Failed to generate story. Please try again.');
            console.error('Story generation error:', error);
        }
    }
    
    collectStoryData() {
        return {
            characterName: document.getElementById('characterName').value,
            characterAge: document.getElementById('characterAge').value,
            characterImage: this.characterImage,
            storyTitle: document.getElementById('storyTitle').value,
            storyDescription: document.getElementById('storyDescription').value,
            storyLength: document.getElementById('storyLength').value,
            artStyle: document.getElementById('artStyle').value
        };
    }
    
    validateStoryData(data) {
        if (!data.characterName || !data.storyTitle || !data.storyDescription) {
            this.showError('Please fill in all required fields');
            return false;
        }
        return true;
    }
    
    displayStoryPreview(storyData) {
        const previewContainer = document.getElementById('storyPreview');
        if (!previewContainer) return;
        
        let html = `
            <div class="story-preview-header">
                <h3>${storyData.title}</h3>
                <p class="story-meta">
                    <strong>Character:</strong> ${storyData.characterName} | 
                    <strong>Chapters:</strong> ${storyData.chapters.length} | 
                    <strong>Style:</strong> ${storyData.artStyle}
                </p>
            </div>
            <div class="chapters-preview">
        `;
        
        storyData.chapters.forEach((chapter, index) => {
            html += `
                <div class="chapter-preview" data-chapter="${index}">
                    <div class="chapter-header">
                        <h4>Chapter ${index + 1}: ${chapter.title}</h4>
                        <button class="btn-edit" onclick="editChapter(${index})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                    <div class="chapter-content">
                        <p>${chapter.content}</p>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        previewContainer.innerHTML = html;
    }
    
    async approveStory() {
        if (!this.storyData) {
            this.showError('No story data available');
            return;
        }
        
        this.showLoading('Generating beautiful illustrations...', 'Creating AI artwork for each chapter');
        
        try {
            await this.generateAllImages();
            this.hideLoading();
            this.displayFinalBook();
            this.showStep(4);
        } catch (error) {
            this.hideLoading();
            this.showError('Failed to generate images. Please try again.');
            console.error('Image generation error:', error);
        }
    }
    
    async generateAllImages() {
        const chapters = this.storyData.chapters;
        const totalChapters = chapters.length;
        
        for (let i = 0; i < chapters.length; i++) {
            this.updateProgress((i / totalChapters) * 100, `Generating image ${i + 1} of ${totalChapters}`);
            
            const imagePrompt = this.createImagePrompt(chapters[i], i);
            const imageUrl = await this.generateSingleImage(imagePrompt);
            
            this.generatedImages[i] = imageUrl;
            chapters[i].imageUrl = imageUrl;
        }
        
        this.updateProgress(100, 'All images generated!');
    }
    
    createImagePrompt(chapter, index) {
        const characterName = this.storyData.characterName;
        const artStyle = this.storyData.artStyle;
        
        return `${artStyle} illustration of ${characterName} ${chapter.content.substring(0, 100)}... children's book style, colorful, magical`;
    }
    
    async generateSingleImage(prompt) {
        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    prompt,
                    characterImage: this.characterImage 
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to generate image');
            }
            
            const result = await response.json();
            return result.imageUrl;
        } catch (error) {
            console.error('Image generation error:', error);
            return this.getPlaceholderImage();
        }
    }
    
    getPlaceholderImage() {
        return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f3f4f6"/><text x="200" y="150" text-anchor="middle" fill="%236b7280" font-family="Arial" font-size="16">Illustration Coming Soon</text></svg>`;
    }
    
    displayFinalBook() {
        const previewContainer = document.getElementById('finalBookPreview');
        if (!previewContainer || !this.storyData) return;
        
        let html = `
            <div class="final-book">
                <div class="book-cover-final">
                    <h2>${this.storyData.title}</h2>
                    <div class="cover-character">
                        ${this.characterImage ? `<img src="${this.characterImage}" alt="Character">` : '<i class="fas fa-user-circle"></i>'}
                    </div>
                    <p>Starring ${this.storyData.characterName}</p>
                </div>
                <div class="book-pages">
        `;
        
        this.storyData.chapters.forEach((chapter, index) => {
            html += `
                <div class="book-page">
                    <div class="page-image">
                        <img src="${chapter.imageUrl}" alt="Chapter ${index + 1} illustration">
                    </div>
                    <div class="page-content">
                        <h3>Chapter ${index + 1}: ${chapter.title}</h3>
                        <p>${chapter.content}</p>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
            <div class="book-navigation">
                <button class="btn btn-secondary" onclick="prevPage()">
                    <i class="fas fa-chevron-left"></i> Previous
                </button>
                <span class="page-indicator">Page 1 of ${this.storyData.chapters.length + 1}</span>
                <button class="btn btn-secondary" onclick="nextPage()">
                    Next <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
        
        previewContainer.innerHTML = html;
        this.currentBook = this.storyData;
    }
    
    // Template functions
    useTemplate(templateType) {
        const templates = {
            adventure: {
                title: "The Great Adventure",
                description: "Embark on an exciting quest to save the magical kingdom from an ancient curse",
                artStyle: "fantasy"
            },
            friendship: {
                title: "My New Best Friend",
                description: "A heartwarming story about meeting someone special and learning about friendship",
                artStyle: "watercolor"
            },
            magic: {
                title: "The Magic Within",
                description: "Discover hidden magical powers and learn to use them to help others",
                artStyle: "fantasy"
            },
            animals: {
                title: "Animal Friends Adventure",
                description: "Join talking animals on a fun adventure through the enchanted forest",
                artStyle: "cartoon"
            }
        };
        
        const template = templates[templateType];
        if (template) {
            document.getElementById('storyTitle').value = template.title;
            document.getElementById('storyDescription').value = template.description;
            document.getElementById('artStyle').value = template.artStyle;
            
            this.showSection('create');
            this.showStep(2);
        }
    }
    
    // Export functions
    async exportPDF() {
        if (!this.currentBook) {
            this.showError('No book available to export');
            return;
        }
        
        this.showLoading('Creating PDF...', 'Preparing your book for download');
        
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            
            // Add title page
            pdf.setFontSize(24);
            pdf.text(this.currentBook.title, 20, 30);
            pdf.setFontSize(16);
            pdf.text(`Starring ${this.currentBook.characterName}`, 20, 50);
            
            // Add chapters
            for (let i = 0; i < this.currentBook.chapters.length; i++) {
                pdf.addPage();
                const chapter = this.currentBook.chapters[i];
                
                pdf.setFontSize(18);
                pdf.text(`Chapter ${i + 1}: ${chapter.title}`, 20, 30);
                
                pdf.setFontSize(12);
                const splitText = pdf.splitTextToSize(chapter.content, 170);
                pdf.text(splitText, 20, 50);
            }
            
            pdf.save(`${this.currentBook.title}.pdf`);
            this.hideLoading();
            this.showSuccess('PDF downloaded successfully!');
            
        } catch (error) {
            this.hideLoading();
            this.showError('Failed to create PDF');
            console.error('PDF export error:', error);
        }
    }
    
    exportJSON() {
        if (!this.currentBook) {
            this.showError('No book available to export');
            return;
        }
        
        const dataStr = JSON.stringify(this.currentBook, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.currentBook.title}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showSuccess('JSON exported successfully!');
    }
    
    // UI Helper functions
    showLoading(title, message) {
        const overlay = document.getElementById('loadingOverlay');
        const titleEl = document.getElementById('loadingTitle');
        const messageEl = document.getElementById('loadingMessage');
        
        if (overlay && titleEl && messageEl) {
            titleEl.textContent = title;
            messageEl.textContent = message;
            overlay.style.display = 'flex';
        }
    }
    
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    updateProgress(percentage, message) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const loadingMessage = document.getElementById('loadingMessage');
        
        if (progressFill) progressFill.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${Math.round(percentage)}%`;
        if (loadingMessage) loadingMessage.textContent = message;
    }
    
    showError(message) {
        // Simple alert for now - could be enhanced with a proper modal
        alert(`Error: ${message}`);
    }
    
    showSuccess(message) {
        // Simple alert for now - could be enhanced with a proper modal
        alert(`Success: ${message}`);
        
        // Show success modal
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    clearForm() {
        // Reset all form fields
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type !== 'file') {
                input.value = '';
            }
        });
        
        // Reset character image
        this.removeCharacterImage();
        this.characterImage = null;
        this.storyData = null;
        this.generatedImages = {};
        this.currentBook = null;
    }
}

// Global functions for template usage
function showSection(sectionId) {
    if (window.kidsBookApp) {
        window.kidsBookApp.showSection(sectionId);
    }
}

function nextStep(stepNumber) {
    if (window.kidsBookApp) {
        window.kidsBookApp.nextStep(stepNumber);
    }
}

function prevStep(stepNumber) {
    if (window.kidsBookApp) {
        window.kidsBookApp.prevStep(stepNumber);
    }
}

function generateStory() {
    if (window.kidsBookApp) {
        window.kidsBookApp.generateStory();
    }
}

function approveStory() {
    if (window.kidsBookApp) {
        window.kidsBookApp.approveStory();
    }
}

function useTemplate(templateType) {
    if (window.kidsBookApp) {
        window.kidsBookApp.useTemplate(templateType);
    }
}

function exportPDF() {
    if (window.kidsBookApp) {
        window.kidsBookApp.exportPDF();
    }
}

function exportJSON() {
    if (window.kidsBookApp) {
        window.kidsBookApp.exportJSON();
    }
}

function removeCharacterImage() {
    if (window.kidsBookApp) {
        window.kidsBookApp.removeCharacterImage();
    }
}

function closeModal(modalId) {
    if (window.kidsBookApp) {
        window.kidsBookApp.closeModal(modalId);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.kidsBookApp = new KidsBookCreator();
});

// Add some additional CSS for the story preview
const additionalStyles = `
<style>
.story-preview-header {
    background: var(--primary-gradient);
    color: white;
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
    margin-bottom: var(--spacing-lg);
}

.story-preview-header h3 {
    font-size: 1.5rem;
    margin-bottom: var(--spacing-sm);
}

.story-meta {
    opacity: 0.9;
    font-size: 0.9rem;
}

.chapter-preview {
    background: white;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg);
    margin-bottom: var(--spacing-md);
    overflow: hidden;
}

.chapter-header {
    background: var(--gray-50);
    padding: var(--spacing-md);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--gray-200);
}

.chapter-header h4 {
    margin: 0;
    color: var(--gray-800);
}

.btn-edit {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    font-size: 0.8rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.chapter-content {
    padding: var(--spacing-md);
}

.final-book {
    max-width: 800px;
    margin: 0 auto;
}

.book-cover-final {
    background: var(--primary-gradient);
    color: white;
    padding: var(--spacing-2xl);
    border-radius: var(--radius-xl);
    text-align: center;
    margin-bottom: var(--spacing-xl);
}

.book-cover-final h2 {
    font-size: 2rem;
    margin-bottom: var(--spacing-lg);
}

.cover-character img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid white;
    margin-bottom: var(--spacing-md);
}

.cover-character i {
    font-size: 4rem;
    margin-bottom: var(--spacing-md);
}

.book-page {
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    margin-bottom: var(--spacing-xl);
    overflow: hidden;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-lg);
    padding: var(--spacing-lg);
}

.page-image img {
    width: 100%;
    height: 250px;
    object-fit: cover;
    border-radius: var(--radius-md);
}

.page-content h3 {
    color: var(--primary-color);
    margin-bottom: var(--spacing-md);
}

.book-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--spacing-xl);
    padding: var(--spacing-lg);
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
}

.page-indicator {
    font-weight: 600;
    color: var(--gray-600);
}

@media (max-width: 768px) {
    .book-page {
        grid-template-columns: 1fr;
    }
    
    .book-navigation {
        flex-direction: column;
        gap: var(--spacing-md);
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', additionalStyles);