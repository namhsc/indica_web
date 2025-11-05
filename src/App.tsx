import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { AIAssistant } from './components/AIAssistant';
import { ReceptionForm } from './components/ReceptionForm';
import { RecordList } from './components/RecordList';
import { DoctorWorkspace } from './components/DoctorWorkspace';
import { TechnicianWorkspace } from './components/TechnicianWorkspace';
import { RecordReturn } from './components/RecordReturn';
import { RecordDetail } from './components/RecordDetail';
import { LoginPage } from './components/LoginPage';
import { UserProfile } from './components/UserProfile';
import { RoleGuard } from './components/RoleGuard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MedicalRecord, TestOrder, TestType } from './types';
import { 
  generateMockRecords, 
  generateMockTestOrders, 
  generateDashboardStats 
} from './lib/mockData';
import { 
  LayoutDashboard, 
  UserPlus, 
  Stethoscope, 
  FlaskConical, 
  FolderCheck, 
  FolderOpen, 
  ScrollText,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './components/ui/button';

function MainApp() {
  const { user, isAuthenticated } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [testOrders, setTestOrders] = useState<TestOrder[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Initialize with mock data
  useEffect(() => {
    if (isAuthenticated) {
      setRecords(generateMockRecords());
      setTestOrders(generateMockTestOrders());
    }
  }, [isAuthenticated]);

  // Auto-select appropriate tab based on user role
  useEffect(() => {
    if (user) {
      if (user.role === 'receptionist') {
        setActiveTab('records');
      } else if (user.role === 'doctor') {
        setActiveTab('doctor');
      } else if (user.role === 'technician') {
        setActiveTab('technician');
      } else {
        setActiveTab('dashboard');
      }
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

  // Navigation items with role-based access
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Trợ lý AI',
      icon: LayoutDashboard,
      roles: ['admin', 'receptionist', 'doctor', 'technician'],
    },
    {
      id: 'records',
      label: 'Hồ sơ',
      icon: FolderOpen,
      roles: ['admin', 'receptionist', 'doctor', 'technician'],
    },
    {
      id: 'doctor',
      label: 'Bác sĩ',
      icon: Stethoscope,
      roles: ['admin', 'doctor'],
    },
    {
      id: 'technician',
      label: 'Kỹ thuật viên',
      icon: FlaskConical,
      roles: ['admin', 'technician'],
    },
    {
      id: 'return',
      label: 'Trả hồ sơ',
      icon: FolderCheck,
      roles: ['admin', 'receptionist'],
    },
  ];

  const canAccessItem = (item: typeof navigationItems[0]): boolean => {
    if (!user) return false;
    return item.roles.includes(user.role);
  };

  const accessibleItems = navigationItems.filter(canAccessItem);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Toaster position="top-right" />
      
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm sticky top-0 z-40">
        <div className="px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg">Phòng khám đa khoa Indica</h1>
                  <p className="text-xs text-gray-600">Hệ thống quản lý hồ sơ khám bệnh</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-xs text-gray-600 hidden md:block">
                {new Date().toLocaleDateString('vi-VN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Modern Sidebar */}
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed lg:sticky top-[65px] left-0 h-[calc(100vh-65px)] w-64 bg-white/80 backdrop-blur-lg border-r border-gray-200/50 shadow-lg z-30 overflow-y-auto"
            >
              <nav className="p-4 space-y-2">
                {accessibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                          : 'text-gray-700 hover:bg-gray-100/80'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm">{item.label}</span>
                    </motion.button>
                  );
                })}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && (
              <RoleGuard allowedRoles={['admin', 'receptionist', 'doctor', 'technician']}>
                <AIAssistant 
                  stats={stats} 
                  onNewRecord={() => setActiveTab('records')}
                  onViewRecords={() => setActiveTab('records')}
                  userRole={user?.role || 'receptionist'}
                />
              </RoleGuard>
            )}

            {activeTab === 'records' && (
              <RoleGuard allowedRoles={['admin', 'receptionist', 'doctor', 'technician']}>
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

            {activeTab === 'technician' && (
              <RoleGuard allowedRoles={['admin', 'technician']}>
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
