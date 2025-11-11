import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, CheckCircle, Send, MapPin, Phone, Shield, Download, Map, ExternalLink, Globe } from 'lucide-react';
import { submitScamReport, reportService } from '../services/backendApi';
import MapPicker from './MapPicker';

export default function ReportScam() {
  const { t } = useTranslation();
  // const { user } = useAuth(); // Keep for potential future use
  const [formData, setFormData] = useState({
    scamType: '',
    description: '',
    url: '',
    phoneNumber: '',
    email: '',
    severity: 'medium',
    // Location details
    village: '',
    tehsil: '',
    policeStation: '',
    pincode: '',
    houseNo: '',
    streetName: '',
    colony: '',
    district: '',
    state: 'Karnataka',
    country: 'India',
    // Personal details for complaint
    fullName: '',
    mobile: '',
    gender: '',
    dob: '',
    spouse: '',
    relationWithVictim: '',
    emailAddress: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [showMap, setShowMap] = useState(false); // State to control map visibility
  const [submittedReport, setSubmittedReport] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [pincodeSuccess, setPincodeSuccess] = useState<string | null>(null);
  const pincodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [formKey, setFormKey] = useState(0);

  const scamTypes = [
    'Phishing Email', 'Fake Website', 'Phone Scam', 'SMS Scam', 'Social Media Scam',
    'Investment Fraud', 'Romance Scam', 'Tech Support Scam', 'UPI Related Frauds',
    'Online Financial Fraud', 'Other',
  ];

  const genders = ['Male', 'Female', 'Other'];

  // Debug: Log form data changes
  useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);
  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh', 'Puducherry'
  ];

  const nearbyStations = [
    { name: 'Cyber Crime Police Station', phone: '1800-419-3737', type: 'cyber' },
    { name: 'Local Police Station', phone: '100', type: 'police' },
    { name: 'National Cyber Crime Helpline', phone: '1930', type: 'helpline' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        scamType: formData.scamType,
        description: formData.description,
        websiteUrl: formData.url || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        emailAddress: formData.email || undefined,
        severity: formData.severity,
        fullName: formData.fullName || undefined,
        mobile: formData.mobile || undefined,
        gender: formData.gender || undefined,
        dob: formData.dob || undefined,
        spouse: formData.spouse || undefined,
        relationWithVictim: formData.relationWithVictim || undefined,
        personalEmail: formData.emailAddress || undefined,
        houseNo: formData.houseNo || undefined,
        streetName: formData.streetName || undefined,
        colony: formData.colony || undefined,
        village: formData.village || undefined,
        tehsil: formData.tehsil || undefined,
        district: formData.district || undefined,
        state: formData.state || undefined,
        country: formData.country || undefined,
        policeStation: formData.policeStation || undefined,
        pincode: formData.pincode || undefined,
      };

      const response = await submitScamReport(payload);
      setSubmittedReport(response);

      setSubmitted(true);
      setFormData({
        scamType: '', description: '', url: '', phoneNumber: '', email: '', severity: 'medium',
        village: '', tehsil: '', policeStation: '', pincode: '', houseNo: '', streetName: '',
        colony: '', district: '', state: 'Karnataka', country: 'India', fullName: '', mobile: '',
        gender: '', dob: '', spouse: '', relationWithVictim: '', emailAddress: '',
      });
    } catch (err: any) {
      console.error('Report submission failed:', err);
      if (err.code === 'ERR_NETWORK') {
        alert('Unable to submit report. Please check if the server is running on port 5000.');
      } else {
        alert(err.response?.data?.error || 'Failed to submit report. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!submittedReport?.reportId) return;
    
    try {
      const blob = await reportService.downloadPDF(submittedReport.reportId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `complaint_${submittedReport.complaintNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('PDF download failed:', err);
      if (err.code === 'ERR_NETWORK') {
        alert('Unable to download PDF. Please check if the server is running on port 5000.');
      } else {
        alert(err.response?.data?.error || 'Failed to download PDF. Please try again.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newValue = e.target.value;
    const fieldName = e.target.name;
    console.log(`Form field changed: ${fieldName} = "${newValue}"`);
    setFormData({
      ...formData,
      [fieldName]: newValue,
    });

    // Clear success message when pincode changes
    if (e.target.name === 'pincode') {
      setPincodeSuccess(null);
    }

    // Auto-trigger pincode search when 6 digits are entered (with debounce)
    if (e.target.name === 'pincode' && newValue.length === 6 && /^\d{6}$/.test(newValue)) {
      // Clear existing timeout
      if (pincodeTimeoutRef.current) {
        clearTimeout(pincodeTimeoutRef.current);
      }
      
      // Set new timeout for debounced auto-fill
      pincodeTimeoutRef.current = setTimeout(() => {
        handlePincodeAutoFill(newValue);
      }, 500); // 0.5 second delay
    }
  };

  const handlePincodeAutoFill = async (pincode: string) => {
    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) return;
    
    setIsPincodeLoading(true);
    try {
      console.log('Auto-filling pincode:', pincode);
      // Search by pincode using Postal PIN Code API
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = await response.json();
      
      console.log('API Response:', data);
      console.log('Is Array:', Array.isArray(data));
      
      // Handle both single object and array responses
      const responseData = Array.isArray(data) ? data[0] : data;
      console.log('Response Data:', responseData);
      
      if (responseData && responseData.Status === 'Success' && responseData.PostOffice && responseData.PostOffice.length > 0) {
        const postOffice = responseData.PostOffice[0]; // Use first post office data
        console.log('Post Office Data:', postOffice);
        console.log('Post Office Name:', postOffice.Name);
        console.log('Post Office District:', postOffice.District);
        console.log('Post Office State:', postOffice.State);
        
        // Update form with detailed address from postal API
        const newFormData = {
          houseNo: '',
          streetName: '',
          village: postOffice.Name || '',
          tehsil: postOffice.Division || '',
          district: postOffice.District || '',
          state: postOffice.State || 'Karnataka',
          country: postOffice.Country || 'India',
          pincode: pincode, // Keep the entered pincode
        };
        console.log('Updating form with:', newFormData);
        
        setFormData(prev => {
          const updatedData = {
            ...prev,
            ...newFormData,
          };
          console.log('Updated form data:', updatedData);
          return updatedData;
        });
        
        // Force form re-render
        setFormKey(prev => prev + 1);
        
        // Show success message
        setPincodeSuccess(`Location found: ${postOffice.Name}, ${postOffice.District}, ${postOffice.State}`);
        setTimeout(() => setPincodeSuccess(null), 5000); // Clear after 5 seconds
      } else {
        // Pincode not found - just leave fields as they are
        console.log('Pincode not found in postal database, leaving fields unchanged');
      }
    } catch (error) {
      console.error('Pincode search error:', error);
      // On error, just leave fields as they are
    } finally {
      setIsPincodeLoading(false);
    }
  };

  const handleLocationSelect = (address: any) => {
    setFormData(prevData => ({
      ...prevData,
      ...address,
    }));
    setShowMap(false); // Close the map after selection
  };

  const LocationPopup = () => {
    if (!showLocationPopup) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Nearby Police Stations & Helplines</h2>
              <button
                onClick={() => setShowLocationPopup(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {nearbyStations.map((station, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {station.type === 'cyber' ? (
                        <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      ) : station.type === 'helpline' ? (
                        <Phone className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      ) : (
                        <MapPin className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-800">{station.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {station.type === 'cyber' ? 'Cyber Crime Specialized' : 
                           station.type === 'helpline' ? '24/7 Helpline' : 'Local Police Station'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">{station.phone}</p>
                      <button className="text-blue-600 text-sm hover:underline mt-1">
                        Call Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Important Notes:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Call 100 for immediate police assistance</li>
                <li>• Contact 1930 for cyber crime complaints</li>
                <li>• Visit cybercrime.gov.in for official online complaints</li>
                <li>• Keep all evidence and documents ready</li>
                <li>• File FIR within 24 hours for better action</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Thank You for Your Report!
          </h2>
          <p className="text-gray-600 mb-6">
            Your scam report has been submitted successfully. Our team will review it and take appropriate action.
            You've earned {submittedReport?.pointsAwarded || 25} points for helping protect the community!
          </p>
          
          {submittedReport?.isOfficialComplaint && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">Official Complaint Generated</h3>
              <p className="text-sm text-green-700 mb-3">
                Complaint Number: <span className="font-mono font-bold">{submittedReport.complaintNumber}</span>
              </p>
              <button
                onClick={handleDownloadPDF}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Download className="w-4 h-4" />
                Download Official Complaint PDF
              </button>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Reports like yours help us identify and stop scammers. Keep up the great work!
            </p>
          </div>
          
          <button
            onClick={() => {
              setSubmitted(false);
              setSubmittedReport(null);
            }}
            className="mt-6 text-blue-600 hover:text-blue-800 font-medium"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {showMap && <MapPicker onLocationSelect={handleLocationSelect} onClose={() => setShowMap(false)} />}
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Report a Scam</h1>
        <p className="text-gray-600">
          Help protect your community by reporting suspicious activities and scams
        </p>
      </div>

      {/* External Complaint Option */}
      <div className=" p-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <Globe className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-orange-800 mb-1">Alternative: Direct Government Complaint</h4>
              <p className="text-sm text-orange-700 mb-3">
                You can also file your complaint directly on the official India Cyber Crime portal for immediate government action.
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => window.open('https://cybercrime.gov.in/Webform/Accept.aspx', '_blank')}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            File Complaint on cybercrime.gov.in
          </button>
          <p className="text-xs text-orange-600 mt-2 text-center">
            Opens official government portal in new tab
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form key={formKey} onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
            <div className="space-y-8">
              {/* Scam Report Section */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('reportScam.scamDetails')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('reportScam.scamType')} *
                    </label>
                    <select
                      name="scamType" value={formData.scamType} onChange={handleChange} required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">{t('reportScam.selectType')}</option>
                      {scamTypes.map(type => (<option key={type} value={type}>{type}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('reportScam.description')} *
                    </label>
                                        <textarea 
                      name="description" value={formData.description} onChange={handleChange} required rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder={t('reportScam.descriptionPlaceholder')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('reportScam.websiteUrl')}</label>
                      <input type="url" name="url" value={formData.url} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('reportScam.urlPlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('reportScam.phoneNumber')}</label>
                      <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('reportScam.phonePlaceholder')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('reportScam.emailAddress')}</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('reportScam.emailPlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('reportScam.severity')} *</label>
                      <select name="severity" value={formData.severity} onChange={handleChange} required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">{t('reportScam.severityLevels.low')}</option>
                        <option value="medium">{t('reportScam.severityLevels.medium')}</option>
                        <option value="high">{t('reportScam.severityLevels.high')}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Details Section */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('reportScam.complainantDetails')}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('reportScam.fullName')} *</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('reportScam.fullNamePlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('reportScam.mobile')} *</label>
                      <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('reportScam.mobilePlaceholder')}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('reportScam.gender')} *</label>
                      <select name="gender" value={formData.gender} onChange={handleChange} required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">{t('common.select')}</option>
                        {genders.map(gender => (<option key={gender} value={gender}>{gender}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('reportScam.dob')}</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('reportScam.personalEmail')}</label>
                      <input type="email" name="emailAddress" value={formData.emailAddress} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('reportScam.personalEmailPlaceholder')}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('reportScam.spouse')}</label>
                      <input type="text" name="spouse" value={formData.spouse} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('reportScam.spousePlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('reportScam.relation')}</label>
                      <input type="text" name="relationWithVictim" value={formData.relationWithVictim} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('reportScam.relationPlaceholder')}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Details Section */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{t('reportScam.complainantAddress')}</h3>
                  <button type="button" onClick={() => setShowMap(true)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Map size={16} />
                    {t('common.select')} from Map
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('reportScam.houseNo')}</label>
                      <input type="text" name="houseNo" value={formData.houseNo} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('reportScam.houseNoPlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('reportScam.street')}</label>
                      <input type="text" name="streetName" value={formData.streetName} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('reportScam.streetPlaceholder')}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('reportScam.colony')}</label>
                      <input type="text" name="colony" value={formData.colony} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('reportScam.colonyPlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('reportScam.village')}</label>
                      <input type="text" name="village" value={formData.village} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('reportScam.villagePlaceholder')}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('reportScam.tehsil')}</label>
                      <input type="text" name="tehsil" value={formData.tehsil} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('reportScam.tehsilPlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('reportScam.district')}</label>
                      <input type="text" name="district" value={formData.district} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('reportScam.districtPlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('reportScam.state')}</label>
                      <select name="state" value={formData.state} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">{t('common.select')}</option>
                        {states.map(state => (<option key={state} value={state}>{state}</option>))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('reportScam.policeStation')}</label>
                      <input type="text" name="policeStation" value={formData.policeStation} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('reportScam.policePlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('reportScam.pincode')}</label>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input type="text" name="pincode" value={formData.pincode} onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={t('reportScam.pincodePlaceholder')} maxLength={6}
                          />
                          {isPincodeLoading && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                        {/* {pincodeSuccess && (
                          <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded-lg">
                            <p className="text-sm text-green-800 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              {pincodeSuccess}
                            </p>
                          </div>
                        )} */}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('reportScam.country')}</label>
                      <input type="text" name="country" value={formData.country} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('reportScam.countryPlaceholder')}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {/* Primary Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button type="button" onClick={() => setShowLocationPopup(true)}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-5 h-5" />
                    Find Police Stations
                  </button>
                  
                  <button type="submit" disabled={isSubmitting}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {t('common.submit')}...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {t('reportScam.submitReport')}
                      </>
                    )}
                  </button>
                </div>


              </div>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-800 mb-2">{t('reportScam.reportingTips')}</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• {t('reportScam.tips.1')}</li>
                  <li>• {t('reportScam.tips.2')}</li>
                  <li>• {t('reportScam.tips.3')}</li>
                  <li>• {t('reportScam.tips.4')}</li>
                  <li>• {t('reportScam.tips.5')}</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-800 mb-3">{t('reportScam.earnPoints')}</h3>
            <p className="text-sm text-gray-700 mb-3">{t('reportScam.subtitle')}</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('reportScam.reportSubmission')}</span>
                <span className="font-semibold text-blue-600">+25 {t('common.points')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('reportScam.verifiedReport')}</span>
                <span className="font-semibold text-blue-600">+50 {t('common.points')}</span>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-800 mb-3">{t('reportScam.yourReports')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('reportScam.totalReports')}</span>
                <span className="font-semibold text-gray-800">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('reportScam.verified')}</span>
                <span className="font-semibold text-green-600">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('reportScam.pending')}</span>
                <span className="font-semibold text-yellow-600">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <LocationPopup />
    </div>
  );
}