# Training Data for AI

This directory contains CSV files generated from mock data for AI training purposes.

## Files Generated

### 1. patients.csv
Contains patient information:
- **Records**: 500 patients
- **Columns**: id, fullName, phoneNumber, dateOfBirth, gender, address, email, customerId, cccdNumber, insurance, lastVisit, visitCount, faceId

### 2. appointments.csv
Contains appointment bookings:
- **Records**: 200 appointments
- **Columns**: id, code, patientName, phoneNumber, dateOfBirth, gender, email, address, customerId, insurance, appointmentDate, appointmentTime, services, doctor, doctorId, reason, status

### 3. medical_records.csv
Contains medical examination records:
- **Records**: 205 records
- **Columns**: id, receiveCode, patientId, patientFullName, patientPhoneNumber, patientDateOfBirth, patientGender, reason, requestedServices, status, assignedDoctorId, assignedDoctorName, assignedDoctorSpecialty, createdAt, updatedAt, diagnosis, treatmentPlanId, paymentStatus, totalAmount, paidAmount, signature, returnedAt, appointmentId, appointmentTime

### 4. test_orders.csv
Contains laboratory test orders:
- **Records**: 3 test orders
- **Columns**: id, recordId, receiveCode, patientName, testType, testName, orderedBy, orderedAt, status, results, completedAt, completedBy

### 5. treatment_plans.csv
Contains treatment plans for patients:
- **Records**: 54 treatment plans
- **Columns**: id, recordId, createdAt, createdBy, medications (JSON), instructions, followUpDate, followUpInstructions, notes, status, updatedAt

### 6. medications.csv
Contains individual medications from treatment plans:
- **Records**: 130 medications
- **Columns**: id, treatmentPlanId, recordId, name, dosage, frequency, duration, quantity, unit, instructions

### 7. doctors.csv
Contains doctor information:
- **Records**: 31 doctors
- **Columns**: id, name, specialty

### 8. users.csv
Contains system users (passwords removed for security):
- **Records**: 4 users
- **Columns**: id, username, fullName, role, email, specialty

## Data Relationships

- **patients** → **appointments** (via patientName/phoneNumber)
- **appointments** → **medical_records** (via appointmentId)
- **medical_records** → **treatment_plans** (via recordId)
- **treatment_plans** → **medications** (via treatmentPlanId)
- **medical_records** → **test_orders** (via recordId)
- **medical_records** → **doctors** (via assignedDoctorId)

## Usage

These CSV files can be used for:
- AI/ML model training
- Data analysis
- System testing
- Documentation purposes

## Regenerating Data

To regenerate these CSV files, run:
```bash
npm run generate-csv
```

## Notes

- All data is mock/synthetic data generated for training purposes
- Patient privacy: All personal information is fictional
- Passwords are excluded from users.csv for security
- Arrays and objects are stored as JSON strings or semicolon-separated values
- Dates are in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)

