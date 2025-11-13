# Tài Liệu API - Hệ Thống Quản Lý Phòng Khám Indica

## Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Xác Thực (Authentication)](#xác-thực-authentication)
3. [Quản Lý Bệnh Nhân](#quản-lý-bệnh-nhân)
4. [Quản Lý Hồ Sơ Khám Bệnh](#quản-lý-hồ-sơ-khám-bệnh)
5. [Quản Lý Nhân Viên](#quản-lý-nhân-viên)
6. [Quản Lý Dịch Vụ](#quản-lý-dịch-vụ)
7. [Quản Lý Gói Dịch Vụ](#quản-lý-gói-dịch-vụ)
8. [Quản Lý Thuốc](#quản-lý-thuốc)
9. [Quản Lý Chỉ Định Xét Nghiệm](#quản-lý-chỉ-định-xét-nghiệm)
10. [Quản Lý Phác Đồ Điều Trị](#quản-lý-phác-đồ-điều-trị)
11. [Quản Lý Lịch Hẹn](#quản-lý-lịch-hẹn)
12. [Quản Lý Thông Báo](#quản-lý-thông-báo)
13. [Quản Lý Chuyên Khoa](#quản-lý-chuyên-khoa)
14. [Các Endpoint Khác](#các-endpoint-khác)

---

## Tổng Quan

### Base URL
```
https://api.indica-clinic.com/v1
```

### Định dạng dữ liệu
- **Content-Type**: `application/json`
- **Encoding**: UTF-8
- **Date Format**: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)

### Xác thực
Tất cả các API (trừ đăng nhập) yêu cầu header:
```
Authorization: Bearer {access_token}
```

### Mã trạng thái HTTP
- `200`: Thành công
- `201`: Tạo mới thành công
- `400`: Lỗi dữ liệu đầu vào
- `401`: Chưa xác thực
- `403`: Không có quyền truy cập
- `404`: Không tìm thấy
- `500`: Lỗi server

---

## Xác Thực (Authentication)

### 1. Đăng Nhập
**POST** `/auth/login`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "user": {
      "id": "string",
      "username": "string",
      "fullName": "string",
      "role": "admin" | "doctor" | "nurse" | "receptionist" | "patient",
      "email": "string",
      "specialty": "string"
    }
  }
}
```

**Response 401:**
```json
{
  "success": false,
  "message": "Tên đăng nhập hoặc mật khẩu không đúng"
}
```

### 2. Làm Mới Token
**POST** `/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

### 3. Đăng Xuất
**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

---

## Quản Lý Bệnh Nhân

### 1. Tìm Kiếm Bệnh Nhân
**GET** `/patients/search`

**Query Parameters:**
- `q` (string, optional): Từ khóa tìm kiếm (tên, số điện thoại, mã khách hàng)
- `page` (number, optional): Số trang (mặc định: 1)
- `limit` (number, optional): Số lượng mỗi trang (mặc định: 10)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "string",
        "fullName": "string",
        "phoneNumber": "string",
        "dateOfBirth": "string",
        "gender": "male" | "female",
        "address": "string",
        "email": "string",
        "customerId": "string",
        "cccdNumber": "string",
        "insurance": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### 2. Lấy Thông Tin Bệnh Nhân
**GET** `/patients/{id}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "fullName": "string",
    "phoneNumber": "string",
    "dateOfBirth": "string",
    "gender": "male" | "female",
    "address": "string",
    "email": "string",
    "customerId": "string",
    "cccdNumber": "string",
    "insurance": "string"
  }
}
```

### 3. Tạo Bệnh Nhân Mới
**POST** `/patients`

**Request Body:**
```json
{
  "fullName": "string (required)",
  "phoneNumber": "string (required)",
  "dateOfBirth": "string (required, YYYY-MM-DD)",
  "gender": "male" | "female (required)",
  "address": "string (optional)",
  "email": "string (optional)",
  "customerId": "string (optional)",
  "cccdNumber": "string (required)",
  "insurance": "string (optional)",
  "provinceId": "string (required)",
  "wardId": "string (required)",
  "addressDetail": "string (optional)"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "fullName": "string",
    "phoneNumber": "string",
    "dateOfBirth": "string",
    "gender": "male" | "female",
    "address": "string",
    "email": "string",
    "customerId": "string",
    "cccdNumber": "string",
    "insurance": "string",
    "createdAt": "string"
  }
}
```

### 4. Cập Nhật Bệnh Nhân
**PUT** `/patients/{id}`

**Request Body:** (Tương tự như tạo mới, tất cả các trường đều optional)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "fullName": "string",
    "updatedAt": "string"
  }
}
```

### 5. Xóa Bệnh Nhân
**DELETE** `/patients/{id}`

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa bệnh nhân thành công"
}
```

### 6. Quét CCCD/BHYT/Nhận Diện Khuôn Mặt
**POST** `/patients/scan`

**Request Body:**
```json
{
  "type": "cccd" | "insurance" | "face",
  "image": "base64_string hoặc file"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "string",
      "fullName": "string",
      "phoneNumber": "string",
      "dateOfBirth": "string",
      "gender": "male" | "female",
      "address": "string",
      "cccdNumber": "string",
      "insurance": "string"
    }
  }
}
```

---

## Quản Lý Hồ Sơ Khám Bệnh

### 1. Lấy Danh Sách Hồ Sơ
**GET** `/medical-records`

**Query Parameters:**
- `status` (string, optional): Lọc theo trạng thái
  - `PENDING_CHECKIN`
  - `PENDING_EXAMINATION`
  - `IN_EXAMINATION`
  - `WAITING_TESTS`
  - `WAITING_DOCTOR_REVIEW`
  - `COMPLETED_EXAMINATION`
  - `RETURNED`
- `search` (string, optional): Tìm kiếm theo mã, tên, số điện thoại
- `page` (number, optional): Số trang
- `limit` (number, optional): Số lượng mỗi trang
- `dateFrom` (string, optional): Từ ngày (YYYY-MM-DD)
- `dateTo` (string, optional): Đến ngày (YYYY-MM-DD)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "string",
        "receiveCode": "string",
        "patient": {
          "id": "string",
          "fullName": "string",
          "phoneNumber": "string",
          "dateOfBirth": "string",
          "gender": "male" | "female",
          "address": "string",
          "cccdNumber": "string",
          "insurance": "string"
        },
        "reason": "string",
        "requestedServices": ["string"],
        "status": "PENDING_EXAMINATION",
        "assignedDoctor": {
          "id": "string",
          "name": "string",
          "specialty": "string"
        },
        "diagnosis": "string",
        "treatmentPlanId": "string",
        "paymentStatus": "pending" | "partial" | "completed",
        "totalAmount": 0,
        "paidAmount": 0,
        "appointmentId": "string",
        "appointmentTime": "string",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### 2. Lấy Chi Tiết Hồ Sơ
**GET** `/medical-records/{id}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "receiveCode": "string",
    "patient": { /* Patient object */ },
    "reason": "string",
    "requestedServices": ["string"],
    "status": "PENDING_EXAMINATION",
    "assignedDoctor": { /* Doctor object */ },
    "diagnosis": "string",
    "treatmentPlanId": "string",
    "paymentStatus": "pending",
    "totalAmount": 0,
    "paidAmount": 0,
    "appointmentId": "string",
    "appointmentTime": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 3. Tạo Hồ Sơ Mới (Tiếp Nhận Khách Hàng)
**POST** `/medical-records`

**Request Body:**
```json
{
  "patient": {
    "id": "string (optional, nếu đã có)",
    "fullName": "string (required)",
    "phoneNumber": "string (required)",
    "dateOfBirth": "string (required)",
    "gender": "male" | "female (required)",
    "address": "string (required)",
    "cccdNumber": "string (required)",
    "insurance": "string (optional)",
    "provinceId": "string (required)",
    "wardId": "string (required)",
    "addressDetail": "string (optional)"
  },
  "reason": "string (required)",
  "requestedServices": ["string (optional)"],
  "appointmentId": "string (optional)",
  "appointmentTime": "string (optional)"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "receiveCode": "string",
    "patient": { /* Patient object */ },
    "status": "PENDING_EXAMINATION",
    "createdAt": "string"
  }
}
```

### 4. Cập Nhật Hồ Sơ
**PUT** `/medical-records/{id}`

**Request Body:**
```json
{
  "status": "IN_EXAMINATION",
  "assignedDoctor": {
    "id": "string",
    "name": "string",
    "specialty": "string"
  },
  "diagnosis": "string",
  "paymentStatus": "completed",
  "totalAmount": 500000,
  "paidAmount": 500000
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "updatedAt": "string"
  }
}
```

### 5. Xóa Hồ Sơ
**DELETE** `/medical-records/{id}`

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa hồ sơ thành công"
}
```

### 6. Bắt Đầu Khám
**POST** `/medical-records/{id}/examine`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "IN_EXAMINATION",
    "updatedAt": "string"
  }
}
```

### 7. Import Hồ Sơ Từ Excel
**POST** `/medical-records/import`

**Request:** `multipart/form-data`
- `file`: File Excel (.xlsx, .xls)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "successCount": 10,
    "errorCount": 2,
    "errors": [
      {
        "row": 3,
        "message": "Thiếu Họ tên hoặc Số điện thoại"
      }
    ]
  }
}
```

### 8. Export Hồ Sơ Ra Excel
**GET** `/medical-records/export`

**Query Parameters:**
- `status` (string, optional): Lọc theo trạng thái
- `dateFrom` (string, optional)
- `dateTo` (string, optional)

**Response:** File Excel (.xlsx)

---

## Quản Lý Nhân Viên

### 1. Lấy Danh Sách Nhân Viên
**GET** `/staff`

**Query Parameters:**
- `role` (string, optional): Lọc theo vai trò
  - `admin`
  - `doctor`
  - `nurse`
  - `receptionist`
- `status` (string, optional): `active` | `inactive`
- `search` (string, optional): Tìm kiếm theo tên, mã, email, số điện thoại
- `page` (number, optional)
- `limit` (number, optional)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "staff": [
      {
        "id": "string",
        "fullName": "string",
        "code": "string",
        "email": "string",
        "phoneNumber": "string",
        "dateOfBirth": "string",
        "gender": "male" | "female",
        "role": "doctor",
        "specialty": "string",
        "province": "string",
        "district": "string",
        "detailedAddress": "string",
        "isActive": true,
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": { /* Pagination object */ }
  }
}
```

### 2. Lấy Chi Tiết Nhân Viên
**GET** `/staff/{id}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "fullName": "string",
    "code": "string",
    "email": "string",
    "phoneNumber": "string",
    "dateOfBirth": "string",
    "gender": "male" | "female",
    "role": "doctor",
    "specialty": "string",
    "province": "string",
    "district": "string",
    "detailedAddress": "string",
    "isActive": true,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 3. Tạo Nhân Viên Mới
**POST** `/staff`

**Request Body:**
```json
{
  "fullName": "string (required)",
  "code": "string (optional)",
  "email": "string (optional)",
  "phoneNumber": "string (required)",
  "dateOfBirth": "string (optional)",
  "gender": "male" | "female (required)",
  "role": "admin" | "doctor" | "nurse" | "receptionist (required)",
  "specialty": "string (optional, required nếu role=doctor)",
  "province": "string (optional)",
  "district": "string (optional)",
  "detailedAddress": "string (optional)",
  "isActive": true
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "fullName": "string",
    "createdAt": "string"
  }
}
```

### 4. Cập Nhật Nhân Viên
**PUT** `/staff/{id}`

**Request Body:** (Tương tự như tạo mới, tất cả các trường đều optional)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "updatedAt": "string"
  }
}
```

### 5. Xóa Nhân Viên
**DELETE** `/staff/{id}`

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa nhân viên thành công"
}
```

### 6. Import Nhân Viên Từ Excel
**POST** `/staff/import`

**Request:** `multipart/form-data`
- `file`: File Excel (.xlsx, .xls)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "successCount": 10,
    "errorCount": 2,
    "errors": [ /* Error details */ ]
  }
}
```

### 7. Export Nhân Viên Ra Excel
**GET** `/staff/export`

**Query Parameters:**
- `role` (string, optional)
- `status` (string, optional)

**Response:** File Excel (.xlsx)

---

## Quản Lý Dịch Vụ

### 1. Lấy Danh Sách Dịch Vụ
**GET** `/services`

**Query Parameters:**
- `category` (string, optional): 
  - `examination`
  - `test`
  - `imaging`
  - `procedure`
  - `other`
- `status` (string, optional): `active` | `inactive`
- `search` (string, optional): Tìm kiếm theo tên, mã
- `page` (number, optional)
- `limit` (number, optional)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "string",
        "name": "string",
        "code": "string",
        "description": "string",
        "category": "examination",
        "price": 0,
        "unit": "string",
        "duration": 0,
        "isActive": true,
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": { /* Pagination object */ }
  }
}
```

### 2. Lấy Chi Tiết Dịch Vụ
**GET** `/services/{id}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "code": "string",
    "description": "string",
    "category": "examination",
    "price": 0,
    "unit": "string",
    "duration": 0,
    "isActive": true,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 3. Tạo Dịch Vụ Mới
**POST** `/services`

**Request Body:**
```json
{
  "name": "string (required)",
  "code": "string (optional)",
  "description": "string (optional)",
  "category": "examination" | "test" | "imaging" | "procedure" | "other (required)",
  "price": 0 (required),
  "unit": "string (optional)",
  "duration": 0 (optional, phút),
  "isActive": true
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "createdAt": "string"
  }
}
```

### 4. Cập Nhật Dịch Vụ
**PUT** `/services/{id}`

**Request Body:** (Tương tự như tạo mới, tất cả các trường đều optional)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "updatedAt": "string"
  }
}
```

### 5. Xóa Dịch Vụ
**DELETE** `/services/{id}`

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa dịch vụ thành công"
}
```

### 6. Import Dịch Vụ Từ Excel
**POST** `/services/import`

**Request:** `multipart/form-data`
- `file`: File Excel (.xlsx, .xls)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "successCount": 10,
    "errorCount": 2,
    "errors": [ /* Error details */ ]
  }
}
```

### 7. Export Dịch Vụ Ra Excel
**GET** `/services/export`

**Response:** File Excel (.xlsx)

---

## Quản Lý Gói Dịch Vụ

### 1. Lấy Danh Sách Gói Dịch Vụ
**GET** `/service-packages`

**Query Parameters:**
- `status` (string, optional): `active` | `inactive`
- `search` (string, optional): Tìm kiếm theo tên, mã
- `page` (number, optional)
- `limit` (number, optional)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "packages": [
      {
        "id": "string",
        "name": "string",
        "code": "string",
        "description": "string",
        "services": ["string"],
        "price": 0,
        "discount": 0,
        "isActive": true,
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": { /* Pagination object */ }
  }
}
```

### 2. Lấy Chi Tiết Gói Dịch Vụ
**GET** `/service-packages/{id}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "code": "string",
    "description": "string",
    "services": ["string"],
    "price": 0,
    "discount": 0,
    "isActive": true,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 3. Tạo Gói Dịch Vụ Mới
**POST** `/service-packages`

**Request Body:**
```json
{
  "name": "string (required)",
  "code": "string (optional)",
  "description": "string (optional)",
  "services": ["string (required, ít nhất 1 dịch vụ)"],
  "price": 0 (required),
  "discount": 0 (optional, 0-100),
  "isActive": true
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "createdAt": "string"
  }
}
```

### 4. Cập Nhật Gói Dịch Vụ
**PUT** `/service-packages/{id}`

**Request Body:** (Tương tự như tạo mới, tất cả các trường đều optional)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "updatedAt": "string"
  }
}
```

### 5. Xóa Gói Dịch Vụ
**DELETE** `/service-packages/{id}`

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa gói dịch vụ thành công"
}
```

### 6. Import Gói Dịch Vụ Từ Excel
**POST** `/service-packages/import`

**Request:** `multipart/form-data`
- `file`: File Excel (.xlsx, .xls)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "successCount": 10,
    "errorCount": 2,
    "errors": [ /* Error details */ ]
  }
}
```

### 7. Export Gói Dịch Vụ Ra Excel
**GET** `/service-packages/export`

**Response:** File Excel (.xlsx)

---

## Quản Lý Thuốc

### 1. Lấy Danh Sách Thuốc
**GET** `/medications`

**Query Parameters:**
- `category` (string, optional):
  - `antibiotic`
  - `analgesic`
  - `anti_inflammatory`
  - `gastrointestinal`
  - `respiratory`
  - `cardiovascular`
  - `vitamin`
  - `dermatological`
  - `ophthalmic`
  - `other`
- `status` (string, optional): `active` | `inactive`
- `search` (string, optional): Tìm kiếm theo tên, mã, hoạt chất, nhà sản xuất
- `page` (number, optional)
- `limit` (number, optional)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "medications": [
      {
        "id": "string",
        "name": "string",
        "code": "string",
        "activeIngredient": "string",
        "strength": "string",
        "unit": "string",
        "category": "antibiotic",
        "manufacturer": "string",
        "drugGroup": "string",
        "description": "string",
        "indications": "string",
        "contraindications": "string",
        "sideEffects": "string",
        "isActive": true,
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": { /* Pagination object */ }
  }
}
```

### 2. Lấy Chi Tiết Thuốc
**GET** `/medications/{id}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "code": "string",
    "activeIngredient": "string",
    "strength": "string",
    "unit": "string",
    "category": "antibiotic",
    "manufacturer": "string",
    "drugGroup": "string",
    "description": "string",
    "indications": "string",
    "contraindications": "string",
    "sideEffects": "string",
    "isActive": true,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 3. Tạo Thuốc Mới
**POST** `/medications`

**Request Body:**
```json
{
  "name": "string (required)",
  "code": "string (optional)",
  "activeIngredient": "string (optional)",
  "strength": "string (optional)",
  "unit": "string (required)",
  "category": "antibiotic" | "analgesic" | ... (required),
  "manufacturer": "string (optional)",
  "drugGroup": "string (optional)",
  "description": "string (optional)",
  "indications": "string (optional)",
  "contraindications": "string (optional)",
  "sideEffects": "string (optional)",
  "isActive": true
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "createdAt": "string"
  }
}
```

### 4. Cập Nhật Thuốc
**PUT** `/medications/{id}`

**Request Body:** (Tương tự như tạo mới, tất cả các trường đều optional)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "updatedAt": "string"
  }
}
```

### 5. Xóa Thuốc
**DELETE** `/medications/{id}`

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa thuốc thành công"
}
```

### 6. Import Thuốc Từ Excel
**POST** `/medications/import`

**Request:** `multipart/form-data`
- `file`: File Excel (.xlsx, .xls)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "successCount": 10,
    "errorCount": 2,
    "errors": [ /* Error details */ ]
  }
}
```

### 7. Export Thuốc Ra Excel
**GET** `/medications/export`

**Response:** File Excel (.xlsx)

---

## Quản Lý Chỉ Định Xét Nghiệm

### 1. Lấy Danh Sách Chỉ Định Xét Nghiệm
**GET** `/test-orders`

**Query Parameters:**
- `recordId` (string, optional): Lọc theo hồ sơ
- `status` (string, optional): `pending` | `in_progress` | `completed` | `reviewed`
- `page` (number, optional)
- `limit` (number, optional)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "testOrders": [
      {
        "id": "string",
        "recordId": "string",
        "receiveCode": "string",
        "patientName": "string",
        "testType": "blood" | "urine" | "xray" | "ultrasound" | "ct" | "mri",
        "testName": "string",
        "orderedBy": "string",
        "orderedAt": "string",
        "status": "pending",
        "results": {
          "values": {},
          "files": ["string"],
          "notes": "string"
        },
        "completedAt": "string",
        "completedBy": "string"
      }
    ],
    "pagination": { /* Pagination object */ }
  }
}
```

### 2. Tạo Chỉ Định Xét Nghiệm
**POST** `/test-orders`

**Request Body:**
```json
{
  "recordId": "string (required)",
  "testType": "blood" | "urine" | "xray" | "ultrasound" | "ct" | "mri (required)",
  "testName": "string (required)"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "recordId": "string",
    "receiveCode": "string",
    "testType": "blood",
    "testName": "string",
    "status": "pending",
    "orderedAt": "string"
  }
}
```

### 3. Cập Nhật Chỉ Định Xét Nghiệm
**PUT** `/test-orders/{id}`

**Request Body:**
```json
{
  "status": "completed",
  "results": {
    "values": {
      "glucose": "5.5",
      "cholesterol": "200"
    },
    "files": ["url1", "url2"],
    "notes": "Kết quả bình thường"
  },
  "completedAt": "string",
  "completedBy": "string"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "completed",
    "updatedAt": "string"
  }
}
```

### 4. Xóa Chỉ Định Xét Nghiệm
**DELETE** `/test-orders/{id}`

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa chỉ định xét nghiệm thành công"
}
```

---

## Quản Lý Phác Đồ Điều Trị

### 1. Lấy Danh Sách Phác Đồ Điều Trị
**GET** `/treatment-plans`

**Query Parameters:**
- `recordId` (string, optional): Lọc theo hồ sơ
- `status` (string, optional): `active` | `completed` | `cancelled`
- `page` (number, optional)
- `limit` (number, optional)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "treatmentPlans": [
      {
        "id": "string",
        "recordId": "string",
        "createdAt": "string",
        "createdBy": "string",
        "medications": [
          {
            "id": "string",
            "name": "string",
            "dosage": "string",
            "frequency": "string",
            "duration": "string",
            "quantity": 0,
            "unit": "string",
            "instructions": "string"
          }
        ],
        "instructions": "string",
        "followUpDate": "string",
        "followUpInstructions": "string",
        "notes": "string",
        "status": "active",
        "updatedAt": "string",
        "reminders": [
          {
            "id": "string",
            "type": "vital_sign" | "activity" | "medication" | "diet" | "exercise" | "other",
            "title": "string",
            "description": "string",
            "field": "string",
            "frequency": "daily" | "weekly" | "custom",
            "enabled": true,
            "priority": "low" | "medium" | "high"
          }
        ]
      }
    ],
    "pagination": { /* Pagination object */ }
  }
}
```

### 2. Lấy Chi Tiết Phác Đồ Điều Trị
**GET** `/treatment-plans/{id}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "recordId": "string",
    "createdAt": "string",
    "createdBy": "string",
    "medications": [ /* Medication array */ ],
    "instructions": "string",
    "followUpDate": "string",
    "followUpInstructions": "string",
    "notes": "string",
    "status": "active",
    "updatedAt": "string",
    "reminders": [ /* Reminder array */ ]
  }
}
```

### 3. Tạo Phác Đồ Điều Trị
**POST** `/treatment-plans`

**Request Body:**
```json
{
  "recordId": "string (required)",
  "medications": [
    {
      "name": "string (required)",
      "dosage": "string (required)",
      "frequency": "string (required)",
      "duration": "string (required)",
      "quantity": 0 (required),
      "unit": "string (required)",
      "instructions": "string (optional)"
    }
  ],
  "instructions": "string (optional)",
  "followUpDate": "string (optional, YYYY-MM-DD)",
  "followUpInstructions": "string (optional)",
  "notes": "string (optional)",
  "reminders": [
    {
      "type": "vital_sign" | "activity" | "medication" | "diet" | "exercise" | "other (required)",
      "title": "string (required)",
      "description": "string (optional)",
      "field": "string (optional, required nếu type=vital_sign)",
      "frequency": "daily" | "weekly" | "custom (optional)",
      "enabled": true,
      "priority": "low" | "medium" | "high (optional)"
    }
  ]
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "recordId": "string",
    "createdAt": "string",
    "createdBy": "string"
  }
}
```

### 4. Cập Nhật Phác Đồ Điều Trị
**PUT** `/treatment-plans/{id}`

**Request Body:** (Tương tự như tạo mới, tất cả các trường đều optional)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "updatedAt": "string"
  }
}
```

### 5. Xóa Phác Đồ Điều Trị
**DELETE** `/treatment-plans/{id}`

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa phác đồ điều trị thành công"
}
```

### 6. Cập Nhật Tiến Độ Điều Trị
**POST** `/treatment-plans/{id}/progress`

**Request Body:**
```json
{
  "medicationId": "string (optional)",
  "date": "string (required, YYYY-MM-DD)",
  "status": "taken" | "missed" | "skipped (optional)",
  "notes": "string (optional)",
  "patientFeedback": "string (optional)",
  "vitalSigns": {
    "bloodPressure": {
      "systolic": 120,
      "diastolic": 80,
      "time": "morning"
    },
    "bloodSugar": {
      "value": 5.5,
      "type": "fasting",
      "time": "morning"
    },
    "heartRate": 72,
    "weight": 65.5,
    "temperature": 36.5,
    "oxygenSaturation": 98,
    "painLevel": 3
  }
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "treatmentPlanId": "string",
    "date": "string",
    "createdAt": "string"
  }
}
```

---

## Quản Lý Lịch Hẹn

### 1. Lấy Danh Sách Lịch Hẹn
**GET** `/appointments`

**Query Parameters:**
- `status` (string, optional): `pending` | `confirmed` | `cancelled` | `completed`
- `dateFrom` (string, optional): Từ ngày (YYYY-MM-DD)
- `dateTo` (string, optional): Đến ngày (YYYY-MM-DD)
- `doctorId` (string, optional): Lọc theo bác sĩ
- `search` (string, optional): Tìm kiếm theo tên, số điện thoại
- `page` (number, optional)
- `limit` (number, optional)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "string",
        "code": "string",
        "patientName": "string",
        "phoneNumber": "string",
        "dateOfBirth": "string",
        "gender": "male" | "female",
        "email": "string",
        "address": "string",
        "customerId": "string",
        "insurance": "string",
        "appointmentDate": "string",
        "appointmentTime": "string",
        "services": ["string"],
        "doctor": "string",
        "doctorId": "string",
        "reason": "string",
        "status": "pending",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": { /* Pagination object */ }
  }
}
```

### 2. Lấy Chi Tiết Lịch Hẹn
**GET** `/appointments/{id}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "code": "string",
    "patientName": "string",
    "phoneNumber": "string",
    "dateOfBirth": "string",
    "gender": "male" | "female",
    "email": "string",
    "address": "string",
    "customerId": "string",
    "insurance": "string",
    "appointmentDate": "string",
    "appointmentTime": "string",
    "services": ["string"],
    "doctor": "string",
    "doctorId": "string",
    "reason": "string",
    "status": "pending",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 3. Tạo Lịch Hẹn Mới
**POST** `/appointments`

**Request Body:**
```json
{
  "patientName": "string (required)",
  "phoneNumber": "string (required)",
  "dateOfBirth": "string (required)",
  "gender": "male" | "female (required)",
  "email": "string (optional)",
  "address": "string (optional)",
  "customerId": "string (optional)",
  "insurance": "string (optional)",
  "appointmentDate": "string (required, YYYY-MM-DD)",
  "appointmentTime": "string (required, HH:mm)",
  "services": ["string (optional)"],
  "doctorId": "string (required)",
  "reason": "string (optional)"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "code": "string",
    "appointmentDate": "string",
    "appointmentTime": "string",
    "createdAt": "string"
  }
}
```

### 4. Cập Nhật Lịch Hẹn
**PUT** `/appointments/{id}`

**Request Body:**
```json
{
  "appointmentDate": "string",
  "appointmentTime": "string",
  "status": "confirmed" | "cancelled" | "completed",
  "doctorId": "string",
  "services": ["string"]
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "updatedAt": "string"
  }
}
```

### 5. Xóa Lịch Hẹn
**DELETE** `/appointments/{id}`

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa lịch hẹn thành công"
}
```

---

## Quản Lý Thông Báo

### 1. Lấy Danh Sách Thông Báo
**GET** `/notifications`

**Query Parameters:**
- `read` (boolean, optional): Lọc theo đã đọc/chưa đọc
- `type` (string, optional): `info` | `success` | `warning` | `error`
- `page` (number, optional)
- `limit` (number, optional)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "string",
        "title": "string",
        "message": "string",
        "type": "info",
        "read": false,
        "createdAt": "string",
        "relatedId": "string",
        "relatedType": "appointment" | "treatment" | "record"
      }
    ],
    "pagination": { /* Pagination object */ }
  }
}
```

### 2. Đánh Dấu Đã Đọc
**PUT** `/notifications/{id}/read`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "read": true
  }
}
```

### 3. Đánh Dấu Tất Cả Đã Đọc
**PUT** `/notifications/read-all`

**Response 200:**
```json
{
  "success": true,
  "message": "Đã đánh dấu tất cả thông báo là đã đọc"
}
```

### 4. Xóa Thông Báo
**DELETE** `/notifications/{id}`

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa thông báo thành công"
}
```

---

## Quản Lý Chuyên Khoa

### 1. Lấy Danh Sách Chuyên Khoa
**GET** `/specialties`

**Query Parameters:**
- `status` (string, optional): `active` | `inactive`
- `search` (string, optional): Tìm kiếm theo tên
- `page` (number, optional)
- `limit` (number, optional)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "specialties": [
      {
        "id": "string",
        "name": "string",
        "code": "string",
        "description": "string",
        "isActive": true,
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": { /* Pagination object */ }
  }
}
```

### 2. Tạo Chuyên Khoa Mới
**POST** `/specialties`

**Request Body:**
```json
{
  "name": "string (required)",
  "code": "string (optional)",
  "description": "string (optional)",
  "isActive": true
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "createdAt": "string"
  }
}
```

### 3. Cập Nhật Chuyên Khoa
**PUT** `/specialties/{id}`

**Request Body:** (Tương tự như tạo mới, tất cả các trường đều optional)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "updatedAt": "string"
  }
}
```

### 4. Xóa Chuyên Khoa
**DELETE** `/specialties/{id}`

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa chuyên khoa thành công"
}
```

---

## Các Endpoint Khác

### 1. Lấy Dữ Liệu Hành Chính (Tỉnh/Thành phố, Xã/Phường)
**GET** `/administrative/provinces`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "provinces": [
      {
        "id": "string",
        "name": "string",
        "wards": [
          {
            "id": "string",
            "name": "string",
            "sortOrder": "string"
          }
        ]
      }
    ]
  }
}
```

### 2. Tạo QR Code Cho Khách Tự Nhập
**POST** `/booking/qr-code`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "url": "string",
    "qrCode": "base64_image_string"
  }
}
```

### 3. Lấy Thống Kê Dashboard
**GET** `/dashboard/stats`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "totalRecords": 0,
    "pendingCheckin": 0,
    "pendingExamination": 0,
    "inProgress": 0,
    "completed": 0,
    "returned": 0,
    "todayRecords": 0
  }
}
```

---

## Lưu Ý Quan Trọng

### Validation
- Tất cả các trường `required` phải được cung cấp
- Định dạng ngày tháng: `YYYY-MM-DD` hoặc `YYYY-MM-DDTHH:mm:ss.sssZ`
- Số điện thoại: Định dạng số, tối thiểu 10 ký tự
- Email: Định dạng email hợp lệ
- Giá tiền: Số dương, đơn vị VND

### Phân Quyền
- **Admin**: Toàn quyền
- **Doctor**: Xem và cập nhật hồ sơ, tạo phác đồ điều trị, chỉ định xét nghiệm
- **Nurse**: Xem hồ sơ, cập nhật kết quả xét nghiệm
- **Receptionist**: Tạo và quản lý hồ sơ, lịch hẹn
- **Patient**: Xem thông tin cá nhân, lịch hẹn, phác đồ điều trị

### Rate Limiting
- Tối đa 100 requests/phút cho mỗi user
- Tối đa 1000 requests/giờ cho mỗi IP

### Error Response Format
```json
{
  "success": false,
  "message": "Mô tả lỗi",
  "errors": [
    {
      "field": "fieldName",
      "message": "Chi tiết lỗi"
    }
  ]
}
```

---

## Changelog

### Version 1.0.0 (2024-01-01)
- Initial API documentation
- Các endpoint cơ bản cho quản lý phòng khám

---

**Tài liệu này được tạo tự động dựa trên codebase của hệ thống. Vui lòng cập nhật khi có thay đổi.**

