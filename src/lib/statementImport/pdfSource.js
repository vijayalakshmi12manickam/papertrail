import * as DocumentPicker from 'expo-document-picker';
import * as PdfExtract from 'expo-pdf-text-extract';

// isAvailable() is false in Expo Go (the native module isn't present there) —
// callers use this to show a clear "needs the full app build" message instead
// of a confusing failure the first time someone taps Import.
export function isPdfExtractionAvailable() {
  try {
    return PdfExtract.isAvailable();
  } catch (e) {
    return false;
  }
}

export async function pickStatementPdf() {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0]; // { uri, name, size, mimeType }
}

export async function isStatementPasswordProtected(fileUri) {
  return PdfExtract.isPasswordProtected(fileUri);
}

export async function extractStatementText(fileUri, password) {
  return PdfExtract.extractText(fileUri, password || undefined);
}
