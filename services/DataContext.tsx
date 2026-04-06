
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Asset, Consumable, IssueRecord, MaintenanceRecord, Vendor, StudentRequest, RequestStatus, AssetStatus, AuditRecord, ConsumableTransaction, AppNotification, MaintenanceType, User, Notice, StudyMaterial, StudentProfile } from '../types';
import { INITIAL_ASSETS, INITIAL_CONSUMABLES, INITIAL_ISSUES, INITIAL_MAINTENANCE, INITIAL_REQUESTS, INITIAL_VENDORS, INITIAL_AUDITS, INITIAL_CONSUMABLE_TRANSACTIONS, INITIAL_NOTICES, INITIAL_MATERIALS, INITIAL_STUDENTS } from '../constants';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface DataContextType {
  assets: Asset[];
  consumables: Consumable[];
  vendors: Vendor[];
  issueLog: IssueRecord[];
  maintenanceLog: MaintenanceRecord[];
  studentRequests: StudentRequest[];
  auditLog: AuditRecord[];
  consumableTransactions: ConsumableTransaction[];
  notifications: AppNotification[];
  notices: Notice[];
  studyMaterials: StudyMaterial[];
  students: StudentProfile[];
  currentUser: User;
  
  addAsset: (asset: Asset) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  
  issueItem: (record: IssueRecord) => void;
  returnItem: (id: string, condition: string, actualReturnDate: string) => void;
  
  addStudentRequest: (request: StudentRequest) => void;
  processStudentRequest: (id: string, status: RequestStatus, rejectionReason?: string) => void;
  
  reportMaintenance: (record: MaintenanceRecord) => void;
  completeMaintenance: (id: string, cost: number, date: string) => void;
  
  addAuditRecord: (record: AuditRecord) => void;
  
  addConsumableTransaction: (transaction: ConsumableTransaction) => void;
  updateCurrentUser: (updates: Partial<User>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [consumables, setConsumables] = useState<Consumable[]>(INITIAL_CONSUMABLES);
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [issueLog, setIssueLog] = useState<IssueRecord[]>(INITIAL_ISSUES);
  const [maintenanceLog, setMaintenanceLog] = useState<MaintenanceRecord[]>(INITIAL_MAINTENANCE);
  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>(INITIAL_REQUESTS);
  const [auditLog, setAuditLog] = useState<AuditRecord[]>(INITIAL_AUDITS);
  const [consumableTransactions, setConsumableTransactions] = useState<ConsumableTransaction[]>(INITIAL_CONSUMABLE_TRANSACTIONS);
  const [notices] = useState<Notice[]>(INITIAL_NOTICES);
  const [studyMaterials] = useState<StudyMaterial[]>(INITIAL_MATERIALS);
  const [students] = useState<StudentProfile[]>(INITIAL_STUDENTS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'guest',
    name: 'Guest User',
    email: '',
    phone: '',
    role: 'faculty',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Faculty User',
          email: firebaseUser.email || '',
          phone: firebaseUser.phoneNumber || '',
          role: 'faculty', // Default role for logged in users
        });
      } else {
        setCurrentUser({
          id: 'guest',
          name: 'Guest User',
          email: '',
          phone: '',
          role: 'faculty',
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const newNotifications: AppNotification[] = [];
    const pendingReqs = studentRequests.filter(r => r.status === RequestStatus.PENDING).length;
    
    if (pendingReqs > 0) {
      newNotifications.push({
        id: 'n-req',
        type: 'info',
        message: `${pendingReqs} student request(s) waiting for approval.`,
        timestamp: Date.now()
      });
    }

    consumables.forEach(c => {
      if (c.currentStock <= c.minThreshold) {
        newNotifications.push({
          id: `n-stock-${c.id}`,
          type: 'warning',
          message: `Low Stock: ${c.name} is below threshold (${c.currentStock} ${c.unit}).`,
          timestamp: Date.now()
        });
      }
    });

    setNotifications(newNotifications);
  }, [studentRequests, consumables]);

  const addAsset = (asset: Asset) => setAssets([...assets, asset]);
  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const issueItem = (record: IssueRecord) => {
    setAssets(prevAssets => {
      const asset = prevAssets.find(a => a.id === record.assetId);
      if (asset && asset.quantityAvailable > 0) {
        setIssueLog(prevLog => [...prevLog, record]);
        return prevAssets.map(a => a.id === record.assetId ? { ...a, quantityAvailable: a.quantityAvailable - 1 } : a);
      }
      return prevAssets;
    });
  };

  const returnItem = (id: string, condition: string, actualReturnDate: string) => {
    setIssueLog(prev => prev.map(r => r.id === id ? { ...r, status: RequestStatus.RETURNED, actualReturnDate, conditionOnReturn: condition } : r));
    const record = issueLog.find(r => r.id === id);
    if (record) {
      setAssets(prevAssets => prevAssets.map(a => a.id === record.assetId ? { 
        ...a, 
        quantityAvailable: a.quantityAvailable + 1,
        condition: condition === 'Damaged' ? AssetStatus.DAMAGED : a.condition
      } : a));
    }
  };

  const addStudentRequest = (request: StudentRequest) => setStudentRequests(prev => [...prev, request]);
  
  const processStudentRequest = (id: string, status: RequestStatus) => {
    setStudentRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    
    if (status === RequestStatus.APPROVED) {
      const request = studentRequests.find(r => r.id === id);
      if (request) {
        setAssets(prevAssets => {
          const asset = prevAssets.find(a => a.id === request.assetId);
          if (asset && asset.quantityAvailable >= request.quantity) {
            const newIssue: IssueRecord = {
              id: `I-AUTO-${request.id}`,
              studentName: request.studentName,
              usn: request.usn,
              assetId: request.assetId,
              assetName: request.assetName,
              issueDate: new Date().toISOString().split('T')[0],
              expectedReturnDate: request.expectedReturnDate,
              status: RequestStatus.PENDING
            };
            setIssueLog(prev => [...prev, newIssue]);
            return prevAssets.map(a => a.id === request.assetId ? { ...a, quantityAvailable: a.quantityAvailable - request.quantity } : a);
          }
          return prevAssets;
        });
      }
    }
  };

  const reportMaintenance = (record: MaintenanceRecord) => {
    setMaintenanceLog([...maintenanceLog, record]);
    updateAsset(record.assetId, { condition: AssetStatus.UNDER_MAINTENANCE });
  };

  const completeMaintenance = (id: string, cost: number, date: string) => {
    setMaintenanceLog(prev => prev.map(m => m.id === id ? { ...m, status: 'Completed', cost, repairDate: date } : m));
    const record = maintenanceLog.find(m => m.id === id);
    if (record) updateAsset(record.assetId, { condition: AssetStatus.WORKING });
  };

  const addAuditRecord = (record: AuditRecord) => {
    setAuditLog([record, ...auditLog]);
    updateAsset(record.assetId, { condition: record.condition });
  };

  const addConsumableTransaction = (transaction: ConsumableTransaction) => {
    setConsumableTransactions([transaction, ...consumableTransactions]);
    setConsumables(prev => prev.map(c => c.id === transaction.consumableId ? {
      ...c, 
      currentStock: transaction.type === 'ISSUE' ? c.currentStock - transaction.quantity : c.currentStock + transaction.quantity,
      lastRefillDate: transaction.type === 'REFILL' ? transaction.date : c.lastRefillDate
    } : c));
  };

  const updateCurrentUser = (updates: Partial<User>) => setCurrentUser(prev => ({ ...prev, ...updates }));

  return (
    <DataContext.Provider value={{
      assets, consumables, vendors, issueLog, maintenanceLog, studentRequests, auditLog, consumableTransactions, notifications, notices, studyMaterials, students, currentUser,
      addAsset, updateAsset, issueItem, returnItem, addStudentRequest, processStudentRequest,
      reportMaintenance, completeMaintenance, addAuditRecord, addConsumableTransaction, updateCurrentUser
    }}>
      {children}
    </DataContext.Provider>
  );
};
