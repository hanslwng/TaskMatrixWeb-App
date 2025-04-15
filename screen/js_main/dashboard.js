// Clock and Date
function updateDateTime() {
    const now = new Date();
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('date');
    const greetingElement = document.getElementById('dateGreeting');

    // Update time
    timeElement.textContent = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
    });

    // Update date
    dateElement.textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Update greeting
    const hour = now.getHours();
    let greeting;
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";
    
    greetingElement.textContent = `${greeting} • ${now.toLocaleDateString('en-US', { weekday: 'long' })}`;
}

// Notes functionality
function addNote() {
    const notesContainer = document.getElementById('notesContainer');
    const noteCard = document.createElement('div');
    noteCard.className = 'note-card';
    noteCard.contentEditable = true;
    noteCard.placeholder = 'Type your note here...';
    notesContainer.prepend(noteCard);
}

// Daily Quote
async function fetchDailyQuote() {
    try {
        const response = await fetch('https://api.quotable.io/random');
        const data = await response.json();
        document.getElementById('quoteText').textContent = `"${data.content}"`;
        document.getElementById('quoteAuthor').textContent = `- ${data.author}`;
    } catch (error) {
        console.error('Error fetching quote:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    fetchDailyQuote();
    
    document.getElementById('addNoteBtn').addEventListener('click', addNote);
}); 