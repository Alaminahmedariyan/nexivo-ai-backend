import { hashPassword } from "better-auth/crypto";
import { prisma } from "../src/lib/prisma";
import { UserRole } from "../generated/prisma";

async function seedSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL!;
  const password = process.env.SUPER_ADMIN_PASSWORD!;
  const name = process.env.SUPER_ADMIN_NAME ?? "Super Admin";

  if (!email || !password) {
    throw new Error(
      "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be defined in .env",
    );
  }

  const hashedPassword = await hashPassword(password);

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email,
        emailVerified: true,
        role: UserRole.SUPER_ADMIN,
        accounts: {
          create: {
            providerId: "credential",
            accountId: email,
            password: hashedPassword,
          },
        },
      },
    });
    console.log("✅ Super Admin created successfully");
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        role: UserRole.SUPER_ADMIN,
      },
    });

    await prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: "credential",
          accountId: email,
        },
      },
      update: {
        password: hashedPassword,
      },
      create: {
        userId: user.id,
        providerId: "credential",
        accountId: email,
        password: hashedPassword,
      },
    });

    console.log("✅ Super Admin credentials updated successfully");
  }
}

async function seedServices() {
  const services = [
    {
      title: "Web Development",
      slug: "web-development",
      description:
        "Custom websites and web applications built for performance and scale.",
      order: 1,
    },
    {
      title: "AI Automation",
      slug: "ai-automation",
      description:
        "AI-powered workflow automation and chatbots tailored to your business.",
      order: 2,
    },
    {
      title: "UI/UX Design",
      slug: "ui-ux-design",
      description: "User-centered design that turns visitors into customers.",
      order: 3,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    });
  }

  console.log("✅ Sample services seeded");
}

async function seedSiteSettings() {
  const settings = [
    { key: "companyName", value: "Nexivo AI", group: "GENERAL" as const },
    {
      key: "contactEmail",
      value: "hello@nexivo.ai",
      group: "CONTACT" as const,
    },
    {
      key: "seoTitle",
      value: "Nexivo AI — AI-Powered Digital Agency",
      group: "SEO" as const,
    },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log("✅ Default site settings seeded");
}

async function main() {
  await seedSuperAdmin();
  await seedServices();
  await seedSiteSettings();
}

main()
  .catch((err) => {
    console.error("❌ Seed failed");
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
