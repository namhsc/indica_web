/**
 * Script to generate DOCX files from mock data for AI training
 * Run with: npm run generate-docx
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to convert value to string
function valueToString(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (Array.isArray(value)) {
    return value.join('; ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

// Helper function to create DOCX document from data
async function createDOCX(data: any[], headers: string[], filename: string, outputDir: string) {
  // Create table rows
  const tableRows: TableRow[] = [];
  
  // Header row
  const headerCells = headers.map(header => 
    new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: header, bold: true })],
      })],
      shading: {
        fill: 'D3D3D3',
      },
    })
  );
  tableRows.push(new TableRow({ children: headerCells }));
  
  // Data rows
  data.forEach(item => {
    const cells = headers.map(header => {
      const value = valueToString(item[header]);
      return new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: value })],
        })],
      });
    });
    tableRows.push(new TableRow({ children: cells }));
  });
  
  // Create document
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [new TextRun({ text: filename.replace('.docx', ''), bold: true, size: 32 })],
          heading: 'Heading1',
          spacing: { after: 400 },
        }),
        new Table({
          rows: tableRows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
        }),
      ],
    }],
  });
  
  // Generate and save
  const buffer = await Packer.toBuffer(doc);
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, buffer);
}

// Create output directory
const outputDir = path.join(__dirname, '..', 'training-data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateDOCXFiles() {
  console.log('Generating DOCX files for AI training...\n');

  // Import mock data
  const mockPatientsStatic = await import('../src/lib/mockPatientsStatic.ts');
  const mockPatients = await import('../src/lib/mockPatients.ts');
  const mockData = await import('../src/lib/mockData.ts');
  const authData = await import('../src/lib/authData.ts');

  // 1. Generate Patients DOCX
  try {
    await createDOCX(
      mockPatientsStatic.mockExistingPatients,
      ['id', 'fullName', 'phoneNumber', 'dateOfBirth', 'gender', 'address', 'email', 'customerId', 'cccdNumber', 'insurance', 'lastVisit', 'visitCount', 'faceId'],
      'patients.docx',
      outputDir
    );
    console.log(`✓ Generated patients.docx (${mockPatientsStatic.mockExistingPatients.length} records)`);
  } catch (error: any) {
    console.error('Error generating patients.docx:', error.message);
  }

  // 2. Generate Appointments DOCX
  try {
    await createDOCX(
      mockPatients.mockAppointments,
      ['id', 'code', 'patientName', 'phoneNumber', 'dateOfBirth', 'gender', 'email', 'address', 'customerId', 'insurance', 'appointmentDate', 'appointmentTime', 'services', 'doctor', 'doctorId', 'reason', 'status'],
      'appointments.docx',
      outputDir
    );
    console.log(`✓ Generated appointments.docx (${mockPatients.mockAppointments.length} records)`);
  } catch (error: any) {
    console.error('Error generating appointments.docx:', error.message);
  }

  // 3. Generate Medical Records DOCX
  try {
    const records = mockData.generateMockRecords();
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
    
    await createDOCX(
      flattenedRecords,
      ['id', 'receiveCode', 'patientId', 'patientFullName', 'patientPhoneNumber', 'patientDateOfBirth', 'patientGender', 'reason', 'requestedServices', 'status', 'assignedDoctorId', 'assignedDoctorName', 'assignedDoctorSpecialty', 'createdAt', 'updatedAt', 'diagnosis', 'treatmentPlanId', 'paymentStatus', 'totalAmount', 'paidAmount', 'signature', 'returnedAt', 'appointmentId', 'appointmentTime'],
      'medical_records.docx',
      outputDir
    );
    console.log(`✓ Generated medical_records.docx (${records.length} records)`);
  } catch (error: any) {
    console.error('Error generating medical_records.docx:', error.message);
  }

  // 4. Generate Test Orders DOCX
  try {
    const testOrders = mockData.generateMockTestOrders();
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
    
    await createDOCX(
      flattenedTestOrders,
      ['id', 'recordId', 'receiveCode', 'patientName', 'testType', 'testName', 'orderedBy', 'orderedAt', 'status', 'results', 'completedAt', 'completedBy'],
      'test_orders.docx',
      outputDir
    );
    console.log(`✓ Generated test_orders.docx (${testOrders.length} records)`);
  } catch (error: any) {
    console.error('Error generating test_orders.docx:', error.message);
  }

  // 5. Generate Treatment Plans DOCX
  try {
    const records = mockData.generateMockRecords();
    const treatmentPlans = mockData.generateMockTreatmentPlans(records);
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
    
    await createDOCX(
      flattenedTreatmentPlans,
      ['id', 'recordId', 'createdAt', 'createdBy', 'medications', 'instructions', 'followUpDate', 'followUpInstructions', 'notes', 'status', 'updatedAt'],
      'treatment_plans.docx',
      outputDir
    );
    console.log(`✓ Generated treatment_plans.docx (${treatmentPlans.length} records)`);
    
    // Also generate medications separately
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
    
    await createDOCX(
      allMedications,
      ['id', 'treatmentPlanId', 'recordId', 'name', 'dosage', 'frequency', 'duration', 'quantity', 'unit', 'instructions'],
      'medications.docx',
      outputDir
    );
    console.log(`✓ Generated medications.docx (${allMedications.length} records)`);
  } catch (error: any) {
    console.error('Error generating treatment_plans.docx:', error.message);
  }

  // 6. Generate Doctors DOCX
  try {
    await createDOCX(
      mockData.mockDoctors,
      ['id', 'name', 'specialty'],
      'doctors.docx',
      outputDir
    );
    console.log(`✓ Generated doctors.docx (${mockData.mockDoctors.length} records)`);
  } catch (error: any) {
    console.error('Error generating doctors.docx:', error.message);
  }

  // 7. Generate Users DOCX
  try {
    const usersWithoutPassword = authData.mockUsers.map(({ password, ...user }) => user);
    await createDOCX(
      usersWithoutPassword,
      ['id', 'username', 'fullName', 'role', 'email', 'specialty'],
      'users.docx',
      outputDir
    );
    console.log(`✓ Generated users.docx (${usersWithoutPassword.length} records)`);
  } catch (error: any) {
    console.error('Error generating users.docx:', error.message);
  }

  console.log(`\n✅ All DOCX files generated successfully in: ${outputDir}`);
  console.log('\nFiles generated:');
  console.log('  - patients.docx');
  console.log('  - appointments.docx');
  console.log('  - medical_records.docx');
  console.log('  - test_orders.docx');
  console.log('  - treatment_plans.docx');
  console.log('  - medications.docx');
  console.log('  - doctors.docx');
  console.log('  - users.docx');
}

// Run the async function
generateDOCXFiles().catch(console.error);


