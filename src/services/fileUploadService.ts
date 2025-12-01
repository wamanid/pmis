import axiosInstance from "./axiosInstance";
import type { UploadOptions } from "./fileUploadService";

/**
 * fileUploadService
 *
 * Small upload helper to centralize multipart/form-data uploads.
 * - Accepts a single File and optional metadata.
 * - Supports onProgress callback and AbortSignal for cancellation.
 * - Returns server response (or throws an Error with details).
 *
 * Usage:
 *   uploadFile(file, { url: "/some/upload/", fieldName: "file", extraData: { foo: "bar" }, onProgress, signal })
 */

export interface UploadOptions {
  url?: string; // full endpoint or relative to axiosInstance baseURL; default must be provided by caller
  fieldName?: string; // form field name for file; default "file"
  extraData?: Record<string, any>; // additional form fields
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export async function uploadFile(file: File, options: UploadOptions = {}) {
  const {
    url = "/uploads/",
    fieldName = "file",
    extraData,
    onProgress,
    signal,
    headers,
  } = options;

  const fd = new FormData();
  fd.append(fieldName, file);

  if (extraData) {
    Object.keys(extraData).forEach((k) => {
      const v = extraData[k];
      if (v !== undefined && v !== null) fd.append(k, String(v));
    });
  }

  try {
    // Debug FormData keys (no file contents)
    try {
      const fdKeys: string[] = [];
      for (const pair of (fd as any).entries()) fdKeys.push(String(pair[0]));
      console.debug("[uploadFile] FormData keys:", fdKeys);
    } catch (e) { /* ignore */ }

    // Build outgoing headers but DO NOT set Content-Type.
    // Also merge auth headers from axiosInstance.defaults so XHR uses same Authorization/Cookie.
    const outgoingHeaders = { ...(headers ?? {}) } as Record<string, any>;
    try {
      const axiosHdrs = (axiosInstance && (axiosInstance.defaults as any)?.headers) ?? {};
      const common = axiosHdrs.common ?? axiosHdrs;
      Object.assign(outgoingHeaders, { ...common, ...outgoingHeaders });
    } catch (e) {
      /* ignore if axiosInstance not available or shape differs */
    }
    if ("Content-Type" in outgoingHeaders) delete outgoingHeaders["Content-Type"];
    outgoingHeaders["Accept"] = outgoingHeaders["Accept"] ?? "application/json";

    // Fallback: if no Authorization header found, try to read common localStorage keys used by auth
    if (!outgoingHeaders["Authorization"] && !outgoingHeaders["authorization"]) {
      const token =
        localStorage.getItem("access_token") ??
        localStorage.getItem("token") ??
        localStorage.getItem("auth_token") ??
        localStorage.getItem("authToken") ??
        null;
      if (token) {
        outgoingHeaders["Authorization"] = token.startsWith("Bearer") ? token : `Bearer ${token}`;
      }
    }

    // Debug headers
    try { console.debug("[uploadFile] outgoingHeaders:", outgoingHeaders); } catch (e) {}
 
    // Resolve full URL against axiosInstance.baseURL (preferred) then VITE_API_BASE_URL.
    // This ensures XHR multipart uploads go to the same backend as axiosInstance requests.
    const configuredBase =
      (axiosInstance && (axiosInstance.defaults as any)?.baseURL) ??
      ((import.meta as any).env?.VITE_API_BASE_URL ?? "");

    let fullUrl: string;
    if (/^https?:\/\//i.test(url)) {
      fullUrl = url;
    } else {
      const baseNormalized = String(configuredBase ?? "").replace(/\/$/, "");
      const pathNormalized = url.startsWith("/") ? url : `/${url}`;
      fullUrl = baseNormalized ? `${baseNormalized}${pathNormalized}` : pathNormalized;
    }
    console.debug("[uploadFile] full upload URL =", fullUrl);

    // Use XMLHttpRequest directly to avoid axiosInstance interceptors that may force JSON headers
    const xhrResult = await new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", fullUrl, true);
      // include credentials (cookies) for same auth flows that rely on cookies
      xhr.withCredentials = true;

      // Set any non-Content-Type headers (Accept etc.)
      try {
        Object.entries(outgoingHeaders).forEach(([k, v]) => {
          if (v != null) xhr.setRequestHeader(k, String(v));
        });
      } catch (e) {
        /* ignore header set errors */
      }

      xhr.upload.onprogress = (ev: ProgressEvent) => {
        if (ev.lengthComputable && onProgress) {
          const percent = Math.round((ev.loaded * 100) / ev.total);
          onProgress(percent);
        }
      };

      xhr.onerror = () => reject(new Error("Upload failed: Network / no response"));
      xhr.ontimeout = () => reject(new Error("Upload failed: timeout"));

      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return;
        const status = xhr.status;
        const text = xhr.responseText;
        let parsed: any = null;
        try { parsed = text ? JSON.parse(text) : null; } catch (e) { parsed = text; }
        if (status >= 200 && status < 300) resolve(parsed);
        else {
          const err = new Error(`Upload failed: HTTP ${status}`);
          (err as any).status = status;
          (err as any).data = parsed;
          reject(err);
        }
      };

      if (signal) {
        if (signal.aborted) {
          xhr.abort();
          return reject(new DOMException("Aborted", "AbortError"));
        }
        const onAbort = () => {
          try { xhr.abort(); } catch {}
          reject(new DOMException("Aborted", "AbortError"));
        };
        signal.addEventListener("abort", onAbort, { once: true });
      }

      xhr.send(fd);
    });

    return xhrResult;
  } catch (err: any) {
    if ((err as any)?.status) {
      const e = new Error(`Upload failed: HTTP ${(err as any).status}`);
      (e as any).status = (err as any).status;
      (e as any).data = (err as any).data;
      throw e;
    } else if ((err as any)?.name === "AbortError") {
      const e = new Error("Upload failed: aborted");
      (e as any).name = "AbortError";
      throw e;
    } else {
      throw err;
    }
  }
}

// New helper: read a File into a base64-encoded string.
// Returns { base64, filename, mimeType } so callers can include in JSON payloads.
export async function readFileAsBase64(file: File): Promise<{ base64: string; filename: string; mimeType: string }> {
  // Use FileReader for browser compatibility
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      reader.abort();
      reject(new Error("Failed to read file"));
    };
    reader.onload = () => {
      const result = reader.result as string; // data:[mime];base64,XXXX
      // strip the "data:*/*;base64," prefix if present
      const comma = result.indexOf(",");
      const base64 = comma >= 0 ? result.slice(comma + 1) : result;
      resolve({ base64, filename: file.name, mimeType: file.type || "application/octet-stream" });
    };
    reader.readAsDataURL(file);
  });
}