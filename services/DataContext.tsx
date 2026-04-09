
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Asset, Consumable, IssueRecord, MaintenanceRecord, Vendor, StudentRequest, RequestStatus, AssetStatus, AuditRecord, ConsumableTransaction, AppNotification, MaintenanceType, User, Notice, StudyMaterial, StudentProfile } from '../types';
import { INITIAL_ASSETS, INITIAL_CONSUMABLES, INITIAL_ISSUES, INITIAL_MAINTENANCE, INITIAL_REQUESTS, INITIAL_VENDORS, INITIAL_AUDITS, INITIAL_CONSUMABLE_TRANSACTIONS, INITIAL_NOTICES, INITIAL_MATERIALS, INITIAL_STUDENTS } from '../constants';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, setDoc, onSnapshot, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { supabase } from './supabase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: any[];
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // We don't throw here to avoid crashing the app, but we log it.
};

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
  uploadImage: (path: string, dataUrl: string) => Promise<string>;
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
  // Helper to load from localStorage
  const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(`Error parsing ${key} from storage:`, e);
      return defaultValue;
    }
  };

  const [assets, setAssets] = useState<Asset[]>(() => loadFromStorage('reva_assets', INITIAL_ASSETS));
  const [consumables, setConsumables] = useState<Consumable[]>(() => loadFromStorage('reva_consumables', INITIAL_CONSUMABLES));
  const [vendors, setVendors] = useState<Vendor[]>(() => loadFromStorage('reva_vendors', INITIAL_VENDORS));
  const [issueLog, setIssueLog] = useState<IssueRecord[]>(() => loadFromStorage('reva_issueLog', INITIAL_ISSUES));
  const [maintenanceLog, setMaintenanceLog] = useState<MaintenanceRecord[]>(() => loadFromStorage('reva_maintenanceLog', INITIAL_MAINTENANCE));
  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>(() => loadFromStorage('reva_studentRequests', INITIAL_REQUESTS));
  const [auditLog, setAuditLog] = useState<AuditRecord[]>(() => loadFromStorage('reva_auditLog', INITIAL_AUDITS));
  const [consumableTransactions, setConsumableTransactions] = useState<ConsumableTransaction[]>(() => loadFromStorage('reva_consumableTransactions', INITIAL_CONSUMABLE_TRANSACTIONS));
  const [notices, setNotices] = useState<Notice[]>(() => loadFromStorage('reva_notices', INITIAL_NOTICES));
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>(() => loadFromStorage('reva_studyMaterials', INITIAL_MATERIALS));
  const [students, setStudents] = useState<StudentProfile[]>(() => loadFromStorage('reva_students', INITIAL_STUDENTS));
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'guest',
    name: 'Guest User',
    email: '',
    phone: '',
    role: 'faculty',
  });

  useEffect(() => {
    // Firebase auth state
    const unsubscribeFirebase = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Faculty User',
          email: firebaseUser.email || '',
          phone: firebaseUser.phoneNumber || '',
          role: 'faculty',
        });
      }
    });

    // Supabase auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Faculty User',
          email: session.user.email || '',
          phone: session.user.phone || '',
          role: 'faculty',
        });
      } else if (!auth.currentUser) {
        setCurrentUser({
          id: 'guest',
          name: 'Guest User',
          email: '',
          phone: '',
          role: 'faculty',
        });
      }
    });

    return () => {
      unsubscribeFirebase();
      subscription.unsubscribe();
    };
  }, []);

  // Firestore Sync Logic
  useEffect(() => {
    if (!auth.currentUser) return;

    const syncCollection = <T,>(collectionName: string, setter: React.Dispatch<React.SetStateAction<T[]>>, initialData: T[]) => {
      return onSnapshot(collection(db, collectionName), (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is empty, we might want to seed it with initial data or localStorage data
          // But for now, we'll just let it be empty or wait for the first write
        } else {
          const data = snapshot.docs.map(doc => doc.data() as T);
          setter(data);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, collectionName);
      });
    };

    const unsubAssets = syncCollection('assets', setAssets, INITIAL_ASSETS);
    const unsubConsumables = syncCollection('consumables', setConsumables, INITIAL_CONSUMABLES);
    const unsubVendors = syncCollection('vendors', setVendors, INITIAL_VENDORS);
    const unsubIssueLog = syncCollection('issueLog', setIssueLog, INITIAL_ISSUES);
    const unsubMaintenanceLog = syncCollection('maintenanceLog', setMaintenanceLog, INITIAL_MAINTENANCE);
    const unsubStudentRequests = syncCollection('studentRequests', setStudentRequests, INITIAL_REQUESTS);
    const unsubAuditLog = syncCollection('auditLog', setAuditLog, INITIAL_AUDITS);
    const unsubConsumableTransactions = syncCollection('consumableTransactions', setConsumableTransactions, INITIAL_CONSUMABLE_TRANSACTIONS);
    const unsubNotices = syncCollection('notices', setNotices, INITIAL_NOTICES);
    const unsubStudyMaterials = syncCollection('studyMaterials', setStudyMaterials, INITIAL_MATERIALS);
    const unsubStudents = syncCollection('students', setStudents, INITIAL_STUDENTS);

    return () => {
      unsubAssets();
      unsubConsumables();
      unsubVendors();
      unsubIssueLog();
      unsubMaintenanceLog();
      unsubStudentRequests();
      unsubAuditLog();
      unsubConsumableTransactions();
      unsubNotices();
      unsubStudyMaterials();
      unsubStudents();
    };
  }, [currentUser.id]);

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

  // Persistence Effects
  useEffect(() => { localStorage.setItem('reva_assets', JSON.stringify(assets)); }, [assets]);
  useEffect(() => { localStorage.setItem('reva_consumables', JSON.stringify(consumables)); }, [consumables]);
  useEffect(() => { localStorage.setItem('reva_vendors', JSON.stringify(vendors)); }, [vendors]);
  useEffect(() => { localStorage.setItem('reva_issueLog', JSON.stringify(issueLog)); }, [issueLog]);
  useEffect(() => { localStorage.setItem('reva_maintenanceLog', JSON.stringify(maintenanceLog)); }, [maintenanceLog]);
  useEffect(() => { localStorage.setItem('reva_studentRequests', JSON.stringify(studentRequests)); }, [studentRequests]);
  useEffect(() => { localStorage.setItem('reva_auditLog', JSON.stringify(auditLog)); }, [auditLog]);
  useEffect(() => { localStorage.setItem('reva_consumableTransactions', JSON.stringify(consumableTransactions)); }, [consumableTransactions]);
  useEffect(() => { localStorage.setItem('reva_notices', JSON.stringify(notices)); }, [notices]);
  useEffect(() => { localStorage.setItem('reva_studyMaterials', JSON.stringify(studyMaterials)); }, [studyMaterials]);
  useEffect(() => { localStorage.setItem('reva_students', JSON.stringify(students)); }, [students]);

  const saveToFirestore = async (collectionName: string, id: string, data: any) => {
    try {
      await setDoc(doc(db, collectionName, id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${id}`);
    }
  };

  const updateInFirestore = async (collectionName: string, id: string, updates: any) => {
    try {
      await updateDoc(doc(db, collectionName, id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${id}`);
    }
  };

  const addAsset = (asset: Asset) => {
    setAssets([...assets, asset]);
    saveToFirestore('assets', asset.id, asset);
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    updateInFirestore('assets', id, updates);
  };

  const issueItem = (record: IssueRecord) => {
    setAssets(prevAssets => {
      const asset = prevAssets.find(a => a.id === record.assetId);
      if (asset && asset.quantityAvailable > 0) {
        setIssueLog(prevLog => [...prevLog, record]);
        saveToFirestore('issueLog', record.id, record);
        
        const newQty = asset.quantityAvailable - 1;
        updateInFirestore('assets', record.assetId, { quantityAvailable: newQty });
        
        return prevAssets.map(a => a.id === record.assetId ? { ...a, quantityAvailable: newQty } : a);
      }
      return prevAssets;
    });
  };

  const returnItem = (id: string, condition: string, actualReturnDate: string) => {
    setIssueLog(prev => prev.map(r => r.id === id ? { ...r, status: RequestStatus.RETURNED, actualReturnDate, conditionOnReturn: condition } : r));
    updateInFirestore('issueLog', id, { status: RequestStatus.RETURNED, actualReturnDate, conditionOnReturn: condition });
    
    const record = issueLog.find(r => r.id === id);
    if (record) {
      setAssets(prevAssets => prevAssets.map(a => a.id === record.assetId ? { 
        ...a, 
        quantityAvailable: a.quantityAvailable + 1,
        condition: condition === 'Damaged' ? AssetStatus.DAMAGED : a.condition
      } : a));
      
      const asset = assets.find(a => a.id === record.assetId);
      if (asset) {
        updateInFirestore('assets', record.assetId, { 
          quantityAvailable: asset.quantityAvailable + 1,
          condition: condition === 'Damaged' ? AssetStatus.DAMAGED : asset.condition
        });
      }
    }
  };

  const addStudentRequest = (request: StudentRequest) => {
    setStudentRequests(prev => [...prev, request]);
    saveToFirestore('studentRequests', request.id, request);
  };
  
  const processStudentRequest = (id: string, status: RequestStatus) => {
    setStudentRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    updateInFirestore('studentRequests', id, { status });
    
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
            saveToFirestore('issueLog', newIssue.id, newIssue);
            
            const newQty = asset.quantityAvailable - request.quantity;
            updateInFirestore('assets', request.assetId, { quantityAvailable: newQty });
            
            return prevAssets.map(a => a.id === request.assetId ? { ...a, quantityAvailable: newQty } : a);
          }
          return prevAssets;
        });
      }
    }
  };

  const reportMaintenance = (record: MaintenanceRecord) => {
    setMaintenanceLog([...maintenanceLog, record]);
    saveToFirestore('maintenanceLog', record.id, record);
    updateAsset(record.assetId, { condition: AssetStatus.UNDER_MAINTENANCE });
  };

  const completeMaintenance = (id: string, cost: number, date: string) => {
    setMaintenanceLog(prev => prev.map(m => m.id === id ? { ...m, status: 'Completed', cost, repairDate: date } : m));
    updateInFirestore('maintenanceLog', id, { status: 'Completed', cost, repairDate: date });
    
    const record = maintenanceLog.find(m => m.id === id);
    if (record) updateAsset(record.assetId, { condition: AssetStatus.WORKING });
  };

  const addAuditRecord = (record: AuditRecord) => {
    setAuditLog([record, ...auditLog]);
    saveToFirestore('auditLog', record.id, record);
    updateAsset(record.assetId, { condition: record.condition });
  };

  const addConsumableTransaction = (transaction: ConsumableTransaction) => {
    setConsumableTransactions([transaction, ...consumableTransactions]);
    saveToFirestore('consumableTransactions', transaction.id, transaction);
    
    setConsumables(prev => prev.map(c => {
      if (c.id === transaction.consumableId) {
        const newStock = transaction.type === 'ISSUE' ? c.currentStock - transaction.quantity : c.currentStock + transaction.quantity;
        const newRefillDate = transaction.type === 'REFILL' ? transaction.date : c.lastRefillDate;
        
        updateInFirestore('consumables', c.id, {
          currentStock: newStock,
          lastRefillDate: newRefillDate
        });
        
        return {
          ...c, 
          currentStock: newStock,
          lastRefillDate: newRefillDate
        };
      }
      return c;
    }));
  };

  const updateCurrentUser = (updates: Partial<User>) => setCurrentUser(prev => ({ ...prev, ...updates }));

  const uploadImage = async (path: string, dataUrl: string): Promise<string> => {
    try {
      const storageRef = ref(storage, path);
      // We use uploadString for Base64 dataUrls
      await uploadString(storageRef, dataUrl, 'data_url');
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{
      assets, consumables, vendors, issueLog, maintenanceLog, studentRequests, auditLog, consumableTransactions, notifications, notices, studyMaterials, students, currentUser,
      addAsset, updateAsset, issueItem, returnItem, addStudentRequest, processStudentRequest,
      reportMaintenance, completeMaintenance, addAuditRecord, addConsumableTransaction, updateCurrentUser, uploadImage
    }}>
      {children}
    </DataContext.Provider>
  );
};
