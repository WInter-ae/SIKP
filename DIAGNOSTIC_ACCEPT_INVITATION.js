/**
 * Diagnostic Tool for Accept Invitation Error
 *
 * Copy and paste this into the browser console while on the team creation page
 * to diagnose the "Cannot read properties of undefined" error
 */

async function diagnoseAcceptInvitationError() {
  console.log("🔍 Starting diagnostic for accept invitation error...\n");

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("❌ No auth token found. Please login first.");
    return;
  }

  try {
    // Step 1: Check invitations
    console.log("📩 Step 1: Checking current invitations...");
    const invitationsResponse = await fetch(
      "http://localhost:5173/api/teams/my-invitations",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const invitationsData = await invitationsResponse.json();
    console.log("Invitations Response:", invitationsData);

    if (
      !invitationsData.success ||
      !invitationsData.data ||
      invitationsData.data.length === 0
    ) {
      console.warn("⚠️ No pending invitations found");
      return;
    }

    const firstInvitation = invitationsData.data[0];
    console.log("\n✅ Found invitation:");
    console.log(`  ID: ${firstInvitation.id}`);
    console.log(`  Status: ${firstInvitation.status}`);
    console.log(`  Has inviter?: ${!!firstInvitation.inviter}`);
    console.log(`  Has team?: ${!!firstInvitation.team}`);

    if (firstInvitation.inviter) {
      console.log(`  Inviter name: ${firstInvitation.inviter.name}`);
      console.log(`  Inviter NIM: ${firstInvitation.inviter.nim}`);
    }

    if (firstInvitation.team) {
      console.log(`  Team code: ${firstInvitation.team.code}`);
      console.log(`  Team ID: ${firstInvitation.team.id}`);
    }

    // Step 2: Try to accept the invitation
    console.log("\n📤 Step 2: Attempting to accept invitation...");
    const respondResponse = await fetch(
      `http://localhost:5173/api/teams/invitations/${firstInvitation.id}/respond`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accept: true }),
      },
    );

    const respondData = await respondResponse.json();
    console.log("Response Status:", respondResponse.status);
    console.log("Response Data:", respondData);

    if (respondResponse.status === 500) {
      console.error("\n🚨 Backend Error 500 detected!");
      console.error("Message:", respondData.message);
      console.error(
        "\n🔧 This is likely caused by the backend code trying to access",
      );
      console.error("   a property (like .name) on an undefined object.");
      console.error(
        "\n📝 See FIX_ACCEPT_INVITATION_ERROR.md for the solution.",
      );
      return;
    }

    if (respondData.success) {
      console.log("\n✅ SUCCESS! Invitation accepted!");
      console.log("Updated member data:", respondData.data);
    } else {
      console.error("\n❌ Backend returned error:");
      console.error("Message:", respondData.message);
    }
  } catch (error) {
    console.error("❌ Diagnostic failed with error:", error);
  }
}

// Run the diagnostic
diagnoseAcceptInvitationError();
