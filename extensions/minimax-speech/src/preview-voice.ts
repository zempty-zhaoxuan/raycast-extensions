import { showToast, Toast, getPreferenceValues } from "@raycast/api";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export default async function Command() {
  const prefs = getPreferenceValues<Preferences.PreviewVoice>();
  const sampleText =
    "Hello, this is a preview of the selected voice. 你好，这是当前选中音色的试听效果。";

  await showToast({
    style: Toast.Style.Animated,
    title: `Previewing: ${prefs.voiceId}...`,
  });

  const body = {
    model: prefs.model || "speech-2.8-hd",
    text: sampleText,
    stream: false,
    output_format: "hex",
    language_boost: prefs.languageBoost || "auto",
    voice_setting: {
      voice_id: prefs.voiceId || "Friendly_Person",
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

  try {
    const res = await fetch("https://api.minimax.io/v1/t2a_v2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${prefs.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as {
      data?: { audio: string };
      base_resp: { status_code: number; status_msg: string };
    };

    if (json.base_resp.status_code !== 0 || !json.data?.audio) {
      throw new Error(json.base_resp.status_msg || "API failed");
    }

    const tmpFile = path.join(os.tmpdir(), `minimax_preview_${Date.now()}.mp3`);
    fs.writeFileSync(tmpFile, Buffer.from(json.data.audio, "hex"));

    execFile("afplay", [tmpFile], () => {
      fs.rm(tmpFile, { force: true }, () => undefined);
    });
    await showToast({
      style: Toast.Style.Success,
      title: `Playing: ${prefs.voiceId}`,
    });
  } catch (e) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Preview failed",
      message: String(e),
    });
  }
}
