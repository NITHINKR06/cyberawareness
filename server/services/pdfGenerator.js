import { jsPDF } from 'jspdf';
import crypto from 'crypto';

export const generateOfficialComplaintPDF = (data) => {
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
  const md5Hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex').toUpperCase();
  const sha256Hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex').toUpperCase();
  
  let currentY = 40;
  
  // Complaint Details Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Complaint Details', 20, currentY);
  currentY += 15;
  
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
  
  // Draw complaint details table manually
  complaintDetails.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 100, currentY);
    currentY += 8;
  });
  
  currentY += 10;
  
  // Transaction/Contact Details (if applicable)
  if (data.websiteUrl || data.phoneNumber || data.emailAddress) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Transaction/Contact Details', 20, currentY);
    currentY += 15;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (data.websiteUrl) {
      doc.setFont('helvetica', 'bold');
      doc.text('Website URL:', 20, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(data.websiteUrl, 100, currentY);
      currentY += 8;
    }
    if (data.phoneNumber) {
      doc.setFont('helvetica', 'bold');
      doc.text('Phone Number:', 20, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(data.phoneNumber, 100, currentY);
      currentY += 8;
    }
    if (data.emailAddress) {
      doc.setFont('helvetica', 'bold');
      doc.text('Email Address:', 20, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(data.emailAddress, 100, currentY);
      currentY += 8;
    }
    
    currentY += 10;
  }
  
  // Incident Details
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Incident Details', 20, currentY);
  currentY += 15;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.setFont('helvetica', 'bold');
  doc.text('Where did the incident occur?:', 20, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text('Online Platform', 100, currentY);
  currentY += 8;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Complaint Additional Info :', 20, currentY);
  doc.setFont('helvetica', 'normal');
  // Split long text into multiple lines
  const lines = doc.splitTextToSize(data.description, 120);
  doc.text(lines, 100, currentY);
  currentY += lines.length * 5 + 10;
  
  // Check if we need a new page
  if (currentY > pageHeight - 100) {
    doc.addPage();
    currentY = 20;
  }
  
  // Complainant Details Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Complainant Details', 20, currentY);
  currentY += 15;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const complainantDetails = [
    ['Name :', data.fullName || 'Not provided'],
    ['Mobile :', data.mobile || 'Not provided'],
    ['Gender :', data.gender || 'Not provided'],
    ['DOB :', data.dob ? new Date(data.dob).toLocaleDateString('en-IN') : 'Not provided'],
    ['Spouse :', data.spouse || 'Not applicable'],
    ['Relation with Victim :', data.relationWithVictim || 'Self'],
    ['Email :', data.personalEmail || 'Not provided']
  ];
  
  complainantDetails.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 100, currentY);
    currentY += 8;
  });
  
  currentY += 10;
  
  // Complainant Address Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Complainant Address', 20, currentY);
  currentY += 15;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const addressDetails = [
    ['House No :', data.houseNo || 'Not provided'],
    ['Street Name :', data.streetName || 'Not provided'],
    ['Colony :', data.colony || 'Not provided'],
    ['Village/Town :', data.village || 'Not provided'],
    ['Tehsil :', data.tehsil || 'Not provided'],
    ['Country :', data.country || 'India'],
    ['State :', (data.state || '').toUpperCase()],
    ['District :', data.district || 'Not provided'],
    ['Police Station :', (data.policeStation || '').toUpperCase()],
    ['Pincode :', data.pincode || 'Not provided']
  ];
  
  addressDetails.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 100, currentY);
    currentY += 8;
  });
  
  currentY += 10;
  
  // Technical Information Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Technical Information', 20, currentY);
  currentY += 15;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.setFont('helvetica', 'bold');
  doc.text('S. No:', 20, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text('1', 100, currentY);
  currentY += 8;
  
  doc.setFont('helvetica', 'bold');
  doc.text('MD5 Hash Code:', 20, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(md5Hash, 100, currentY);
  currentY += 8;
  
  doc.setFont('helvetica', 'bold');
  doc.text('SHA256 Hash Code:', 20, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(sha256Hash, 100, currentY);
  
  // Footer
  const footerY = pageHeight - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 20, footerY);
  doc.text(`Complaint ID: ${complaintNumber}`, pageWidth - 20, footerY, { align: 'right' });
  
  return {
    doc,
    complaintNumber,
    md5Hash,
    sha256Hash
  };
};

export const generateComplaintPDFBuffer = (data) => {
  const result = generateOfficialComplaintPDF(data);
  const pdfBuffer = result.doc.output('arraybuffer');
  return {
    buffer: Buffer.from(pdfBuffer),
    complaintNumber: result.complaintNumber,
    md5Hash: result.md5Hash,
    sha256Hash: result.sha256Hash
  };
};