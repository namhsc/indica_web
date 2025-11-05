import React, { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { AIAssistant } from './components/AIAssistant';
import { ReceptionForm } from './components/ReceptionForm';
import { RecordList } from './components/RecordList';
import { DoctorWorkspace } from './components/DoctorWorkspace';
import { TechnicianWorkspace } from './components/TechnicianWorkspace';
import { RecordReturn } from './components/RecordReturn';
import { RecordDetail } from './components/RecordDetail';
import { LoginPage } from './components/LoginPage';
import { RoleGuard } from './components/RoleGuard';
import { AppHeader } from './components/layout/AppHeader';
import { AppSidebar } from './components/layout/AppSidebar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MedicalRecord, TestOrder, TestType } from './types';
import { 
  generateMockRecords, 
  generateMockTestOrders, 
  generateDashboardStats 
} from './lib/mockData';
import { motion } from 'motion/react';

function MainApp() {
  const { user, isAuthenticated } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [testOrders, setTestOrders] = useState<TestOrder[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [activeTab, setActiveTab] = useState('ai');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Initialize with mock data
  useEffect(() => {
    if (isAuthenticated) {
      setRecords(generateMockRecords());
      setTestOrders(generateMockTestOrders());
    }
  }, [isAuthenticated]);

  // Auto-select AI Assistant tab as default for all roles
  useEffect(() => {
    if (user) {
      setActiveTab('ai');
    }
  }, [user]);

  const handleCreateRecord = (newRecordData: Omit<MedicalRecord, 'id' | 'receiveCode' | 'createdAt' | 'updatedAt'>) => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const recordNumber = String(records.length + 1).padStart(3, '0');
    const receiveCode = `RC${dateStr}${recordNumber}`;

    const newRecord: MedicalRecord = {
      ...newRecordData,
      id: String(Date.now()),
      receiveCode,
      createdAt: today.toISOString(),
      updatedAt: today.toISOString(),
    };

    setRecords([newRecord, ...records]);
  };

  const handleUpdateRecord = (recordId: string, updates: Partial<MedicalRecord>) => {
    setRecords(records.map(r => 
      r.id === recordId 
        ? { ...r, ...updates, updatedAt: new Date().toISOString() }
        : r
    ));
  };

  const handleCreateTestOrder = (recordId: string, testType: TestType, testName: string) => {
    const record = records.find(r => r.id === recordId);
    if (!record) return;

    const newTestOrder: TestOrder = {
      id: `t${Date.now()}`,
      recordId,
      receiveCode: record.receiveCode,
      patientName: record.patient.fullName,
      testType,
      testName,
      orderedBy: user?.fullName || 'Bác sĩ',
      orderedAt: new Date().toISOString(),
      status: 'pending',
    };

    setTestOrders([newTestOrder, ...testOrders]);
  };

  const handleUpdateTestOrder = (orderId: string, updates: Partial<TestOrder>) => {
    setTestOrders(testOrders.map(t => 
      t.id === orderId ? { ...t, ...updates } : t
    ));
  };

  const handleReturnRecord = (recordId: string, signature: string) => {
    setRecords(records.map(r => 
      r.id === recordId 
        ? { 
            ...r, 
            status: 'RETURNED',
            signature,
            returnedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : r
    ));
  };

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const stats = generateDashboardStats(records);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Toaster position="top-right" />
      
      <AppHeader 
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex">
        <AppSidebar
          isOpen={sidebarOpen}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (window.innerWidth < 1024) setSidebarOpen(false);
          }}
          userRole={user?.role}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden flex flex-col min-h-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {activeTab === 'ai' && (
              <RoleGuard allowedRoles={['admin', 'receptionist', 'doctor', 'nurse']}>
                <AIAssistant 
                  stats={stats} 
                  onNewRecord={() => setActiveTab('records')}
                  onViewRecords={() => setActiveTab('records')}
                  userRole={user?.role || 'receptionist'}
                />
              </RoleGuard>
            )}

            {activeTab === 'records' && (
              <RoleGuard allowedRoles={['admin', 'receptionist', 'doctor', 'nurse']}>
                <RecordList 
                  records={records}
                  onViewRecord={setSelectedRecord}
                  onCreateRecord={handleCreateRecord}
                />
              </RoleGuard>
            )}

            {activeTab === 'doctor' && (
              <RoleGuard allowedRoles={['admin', 'doctor']}>
                <DoctorWorkspace 
                  records={records}
                  onUpdateRecord={handleUpdateRecord}
                  onCreateTestOrder={handleCreateTestOrder}
                />
              </RoleGuard>
            )}

            {activeTab === 'nurse' && (
              <RoleGuard allowedRoles={['admin', 'nurse']}>
                <TechnicianWorkspace 
                  testOrders={testOrders}
                  onUpdateTestOrder={handleUpdateTestOrder}
                />
              </RoleGuard>
            )}

            {activeTab === 'return' && (
              <RoleGuard allowedRoles={['admin', 'receptionist']}>
                <RecordReturn 
                  records={records}
                  onReturnRecord={handleReturnRecord}
                />
              </RoleGuard>
            )}


          </motion.div>
        </main>
      </div>

      {/* Record Detail Modal */}
      <RecordDetail 
        record={selectedRecord}
        testOrders={testOrders}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
