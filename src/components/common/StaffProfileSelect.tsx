import React from "react";
import SearchableSelect from "./SearchableSelect";
import { fetchStaffProfiles } from "../../services/staffProfilesService";

export interface StaffProfileSelectProps {
  value?: string | null; // force_number value
  onChange: (forceNumber: string | null) => void;
  placeholder?: string;
  className?: string;
}

// export default function StaffProfileSelect({ value, onChange, placeholder = "Select staff...", className }: StaffProfileSelectProps) {
//     return (
//         <SearchableSelect
//         value={value}
//         onChange={(v) => onChange(v)}
//         fetchOptions={async (q: string, signal?: AbortSignal) => {
//             const items = await fetchStaffProfiles(q, signal);
//             // normalize so each item has force_number and a display label if needed
//             return items.map((it: any) => ({
//             ...it,
//             force_number: it.force_number ?? it.force_number_value ?? it.forceNumber ?? "",
//             }));
//         }}
//         placeholder={placeholder}
//         idField="force_number"
//         labelField="force_number"
//         // renderItem={(it: any) => {
//         //     const name = [it.rank_name, it.first_name, it.middle_name, it.last_name].filter(Boolean).join(" ").trim();
//         //     const fn = it.force_number ?? "";
//         //     const station = it.station_name ?? it.current_station_name ?? "";
//         //     return `${name}${fn ? ` (${fn})` : ""}${station ? ` — ${station}` : ""}`;
//         // }}

//         renderItem={(it: any) => {
//             const firstName = it.first_name ?? "";
//             const lastName = it.last_name ?? "";
//             const forceNumber = it.force_number ?? "";
//             const rank = it.rank_name ?? "";

//             return `${firstName} ${lastName}${forceNumber ? ` [${forceNumber}]` : ""}${rank ? ` - ${rank}` : ""}`;
//         }}

//         className={className}
//         />
//     );
// }

// export default function StaffProfileSelect({ value, onChange, placeholder = "Select staff...", className }: StaffProfileSelectProps) {
//     return (
//         <SearchableSelect
//             value={value ?? null}
//             onChange={(v) => onChange(v)}
//             fetchOptions={async (q: string, signal?: AbortSignal) => {
//             const items = await fetchStaffProfiles(q, signal);
//             // normalize so each item has force_number for display but keep id as identifier
//             const normalized = (items ?? []).map((it: any) => ({
//                 ...it,
//                 force_number: it.force_number ?? it.forceNumber ?? it.force_number_value ?? "",
//             }));
//             // filter out entries without a usable UUID id
//             return normalized.filter((it: any) => it && it.id && String(it.id).trim() !== "");
//             }}
//             placeholder={placeholder}
//             idField="id"            // use UUID as the select value
//             labelField="force_number"
//             renderItem={(it: any) => {
//             const name = [it.rank_name, it.first_name, it.middle_name, it.last_name].filter(Boolean).join(" ").trim();
//             const fn = it.force_number ?? "";
//             const rank = it.rank_name ?? "";
//             const station = it.station_name ?? "";
//             // label shows readable info (name + [force] - rank / station)
//             return `${name}${fn ? ` [${fn}]` : ""}${rank ? ` - ${rank}` : ""}${station ? ` — ${station}` : ""}`;
//             }}
//             className={className}
//         />
//     );
// }


export default function StaffProfileSelect({
    value,
    onChange,
    placeholder = "Select staff...",
    className,
    }: StaffProfileSelectProps) {
    return (
        <SearchableSelect
        value={value ?? null}
        onChange={(v) => onChange(v)}
        fetchOptions={async (q: string, signal?: AbortSignal) => {
            const items = await fetchStaffProfiles(q, signal);
            // normalize so each item has force_number for display but keep id as identifier
            const normalized = (items ?? []).map((it: any) => ({
            ...it,
            force_number:
                it.force_number ?? it.forceNumber ?? it.force_number_value ?? "",
            }));
            // filter out entries without a usable UUID id
            return normalized.filter(
            (it: any) => it && it.id && String(it.id).trim() !== ""
            );
        }}
        placeholder={placeholder}
        idField="id" // use UUID as the select value
        labelField="force_number"
        renderItem={(it: any) => {
            const firstName = it.first_name ?? "";
            const lastName = it.last_name ?? "";
            const fn = it.force_number ?? "";
            const rank = it.rank_name ?? "";

            // label shows: FirstName LastName [ForceNumber] - Rank
            return `${firstName} ${lastName}${fn ? ` [${fn}]` : ""}${
            rank ? ` - ${rank}` : ""
            }`;
        }}
        className={className}
        />
    );
}
