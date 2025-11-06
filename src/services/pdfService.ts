import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ComplaintData {
  // Scam details
  scamType: string;
  description: string;
  url?: string;
  phoneNumber?: string;
  email?: string;
  severity: string;
  
  // Personal details
  fullName: string;
  mobile: string;
  gender: string;
  dob?: string;
  spouse?: string;
  relationWithVictim?: string;
  emailAddress?: string;
  
  // Address details
  houseNo?: string;
  streetName: string;
  colony?: string;
  village: string;
  tehsil: string;
  district: string;
  state: string;
  country: string;
  policeStation: string;
  pincode: string;
}

export const generateOfficialComplaintPDF = (data: ComplaintData): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Set font
  doc.setFont('helvetica');
  
  // Header - Government Complaint Report
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('GOVERNMENT COMPLAINT REPORT', pageWidth / 2, 20, { align: 'center' });
  
  // Add complaint type
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Complaint Type : Report & Track', pageWidth - 20, 15, { align: 'right' });
  
  // Generate unique complaint number
  const complaintNumber = `CMP${Date.now().toString().slice(-8)}`;
  const md5Hash = generateMD5Hash(JSON.stringify(data));
  const sha256Hash = generateSHA256Hash(JSON.stringify(data));
  
  // Complaint Details Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Complaint Details', 20, 40);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const complaintDetails = [
    ['Acknowledgement Number :', complaintNumber],
    ['Category of Complaint :', 'Online Financial Fraud'],
    ['Sub Category of Complaint :', data.scamType],
    ['Complaint Date :', new Date().toLocaleDateString('en-IN')],
    ['Complaint Time :', new Date().toLocaleTimeString('en-IN')],
    ['Incident Date & Time :', new Date().toLocaleString('en-IN')],
  ];
  
  // Draw complaint details table
  doc.autoTable({
    startY: 50,
    head: [['Field', 'Value']],
    body: complaintDetails,
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240] },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 80 }
    },
    margin: { left: 20, right: 20 }
  });
  
  let finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Debited Transaction Details (if applicable)
  if (data.url || data.phoneNumber || data.email) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Transaction/Contact Details', 20, finalY);
    
    const transactionData = [];
    if (data.url) transactionData.push(['Website URL:', data.url]);
    if (data.phoneNumber) transactionData.push(['Phone Number:', data.phoneNumber]);
    if (data.email) transactionData.push(['Email Address:', data.email]);
    
    doc.autoTable({
      startY: finalY + 10,
      body: transactionData,
      theme: 'grid',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 80 }
      },
      margin: { left: 20, right: 20 }
    });
    
    finalY = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Incident Details
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Incident Details', 20, finalY);
  
  const incidentDetails = [
    ['Where did the incident occur?:', 'Online Platform'],
    ['Complaint Additional Info :', data.description]
  ];
  
  doc.autoTable({
    startY: finalY + 10,
    body: incidentDetails,
    theme: 'grid',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 80 }
    },
    margin: { left: 20, right: 20 }
  });
  
  finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Check if we need a new page
  if (finalY > pageHeight - 100) {
    doc.addPage();
    finalY = 20;
  }
  
  // Complainant Details Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Complainant Details', 20, finalY);
  
  const complainantDetails = [
    ['Name :', data.fullName],
    ['Mobile :', data.mobile],
    ['Gender :', data.gender],
    ['DOB :', data.dob || 'Not provided'],
    ['Spouse :', data.spouse || 'Not applicable'],
    ['Relation with Victim :', data.relationWithVictim || 'Self'],
    ['Email :', data.emailAddress || 'Not provided']
  ];
  
  doc.autoTable({
    startY: finalY + 10,
    body: complainantDetails,
    theme: 'grid',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 80 }
    },
    margin: { left: 20, right: 20 }
  });
  
  finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Complainant Address Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Complainant Address', 20, finalY);
  
  const addressDetails = [
    ['House No :', data.houseNo || 'Not provided'],
    ['Street Name :', data.streetName],
    ['Colony :', data.colony || 'Not provided'],
    ['Village/Town :', data.village],
    ['Tehsil :', data.tehsil],
    ['Country :', data.country],
    ['State :', data.state.toUpperCase()],
    ['District :', data.district],
    ['Police Station :', data.policeStation.toUpperCase()],
    ['Pincode :', data.pincode]
  ];
  
  doc.autoTable({
    startY: finalY + 10,
    body: addressDetails,
    theme: 'grid',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 80 }
    },
    margin: { left: 20, right: 20 }
  });
  
  finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Technical Information Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Technical Information', 20, finalY);
  
  const technicalInfo = [
    ['S. No:', '1'],
    ['MD5 Hash Code:', md5Hash],
    ['SHA256 Hash Code:', sha256Hash]
  ];
  
  doc.autoTable({
    startY: finalY + 10,
    body: technicalInfo,
    theme: 'grid',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 80 }
    },
    margin: { left: 20, right: 20 }
  });
  
  // Footer
  const footerY = pageHeight - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 20, footerY);
  doc.text(`Complaint ID: ${complaintNumber}`, pageWidth - 20, footerY, { align: 'right' });
  
  return doc;
};

// Simple hash generation functions (for demo purposes)
const generateMD5Hash = (input: string): string => {
  // This is a simplified hash function for demo purposes
  // In production, use a proper crypto library
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(32, '0');
};

const generateSHA256Hash = (input: string): string => {
  // This is a simplified hash function for demo purposes
  // In production, use a proper crypto library
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 7) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(64, '0');
};

export const downloadComplaintPDF = (data: ComplaintData, filename?: string) => {
  const doc = generateOfficialComplaintPDF(data);
  const defaultFilename = `complaint_${Date.now().toString().slice(-8)}.pdf`;
  doc.save(filename || defaultFilename);
};

export const getComplaintPDFBlob = (data: ComplaintData): Blob => {
  const doc = generateOfficialComplaintPDF(data);
  return doc.output('blob');
};
