// DIAGNOSTIC SCRIPT - Test Backend API Responses
// Jalankan ini di browser console (F12) untuk debug

(async () => {
  console.log("🔍 DIAGNOSTIC: Testing Backend APIs\n");
  
  // Test 1: GET /api/teams/my-teams
  console.log("1️⃣ Testing: GET /api/teams/my-teams");
  try {
    const response1 = await fetch("http://localhost:8787/api/teams/my-teams", {
      method: "GET",
      credentials: "include"
    });
    const data1 = await response1.json();
    console.log("✅ Response /api/teams/my-teams:", {
      status: response1.status,
      success: data1.success,
      dataLength: Array.isArray(data1.data) ? data1.data.length : "Not array",
      rawData: data1
    });
  } catch (err) {
    console.error("❌ Error /api/teams/my-teams:", err.message);
  }
  
  console.log("\n");
  
  // Test 2: GET /api/teams/my-invitations
  console.log("2️⃣ Testing: GET /api/teams/my-invitations");
  try {
    const response2 = await fetch("http://localhost:8787/api/teams/my-invitations", {
      method: "GET",
      credentials: "include"
    });
    const data2 = await response2.json();
    console.log("✅ Response /api/teams/my-invitations:", {
      status: response2.status,
      success: data2.success,
      dataLength: Array.isArray(data2.data) ? data2.data.length : "Not array",
      rawData: data2
    });
    
    // Extract teamId dari first invitation
    if (Array.isArray(data2.data) && data2.data.length > 0) {
      const firstInv = data2.data[0];
      console.log("\n✨ First invitation details:", {
        id: firstInv.id,
        teamId: firstInv.teamId,
        userId: firstInv.userId,
        role: firstInv.role,
        status: firstInv.status,
        keys: Object.keys(firstInv)
      });
      
      // Test 3: GET /api/teams/:teamId/members using teamId dari invitation
      if (firstInv.teamId) {
        console.log("\n3️⃣ Testing: GET /api/teams/" + firstInv.teamId + "/members");
        try {
          const response3 = await fetch(`http://localhost:8787/api/teams/${firstInv.teamId}/members`, {
            method: "GET",
            credentials: "include"
          });
          const data3 = await response3.json();
          console.log("✅ Response /api/teams/:teamId/members:", {
            status: response3.status,
            success: data3.success,
            dataLength: Array.isArray(data3.data) ? data3.data.length : "Not array",
            rawData: data3
          });
        } catch (err) {
          console.error("❌ Error /api/teams/:teamId/members:", err.message);
        }
      }
    }
  } catch (err) {
    console.error("❌ Error /api/teams/my-invitations:", err.message);
  }
})();
