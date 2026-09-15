# SoundSigns Project Documentation

## Project Name
SoundSigns: Speech to International Sign Language (ISL) Translator

## Purpose
SoundSigns is a web application that converts spoken English into International Sign Language gloss and displays the translation using pre-rendered sign language video clips. The application is designed for real-time speech interaction and accessible sign language visualization.

## High-Level Architecture

- **Frontend**: React application built with Vite and styled with Tailwind CSS.
- **Backend**: Python Flask server that calls an AI model via the Groq client.
- **Data**: Pre-rendered ISL sign videos covering letters, numbers, and common vocabulary.

## Core Workflow

1. **Speech capture**
   - The frontend listens to the microphone using the browser Web Speech API.
   - Interim transcript text is shown while the speaker is still talking.
   - When the browser marks a phrase as final, that utterance is queued for translation.

2. **Translation**
   - The frontend sends the final utterance to the backend endpoint `POST /translate`.
   - The backend calls Groq's AI model (`llama-3.3-70b-versatile`) and requests ISL gloss output.
   - The backend receives structured ISL gloss and returns it to the frontend as JSON.

3. **Gloss processing**
   - The frontend converts the returned ISL gloss into a sequence of sign items.
   - Each sign item is mapped to a corresponding video clip.
   - The app treats letters, numbers, and words differently to preserve signing behavior.

4. **Video playback**
   - A dual-buffer video player preloads the next clip while the current clip plays.
   - Letters are played faster, numbers have a slight speed boost, and words remain normal speed.
   - Clips are trimmed to remove extra start/end rest frames.

5. **Download**
   - The application can combine the sign clips and create a downloadable video file.

## Frontend Stack

- **React 18**
- **Vite**
- **Tailwind CSS**
- **lucide-react** for icons
- **Browser Web Speech API** for speech recognition
- `frontend/src/hooks/useRealtimeTranslation.js` manages real-time speech capture and translation queueing
- `frontend/src/components/ISLVideoPlayer.jsx` handles video buffering, playback, and download flow

## Backend Stack

- **Python 3**
- **Flask 3**
- **Flask-CORS**
- **Groq** Python client
- **python-dotenv**
- **Gunicorn** for production server deployment

## Important Files

- `backend/transcription.py`
  - Flask app that exposes `/translate` and `/health`
  - Uses `Groq(api_key=os.getenv("GROQ_API_KEY"))`
  - Prompts the model to return ISL gloss with uppercase sign tokens, hyphenated fingerspelling, and English-word removal

- `frontend/src/App.jsx`
  - Main React app layout and UI shell
  - Uses `ThemeProvider`, header, transcript view, gloss view, and video section

- `frontend/src/hooks/useRealtimeTranslation.js`
  - Handles speech recognition lifecycle and phrase queueing
  - Sends completed utterances to the backend
  - Maintains accumulated ISL gloss and pending queue state

- `frontend/src/components/ISLVideoSection.jsx`
  - Wraps the video player and related UI controls

- `frontend/src/components/ISLVideoPlayer.jsx`
  - Loads and plays sign video clips in sequence
  - Manages two stacked HTML `<video>` elements for smooth transitions
  - Tracks clip progress and missing clip handling

- `frontend/public/videos/`
  - Contains pre-rendered videos for `letters/`, `numbers/`, and `words/`

## Backend API

### `POST /translate`
- Request body: `{ "text": "..." }`
- Response body: `{ "isl": "..." }`

### `GET /health`
- Returns status information for service readiness

## Environment Configuration

- Backend expects an environment variable named `GROQ_API_KEY`
- Use a `.env` file in the `backend/` directory to store the API key

## Installation

### Backend
1. Navigate to `backend/`
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Add a `.env` file with:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

### Frontend
1. Navigate to `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```

## Running Locally

1. Start the backend server:
   ```bash
   py backend/transcription.py
   ```
2. Start the frontend server:
   ```bash
   cd frontend
   npm run dev
   ```
3. Open the web app in a browser that supports Web Speech API, such as Chrome or Edge.

## Notes and Limitations

- The app depends on browser speech recognition support and microphone permissions.
- Translation quality depends on the AI model and its prompt accuracy.
- If the vocabuary is not covered in the available video assets, the app may fallback to spelling or skip a missing clip.
- This project is designed for demonstration and educational use, not as a professional interpreter service.

## Summary
SoundSigns combines a browser speech interface, AI-based gloss translation, and a video-based sign playback system to turn spoken English into visible ISL sign sequences. The workflow is:

- Audio input → speech transcript
- Transcript → backend gloss translation
- Gloss → sign clip sequence
- Clip sequence → video playback and download
