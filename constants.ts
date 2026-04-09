
import { Asset, AssetCategory, AssetStatus, Consumable, IssueRecord, MaintenanceRecord, MaintenanceType, Vendor, RequestStatus, StudentRequest, AuditRecord, ConsumableTransaction, Notice, StudyMaterial, StudentProfile } from './types';

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'A001',
    name: 'Tektronix TBS1052B',
    description: '50MHz 2-Channel Digital Storage Oscilloscope with USB connectivity.',
    category: AssetCategory.ELECTRONICS,
    subCategory: 'Test Equipment',
    quantityTotal: 12,
    quantityAvailable: 10,
    unit: 'Units',
    location: 'Electronics Lab - Rack A',
    serialNumber: 'TEK-TBS-5052',
    vendor: 'V001',
    purchaseDate: '2023-01-15',
    warrantyExp: '2026-01-15',
    fundingSource: 'University Grant',
    condition: AssetStatus.WORKING,
    price: 34500,
    lastUpdated: '2024-01-10',
   image: "https://hfkyyjvfstfklmfzvcfb.supabase.co/storage/v1/object/public/revz%20img/Screenshot%202026-04-08%20223534.png"
  },
  {
    id: 'A002',
    name: 'Olympus CX23 Microscope',
    description: 'Binocular Educational Microscope with LED illumination and ergonomic design.',
    category: AssetCategory.EQUIPMENT,
    subCategory: 'Microscopy',
    quantityTotal: 20,
    quantityAvailable: 18,
    unit: 'Units',
    location: 'Bio Lab 1 - Cabinet 2',
    serialNumber: 'OLY-CX23-9921',
    vendor: 'V001',
    purchaseDate: '2022-06-20',
    warrantyExp: '2025-06-20',
    condition: AssetStatus.AVAILABLE,
    price: 48000,
    lastUpdated: '2024-02-15',
    image: 'https://hfkyyjvfstfklmfzvcfb.supabase.co/storage/v1/object/public/revz%20img/Screenshot%202026-04-08%20223534.png'
  },
  {
    id: 'A003',
    name: 'Fluke 87V Multimeter',
    description: 'Industrial Logging Multimeter with True-RMS technology.',
    category: AssetCategory.ELECTRONICS,
    subCategory: 'Measurement',
    quantityTotal: 15,
    quantityAvailable: 12,
    unit: 'Units',
    location: 'Electrical Lab - Rack C',
    serialNumber: 'FLU-87V-102',
    vendor: 'V001',
    purchaseDate: '2023-03-10',
    warrantyExp: '2026-03-10',
    condition: AssetStatus.WORKING,
    price: 42000,
    lastUpdated: '2024-03-01',
    image: 'https://picsum.photos/seed/multimeter/800/600'
  },
  {
    id: 'A004',
    name: 'Prusa i3 MK3S+ 3D Printer',
    description: 'Original Prusa i3 MK3S+ 3D Printer (FDM) for rapid prototyping.',
    category: AssetCategory.PROTOTYPING,
    subCategory: '3D Printers',
    quantityTotal: 5,
    quantityAvailable: 4,
    unit: 'Units',
    location: 'IDEA LAB - Zone A',
    serialNumber: 'PRUSA-MK3-05',
    vendor: 'V001',
    purchaseDate: '2023-08-01',
    warrantyExp: '2025-08-01',
    fundingSource: 'AICTE',
    condition: AssetStatus.AVAILABLE,
    price: 78000,
    lastUpdated: '2024-04-12',
    image: 'https://picsum.photos/seed/3dprinter/800/600'
  },
  {
    id: 'A005',
    name: 'Arduino Uno R3 Kit',
    description: 'Standard Microcontroller development board with sensor kit.',
    category: AssetCategory.COMPONENTS,
    subCategory: 'Microcontrollers',
    quantityTotal: 50,
    quantityAvailable: 42,
    unit: 'Kits',
    location: 'Embedded Systems Lab - Tray 4',
    serialNumber: 'ARD-UNO-BATCH1',
    vendor: 'V001',
    purchaseDate: '2023-11-20',
    warrantyExp: '2024-11-20',
    condition: AssetStatus.WORKING,
    price: 1800,
    lastUpdated: '2024-05-01',
    image: 'https://hfkyyjvfstfklmfzvcfb.supabase.co/storage/v1/object/public/revz%20img/Screenshot%202026-04-08%20223338.png'
  },
  {
    id: 'A006',
    name: 'Epilog Fusion Edge 12',
    description: 'Professional CO2 Laser Cutter & Engraver with camera system.',
    category: AssetCategory.PROTOTYPING,
    subCategory: 'Laser Cutters',
    quantityTotal: 1,
    quantityAvailable: 1,
    unit: 'Machine',
    location: 'IDEA LAB - Zone B',
    serialNumber: 'EPI-FE-001',
    vendor: 'V001',
    purchaseDate: '2023-12-05',
    warrantyExp: '2025-12-05',
    condition: AssetStatus.WORKING,
    price: 550000,
    lastUpdated: '2024-01-20',
    image: 'https://picsum.photos/seed/lasercutter/800/600'
  }
];

export const INITIAL_CONSUMABLES: Consumable[] = [
  { id: 'C001', name: 'Sulfuric Acid (H2SO4)', unit: 'Liters', currentStock: 2.5, minThreshold: 5, lastRefillDate: '2023-12-01' },
  { id: 'C002', name: '3D Printer PLA Filament (1kg)', unit: 'Spools', currentStock: 12, minThreshold: 3, lastRefillDate: '2024-01-15' },
  { id: 'C003', name: 'Filter Paper (Pkt of 100)', unit: 'Packets', currentStock: 8, minThreshold: 10, lastRefillDate: '2023-11-20' },
];

export const INITIAL_VENDORS: Vendor[] = [
  { id: 'V001', name: 'Reva Educational Supplies', contactPerson: 'Mr. Suresh G', phone: '080-2219-5555', email: 'supplies@reva.edu.in', address: 'Yelahanka, Bangalore', itemsSupplied: ['Electronics', 'Laboratory Glassware', 'Consumables'] },
];

export const INITIAL_ISSUES: IssueRecord[] = [
  {
    id: 'I-INIT-1',
    studentName: 'Rohan Sharma',
    usn: 'R21EC045',
    assetId: 'A001',
    assetName: 'Tektronix TBS1052B',
    issueDate: '2024-05-10',
    expectedReturnDate: '2024-05-15',
    status: RequestStatus.PENDING
  }
];

export const INITIAL_MAINTENANCE: MaintenanceRecord[] = [];
export const INITIAL_REQUESTS: StudentRequest[] = [];
export const INITIAL_AUDITS: AuditRecord[] = [];
export const INITIAL_CONSUMABLE_TRANSACTIONS: ConsumableTransaction[] = [];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'N001',
    title: 'Lab Maintenance Schedule - Summer Break',
    content: 'All Engineering labs will be closed for deep cleaning and equipment calibration from June 1st to June 10th. All students must return issued equipment by May 30th.',
    date: '2024-05-15',
    postedBy: 'Dr. John Doe',
    priority: 'High'
  },
  {
    id: 'N002',
    title: 'New Raspberry Pi 5 Kits Arrived',
    content: 'We have just added the latest Raspberry Pi 5 kits to the inventory. Students can start requesting them for advanced IoT and Computer Vision projects.',
    date: '2024-05-12',
    postedBy: 'Prof. Ramesh G',
    priority: 'Normal'
  }
];

export const INITIAL_MATERIALS: StudyMaterial[] = [
  {
    id: 'SM001',
    title: 'Digital Storage Oscilloscope (DSO) Guide',
    description: 'A step-by-step guide to measuring signal waveforms and noise reduction.',
    type: 'PDF',
    url: '#',
    dateAdded: '2024-01-10'
  },
  {
    id: 'SM002',
    title: '3D Printing Safety Protocols',
    description: 'Crucial safety instructions for handling high-temperature nozzles and resin.',
    type: 'Video',
    url: '#',
    dateAdded: '2024-02-15'
  }
];

export const INITIAL_STUDENTS: StudentProfile[] = [
  {
    usn: 'R21EC045',
    name: 'Rohan Sharma',
    course: 'B.Tech ECE',
    semester: '6th Semester',
    email: 'rohan.sharma@reva.edu.in'
  },
  {
    usn: 'R21CS099',
    name: 'Priya Verma',
    course: 'B.Tech CSE',
    semester: '6th Semester',
    email: 'priya.v@reva.edu.in'
  }
];
