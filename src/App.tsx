import React, { useState, useEffect } from "react";
import { Toaster } from "./components/ui/sonner";
import { AIAssistant } from "./components/AIAssistant";
import { ReceptionForm } from "./components/ReceptionForm";
import { RecordList } from "./components/RecordList";
import { DoctorWorkspace } from "./components/DoctorWorkspace";
import { TechnicianWorkspace } from "./components/TechnicianWorkspace";
import { RecordReturn } from "./components/RecordReturn";
import { RecordDetail } from "./components/RecordDetail";
import { LoginPage } from "./components/LoginPage";
import { RoleGuard } from "./components/RoleGuard";
import { AppSidebar } from "./components/layout/AppSidebar";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Button } from "./components/ui/button";
import { Menu } from "lucide-react";
import { MedicalRecord, TestOrder, TestType, TreatmentPlan } from "./types";
import {
  generateMockRecords,
  generateMockTestOrders,
  generateMockTreatmentPlans,
  generateDashboardStats,
} from "./lib/mockData";
import { motion } from "motion/react";
import useDualSocket from "./hook/useDualSocket";

function MainApp() {
  const { user, isAuthenticated } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [testOrders, setTestOrders] = useState<TestOrder[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("ai");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
    messages,
    sendMessage,
    typing,
    setTyping,
    setDataSocketPlus,
    streamingMessage,
    isStreaming,
  } = useDualSocket();

  // Initialize with mock data
  useEffect(() => {
    if (isAuthenticated) {
      const mockRecords = generateMockRecords();
      setRecords(mockRecords);
      setTestOrders(generateMockTestOrders());
      
      // Generate treatment plans for examined records
      const mockTreatmentPlans = generateMockTreatmentPlans(mockRecords);
      setTreatmentPlans(mockTreatmentPlans);
      
      // Update records with treatmentPlanId
      const updatedRecords = mockRecords.map(record => {
        const treatmentPlan = mockTreatmentPlans.find(tp => tp.recordId === record.id);
        if (treatmentPlan) {
          return {
            ...record,
            treatmentPlanId: treatmentPlan.id,
          };
        }
        return record;
      });
      setRecords(updatedRecords);
    }
  }, [isAuthenticated]);

  // Auto-select AI Assistant tab as default for all roles
  useEffect(() => {
    if (user) {
      setActiveTab("ai");
    }
  }, [user]);

  const handleCreateRecord = (
    newRecordData: Omit<
      MedicalRecord,
      "id" | "receiveCode" | "createdAt" | "updatedAt"
    >
  ) => {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
    const recordNumber = String(records.length + 1).padStart(3, "0");
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

  const handleUpdateRecord = (
    recordId: string,
    updates: Partial<MedicalRecord>
  ) => {
    setRecords(
      records.map((r) =>
        r.id === recordId
          ? { ...r, ...updates, updatedAt: new Date().toISOString() }
          : r
      )
    );
  };

  const handleCreateTestOrder = (
    recordId: string,
    testType: TestType,
    testName: string
  ) => {
    const record = records.find((r) => r.id === recordId);
    if (!record) return;

    const newTestOrder: TestOrder = {
      id: `t${Date.now()}`,
      recordId,
      receiveCode: record.receiveCode,
      patientName: record.patient.fullName,
      testType,
      testName,
      orderedBy: user?.fullName || "Bác sĩ",
      orderedAt: new Date().toISOString(),
      status: "pending",
    };

    setTestOrders([newTestOrder, ...testOrders]);
  };

  const handleUpdateTestOrder = (
    orderId: string,
    updates: Partial<TestOrder>
  ) => {
    setTestOrders(
      testOrders.map((t) => (t.id === orderId ? { ...t, ...updates } : t))
    );
  };

  const handleReturnRecord = (recordId: string, signature: string) => {
    setRecords(
      records.map((r) =>
        r.id === recordId
          ? {
              ...r,
              status: "RETURNED",
              signature,
              returnedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const handleCreateTreatmentPlan = (
    planData: Omit<TreatmentPlan, "id" | "createdAt" | "createdBy">
  ) => {
    const newPlan: TreatmentPlan = {
      ...planData,
      id: `tp_${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: user?.fullName || "Bác sĩ",
    };

    setTreatmentPlans([...treatmentPlans, newPlan]);

    // Update record with treatment plan ID
    setRecords(
      records.map((r) =>
        r.id === planData.recordId
          ? {
              ...r,
              treatmentPlanId: newPlan.id,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const handleUpdateTreatmentPlan = (plan: TreatmentPlan) => {
    setTreatmentPlans(
      treatmentPlans.map((tp) =>
        tp.id === plan.id
          ? { ...plan, updatedAt: new Date().toISOString() }
          : tp
      )
    );
  };

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const stats = generateDashboardStats(records);

  const handleEndDemoClick = () => {
    // Xóa tất cả dữ liệu trong localStorage
    localStorage.clear();

    // Reload trang để reset về trạng thái ban đầu
    window.location.reload();
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      <Toaster position="top-right" />

      <div className="flex h-full">
        <AppSidebar
          isOpen={sidebarOpen}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (window.innerWidth < 1024) setSidebarOpen(false);
          }}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          userRole={user?.role}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col h-full">
          {/* Nút toggle sidebar khi sidebar đóng trên mobile */}
          {!sidebarOpen && (
            <div className="mb-4 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          )}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {activeTab === "ai" && (
              <RoleGuard
                allowedRoles={["admin", "receptionist", "doctor", "nurse"]}
              >
                <AIAssistant
                  stats={stats}
                  onNewRecord={() => setActiveTab("records")}
                  onViewRecords={() => setActiveTab("records")}
                  userRole={user?.role || "receptionist"}
                  handSendMessage={sendMessage}
                  messagesAI={messages}
                  isTyping={typing}
                  setIsTyping={setTyping}
                  streamingMessage={streamingMessage}
                  isStreaming={isStreaming}
                  onEndDemo={handleEndDemoClick}
                />
              </RoleGuard>
            )}

            {activeTab === "records" && (
              <RoleGuard
                allowedRoles={["admin", "receptionist", "doctor", "nurse"]}
              >
                <RecordList
                  records={records}
                  onViewRecord={setSelectedRecord}
                  onCreateRecord={handleCreateRecord}
                />
              </RoleGuard>
            )}

            {activeTab === "doctor" && (
              <RoleGuard allowedRoles={["admin", "doctor"]}>
                <DoctorWorkspace
                  records={records}
                  treatmentPlans={treatmentPlans}
                  onUpdateRecord={handleUpdateRecord}
                  onCreateTestOrder={handleCreateTestOrder}
                  onCreateTreatmentPlan={handleCreateTreatmentPlan}
                  onUpdateTreatmentPlan={handleUpdateTreatmentPlan}
                />
              </RoleGuard>
            )}

            {activeTab === "nurse" && (
              <RoleGuard allowedRoles={["admin", "nurse"]}>
                <TechnicianWorkspace
                  testOrders={testOrders}
                  onUpdateTestOrder={handleUpdateTestOrder}
                />
              </RoleGuard>
            )}

            {activeTab === "return" && (
              <RoleGuard allowedRoles={["admin", "receptionist"]}>
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
        treatmentPlans={treatmentPlans}
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
