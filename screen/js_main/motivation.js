class DailyMotivation {
    constructor() {
        this.quoteContainer = document.querySelector('.quote-container');
        this.customQuotes = [];
        this.initializeMotivation();
    }

    async initializeMotivation() {
        try {
            // First try to get a quote from the API
            const response = await fetch('https://api.quotable.io/random');
            if (!response.ok) throw new Error('Failed to fetch quote');
            
            const data = await response.json();
            this.displayQuote(data.content, data.author);
        } catch (error) {
            console.error('Error fetching quote:', error);
            // If API fails, try to get a fallback quote
            this.displayFallbackQuote();
        }
    }

    displayQuote(quote, author) {
        if (!this.quoteContainer) return;
        
        this.quoteContainer.innerHTML = `
            <div class="daily-motivation-header">
                <span class="material-icons-sharp">auto_awesome</span>
                <h3>Daily Motivation</h3>
            </div>
            <div class="quote-content">
                <p id="quoteText">${quote}</p>
                <p id="quoteAuthor">- ${author}</p>
            </div>
            <div class="quote-actions">
                <button onclick="motivation.refreshQuote()" class="refresh-quote-btn" title="Get New Quote">
                    <span class="material-icons-sharp">refresh</span>
                </button>
            </div>
        `;
    }

    displayFallbackQuote() {
        const fallbackQuotes = [
            { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
            { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }
        ];

        const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        this.displayQuote(randomQuote.quote, randomQuote.author);
    }

    displayError() {
        if (!this.quoteContainer) return;

        this.quoteContainer.innerHTML = `
            <div class="daily-motivation-header">
                <span class="material-icons-sharp">auto_awesome</span>
                <h3>Daily Motivation</h3>
            </div>
            <div class="quote-error">
                <span class="material-icons-sharp">error_outline</span>
                <p>Unable to load motivation quote</p>
                <button onclick="motivation.refreshQuote()" class="retry-btn">
                    <span class="material-icons-sharp">refresh</span> Try Again
                </button>
            </div>
        `;
    }

    showLoading() {
        if (!this.quoteContainer) return;

        this.quoteContainer.innerHTML = `
            <div class="daily-motivation-header">
                <span class="material-icons-sharp">auto_awesome</span>
                <h3>Daily Motivation</h3>
            </div>
            <div class="quote-loading"></div>
        `;
    }

    async refreshQuote() {
        this.showLoading();
        try {
            const response = await fetch('https://api.quotable.io/random');
            if (!response.ok) throw new Error('Failed to fetch quote');
            
            const data = await response.json();
            this.displayQuote(data.content, data.author);
        } catch (error) {
            console.error('Error refreshing quote:', error);
            this.displayError();
        }
    }
}

// Initialize motivation system
let motivation;
document.addEventListener('DOMContentLoaded', () => {
    motivation = new DailyMotivation();
}); 