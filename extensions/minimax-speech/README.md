# MiniMax Speech

A Raycast extension that converts text or file content to speech using the [MiniMax TTS API](https://platform.minimax.io/docs/api-reference/speech-t2a-http). macOS only.

## Setup

1. Sign up at [MiniMax Platform](https://platform.minimax.io)
2. Navigate to [API Key Management](https://platform.minimax.io/user-center/basic-information/interface-key) and create an API key
3. Open any command from this extension in Raycast — you will be prompted to enter your API key and output directory on first run

## Commands

### Text to Speech

Converts text to an MP3 audio file. Text source priority:

1. **Argument** — Type text directly in Raycast
2. **Selected text** — If no argument provided, uses currently selected text
3. **Clipboard** — Falls back to clipboard content

### File to Speech

Opens a native file picker, extracts text from the selected file, and converts it to speech.

Supported formats:

| Format | Method |
|--------|--------|
| .txt, .md, .csv, .log, .json, .xml, .html | Direct read |
| .pdf | macOS PDFKit (native) or poppler if installed |
| .doc, .docx, .rtf, .rtfd, .odt | macOS textutil (built-in) |

### Preview Voice

Plays a short bilingual sample (English + Chinese) using your currently configured voice, so you can audition voices before generating full audio.

## Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| API Key | Your MiniMax API key (required) | — |
| Output Directory | Where generated MP3 files are saved (required) | — |
| Model | TTS model | speech-2.8-hd |
| Voice | Voice preset (19 options available) | Friendly Person |
| Speed | Playback speed (0.5x – 2.0x) | 1.0x |
| Language Boost | Improve recognition for a specific language | Auto |

## Available Voices

Friendly Person, Wise Woman, Inspirational Girl, Deep Voice Man, Calm Woman, Casual Guy, Lively Girl, Patient Man, Young Knight, Determined Man, Lovely Girl, Decent Boy, Imposing Manner, Elegant Man, Abbess, Sweet Girl, Exuberant Girl, English Expressive Narrator, English Captivating Female

## Notes

- Maximum 10,000 characters per request — longer files are automatically truncated
- Output files are saved as `tts_<timestamp>.mp3`
- PDF extraction works out of the box; for complex PDFs, optionally install [poppler](https://formulae.brew.sh/formula/poppler) via `brew install poppler`
- Image-based (scanned) PDFs cannot be converted to text
