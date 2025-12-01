import React, { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

/**
 * Reusable FileUploader component
 *
 * Props:
 * - accept: string for input accept attribute (e.g. ".pdf,.docx,image/*")
 * - allowedExts: array of lowercase extensions without dot (["pdf","docx","jpg"])
 * - maxSizeBytes: maximum file size in bytes (optional)
 * - multiple: allow multiple selection
 * - autoUpload: if true and uploadUrl provided, will call uploadFile automatically
 * - uploadUrl: if provided, component will call fileUploadService.uploadFile when uploading
 * - onChange(files): called when files selected/cleared (validated File[] or null)
 * - onUpload(result): called after upload completes (response or error)
 *
 * Notes for future devs:
 * - This component only does client-side validation and optional upload.
 * - Always validate again on the server for security.
 * - To change allowed formats, pass different allowedExts/accept or update defaults in the caller.
 */

export interface FileUploaderProps {
  id?: string;
  accept?: string;
  allowedExts?: string[]; // e.g. ["pdf","doc","docx","jpg","png"]
  maxSizeBytes?: number; // optional limit
  multiple?: boolean;
  autoUpload?: boolean;
  uploadUrl?: string; // if set, used by auto-upload (or you can call service directly)
  onChange?: (files: File[] | null) => void;
  onUpload?: (res: any, err?: any) => void;
  className?: string;
  placeholder?: string;
}

export default function FileUploader({
  id,
  accept,
  allowedExts = [],
  maxSizeBytes,
  multiple = false,
  autoUpload = false,
  uploadUrl,
  onChange,
  onUpload,
  className,
  placeholder = "Choose file...",
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  function validateFiles(fileList: FileList | null): { ok: boolean; msg?: string; files?: File[] } {
    if (!fileList || fileList.length === 0) return { ok: true, files: null };
    const arr = Array.from(fileList);
    for (const f of arr) {
      const name = f.name || "";
      const ext = name.split(".").pop()?.toLowerCase() ?? "";
      if (allowedExts.length && !allowedExts.includes(ext)) {
        return { ok: false, msg: `Invalid file type .${ext}. Allowed: ${allowedExts.join(", ")}` };
      }
      if (maxSizeBytes && f.size > maxSizeBytes) {
        return { ok: false, msg: `File too large (${Math.round(f.size/1024)} KB). Max ${(Math.round(maxSizeBytes/1024))} KB` };
      }
    }
    return { ok: true, files: arr };
  }

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const validation = validateFiles(e.target.files);
    if (!validation.ok) {
      setFiles(null);
      setError(validation.msg || "Invalid file");
      onChange?.(null);
      return;
    }
    const selected = validation.files ?? null;
    setFiles(selected);
    onChange?.(selected);

    if (autoUpload && uploadUrl && selected && selected.length > 0) {
      // dynamic import to avoid circular if service also imports UI libs
      try {
        setUploading(true);
        const { uploadFile } = await import("../../services/fileUploadService");
        const res = await uploadFile(selected[0], { url: uploadUrl });
        onUpload?.(res, undefined);
      } catch (err: any) {
        onUpload?.(undefined, err);
        setError(err?.message ?? "Upload failed");
      } finally {
        setUploading(false);
      }
    }
  }

  function handleRemove() {
    setFiles(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onChange?.(null);
  }

  return (
    <div className={className ?? ""}>
      <div className="flex items-center gap-3">
        <label className="flex-1">
          <Input
            id={id}
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFilesSelected}
            className="w-full"
          />
        </label>

        {files && files.length > 0 ? (
          <div className="flex items-center gap-2">
            <div className="text-sm">{files.map(f => f.name).join(", ")}</div>
            <Button variant="outline" onClick={handleRemove} disabled={uploading}>Remove</Button>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">{placeholder}</div>
        )}
      </div>

      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
      {uploading && <div className="text-sm text-muted-foreground mt-1">Uploading…</div>}
    </div>
  );
}