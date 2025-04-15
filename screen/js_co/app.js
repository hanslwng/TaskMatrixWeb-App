document.addEventListener('DOMContentLoaded', () => {
    const editor = new Editor(
        document.getElementById('codeEditor'),
        document.getElementById('lineNumbers')
    );
    
    const preview = new Preview(document.getElementById('previewFrame'));
    const languageSelect = document.getElementById('languageSelect');
    const themeToggle = document.getElementById('themeToggle');

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
}

.box {
    width: 100px;
    height: 100px;
    background: #007bff;
    margin: 20px 0;
}`,
        javascript: `// Write your JavaScript code here
function greet(name = "World") {
    console.log(\`Hello, \${name}!\`);
}

// Test the function
greet();
greet("Developer");`
    };

    // Theme toggle functionality
    const savedTheme = localStorage.getItem('editorTheme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.value = savedTheme;

    themeToggle.addEventListener('change', (e) => {
        const selectedTheme = e.target.value;
        document.documentElement.setAttribute('data-theme', selectedTheme);
        localStorage.setItem('editorTheme', selectedTheme);
        
        // Debug log
        console.log('Theme changed to:', selectedTheme);
    });

    // Language selection
    languageSelect.addEventListener('change', (e) => {
        editor.setValue(defaultContent[e.target.value]);
        preview.update(editor.getValue(), e.target.value);
    });

    // File operations
    document.getElementById('openBtn').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });

    document.getElementById('fileInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const extension = file.name.split('.').pop().toLowerCase();
            if (!['html', 'css', 'js'].includes(extension)) {
                showModal('Only HTML, CSS, and JavaScript files are supported.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                editor.setValue(e.target.result);
                languageSelect.value = extension === 'js' ? 'javascript' : extension;
                preview.update(editor.getValue(), languageSelect.value);
            };
            reader.readAsText(file);
        }
    });

    // Save functionality
    document.getElementById('saveBtn').addEventListener('click', () => {
        const extension = languageSelect.value === 'javascript' ? 'js' : languageSelect.value;
        const blob = new Blob([editor.getValue()], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code.${extension}`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Copy functionality
    document.getElementById('copyBtn').addEventListener('click', async () => {
        if (await Utils.copyToClipboard(editor.getValue())) {
            Utils.showNotification('Code copied to clipboard!', 'success');
        } else {
            Utils.showNotification('Failed to copy code', 'error');
        }
    });

    // Reset functionality
    document.getElementById('resetBtn').addEventListener('click', () => {
        editor.setValue(defaultContent[languageSelect.value]);
        preview.update(editor.getValue(), languageSelect.value);
    });

    // Run functionality
    document.getElementById('runBtn').addEventListener('click', () => {
        preview.update(editor.getValue(), languageSelect.value);
    });

    // Modal handling
    window.closeModal = () => {
        modal.style.display = 'none';
    };

    function showModal(message) {
        document.getElementById('modalMessage').textContent = message;
        modal.style.display = 'flex';
    }

    // Initial setup
    editor.setValue(defaultContent.html);
    preview.update(defaultContent.html, 'html');

    // Tab switching functionality
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs and sections
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tutorial-section').forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding section
            button.classList.add('active');
            document.getElementById(`${button.dataset.lang}-tutorials`).classList.add('active');
        });
    });

    // Handle "Don't show again" checkbox
    document.getElementById('hideTutorials').addEventListener('change', (e) => {
        if (e.target.checked) {
            localStorage.setItem('hideTutorials', 'true');
        } else {
            localStorage.removeItem('hideTutorials');
        }
    });

    // Add Python and Java to language options
    const additionalLanguages = {
        python: `# Write your Python code here
def main():
    print("Hello, World!")
    
    # Basic data types
    name = "Python"
    age = 30
    price = 99.99
    is_awesome = True
    
    # Basic list operations
    fruits = ["apple", "banana", "orange"]
    fruits.append("grape")
    
    # Basic loop
    for fruit in fruits:
        print(f"I like {fruit}")

if __name__ == "__main__":
    main()`,
        
        java: `// Write your Java code here
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Basic data types
        String name = "Java";
        int age = 25;
        double price = 99.99;
        boolean isAwesome = true;
        
        // Basic array operations
        String[] fruits = {"apple", "banana", "orange"};
        
        // Basic loop
        for (String fruit : fruits) {
            System.out.println("I like " + fruit);
        }
    }
}`
    };

    // Add new languages to defaultContent
    Object.assign(defaultContent, additionalLanguages);

    // Modal functionality
    const icons = document.querySelectorAll('.material-icons-sharp[data-modal]');
    const closeButtons = document.querySelectorAll('.close-btn');
    const hideFeatureCheckboxes = document.querySelectorAll('.hide-feature input');

    icons.forEach(icon => {
        const modalId = icon.dataset.modal;
        const modal = document.getElementById(modalId);
        
        if (localStorage.getItem(`hide_${modalId}`) === 'true') {
            icon.parentElement.style.display = 'none';
        }

        icon.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
    });

    closeButtons.forEach(button => {
        const modalId = button.dataset.modal;
        const modal = document.getElementById(modalId);
        
        button.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    });

    hideFeatureCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const feature = e.target.dataset.feature;
            const icon = document.querySelector(`[data-modal="${feature}Modal"]`);
            
            if (e.target.checked) {
                localStorage.setItem(`hide_${feature}Modal`, 'true');
                icon.parentElement.style.display = 'none';
            } else {
                localStorage.removeItem(`hide_${feature}Modal`);
                icon.parentElement.style.display = 'block';
            }
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
});

document.getElementById('tutorialBtn').removeEventListener('click', showTutorialModal);