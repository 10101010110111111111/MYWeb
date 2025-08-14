document.addEventListener('DOMContentLoaded', function() {
    const folderInput = document.getElementById('folderInput');
    const resultSection = document.getElementById('resultSection');
    const structureOutput = document.getElementById('structureOutput');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    let folderStructure = '';

    // Handle folder selection
    folderInput.addEventListener('change', function(event) {
        const files = event.target.files;
        if (files.length > 0) {
            processFolder(files);
        }
    });

    // Process the uploaded folder
    function processFolder(files) {
        const fileMap = new Map();
        const folderName = getFolderName(files[0].webkitRelativePath);
        
        // Group files by their directory structure
        for (let file of files) {
            const path = file.webkitRelativePath;
            const parts = path.split('/');
            
            if (parts.length > 1) {
                const fileName = parts[parts.length - 1];
                const dirPath = parts.slice(0, -1).join('/');
                
                if (!fileMap.has(dirPath)) {
                    fileMap.set(dirPath, []);
                }
                fileMap.get(dirPath).push(fileName);
            }
        }

        // Build the folder structure string
        folderStructure = buildFolderStructure(folderName, fileMap);
        
        // Display the result
        structureOutput.textContent = folderStructure;
        resultSection.style.display = 'block';
        
        // Scroll to result
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Get the main folder name from the path
    function getFolderName(relativePath) {
        return relativePath.split('/')[0];
    }

    // Build the folder structure as a string
    function buildFolderStructure(folderName, fileMap) {
        let structure = `${folderName}\n`;
        
        // Sort directories alphabetically
        const sortedDirs = Array.from(fileMap.keys()).sort();
        
        for (let dir of sortedDirs) {
            const indent = getIndentation(dir, folderName);
            structure += `${indent}${dir.split('/').pop()}\n`;
            
            // Sort files alphabetically within each directory
            const sortedFiles = fileMap.get(dir).sort();
            for (let file of sortedFiles) {
                structure += `${indent}--${file}\n`;
            }
        }
        
        return structure;
    }

    // Get the appropriate indentation for each level
    function getIndentation(path, rootFolder) {
        const depth = path.split('/').length;
        return '-'.repeat(depth);
    }

    // Copy to clipboard functionality
    copyBtn.addEventListener('click', function() {
        if (folderStructure) {
            navigator.clipboard.writeText(folderStructure).then(function() {
                // Visual feedback
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '✅ Copied!';
                copyBtn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
                }, 2000);
            }).catch(function(err) {
                console.error('Failed to copy: ', err);
                alert('Failed to copy to clipboard. Please try selecting and copying manually.');
            });
        }
    });

    // Download as text file functionality
    downloadBtn.addEventListener('click', function() {
        if (folderStructure) {
            const blob = new Blob([folderStructure], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'folder-structure.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Visual feedback
            const originalText = downloadBtn.innerHTML;
            downloadBtn.innerHTML = '✅ Downloaded!';
            downloadBtn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
            
            setTimeout(() => {
                downloadBtn.innerHTML = originalText;
                downloadBtn.style.background = 'linear-gradient(45deg, #007bff, #0056b3)';
            }, 2000);
        }
    });

    // Drag and drop functionality
    const uploadSection = document.querySelector('.upload-section');
    
    uploadSection.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadSection.style.border = '3px dashed #667eea';
        uploadSection.style.background = '#f8f9ff';
    });

    uploadSection.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadSection.style.border = 'none';
        uploadSection.style.background = 'white';
    });

    uploadSection.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadSection.style.border = 'none';
        uploadSection.style.background = 'white';
        
        const items = e.dataTransfer.items;
        if (items) {
            // Handle folder drop (if supported)
            for (let item of items) {
                if (item.kind === 'file') {
                    const entry = item.webkitGetAsEntry();
                    if (entry && entry.isDirectory) {
                        // This would require additional handling for directory reading
                        // For now, we'll show a message to use the file input
                        alert('Please use the "Choose Folder" button to select a folder. Drag and drop of folders is not fully supported in all browsers.');
                        return;
                    }
                }
            }
        }
    });

    // Add some visual enhancements
    folderInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            const uploadBtn = this.parentElement.querySelector('span');
            uploadBtn.innerHTML = `📁 ${this.files.length} files selected`;
            uploadBtn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
        }
    });
});
