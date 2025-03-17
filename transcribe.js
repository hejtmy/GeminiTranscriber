require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function transcribeAudio(audioFilePath) {
    try {
        // Read the audio file
        const audioData = fs.readFileSync(audioFilePath);

        // Get the model
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

        // Prepare the audio data
        const audioBytes = Buffer.from(audioData).toString('base64');
        
        // Create parts array with audio data
        const parts = [
            {
                inlineData: {
                    mimeType: "audio/mp3", // Adjust based on your audio file type
                    data: audioBytes
                }
            }
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

// Example usage
if (require.main === module) {
    // Check if file path is provided
    if (process.argv.length < 3) {
        console.log('Please provide an audio file path');
        console.log('Usage: node transcribe.js <path-to-audio-file>');
        process.exit(1);
    }

    const audioFilePath = process.argv[2];
    
    // Check if file exists
    if (!fs.existsSync(audioFilePath)) {
        console.error('Audio file does not exist:', audioFilePath);
        process.exit(1);
    }

    transcribeAudio(audioFilePath)
        .then(text => {
            // Save transcription to a file
            const outputPath = path.join(
                path.dirname(audioFilePath),
                `${path.basename(audioFilePath, path.extname(audioFilePath))}_transcription.txt`
            );
            fs.writeFileSync(outputPath, text);
            console.log('Transcription saved to:', outputPath);
        })
        .catch(error => {
            console.error('Transcription failed:', error);
            process.exit(1);
        });
} 