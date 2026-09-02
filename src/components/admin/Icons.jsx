import React from 'react';

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const IconGrid = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <rect x="3" y="3" width="7.5" height="7.5" rx="1.6" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6" />
  </svg>
);

export const IconCalendar = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
    <line x1="3" y1="9.5" x2="21" y2="9.5" />
    <line x1="8" y1="2.5" x2="8" y2="6.5" />
    <line x1="16" y1="2.5" x2="16" y2="6.5" />
  </svg>
);

export const IconUser = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20c0-4.2 3.4-6.5 7.5-6.5s7.5 2.3 7.5 6.5" />
  </svg>
);

export const IconChart = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <line x1="5" y1="19" x2="5" y2="11" />
    <line x1="12" y1="19" x2="12" y2="6" />
    <line x1="19" y1="19" x2="19" y2="14" />
  </svg>
);

export const IconMonitor = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <rect x="3" y="4" width="18" height="13" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

export const IconGear = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 3v2.4M12 18.6V21M21 12h-2.4M5.4 12H3M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7M18.4 18.4l-1.7-1.7M7.3 7.3 5.6 5.6" />
  </svg>
);

export const IconSearch = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.2" y2="16.2" />
  </svg>
);

export const IconSun = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <circle cx="12" cy="12" r="4.5" />
    <line x1="12" y1="2" x2="12" y2="4.5" />
    <line x1="12" y1="19.5" x2="12" y2="22" />
    <line x1="4.5" y1="12" x2="2" y2="12" />
    <line x1="22" y1="12" x2="19.5" y2="12" />
    <line x1="6" y1="6" x2="4.3" y2="4.3" />
    <line x1="19.7" y1="19.7" x2="18" y2="18" />
    <line x1="18" y1="6" x2="19.7" y2="4.3" />
    <line x1="4.3" y1="19.7" x2="6" y2="18" />
  </svg>
);

export const IconMoon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M21 12.5A8.5 8.5 0 1 1 11.5 3a7 7 0 0 0 9.5 9.5Z" />
  </svg>
);

export const IconPlus = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.4} strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const IconChevronRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export const IconDots = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="19" cy="12" r="1.8" />
  </svg>
);

export const IconEye = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconEyeOff = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M3 3l18 18" />
    <path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a13.6 13.6 0 0 1-3.1 4.1M6.6 6.6C4 8.3 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.4-1" />
    <path d="M14.1 14.1a3 3 0 1 1-4.2-4.2" />
  </svg>
);

export const IconAlertCircle = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="13" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const IconCheckCircle = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12.5 9.5 18 20 6" />
  </svg>
);

export const IconChevronLeft = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

export const IconMenu = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <line x1="3.5" y1="6.5" x2="20.5" y2="6.5" />
    <line x1="3.5" y1="12" x2="20.5" y2="12" />
    <line x1="3.5" y1="17.5" x2="20.5" y2="17.5" />
  </svg>
);

export const IconX = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <line x1="5" y1="5" x2="19" y2="19" />
    <line x1="19" y1="5" x2="5" y2="19" />
  </svg>
);

export const IconBan = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <circle cx="12" cy="12" r="9" />
    <line x1="5.8" y1="5.8" x2="18.2" y2="18.2" />
  </svg>
);

export const IconTag = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M12.6 3.5H5.5A2 2 0 0 0 3.5 5.5v7.1a2 2 0 0 0 .59 1.41l9 9a2 2 0 0 0 2.82 0l6.6-6.6a2 2 0 0 0 0-2.82l-9-9a2 2 0 0 0-1.41-.59Z" />
    <circle cx="8.5" cy="8.5" r="1.6" />
  </svg>
);

export const IconBolt = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
  </svg>
);

export const IconClipboard = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
    <line x1="8" y1="10.5" x2="16" y2="10.5" />
    <line x1="8" y1="14.5" x2="16" y2="14.5" />
    <line x1="8" y1="18.5" x2="12" y2="18.5" />
  </svg>
);

export const IconTruck = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <rect x="1.5" y="6.5" width="13" height="10" rx="1" />
    <path d="M14.5 10h4l3.5 3.5V16.5a1 1 0 0 1-1 1h-1.5" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="17.5" cy="18" r="2" />
  </svg>
);

export const IconTrash = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <polyline points="3.5 6.5 5.5 6.5 20.5 6.5" />
    <path d="M18.5 6.5v13a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.5v-13m2.5 0V4a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 4v2.5" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export const IconPencil = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M17.5 3.5a2.12 2.12 0 0 1 3 3L8 19 3 20.5 4.5 15.5 17.5 3.5Z" />
    <line x1="15.5" y1="5.5" x2="18.5" y2="8.5" />
  </svg>
);

export const IconWhatsApp = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12.01 2C6.49 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l5.08-1.34A9.95 9.95 0 0 0 12.01 22C17.52 22 22 17.52 22 12S17.52 2 12.01 2Zm5.61 14.13c-.24.68-1.4 1.3-1.93 1.35-.5.05-1.02.24-3.4-.71-2.9-1.16-4.76-4.14-4.9-4.33-.14-.19-1.16-1.55-1.16-2.96 0-1.4.73-2.09 1-2.38.24-.26.53-.32.71-.32h.5c.16 0 .38-.03.58.44.24.58.82 2.01.89 2.15.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.35 1.46.29.15.46.13.63-.08.17-.21.72-.84.92-1.13.19-.29.38-.24.63-.14.26.1 1.64.77 1.92.91.29.15.48.22.55.34.07.13.07.75-.17 1.43Z" />
  </svg>
);

export const IconLogOut = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
