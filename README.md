# Gemini Audio Transcriber

A Node.js application that uses Google's Gemini AI to transcribe audio files.

## Prerequisites

- Node.js installed on your system
- Google API key for Gemini
- Audio files in a supported format (MP3, WAV, etc.)

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your Google API key:
   ```
   GOOGLE_API_KEY=your_api_key_here
   ```

## Usage

Run the script with an audio file path as an argument:

```bash
node transcribe.js path/to/your/audio/file.mp3
```

The transcription will be:
1. Displayed in the console
2. Saved to a text file in the same directory as the audio file (with "_transcription.txt" appended to the filename)

## Error Handling

The script includes basic error handling for:
- Missing audio file path
- Non-existent audio files
- API errors

## Notes

- Make sure your audio file is in a supported format
- The transcription quality depends on the audio quality and clarity
- Large audio files may take longer to process 