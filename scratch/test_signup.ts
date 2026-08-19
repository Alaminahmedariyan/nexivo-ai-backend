import "dotenv/config";
import { auth } from "../src/lib/auth";

async function testDirectSignUp() {
  try {
    const res = await auth.api.signUpEmail({
      body: {
        name: "Admin User",
        email: "admin-test@nexivo.ai",
        password: "AdminPass123!",
        role: "ADMIN"
      }
    });
    console.log("Success:", res);
  } catch (err) {
    console.error("SignUp Error:", err);
  }
}

testDirectSignUp();
