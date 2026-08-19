const fs = require('fs');
const path = require('path');

const collection = {
  info: {
    name: "Nexivo AI Backend API - Standard Test Suite",
    description: "Complete postman collection auditing all 18 backend modules for Nexivo AI Backend.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  item: []
};

// Helper function to build postman request items
function makeRequest({ name, method, url, headers = [], body = null, testScript = "" }) {
  const reqObj = {
    name,
    request: {
      method,
      header: headers.map(h => ({ key: h.key, value: h.value, type: "text" })),
      url: {
        raw: url,
        protocol: url.startsWith("http://") ? "http" : "https",
        host: url.replace(/https?:\/\//, '').split('/')[0].split('.'),
        path: url.replace(/https?:\/\/[^\/]+/, '').split('/').filter(Boolean),
        query: []
      }
    },
    event: []
  };

  // If query params present in url
  if (url.includes('?')) {
    const [baseUrlPath, queryString] = url.split('?');
    reqObj.request.url.path = baseUrlPath.replace(/https?:\/\/[^\/]+/, '').split('/').filter(Boolean);
    const searchParams = new URLSearchParams(queryString);
    reqObj.request.url.query = [];
    searchParams.forEach((val, key) => {
      reqObj.request.url.query.push({ key, value: val });
    });
  }

  if (body) {
    reqObj.request.body = {
      mode: "raw",
      raw: JSON.stringify(body, null, 2),
      options: {
        raw: {
          language: "json"
        }
      }
    };
    if (!headers.some(h => h.key.toLowerCase() === 'content-type')) {
      reqObj.request.header.push({ key: "Content-Type", value: "application/json", type: "text" });
    }
  }

  if (testScript) {
    reqObj.event.push({
      listen: "test",
      script: {
        exec: testScript.split('\n'),
        type: "text/javascript"
      }
    });
  }

  return reqObj;
}

// ----------------------------------------------------
// 01 - Auth Module
// ----------------------------------------------------
const authFolder = {
  name: "01 - Auth",
  item: [
    makeRequest({
      name: "Register Admin User",
      method: "POST",
      url: "{{authUrl}}/sign-up/email",
      body: {
        name: "Admin User",
        email: "{{adminEmail}}",
        password: "{{adminPassword}}",
        role: "ADMIN"
      },
      testScript: `
pm.test("Status code is 200 or 201", function () {
    pm.expect([200, 201]).to.include(pm.response.code);
});
const jsonData = pm.response.json();
if (jsonData.token) {
    pm.environment.set("adminToken", jsonData.token);
} else if (jsonData.user && jsonData.user.id) {
    pm.environment.set("capturedUserId", jsonData.user.id);
}
`
    }),
    makeRequest({
      name: "Login Admin User",
      method: "POST",
      url: "{{authUrl}}/sign-in/email",
      body: {
        email: "{{adminEmail}}",
        password: "{{adminPassword}}"
      },
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
const jsonData = pm.response.json();
pm.test("Token or session received", function () {
    pm.expect(jsonData).to.have.property("token");
});
if (jsonData.token) {
    pm.environment.set("adminToken", jsonData.token);
}
if (jsonData.user && jsonData.user.id) {
    pm.environment.set("capturedUserId", jsonData.user.id);
}
`
    }),
    makeRequest({
      name: "Register Team Member User",
      method: "POST",
      url: "{{authUrl}}/sign-up/email",
      body: {
        name: "Team Member",
        email: "{{teamMemberEmail}}",
        password: "{{teamMemberPassword}}",
        role: "TEAM_MEMBER"
      },
      testScript: `
pm.test("Status code is 200 or 201", function () {
    pm.expect([200, 201]).to.include(pm.response.code);
});
`
    }),
    makeRequest({
      name: "Login Team Member User",
      method: "POST",
      url: "{{authUrl}}/sign-in/email",
      body: {
        email: "{{teamMemberEmail}}",
        password: "{{teamMemberPassword}}"
      },
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
const jsonData = pm.response.json();
if (jsonData.token) {
    pm.environment.set("teamMemberToken", jsonData.token);
}
`
    }),
    makeRequest({
      name: "Register Regular User",
      method: "POST",
      url: "{{authUrl}}/sign-up/email",
      body: {
        name: "Regular User",
        email: "{{userEmail}}",
        password: "{{userPassword}}",
        role: "USER"
      },
      testScript: `
pm.test("Status code is 200 or 201", function () {
    pm.expect([200, 201]).to.include(pm.response.code);
});
`
    }),
    makeRequest({
      name: "Login Regular User",
      method: "POST",
      url: "{{authUrl}}/sign-in/email",
      body: {
        email: "{{userEmail}}",
        password: "{{userPassword}}"
      },
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
const jsonData = pm.response.json();
if (jsonData.token) {
    pm.environment.set("userToken", jsonData.token);
}
`
    }),
    makeRequest({
      name: "Get Current Session",
      method: "GET",
      url: "{{authUrl}}/get-session",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Negative - Login with Wrong Password",
      method: "POST",
      url: "{{authUrl}}/sign-in/email",
      body: {
        email: "{{adminEmail}}",
        password: "WrongPassword999!"
      },
      testScript: `
pm.test("Status code is 400 or 401", function () {
    pm.expect([400, 401]).to.include(pm.response.code);
});
`
    })
  ]
};
collection.item.push(authFolder);

// ----------------------------------------------------
// 02 - User Management
// ----------------------------------------------------
const userFolder = {
  name: "02 - User Management",
  item: [
    makeRequest({
      name: "Get All Users (Admin - QueryBuilder)",
      method: "GET",
      url: "{{baseUrl}}/users?page=1&limit=10&sortBy=createdAt&sortOrder=desc",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
const jsonData = pm.response.json();
pm.test("Response contains data array and meta pagination", function () {
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
    pm.expect(jsonData).to.have.property('meta');
});
if (jsonData.data && jsonData.data.length > 0) {
    pm.environment.set("capturedUserId", jsonData.data[0].id);
}
`
    }),
    makeRequest({
      name: "Get Me (Authenticated User)",
      method: "GET",
      url: "{{baseUrl}}/users/me",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
const jsonData = pm.response.json();
pm.test("Returns user object in data", function () {
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property("id");
});
`
    }),
    makeRequest({
      name: "Get User By ID",
      method: "GET",
      url: "{{baseUrl}}/users/{{capturedUserId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Update User Role",
      method: "PATCH",
      url: "{{baseUrl}}/users/{{capturedUserId}}/role",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: { role: "ADMIN" },
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Toggle User Status",
      method: "PATCH",
      url: "{{baseUrl}}/users/{{capturedUserId}}/status",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: { status: "ACTIVE" },
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Negative - Update User Role with Invalid Enum",
      method: "PATCH",
      url: "{{baseUrl}}/users/{{capturedUserId}}/role",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: { role: "SUPER_GOD" },
      testScript: `
pm.test("Status code is 400", function () {
    pm.response.to.have.status(400);
});
`
    })
  ]
};
collection.item.push(userFolder);

// ----------------------------------------------------
// 03 - ApiKeys
// ----------------------------------------------------
const apiKeyFolder = {
  name: "03 - ApiKeys",
  item: [
    makeRequest({
      name: "Create API Key",
      method: "POST",
      url: "{{baseUrl}}/api-keys",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: { name: "Test n8n Integration Key" },
      testScript: `
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
const jsonData = pm.response.json();
pm.test("Key created successfully with key and raw key string", function () {
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property("id");
    pm.expect(jsonData.data).to.have.property("key");
});
if (jsonData.data) {
    pm.environment.set("capturedApiKeyId", jsonData.data.id);
    pm.environment.set("apiKey", jsonData.data.key);
}
`
    }),
    makeRequest({
      name: "Get All API Keys",
      method: "GET",
      url: "{{baseUrl}}/api-keys",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Revoke API Key",
      method: "DELETE",
      url: "{{baseUrl}}/api-keys/{{capturedApiKeyId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Negative - Create API Key with Name < 2 Chars",
      method: "POST",
      url: "{{baseUrl}}/api-keys",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: { name: "A" },
      testScript: `
pm.test("Status code is 400", function () {
    pm.response.to.have.status(400);
});
`
    })
  ]
};
collection.item.push(apiKeyFolder);

// ----------------------------------------------------
// 04 - Services & Packages
// ----------------------------------------------------
const serviceFolder = {
  name: "04 - Services & Packages",
  item: [
    makeRequest({
      name: "Get Public Services (QueryBuilder)",
      method: "GET",
      url: "{{baseUrl}}/services?limit=10&page=1",
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Create Service (Admin)",
      method: "POST",
      url: "{{baseUrl}}/services",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: {
        title: "Web Development Service {{$timestamp}}",
        description: "Custom full-stack web application development services.",
        icon: "code"
      },
      testScript: `
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
const jsonData = pm.response.json();
if (jsonData.data && jsonData.data.id) {
    pm.environment.set("capturedServiceId", jsonData.data.id);
}
`
    }),
    makeRequest({
      name: "Get Service By ID",
      method: "GET",
      url: "{{baseUrl}}/services/{{capturedServiceId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Update Service",
      method: "PATCH",
      url: "{{baseUrl}}/services/{{capturedServiceId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: {
        description: "Updated custom full-stack web application development services."
      },
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Add Package to Service",
      method: "POST",
      url: "{{baseUrl}}/services/{{capturedServiceId}}/packages",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: {
        name: "Enterprise Package",
        price: 4999.99,
        features: [
          { label: "Full Stack App", highlight: true },
          { label: "Dedicated Support" }
        ]
      },
      testScript: `
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
const jsonData = pm.response.json();
if (jsonData.data && jsonData.data.id) {
    pm.environment.set("capturedPackageId", jsonData.data.id);
}
`
    }),
    makeRequest({
      name: "Update Package",
      method: "PATCH",
      url: "{{baseUrl}}/services/packages/{{capturedPackageId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: { price: 5499.99 },
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Delete Package",
      method: "DELETE",
      url: "{{baseUrl}}/services/packages/{{capturedPackageId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Delete Service",
      method: "DELETE",
      url: "{{baseUrl}}/services/{{capturedServiceId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    })
  ]
};
collection.item.push(serviceFolder);

// ----------------------------------------------------
// 05 - Technologies
// ----------------------------------------------------
const technologyFolder = {
  name: "05 - Technologies",
  item: [
    makeRequest({
      name: "Get All Technologies (Public)",
      method: "GET",
      url: "{{baseUrl}}/technologies",
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Create Technology (Admin)",
      method: "POST",
      url: "{{baseUrl}}/technologies",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: { name: "TypeScript {{$timestamp}}", icon: "typescript-icon" },
      testScript: `
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
const jsonData = pm.response.json();
if (jsonData.data && jsonData.data.id) {
    pm.environment.set("capturedTechnologyId", jsonData.data.id);
}
`
    }),
    makeRequest({
      name: "Update Technology",
      method: "PATCH",
      url: "{{baseUrl}}/technologies/{{capturedTechnologyId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: { name: "TypeScript v5" },
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Delete Technology",
      method: "DELETE",
      url: "{{baseUrl}}/technologies/{{capturedTechnologyId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    })
  ]
};
collection.item.push(technologyFolder);

// ----------------------------------------------------
// 06 - Portfolios
// ----------------------------------------------------
const portfolioFolder = {
  name: "06 - Portfolios",
  item: [
    makeRequest({
      name: "Get All Portfolios (Public)",
      method: "GET",
      url: "{{baseUrl}}/portfolios?limit=10&page=1",
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Create Portfolio (Admin)",
      method: "POST",
      url: "{{baseUrl}}/portfolios",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: {
        title: "AI Platform {{$timestamp}}",
        description: "An advanced AI SaaS solution for enterprise customers.",
        clientName: "Acme Corp"
      },
      testScript: `
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
const jsonData = pm.response.json();
if (jsonData.data && jsonData.data.id) {
    pm.environment.set("capturedPortfolioId", jsonData.data.id);
}
`
    }),
    makeRequest({
      name: "Update Portfolio",
      method: "PATCH",
      url: "{{baseUrl}}/portfolios/{{capturedPortfolioId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: { isFeatured: true },
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Add Portfolio Image",
      method: "POST",
      url: "{{baseUrl}}/portfolios/{{capturedPortfolioId}}/images",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: {
        url: "https://example.com/screenshot1.png",
        caption: "Dashboard Overview"
      },
      testScript: `
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
const jsonData = pm.response.json();
if (jsonData.data && jsonData.data.id) {
    pm.environment.set("capturedPortfolioImageId", jsonData.data.id);
}
`
    }),
    makeRequest({
      name: "Remove Portfolio Image",
      method: "DELETE",
      url: "{{baseUrl}}/portfolios/images/{{capturedPortfolioImageId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Delete Portfolio",
      method: "DELETE",
      url: "{{baseUrl}}/portfolios/{{capturedPortfolioId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    })
  ]
};
collection.item.push(portfolioFolder);

// ----------------------------------------------------
// 07 - Testimonials
// ----------------------------------------------------
const testimonialFolder = {
  name: "07 - Testimonials",
  item: [
    makeRequest({
      name: "Get Public Testimonials",
      method: "GET",
      url: "{{baseUrl}}/testimonials",
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Create Testimonial (Admin)",
      method: "POST",
      url: "{{baseUrl}}/testimonials",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: {
        clientName: "John Doe {{$timestamp}}",
        role: "CTO",
        company: "Innovate Inc",
        content: "Exceptional quality and timely delivery on our backend architecture.",
        rating: 5
      },
      testScript: `
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
const jsonData = pm.response.json();
if (jsonData.data && jsonData.data.id) {
    pm.environment.set("capturedTestimonialId", jsonData.data.id);
}
`
    }),
    makeRequest({
      name: "Get Testimonial By ID",
      method: "GET",
      url: "{{baseUrl}}/testimonials/{{capturedTestimonialId}}",
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Update Testimonial",
      method: "PATCH",
      url: "{{baseUrl}}/testimonials/{{capturedTestimonialId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: { isFeatured: true },
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Delete Testimonial",
      method: "DELETE",
      url: "{{baseUrl}}/testimonials/{{capturedTestimonialId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    })
  ]
};
collection.item.push(testimonialFolder);

// ----------------------------------------------------
// 08 - SiteSettings
// ----------------------------------------------------
const siteSettingFolder = {
  name: "08 - SiteSettings",
  item: [
    makeRequest({
      name: "Get All Site Settings (Public)",
      method: "GET",
      url: "{{baseUrl}}/site-settings",
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Upsert Site Setting (Admin)",
      method: "PUT",
      url: "{{baseUrl}}/site-settings",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: {
        key: "test_contact_email",
        value: "support@nexivo.ai",
        group: "CONTACT"
      },
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Get Setting By Key",
      method: "GET",
      url: "{{baseUrl}}/site-settings/test_contact_email",
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Delete Site Setting",
      method: "DELETE",
      url: "{{baseUrl}}/site-settings/test_contact_email",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    })
  ]
};
collection.item.push(siteSettingFolder);

// ----------------------------------------------------
// 09 - Newsletter
// ----------------------------------------------------
const newsletterFolder = {
  name: "09 - Newsletter",
  item: [
    makeRequest({
      name: "Subscribe Newsletter (Public)",
      method: "POST",
      url: "{{baseUrl}}/newsletter/subscribe",
      body: { email: "newsletter-test-{{$timestamp}}@example.com" },
      testScript: `
pm.test("Status code is 200 or 201", function () {
    pm.expect([200, 201]).to.include(pm.response.code);
});
`
    }),
    makeRequest({
      name: "Unsubscribe Newsletter",
      method: "POST",
      url: "{{baseUrl}}/newsletter/unsubscribe",
      body: { email: "newsletter-test-{{$timestamp}}@example.com" },
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Get All Newsletter Subscribers (Admin)",
      method: "GET",
      url: "{{baseUrl}}/newsletter",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Negative - Subscribe with Invalid Email Format",
      method: "POST",
      url: "{{baseUrl}}/newsletter/subscribe",
      body: { email: "not-an-email" },
      testScript: `
pm.test("Status code is 400", function () {
    pm.response.to.have.status(400);
});
`
    })
  ]
};
collection.item.push(newsletterFolder);

// ----------------------------------------------------
// 10 - Leads
// ----------------------------------------------------
const leadFolder = {
  name: "10 - Leads",
  item: [
    makeRequest({
      name: "Submit Contact Form (Public Lead)",
      method: "POST",
      url: "{{baseUrl}}/leads",
      body: {
        name: "Jane Lead {{$timestamp}}",
        email: "lead-{{$timestamp}}@example.com",
        phone: "+15551234567",
        company: "Future AI Corp",
        serviceInterest: "Full Stack AI Development",
        budgetRange: "$10k-$25k",
        message: "We need an enterprise backend solution with AI integration."
      },
      testScript: `
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
const jsonData = pm.response.json();
pm.test("Lead created and ID captured", function () {
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property("id");
});
if (jsonData.data && jsonData.data.id) {
    pm.environment.set("capturedLeadId", jsonData.data.id);
}
`
    }),
    makeRequest({
      name: "Get All Leads (Admin/Team - QueryBuilder)",
      method: "GET",
      url: "{{baseUrl}}/leads?status=NEW&page=1&limit=10",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Get Lead By ID",
      method: "GET",
      url: "{{baseUrl}}/leads/{{capturedLeadId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Update Lead",
      method: "PATCH",
      url: "{{baseUrl}}/leads/{{capturedLeadId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: { status: "CONTACTED", notes: "Called client on phone." },
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Convert Lead to Client",
      method: "POST",
      url: "{{baseUrl}}/leads/{{capturedLeadId}}/convert",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200 or 201", function () {
    pm.expect([200, 201]).to.include(pm.response.code);
});
const jsonData = pm.response.json();
if (jsonData.data && jsonData.data.id) {
    pm.environment.set("capturedClientId", jsonData.data.id);
}
`
    }),
    makeRequest({
      name: "Delete Lead",
      method: "DELETE",
      url: "{{baseUrl}}/leads/{{capturedLeadId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    })
  ]
};
collection.item.push(leadFolder);

// ----------------------------------------------------
// 11 - Clients
// ----------------------------------------------------
const clientFolder = {
  name: "11 - Clients",
  item: [
    makeRequest({
      name: "Create Client Direct (Admin)",
      method: "POST",
      url: "{{baseUrl}}/clients",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: {
        companyName: "Acme Tech Solutions {{$timestamp}}",
        contactName: "Alice Client",
        contactEmail: "client-{{$timestamp}}@acme.com",
        phone: "+15559876543",
        address: "100 Tech Lane, Suite 400"
      },
      testScript: `
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
const jsonData = pm.response.json();
pm.test("Client created and ID captured", function () {
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property("id");
});
if (jsonData.data && jsonData.data.id) {
    pm.environment.set("capturedClientId", jsonData.data.id);
}
`
    }),
    makeRequest({
      name: "Get All Clients (QueryBuilder)",
      method: "GET",
      url: "{{baseUrl}}/clients?page=1&limit=10&sortBy=createdAt&sortOrder=desc",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Get Client By ID",
      method: "GET",
      url: "{{baseUrl}}/clients/{{capturedClientId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Update Client",
      method: "PATCH",
      url: "{{baseUrl}}/clients/{{capturedClientId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: { notes: "VIP Tier 1 Enterprise Client" },
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Delete Client",
      method: "DELETE",
      url: "{{baseUrl}}/clients/{{capturedClientId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    })
  ]
};
collection.item.push(clientFolder);

// ----------------------------------------------------
// 12 - Projects & Sub-resources
// ----------------------------------------------------
const projectFolder = {
  name: "12 - Projects & Sub-resources",
  item: [
    makeRequest({
      name: "Create Project (Admin)",
      method: "POST",
      url: "{{baseUrl}}/projects",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: {
        name: "Nexivo AI Mobile App {{$timestamp}}",
        description: "Cross platform React Native app integrated with backend API.",
        clientId: "{{capturedClientId}}",
        budget: 15000.00,
        status: "IN_PROGRESS"
      },
      testScript: `
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
const jsonData = pm.response.json();
pm.test("Project created and ID captured", function () {
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property("id");
});
if (jsonData.data && jsonData.data.id) {
    pm.environment.set("capturedProjectId", jsonData.data.id);
}
`
    }),
    makeRequest({
      name: "Get All Projects (QueryBuilder)",
      method: "GET",
      url: "{{baseUrl}}/projects?status=IN_PROGRESS&page=1&limit=10",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Get Project By ID",
      method: "GET",
      url: "{{baseUrl}}/projects/{{capturedProjectId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Update Project",
      method: "PATCH",
      url: "{{baseUrl}}/projects/{{capturedProjectId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: { progress: 25 },
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Add Milestone to Project",
      method: "POST",
      url: "{{baseUrl}}/projects/{{capturedProjectId}}/milestones",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: {
        title: "Phase 1 - Database Schema & Auth Setup",
        description: "Initial database architecture and better-auth integration.",
        amount: 3000.00
      },
      testScript: `
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
const jsonData = pm.response.json();
if (jsonData.data && jsonData.data.id) {
    pm.environment.set("capturedMilestoneId", jsonData.data.id);
}
`
    }),
    makeRequest({
      name: "Update Milestone",
      method: "PATCH",
      url: "{{baseUrl}}/projects/milestones/{{capturedMilestoneId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: { status: "COMPLETED" },
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Delete Milestone",
      method: "DELETE",
      url: "{{baseUrl}}/projects/milestones/{{capturedMilestoneId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Add Timeline Event to Project",
      method: "POST",
      url: "{{baseUrl}}/projects/{{capturedProjectId}}/timelines",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: {
        title: "Kickoff Meeting Completed",
        description: "Aligned project scope with key client stakeholders."
      },
      testScript: `
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
const jsonData = pm.response.json();
if (jsonData.data && jsonData.data.id) {
    pm.environment.set("capturedTimelineId", jsonData.data.id);
}
`
    }),
    makeRequest({
      name: "Update Timeline Event",
      method: "PATCH",
      url: "{{baseUrl}}/projects/timelines/{{capturedTimelineId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: { title: "Kickoff Meeting & Requirements Finalized" },
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Delete Timeline Event",
      method: "DELETE",
      url: "{{baseUrl}}/projects/timelines/{{capturedTimelineId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Add Project File Metadata",
      method: "POST",
      url: "{{baseUrl}}/projects/{{capturedProjectId}}/files",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: {
        name: "Architecture Blueprint.pdf",
        fileUrl: "https://storage.example.com/files/blueprint.pdf",
        fileType: "application/pdf",
        fileSize: 1048576
      },
      testScript: `
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
const jsonData = pm.response.json();
if (jsonData.data && jsonData.data.id) {
    pm.environment.set("capturedProjectFileId", jsonData.data.id);
}
`
    }),
    makeRequest({
      name: "Get Project Files List",
      method: "GET",
      url: "{{baseUrl}}/projects/{{capturedProjectId}}/files",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Delete Project File (Global Endpoint)",
      method: "DELETE",
      url: "{{baseUrl}}/project-files/{{capturedProjectFileId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Delete Project",
      method: "DELETE",
      url: "{{baseUrl}}/projects/{{capturedProjectId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    })
  ]
};
collection.item.push(projectFolder);

// ----------------------------------------------------
// 13 - Invoices
// ----------------------------------------------------
const invoiceFolder = {
  name: "13 - Invoices",
  item: [
    makeRequest({
      name: "Create Invoice (Admin)",
      method: "POST",
      url: "{{baseUrl}}/invoices",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: {
        clientId: "{{capturedClientId}}",
        projectId: "{{capturedProjectId}}",
        amount: 3000.00,
        currency: "USD",
        dueDate: "2026-09-01T00:00:00.000Z",
        notes: "Invoice for Milestone 1 Completion."
      },
      testScript: `
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
const jsonData = pm.response.json();
if (jsonData.data && jsonData.data.id) {
    pm.environment.set("capturedInvoiceId", jsonData.data.id);
}
`
    }),
    makeRequest({
      name: "Get All Invoices (QueryBuilder)",
      method: "GET",
      url: "{{baseUrl}}/invoices?status=UNPAID&page=1&limit=10",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Get Invoice By ID",
      method: "GET",
      url: "{{baseUrl}}/invoices/{{capturedInvoiceId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Update Invoice Status",
      method: "PATCH",
      url: "{{baseUrl}}/invoices/{{capturedInvoiceId}}/status",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: { status: "PAID" },
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Delete Invoice",
      method: "DELETE",
      url: "{{baseUrl}}/invoices/{{capturedInvoiceId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    })
  ]
};
collection.item.push(invoiceFolder);

// ----------------------------------------------------
// 14 - Payments
// ----------------------------------------------------
const paymentFolder = {
  name: "14 - Payments",
  item: [
    makeRequest({
      name: "Create Stripe Checkout Session",
      method: "POST",
      url: "{{baseUrl}}/payments/create-checkout-session",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: {
        invoiceId: "{{capturedInvoiceId}}",
        amount: 3000.00,
        currency: "usd"
      },
      testScript: `
pm.test("Status code is 200 or 201", function () {
    pm.expect([200, 201]).to.include(pm.response.code);
});
const jsonData = pm.response.json();
if (jsonData.data && jsonData.data.id) {
    pm.environment.set("capturedPaymentId", jsonData.data.id);
}
`
    }),
    makeRequest({
      name: "Get All Payments (QueryBuilder)",
      method: "GET",
      url: "{{baseUrl}}/payments?page=1&limit=10",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Get Payment By ID",
      method: "GET",
      url: "{{baseUrl}}/payments/{{capturedPaymentId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Stripe Webhook (Mock Test - Test Mode)",
      method: "POST",
      url: "{{baseUrl}}/payments/webhook",
      headers: [
        { key: "stripe-signature", value: "t=1700000000,v1=mock_signature_test" }
      ],
      body: {
        type: "payment_intent.succeeded",
        data: { object: { id: "pi_test_12345" } }
      },
      testScript: `
pm.test("Status code is 200 or 400 (Webhook validation response)", function () {
    pm.expect([200, 400]).to.include(pm.response.code);
});
`
    })
  ]
};
collection.item.push(paymentFolder);

// ----------------------------------------------------
// 15 - AI Module
// ----------------------------------------------------
const aiFolder = {
  name: "15 - AI Module",
  item: [
    makeRequest({
      name: "Start AI Conversation (Public)",
      method: "POST",
      url: "{{baseUrl}}/ai/conversations",
      body: {
        title: "Inquiry regarding custom AI solutions",
        message: "Hello! Can you summarize your AI capabilities?"
      },
      testScript: `
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
const jsonData = pm.response.json();
if (jsonData.data && jsonData.data.id) {
    pm.environment.set("capturedAiConversationId", jsonData.data.id);
}
`
    }),
    makeRequest({
      name: "Add Message to AI Conversation",
      method: "POST",
      url: "{{baseUrl}}/ai/conversations/{{capturedAiConversationId}}/messages",
      body: {
        role: "user",
        content: "What is your typical turnaround time for an MVP?"
      },
      testScript: `
pm.test("Status code is 200 or 201", function () {
    pm.expect([200, 201]).to.include(pm.response.code);
});
`
    }),
    makeRequest({
      name: "Get AI Conversation By ID",
      method: "GET",
      url: "{{baseUrl}}/ai/conversations/{{capturedAiConversationId}}",
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Get All AI Conversations (Admin/Team)",
      method: "GET",
      url: "{{baseUrl}}/ai/conversations?page=1&limit=10",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Create AI Proposal (Admin/Team)",
      method: "POST",
      url: "{{baseUrl}}/ai/proposals",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: {
        title: "AI Integration Scope & Proposal",
        content: "Complete breakdown of OpenAI API integration with backend queues.",
        amount: 8500.00,
        currency: "USD"
      },
      testScript: `
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
const jsonData = pm.response.json();
if (jsonData.data && jsonData.data.id) {
    pm.environment.set("capturedAiProposalId", jsonData.data.id);
}
`
    }),
    makeRequest({
      name: "Get All AI Proposals",
      method: "GET",
      url: "{{baseUrl}}/ai/proposals?page=1&limit=10",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Get AI Proposal By ID",
      method: "GET",
      url: "{{baseUrl}}/ai/proposals/{{capturedAiProposalId}}",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Update AI Proposal Status",
      method: "PATCH",
      url: "{{baseUrl}}/ai/proposals/{{capturedAiProposalId}}/status",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      body: { status: "SENT" },
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Accept AI Proposal",
      method: "PATCH",
      url: "{{baseUrl}}/ai/proposals/{{capturedAiProposalId}}/accept",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Get AI Usage Logs (Admin)",
      method: "GET",
      url: "{{baseUrl}}/ai/usage-logs",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Log Automation Execution (n8n Webhook with x-api-key)",
      method: "POST",
      url: "{{baseUrl}}/ai/automation-executions",
      headers: [{ key: "x-api-key", value: "{{apiKey}}" }],
      body: {
        workflowName: "n8n Lead Enrichment Flow",
        triggerType: "WEBHOOK",
        status: "SUCCESS",
        executionTime: 1250
      },
      testScript: `
pm.test("Status code is 200 or 201", function () {
    pm.expect([200, 201]).to.include(pm.response.code);
});
`
    }),
    makeRequest({
      name: "Get All Automation Executions (Admin/Team)",
      method: "GET",
      url: "{{baseUrl}}/ai/automation-executions",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    })
  ]
};
collection.item.push(aiFolder);

// ----------------------------------------------------
// 16 - Notifications
// ----------------------------------------------------
const notificationFolder = {
  name: "16 - Notifications",
  item: [
    makeRequest({
      name: "Get My Notifications",
      method: "GET",
      url: "{{baseUrl}}/notifications?page=1&limit=10",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
const jsonData = pm.response.json();
if (jsonData.data && jsonData.data.length > 0) {
    pm.environment.set("capturedNotificationId", jsonData.data[0].id);
}
`
    }),
    makeRequest({
      name: "Get Unread Notification Count",
      method: "GET",
      url: "{{baseUrl}}/notifications/unread-count",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Mark Notification As Read",
      method: "PATCH",
      url: "{{baseUrl}}/notifications/{{capturedNotificationId}}/read",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    }),
    makeRequest({
      name: "Mark All Notifications As Read",
      method: "PATCH",
      url: "{{baseUrl}}/notifications/read-all",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    })
  ]
};
collection.item.push(notificationFolder);

// ----------------------------------------------------
// 17 - Activity Logs
// ----------------------------------------------------
const activityLogFolder = {
  name: "17 - Activity Logs",
  item: [
    makeRequest({
      name: "Get Activity Logs (Admin/Team - QueryBuilder)",
      method: "GET",
      url: "{{baseUrl}}/activity-logs?page=1&limit=10&sortBy=createdAt&sortOrder=desc",
      headers: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      testScript: `
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
`
    })
  ]
};
collection.item.push(activityLogFolder);

// ----------------------------------------------------
// 18 - Security Tests
// ----------------------------------------------------
const securityFolder = {
  name: "18 - Dedicated Security Tests",
  item: [
    makeRequest({
      name: "Missing Token (Unauthorized)",
      method: "GET",
      url: "{{baseUrl}}/users",
      testScript: `
pm.test("Status code is 401", function () {
    pm.response.to.have.status(401);
});
`
    }),
    makeRequest({
      name: "Invalid Token Header",
      method: "GET",
      url: "{{baseUrl}}/users",
      headers: [{ key: "Authorization", value: "Bearer invalid.jwt.token" }],
      testScript: `
pm.test("Status code is 401", function () {
    pm.response.to.have.status(401);
});
`
    }),
    makeRequest({
      name: "Wrong Role Access (User accessing Admin endpoint)",
      method: "GET",
      url: "{{baseUrl}}/activity-logs",
      headers: [{ key: "Authorization", value: "Bearer {{userToken}}" }],
      testScript: `
pm.test("Status code is 403", function () {
    pm.response.to.have.status(403);
});
`
    }),
    makeRequest({
      name: "Missing API Key on n8n Webhook",
      method: "POST",
      url: "{{baseUrl}}/ai/automation-executions",
      body: {
        workflowName: "Unauthorized Execution Test"
      },
      testScript: `
pm.test("Status code is 401", function () {
    pm.response.to.have.status(401);
});
`
    }),
    makeRequest({
      name: "Invalid API Key Header",
      method: "POST",
      url: "{{baseUrl}}/ai/automation-executions",
      headers: [{ key: "x-api-key", value: "invalid_secret_key_12345" }],
      body: {
        workflowName: "Unauthorized Execution Test"
      },
      testScript: `
pm.test("Status code is 401 or 403", function () {
    pm.expect([401, 403]).to.include(pm.response.code);
});
`
    })
  ]
};
collection.item.push(securityFolder);

const outputPath = path.join(__dirname, '../postman/Nexivo-AI-Backend.postman_collection.json');
fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));
console.log('Collection written successfully to:', outputPath);
