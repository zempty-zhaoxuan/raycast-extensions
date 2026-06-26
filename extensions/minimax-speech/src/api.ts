import { getPreferenceValues } from "@raycast/api";
import fs from "fs";
import path from "path";

interface TTSResponse {
  data?: { audio: string; status: number };
  extra_info?: { audio_format: string };
  base_resp: { status_code: number; status_msg: string };
}

export async function generateSpeech(text: string): Promise<string> {
  const prefs = getPreferenceValues<Preferences>();

  const body = {
    model: prefs.model || "speech-2.8-hd",
    text,
    stream: false,
    output_format: "hex",
    language_boost: prefs.languageBoost || "auto",
    voice_setting: {
      voice_id: prefs.voiceId || "English_expressive_narrator",
      speed: parseFloat(prefs.speed) || 1,
      vol: 1,
      pitch: 0,
    },
    audio_setting: {
      sample_rate: 32000,
      bitrate: 128000,
      format: "mp3",
      channel: 1,
    },
  };

  const res = await fetch("https://api.minimax.io/v1/t2a_v2", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${prefs.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as TTSResponse;

  if (json.base_resp.status_code !== 0 || !json.data?.audio) {
    throw new Error(json.base_resp.status_msg || "TTS API failed");
  }

  const outputDir = prefs.outputDir.replace(/^~/, process.env.HOME || "");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const filename = `tts_${Date.now()}.mp3`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, Buffer.from(json.data.audio, "hex"));

  return filepath;
}
