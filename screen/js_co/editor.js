class Editor {
    constructor(editorElement, lineNumbersElement) {
        this.editor = editorElement;
        this.lineNumbers = lineNumbersElement;
        this.setupEventListeners();
        this.updateLineNumbers();
    }

    setupEventListeners() {
        this.editor.addEventListener('input', () => {
            this.updateLineNumbers();
            this.updateCursorPosition();
            this.updateFileSize();
        });

        this.editor.addEventListener('scroll', () => {
            this.lineNumbers.scrollTop = this.editor.scrollTop;
        });

        this.editor.addEventListener('keydown', (e) => this.handleTabKey(e));
        this.editor.addEventListener('click', () => this.updateCursorPosition());
    }

    updateLineNumbers() {
        const lines = this.editor.value.split('\n').length;
        this.lineNumbers.textContent = Utils.generateLineNumbers(lines);
    }

    updateCursorPosition() {
        const position = Utils.getCursorPosition(this.editor);
        document.getElementById('cursorPosition').textContent = 
            `Line: ${position.line}, Column: ${position.column}`;
    }

    updateFileSize() {
        const bytes = new Blob([this.editor.value]).size;
        document.getElementById('fileSize').textContent = Utils.formatBytes(bytes);
    }

    handleTabKey(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.editor.selectionStart;
            const end = this.editor.selectionEnd;
            this.editor.value = this.editor.value.substring(0, start) + '    ' + 
                               this.editor.value.substring(end);
            this.editor.selectionStart = this.editor.selectionEnd = start + 4;
        }
    }

    setValue(content) {
        this.editor.value = content;
        this.updateLineNumbers();
        this.updateFileSize();
    }

    getValue() {
        return this.editor.value;
    }
}