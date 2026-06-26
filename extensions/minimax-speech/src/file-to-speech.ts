import { showHUD, showToast, Toast } from "@raycast/api";
import { generateSpeech } from "./api";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function extractText(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".txt":
    case ".md":
    case ".text":
    case ".csv":
    case ".log":
    case ".json":
    case ".xml":
    case ".html":
    case ".htm":
      return fs.readFileSync(filePath, "utf-8");

    case ".pdf":
      try {
        // macOS native PDFKit via osascript (no external dependency)
        return execSync(
          `osascript -l JavaScript -e '
            ObjC.import("Quartz");
            var url = $.NSURL.fileURLWithPath("${filePath.replace(/"/g, '\\"')}");
            var doc = $.PDFDocument.alloc.initWithURL(url);
            if (!doc) throw "Cannot open PDF";
            var text = "";
            for (var i = 0; i < doc.pageCount; i++) {
              text += doc.pageAtIndex(i).string.js + "\\n";
            }
            text;
          '`,
          { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 },
        );
      } catch {
        // Fallback: try pdftotext if available
        try {
          return execSync(`pdftotext '${filePath.replace(/'/g, "'\\''")}' -`, {
            encoding: "utf-8",
            maxBuffer: 10 * 1024 * 1024,
          });
        } catch {
          throw new Error(
            "Failed to extract PDF text. The PDF may be image-based or corrupted.",
          );
        }
      }

    case ".doc":
    case ".docx":
    case ".rtf":
    case ".rtfd":
    case ".odt":
      // macOS textutil can convert these to plain text
      return execSync(
        `textutil -convert txt -stdout '${filePath.replace(/'/g, "'\\''")}'`,
        { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 },
      );

    default:
      throw new Error(`Unsupported file format: ${ext}`);
  }
}

export default async function Command() {
  let filePath: string;

  try {
    filePath = execSync(
      `osascript -e 'POSIX path of (choose file of type {"txt","md","text","pdf","doc","docx","rtf","rtfd","odt","csv","log","json","xml","html","htm"} with prompt "Select a file to convert to speech")'`,
    )
      .toString()
      .trim();
  } catch {
    return;
  }

  if (!filePath || !fs.existsSync(filePath)) {
    await showToast({ style: Toast.Style.Failure, title: "File not found" });
    return;
  }

  await showToast({ style: Toast.Style.Animated, title: "Extracting text..." });

  let text: string;
  try {
    text = extractText(filePath).trim();
  } catch (e) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to extract text",
      message: String(e),
    });
    return;
  }

  if (!text) {
    await showToast({
      style: Toast.Style.Failure,
      title: "No text content found in file",
    });
    return;
  }

  if (text.length > 10000) {
    text = text.substring(0, 10000);
    await showToast({
      style: Toast.Style.Animated,
      title: "Text truncated to 10,000 chars. Generating...",
    });
  } else {
    await showToast({
      style: Toast.Style.Animated,
      title: "Generating speech...",
    });
  }

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
