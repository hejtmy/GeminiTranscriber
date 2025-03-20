require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');



// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function transcribeAudio(audioFilePath, prompt) {
    try {
        const audioData = fs.readFileSync(audioFilePath);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const audioBytes = Buffer.from(audioData).toString('base64');
        const parts = [
            {
                inlineData: {
                    mimeType: "audio/wav", // Adjust based on your audio file type
                    data: audioBytes
                }
            },
            prompt
        ];

        // Generate content
        const result = await model.generateContent(parts);
        const response = await result.response;
        const text = response.text();

        console.log('Transcription:', text);
        return text;
    } catch (error) {
        console.error('Error during transcription:', error);
        throw error;
    }
}

const prompt = `
Please transcribe this interview. in the format of timecode: speaker => content. 
Only provide the transcription, no other text.
Use speaker A, speaker B, etc. to identify speakers.
`

async function transcribeFolder(folderPath) {
    try {
        const files = fs.readdirSync(folderPath);
        const audioFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.wav', '.mp3', '.m4a', ".WAV", ".MP3", ".M4A"].includes(ext); // Add more audio extensions if needed
        });

        if (audioFiles.length === 0) {
            console.log('No audio files found in folder');
            return;
        }

        console.log(`Found ${audioFiles.length} audio files. Starting transcription...`);
        
        for (const file of audioFiles) {
            const audioFilePath = path.join(folderPath, file);
            console.log(`\nTranscribing: ${file}`);
            await transcribeAudio(audioFilePath, prompt)
                .then(text => {
                    const outputPath = path.join(
                        folderPath,
                        `${path.basename(file, path.extname(file))}_transcription.txt`
                    );
                    fs.writeFileSync(outputPath, text);
                    console.log('Transcription saved to:', outputPath);
                })
                .then(() => new Promise(resolve => setTimeout(resolve, 15000)))
                .catch(error => {
                    console.error(`Failed to transcribe ${file}:`, error);
                });
        }
    } catch (error) {
        console.error('Error processing folder:', error);
        throw error;
    }
}

// Updated main execution block
if (require.main === module) {
    // Check if path is provided
    if (process.argv.length < 3) {
        console.log('Please provide a path to an audio file or folder');
        console.log('Usage: node transcribe.js <path-to-audio-file-or-folder>');
        process.exit(1);
    }

    const inputPath = process.argv[2];
    
    // Check if path exists
    if (!fs.existsSync(inputPath)) {
        console.error('Path does not exist:', inputPath);
        process.exit(1);
    }

    // Check if it's a directory or file
    const isDirectory = fs.lstatSync(inputPath).isDirectory();

    if (isDirectory) {
        transcribeFolder(inputPath)
            .catch(error => {
                console.error('Folder processing failed:', error);
                process.exit(1);
            });
    } else {
        transcribeAudio(inputPath, prompt)
            .then(text => {
                const outputPath = path.join(
                    path.dirname(inputPath),
                    `${path.basename(inputPath, path.extname(inputPath))}_transcription.txt`
                );
                fs.writeFileSync(outputPath, text);
                console.log('Transcription saved to:', outputPath);
            })
            .catch(error => {
                console.error('Transcription failed:', error);
                process.exit(1);
            });
    }
} 