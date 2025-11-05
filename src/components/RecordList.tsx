import { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { MedicalRecord, RecordStatus } from '../types';
import { Search, Eye, FileText, Filter, Plus, Zap, Calendar, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ReceptionForm } from './ReceptionForm';
import { useAuth } from '../contexts/AuthContext';

interface RecordListProps {
  records: MedicalRecord[];
  onViewRecord: (record: MedicalRecord) => void;
  onCreateRecord?: (record: Omit<MedicalRecord, 'id' | 'receiveCode' | 'createdAt' | 'updatedAt'>) => void;
}

const statusLabels: Record<RecordStatus, string> = {
  PENDING_CHECKIN: 'Chưa check-in',
  PENDING_EXAMINATION: 'Chờ khám',
  IN_EXAMINATION: 'Đang khám',
  WAITING_TESTS: 'Chờ xét nghiệm',
  WAITING_DOCTOR_REVIEW: 'Chờ bác sĩ duyệt',
  COMPLETED_EXAMINATION: 'Hoàn thành',
  RETURNED: 'Đã trả',
};

const statusGradients: Record<RecordStatus, string> = {
  PENDING_CHECKIN: 'from-yellow-500 to-amber-500',
  PENDING_EXAMINATION: 'from-amber-500 to-orange-500',
  IN_EXAMINATION: 'from-blue-500 to-cyan-500',
  WAITING_TESTS: 'from-orange-500 to-red-500',
  WAITING_DOCTOR_REVIEW: 'from-violet-500 to-purple-500',
  COMPLETED_EXAMINATION: 'from-emerald-500 to-teal-500',
  RETURNED: 'from-gray-500 to-slate-500',
};

export function RecordList({ records, onViewRecord, onCreateRecord }: RecordListProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showReceptionDialog, setShowReceptionDialog] = useState(false);

  const canCreateRecord = user && ['admin', 'receptionist'].includes(user.role);

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.receiveCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patient.phoneNumber.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateRecord = (record: Omit<MedicalRecord, 'id' | 'receiveCode' | 'createdAt' | 'updatedAt'>) => {
    if (onCreateRecord) {
      onCreateRecord(record);
      setShowReceptionDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Danh sách hồ sơ
          </h2>
          <p className="text-gray-600 mt-1">Quản lý, tra cứu và tiếp nhận hồ sơ bệnh nhân</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
            <span className="text-sm text-gray-600">Tổng:</span>
            <span className="text-sm ml-1">{filteredRecords.length}</span>
          </div>
          {canCreateRecord && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setShowReceptionDialog(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tiếp nhận hồ sơ
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo mã hồ sơ, tên, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="w-full md:w-64 relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="pl-10 border-gray-200">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 hover:bg-gray-50">
                  <TableHead>Mã hồ sơ</TableHead>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Ngày tiếp nhận</TableHead>
                  <TableHead>Dịch vụ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3 text-gray-500">
                        <FileText className="h-12 w-12 text-gray-300" />
                        <p>Không tìm thấy hồ sơ nào</p>
                        {canCreateRecord && (
                          <Button
                            onClick={() => setShowReceptionDialog(true)}
                            variant="outline"
                            className="mt-2"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Tiếp nhận hồ sơ mới
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record, index) => (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {record.appointmentId && (
                            <Calendar className="h-4 w-4 text-indigo-600" />
                          )}
                          <span className="font-mono text-sm bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {record.receiveCode}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm flex items-center gap-1">
                            {record.patient.fullName}
                            {record.appointmentId && record.status === 'PENDING_CHECKIN' && (
                              <Badge variant="outline" className="text-xs text-indigo-600 border-indigo-300">
                                Lịch hẹn
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{record.patient.phoneNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {record.appointmentTime && record.status === 'PENDING_CHECKIN' ? (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-indigo-600" />
                              <span className="text-indigo-600">{formatDate(record.createdAt)}</span>
                            </div>
                          ) : (
                            formatDate(record.createdAt)
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {record.requestedServices.slice(0, 2).join(', ')}
                          {record.requestedServices.length > 2 && (
                            <span className="text-xs text-gray-400"> +{record.requestedServices.length - 2}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`bg-gradient-to-r ${statusGradients[record.status]} text-white border-0 shadow-sm`}>
                          {statusLabels[record.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewRecord(record)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Floating Action Button for Mobile */}
      {canCreateRecord && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 md:hidden z-40"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowReceptionDialog(true)}
            className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-2xl shadow-blue-500/50 flex items-center justify-center text-white"
          >
            <Plus className="h-6 w-6" />
          </motion.button>
        </motion.div>
      )}

      {/* Reception Dialog */}
      <Dialog open={showReceptionDialog} onOpenChange={setShowReceptionDialog}>
        <DialogContent className="max-w-[95vw] lg:max-w-[90vw] xl:max-w-7xl max-h-[95vh] overflow-hidden p-0 gap-0 bg-gradient-to-br from-gray-50 to-white border-0 shadow-2xl">
          <div className="overflow-y-auto max-h-[95vh]">
            <DialogHeader className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 shadow-xl">
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl"
                >
                  <Zap className="h-7 w-7 text-white" />
                </motion.div>
                <span>Tiếp nhận hồ sơ mới</span>
              </DialogTitle>
              <DialogDescription className="text-blue-100 text-base mt-2">
                Chọn phương thức nhập thông tin bệnh nhân phù hợp để bắt đầu quy trình khám chữa bệnh
              </DialogDescription>
            </DialogHeader>
            <div className="p-6">
              <ReceptionForm onSubmit={handleCreateRecord} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
