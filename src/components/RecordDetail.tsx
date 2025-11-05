import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { MedicalRecord, TestOrder } from '../types';
import { X, User, Stethoscope, FileText, Calendar } from 'lucide-react';

interface RecordDetailProps {
  record: MedicalRecord | null;
  testOrders: TestOrder[];
  onClose: () => void;
}

const statusLabels = {
  PENDING_EXAMINATION: 'Chờ khám',
  IN_EXAMINATION: 'Đang khám',
  WAITING_TESTS: 'Chờ xét nghiệm',
  WAITING_DOCTOR_REVIEW: 'Chờ bác sĩ duyệt',
  COMPLETED_EXAMINATION: 'Hoàn thành',
  RETURNED: 'Đã trả',
};

const statusColors = {
  PENDING_EXAMINATION: 'bg-yellow-100 text-yellow-800',
  IN_EXAMINATION: 'bg-blue-100 text-blue-800',
  WAITING_TESTS: 'bg-orange-100 text-orange-800',
  WAITING_DOCTOR_REVIEW: 'bg-purple-100 text-purple-800',
  COMPLETED_EXAMINATION: 'bg-green-100 text-green-800',
  RETURNED: 'bg-gray-100 text-gray-800',
};

export function RecordDetail({ record, testOrders, onClose }: RecordDetailProps) {
  if (!record) return null;

  const recordTestOrders = testOrders.filter(t => t.recordId === record.id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <Dialog open={!!record} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Chi tiết hồ sơ - {record.receiveCode}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Xem đầy đủ thông tin bệnh nhân, chẩn đoán và kết quả xét nghiệm
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Thông tin bệnh nhân
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Họ và tên</div>
                  <div>{record.patient.fullName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Số điện thoại</div>
                  <div>{record.patient.phoneNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Ngày sinh</div>
                  <div>{new Date(record.patient.dateOfBirth).toLocaleDateString('vi-VN')}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Giới tính</div>
                  <div>
                    {record.patient.gender === 'male' ? 'Nam' : 
                     record.patient.gender === 'female' ? 'Nữ' : 'Khác'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Stethoscope className="h-4 w-4" />
                Thông tin khám bệnh
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Trạng thái</div>
                <Badge className={statusColors[record.status]}>
                  {statusLabels[record.status]}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-gray-600">Bác sĩ phụ trách</div>
                <div>
                  {record.assignedDoctor ? (
                    <>
                      {record.assignedDoctor.name} - {record.assignedDoctor.specialty}
                    </>
                  ) : (
                    <span className="text-gray-400">Chưa gán</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Lý do khám</div>
                <div>{record.reason || 'Không có'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Dịch vụ yêu cầu</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {record.requestedServices.map((service, index) => (
                    <Badge key={index} variant="outline">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
              {record.diagnosis && (
                <div>
                  <div className="text-sm text-gray-600">Chẩn đoán</div>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    {record.diagnosis}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Orders */}
          {recordTestOrders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Xét nghiệm / Hình ảnh ({recordTestOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recordTestOrders.map(test => (
                    <div key={test.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div>{test.testName}</div>
                          <div className="text-sm text-gray-600">
                            Chỉ định bởi: {test.orderedBy}
                          </div>
                          {test.results && (
                            <div className="mt-2 space-y-1">
                              {test.results.values && Object.entries(test.results.values).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                  <span className="text-gray-600">{key}:</span> {value}
                                </div>
                              ))}
                              {test.results.notes && (
                                <div className="text-sm text-gray-600">
                                  Ghi chú: {test.results.notes}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <Badge
                          className={
                            test.status === 'completed' || test.status === 'reviewed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {test.status === 'pending' && 'Chờ thực hiện'}
                          {test.status === 'in_progress' && 'Đang thực hiện'}
                          {test.status === 'completed' && 'Hoàn thành'}
                          {test.status === 'reviewed' && 'Đã duyệt'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment & Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng chi phí:</span>
                  <span>{formatCurrency(record.totalAmount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Đã thanh toán:</span>
                  <span>{formatCurrency(record.paidAmount || 0)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Còn lại:</span>
                  <span className={
                    (record.totalAmount || 0) - (record.paidAmount || 0) > 0
                      ? 'text-red-600'
                      : 'text-green-600'
                  }>
                    {formatCurrency((record.totalAmount || 0) - (record.paidAmount || 0))}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  Thời gian
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <div className="text-sm text-gray-600">Tiếp nhận</div>
                  <div className="text-sm">{formatDate(record.createdAt)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Cập nhật</div>
                  <div className="text-sm">{formatDate(record.updatedAt)}</div>
                </div>
                {record.returnedAt && (
                  <div>
                    <div className="text-sm text-gray-600">Trả hồ sơ</div>
                    <div className="text-sm">{formatDate(record.returnedAt)}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
