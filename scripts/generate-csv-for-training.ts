/**
 * Script to generate CSV files from mock data for AI training
 * Run with: npm run generate-csv
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to escape CSV values
function escapeCSV(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = String(value);
  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

// Helper function to convert array to CSV string
function arrayToCSV(data: any[], headers: string[]): string {
  const rows: string[] = [];
  
  // Add header row
  rows.push(headers.map(h => escapeCSV(h)).join(','));
  
  // Add data rows
  data.forEach(item => {
    const row = headers.map(header => {
      const value = item[header];
      if (Array.isArray(value)) {
        return escapeCSV(value.join('; '));
      }
      if (typeof value === 'object' && value !== null) {
        return escapeCSV(JSON.stringify(value));
      }
      return escapeCSV(value);
    });
    rows.push(row.join(','));
  });
  
  return rows.join('\n');
}

// Helper function to write CSV with UTF-8 BOM for Excel compatibility
function writeCSVWithBOM(filePath: string, content: string) {
  // UTF-8 BOM: EF BB BF
  const BOM = '\uFEFF';
  const contentWithBOM = BOM + content;
  fs.writeFileSync(filePath, contentWithBOM, 'utf8');
}

// Create output directory
const outputDir = path.join(__dirname, '..', 'training-data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateCSVFiles() {
  console.log('Generating CSV files for AI training...\n');

  // Import mock data
  const mockPatientsStatic = await import('../src/lib/mockPatientsStatic.ts');
  const mockPatients = await import('../src/lib/mockPatients.ts');
  const mockData = await import('../src/lib/mockData.ts');
  const authData = await import('../src/lib/authData.ts');

// 1. Generate Patients CSV
try {
  const patientsCSV = arrayToCSV(mockPatientsStatic.mockExistingPatients, [
    'id',
    'fullName',
    'phoneNumber',
    'dateOfBirth',
    'gender',
    'address',
    'email',
    'customerId',
    'cccdNumber',
    'insurance',
    'lastVisit',
    'visitCount',
    'faceId'
  ]);
  writeCSVWithBOM(path.join(outputDir, 'patients.csv'), patientsCSV);
  console.log(`✓ Generated patients.csv (${mockPatientsStatic.mockExistingPatients.length} records)`);
} catch (error: any) {
  console.error('Error generating patients.csv:', error.message);
}

// 2. Generate Appointments CSV
try {
  const appointmentsCSV = arrayToCSV(mockPatients.mockAppointments, [
    'id',
    'code',
    'patientName',
    'phoneNumber',
    'dateOfBirth',
    'gender',
    'email',
    'address',
    'customerId',
    'insurance',
    'appointmentDate',
    'appointmentTime',
    'services',
    'doctor',
    'doctorId',
    'reason',
    'status'
  ]);
  writeCSVWithBOM(path.join(outputDir, 'appointments.csv'), appointmentsCSV);
  console.log(`✓ Generated appointments.csv (${mockPatients.mockAppointments.length} records)`);
} catch (error: any) {
  console.error('Error generating appointments.csv:', error.message);
}

// 3. Generate Medical Records CSV
try {
  const records = mockData.generateMockRecords();
  
  // Flatten records for CSV
  const flattenedRecords = records.map(record => ({
    id: record.id,
    receiveCode: record.receiveCode,
    patientId: record.patient.id,
    patientFullName: record.patient.fullName,
    patientPhoneNumber: record.patient.phoneNumber,
    patientDateOfBirth: record.patient.dateOfBirth,
    patientGender: record.patient.gender,
    reason: record.reason,
    requestedServices: record.requestedServices,
    status: record.status,
    assignedDoctorId: record.assignedDoctor?.id || '',
    assignedDoctorName: record.assignedDoctor?.name || '',
    assignedDoctorSpecialty: record.assignedDoctor?.specialty || '',
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    diagnosis: record.diagnosis || '',
    treatmentPlanId: record.treatmentPlanId || '',
    paymentStatus: record.paymentStatus,
    totalAmount: record.totalAmount || 0,
    paidAmount: record.paidAmount || 0,
    signature: record.signature || '',
    returnedAt: record.returnedAt || '',
    appointmentId: record.appointmentId || '',
    appointmentTime: record.appointmentTime || ''
  }));
  
  const recordsCSV = arrayToCSV(flattenedRecords, [
    'id',
    'receiveCode',
    'patientId',
    'patientFullName',
    'patientPhoneNumber',
    'patientDateOfBirth',
    'patientGender',
    'reason',
    'requestedServices',
    'status',
    'assignedDoctorId',
    'assignedDoctorName',
    'assignedDoctorSpecialty',
    'createdAt',
    'updatedAt',
    'diagnosis',
    'treatmentPlanId',
    'paymentStatus',
    'totalAmount',
    'paidAmount',
    'signature',
    'returnedAt',
    'appointmentId',
    'appointmentTime'
  ]);
  writeCSVWithBOM(path.join(outputDir, 'medical_records.csv'), recordsCSV);
  console.log(`✓ Generated medical_records.csv (${records.length} records)`);
} catch (error: any) {
  console.error('Error generating medical_records.csv:', error.message);
}

// 4. Generate Test Orders CSV
try {
  const testOrders = mockData.generateMockTestOrders();
  
  // Flatten test orders for CSV
  const flattenedTestOrders = testOrders.map(order => ({
    id: order.id,
    recordId: order.recordId,
    receiveCode: order.receiveCode,
    patientName: order.patientName,
    testType: order.testType,
    testName: order.testName,
    orderedBy: order.orderedBy,
    orderedAt: order.orderedAt,
    status: order.status,
    results: order.results ? JSON.stringify(order.results) : '',
    completedAt: order.completedAt || '',
    completedBy: order.completedBy || ''
  }));
  
  const testOrdersCSV = arrayToCSV(flattenedTestOrders, [
    'id',
    'recordId',
    'receiveCode',
    'patientName',
    'testType',
    'testName',
    'orderedBy',
    'orderedAt',
    'status',
    'results',
    'completedAt',
    'completedBy'
  ]);
  writeCSVWithBOM(path.join(outputDir, 'test_orders.csv'), testOrdersCSV);
  console.log(`✓ Generated test_orders.csv (${testOrders.length} records)`);
} catch (error: any) {
  console.error('Error generating test_orders.csv:', error.message);
}

// 5. Generate Treatment Plans CSV
try {
  const records = mockData.generateMockRecords();
  const treatmentPlans = mockData.generateMockTreatmentPlans(records);
  
  // Flatten treatment plans for CSV
  const flattenedTreatmentPlans = treatmentPlans.map(plan => ({
    id: plan.id,
    recordId: plan.recordId,
    createdAt: plan.createdAt,
    createdBy: plan.createdBy,
    medications: JSON.stringify(plan.medications),
    instructions: plan.instructions || '',
    followUpDate: plan.followUpDate || '',
    followUpInstructions: plan.followUpInstructions || '',
    notes: plan.notes || '',
    status: plan.status,
    updatedAt: plan.updatedAt || ''
  }));
  
  const treatmentPlansCSV = arrayToCSV(flattenedTreatmentPlans, [
    'id',
    'recordId',
    'createdAt',
    'createdBy',
    'medications',
    'instructions',
    'followUpDate',
    'followUpInstructions',
    'notes',
    'status',
    'updatedAt'
  ]);
  writeCSVWithBOM(path.join(outputDir, 'treatment_plans.csv'), treatmentPlansCSV);
  console.log(`✓ Generated treatment_plans.csv (${treatmentPlans.length} records)`);
  
  // Also generate medications separately for easier analysis
  const allMedications: any[] = [];
  treatmentPlans.forEach(plan => {
    plan.medications.forEach(med => {
      allMedications.push({
        id: med.id,
        treatmentPlanId: plan.id,
        recordId: plan.recordId,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        quantity: med.quantity,
        unit: med.unit,
        instructions: med.instructions || ''
      });
    });
  });
  
  const medicationsCSV = arrayToCSV(allMedications, [
    'id',
    'treatmentPlanId',
    'recordId',
    'name',
    'dosage',
    'frequency',
    'duration',
    'quantity',
    'unit',
    'instructions'
  ]);
  writeCSVWithBOM(path.join(outputDir, 'medications.csv'), medicationsCSV);
  console.log(`✓ Generated medications.csv (${allMedications.length} records)`);
} catch (error: any) {
  console.error('Error generating treatment_plans.csv:', error.message);
}

// 6. Generate Doctors CSV
try {
  const doctorsCSV = arrayToCSV(mockData.mockDoctors, [
    'id',
    'name',
    'specialty'
  ]);
  writeCSVWithBOM(path.join(outputDir, 'doctors.csv'), doctorsCSV);
  console.log(`✓ Generated doctors.csv (${mockData.mockDoctors.length} records)`);
} catch (error: any) {
  console.error('Error generating doctors.csv:', error.message);
}

// 7. Generate Users CSV
try {
  // Remove password for security
  const usersWithoutPassword = authData.mockUsers.map(({ password, ...user }) => user);
  const usersCSV = arrayToCSV(usersWithoutPassword, [
    'id',
    'username',
    'fullName',
    'role',
    'email',
    'specialty'
  ]);
  writeCSVWithBOM(path.join(outputDir, 'users.csv'), usersCSV);
  console.log(`✓ Generated users.csv (${usersWithoutPassword.length} records)`);
} catch (error: any) {
  console.error('Error generating users.csv:', error.message);
}

  console.log(`\n✅ All CSV files generated successfully in: ${outputDir}`);
  console.log('\nFiles generated:');
  console.log('  - patients.csv');
  console.log('  - appointments.csv');
  console.log('  - medical_records.csv');
  console.log('  - test_orders.csv');
  console.log('  - treatment_plans.csv');
  console.log('  - medications.csv');
  console.log('  - doctors.csv');
  console.log('  - users.csv');
}

// Run the async function
generateCSVFiles().catch(console.error);

