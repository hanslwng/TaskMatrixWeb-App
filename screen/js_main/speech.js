document.addEventListener('DOMContentLoaded', () => {
    const speechBtn = document.getElementById('speech-btn');
    const output = document.getElementById('output');
    const copyBtn = document.querySelector('.copy-btn');
    const clearBtn = document.querySelector('.clear-btn');
    const pulseRing = document.querySelector('.pulse-ring');
    const micSelect = document.getElementById('mic-select');
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    
    let recognition = null;
    let isRecording = false;
    
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
    } else {
        updateStatus('error', 'Speech recognition is not supported in this browser');
        speechBtn.disabled = true;
    }

    // Get available audio devices
    async function getAudioDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioDevices = devices.filter(device => device.kind === 'audioinput');
            
            // Clear existing options
            micSelect.innerHTML = '<option value="">Select Microphone</option>';
            
            // Add devices to select
            audioDevices.forEach(device => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Microphone ${micSelect.options.length}`;
                micSelect.appendChild(option);
            });

            if (audioDevices.length === 0) {
                updateStatus('error', 'No microphone devices found');
            } else {
                updateStatus('ready', 'Select a microphone to start');
            }
        } catch (error) {
            updateStatus('error', 'Error accessing audio devices');
            console.error('Error getting audio devices:', error);
        }
    }

    // Request microphone permission and get devices
    async function initializeMicrophone() {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            await getAudioDevices();
        } catch (error) {
            updateStatus('error', 'Microphone permission denied');
            console.error('Microphone permission error:', error);
        }
    }

    // Update status indicator
    function updateStatus(state, message) {
        statusDot.className = 'status-dot ' + state;
        statusText.textContent = message;
    }

    // Handle microphone selection
    micSelect.addEventListener('change', async () => {
        if (micSelect.value) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        deviceId: { exact: micSelect.value }
                    }
                });
                updateStatus('active', 'Microphone ready');
                speechBtn.disabled = false;
            } catch (error) {
                updateStatus('error', 'Error accessing selected microphone');
                speechBtn.disabled = true;
            }
        }
    });

    // Speech recognition events
    recognition.onstart = () => {
        updateStatus('active', 'Listening...');
    };

    recognition.onend = () => {
        if (!isRecording) {
            updateStatus('ready', 'Click to start speaking');
        } else {
            recognition.start(); // Restart if still recording
        }
    };

    recognition.onerror = (event) => {
        updateStatus('error', 'Error: ' + event.error);
        stopRecording();
    };

    function startRecording() {
        if (!micSelect.value) {
            showToast('Please select a microphone first');
            return;
        }
        
        output.value = '';
        recognition.start();
        isRecording = true;
        speechBtn.querySelector('.mic-icon').textContent = 'mic_off';
        pulseRing.classList.add('pulse');
        speechBtn.style.background = '#ff4444';
        updateStatus('active', 'Listening...');
    }
    
    function stopRecording() {
        recognition.stop();
        isRecording = false;
        speechBtn.querySelector('.mic-icon').textContent = 'mic';
        pulseRing.classList.remove('pulse');
        speechBtn.style.background = 'var(--color-primary)';
        updateStatus('ready', 'Click to start speaking');
    }
    
    // Initialize microphone on page load
    initializeMicrophone();

    // Existing event listeners
    speechBtn.addEventListener('click', () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    });

    // ... rest of your existing code for copy, clear, and toast functions ...

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Add show class for animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Modal handling
    const modal = document.getElementById('infoModal');
    const showInfoBtn = document.getElementById('showInfo');
    const closeModal = document.querySelector('.close-modal');
    const languageSelect = document.getElementById('language-select');

    showInfoBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Word count functionality
    function updateWordCount(text) {
        const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        document.querySelector('.word-count').textContent = `${wordCount} words`;
    }

    // Download functionality
    document.querySelector('.download-btn').addEventListener('click', () => {
        const text = output.value;
        if (text) {
            const blob = new Blob([text], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'speech-to-text.txt';
            a.click();
            window.URL.revokeObjectURL(url);
            showToast('Text downloaded successfully!');
        } else {
            showToast('No text to download');
        }
    });

    // Language selection
    languageSelect.addEventListener('change', () => {
        if (recognition) {
            recognition.lang = languageSelect.value;
            showToast(`Language changed to ${languageSelect.options[languageSelect.selectedIndex].text}`);
        }
    });

    // Update the recognition.onresult handler
    recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript + ' ';
            }
        }
        output.value = finalTranscript;
        updateWordCount(finalTranscript);
    };

    // Add this to your existing JavaScript
    const aiAssistantBtn = document.getElementById('showAIAssistant');
    const aiAssistantModal = document.getElementById('aiAssistantModal');
    const aiInput = document.getElementById('aiInput');
    const sendBtn = document.querySelector('.send-btn');
    
    // Show AI Assistant modal
    aiAssistantBtn.addEventListener('click', () => {
        // Show awareness modal first
        showAwarenessModal();
    });

    function showAwarenessModal() {
        // Create awareness modal
        const awarenessModal = document.createElement('div');
        awarenessModal.className = 'modal awareness-modal';
        awarenessModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>⚠️ AI Assistant Capabilities</h2>
                </div>
                <div class="modal-body">
                    <p>Please note that this is a basic AI assistant with limited capabilities:</p>
                    <ul>
                        <li>✓ Basic mathematical calculations</li>
                        <li>✓ Simple language translations</li>
                        <li>✓ Basic coding examples</li>
                        <li>✓ General conversation responses</li>
                        <li>✓ Task organization suggestions</li>
                        <li>✗ Not connected to real-time data</li>
                        <li>✗ Cannot browse the internet</li>
                        <li>✗ Limited knowledge base</li>
                    </ul>
                    <p class="disclaimer">This is a demonstration version and not as advanced as ChatGPT or other commercial AI systems.</p>
                </div>
            </div>
        `;
        document.body.appendChild(awarenessModal);

        // Show the modal
        setTimeout(() => awarenessModal.classList.add('show'), 100);

        // Auto close after 10 seconds and show AI assistant
        setTimeout(() => {
            awarenessModal.classList.remove('show');
            setTimeout(() => {
                awarenessModal.remove();
                aiAssistantModal.style.display = 'block';
            }, 300);
        }, 10000);
    }

    // Close AI Assistant modal
    aiAssistantModal.querySelector('.close-modal').addEventListener('click', () => {
        aiAssistantModal.style.display = 'none';
    });

    class AIAssistant {
        constructor() {
            this.context = [];
            this.maxContext = 5;
        }

        async processMessage(message) {
            // Store conversation context
            this.context.push(message);
            if (this.context.length > this.maxContext) {
                this.context.shift();
            }

            // Detect message type and generate appropriate response
            const type = this.detectMessageType(message);
            return await this.generateResponse(message, type);
        }

        detectMessageType(message) {
            const msg = message.toLowerCase();
            
            // Math detection
            if (msg.match(/[\d\+\-\*\/\(\)]/g) && 
                (msg.includes('calculate') || 
                 msg.includes('solve') || 
                 msg.match(/what('s| is) \d/))) {
                return 'math';
            }
            
            // Translation detection
            if (msg.includes('translate') || 
                msg.includes('in french') || 
                msg.includes('in spanish') || 
                msg.includes('in japanese')) {
                return 'translation';
            }
            
            // Code detection
            if (msg.includes('code') || 
                msg.includes('program') || 
                msg.includes('function') ||
                msg.includes('javascript') ||
                msg.includes('python')) {
                return 'code';
            }
            
            // General knowledge/conversation
            return 'general';
        }

        async generateResponse(message, type) {
            switch (type) {
                case 'math':
                    return this.handleMathQuery(message);
                case 'translation':
                    return this.handleTranslation(message);
                case 'code':
                    return this.handleCodeQuery(message);
                default:
                    return this.handleGeneralQuery(message);
            }
        }

        handleMathQuery(message) {
            try {
                // Extract mathematical expression
                let expression = message.replace(/[^0-9\+\-\*\/\(\)\.\s]/g, '').trim();
                
                // Safely evaluate the expression
                const result = Function(`'use strict'; return (${expression})`)();
                
                return `
                    Let me solve that for you:
                    Expression: ${expression}
                    Result: ${result}
                    
                    Would you like me to explain the calculation steps?
                `;
            } catch (error) {
                return "I apologize, but I couldn't process that mathematical expression. Could you please rephrase it or provide the numbers and operations more clearly?";
            }
        }

        handleTranslation(message) {
            // Detect target language
            const targetLang = this.detectTargetLanguage(message);
            
            // Example translations (in real implementation, would use a translation API)
            const translations = {
                french: {
                    "hello": "bonjour",
                    "goodbye": "au revoir",
                    "thank you": "merci"
                },
                spanish: {
                    "hello": "hola",
                    "goodbye": "adiós",
                    "thank you": "gracias"
                }
            };

            return `
                Here's the translation:
                Original: ${message}
                ${targetLang}: [Translation would go here]
                
                I can also provide pronunciation guides and alternative translations if you'd like.
            `;
        }

        handleCodeQuery(message) {
            // Detect programming language and concept
            const concept = this.detectCodingConcept(message);
            
            return `
                Here's a solution for your coding question:
                
                \`\`\`${concept.language}
                ${concept.code}
                \`\`\`
                
                ${concept.explanation}
                
                Would you like me to explain any part in more detail?
            `;
        }

        handleGeneralQuery(message) {
            // Analyze message intent and context
            const intent = this.analyzeIntent(message);
            
            // Generate contextual response
            return this.generateContextualResponse(message, intent);
        }

        analyzeIntent(message) {
            const msg = message.toLowerCase();
            
            if (msg.includes('what') || msg.includes('how') || msg.includes('why')) {
                return 'information';
            } else if (msg.includes('can you') || msg.includes('could you')) {
                return 'capability';
            } else if (msg.includes('help') || msg.includes('assist')) {
                return 'assistance';
            }
            return 'conversation';
        }

        generateContextualResponse(message, intent) {
            // Example knowledge base responses
            const responses = {
                information: [
                    "Based on my knowledge, ",
                    "According to available information, ",
                    "Let me explain that for you. "
                ],
                capability: [
                    "Yes, I can help you with that. ",
                    "I'm capable of assisting you. ",
                    "Let me show you how I can help. "
                ],
                assistance: [
                    "I'll guide you through this. ",
                    "Let me help you with that. ",
                    "Here's how we can solve this: "
                ],
                conversation: [
                    "I understand you're saying ",
                    "Let's discuss ",
                    "That's interesting, "
                ]
            };

            const intro = responses[intent][Math.floor(Math.random() * responses[intent].length)];
            const analysis = this.analyzeMessage(message);
            
            return `${intro}${analysis}`;
        }

        analyzeMessage(message) {
            // Implement sophisticated message analysis
            // This would typically connect to an AI model API
            return `I understand you're interested in "${message}". 
                    Let me provide a detailed response based on my knowledge:
                    
                    1. First, let's break down your query
                    2. Here's what I know about this topic
                    3. Here are some relevant examples or applications
                    
                    Would you like me to elaborate on any of these points?`;
        }

        detectTargetLanguage(message) {
            const msg = message.toLowerCase();
            if (msg.includes('french')) return 'french';
            if (msg.includes('spanish')) return 'spanish';
            if (msg.includes('japanese')) return 'japanese';
            return 'english';
        }

        detectCodingConcept(message) {
            // Example code response
            return {
                language: 'javascript',
                code: 'function example() {\n    console.log("Hello, World!");\n}',
                explanation: 'This is a simple function that demonstrates the concept you asked about.'
            };
        }
    }

    // Update the sendMessage function to use the new AI Assistant
    const aiAssistant = new AIAssistant();

    async function sendMessage() {
        const message = aiInput.value.trim();
        if (message) {
            const chatMessages = document.querySelector('.chat-messages');
            
            // Add user message
            const userMessage = document.createElement('div');
            userMessage.className = 'message user';
            userMessage.innerHTML = `
                <div class="message-content">
                    ${message}
                </div>
            `;
            chatMessages.appendChild(userMessage);
            aiInput.value = '';
            
            // Show typing indicator
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'message assistant typing';
            typingIndicator.innerHTML = `
                <span class="material-icons-sharp bot-icon">smart_toy</span>
                <div class="message-content">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `;
            chatMessages.appendChild(typingIndicator);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Generate AI response
            try {
                const response = await aiAssistant.processMessage(message);
                
                setTimeout(() => {
                    typingIndicator.remove();
                    const aiResponse = document.createElement('div');
                    aiResponse.className = 'message assistant';
                    aiResponse.innerHTML = `
                        <span class="material-icons-sharp bot-icon">smart_toy</span>
                        <div class="message-content">
                            ${response}
                        </div>
                    `;
                    chatMessages.appendChild(aiResponse);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 1500);
            } catch (error) {
                console.error('Error generating response:', error);
            }
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Add these event listeners after initializing other elements
    copyBtn.addEventListener('click', () => {
        const text = output.value;
        if (text) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    showToast('Text copied to clipboard!');
                })
                .catch(err => {
                    showToast('Failed to copy text');
                    console.error('Copy failed:', err);
                });
        } else {
            showToast('No text to copy');
        }
    });

    clearBtn.addEventListener('click', () => {
        if (output.value) {
            output.value = '';
            updateWordCount('');
            showToast('Text cleared');
        } else {
            showToast('Nothing to clear');
        }
    });

    // Initialize particles.js
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 50,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: '#6c63ff' // Matches your primary color
            },
            shape: {
                type: 'circle'
            },
            opacity: {
                value: 0.2,
                random: false,
                anim: {
                    enable: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#6c63ff',
                opacity: 0.2,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'out',
                bounce: false,
                attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 1200
                }
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: {
                    enable: true,
                    mode: 'grab'
                },
                onclick: {
                    enable: true,
                    mode: 'push'
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 140,
                    line_linked: {
                        opacity: 0.5
                    }
                },
                push: {
                    particles_nb: 4
                }
            }
        },
        retina_detect: true
    });
}); 