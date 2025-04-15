class Preview {
    constructor(previewFrame) {
        this.frame = previewFrame;
    }

    update(content, language) {
        const previewDoc = this.frame.contentDocument || this.frame.contentWindow.document;
        
        switch (language) {
            case 'html':
                this.renderHTML(previewDoc, content);
                break;
            case 'css':
                this.renderCSS(previewDoc, content);
                break;
            case 'javascript':
                this.renderJavaScript(previewDoc, content);
                break;
            case 'python':
                this.simulatePython(previewDoc, content);
                break;
            case 'java':
                this.simulateJava(previewDoc, content);
                break;
        }
    }

    renderHTML(doc, content) {
        doc.open();
        doc.write(content);
        doc.close();
    }

    renderCSS(doc, content) {
        doc.open();
        doc.write(`
            <style>${content}</style>
            <div class="preview">
                <h1>CSS Preview</h1>
                <p>This is a paragraph to preview your CSS styles.</p>
                <button>Sample Button</button>
                <div class="box">Style Test Box</div>
            </div>
        `);
        doc.close();
    }

    renderJavaScript(doc, content) {
        doc.open();
        doc.write(`
            <div id="output" style="font-family: monospace; white-space: pre;"></div>
            <script>
                const output = document.getElementById('output');
                console.log = (...args) => {
                    output.innerHTML += args.join(' ') + '<br>';
                };
                try {
                    ${content}
                } catch (error) {
                    console.log('Error:', error.message);
                }
            </script>
        `);
        doc.close();
    }

    simulatePython(doc, content) {
        doc.open();
        doc.write(`
            <div style="font-family: monospace; white-space: pre; padding: 10px; background: #f5f5f5;">
                <div style="color: #666;">Python Output:</div>
                <div id="output"></div>
            </div>
        `);
        doc.close();

        const output = doc.getElementById('output');
        
        try {
            // Simulate print statements
            const printMatches = content.match(/print\((.*?)\)/g) || [];
            printMatches.forEach(match => {
                const value = match.substring(6, match.length - 1);
                try {
                    const result = new Function(`return ${value}`)();
                    output.innerHTML += `${result}<br>`;
                } catch {
                    output.innerHTML += `${value.replace(/["']/g, '')}<br>`;
                }
            });

            // Simulate list operations
            if (content.includes('[') && content.includes(']')) {
                const listMatches = content.match(/\[(.*?)\]/g) || [];
                listMatches.forEach(list => {
                    output.innerHTML += `List: ${list}<br>`;
                });
            }

            // Simulate basic calculations
            const calcMatches = content.match(/(\d+[\+\-\*\/]\d+)/g) || [];
            calcMatches.forEach(calc => {
                const result = eval(calc);
                output.innerHTML += `Calculation: ${calc} = ${result}<br>`;
            });

        } catch (error) {
            output.innerHTML += `<span style="color: red;">${error.message}</span>`;
        }
    }

    simulateJava(doc, content) {
        doc.open();
        doc.write(`
            <div style="font-family: monospace; white-space: pre; padding: 10px; background: #f5f5f5;">
                <div style="color: #666;">Java Output:</div>
                <div id="output"></div>
            </div>
        `);
        doc.close();

        const output = doc.getElementById('output');
        
        try {
            // Simulate System.out.println
            const printMatches = content.match(/System\.out\.println\((.*?)\);/g) || [];
            printMatches.forEach(match => {
                const value = match
                    .substring(19, match.length - 2)
                    .replace(/["']/g, '');
                output.innerHTML += `${value}<br>`;
            });

            // Simulate array operations
            if (content.includes('{') && content.includes('}')) {
                const arrayMatches = content.match(/\{(.*?)\}/g) || [];
                arrayMatches.forEach(array => {
                    output.innerHTML += `Array: ${array}<br>`;
                });
            }

            // Simulate basic calculations
            const calcMatches = content.match(/(\d+[\+\-\*\/]\d+)/g) || [];
            calcMatches.forEach(calc => {
                const result = eval(calc);
                output.innerHTML += `Calculation: ${calc} = ${result}<br>`;
            });

        } catch (error) {
            output.innerHTML += `<span style="color: red;">${error.message}</span>`;
        }
    }
}