import {
  showHUD,
  showToast,
  Toast,
  getSelectedText,
  Clipboard,
  LaunchProps,
} from "@raycast/api";
import { generateSpeech } from "./api";

export default async function Command(
  props: LaunchProps<{ arguments: { text: string } }>,
) {
  let text = props.arguments.text;

  if (!text) {
    try {
      text = await getSelectedText();
    } catch {
      text = (await Clipboard.readText()) || "";
    }
  }

  if (!text.trim()) {
    await showToast({
      style: Toast.Style.Failure,
      title: "No text provided or found in clipboard",
    });
    return;
  }

  if (text.length > 10000) {
    text = text.substring(0, 10000);
    await showToast({
      style: Toast.Style.Animated,
      title: "Text truncated to 10,000 chars. Generating...",
    });
  }

  await showToast({
    style: Toast.Style.Animated,
    title: "Generating speech...",
  });

  try {
    const filepath = await generateSpeech(text);
    await showHUD(`✅ Audio saved: ${filepath}`);
  } catch (e) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed",
      message: String(e),
    });
  }
}
