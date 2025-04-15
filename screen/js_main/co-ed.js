document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('codeEditor');
    const openBtn = document.getElementById('openBtn');
    const saveBtn = document.getElementById('saveBtn');
    const runBtn = document.getElementById('runBtn');
    const resetBtn = document.getElementById('resetBtn');
    const fileInput = document.getElementById('fileInput');
    const previewFrame = document.getElementById('previewFrame');
    const themeToggle = document.getElementById('themeToggle');
    const languageSelect = document.getElementById('languageSelect');
    const modal = document.getElementById('warningModal');

    let currentLanguage = 'html';
    const defaultContent = {
        html: `<!DOCTYPE html>
<html>
<head>
    <title>My Code</title>
</head>
<body>
    <h1>Hello World!</h1>
    <p>Start coding here...</p>
</body>
</html>`,
        css: `/* Write your CSS code here */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f0f0f0;
}

h1 {
    color: #333;
}`,
        javascript: `// Write your JavaScript code here
function greet() {
    alert("Hello, World!");
}

// Call the function
greet();`
    };

    function showModal(message) {
        document.getElementById('modalMessage').textContent = message;
        modal.style.display = 'flex';
    }

    window.closeModal = function() {
        modal.style.display = 'none';
    }

    // Theme toggle
    themeToggle.addEventListener('change', (e) => {
        document.body.classList.toggle('dark-theme', e.target.value === 'dark');
    });

    // Language selection
    languageSelect.addEventListener('change', (e) => {
        currentLanguage = e.target.value;
        editor.value = defaultContent[currentLanguage === 'javascript' ? 'javascript' : currentLanguage];
        updatePreview();
    });

    // Open file
    openBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const extension = file.name.split('.').pop().toLowerCase();
            if (!['html', 'css', 'js'].includes(extension)) {
                showModal('Only HTML, CSS, and JavaScript files are supported.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                editor.value = e.target.result;
                languageSelect.value = extension === 'js' ? 'javascript' : extension;
                currentLanguage = extension === 'js' ? 'javascript' : extension;
                updatePreview();
            };
            reader.readAsText(file);
        }
    });

    // Save file
    saveBtn.addEventListener('click', () => {
        const extension = currentLanguage === 'javascript' ? 'js' : currentLanguage;
        const blob = new Blob([editor.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code.${extension}`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Reset editor
    resetBtn.addEventListener('click', () => {
        editor.value = defaultContent[currentLanguage];
        updatePreview();
    });

    // Run code
    runBtn.addEventListener('click', updatePreview);

    function updatePreview() {
        const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
        
        if (currentLanguage === 'html') {
            previewDoc.open();
            previewDoc.write(editor.value);
            previewDoc.close();
        } else if (currentLanguage === 'css') {
            previewDoc.open();
            previewDoc.write(`
                <style>${editor.value}</style>
                <div class="preview">
                    <h1>CSS Preview</h1>
                    <p>This is a paragraph to preview your CSS styles.</p>
                    <button>Sample Button</button>
                </div>
            `);
            previewDoc.close();
        } else if (currentLanguage === 'javascript') {
            previewDoc.open();
            previewDoc.write(`
                <div id="output"></div>
                <script>
                    // Redirect console.log to output div
                    const output = document.getElementById('output');
                    console.log = (...args) => {
                        output.innerHTML += args.join(' ') + '<br>';
                    };
                    try {
                        ${editor.value}
                    } catch (error) {
                        console.log('Error:', error.message);
                    }
                </script>
            `);
            previewDoc.close();
        }
    }

    // Auto-indent
    editor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
            editor.selectionStart = editor.selectionEnd = start + 4;
        }
    });

    // Initial setup
    editor.value = defaultContent.html;
    updatePreview();
});