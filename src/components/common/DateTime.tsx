import React from 'react';

export type DateTimeFormat = 'iso' | 'dMY' | 'short' | 'dateOnly';

export function formatDateTime(value?: string | Date | null, format: DateTimeFormat = 'dMY') {
    if (!value) return '';
        const d = (value instanceof Date) ? value : new Date(String(value));
    if (isNaN(d.getTime())) return String(value);

    // time part like "2:00:12 PM"
    const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });

    if (format === 'iso') {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}, ${time}`;
    }

    if (format === 'dMY') {
        // e.g. "12-Nov-2025, 2:00:12 PM"
        const dd = String(d.getDate()).padStart(2, '0');
        const monthShort = d.toLocaleString(undefined, { month: 'short' });
        const yyyy = d.getFullYear();
        return `${dd}-${monthShort}-${yyyy}, ${time}`;
    }

    if (format === 'dateOnly') {
        // e.g. "12-Nov-2025" (no time)
        const dd = String(d.getDate()).padStart(2, '0');
        const monthShort = d.toLocaleString(undefined, { month: 'short' });
        const yyyy = d.getFullYear();
        return `${dd}-${monthShort}-${yyyy}`;
    }

    // fallback: locale date + time
    return `${d.toLocaleDateString()} , ${time}`;
}

const DateTime: React.FC<{ value?: string | Date | null; format?: DateTimeFormat; className?: string }> = ({ value, format = 'dMY', className }) => {
    return <span className={className}>{formatDateTime(value, format)}</span>;
};

export default DateTime;



// v1

// import React from 'react';

// export type DateTimeFormat = 'iso' | 'dMY' | 'short';

// export function formatDateTime(value?: string | Date | null, format: DateTimeFormat = 'dMY') {
//     if (!value) return '';
//         const d = (value instanceof Date) ? value : new Date(String(value));
//     if (isNaN(d.getTime())) return String(value);

//     // time part like "2:00:12 PM"
//     const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });

//     if (format === 'iso') {
//         const yyyy = d.getFullYear();
//         const mm = String(d.getMonth() + 1).padStart(2, '0');
//         const dd = String(d.getDate()).padStart(2, '0');
//         return `${yyyy}-${mm}-${dd}, ${time}`;
//     }

//     if (format === 'dMY') {
//         // e.g. "12-Nov-2025, 2:00:12 PM"
//         const dd = String(d.getDate()).padStart(2, '0');
//         const monthShort = d.toLocaleString(undefined, { month: 'short' });
//         const yyyy = d.getFullYear();
//         return `${dd}-${monthShort}-${yyyy}, ${time}`;
//     }

//     // fallback: locale date + time
//     return `${d.toLocaleDateString()} , ${time}`;
// }

// const DateTime: React.FC<{ value?: string | Date | null; format?: DateTimeFormat; className?: string }> = ({ value, format = 'dMY', className }) => {
//     return <span className={className}>{formatDateTime(value, format)}</span>;
// };

// export default DateTime;