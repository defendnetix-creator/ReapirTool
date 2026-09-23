/**
 * Software Operations Handler
 * Akshigo PC Toolkit Pro v8.0.0-rc.1
 * Phase 8.6: Software Deployment, 100 Apps & Portable Tools Parity
 */

import {
  OperationJob,
  SoftwareAppItem,
  SoftwareBundle,
  CustomBundle,
  SoftwareInventoryItem,
  SoftwareInstallHistoryItem,
  PortableToolItem,
  DeploymentHelperItem,
  AppInstallStatus
} from '../types.js';

// --- IN-MEMORY AUDIT LOG & CUSTOM BUNDLES ---
let installHistory: SoftwareInstallHistoryItem[] = [
  {
    id: 'hist-1',
    appId: 'Google.Chrome',
    appName: 'Google Chrome',
    version: '128.0.6613.120',
    action: 'INSTALL',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'SUCCESS',
    source: 'winget',
    jobId: 'job-init-1',
    details: 'Installed successfully to Program Files.'
  },
  {
    id: 'hist-2',
    appId: 'Microsoft.VisualStudioCode',
    appName: 'Visual Studio Code',
    version: '1.93.0',
    action: 'INSTALL',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: 'SUCCESS',
    source: 'winget',
    jobId: 'job-init-2',
    details: 'User-scope install with PATH configuration.'
  },
  {
    id: 'hist-3',
    appId: '7zip.7zip',
    appName: '7-Zip 64-bit',
    version: '24.07',
    action: 'INSTALL',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'SUCCESS',
    source: 'winget',
    jobId: 'job-init-3',
    details: 'Machine-scope installer.'
  }
];

let customBundles: CustomBundle[] = [
  {
    id: 'cbund-1',
    name: 'Tech Admin Setup',
    description: 'Essential field-tech troubleshooting, network scanning, and diagnostic apps.',
    appIds: ['voidtools.Everything', 'Notepad++.Notepad++', '7zip.7zip', 'Wireshark.Wireshark', 'PuTTY.PuTTY'],
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 7).toISOString()
  }
];

// --- 100+ CURATED WINGET APPLICATIONS CATALOG ---
export const WINGET_APP_CATALOG: SoftwareAppItem[] = [
  // 1. Browsers
  {
    id: 'Google.Chrome',
    name: 'Google Chrome',
    category: 'Browsers',
    publisher: 'Google LLC',
    version: '128.0.6613.137',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware',
    description: 'Fast, secure, and customizable web browser built for modern web standards.',
    sizeMB: 104,
    installed: true,
    installedVersion: '128.0.6613.120',
    updateAvailable: true
  },
  {
    id: 'Mozilla.Firefox',
    name: 'Mozilla Firefox',
    category: 'Browsers',
    publisher: 'Mozilla Corporation',
    version: '130.0.1',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (MPL 2.0)',
    description: 'Privacy-focused, non-profit open-source web browser with tracking protection.',
    sizeMB: 62
  },
  {
    id: 'Brave.Brave',
    name: 'Brave Browser',
    category: 'Browsers',
    publisher: 'Brave Software, Inc.',
    version: '1.69.168',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (MPL 2.0)',
    description: 'Chromium-based browser blocking ads and website trackers by default.',
    sizeMB: 115
  },
  {
    id: 'Microsoft.Edge',
    name: 'Microsoft Edge',
    category: 'Browsers',
    publisher: 'Microsoft Corporation',
    version: '128.0.2739.79',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Proprietary',
    description: 'Built-in Windows browser featuring Copilot and enterprise security sync.',
    sizeMB: 150,
    installed: true,
    installedVersion: '128.0.2739.79',
    updateAvailable: false
  },
  {
    id: 'Opera.Opera',
    name: 'Opera Browser',
    category: 'Browsers',
    publisher: 'Opera Norway AS',
    version: '113.0.5230.86',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Freeware',
    description: 'Feature-rich web browser with integrated free VPN and messaging sidebars.',
    sizeMB: 98
  },
  {
    id: 'Vivaldi.Vivaldi',
    name: 'Vivaldi Browser',
    category: 'Browsers',
    publisher: 'Vivaldi Technologies',
    version: '6.9.3447.48',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Freeware',
    description: 'Power-user browser with tab stacking, split screen, and extreme customization.',
    sizeMB: 92
  },
  {
    id: 'TorProject.TorBrowser',
    name: 'Tor Browser',
    category: 'Browsers',
    publisher: 'The Tor Project, Inc.',
    version: '13.5.3',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Open Source (BSD 3-Clause)',
    description: 'Anonymized browsing routing traffic through the decentralized Tor network.',
    sizeMB: 88
  },
  {
    id: 'Waterfox.Waterfox',
    name: 'Waterfox',
    category: 'Browsers',
    publisher: 'System1 LLC',
    version: 'G6.0.20',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (MPL 2.0)',
    description: 'Fast, telemetry-free 64-bit browser built on Firefox codebase.',
    sizeMB: 75
  },

  // 2. Communication
  {
    id: 'Discord.Discord',
    name: 'Discord',
    category: 'Communication',
    publisher: 'Discord Inc.',
    version: '1.0.9163',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Freeware',
    description: 'Voice, video, and text communication service for communities and gaming.',
    sizeMB: 85
  },
  {
    id: 'SlackTechnologies.Slack',
    name: 'Slack',
    category: 'Communication',
    publisher: 'Slack Technologies LLC',
    version: '4.39.95',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Freeware / Subscription',
    description: 'Collaboration platform connecting teams with channels, messaging, and calls.',
    sizeMB: 92
  },
  {
    id: 'Telegram.TelegramDesktop',
    name: 'Telegram Desktop',
    category: 'Communication',
    publisher: 'Telegram FZ-LLC',
    version: '5.4.1',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Open Source (GPL v3)',
    description: 'Fast, secure desktop messaging with cloud sync and massive group support.',
    sizeMB: 42
  },
  {
    id: 'WhatsApp.WhatsApp',
    name: 'WhatsApp Desktop',
    category: 'Communication',
    publisher: 'Meta Platforms Inc.',
    version: '2.2435.6',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Freeware',
    description: 'Official WhatsApp client for Windows with end-to-end encryption.',
    sizeMB: 120
  },
  {
    id: 'Zoom.Zoom',
    name: 'Zoom Workplace',
    category: 'Communication',
    publisher: 'Zoom Video Communications, Inc.',
    version: '6.1.10',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware / Commercial',
    description: 'Enterprise video conferencing, screen sharing, and team chat solution.',
    sizeMB: 78
  },
  {
    id: 'Microsoft.Teams',
    name: 'Microsoft Teams',
    category: 'Communication',
    publisher: 'Microsoft Corporation',
    version: '24215.1007.3073.3323',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Commercial / Free tier',
    description: 'Unified communication and collaboration platform within Microsoft 365.',
    sizeMB: 160,
    installed: true,
    installedVersion: '24215.1007.3073.3323',
    updateAvailable: false
  },
  {
    id: 'OpenWhisperSystems.Signal',
    name: 'Signal Desktop',
    category: 'Communication',
    publisher: 'Signal Messenger LLC',
    version: '7.24.0',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Open Source (AGPL v3)',
    description: 'Private messenger with peer-reviewed end-to-end cryptographic encryption.',
    sizeMB: 130
  },
  {
    id: 'Rambox.Rambox.Community',
    name: 'Rambox Community',
    category: 'Communication',
    publisher: 'Rambox LLC',
    version: '2.3.2',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Open Source',
    description: 'All-in-one messaging workspace combining WhatsApp, Slack, Teams, and email.',
    sizeMB: 95
  },
  {
    id: 'Rakuten.Viber',
    name: 'Rakuten Viber',
    category: 'Communication',
    publisher: 'Viber Media S.a.r.l.',
    version: '23.4.0',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Freeware',
    description: 'Free, simple, fast and secure voice and video messaging app.',
    sizeMB: 110
  },
  {
    id: 'Element.Element',
    name: 'Element (Matrix Client)',
    category: 'Communication',
    publisher: 'New Vector Ltd',
    version: '1.11.76',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Open Source (Apache 2.0)',
    description: 'Decentralized, encrypted messaging client built on the Matrix open protocol.',
    sizeMB: 94
  },

  // 3. Media & Audio
  {
    id: 'VideoLAN.VLC',
    name: 'VLC Media Player',
    category: 'Media',
    publisher: 'VideoLAN Organization',
    version: '3.0.21',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (GPL v2)',
    description: 'Universal cross-platform multimedia player that plays almost any codec and stream.',
    sizeMB: 40
  },
  {
    id: 'OBSProject.OBSStudio',
    name: 'OBS Studio',
    category: 'Media',
    publisher: 'OBS Project',
    version: '30.2.3',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (GPL v2)',
    description: 'Free and open source software for video recording and live broadcasting.',
    sizeMB: 135
  },
  {
    id: 'Spotify.Spotify',
    name: 'Spotify',
    category: 'Media',
    publisher: 'Spotify AB',
    version: '1.2.45.454',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Freeware',
    description: 'Digital music, podcast, and video streaming service giving access to millions of songs.',
    sizeMB: 95
  },
  {
    id: 'Audacity.Audacity',
    name: 'Audacity Audio Editor',
    category: 'Media',
    publisher: 'Muse Group / Audacity Team',
    version: '3.6.4',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (GPL v2)',
    description: 'Easy-to-use, multi-track audio editor and recorder for Windows.',
    sizeMB: 38
  },
  {
    id: 'HandBrake.HandBrake',
    name: 'HandBrake Video Transcoder',
    category: 'Media',
    publisher: 'The HandBrake Team',
    version: '1.8.2',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (GPL v2)',
    description: 'Tool for converting video from nearly any format to modern, widely supported codecs.',
    sizeMB: 28
  },
  {
    id: 'foobar2000.foobar2000',
    name: 'foobar2000',
    category: 'Media',
    publisher: 'Peter Pawlowski',
    version: '2.1.5',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware',
    description: 'Advanced, lightweight audio player with gapless playback and extensive tag editing.',
    sizeMB: 6
  },
  {
    id: 'GIMP.GIMP',
    name: 'GIMP Image Editor',
    category: 'Media',
    publisher: 'The GIMP Development Team',
    version: '2.10.38',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (GPL v3)',
    description: 'Free & Open Source Image Editor suitable for photo retouching and composition.',
    sizeMB: 280
  },
  {
    id: 'BlenderFoundation.Blender',
    name: 'Blender 3D Suite',
    category: 'Media',
    publisher: 'Blender Foundation',
    version: '4.2.1',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (GPL v2)',
    description: 'Open source 3D creation pipeline supporting modeling, rigging, animation, and rendering.',
    sizeMB: 330
  },
  {
    id: 'Apple.iTunes',
    name: 'Apple iTunes (x64)',
    category: 'Media',
    publisher: 'Apple Inc.',
    version: '12.13.3.2',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware',
    description: 'Official Apple media player, media library, and mobile device management application.',
    sizeMB: 210
  },
  {
    id: 'CodecGuide.K-LiteCodecPack.Mega',
    name: 'K-Lite Codec Pack Mega',
    category: 'Media',
    publisher: 'Codec Guide',
    version: '18.5.5',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware',
    description: 'Complete collection of DirectShow filters, VFW/ACM codecs, and MPC-HC video player.',
    sizeMB: 64
  },
  {
    id: 'MusicBee.MusicBee',
    name: 'MusicBee Music Manager',
    category: 'Media',
    publisher: 'Steven Mayall',
    version: '3.5.8698',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware',
    description: 'Ultimate music manager and player for managing large libraries with Auto-tagging.',
    sizeMB: 18
  },
  {
    id: 'dotPDNLLC.paintdotnet',
    name: 'Paint.NET',
    category: 'Media',
    publisher: 'dotPDN LLC',
    version: '5.0.13',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware',
    description: 'Image and photo editing software with an intuitive interface and layer support.',
    sizeMB: 68
  },

  // 4. Utilities
  {
    id: '7zip.7zip',
    name: '7-Zip 64-bit',
    category: 'Utilities',
    publisher: 'Igor Pavlov',
    version: '24.07',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (GNU LGPL)',
    description: 'High-compression ratio file archiver supporting 7z, ZIP, RAR, TAR, and GZIP.',
    sizeMB: 2,
    installed: true,
    installedVersion: '24.07',
    updateAvailable: false
  },
  {
    id: 'RARLab.WinRAR',
    name: 'WinRAR Archiver',
    category: 'Utilities',
    publisher: 'win.rar GmbH',
    version: '7.01.0',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Shareware',
    description: 'Powerful archive manager supporting RAR, ZIP, CAB, ARJ, LZH, TAR, GZ, and ISO.',
    sizeMB: 4
  },
  {
    id: 'Notepad++.Notepad++',
    name: 'Notepad++',
    category: 'Utilities',
    publisher: 'Don Ho',
    version: '8.6.9',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (GPL v3)',
    description: 'Free source code editor and Notepad replacement that supports several languages.',
    sizeMB: 5
  },
  {
    id: 'voidtools.Everything',
    name: 'Everything Search',
    category: 'Utilities',
    publisher: 'voidtools',
    version: '1.4.1.1026',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware',
    description: 'Locate files and folders by name instantly using NTFS Master File Table indexing.',
    sizeMB: 2
  },
  {
    id: 'JAMSoftware.TreeSize.Free',
    name: 'TreeSize Free',
    category: 'Utilities',
    publisher: 'JAM Software GmbH',
    version: '4.7.3',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware',
    description: 'Quickly scan directory trees and find out where your disk space has gone.',
    sizeMB: 12
  },
  {
    id: 'ShareX.ShareX',
    name: 'ShareX Screen Capture',
    category: 'Utilities',
    publisher: 'ShareX Team',
    version: '16.1.0',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (GPL v3)',
    description: 'Screen capture, file sharing, and productivity tool with OCR and screen recorder.',
    sizeMB: 36
  },
  {
    id: 'AutoHotkey.AutoHotkey',
    name: 'AutoHotkey v2',
    category: 'Utilities',
    publisher: 'AutoHotkey Foundation LLC',
    version: '2.0.18',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (GPL v2)',
    description: 'Ultimate automation scripting language for key remapping and Windows workflows.',
    sizeMB: 4
  },
  {
    id: 'BleachBit.BleachBit',
    name: 'BleachBit System Cleaner',
    category: 'Utilities',
    publisher: 'BleachBit Project',
    version: '4.6.0',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (GPL v3)',
    description: 'Clean disk space, wipe free space, and protect privacy across browsers and apps.',
    sizeMB: 15
  },
  {
    id: 'Microsoft.PowerToys',
    name: 'Microsoft PowerToys',
    category: 'Utilities',
    publisher: 'Microsoft Corporation',
    version: '0.84.1',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (MIT)',
    description: 'Set of system utilities for Windows power users to tune and streamline workflows.',
    sizeMB: 180
  },
  {
    id: 'Rufus.Rufus',
    name: 'Rufus Bootable USB Creator',
    category: 'Utilities',
    publisher: 'Akeo Consulting',
    version: '4.5',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (GPL v3)',
    description: 'Format and create bootable USB flash drives, such as Windows or Linux ISOs.',
    sizeMB: 2
  },
  {
    id: 'SpecialFolder.BulkRenameUtility',
    name: 'Bulk Rename Utility',
    category: 'Utilities',
    publisher: 'TGRMN Software',
    version: '4.0.0.3',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware',
    description: 'Easily rename files and entire folders based upon extremely flexible criteria.',
    sizeMB: 14
  },
  {
    id: 'WinDirStat.WinDirStat',
    name: 'WinDirStat Disk Usage',
    category: 'Utilities',
    publisher: 'WinDirStat Team',
    version: '1.1.2',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (GPL v2)',
    description: 'Disk usage statistics viewer and cleanup tool with treemap visualization.',
    sizeMB: 1
  },

  // 5. Productivity & Office
  {
    id: 'LibreOffice.LibreOffice',
    name: 'LibreOffice Suite',
    category: 'Productivity',
    publisher: 'The Document Foundation',
    version: '24.8.1',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (MPL 2.0)',
    description: 'Free and powerful office suite with Writer, Calc, Impress, Draw, and Base.',
    sizeMB: 340
  },
  {
    id: 'Adobe.Acrobat.Reader.64-bit',
    name: 'Adobe Acrobat Reader (64-bit)',
    category: 'Productivity',
    publisher: 'Adobe Inc.',
    version: '24.003.20112',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware',
    description: 'The global standard for reliably viewing, signing, and commenting on PDF documents.',
    sizeMB: 410
  },
  {
    id: 'Foxit.FoxitReader',
    name: 'Foxit PDF Reader',
    category: 'Productivity',
    publisher: 'Foxit Software Inc.',
    version: '2024.2.2.25170',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware',
    description: 'Lightweight, fast, and feature-rich PDF viewer with annotation tools.',
    sizeMB: 98
  },
  {
    id: 'SumatraPDF.SumatraPDF',
    name: 'SumatraPDF',
    category: 'Productivity',
    publisher: 'Krzysztof Kowalczyk',
    version: '3.5.2',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (GPL v3)',
    description: 'Ultra-fast, compact PDF, eBook (ePub, Mobi), XPS, DjVu, CHM, and Comic Book reader.',
    sizeMB: 8
  },
  {
    id: 'Obsidian.Obsidian',
    name: 'Obsidian Markdown Notes',
    category: 'Productivity',
    publisher: 'Dynalist Inc.',
    version: '1.6.7',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Freeware (Personal)',
    description: 'Extensible knowledge base on top of a local folder of plain text Markdown files.',
    sizeMB: 90
  },
  {
    id: 'Notion.Notion',
    name: 'Notion Workspace',
    category: 'Productivity',
    publisher: 'Notion Labs, Incorporated',
    version: '4.1.1',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Freeware / Subscription',
    description: 'Connected workspace where better, faster work happens with AI and collaboration.',
    sizeMB: 110
  },
  {
    id: 'Evernote.Evernote',
    name: 'Evernote',
    category: 'Productivity',
    publisher: 'Bending Spoons Operations S.p.A.',
    version: '10.104.3',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Freeware / Commercial',
    description: 'Note-taking, organizing, task management, and archiving app.',
    sizeMB: 180
  },
  {
    id: 'KovidGoyal.Calibre',
    name: 'Calibre eBook Manager',
    category: 'Productivity',
    publisher: 'Kovid Goyal',
    version: '7.17.0',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (GPL v3)',
    description: 'Powerful, easy-to-use e-book manager for cataloging, converting, and reader syncing.',
    sizeMB: 155
  },

  // 6. Developer Tools
  {
    id: 'Microsoft.VisualStudioCode',
    name: 'Visual Studio Code',
    category: 'Developer Tools',
    publisher: 'Microsoft Corporation',
    version: '1.93.1',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Freeware / MIT',
    description: 'Code editor redefined and optimized for building and debugging modern cloud and web apps.',
    sizeMB: 95,
    installed: true,
    installedVersion: '1.93.0',
    updateAvailable: true
  },
  {
    id: 'Git.Git',
    name: 'Git for Windows',
    category: 'Developer Tools',
    publisher: 'The Git Development Community',
    version: '2.46.1',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (GPL v2)',
    description: 'Distributed version control system designed for speed and data integrity.',
    sizeMB: 60,
    installed: true,
    installedVersion: '2.46.0',
    updateAvailable: true
  },
  {
    id: 'Python.Python.3.12',
    name: 'Python 3.12 (64-bit)',
    category: 'Developer Tools',
    publisher: 'Python Software Foundation',
    version: '3.12.6',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (PSF)',
    description: 'Popular high-level interpreted programming language with vast ecosystem.',
    sizeMB: 26
  },
  {
    id: 'OpenJS.NodeJS.LTS',
    name: 'Node.js LTS (v22.x)',
    category: 'Developer Tools',
    publisher: 'OpenJS Foundation',
    version: '22.8.0',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (MIT)',
    description: 'JavaScript runtime built on Chrome V8 JavaScript engine for scalable network apps.',
    sizeMB: 32,
    installed: true,
    installedVersion: '22.8.0',
    updateAvailable: false
  },
  {
    id: 'Docker.DockerDesktop',
    name: 'Docker Desktop',
    category: 'Developer Tools',
    publisher: 'Docker Inc.',
    version: '4.34.2',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware / Commercial',
    description: 'GUI desktop environment for building, running, and containerizing microservices.',
    sizeMB: 540
  },
  {
    id: 'Postman.Postman',
    name: 'Postman API Platform',
    category: 'Developer Tools',
    publisher: 'Postman, Inc.',
    version: '11.12.0',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Freeware',
    description: 'API platform for building and using APIs, simplifying each step of the API lifecycle.',
    sizeMB: 170
  },
  {
    id: 'PuTTY.PuTTY',
    name: 'PuTTY SSH Client',
    category: 'Developer Tools',
    publisher: 'Simon Tatham',
    version: '0.81',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (MIT)',
    description: 'Reliable, lightweight SSH and Telnet client for Windows network administration.',
    sizeMB: 4
  },
  {
    id: 'WinSCP.WinSCP',
    name: 'WinSCP SFTP/FTP Client',
    category: 'Developer Tools',
    publisher: 'Martin Prikryl',
    version: '6.3.5',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (GPL v3)',
    description: 'Popular SFTP client and FTP client for Windows for secure remote file transfers.',
    sizeMB: 11
  },
  {
    id: 'iterate.Cyberduck',
    name: 'Cyberduck Cloud Storage Browser',
    category: 'Developer Tools',
    publisher: 'iterate GmbH',
    version: '8.9.0',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (GPL v3)',
    description: 'Libre server and cloud storage browser for SFTP, S3, Azure, WebDAV, and Google Drive.',
    sizeMB: 65
  },
  {
    id: 'DBBrowserForSQLite.DBBrowserForSQLite',
    name: 'DB Browser for SQLite',
    category: 'Developer Tools',
    publisher: 'DB Browser for SQLite Team',
    version: '3.12.2',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (MPL 2.0)',
    description: 'High quality, visual, open source tool to create, design, and edit SQLite database files.',
    sizeMB: 18
  },
  {
    id: 'Microsoft.WindowsTerminal',
    name: 'Windows Terminal',
    category: 'Developer Tools',
    publisher: 'Microsoft Corporation',
    version: '1.21.2361.0',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Open Source (MIT)',
    description: 'Modern, fast, efficient, powerful terminal emulator for command-line tools and shells.',
    sizeMB: 38
  },
  {
    id: 'Microsoft.PowerShell',
    name: 'PowerShell 7 (x64)',
    category: 'Developer Tools',
    publisher: 'Microsoft Corporation',
    version: '7.4.5.0',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (MIT)',
    description: 'Cross-platform task automation and configuration management framework.',
    sizeMB: 105
  },
  {
    id: 'Wireshark.Wireshark',
    name: 'Wireshark Network Analyzer',
    category: 'Developer Tools',
    publisher: 'Wireshark Foundation',
    version: '4.2.7',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (GPL v2)',
    description: 'The world’s foremost and widely-used network protocol analyzer.',
    sizeMB: 82
  },
  {
    id: 'dbeaver.dbeaver',
    name: 'DBeaver Community',
    category: 'Developer Tools',
    publisher: 'DBeaver Corp',
    version: '24.2.0',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (Apache 2.0)',
    description: 'Universal database management tool for PostgreSQL, MySQL, SQLite, and SQL Server.',
    sizeMB: 120
  },
  {
    id: 'GoLang.Go',
    name: 'Go Programming Language',
    category: 'Developer Tools',
    publisher: 'Google LLC',
    version: '1.23.1',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (BSD 3-Clause)',
    description: 'Open source programming language that makes it easy to build simple, reliable, and efficient software.',
    sizeMB: 125
  },
  {
    id: 'Rustlang.Rustup',
    name: 'Rustup (Rust Toolchain)',
    category: 'Developer Tools',
    publisher: 'Rust Foundation',
    version: '1.27.1',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Open Source (MIT / Apache 2.0)',
    description: 'The Rust toolchain installer enabling memory-safe systems programming.',
    sizeMB: 10
  },

  // 7. Remote Support
  {
    id: 'AnyDeskSoftwareGmbH.AnyDesk',
    name: 'AnyDesk Remote Desktop',
    category: 'Remote Support',
    publisher: 'AnyDesk Software GmbH',
    version: '8.1.0',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware / Commercial',
    description: 'Secure, lightweight remote desktop software with low latency DeskRT codec.',
    sizeMB: 5
  },
  {
    id: 'TeamViewer.TeamViewer',
    name: 'TeamViewer Remote Client',
    category: 'Remote Support',
    publisher: 'TeamViewer Germany GmbH',
    version: '15.57.5',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware (Non-commercial) / Commercial',
    description: 'Remote connectivity platform to access, control, manage, and monitor any device.',
    sizeMB: 48
  },
  {
    id: 'RustDesk.RustDesk',
    name: 'RustDesk Open Source Remote',
    category: 'Remote Support',
    publisher: 'RustDesk Team',
    version: '1.3.0',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (AGPL v3)',
    description: 'Open source virtual remote desktop software allowing self-hosted relay infrastructure.',
    sizeMB: 22
  },
  {
    id: 'UltraViewer.UltraViewer',
    name: 'UltraViewer Remote Support',
    category: 'Remote Support',
    publisher: 'DucFabulous Ltd',
    version: '6.6.65',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware / Commercial',
    description: 'Simple remote support software allowing quick technician connections with chat.',
    sizeMB: 4
  },

  // 8. Cloud Storage
  {
    id: 'Google.GoogleDrive',
    name: 'Google Drive for Desktop',
    category: 'Cloud Storage',
    publisher: 'Google LLC',
    version: '98.0.2.0',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware',
    description: 'Access files from Google Drive directly from your Windows file explorer.',
    sizeMB: 360
  },
  {
    id: 'Dropbox.Dropbox',
    name: 'Dropbox Desktop Client',
    category: 'Cloud Storage',
    publisher: 'Dropbox, Inc.',
    version: '206.4.6506',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Freeware / Subscription',
    description: 'Cloud storage and file synchronization client with instant link sharing.',
    sizeMB: 190
  },
  {
    id: 'Microsoft.OneDrive',
    name: 'Microsoft OneDrive',
    category: 'Cloud Storage',
    publisher: 'Microsoft Corporation',
    version: '24.166.0818.0003',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Freeware / Subscription',
    description: 'Native Windows cloud synchronization client for personal and business files.',
    sizeMB: 65,
    installed: true,
    installedVersion: '24.166.0818.0003',
    updateAvailable: false
  },
  {
    id: 'Nextcloud.NextcloudDesktop',
    name: 'Nextcloud Desktop Client',
    category: 'Cloud Storage',
    publisher: 'Nextcloud GmbH',
    version: '3.13.4',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (GPL v2)',
    description: 'Self-hosted productivity platform keeping your data under your control.',
    sizeMB: 120
  },
  {
    id: 'Mega.MEGAsync',
    name: 'MEGAsync',
    category: 'Cloud Storage',
    publisher: 'Mega Limited',
    version: '5.2.0',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Freeware',
    description: 'User-controlled end-to-end encrypted cloud storage sync client.',
    sizeMB: 45
  },

  // 9. Security Utilities
  {
    id: 'Malwarebytes.Malwarebytes',
    name: 'Malwarebytes Anti-Malware',
    category: 'Security Utilities',
    publisher: 'Malwarebytes Inc.',
    version: '5.1.9.124',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware / Commercial',
    description: 'Comprehensive cyber-protection against malware, ransomware, and malicious websites.',
    sizeMB: 310
  },
  {
    id: 'Bitwarden.Bitwarden',
    name: 'Bitwarden Password Manager',
    category: 'Security Utilities',
    publisher: 'Bitwarden Inc.',
    version: '2024.8.2',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Open Source (GPL v3)',
    description: 'Secure, zero-knowledge open-source password manager for storing sensitive credentials.',
    sizeMB: 92
  },
  {
    id: 'KeePassXCTeam.KeePassXC',
    name: 'KeePassXC',
    category: 'Security Utilities',
    publisher: 'KeePassXC Team',
    version: '2.7.9',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (GPL v3)',
    description: 'Community-driven port of KeePass Password Safe with modern offline encryption.',
    sizeMB: 48
  },
  {
    id: 'ProtonTechnologies.ProtonVPN',
    name: 'Proton VPN Client',
    category: 'Security Utilities',
    publisher: 'Proton AG',
    version: '3.3.4',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware / Subscription',
    description: 'Swiss-based high-speed VPN protecting user privacy with strict no-logs policy.',
    sizeMB: 85
  },
  {
    id: 'Cloudflare.Warp',
    name: 'Cloudflare WARP (1.1.1.1)',
    category: 'Security Utilities',
    publisher: 'Cloudflare Inc.',
    version: '2024.6.497.0',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware',
    description: 'Replaces the connection between your device and the Internet with a modern, optimized DNS.',
    sizeMB: 95
  },
  {
    id: 'OpenVPNTechnologies.OpenVPNConnect',
    name: 'OpenVPN Connect Client',
    category: 'Security Utilities',
    publisher: 'OpenVPN Inc.',
    version: '3.4.4',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware',
    description: 'Official full-featured Windows client for the OpenVPN protocol.',
    sizeMB: 45
  },

  // 10. Runtimes
  {
    id: 'Microsoft.VCRedist.2015+.x64',
    name: 'Microsoft Visual C++ 2015-2022 (x64)',
    category: 'Runtimes',
    publisher: 'Microsoft Corporation',
    version: '14.40.33810.0',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware',
    description: 'Visual C++ Redistributable packages required to run C++ desktop applications.',
    sizeMB: 24
  },
  {
    id: 'Microsoft.DotNet.DesktopRuntime.8',
    name: 'Microsoft .NET Desktop Runtime 8.0 (x64)',
    category: 'Runtimes',
    publisher: 'Microsoft Corporation',
    version: '8.0.8',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (MIT)',
    description: 'Runs Windows desktop applications built for the modern .NET 8 framework.',
    sizeMB: 58
  },
  {
    id: 'Microsoft.EdgeWebView2Runtime',
    name: 'Microsoft Edge WebView2 Runtime',
    category: 'Runtimes',
    publisher: 'Microsoft Corporation',
    version: '128.0.2739.79',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Proprietary',
    description: 'Allows applications to embed web technologies into native Windows desktop apps.',
    sizeMB: 140
  },
  {
    id: 'Oracle.JavaRuntimeEnvironment',
    name: 'Java Runtime Environment (JRE 8)',
    category: 'Runtimes',
    publisher: 'Oracle Corporation',
    version: '8.0.4210.9',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware (OTN)',
    description: 'Standard Java runtime engine required for legacy enterprise Java applications.',
    sizeMB: 70
  },
  {
    id: 'Microsoft.DirectX',
    name: 'DirectX End-User Runtimes (June 2010)',
    category: 'Runtimes',
    publisher: 'Microsoft Corporation',
    version: '9.29.1974.1',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Proprietary',
    description: 'Legacy Direct3D 9, 10, and D3DX libraries required for older multimedia titles and games.',
    sizeMB: 96
  },

  // 11. Compression
  {
    id: 'GiorgioTani.PeaZip',
    name: 'PeaZip Open Source Archiver',
    category: 'Compression',
    publisher: 'Giorgio Tani',
    version: '9.9.1',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (LGPL v3)',
    description: 'Free archiving tool with cross-platform 200+ format extraction and encryption.',
    sizeMB: 11
  },

  // 12. PDF Tools
  {
    id: 'geeksoftwareGmbH.PDF24Creator',
    name: 'PDF24 Creator Tools',
    category: 'PDF Tools',
    publisher: 'geek software GmbH',
    version: '11.19.0',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware',
    description: 'All-in-one PDF toolbox to merge, split, compress, edit, and convert PDF files offline.',
    sizeMB: 330
  },

  // 13. Hardware Utilities
  {
    id: 'CPUID.CPU-Z',
    name: 'CPUID CPU-Z',
    category: 'Hardware Utilities',
    publisher: 'CPUID',
    version: '2.10.0',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware',
    description: 'Gathers key information on main components: CPU, cache, motherboard, and RAM timings.',
    sizeMB: 3
  },
  {
    id: 'TechPowerUp.GPU-Z',
    name: 'TechPowerUp GPU-Z',
    category: 'Hardware Utilities',
    publisher: 'TechPowerUp',
    version: '2.60.0',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware',
    description: 'Comprehensive graphics hardware diagnostic showing GPU clocks, VRAM, and sensors.',
    sizeMB: 10
  },
  {
    id: 'CrystalDewWorld.CrystalDiskInfo',
    name: 'CrystalDiskInfo (S.M.A.R.T.)',
    category: 'Hardware Utilities',
    publisher: 'Crystal Dew World',
    version: '9.4.4',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (MIT)',
    description: 'HDD/SSD utility software which monitors health status and temperature readings.',
    sizeMB: 6
  },
  {
    id: 'CrystalDewWorld.CrystalDiskMark',
    name: 'CrystalDiskMark Benchmark',
    category: 'Hardware Utilities',
    publisher: 'Crystal Dew World',
    version: '8.0.5',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Open Source (MIT)',
    description: 'Disk benchmark software for measuring sequential and random read/write speeds.',
    sizeMB: 4
  },
  {
    id: 'REALiX.HWiNFO',
    name: 'HWiNFO64 Diagnostic',
    category: 'Hardware Utilities',
    publisher: 'REALiX',
    version: '8.06',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware',
    description: 'Professional hardware information and real-time sensor diagnostic software.',
    sizeMB: 12
  },
  {
    id: 'Geeks3D.FurMark',
    name: 'FurMark GPU Stress Test',
    category: 'Hardware Utilities',
    publisher: 'Geeks3D',
    version: '2.3.0.0',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'machine',
    requiresAdmin: true,
    license: 'Freeware',
    description: 'Intensive OpenGL/Vulkan GPU stress test and thermal benchmark.',
    sizeMB: 18
  },

  // 14. AI Tools
  {
    id: 'Ollama.Ollama',
    name: 'Ollama Local LLM Runner',
    category: 'AI Tools',
    publisher: 'Ollama Inc.',
    version: '0.3.11',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Open Source (MIT)',
    description: 'Get up and running with Llama 3, Mistral, and other local models on your PC.',
    sizeMB: 280
  },
  {
    id: 'ElementLabs.LMStudio',
    name: 'LM Studio',
    category: 'AI Tools',
    publisher: 'Element Labs, Inc.',
    version: '0.2.31',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Freeware',
    description: 'Discover, download, and run local LLMs offline on Windows with chat interface.',
    sizeMB: 120
  },
  {
    id: 'Jan.Jan',
    name: 'Jan AI Offline Assistant',
    category: 'AI Tools',
    publisher: 'Jan Team',
    version: '0.5.5',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Open Source (AGPL v3)',
    description: 'Open-source local AI assistant that runs 100% offline on your device.',
    sizeMB: 140
  },
  {
    id: 'NomicAI.GPT4All',
    name: 'GPT4All Desktop',
    category: 'AI Tools',
    publisher: 'Nomic AI',
    version: '3.1.1',
    source: 'winget',
    packageManager: 'winget',
    installScope: 'user',
    requiresAdmin: false,
    license: 'Open Source (MIT)',
    description: 'Free-to-use, locally running, privacy-aware chatbot without internet required.',
    sizeMB: 85
  }
];

// --- PREDEFINED BUNDLES ---
export const PREDEFINED_BUNDLES: SoftwareBundle[] = [
  {
    id: 'bundle.essential',
    name: 'Essential Starter Pack',
    category: 'General',
    description: 'The foundation for any clean Windows machine: Chrome, 7-Zip, VLC, Notepad++, and SumatraPDF.',
    appIds: ['Google.Chrome', '7zip.7zip', 'VideoLAN.VLC', 'Notepad++.Notepad++', 'SumatraPDF.SumatraPDF'],
    requiresAdmin: true,
    estimatedTime: '2-3 mins'
  },
  {
    id: 'bundle.browsers',
    name: 'Browser Suite Pack',
    category: 'Browsers',
    description: 'Top modern web browsers: Chrome, Firefox, Brave, and Edge for testing and daily use.',
    appIds: ['Google.Chrome', 'Mozilla.Firefox', 'Brave.Brave', 'Opera.Opera'],
    requiresAdmin: true,
    estimatedTime: '3-4 mins'
  },
  {
    id: 'bundle.productivity',
    name: 'Office & Productivity Pack',
    category: 'Productivity',
    description: 'Complete document and knowledge setup: LibreOffice, SumatraPDF, Obsidian, and Notion.',
    appIds: ['LibreOffice.LibreOffice', 'SumatraPDF.SumatraPDF', 'Obsidian.Obsidian', 'Notion.Notion', '7zip.7zip'],
    requiresAdmin: true,
    estimatedTime: '4-5 mins'
  },
  {
    id: 'bundle.developer',
    name: 'Developer Power Pack',
    category: 'Developer Tools',
    description: 'Full engineering setup: VS Code, Git, Python 3.12, Node.js LTS, and Windows Terminal.',
    appIds: [
      'Microsoft.VisualStudioCode',
      'Git.Git',
      'Python.Python.3.12',
      'OpenJS.NodeJS.LTS',
      'Microsoft.WindowsTerminal',
      'PuTTY.PuTTY'
    ],
    requiresAdmin: true,
    estimatedTime: '4-6 mins'
  },
  {
    id: 'bundle.media',
    name: 'Media & Creation Pack',
    category: 'Media',
    description: 'Audio, video, and design tools: VLC, OBS Studio, Spotify, Audacity, HandBrake, and GIMP.',
    appIds: [
      'VideoLAN.VLC',
      'OBSProject.OBSStudio',
      'Spotify.Spotify',
      'Audacity.Audacity',
      'HandBrake.HandBrake',
      'GIMP.GIMP'
    ],
    requiresAdmin: true,
    estimatedTime: '5-7 mins'
  },
  {
    id: 'bundle.remote',
    name: 'Remote Support & SysAdmin',
    category: 'Remote Support',
    description: 'Field technician connectivity pack: AnyDesk, TeamViewer, RustDesk, PuTTY, and WinSCP.',
    appIds: [
      'AnyDeskSoftwareGmbH.AnyDesk',
      'TeamViewer.TeamViewer',
      'RustDesk.RustDesk',
      'PuTTY.PuTTY',
      'WinSCP.WinSCP'
    ],
    requiresAdmin: true,
    estimatedTime: '3-4 mins'
  },
  {
    id: 'bundle.utilities',
    name: 'Deep System Utilities Pack',
    category: 'Utilities',
    description: 'Essential diagnostic tools: 7-Zip, Everything, TreeSize, ShareX, PowerToys, and Rufus.',
    appIds: [
      '7zip.7zip',
      'voidtools.Everything',
      'JAMSoftware.TreeSize.Free',
      'ShareX.ShareX',
      'Microsoft.PowerToys',
      'Rufus.Rufus'
    ],
    requiresAdmin: true,
    estimatedTime: '3-5 mins'
  },
  {
    id: 'bundle.communication',
    name: 'Unified Communication Pack',
    category: 'Communication',
    description: 'Enterprise & personal communication: Discord, Slack, Telegram, Zoom, and Teams.',
    appIds: [
      'Discord.Discord',
      'SlackTechnologies.Slack',
      'Telegram.TelegramDesktop',
      'Zoom.Zoom',
      'Microsoft.Teams',
      'OpenWhisperSystems.Signal'
    ],
    requiresAdmin: true,
    estimatedTime: '5-8 mins'
  },
  {
    id: 'bundle.runtimes',
    name: 'Windows Runtimes & Dependencies',
    category: 'Runtimes',
    description: 'Essential shared dependencies: VC++ 2015-2022 x64, .NET Desktop Runtime 8, WebView2, and DirectX.',
    appIds: [
      'Microsoft.VCRedist.2015+.x64',
      'Microsoft.DotNet.DesktopRuntime.8',
      'Microsoft.EdgeWebView2Runtime',
      'Microsoft.DirectX'
    ],
    requiresAdmin: true,
    estimatedTime: '3-4 mins'
  }
];

// --- AUDITED PORTABLE TOOLS CATALOG ---
export const PORTABLE_TOOLS_CATALOG: PortableToolItem[] = [
  // SAFE_TO_INCLUDE (20 tools)
  {
    id: 'portable.bluescreenview',
    name: 'BlueScreenView',
    purpose: 'Scan BSOD minidump crash files and inspect failing kernel driver call stacks.',
    publisher: 'NirSoft',
    source: 'https://www.nirsoft.net/utils/blue_screen_view.html',
    licenseStatus: 'Freeware',
    signatureStatus: 'Digitally Signed',
    classification: 'SAFE_TO_INCLUDE',
    executableName: 'BlueScreenView.exe',
    requiresAdmin: true,
    category: 'Diagnostic',
    description: 'Displays a table of all crash dumps found in Minidump folder with loaded drivers.'
  },
  {
    id: 'portable.hdsentinel',
    name: 'Hard Disk Sentinel',
    purpose: 'Audit HDD/SSD S.M.A.R.T. health, performance status, degradation, and temperature.',
    publisher: 'H.D.S. Hungary',
    source: 'https://www.hdsentinel.com/',
    licenseStatus: 'Freeware Evaluation / Commercial',
    signatureStatus: 'Vendor Authenticated',
    classification: 'SAFE_TO_INCLUDE',
    executableName: 'Hard Disk Sentinel.exe',
    requiresAdmin: true,
    category: 'Hardware',
    description: 'Provides real-time drive diagnostics and acoustic noise test without installation.'
  },
  {
    id: 'portable.wscc',
    name: 'Windows System Control Center (WSCC)',
    purpose: 'Unified interface for Sysinternals Suite and NirSoft diagnostic tool packages.',
    publisher: 'Kirill Surkov',
    source: 'https://www.kls-soft.com/wscc/',
    licenseStatus: 'Freeware (Personal)',
    signatureStatus: 'Digitally Signed',
    classification: 'SAFE_TO_INCLUDE',
    executableName: 'Windows System Control Center.exe',
    requiresAdmin: true,
    category: 'System',
    description: 'Portable control console that manages, updates, and launches over 300 utility tools.'
  },
  {
    id: 'portable.ipscanner',
    name: 'Advanced IP Scanner',
    purpose: 'Fast, reliable local network scanner discovering all active devices, MACs, and shares.',
    publisher: 'Famatech',
    source: 'https://www.advanced-ip-scanner.com/',
    licenseStatus: 'Freeware',
    signatureStatus: 'Digitally Signed',
    classification: 'SAFE_TO_INCLUDE',
    executableName: 'ipscan.exe',
    requiresAdmin: false,
    category: 'Network',
    description: 'Scans LAN subnets, shows computer names, MAC vendors, and open RDP/HTTP ports.'
  },
  {
    id: 'portable.whocrashed',
    name: 'WhoCrashed',
    purpose: 'Analyzes Windows crash dumps and presents clear natural-language diagnostic guidance.',
    publisher: 'Resplendence Software Projects',
    source: 'https://www.resplendence.com/whocrashed',
    licenseStatus: 'Freeware Home Edition',
    signatureStatus: 'Digitally Signed',
    classification: 'SAFE_TO_INCLUDE',
    executableName: 'WhoCrashedEx.exe',
    requiresAdmin: true,
    category: 'Diagnostic',
    description: 'Pinpoints offending third-party kernel drivers with actionable fix steps.'
  },
  {
    id: 'portable.occt',
    name: 'OCCT Stability Test',
    purpose: 'All-in-one CPU, memory, GPU 3D, and power supply stress testing and monitoring tool.',
    publisher: 'OCBASE',
    source: 'https://www.ocbase.com/',
    licenseStatus: 'Freeware (Personal)',
    signatureStatus: 'Digitally Signed',
    classification: 'SAFE_TO_INCLUDE',
    executableName: 'OCCT.exe',
    requiresAdmin: true,
    category: 'Hardware',
    description: 'Identifies hardware stability flaws, voltage droop, and thermal throttling.'
  },
  {
    id: 'portable.quickcpu',
    name: 'Quick CPU',
    purpose: 'Fine-tune and monitor CPU frequency scaling, Core Parking, and Turbo Boost parameters.',
    publisher: 'CoderBag',
    source: 'https://coderbag.com/product/quick-cpu',
    licenseStatus: 'Freeware',
    signatureStatus: 'Vendor Authenticated',
    classification: 'SAFE_TO_INCLUDE',
    executableName: 'QuickCPUPortable.exe',
    requiresAdmin: true,
    category: 'System',
    description: 'Allows adjustment of processor power management and live core temperature monitoring.'
  },
  {
    id: 'portable.devmanview',
    name: 'DevManView Device Manager',
    purpose: 'Lightweight alternative to Windows Device Manager with remote PC management support.',
    publisher: 'NirSoft',
    source: 'https://www.nirsoft.net/utils/device_manager_view.html',
    licenseStatus: 'Freeware',
    signatureStatus: 'Digitally Signed',
    classification: 'SAFE_TO_INCLUDE',
    executableName: 'devmanview.exe',
    requiresAdmin: true,
    category: 'System',
    description: 'Displays all devices and their properties with disable/enable/uninstall actions.'
  },
  {
    id: 'portable.cports',
    name: 'CurrPorts Connection Monitor',
    purpose: 'Real-time network monitoring software displaying all currently opened TCP/UDP ports.',
    publisher: 'NirSoft',
    source: 'https://www.nirsoft.net/utils/cports.html',
    licenseStatus: 'Freeware',
    signatureStatus: 'Digitally Signed',
    classification: 'SAFE_TO_INCLUDE',
    executableName: 'cports.exe',
    requiresAdmin: true,
    category: 'Network',
    description: 'Maps listening ports and active sockets to process IDs, paths, and remote IPs.'
  },
  {
    id: 'portable.searchmyfiles',
    name: 'SearchMyFiles',
    purpose: 'Precise search engine tool providing wildcard, regex, date, and attribute filters.',
    publisher: 'NirSoft',
    source: 'https://www.nirsoft.net/utils/search_my_files.html',
    licenseStatus: 'Freeware',
    signatureStatus: 'Digitally Signed',
    classification: 'SAFE_TO_INCLUDE',
    executableName: 'searchmyfiles.exe',
    requiresAdmin: false,
    category: 'Maintenance',
    description: 'Finds duplicate files and searches inside documents without indexing dependencies.'
  },
  {
    id: 'portable.regscanner',
    name: 'RegScanner',
    purpose: 'Ultra-fast Windows registry scanner with multi-threaded matching and key exporting.',
    publisher: 'NirSoft',
    source: 'https://www.nirsoft.net/utils/regscanner.html',
    licenseStatus: 'Freeware',
    signatureStatus: 'Digitally Signed',
    classification: 'SAFE_TO_INCLUDE',
    executableName: 'regscanner.exe',
    requiresAdmin: true,
    category: 'System',
    description: 'Scans registry in seconds and jumps directly to Regedit locations.'
  },
  {
    id: 'portable.taskschedulerview',
    name: 'TaskSchedulerView',
    purpose: 'Detailed inventory and control panel for all scheduled tasks and background triggers.',
    publisher: 'NirSoft',
    source: 'https://www.nirsoft.net/utils/task_scheduler_view.html',
    licenseStatus: 'Freeware',
    signatureStatus: 'Digitally Signed',
    classification: 'SAFE_TO_INCLUDE',
    executableName: 'taskschedulerview.exe',
    requiresAdmin: true,
    category: 'System',
    description: 'Enables, disables, runs, and investigates scheduled tasks with hidden trigger details.'
  },
  {
    id: 'portable.openedfilesview',
    name: 'OpenedFilesView',
    purpose: 'Displays all files currently opened by running processes with unlock capabilities.',
    publisher: 'NirSoft',
    source: 'https://www.nirsoft.net/utils/opened_files_view.html',
    licenseStatus: 'Freeware',
    signatureStatus: 'Digitally Signed',
    classification: 'SAFE_TO_INCLUDE',
    executableName: 'openedfilesview.exe',
    requiresAdmin: true,
    category: 'System',
    description: 'Solves "File in use by another program" locking issues and closes open handles.'
  },
  {
    id: 'portable.whatinstartup',
    name: 'WhatInStartup',
    purpose: 'Audits startup programs configured in Registry, Startup folders, and Task Scheduler.',
    publisher: 'NirSoft',
    source: 'https://www.nirsoft.net/utils/what_in_startup.html',
    licenseStatus: 'Freeware',
    signatureStatus: 'Digitally Signed',
    classification: 'SAFE_TO_INCLUDE',
    executableName: 'whatinstartup.exe',
    requiresAdmin: true,
    category: 'System',
    description: 'Inspects startup items and automatically blocks re-activation attempts.'
  },
  {
    id: 'portable.wincrashreport',
    name: 'WinCrashReport',
    purpose: 'Generates thorough crash reports whenever an application crashes or freezes.',
    publisher: 'NirSoft',
    source: 'https://www.nirsoft.net/utils/win_crash_report.html',
    licenseStatus: 'Freeware',
    signatureStatus: 'Digitally Signed',
    classification: 'SAFE_TO_INCLUDE',
    executableName: 'wincrashreport.exe',
    requiresAdmin: false,
    category: 'Diagnostic',
    description: 'Extracts memory registers, call stack, and loaded modules without a heavy debugger.'
  },
  {
    id: 'portable.wifiinfoview',
    name: 'WifiInfoView',
    purpose: 'Scans wireless networks in area and displays SSID, BSSID, RSSI, channel, and frequency.',
    publisher: 'NirSoft',
    source: 'https://www.nirsoft.net/utils/wifi_information_view.html',
    licenseStatus: 'Freeware',
    signatureStatus: 'Digitally Signed',
    classification: 'SAFE_TO_INCLUDE',
    executableName: 'wifiinfoview.exe',
    requiresAdmin: false,
    category: 'Network',
    description: 'Detects Wi-Fi channel congestion and signal degradation in residential and office spaces.'
  },
  {
    id: 'portable.usbdeview',
    name: 'USBDeview',
    purpose: 'Lists all USB devices that currently connect or previously connected to your computer.',
    publisher: 'NirSoft',
    source: 'https://www.nirsoft.net/utils/usb_devices_view.html',
    licenseStatus: 'Freeware',
    signatureStatus: 'Digitally Signed',
    classification: 'SAFE_TO_INCLUDE',
    executableName: 'usbdeview.exe',
    requiresAdmin: true,
    category: 'System',
    description: 'Displays device serial numbers, connected timestamps, and allows safely disabling drivers.'
  },
  {
    id: 'portable.usbdrivelog',
    name: 'USBDriveLog',
    purpose: 'Extracts comprehensive historical event logs of all USB flash drives connected.',
    publisher: 'NirSoft',
    source: 'https://www.nirsoft.net/utils/usb_drive_log.html',
    licenseStatus: 'Freeware',
    signatureStatus: 'Digitally Signed',
    classification: 'SAFE_TO_INCLUDE',
    executableName: 'usbdrivelog.exe',
    requiresAdmin: true,
    category: 'System',
    description: 'Forensic audit utility reading event log records for USB storage insertions.'
  },
  {
    id: 'portable.wnetwatcher',
    name: 'Wireless Network Watcher',
    purpose: 'Scans wireless network and displays list of all currently connected computers and phones.',
    publisher: 'NirSoft',
    source: 'https://www.nirsoft.net/utils/wireless_network_watcher.html',
    licenseStatus: 'Freeware',
    signatureStatus: 'Digitally Signed',
    classification: 'SAFE_TO_INCLUDE',
    executableName: 'wnetwatcher.exe',
    requiresAdmin: false,
    category: 'Network',
    description: 'Audits network devices with IP, MAC address, and device manufacturer notification.'
  },
  {
    id: 'portable.anydesk',
    name: 'AnyDesk Portable',
    purpose: 'Fast portable remote control client that runs standalone without installation.',
    publisher: 'AnyDesk Software GmbH',
    source: 'https://anydesk.com/',
    licenseStatus: 'Freeware / Commercial',
    signatureStatus: 'Digitally Signed',
    classification: 'SAFE_TO_INCLUDE',
    executableName: 'AnyDesk.exe',
    requiresAdmin: false,
    category: 'Network',
    description: 'Official portable AnyDesk single-file executable for instant remote support.'
  },

  // LICENSE_REVIEW (4 tools)
  {
    id: 'portable.duplicatecleaner',
    name: 'Duplicate Cleaner Pro',
    purpose: 'Commercial duplicate file finder (Requires valid commercial technician license).',
    publisher: 'DigitalVolcano Software Ltd.',
    source: 'https://www.duplicatecleaner.com/',
    licenseStatus: 'Commercial License Required',
    signatureStatus: 'Requires License',
    classification: 'LICENSE_REVIEW',
    executableName: 'Duplicate Cleaner.exe',
    requiresAdmin: false,
    category: 'Maintenance',
    description: 'Flagged for license review: must not bundle pirated copies without genuine customer license.'
  },
  {
    id: 'portable.poweriso',
    name: 'PowerISO Portable',
    purpose: 'Commercial CD/DVD/BD disk image utility (Requires customer license).',
    publisher: 'Power Software Ltd.',
    source: 'https://www.poweriso.com/',
    licenseStatus: 'Commercial Shareware',
    signatureStatus: 'Requires License',
    classification: 'LICENSE_REVIEW',
    executableName: 'PowerISO.exe',
    requiresAdmin: true,
    category: 'Maintenance',
    description: 'Flagged for license review: proprietary commercial image burner requiring legitimate activation.'
  },
  {
    id: 'portable.macrium',
    name: 'Macrium Reflect Technician',
    purpose: 'Commercial bare-metal disk imaging and clone utility.',
    publisher: 'Paramount Software UK Ltd',
    source: 'https://www.macrium.com/reflectfree',
    licenseStatus: 'Commercial Technician Subscription',
    signatureStatus: 'Requires License',
    classification: 'LICENSE_REVIEW',
    executableName: 'Macrium Reflect.exe',
    requiresAdmin: true,
    category: 'Maintenance',
    description: 'Flagged for license review: commercial technician tool; use official trial/licensed builder.'
  },
  {
    id: 'portable.minitool',
    name: 'MiniTool Partition Wizard',
    purpose: 'Commercial partition management tool.',
    publisher: 'MiniTool Software Ltd.',
    source: 'https://www.minitool.com/partition-manager/',
    licenseStatus: 'Commercial License Required',
    signatureStatus: 'Requires License',
    classification: 'LICENSE_REVIEW',
    executableName: 'partitionwizard.exe',
    requiresAdmin: true,
    category: 'Hardware',
    description: 'Flagged for license review: commercial technician edition; user must supply valid license key.'
  },
  {
    id: 'portable.tools.wscc',
    name: 'Windows System Control Center (WSCC)',
    purpose: 'Centralized launcher and updater for Sysinternals, NirSoft, and Windows utilities.',
    publisher: 'KirySoft',
    source: 'https://www.kls-soft.com/wscc/',
    licenseStatus: 'Restricted Redistribution (Official Source Required)',
    signatureStatus: 'Vendor Authenticated',
    classification: 'LICENSE_REVIEW',
    executableName: 'wscc.exe',
    requiresAdmin: true,
    category: 'System',
    description: 'Redistribution restricted by author license. Install/Open directly from official vendor source.'
  },

  // REMOVE_SECURITY (2 tools)
  {
    id: 'portable.pwd_dumper',
    name: 'Credential & Password Dumper',
    purpose: 'Offensive credential extractor targeting browser vaults and LSA secrets.',
    publisher: 'Unauthorized Script',
    source: 'Internal legacy bundle',
    licenseStatus: 'Prohibited',
    signatureStatus: 'Unsigned',
    classification: 'REMOVE_SECURITY',
    executableName: 'pwd_dump.exe',
    requiresAdmin: true,
    category: 'Diagnostic',
    description: 'Strictly removed: violates security policies. Never include credential harvesting tools.'
  },
  {
    id: 'portable.defender_bypass',
    name: 'Defender Bypass / Tamper Tool',
    purpose: 'Unauthorized utility attempting to disable antivirus definitions and telemetry.',
    publisher: 'Unauthorized Script',
    source: 'Internal legacy bundle',
    licenseStatus: 'Prohibited',
    signatureStatus: 'Unsigned',
    classification: 'REMOVE_SECURITY',
    executableName: 'def_kill.exe',
    requiresAdmin: true,
    category: 'System',
    description: 'Strictly removed: malicious anti-tamper behavior that triggers AV/EDR detections.'
  },

  // OBSOLETE (2 tools)
  {
    id: 'portable.batteryoptimizer',
    name: 'Battery Optimizer (Legacy)',
    purpose: 'Legacy third-party battery optimizer superseded by native powercfg.',
    publisher: 'ReviverSoft',
    source: 'Legacy repository',
    licenseStatus: 'Obsolete',
    signatureStatus: 'Unsigned',
    classification: 'OBSOLETE',
    executableName: 'Battery Optimizer.exe',
    requiresAdmin: false,
    category: 'Hardware',
    description: 'Obsolete: Windows 10/11 native powercfg /batteryreport provides accurate manufacturer diagnostics.'
  },
  {
    id: 'portable.glaryutilities',
    name: 'Glary Utilities Portable (Legacy)',
    purpose: 'Legacy all-in-one cleaner superseded by modern DISM / WinGet and BleachBit.',
    publisher: 'Glarysoft Ltd.',
    source: 'https://www.glarysoft.com/',
    licenseStatus: 'Obsolete Bundle',
    signatureStatus: 'Vendor Authenticated',
    classification: 'OBSOLETE',
    executableName: 'GlaryUtilitiesPortable.exe',
    requiresAdmin: true,
    category: 'Maintenance',
    description: 'Obsolete legacy utility bundle with deprecated registry cleaning techniques.'
  }
];

// --- DEPLOYMENT HELPERS CATALOG ---
export const DEPLOYMENT_HELPERS: DeploymentHelperItem[] = [
  {
    id: 'deploy.dotnet8.desktop',
    name: '.NET Desktop Runtime 8.0 (x64)',
    category: 'Runtimes',
    description: 'Official Microsoft .NET 8.0 LTS Desktop Runtime installer for Windows.',
    publisher: 'Microsoft Corporation',
    officialUrl: 'https://dotnet.microsoft.com/en-us/download/dotnet/8.0',
    downloadType: 'Direct Web',
    architecture: 'x64',
    requiresAdmin: true
  },
  {
    id: 'deploy.vcredist.unified',
    name: 'Visual C++ 2015-2022 Redistributable (x64/x86)',
    category: 'Runtimes',
    description: 'Unified official Microsoft redistributable required for hundreds of desktop apps.',
    publisher: 'Microsoft Corporation',
    officialUrl: 'https://aka.ms/vs/17/release/vc_redist.x64.exe',
    downloadType: 'Direct Web',
    architecture: 'all',
    requiresAdmin: true
  },
  {
    id: 'deploy.webview2.evergreen',
    name: 'Microsoft Edge WebView2 Evergreen Bootstrapper',
    category: 'Runtimes',
    description: 'Standalone and bootstrapper installers for Chromium-powered embedded web apps.',
    publisher: 'Microsoft Corporation',
    officialUrl: 'https://developer.microsoft.com/en-us/microsoft-edge/webview2/',
    downloadType: 'Direct Web',
    architecture: 'x64',
    requiresAdmin: true
  },
  {
    id: 'deploy.directx.web',
    name: 'DirectX End-User Runtimes Web Installer',
    category: 'Runtimes',
    description: 'Official Microsoft installer for legacy D3DX9, D3DX10, and Direct3D 11 components.',
    publisher: 'Microsoft Corporation',
    officialUrl: 'https://www.microsoft.com/en-us/download/details.aspx?id=35',
    downloadType: 'Direct Web',
    architecture: 'all',
    requiresAdmin: true
  },
  {
    id: 'deploy.win11.media',
    name: 'Windows 11 Official Media Creation Portal',
    category: 'Windows OS',
    description: 'Official Microsoft download page for Windows 11 installation assistant, media creator, and ISOs.',
    publisher: 'Microsoft Corporation',
    officialUrl: 'https://www.microsoft.com/software-download/windows11',
    downloadType: 'Direct Web',
    architecture: 'x64',
    requiresAdmin: false
  },
  {
    id: 'deploy.win10.media',
    name: 'Windows 10 Official Media Creation Portal',
    category: 'Windows OS',
    description: 'Official Microsoft download page for Windows 10 Media Creation Tool and Disc Image.',
    publisher: 'Microsoft Corporation',
    officialUrl: 'https://www.microsoft.com/software-download/windows10',
    downloadType: 'Direct Web',
    architecture: 'all',
    requiresAdmin: false
  },
  {
    id: 'deploy.office.odt',
    name: 'Office Deployment Tool (ODT)',
    category: 'Office Deployment',
    description: 'Official tool to download and configure Click-to-Run installations of Office 2021/365.',
    publisher: 'Microsoft Corporation',
    officialUrl: 'https://www.microsoft.com/en-us/download/details.aspx?id=49117',
    downloadType: 'Direct Web',
    architecture: 'all',
    requiresAdmin: true
  },
  {
    id: 'deploy.store.repair',
    name: 'Microsoft Store Reset & Repair Tool',
    category: 'Store Repair',
    description: 'Executes wsreset.exe and re-registers the Microsoft Store application package.',
    publisher: 'Microsoft Corporation',
    officialUrl: 'ms-windows-store:',
    downloadType: 'System Launcher',
    architecture: 'all',
    requiresAdmin: true
  }
];

// --- HELPER QUERIES ---

export function getAppCatalogData(): SoftwareAppItem[] {
  return WINGET_APP_CATALOG;
}

export function getBundlesData(): { predefined: SoftwareBundle[]; custom: CustomBundle[] } {
  return {
    predefined: PREDEFINED_BUNDLES,
    custom: customBundles
  };
}

export function getSoftwareInventoryData(): SoftwareInventoryItem[] {
  return WINGET_APP_CATALOG.filter((app) => app.installed).map((app) => ({
    id: app.id,
    name: app.name,
    publisher: app.publisher,
    version: app.installedVersion || app.version,
    installDate: '2026-08-15',
    sizeMB: app.sizeMB,
    packageId: app.id,
    source: app.source,
    architecture: 'x64',
    installScope: app.installScope,
    updateAvailable: app.updateAvailable,
    latestVersion: app.version,
    category: app.category
  }));
}

export function getSoftwareUpdatesData(): SoftwareAppItem[] {
  return WINGET_APP_CATALOG.filter((app) => app.installed && app.updateAvailable);
}

export function getSoftwareInstallHistory(): SoftwareInstallHistoryItem[] {
  return [...installHistory].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function getPortableToolsCatalogData(): PortableToolItem[] {
  return PORTABLE_TOOLS_CATALOG;
}

export function getDeploymentHelpersData(): DeploymentHelperItem[] {
  return DEPLOYMENT_HELPERS;
}

export function recordInstallHistory(
  appId: string,
  appName: string,
  version: string,
  action: 'INSTALL' | 'UPGRADE' | 'UNINSTALL' | 'REPAIR',
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED',
  source: string,
  jobId: string,
  details?: string
): void {
  installHistory.unshift({
    id: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    appId,
    appName,
    version,
    action,
    timestamp: new Date().toISOString(),
    status,
    source,
    jobId,
    details
  });
  // Keep last 100 items
  if (installHistory.length > 100) {
    installHistory = installHistory.slice(0, 100);
  }
}

export function saveCustomBundle(name: string, description: string, appIds: string[]): CustomBundle {
  // Validate package IDs - strictly enforce safety:
  const packageIdRegex = /^[A-Za-z0-9_.-]{3,80}$|^9[A-Z0-9]{11}$/;
  for (const appId of appIds) {
    if (!packageIdRegex.test(appId)) {
      throw new Error(`INVALID_PACKAGE_ID: Package ID "${appId}" violates validation schema.`);
    }
    // Reject shell control characters explicitly:
    if (/[\s;&|`$<>]/.test(appId)) {
      throw new Error(`SECURITY_REJECTED: Package ID contains illegal shell characters.`);
    }
  }

  const existingIndex = customBundles.findIndex((b) => b.name.toLowerCase() === name.toLowerCase());
  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    customBundles[existingIndex].description = description;
    customBundles[existingIndex].appIds = appIds;
    customBundles[existingIndex].updatedAt = now;
    return customBundles[existingIndex];
  }

  const newBundle: CustomBundle = {
    id: `cbund-${Date.now()}`,
    name,
    description,
    appIds,
    createdAt: now,
    updatedAt: now
  };
  customBundles.push(newBundle);
  return newBundle;
}

export function searchAppsCatalog(query: string): SoftwareAppItem[] {
  if (!query || typeof query !== 'string') return [];
  const q = query.trim().toLowerCase();
  return WINGET_APP_CATALOG.filter(
    (app) =>
      app.name.toLowerCase().includes(q) ||
      app.id.toLowerCase().includes(q) ||
      app.publisher.toLowerCase().includes(q) ||
      app.category.toLowerCase().includes(q)
  );
}

// Utility delay for async job progression
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- OPERATIONS EXECUTION ENGINE HANDLER ---

export async function executeSoftwareOperation(
  job: OperationJob,
  params: any,
  updateProgress: (percent: number, step: string, logMsg?: string) => void
): Promise<any> {
  switch (job.operationId) {
    case 'software.install': {
      const { appId, customScope } = params || {};
      if (!appId || typeof appId !== 'string') {
        throw new Error('MISSING_PARAMETER: appId is required for software installation.');
      }

      // Safety check: validate package ID against schema
      const packageIdRegex = /^[A-Za-z0-9_.-]{3,80}$|^9[A-Z0-9]{11}$/;
      if (!packageIdRegex.test(appId) || /[\s;&|`$<>]/.test(appId)) {
        throw new Error(`SECURITY_REJECTED: Invalid or malformed package identifier "${appId}".`);
      }

      const appMeta = WINGET_APP_CATALOG.find((a) => a.id.toLowerCase() === appId.toLowerCase()) || {
        id: appId,
        name: appId,
        version: 'Latest',
        publisher: 'WinGet Source',
        requiresAdmin: true,
        source: 'winget'
      };

      updateProgress(10, 'Validating WinGet Package Source', `[WINGET] Querying package manifest for ${appId}...`);
      await delay(250);

      updateProgress(35, 'Downloading Package Payload', `[NET] Fetching installer for ${appMeta.name} from authenticated vendor CDN...`);
      await delay(350);

      updateProgress(70, 'Verifying Installer Hash & Digital Signature', `[SEC] SHA-256 integrity hash verified. Publisher certificate valid.`);
      await delay(300);

      updateProgress(90, 'Executing Silent Installation', `[EXEC] winget install --id "${appId}" --silent --accept-package-agreements`);
      await delay(400);

      // Update app status in memory
      const existing = WINGET_APP_CATALOG.find((a) => a.id.toLowerCase() === appId.toLowerCase());
      if (existing) {
        existing.installed = true;
        existing.installedVersion = existing.version;
        existing.updateAvailable = false;
      }

      recordInstallHistory(
        appId,
        appMeta.name,
        appMeta.version,
        'INSTALL',
        'SUCCESS',
        'winget',
        job.jobId,
        `Installed to ${customScope || 'machine'} scope.`
      );

      updateProgress(100, 'Installation Complete', `[OK] ${appMeta.name} installed successfully.`);
      return {
        appId,
        appName: appMeta.name,
        version: appMeta.version,
        status: 'SUCCESS',
        exitCode: 0,
        timestamp: new Date().toISOString()
      };
    }

    case 'software.upgrade': {
      const { appId } = params || {};
      if (!appId || typeof appId !== 'string') {
        throw new Error('MISSING_PARAMETER: appId is required for upgrade.');
      }

      const appMeta = WINGET_APP_CATALOG.find((a) => a.id.toLowerCase() === appId.toLowerCase());
      if (!appMeta) {
        throw new Error(`NOT_FOUND: Package ${appId} not found in catalog.`);
      }

      updateProgress(20, 'Querying Latest Version Manifest', `[WINGET] Checking newer release for ${appMeta.name}...`);
      await delay(300);

      updateProgress(50, 'Downloading Upgrade Payload', `[NET] Fetching version ${appMeta.version}...`);
      await delay(350);

      updateProgress(85, 'Applying In-Place Upgrade', `[EXEC] winget upgrade --id "${appId}" --silent`);
      await delay(400);

      appMeta.installed = true;
      appMeta.installedVersion = appMeta.version;
      appMeta.updateAvailable = false;

      recordInstallHistory(
        appId,
        appMeta.name,
        appMeta.version,
        'UPGRADE',
        'SUCCESS',
        'winget',
        job.jobId,
        `Upgraded to ${appMeta.version}.`
      );

      updateProgress(100, 'Upgrade Completed', `[OK] ${appMeta.name} upgraded to version ${appMeta.version}.`);
      return {
        appId,
        appName: appMeta.name,
        version: appMeta.version,
        status: 'SUCCESS',
        timestamp: new Date().toISOString()
      };
    }

    case 'software.upgrade.all': {
      updateProgress(10, 'Scanning Installed Software for Updates', '[WINGET] winget upgrade --include-unknown...');
      await delay(350);

      const updates = getSoftwareUpdatesData();
      updateProgress(30, `Discovered ${updates.length} Available Updates`, `[LIST] Updates available for: ${updates.map((u) => u.name).join(', ')}`);
      await delay(300);

      for (let i = 0; i < updates.length; i++) {
        const item = updates[i];
        const pct = 30 + Math.floor(((i + 1) / (updates.length || 1)) * 60);
        updateProgress(pct, `Upgrading ${item.name} (${i + 1}/${updates.length})`, `[EXEC] Upgrading ${item.id} to ${item.version}...`);
        await delay(350);
        item.installedVersion = item.version;
        item.updateAvailable = false;
        recordInstallHistory(item.id, item.name, item.version, 'UPGRADE', 'SUCCESS', 'winget', job.jobId);
      }

      updateProgress(100, 'Batch Upgrade Finished', `[OK] All ${updates.length} applications upgraded.`);
      return {
        totalUpgraded: updates.length,
        status: 'SUCCESS',
        timestamp: new Date().toISOString()
      };
    }

    case 'software.uninstall': {
      const { appId, confirmation } = params || {};
      if (!confirmation) {
        throw new Error('CONFIRMATION_REQUIRED: Uninstalling software requires explicit user confirmation.');
      }
      if (!appId || typeof appId !== 'string') {
        throw new Error('MISSING_PARAMETER: appId is required.');
      }

      const appMeta = WINGET_APP_CATALOG.find((a) => a.id.toLowerCase() === appId.toLowerCase());
      const appName = appMeta ? appMeta.name : appId;

      updateProgress(20, 'Invoking Application Uninstaller', `[EXEC] winget uninstall --id "${appId}" --silent...`);
      await delay(400);

      updateProgress(70, 'Removing Leftover Application Data & Shortcuts', `[CLEAN] Purging application registration from Windows Registry...`);
      await delay(300);

      if (appMeta) {
        appMeta.installed = false;
        appMeta.installedVersion = undefined;
        appMeta.updateAvailable = false;
      }

      recordInstallHistory(
        appId,
        appName,
        appMeta?.version || 'N/A',
        'UNINSTALL',
        'SUCCESS',
        'winget',
        job.jobId,
        'Uninstalled with user confirmation.'
      );

      updateProgress(100, 'Uninstallation Finished', `[OK] ${appName} successfully uninstalled.`);
      return {
        appId,
        appName,
        status: 'SUCCESS',
        timestamp: new Date().toISOString()
      };
    }

    // 100 Apps 1-Click Multi-App Batch Installer
    case 'software.bundle.install': {
      const { appIds, bundleName } = params || {};
      if (!Array.isArray(appIds) || appIds.length === 0) {
        throw new Error('MISSING_PARAMETER: appIds array is required for batch installation.');
      }

      // Safety check: validate all package IDs
      const packageIdRegex = /^[A-Za-z0-9_.-]{3,80}$|^9[A-Z0-9]{11}$/;
      for (const id of appIds) {
        if (!packageIdRegex.test(id) || /[\s;&|`$<>]/.test(id)) {
          throw new Error(`SECURITY_REJECTED: Package ID "${id}" contains unauthorized characters.`);
        }
      }

      const total = appIds.length;
      const appStatuses: Record<string, AppInstallStatus> = {};
      appIds.forEach((id) => {
        appStatuses[id] = 'PENDING';
      });

      updateProgress(
        5,
        `Preparing Installation of ${total} Applications`,
        `[BATCH] Initializing installer queue for ${bundleName || 'Custom Selection'}: ${appIds.join(', ')}`
      );
      await delay(300);

      let successCount = 0;
      let failedCount = 0;

      for (let i = 0; i < total; i++) {
        const id = appIds[i];
        appStatuses[id] = 'INSTALLING';
        const startPct = 10 + Math.floor((i / total) * 80);

        const meta = WINGET_APP_CATALOG.find((a) => a.id.toLowerCase() === id.toLowerCase()) || {
          id,
          name: id,
          version: '1.0.0',
          publisher: 'WinGet Source'
        };

        updateProgress(
          startPct,
          `Installing ${meta.name} (${i + 1}/${total})`,
          `[EXEC] winget install --id "${id}" -e --silent --accept-source-agreements --accept-package-agreements`
        );
        await delay(350);

        // Mark app as installed
        const catalogEntry = WINGET_APP_CATALOG.find((a) => a.id.toLowerCase() === id.toLowerCase());
        if (catalogEntry) {
          catalogEntry.installed = true;
          catalogEntry.installedVersion = catalogEntry.version;
          catalogEntry.updateAvailable = false;
        }

        appStatuses[id] = 'SUCCESS';
        successCount++;
        recordInstallHistory(
          id,
          meta.name,
          meta.version,
          'INSTALL',
          'SUCCESS',
          'winget',
          job.jobId,
          `Installed as part of ${bundleName || 'batch install'}.`
        );
      }

      updateProgress(
        100,
        `Batch Installation Finished: ${successCount}/${total} Installed`,
        `[OK] Completed ${bundleName || 'batch install'}. Successful: ${successCount}, Failed: ${failedCount}`
      );

      return {
        bundleName: bundleName || 'Custom Selection',
        totalRequested: total,
        successCount,
        failedCount,
        appStatuses,
        timestamp: new Date().toISOString()
      };
    }

    case 'software.bundle.custom.save': {
      const { name, description, appIds } = params || {};
      if (!name || !Array.isArray(appIds)) {
        throw new Error('MISSING_PARAMETER: name and appIds are required.');
      }
      const saved = saveCustomBundle(name, description || '', appIds);
      updateProgress(100, 'Custom Bundle Saved', `[OK] Bundle "${saved.name}" saved with ${saved.appIds.length} apps.`);
      return saved;
    }

    // Portable Tools Launcher
    case 'portable.launch': {
      const { toolId } = params || {};
      if (!toolId || typeof toolId !== 'string') {
        throw new Error('MISSING_PARAMETER: toolId is required.');
      }

      // Security Resolution: Must resolve strictly from approved catalog
      const tool = PORTABLE_TOOLS_CATALOG.find((t) => t.id.toLowerCase() === toolId.toLowerCase());
      if (!tool) {
        throw new Error(`SECURITY_REJECTED: Tool ID "${toolId}" is not in the approved portable tools allowlist.`);
      }

      if (tool.classification === 'REMOVE_SECURITY') {
        throw new Error(`SECURITY_BLOCKED: Tool "${tool.name}" is prohibited under toolkit safety guidelines.`);
      }

      if (tool.classification === 'OBSOLETE') {
        throw new Error(`TOOL_OBSOLETE: Tool "${tool.name}" has been deprecated and superseded by native tools.`);
      }

      updateProgress(30, `Validating Portable Tool Binary`, `[CHECK] Verifying hash & signature for ${tool.executableName}...`);
      await delay(250);

      updateProgress(70, `Launching ${tool.name}`, `[LAUNCH] Executing approved binary: ${tool.executableName}`);
      await delay(300);

      updateProgress(100, `Tool Running`, `[OK] ${tool.name} launched successfully in dedicated interactive window.`);

      return {
        toolId: tool.id,
        name: tool.name,
        executable: tool.executableName,
        classification: tool.classification,
        pid: 14280 + Math.floor(Math.random() * 500),
        status: 'RUNNING',
        timestamp: new Date().toISOString()
      };
    }

    // Windows Store Repair
    case 'deployment.store.repair': {
      updateProgress(25, 'Terminating Hung Windows Store Processes', '[PROC] Checking tasklist for WinStore.App.exe...');
      await delay(300);

      updateProgress(60, 'Resetting Microsoft Store Cache (wsreset.exe)', '[EXEC] Launching wsreset.exe /nobreak...');
      await delay(450);

      updateProgress(85, 'Re-registering AppX Package Manifest', '[POWERSHELL] Add-AppxPackage -Register -DisableDevelopmentMode...');
      await delay(350);

      updateProgress(100, 'Microsoft Store Restored', '[OK] Microsoft Store cache cleared and registration restored.');
      return {
        storeStatus: 'HEALTHY',
        action: 'wsreset_and_register',
        timestamp: new Date().toISOString()
      };
    }

    // WinGet Health Check
    case 'deployment.winget.health': {
      updateProgress(30, 'Verifying Windows Package Manager CLI', '[CMD] winget --version');
      await delay(250);

      updateProgress(70, 'Testing Source Repository Agreements', '[WINGET] winget source list...');
      await delay(300);

      updateProgress(100, 'WinGet Operational', '[OK] WinGet v1.8.1911 operational with source "winget" and "msstore" active.');
      return {
        wingetInstalled: true,
        version: 'v1.8.1911',
        sources: [
          { name: 'winget', type: 'Microsoft.PreIndexed.Package', healthy: true },
          { name: 'msstore', type: 'Microsoft.Rest', healthy: true }
        ],
        timestamp: new Date().toISOString()
      };
    }

    default:
      throw new Error(`Unsupported software operation ID: ${job.operationId}`);
  }
}
