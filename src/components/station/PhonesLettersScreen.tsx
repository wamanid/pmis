
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Plus, Search, Edit, Trash2, X, Save, Calendar as CalendarIcon, Upload, Phone, Mail } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner"; // fixed import
import SearchableSelect from "../common/SearchableSelect";
import FileUploader from "../common/FileUploader";
import { useForm, Controller } from "react-hook-form";
import { Switch } from "../ui/switch";
import { DataTable } from "../common/DataTable";
import * as PhoneService from "../../services/stationServices/phoneService";
import * as LetterService from "../../services/stationServices/letterService";
import { phoneNumberValidation, emailValidation, requiredValidation } from "../../utils/validation";
import { useFilterRefresh } from "../../hooks/useFilterRefresh";
import { useFilters } from "../../contexts/FilterContext";
import axiosInstance from "../../services/axiosInstance";
// use the typed/custom prisoners service (returns { items, count })
import { fetchPrisoners as fetchPrisonersService } from "../../services/customPrisonersService";
import { sendFile, AUDIO_EXTS, LETTER_ALLOWED_EXTS } from "../../services/uploadStrategyService";
import { readFileAsBase64 } from "../../services/fileUploadService"; // keep if used elsewhere
import StaffProfileSelect from "../common/StaffProfileSelect";
import ConfirmDialog from "../common/ConfirmDialog";

/**
 * Centralized API endpoints (single source of truth).
 * Update these values to match backend routes. Use these variables
 * everywhere instead of hardcoding strings.
 */
const API_ENDPOINTS = {
  createLetter: "/rehabilitation/eletters/",        // POST to create letter (JSON)
  createCall: "/rehabilitation/call-records/",      // POST to create call record (JSON)
  // Upload endpoints used by uploadStrategyService.
  // If your backend has dedicated upload endpoints, set them here.
  // Otherwise uploadStrategyService will post base64 JSON to `doc` endpoint
  // or multipart to `audio` endpoint depending on file type.

};

// create accept strings for inputs from the extension lists
// keep these centralized so future devs can change formats in one place
const AUDIO_UPLOAD_ACCEPT = "." + AUDIO_EXTS.join(".,");
const LETTER_UPLOAD_ACCEPT = "." + LETTER_ALLOWED_EXTS.join(".,");
;

// helper: get extension in lowercase (without dot)
function fileExt(file: File | null) {
  if (!file) return "";
  return (file.name.split(".").pop() || "").toLowerCase();
}

// new helper: format ISO -> "YYYY-MM-DDTHH:MM" for datetime-local inputs
function toDatetimeLocal(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// helper: extract a usable file reference from uploadStrategyService response
function extractFileRefFromSendResult(res: any): string | null {
  // backends vary; check common shapes and return a string usable by create endpoints
  if (!res) return null;
  // sometimes service returns normalized { ok, data }
  const data = res.data ?? res;
  if (!data) return null;
  // common fields
  if (typeof data === "string") return data;               // maybe base64 or URL string
  if (data.file_identifier) return data.file_identifier;   // custom
  if (data.id) return String(data.id);
  if (data.url) return data.url;
  if (data.path) return data.path;
  // if API returned structure with file.content_base64
  if (data.file && data.file.content_base64) return data.file.content_base64;
  // fallback — caller can inspect res.data manually in logs
  return null;
}

// helper: convert "YYYY-MM-DDTHH:MM" (datetime-local) to ISO string (UTC)
function localToISOString(dtLocal?: string | null) {
  if (!dtLocal) return null;
  // expected format "YYYY-MM-DDTHH:MM" or "YYYY-MM-DDTHH:MM:SS"
  const parts = dtLocal.split("T");
  if (parts.length !== 2) return null;
  const [y, m, d] = parts[0].split("-").map(Number);
  const [hh, mmSec] = parts[1].split(":");
  const hhNum = Number(hh);
  const mmNum = Number(mmSec?.split(":")[0] ?? 0);
  const ssNum = Number(mmSec?.split(":")[1] ?? 0);
  const dt = new Date(y, (m || 1) - 1, d, hhNum, mmNum, ssNum);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

// add near other helpers (fileExt, toDatetimeLocal, localToISOString, etc.)
function normalizeSelectToId(v: any) {
  if (v === null || v === undefined) return v;
  if (typeof v === "object") return v.id ?? v.value ?? v;
  return v;
}

function normalizeLetterForSubmit(raw: any) {
  if (!raw) return raw;
  const out: any = { ...raw };

  out.prisoner = normalizeSelectToId(raw.prisoner);
  out.letter_type = normalizeSelectToId(raw.letter_type);
  out.relation_to_prisoner = normalizeSelectToId(raw.relation_to_prisoner);
  out.welfare_officer = normalizeSelectToId(raw.welfare_officer);

  // ensure ISO date
  if (raw.letter_date) {
    const iso = localToISOString(typeof raw.letter_date === "string" ? raw.letter_date : String(raw.letter_date));
    if (iso) out.letter_date = iso;
  }

  // remove File before JSON submit (sendFile handles uploads)
  if (out.letter_document instanceof File) delete out.letter_document;

  return out;
}

type Tab = "calls" | "letters";

export default function PhonesLettersScreen() {
  const { station, district, region } = useFilters();

  const [activeTab, setActiveTab] = useState<Tab>("calls");

  // shared table state (calls)
  const [callsData, setCallsData] = useState<PhoneService.CallRecordItem[]>([]);
  const [callsLoading, setCallsLoading] = useState(true);
  const [callsTotal, setCallsTotal] = useState(0);

  // shared table state (letters)
  const [lettersData, setLettersData] = useState<LetterService.ELetterItem[]>([]);
  const [lettersLoading, setLettersLoading] = useState(true);
  const [lettersTotal, setLettersTotal] = useState(0);

  // paging / sort / search (shared pattern, separate state per table)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => window.clearTimeout(id);
  }, [searchTerm]);

  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  // lookups for selects
  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [callTypes, setCallTypes] = useState<any[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [letterTypes, setLetterTypes] = useState<any[]>([]);

  // dialog / form state
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<PhoneService.CallRecordItem | null>(null);
  const [letterDialogOpen, setLetterDialogOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<LetterService.ELetterItem | null>(null);

  // forms
  const callForm = useForm<any>({ defaultValues: {} });
  const letterForm = useForm<any>({ defaultValues: {} });

  // Map API item -> table row (if you need normalization)
  const mapCall = useCallback((it: any): PhoneService.CallRecordItem => ({ ...it }), []);
  const mapLetter = useCallback((it: any): LetterService.ELetterItem => ({ ...it }), []);

  // load lookups used in searchable selects
  useEffect(() => {
    let mounted = true;
    const c = new AbortController();
    (async () => {
      try {
        const [lt, rel] = await Promise.all([
          LetterService.fetchLetterTypes(undefined, c.signal),
          LetterService.fetchRelationships(undefined, c.signal),
        ]);
        if (!mounted) return;
        setLetterTypes(lt ?? []);
        setRelationships(rel ?? []);
      } catch (err) {
        console.error("lookup error", err);
      }
    })();
    return () => { mounted = false; c.abort(); };
  }, []);

  // Parent-controlled loadTable for calls
  const loadCalls = useCallback(async (_page = page, _pageSize = pageSize, _sortField = sortField, _sortDir = sortDir, _search = debouncedSearch) => {
    try { abortRef.current?.abort(); } catch {}
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++requestIdRef.current;
    setCallsLoading(true);
    try {
      const params: Record<string, any> = {
        page: Math.max(1, Number(_page) || 1),
        page_size: Number(_pageSize) || 10,
      };
      if (_sortField) params.ordering = _sortDir === "desc" ? `-${_sortField}` : _sortField;
      if (_search) params.search = _search;
      // include location filters from top nav if present
      if (station) params.station = station;
      if (district) params.district = district;
      if (region) params.region = region;

      const res = await PhoneService.fetchCallRecords(params, controller.signal);
      const items = res?.results ?? res ?? [];
      const count = Number(res?.count ?? items.length ?? 0);
      if (requestIdRef.current === reqId) {
        setCallsData((items || []).map(mapCall));
        setCallsTotal(count);
      }
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      console.error("loadCalls error", err);
      toast.error("Failed to load call records");
    } finally {
      if (requestIdRef.current === reqId) setCallsLoading(false);
    }
  }, [page, pageSize, sortField, sortDir, debouncedSearch, station, district, region, mapCall]);

  // Parent-controlled loadTable for letters
  const loadLetters = useCallback(async (_page = page, _pageSize = pageSize, _sortField = sortField, _sortDir = sortDir, _search = debouncedSearch) => {
    try { abortRef.current?.abort(); } catch {}
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++requestIdRef.current;
    setLettersLoading(true);
    try {
      const params: Record<string, any> = {
        page: Math.max(1, Number(_page) || 1),
        page_size: Number(_pageSize) || 10,
      };
      if (_sortField) params.ordering = _sortDir === "desc" ? `-${_sortField}` : _sortField;
      if (_search) params.search = _search;
      if (station) params.station = station;
      if (district) params.district = district;
      if (region) params.region = region;

      const res = await LetterService.fetchLetters(params, controller.signal);
      const items = res?.results ?? res ?? [];
      const count = Number(res?.count ?? items.length ?? 0);
      if (requestIdRef.current === reqId) {
        setLettersData((items || []).map(mapLetter));
        setLettersTotal(count);
      }
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      console.error("loadLetters error", err);
      toast.error("Failed to load letters");
    } finally {
      if (requestIdRef.current === reqId) setLettersLoading(false);
    }
  }, [page, pageSize, sortField, sortDir, debouncedSearch, station, district, region, mapLetter]);

  // reload when filters or debounce/search change
  useEffect(() => {
    if (activeTab === "calls") {
      loadCalls(1, pageSize, sortField, sortDir, debouncedSearch);
    } else {
      loadLetters(1, pageSize, sortField, sortDir, debouncedSearch);
    }
  }, [activeTab, page, pageSize, sortField, sortDir, debouncedSearch, loadCalls, loadLetters]);

  // wire top-nav filter refresh
  useFilterRefresh(() => {
    // reset page and reload active tab
    setPage(1);
    if (activeTab === "calls") loadCalls(1, pageSize, sortField, sortDir, debouncedSearch);
    else loadLetters(1, pageSize, sortField, sortDir, debouncedSearch);
  }, [region, district, station]);

  // datatable callbacks
  const onSearch = (q: string) => { setSearchTerm(q); setPage(1); };
  const onPageChange = (p: number) => setPage(p);
  const onPageSizeChange = (s: number) => { setPageSize(s); setPage(1); };
  const onSort = (f: string | null, d: "asc" | "desc" | null) => { setSortField(f ?? undefined); setSortDir(d ?? undefined); setPage(1); };

  // columns
  const callsColumns = [
    { key: "call_date", label: "Date", sortable: true, render: (v: any, row: any) => (<div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground" />{row.call_date ? new Date(row.call_date).toLocaleString() : "-"}</div>) },
    { key: "prisoner_name", label: "Prisoner", sortable: true },
    { key: "caller", label: "Caller" },
    { key: "phone_number", label: "Phone" },
    { key: "call_type_name", label: "Type" },
    { key: "relation_name", label: "Relation" },
    { key: "call_duration", label: "Duration" },
    { key: "call_notes", label: "Notes", render: (v: any) => (<div className="max-w-xs truncate">{v || "-"}</div>) },
    { key: "id", label: "Actions", sortable: false, render: (_v: any, r: any) => (<div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => {
        setEditingCall(r);
        // ensure call_date is in datetime-local format
        callForm.reset({ ...r, call_date: toDatetimeLocal(r?.call_date) });
        setCallDialogOpen(true);
      }}><Edit className="h-4 w-4" /></Button><Button variant="destructive" size="sm" onClick={() => {
        // open confirm dialog for delete
        confirmActionRef.current = {
          title: "Delete Call Record",
          description: `Delete call record for "${r.prisoner_name ?? r.caller ?? r.id}"? This action cannot be undone.`,
          onConfirm: async () => {
            try {
              await PhoneService.deleteCallRecord(r.id);
              toast.success("Call record deleted");
              loadCalls(page, pageSize);
            } catch (err) {
              console.error("delete call error", err);
              toast.error("Failed to delete call record");
            }
          },
        };
        setConfirmOpen(true);
      }}><Trash2 className="h-4 w-4" /></Button></div>) }
  ];

  const lettersColumns = [
    { key: "letter_date", label: "Date", sortable: true, render: (v: any, row: any) => (<div>{row.letter_date ? new Date(row.letter_date).toLocaleString() : "-"}</div>) },
    { key: "prisoner_name", label: "Prisoner", sortable: true },
    { key: "letter_tracking_number", label: "Tracking No." },
    { key: "subject", label: "Subject" },
    { key: "letter_type_name", label: "Type" },
    { key: "relation_name", label: "Relation" },
    { key: "id", label: "Actions", sortable: false, render: (_v: any, r: any) => (<div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => {
        setEditingLetter(r);
        // ensure letter_date is in datetime-local format
        letterForm.reset({
          ...r,
          prisoner: normalizeSelectToId(r.prisoner),
          letter_type: normalizeSelectToId(r.letter_type),
          relation_to_prisoner: normalizeSelectToId(r.relation_to_prisoner),
          welfare_officer: normalizeSelectToId(r.welfare_officer),
          letter_date: toDatetimeLocal(r?.letter_date),
        });
        setLetterDialogOpen(true);
      }}><Edit className="h-4 w-4" /></Button><Button variant="destructive" size="sm" onClick={() => {
        confirmActionRef.current = {
          title: "Delete Letter",
          description: `Delete letter "${r.subject ?? r.letter_tracking_number ?? r.id}" for "${r.prisoner_name ?? r.id}"? This action cannot be undone.`,
          onConfirm: async () => {
            try {
              await LetterService.deleteLetter(r.id);
              toast.success("Letter deleted");
              loadLetters(page, pageSize);
            } catch (err) {
              console.error("delete letter error", err);
              toast.error("Failed to delete letter");
            }
          },
        };
        setConfirmOpen(true);
      }}><Trash2 className="h-4 w-4" /></Button></div>) }
  ];

  // wrapper that forwards current filter context to centralized service
  const fetchPrisoners = useCallback(async (q = "", signal?: AbortSignal) => {
    try {
      const res = await fetchPrisonersService(
        { search: q || "", station: station ?? null, district: district ?? null, region: region ?? null, page_size: 100 },
        signal
      );

      // NORMALIZE: service may return { items, count } or an array
      const items: any[] = Array.isArray(res) ? res : (res?.items ?? []);

      // safety: ensure we always operate on an array
      if (!Array.isArray(items)) return [];

      const qlc = (q || "").trim().toLowerCase();
      if (!qlc) return items;

      return items.filter((it: any) => {
        return String(it.full_name ?? "").toLowerCase().includes(qlc) ||
               String(it.prisoner_number_value ?? "").toLowerCase().includes(qlc) ||
               String(it.prisoner_number ?? "").toLowerCase().includes(qlc);
      });
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return [];
      console.error("prisoners lookup error", err);
      toast.error("Failed to load prisoners (network).");
      // toast.error("Failed to load prisoners (network). Check CORS / backend or use dev proxy.");
      return [];
    }
  }, [station, district, region]);

  const fetchCallTypes = useCallback(async (q = "", signal?: AbortSignal) => {
    const res = await axiosInstance.get("/rehabilitation/call-types/", { params: { search: q, page_size: 50 }, signal });
    return res.data?.results ?? [];
  }, []);

  // small wrappers for preloaded lists (relationships, letterTypes)
  const fetchRelationshipsLocal = useCallback(async (q = "") => {
    if (!q) return relationships;
    const qlc = q.toLowerCase();
    return relationships.filter((r:any) => String(r.name ?? "").toLowerCase().includes(qlc));
  }, [relationships]);

  const fetchLetterTypesLocal = useCallback(async (q = "") => {
    if (!q) return letterTypes;
    const qlc = q.toLowerCase();
    return letterTypes.filter((t:any) => String(t.name ?? "").toLowerCase().includes(qlc));
  }, [letterTypes]);

  // form submit handlers
  const onSubmitCall = async (data: any) => {
    try {

      // normalize call_date to ISO if present
      if (data?.call_date) {
        const iso = localToISOString(data.call_date);
        if (iso) data.call_date = iso;
      }

      const file = data?.recorded_call instanceof File ? data.recorded_call as File : null;

      // If file present validate extension
      if (file) {
        const ext = fileExt(file);
        if (!AUDIO_EXTS.includes(ext)) {
          toast.error(`Recorded call must be audio. Allowed: ${AUDIO_EXTS.join(", ")}`);
          return;
        }

        // Use upload strategy service. We pass the call endpoint as the 'audio' endpoint
        // so sendFile will post multipart with meta (other fields) to that endpoint.
        const sendRes = await sendFile(file, {
          endpoints: { audio: API_ENDPOINTS.createCall, doc: API_ENDPOINTS.createCall },
          meta: { ...data }, // include other fields; sendFile will include as extraData or in JSON depending on strategy
        });

        if (!sendRes.ok) {
          console.error("call file upload failed", sendRes.error ?? sendRes);
          toast.error("Failed to upload recorded call");
          return;
        }

        // If the upload endpoint created the record, we're done.
        if (sendRes.data && (sendRes.data.id || sendRes.data.created)) {
          toast.success(editingCall?.id ? "Call updated" : "Call created");
        } else {
          // Otherwise, try to extract a file reference and post the record normally.
          const fileRef = extractFileRefFromSendResult(sendRes);
          if (fileRef) data.recorded_call = fileRef;
          else data.recorded_call = sendRes.data ?? null;

          if (editingCall?.id) {
            await PhoneService.updateCallRecord(editingCall.id, data);
            toast.success("Call updated");
          } else {
            await PhoneService.createCallRecord(data);
            toast.success("Call created");
          }
        }
      } else {
        // No file -> send JSON via existing service
        if (editingCall?.id) {
          await PhoneService.updateCallRecord(editingCall.id, data);
          toast.success("Call updated");
        } else {
          await PhoneService.createCallRecord(data);
          toast.success("Call created");
        }
      }

      setCallDialogOpen(false);
      loadCalls(page, pageSize);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save call");
    }
  };

  const onSubmitLetter = async (data: any) => {
    try {

      // normalize call_date to ISO if present
      if (data?.call_date) {
        const iso = localToISOString(data.call_date);
        if (iso) data.call_date = iso;
      }

      const file = data?.letter_document instanceof File ? data.letter_document as File : null;
  
      if (file) {
        const ext = fileExt(file);
        if (!LETTER_ALLOWED_EXTS.includes(ext)) {
          toast.error(`Letter document must be one of: ${LETTER_ALLOWED_EXTS.join(", ")}`);
          return;
        }
  
        // Use upload strategy service:
        // - for non-audio files sendFile will perform base64 JSON post to the doc endpoint
        // - meta contains the other fields so the server can create the letter in one call if it accepts that shape
        const sendRes = await sendFile(file, {
          // endpoints: { audio: API_ENDPOINTS.createCall, doc: API_ENDPOINTS.createLetter },
          endpoints: { doc: API_ENDPOINTS.createLetter },
          meta: { ...data },
        });
  
        if (!sendRes.ok) {
          console.error("letter file upload failed", sendRes.error ?? sendRes);
          toast.error("Failed to upload letter document");
          return;
        }
  
        // If endpoint returned created resource, done.
        if (sendRes.data && (sendRes.data.id || sendRes.data.letter_document)) {
          toast.success(editingLetter?.id ? "Letter updated" : "Letter created");
        } else {
          // Otherwise extract file ref and include in JSON create call.
          const fileRef = extractFileRefFromSendResult(sendRes);
          if (fileRef) data.letter_document = fileRef;
          else data.letter_document = sendRes.data ?? null;
  
          if (editingLetter?.id) {
            await LetterService.updateLetter(editingLetter.id, data);
            toast.success("Letter updated");
          } else {
            await LetterService.createLetter(data);
            toast.success("Letter created");
          }
        }
      } else {
        // No file -> send JSON as before
        if (editingLetter?.id) {
          await LetterService.updateLetter(editingLetter.id, data);
          toast.success("Letter updated");
        } else {
          await LetterService.createLetter(data);
          toast.success("Letter created");
        }
      }
  
      setLetterDialogOpen(false);
      loadLetters(page, pageSize);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save letter");
    }
  };
  

  // confirm dialog state & holder for dynamic confirm action
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmActionRef = useRef<null | { title?: string; description?: string; onConfirm: () => Promise<void> }>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#650000]">Letters & Phone Calls</h1>
        <p className="text-muted-foreground">Manage prisoner communications and correspondence</p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={`Search ${activeTab === "calls" ? "calls" : "letters"}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Button className="bg-primary" 
          onClick={() => { 
            if (activeTab === "calls") { 
              setEditingCall(null); callForm.reset({}); setCallDialogOpen(true); 
            } else { 
              setEditingLetter(null); letterForm.reset({}); setLetterDialogOpen(true); 
            } 
          }}><Plus className="h-4 w-4 mr-2" />
          {activeTab === "calls" ? "Add Call Record" : "Add Letter"}
        </Button>
      </div>

      {/* Restored original-style tabs with counts (icons + label + count). */}
      <Tabs value={activeTab} onValueChange={(v: Tab) => setActiveTab(v)}>
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value="calls" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Calls ({callsTotal ?? 0})
          </TabsTrigger>
          <TabsTrigger value="letters" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Letters ({lettersTotal ?? 0})
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>{activeTab === "calls" ? "Call Records" : "Letters"}</CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === "calls" ? (
              <DataTable
              url="/rehabilitation/call-records/"
                data={callsData}
                loading={callsLoading}
                total={callsTotal}
                title="Call Records"
                columns={callsColumns}
                externalSearch={searchTerm}
                onSearch={onSearch}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                onSort={onSort}
                page={page}
                pageSize={pageSize}
              />
            ) : (
              <DataTable
              url="/rehabilitation/eletters/"
                data={lettersData}
                loading={lettersLoading}
                total={lettersTotal}
                title="Letters"
                columns={lettersColumns}
                externalSearch={searchTerm}
                onSearch={onSearch}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                onSort={onSort}
                page={page}
                pageSize={pageSize}
              />
            )}
          </CardContent>
        </Card>
      </Tabs>

      {/* Call dialog */}
      <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingCall ? "Edit Call Record" : "Add Call Record"}</DialogTitle></DialogHeader>
          <form onSubmit={callForm.handleSubmit(onSubmitCall)} className="space-y-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prisoner Selection (required) */}
              <div>
                <Label htmlFor="prisoner">
                  Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="prisoner"
                  control={callForm.control}
                  rules={requiredValidation("Prisoner")}
                  render={({ field }) => (
                    <SearchableSelect
                      key={`prisoner-select-${region ?? ""}-${district ?? ""}-${station ?? ""}`}
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchPrisoners}
                      placeholder="Select prisoner"
                      idField="id"
                      labelField="full_name"
                      renderItem={(p: any) => {
                        const name = p.full_name ?? `${(p.first_name ?? "")} ${(p.last_name ?? "")}`.trim();
                        const number = p.prisoner_number_value ?? p.prisoner_number ?? "";
                        const stationName = p.current_station_name ?? p.station_name ?? "";
                        return `${String(name).trim()} ${number ? `(${number})` : ""}${stationName ? ` — ${stationName}` : ""}`;
                      }}
                    />
                  )}
                />
                {callForm.formState.errors.prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.prisoner as any).message}</p>
                )}
              </div>

              {/* Caller Name (required) */}
              <div>
                <Label htmlFor="caller">
                  Caller Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="caller"
                  {...callForm.register("caller", { required: "Caller name is required" })}
                  placeholder="Enter caller name"
                />
                {callForm.formState.errors.caller && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.caller as any).message}</p>
                )}
              </div>

              {/* Phone Number (required) */}
              <div>
                <Label htmlFor="phone_number">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone_number"
                  {...callForm.register("phone_number", { ...phoneNumberValidation, required: "Phone number is required" })}
                  placeholder="+256700000000"
                />
                {callForm.formState.errors.phone_number && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.phone_number as any).message}</p>
                )}
              </div>

              {/* Call Type (required) */}
              <div>
                <Label htmlFor="call_type">
                  Call Type <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="call_type"
                  control={callForm.control}
                  rules={requiredValidation("Call type")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchCallTypes}
                      placeholder="Select call type"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {callForm.formState.errors.call_type && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.call_type as any).message}</p>
                )}
              </div>

              {/* Relationship to Prisoner (required) */}
              <div>
                <Label htmlFor="relation_to_prisoner">
                  Relationship to Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="relation_to_prisoner"
                  control={callForm.control}
                  rules={requiredValidation("Relationship")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchRelationshipsLocal}
                      placeholder="Select relationship"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {callForm.formState.errors.relation_to_prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.relation_to_prisoner as any).message}</p>
                )}
              </div>

              {/* Welfare Officer (required) */}
              <div>
                <Label htmlFor="welfare_officer">
                  Welfare Officer <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="welfare_officer"
                  control={callForm.control}
                  rules={requiredValidation("Welfare officer")}
                  render={({ field }) => (
                    <StaffProfileSelect
                      value={field.value}
                      onChange={(forceNumber) => field.onChange(forceNumber)}
                      placeholder="Select welfare officer"
                    />
                  )}
                />
                {callForm.formState.errors.welfare_officer && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.welfare_officer as any).message}</p>
                )}
              </div>

              {/* Call Date & Time (required) */}
              <div>
                <Label htmlFor="call_date">
                  Call Date & Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="call_date"
                  type="datetime-local"
                  {...callForm.register("call_date", { required: "Call date is required" })}
                />
                {callForm.formState.errors.call_date && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.call_date as any).message}</p>
                )}
              </div>

              {/* Call Duration (required) */}
              <div>
                <Label htmlFor="call_duration">
                  Call Duration (minutes) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="call_duration"
                  type="number"
                  {...callForm.register("call_duration", {
                    required: "Call duration is required",
                    valueAsNumber: true,
                  })}
                  placeholder="Enter duration in minutes"
                />
                {callForm.formState.errors.call_duration && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.call_duration as any).message}</p>
                )}
              </div>

              {/* Recorded Call (optional upload) */}
              <div>
                <Label htmlFor="recorded_call">Recorded Call (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">Upload audio recording (optional)</p>
                  {/* FileUploader provides client-side validation + UX.
                      For recorded calls we allow common audio formats; change list below if needed. */}
                  <FileUploader
                    id="recorded_call"
                    accept={AUDIO_UPLOAD_ACCEPT}
                    allowedExts={AUDIO_EXTS}
                    maxSizeBytes={10 * 1024 * 1024} // 10 MB
                    onChange={(files) => {
                      if (files && files.length) callForm.setValue("recorded_call", files[0]);
                      else callForm.setValue("recorded_call", null);
                    }}
                  />
                </div>
              </div>
              {/* Call Notes */}
              <div>
                <Label htmlFor="call_notes">Call Notes</Label>
                <Textarea
                  id="call_notes"
                  {...callForm.register("call_notes")}
                  placeholder="Enter any notes about the call"
                  rows={6}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCallDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary">{editingCall ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
       </Dialog>

      {/* Letter dialog */}
      <Dialog open={letterDialogOpen} onOpenChange={setLetterDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingLetter ? "Edit Letter" : "Add Letter"}</DialogTitle></DialogHeader>
          <form onSubmit={letterForm.handleSubmit(onSubmitLetter)} className="space-y-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prisoner Selection (required) */}
              <div>
                <Label htmlFor="prisoner">
                  Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="prisoner"
                  control={letterForm.control}
                  rules={requiredValidation("Prisoner")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchPrisoners}
                      placeholder="Select prisoner"
                      idField="id"
                      labelField="full_name"
                      renderItem={(p: any) => {
                        const name = p.full_name ?? `${(p.first_name ?? "")} ${(p.last_name ?? "")}`.trim();
                        const number = p.prisoner_number_value ?? p.prisoner_number ?? "";
                        const stationName = p.current_station_name ?? p.station_name ?? "";
                        return `${String(name).trim()} ${number ? `(${number})` : ""}${stationName ? ` — ${stationName}` : ""}`;
                      }}
                    />
                  )}
                />
                {letterForm.formState.errors.prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.prisoner as any).message}</p>
                )}
              </div>

              {/* Letter Type (required) */}
              <div>
                <Label htmlFor="letter_type">
                  Letter Type <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="letter_type"
                  control={letterForm.control}
                  rules={requiredValidation("Letter type")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      items={letterTypes}
                      placeholder="Select letter type"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {letterForm.formState.errors.letter_type && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.letter_type as any).message}</p>
                )}
              </div>

              {/* Subject (required) */}
              <div className="md:col-span-2">
                <Label htmlFor="subject">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  {...letterForm.register("subject", { required: "Subject is required" })}
                  placeholder="Enter letter subject"
                />
                {letterForm.formState.errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.subject as any).message}</p>
                )}
              </div>

              {/* Letter Date (required) */}
              <div>
                <Label htmlFor="letter_date">
                  Letter Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="letter_date"
                  type="datetime-local"
                  {...letterForm.register("letter_date", { required: "Letter date is required" })}
                />
                {letterForm.formState.errors.letter_date && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.letter_date as any).message}</p>
                )}
              </div>

              {/* Relationship to Prisoner (required) */}
              <div>
                <Label htmlFor="letter_relation">
                  Relationship to Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="relation_to_prisoner"
                  control={letterForm.control}
                  rules={requiredValidation("Relationship")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchRelationshipsLocal}
                      placeholder="Select relationship"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {letterForm.formState.errors.relation_to_prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.relation_to_prisoner as any).message}</p>
                )}
              </div>

              {/* Welfare Officer */}
              <div>
                <Label htmlFor="welfare_officer">Welfare Officer</Label>
                <Controller
                  name="welfare_officer"
                  control={letterForm.control}
                  render={({ field }) => (
                    <StaffProfileSelect
                      value={field.value}
                      onChange={(forceNumber) => field.onChange(forceNumber)}
                      placeholder="Select welfare officer"
                    />
                  )}
                />
              </div>

              {/* Sender Name */}
              <div>
                <Label htmlFor="sender_name">Sender Name</Label>
                <Input
                  id="sender_name"
                  {...letterForm.register("sender_name")}
                  placeholder="Enter sender name"
                />
              </div>

              {/* Sender Email */}
              <div>
                <Label htmlFor="sender_email">Sender Email</Label>
                <Input
                  id="sender_email"
                  type="email"
                  {...letterForm.register("sender_email", emailValidation)}
                  placeholder="sender@example.com"
                />
                {letterForm.formState.errors.sender_email && (
                  <p className="text-red-500 text-sm mt-1">
                    {(letterForm.formState.errors.sender_email as any).message || "Invalid email"}
                  </p>
                )}
              </div>

              {/* Recipient Name */}
              <div>
                <Label htmlFor="recipient_name">Recipient Name</Label>
                <Input
                  id="recipient_name"
                  {...letterForm.register("recipient_name")}
                  placeholder="Enter recipient name"
                />
              </div>

              {/* Recipient Email */}
              <div>
                <Label htmlFor="recipient_email">Recipient Email</Label>
                <Input
                  id="recipient_email"
                  type="email"
                  {...letterForm.register("recipient_email", emailValidation)}
                  placeholder="recipient@example.com"
                />
                {letterForm.formState.errors.recipient_email && (
                  <p className="text-red-500 text-sm mt-1">
                    {(letterForm.formState.errors.recipient_email as any).message || "Invalid email"}
                  </p>
                )}
              </div>

            </div>

            {/* Letter Content */}
            <div>
              <Label htmlFor="letter_content">Letter Content</Label>
              <Textarea
                id="letter_content"
                {...letterForm.register("letter_content")}
                placeholder="Enter letter content"
                rows={6}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Letter Document */}
              <div>
                <Label htmlFor="letter_document">Letter Document (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Upload scanned letter or PDF (optional)</p>

                  {/* Reusable FileUploader with the centralized allowed extensions constant.
                      onChange updates react-hook-form value to the selected File (or null). */}
                  <FileUploader
                    id="letter_document"
                    accept={LETTER_UPLOAD_ACCEPT}
                    allowedExts={LETTER_ALLOWED_EXTS}
                    maxSizeBytes={15 * 1024 * 1024} // 15 MB, adjust as needed
                    onChange={(files) => {
                      if (files && files.length) letterForm.setValue("letter_document", files[0]);
                      else letterForm.setValue("letter_document", null);
                      // clear previous validation errors if any
                      letterForm.clearErrors("letter_document");
                    }}
                  />
                  {/* still show react-hook-form validation error if present */}
                  {letterForm.formState.errors.letter_document && (
                    <p className="text-red-500 text-sm mt-1">
                      {(letterForm.formState.errors.letter_document as any).message ||
                        (letterForm.formState.errors.letter_document as any)}
                    </p>
                  )}

                   {/* UX hint listing allowed formats */}
                   <p className="text-xs text-muted-foreground mt-2">
                     Allowed formats: {LETTER_ALLOWED_EXTS.join(", ")}. You can change the allowed list in code if needed.
                   </p>
                 </div>
               </div>

               {/* Comment */}
               <div>
                 <Label htmlFor="comment">Censor Comments</Label>
                 <Textarea
                   id="comment"
                   {...letterForm.register("comment")}
                   placeholder="Enter censor comments or notes"
                   rows={9}
                 />
               </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setLetterDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary">{editingLetter ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm dialog - rendered once per screen */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(v) => {
          setConfirmOpen(v);
          if (!v) confirmActionRef.current = null;
        }}
        title={confirmActionRef.current?.title}
        description={confirmActionRef.current?.description}
        onConfirm={async () => {
          if (confirmActionRef.current?.onConfirm) {
            await confirmActionRef.current.onConfirm();
          }
        }}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}