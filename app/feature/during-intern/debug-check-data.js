/**
 * Debug Helper - Check Backend Data
 * 
 * Paste script ini di Console browser (F12 → Console tab)
 * untuk mengecek apakah data mahasiswa tersedia di backend
 */

// ======================
// STEP 1: Check Token
// ======================
console.log('🔐 Step 1: Checking Auth Token...');
const token = localStorage.getItem('auth_token');
if (!token) {
  console.error('❌ NO TOKEN FOUND! Please login first.');
} else {
  console.log('✅ Token exists:', token.substring(0, 20) + '...');
}

// ======================
// STEP 2: Check User Data
// ======================
console.log('\n👤 Step 2: Checking User Data...');
const userData = localStorage.getItem('user_data');
if (!userData) {
  console.error('❌ NO USER DATA! Please login first.');
} else {
  const user = JSON.parse(userData);
  console.log('✅ User data:', user);
  console.log('   - Email:', user.email);
  console.log('   - Role:', user.role);
  console.log('   - ID:', user.id);
}

// ======================
// STEP 3: Test Backend API
// ======================
console.log('\n🌐 Step 3: Testing Backend Endpoints...');

const API_BASE_URL = 'http://localhost:8787'; // Change if needed

// Helper function
async function testEndpoint(name, url) {
  console.log(`\n📡 Testing: ${name}`);
  console.log(`   URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ Status:', response.status);
      console.log('   📦 Data:', data);
      return data;
    } else {
      console.error('   ❌ Status:', response.status);
      console.error('   ❌ Error:', data);
      return null;
    }
  } catch (error) {
    console.error('   ❌ Network Error:', error);
    return null;
  }
}

// Test endpoints
(async () => {
  // Test 1: Health check
  await testEndpoint('Health Check', `${API_BASE_URL}/health`);
  
  // Test 2: Student Profile
  await testEndpoint('Student Profile', `${API_BASE_URL}/api/mahasiswa/profile`);
  
  // Test 3: Complete Internship Data (MOST IMPORTANT!)
  const internshipData = await testEndpoint(
    'Complete Internship Data', 
    `${API_BASE_URL}/api/mahasiswa/internship`
  );
  
  // Analyze internship data
  if (internshipData && internshipData.success) {
    console.log('\n📊 Internship Data Analysis:');
    const d = internshipData.data;
    
    console.log('   Student:');
    console.log('      - Name:', d.student?.name || '❌ MISSING');
    console.log('      - NIM:', d.student?.nim || '❌ MISSING');
    console.log('      - Prodi:', d.student?.prodi || '❌ MISSING');
    
    console.log('   Submission:');
    console.log('      - Company:', d.submission?.company || '❌ MISSING');
    console.log('      - Division:', d.submission?.division || '❌ MISSING');
    console.log('      - Start Date:', d.submission?.startDate || '❌ MISSING');
    console.log('      - End Date:', d.submission?.endDate || '❌ MISSING');
    console.log('      - Status:', d.submission?.status || '❌ MISSING');
    
    console.log('   Internship:');
    console.log('      - ID:', d.internship?.id || '❌ MISSING');
    console.log('      - Status:', d.internship?.status || '❌ MISSING');
    
    console.log('   Mentor:');
    console.log('      - Name:', d.mentor?.name || '❌ NOT ASSIGNED YET');
    
    console.log('   Lecturer:');
    console.log('      - Name:', d.lecturer?.name || '❌ NOT ASSIGNED YET');
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    if (!d.student) {
      console.log('   ❌ Student data missing - Check backend database');
    }
    if (!d.submission) {
      console.log('   ❌ No submission found - Student must submit KP application first');
    } else if (d.submission.status !== 'APPROVED') {
      console.log(`   ⚠️ Submission status: ${d.submission.status} - Must be APPROVED by admin`);
    }
    if (!d.internship) {
      console.log('   ❌ No internship record - Backend should auto-create after approval');
    }
  } else {
    console.error('\n❌ FAILED to get internship data!');
    console.error('   Possible reasons:');
    console.error('   1. Backend not running');
    console.error('   2. Token expired/invalid');
    console.error('   3. No submission data in database');
    console.error('   4. Backend API endpoint changed');
  }
  
  console.log('\n✅ Debug check complete!');
})();
