import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { TestOrder } from '../types';
import { Microscope, Upload, Plus, X } from 'lucide-react';

interface TechnicianWorkspaceProps {
  testOrders: TestOrder[];
  onUpdateTestOrder: (orderId: string, updates: Partial<TestOrder>) => void;
}

const testTypeLabels = {
  blood: 'Xét nghiệm máu',
  urine: 'Xét nghiệm nước tiểu',
  xray: 'Chụp X-quang',
  ultrasound: 'Siêu âm',
  ct: 'Chụp CT',
  mri: 'Chụp MRI',
};

const statusLabels = {
  pending: 'Chờ thực hiện',
  in_progress: 'Đang thực hiện',
  completed: 'Hoàn thành',
  reviewed: 'Đã duyệt',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  reviewed: 'bg-gray-100 text-gray-800',
};

export function TechnicianWorkspace({ testOrders, onUpdateTestOrder }: TechnicianWorkspaceProps) {
  const [selectedOrder, setSelectedOrder] = useState<TestOrder | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [resultValues, setResultValues] = useState<Record<string, string>>({});
  const [resultNotes, setResultNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const activeOrders = testOrders.filter(order => 
    order.status === 'pending' || order.status === 'in_progress'
  );

  const handleStartTest = (order: TestOrder) => {
    onUpdateTestOrder(order.id, { status: 'in_progress' });
    toast.info('Bắt đầu thực hiện xét nghiệm');
  };

  const handleOpenResultDialog = (order: TestOrder) => {
    setSelectedOrder(order);
    setResultValues(order.results?.values || {});
    setResultNotes(order.results?.notes || '');
    setUploadedFiles(order.results?.files || []);
    setShowResultDialog(true);
  };

  const addResultValue = () => {
    const key = `param_${Object.keys(resultValues).length + 1}`;
    setResultValues({ ...resultValues, [key]: '' });
  };

  const removeResultValue = (key: string) => {
    const newValues = { ...resultValues };
    delete newValues[key];
    setResultValues(newValues);
  };

  const updateResultValue = (key: string, name: string, value: string) => {
    const newValues = { ...resultValues };
    if (name) {
      delete newValues[key];
      newValues[name] = value;
    }
    setResultValues(newValues);
  };

  const handleFileUpload = () => {
    // Simulate file upload
    const mockFileName = `result_${Date.now()}.pdf`;
    setUploadedFiles([...uploadedFiles, mockFileName]);
    toast.success('Tải file thành công');
  };

  const handleSaveResult = () => {
    if (!selectedOrder) return;

    onUpdateTestOrder(selectedOrder.id, {
      status: 'completed',
      results: {
        values: resultValues,
        files: uploadedFiles,
        notes: resultNotes,
      },
      completedAt: new Date().toISOString(),
      completedBy: 'KTV. Nguyễn Thị Hoa',
    });

    setShowResultDialog(false);
    setSelectedOrder(null);
    toast.success('Đã lưu kết quả xét nghiệm');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Microscope className="h-5 w-5" />
            Không gian làm việc - Kỹ thuật viên
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Không có phiếu xét nghiệm nào cần thực hiện
              </div>
            ) : (
              <div className="space-y-3">
                {activeOrders.map(order => (
                  <div
                    key={order.id}
                    className="p-4 border rounded-lg border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <span>{order.receiveCode}</span>
                          <Badge className="bg-purple-100 text-purple-800">
                            {order.patientName}
                          </Badge>
                          <Badge className={statusColors[order.status]}>
                            {statusLabels[order.status]}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>{testTypeLabels[order.testType]}: {order.testName}</div>
                          <div>Bác sĩ chỉ định: {order.orderedBy}</div>
                          <div>Thời gian: {formatDate(order.orderedAt)}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleStartTest(order)}
                          >
                            Bắt đầu
                          </Button>
                        )}
                        {order.status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenResultDialog(order)}
                          >
                            Nhập kết quả
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nhập kết quả xét nghiệm</DialogTitle>
            <DialogDescription>
              Nhập kết quả và đính kèm file hình ảnh/PDF cho yêu cầu xét nghiệm
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Mã hồ sơ:</span> {selectedOrder.receiveCode}
                  </div>
                  <div>
                    <span className="text-gray-600">Bệnh nhân:</span> {selectedOrder.patientName}
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Xét nghiệm:</span> {selectedOrder.testName}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Giá trị xét nghiệm</Label>
                  <Button size="sm" variant="outline" onClick={addResultValue}>
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {Object.entries(resultValues).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <Input
                        placeholder="Tên chỉ số"
                        defaultValue={key.startsWith('param_') ? '' : key}
                        onBlur={(e) => {
                          if (e.target.value && e.target.value !== key) {
                            updateResultValue(key, e.target.value, value);
                          }
                        }}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Giá trị"
                        value={value}
                        onChange={(e) => {
                          const newValues = { ...resultValues };
                          newValues[key] = e.target.value;
                          setResultValues(newValues);
                        }}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeResultValue(key)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload file kết quả (PDF, hình ảnh)</Label>
                <Button onClick={handleFileUpload} variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Tải file
                </Button>
                {uploadedFiles.length > 0 && (
                  <div className="space-y-1">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <span>📄 {file}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Ghi chú</Label>
                <Textarea
                  value={resultNotes}
                  onChange={(e) => setResultNotes(e.target.value)}
                  placeholder="Nhập ghi chú về kết quả xét nghiệm..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSaveResult} className="flex-1">
                  Lưu kết quả
                </Button>
                <Button variant="outline" onClick={() => setShowResultDialog(false)}>
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
