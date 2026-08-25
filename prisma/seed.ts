import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_DEV_PASSWORD = "SnacksyDev123!";

const ALL_PERMISSIONS = [
  { code: "customer.read", description: "View customer 360 profiles", category: "Customer 360" },
  { code: "customer.create", description: "Create new customer profiles", category: "Customer 360" },
  { code: "customer.update", description: "Update customer details", category: "Customer 360" },
  { code: "customer.delete", description: "Delete customer profiles", category: "Customer 360" },
  { code: "customer.export", description: "Export customer list to CSV", category: "Customer 360" },
  { code: "customer.merge", description: "Merge duplicate customer records", category: "Customer 360" },
  { code: "reservation.read", description: "View table reservations", category: "Operations" },
  { code: "reservation.create", description: "Book new reservations", category: "Operations" },
  { code: "reservation.update", description: "Update reservation details", category: "Operations" },
  { code: "loyalty.read", description: "View customer loyalty points", category: "Loyalty" },
  { code: "loyalty.adjust", description: "Adjust points balance manually", category: "Loyalty" },
  { code: "loyalty.manage", description: "Manage loyalty rewards catalog", category: "Loyalty" },
  { code: "feedback.read", description: "View customer ratings", category: "Feedback" },
  { code: "feedback.manage", description: "Resolve low rating feedback", category: "Feedback" },
  { code: "task.read", description: "View staff task board", category: "Tasks" },
  { code: "task.manage", description: "Create and assign staff tasks", category: "Tasks" },
  { code: "report.read", description: "View executive dashboard reports", category: "Analytics" },
  { code: "report.export", description: "Export analytics reports", category: "Analytics" },
  { code: "staff.read", description: "View staff member list", category: "Administration" },
  { code: "staff.manage", description: "Manage staff roles and accounts", category: "Administration" },
  { code: "settings.read", description: "View organization settings", category: "Administration" },
  { code: "settings.manage", description: "Update organization settings", category: "Administration" },
];

async function main() {
  console.log("🌱 Starting Full CRM Seeding with Digital Menu...");

  // 1. Seed Organization & Branch
  const org = await prisma.organization.upsert({
    where: { slug: "snacksy-cafe" },
    update: {},
    create: {
      name: "Snacksy Cafe And Restro",
      slug: "snacksy-cafe",
      defaultCurrency: "NPR",
      defaultTimezone: "Asia/Kathmandu",
      country: "Nepal",
      status: "ACTIVE",
    },
  });

  const branch = await prisma.branch.upsert({
    where: { organizationId_code: { organizationId: org.id, code: "KIRTIPUR" } },
    update: {},
    create: {
      organizationId: org.id,
      name: "Snacksy Kirtipur",
      code: "KIRTIPUR",
      city: "Kirtipur",
      address: "Kirtipur Naya Bazar, Kathmandu, Nepal",
      phone: "+97714330000",
      email: "kirtipur@snacksycafe.com",
      timezone: "Asia/Kathmandu",
      currency: "NPR",
      active: true,
    },
  });

  // 2. Seed Permissions & Owner Role
  const dbPermissions = [];
  for (const perm of ALL_PERMISSIONS) {
    const p = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: { code: perm.code, description: perm.description, category: perm.category },
    });
    dbPermissions.push(p);
  }

  const ownerRole = await prisma.role.upsert({
    where: { organizationId_name: { organizationId: org.id, name: "Owner" } },
    update: {},
    create: {
      organizationId: org.id,
      name: "Owner",
      description: "Full System Administrator & Tenant Owner",
      isSystemRole: true,
    },
  });

  for (const perm of dbPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: ownerRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: ownerRole.id, permissionId: perm.id },
    });
  }

  // 3. Seed Owner User
  const defaultPasswordHash = await bcrypt.hash(DEFAULT_DEV_PASSWORD, 10);
  const ownerUser = await prisma.user.upsert({
    where: { email: "owner@snacksy.local" },
    update: { passwordHash: defaultPasswordHash, status: "ACTIVE", isActive: true },
    create: {
      organizationId: org.id,
      email: "owner@snacksy.local",
      fullName: "Snacksy Owner",
      passwordHash: defaultPasswordHash,
      status: "ACTIVE",
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: ownerUser.id, roleId: ownerRole.id } },
    update: {},
    create: { userId: ownerUser.id, roleId: ownerRole.id },
  });

  await prisma.userBranch.upsert({
    where: { userId_branchId: { userId: ownerUser.id, branchId: branch.id } },
    update: {},
    create: { userId: ownerUser.id, branchId: branch.id },
  });

  // 4. Seed Restaurant Tables (for Table QR Codes)
  console.log("🪑 Seeding Restaurant Tables...");
  for (let i = 1; i <= 10; i++) {
    const num = i < 10 ? `0${i}` : `${i}`;
    await prisma.restaurantTable.upsert({
      where: { id: `table-kirtipur-${num}` },
      update: {},
      create: {
        id: `table-kirtipur-${num}`,
        organizationId: org.id,
        branchId: branch.id,
        tableNumber: `T-${num}`,
        name: `Table ${num}`,
        capacity: i % 2 === 0 ? 4 : 2,
        section: i <= 5 ? "MAIN_HALL" : "ROOFTOP",
      },
    });
  }

  // 5. Seed Menu Categories & Items
  console.log("☕ Seeding Digital Menu & Dishes...");
  const catMomo = await prisma.menuCategory.upsert({
    where: { organizationId_name: { organizationId: org.id, name: "Momo & Dumplings" } },
    update: {},
    create: {
      organizationId: org.id,
      name: "Momo & Dumplings",
      description: "Authentic Nepali handmade dumplings",
      sequence: 1,
    },
  });

  const catCoffee = await prisma.menuCategory.upsert({
    where: { organizationId_name: { organizationId: org.id, name: "Hot Drinks & Coffee" } },
    update: {},
    create: {
      organizationId: org.id,
      name: "Hot Drinks & Coffee",
      description: "Freshly brewed organic beans",
      sequence: 2,
    },
  });

  await prisma.menuItem.upsert({
    where: { organizationId_name: { organizationId: org.id, name: "Buff Steam Mo:Mo" } },
    update: {},
    create: {
      organizationId: org.id,
      categoryId: catMomo.id,
      name: "Buff Steam Mo:Mo",
      description: "10 pcs juicy buff dumplings served with spicy tomato chutney",
      priceNpr: 22000, // NPR 220
      dietaryTag: "NON_VEG",
      isAvailable: true,
    },
  });

  await prisma.menuItem.upsert({
    where: { organizationId_name: { organizationId: org.id, name: "Veg Steam Mo:Mo" } },
    update: {},
    create: {
      organizationId: org.id,
      categoryId: catMomo.id,
      name: "Veg Steam Mo:Mo",
      description: "10 pcs fresh vegetable dumplings served with sesame soup dip",
      priceNpr: 18000, // NPR 180
      dietaryTag: "VEG",
      isAvailable: true,
    },
  });

  await prisma.menuItem.upsert({
    where: { organizationId_name: { organizationId: org.id, name: "Hot Cappuccino" } },
    update: {},
    create: {
      organizationId: org.id,
      categoryId: catCoffee.id,
      name: "Hot Cappuccino",
      description: "Double shot espresso with silky micro-foam milk",
      priceNpr: 24000, // NPR 240
      dietaryTag: "VEG",
      isAvailable: true,
    },
  });

  // 6. Seed Digital Menu Settings
  await prisma.digitalMenuSettings.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      acceptingOrders: true,
      headerTitle: "SNACKSY CAFE",
      headerSubtitle: "DINE-IN & TAKEAWAY AVAILABLE",
      accentColor: "#b91c1c",
    },
  });

  console.log("🚀 Full CRM Seeding Complete with Digital Menu & Table QR Codes!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
