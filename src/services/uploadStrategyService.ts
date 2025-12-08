import axiosInstance from "./axiosInstance";
import { uploadFile, readFileAsBase64 } from "./fileUploadService";

/**
 * uploadStrategyService
 *
 * See earlier docstring...
 */

export type Endpoints = { audio: string; doc: string };

export interface SendOptions {
endpoints: Endpoints;
meta?: Record<string, any>;
onProgress?: (percent: number) => void;
signal?: AbortSignal;
forceBase64?: boolean;
}

export interface SendResult {
ok: boolean;
status?: number;
data?: any;
fileRef?: string | null;
error?: any;
}

// canonical extension lists exported for reuse across the app
export const AUDIO_EXTS = ["mp3", "wav", "m4a", "aac", "ogg", "flac", "mpeg"];
export const IMAGE_EXTS = ["jpg","jpeg","png","gif","tif","tiff","bmp","webp","svg"];
export const DOCUMENT_EXTS = ["pdf","doc","docx","txt","odt","rtf","xls","xlsx","ppt","pptx"];
export const LETTER_ALLOWED_EXTS = Array.from(new Set([...IMAGE_EXTS, ...DOCUMENT_EXTS]));

// small audio extension fallback (kept local to avoid circular deps)
const AUDIO_EXTS_FALLBACK = AUDIO_EXTS;

function getFileExtLower(file: File) {
return (file.name.split(".").pop() || "").toLowerCase();
}

export async function sendFile(file: File, opts: SendOptions): Promise<SendResult> {
const { endpoints, meta = {}, onProgress, signal, forceBase64 } = opts;

try {
    const debugInfo = { filename: file?.name, size: file?.size, type: file?.type };
    console.debug("[uploadStrategy] sendFile called", debugInfo);
} catch (e) { /* ignore debug errors */ }

try {
    let fileKey: string | null = null;
    for (const k of Object.keys(meta)) {
    try {
        if (meta[k] === file) { fileKey = k; break; }
    } catch {}
    }

    const ext = getFileExtLower(file);
    const mimeType = (file.type || "").toLowerCase();
    const isAudioMime = mimeType.startsWith("audio/");
    const isAudioExt = AUDIO_EXTS_FALLBACK.includes(ext);
    const isAudio = !forceBase64 && (isAudioMime || isAudioExt);

    // detect images (these must be sent as base64 JSON per new rule)
    const isImageMime = mimeType.startsWith("image/");
    const isImageExt = IMAGE_EXTS.includes(ext);
    const isImage = isImageMime || isImageExt;

    console.debug("[uploadStrategy] file detection", { ext, mimeType, isAudioMime, isAudioExt, isAudio });

    // STRICT RULE:
    // - multipart for audio -> endpoints.audio (field recorded_call)
    // - multipart for non-image documents -> endpoints.doc (field letter_document / fileKey)
    // - images -> base64 JSON to endpoints.doc
    if (isAudio) {
    const targetField = fileKey ?? "recorded_call";
    const extraData: Record<string, any> = {};
    Object.entries(meta).forEach(([k, v]) => {
        if (k === fileKey) return;
        if (v === undefined || v === null) return;
        extraData[k] = typeof v === "object" ? JSON.stringify(v) : String(v);
    });

    console.debug("[uploadStrategy] using multipart (audio)", { targetField, url: endpoints.audio });

    try {
        const data = await uploadFile(file, {
        url: endpoints.audio,
        fieldName: targetField,
        extraData,
        onProgress,
        signal,
        });
        console.debug("[uploadStrategy] multipart upload response received", { url: endpoints.audio });
        const fileRef = extractFileRefFromResp(data);
        return { ok: true, status: 200, data, fileRef };
    } catch (err: any) {
        console.debug("[uploadStrategy] multipart upload error", { url: endpoints.audio, err: err?.message ?? err });
        if (err?.status) return { ok: false, status: err.status, data: err.data, error: err };
        return { ok: false, error: err };
    }
    }

    // If not audio:
    // - documents (non-image) -> multipart to endpoints.doc
    // - images -> base64 JSON to endpoints.doc
    if (!isImage) {
        // treat as document -> multipart
        const targetField = fileKey ?? "letter_document";
        const extraData: Record<string, any> = {};
        Object.entries(meta).forEach(([k, v]) => {
            if (k === fileKey) return;
            if (v === undefined || v === null) return;
            extraData[k] = typeof v === "object" ? JSON.stringify(v) : String(v);
        });

        console.debug("[uploadStrategy] using multipart (document)", { targetField, url: endpoints.doc });
        try {
            const data = await uploadFile(file, {
            url: endpoints.doc,
            fieldName: targetField,
            extraData,
            onProgress,
            signal,
            });
            console.debug("[uploadStrategy] multipart(document) response received", { url: endpoints.doc });
            const fileRef = extractFileRefFromResp(data);
            return { ok: true, status: 200, data, fileRef };
        } catch (err: any) {
            console.debug("[uploadStrategy] multipart(document) upload error", { url: endpoints.doc, err: err?.message ?? err });
            if (err?.status) return { ok: false, status: err.status, data: err.data, error: err };
            return { ok: false, error: err };
        }
    }

    // IMAGE: send as base64 JSON
    console.debug("[uploadStrategy] using base64 JSON payload (image)", { url: endpoints.doc });
    const { base64, filename, mimeType: mt } = await readFileAsBase64(file);
    const payload: Record<string, any> = { ...meta };
    const targetKey = fileKey ?? "file";
    payload[targetKey] = {
        filename,
        content_base64: base64,
        content_type: mt,
    };
    try {
        const resp = await axiosInstance.post(endpoints.doc, payload, { signal });
        console.debug("[uploadStrategy] base64 JSON response received", { url: endpoints.doc, status: resp.status });
        const fileRef = extractFileRefFromResp(resp.data);
        return { ok: true, status: resp.status, data: resp.data, fileRef };
    } catch (err: any) {
        console.debug("[uploadStrategy] base64 JSON upload error", { url: endpoints.doc, err: err?.message ?? err });
        if (err?.response) {
                return { ok: false, status: err.response.status, data: err.response.data, error: err.response.data };
        } else if (err?.request) {
                return { ok: false, error: new Error("Network / no response") };
        }
        return { ok: false, error: err };
    }
} catch (err: any) {
        console.debug("[uploadStrategy] unexpected error in sendFile", { err: err?.message ?? err });
        return { ok: false, error: err };
}
}

// helper used above (re-add if not present)
function extractFileRefFromResp(data: any): string | null {
    if (!data) return null;
    if (typeof data === "string") return data;
    if (data.file_identifier) return data.file_identifier;
    if (data.recorded_call && typeof data.recorded_call === "string") return data.recorded_call;
    if (data.letter_document && typeof data.letter_document === "string") return data.letter_document;
    if (data.id) return String(data.id);
    if (data.url) return data.url;
    if (data.path) return data.path;
    return null;
}