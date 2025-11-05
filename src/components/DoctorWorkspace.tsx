import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { MedicalRecord, TestType } from '../types';
import { Stethoscope, ClipboardList, Plus } from 'lucide-react';

interface DoctorWorkspaceProps {
  records: MedicalRecord[];
  onUpdateRecord: (recordId: string, updates: Partial<MedicalRecord>) => void;
  onCreateTestOrder: (recordId: string, testType: TestType, testName: string) => void;
}

const testTypes: { value: TestType; label: string; examples: string[] }[] = [
  { value: 'blood', label: 'Xét nghiệm máu', examples: ['Công thức máu', 'Sinh hóa máu', 'Đông máu'] },
  { value: 'urine', label: 'Xét nghiệm nước tiểu', examples: ['Tổng phân tích nước tiểu', 'Vi sinh nước tiểu'] },
  { value: 'xray', label: 'Chụp X-quang', examples: ['X-quang phổi', 'X-quang xương khớp'] },
  { value: 'ultrasound', label: 'Siêu âm', examples: ['Siêu âm bụng', 'Siêu âm tim'] },
  { value: 'ct', label: 'Chụp CT', examples: ['CT não', 'CT ngực'] },
  { value: 'mri', label: 'Chụp MRI', examples: ['MRI não', 'MRI cột sống'] },
];

export function DoctorWorkspace({ records, onUpdateRecord, onCreateTestOrder }: DoctorWorkspaceProps) {
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState<TestType>('blood');
  const [selectedTestName, setSelectedTestName] = useState('');

  const pendingRecords = records.filter(r => 
    r.status === 'PENDING_EXAMINATION' || 
    r.status === 'IN_EXAMINATION' ||
    r.status === 'WAITING_DOCTOR_REVIEW'
  );

  const handleStartExamination = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setDiagnosis(record.diagnosis || '');
    onUpdateRecord(record.id, { status: 'IN_EXAMINATION' });
    toast.info('Bắt đầu khám bệnh');
  };

  const handleSaveDiagnosis = () => {
    if (!selectedRecord) return;
    
    onUpdateRecord(selectedRecord.id, { 
      diagnosis,
      updatedAt: new Date().toISOString(),
    });
    
    toast.success('Đã lưu chẩn đoán');
  };

  const handleAddTest = () => {
    if (!selectedRecord || !selectedTestName) {
      toast.error('Vui lòng chọn loại xét nghiệm');
      return;
    }

    onCreateTestOrder(selectedRecord.id, selectedTestType, selectedTestName);
    onUpdateRecord(selectedRecord.id, { status: 'WAITING_TESTS' });
    
    setShowTestDialog(false);
    setSelectedTestName('');
    
    toast.success('Đã tạo chỉ định xét nghiệm');
  };

  const handleCompleteExamination = () => {
    if (!selectedRecord) return;
    
    if (!diagnosis.trim()) {
      toast.error('Vui lòng nhập chẩn đoán');
      return;
    }

    onUpdateRecord(selectedRecord.id, {
      diagnosis,
      status: 'COMPLETED_EXAMINATION',
      updatedAt: new Date().toISOString(),
    });
    
    setSelectedRecord(null);
    setDiagnosis('');
    
    toast.success('Hoàn thành khám bệnh');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Không gian làm việc - Bác sĩ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Không có hồ sơ nào cần khám
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRecords.map(record => (
                  <div
                    key={record.id}
                    className={`p-4 border rounded-lg ${
                      selectedRecord?.id === record.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span>{record.receiveCode}</span>
                          <Badge className="bg-blue-100 text-blue-800">
                            {record.patient.fullName}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>Lý do: {record.reason || 'Không có'}</div>
                          <div>Dịch vụ: {record.requestedServices.join(', ')}</div>
                          <div>Thời gian: {formatDate(record.createdAt)}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleStartExamination(record)}
                        disabled={selectedRecord?.id === record.id}
                      >
                        {selectedRecord?.id === record.id ? 'Đang khám' : 'Bắt đầu khám'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedRecord && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Khám bệnh - {selectedRecord.patient.fullName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Mã hồ sơ</div>
                <div>{selectedRecord.receiveCode}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Số điện thoại</div>
                <div>{selectedRecord.patient.phoneNumber}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Ngày sinh</div>
                <div>{new Date(selectedRecord.patient.dateOfBirth).toLocaleDateString('vi-VN')}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Giới tính</div>
                <div>{selectedRecord.patient.gender === 'male' ? 'Nam' : selectedRecord.patient.gender === 'female' ? 'Nữ' : 'Khác'}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Chẩn đoán</Label>
              <Textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Nhập chẩn đoán của bác sĩ..."
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSaveDiagnosis} variant="outline">
                Lưu chẩn đoán
              </Button>
              <Button onClick={() => setShowTestDialog(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Chỉ định xét nghiệm
              </Button>
              <Button onClick={handleCompleteExamination} className="ml-auto">
                Hoàn thành khám
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉ định xét nghiệm / hình ảnh</DialogTitle>
            <DialogDescription>
              Chọn loại và tên xét nghiệm cần thực hiện cho bệnh nhân
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Loại xét nghiệm</Label>
              <Select value={selectedTestType} onValueChange={(value: TestType) => {
                setSelectedTestType(value);
                setSelectedTestName('');
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {testTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tên xét nghiệm</Label>
              <Select value={selectedTestName} onValueChange={setSelectedTestName}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn xét nghiệm" />
                </SelectTrigger>
                <SelectContent>
                  {testTypes.find(t => t.value === selectedTestType)?.examples.map(example => (
                    <SelectItem key={example} value={example}>
                      {example}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleAddTest} className="flex-1">
                Tạo chỉ định
              </Button>
              <Button variant="outline" onClick={() => setShowTestDialog(false)}>
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
