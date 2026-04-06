
export enum AssetStatus {
  AVAILABLE = 'Available',
  WORKING = 'Working',
  NOT_WORKING = 'Not Working',
  UNDER_MAINTENANCE = 'Maintenance',
  DAMAGED = 'Damaged'
}

export enum AssetCategory {
  EQUIPMENT = 'Equipment',
  MACHINERY = 'Machinery',
  ELECTRONICS = 'Electronics',
  FURNITURE = 'Furniture',
  GLASSWARE = 'Glassware',
  PROTOTYPING = 'Prototyping', // Laser Cutters, 3D Printers
  COMPONENTS = 'Components',   // Microcontrollers, Sensors
  STORAGE = 'Storage',         // Racks, Cabinets
  OTHER = 'Other'
}

export enum MaintenanceType {
  REPAIR = 'Repair',
  PREVENTIVE = 'Prevention'
}

export interface Asset {
  id: string;
  name: string;
  description: string;
  category: AssetCategory;
  subCategory?: string; 
  quantityTotal: number;
  quantityAvailable: number;
  unit: string; 
  location: string;
  serialNumber: string;
  vendor: string;
  purchaseDate: string;
  warrantyExp: string;
  fundingSource?: string; 
  condition: AssetStatus;
  price: number;
  lastUpdated: string;
  image?: string; 
}

export interface Consumable {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minThreshold: number;
  lastRefillDate: string;
}

export interface ConsumableTransaction {
  id: string;
  consumableId: string;
  consumableName: string;
  type: 'ISSUE' | 'REFILL';
  quantity: number;
  date: string;
  performedBy: string; 
  notes?: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  itemsSupplied: string[];
}

export enum RequestStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  RETURNED = 'Returned'
}

export interface IssueRecord {
  id: string;
  studentName: string;
  usn: string; 
  assetId: string;
  assetName: string;
  issueDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: RequestStatus;
  conditionOnReturn?: string;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetName: string;
  type: MaintenanceType; 
  issueReported: string;
  dateReported: string;
  repairDate?: string;
  vendorName: string;
  cost: number;
  status: 'Pending' | 'Completed';
}

export interface AuditRecord {
  id: string;
  assetId: string;
  assetName: string;
  verifiedBy: string;
  verificationDate: string;
  condition: AssetStatus;
  remarks: string;
  status: 'Verified' | 'Discrepancy';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'faculty';
  phone: string;
  password?: string;
}

export interface StudentRequest {
  id: string;
  studentName: string;
  usn: string;
  email: string;
  assetId: string; // Added assetId for tracking
  assetName: string;
  quantity: number;
  purpose: string;
  expectedReturnDate: string;
  status: RequestStatus;
  requestDate: string;
}

export interface AppNotification {
  id: string;
  type: 'alert' | 'warning' | 'info';
  message: string;
  timestamp: number;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  postedBy: string;
  priority: 'High' | 'Normal';
}

export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  type: 'PDF' | 'Link' | 'Video' | 'Doc';
  url: string;
  dateAdded: string;
}

export interface StudentProfile {
  usn: string;
  name: string;
  course: string;
  semester: string;
  email: string;
}
