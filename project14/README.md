# 📁 Folder Structure Viewer

A web application that allows users to upload a folder and displays its complete structure as a tree-like string format.

## ✨ Features

- **Folder Upload**: Select any folder from your computer to analyze
- **Structure Display**: Shows the complete folder hierarchy in a readable format
- **Copy to Clipboard**: One-click copying of the folder structure
- **Download as Text**: Save the structure as a .txt file
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Drag & Drop**: Visual feedback for drag and drop interactions

## 🚀 How to Use

1. **Open the Application**: Open `index.html` in your web browser
2. **Choose Folder**: Click the "📂 Choose Folder" button
3. **Select Directory**: Navigate to and select the folder you want to analyze
4. **View Structure**: The application will display the complete folder structure
5. **Copy or Download**: Use the buttons to copy to clipboard or download as text

## 📋 Output Format

The application generates a string representation of your folder structure like this:

```
my-project
-file1
--l.txt
--rules.txt
--index.html
-file2
--config.json
--styles.css
-subfolder
--document.pdf
--image.jpg
```

## 🛠️ Technical Details

- **HTML5**: Uses modern HTML5 features including the `webkitdirectory` attribute
- **CSS3**: Responsive design with gradients, shadows, and animations
- **JavaScript ES6+**: Modern JavaScript with async/await and modern APIs
- **File API**: Leverages the File API for folder reading
- **Clipboard API**: Modern clipboard functionality for copying

## 🌐 Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

**Note**: The `webkitdirectory` attribute is required for folder selection, which is supported in all modern browsers.

## 📁 File Structure

```
project14/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## 🔧 Customization

You can easily customize the application by:

- **Colors**: Modify the CSS variables and gradients in `styles.css`
- **Format**: Change the output format in the `buildFolderStructure` function in `script.js`
- **Styling**: Adjust the visual appearance by modifying the CSS classes

## 🚨 Limitations

- **Browser Security**: Due to browser security restrictions, the application can only read files that you explicitly select
- **Large Folders**: Very large folders with thousands of files may take longer to process
- **File Types**: The application reads all file types but doesn't analyze file contents

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Submitting pull requests
- Improving the documentation

---

**Enjoy exploring your folder structures! 🎉**
