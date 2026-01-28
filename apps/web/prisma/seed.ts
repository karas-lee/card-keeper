import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Pre-computed bcrypt hash for "Test1234!" (12 rounds)
  const passwordHash =
    "$2b$12$AQNdiCr9WSY/MVvTQSyjo.Hp8AIQPzAxsZXa9Lgz6y/2nhdNnYlzW";

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: "test@cardkeeper.com" },
    update: {},
    create: {
      email: "test@cardkeeper.com",
      name: "테스트 사용자",
      passwordHash,
      authProvider: "EMAIL",
      emailVerified: new Date(),
    },
  });

  console.log(`Created user: ${user.email}`);

  // Create folders (unique constraint is userId + name + parentId)
  const folderData = [
    { name: "비즈니스", color: "#3B82F6" },
    { name: "개인", color: "#10B981" },
    { name: "기술", color: "#8B5CF6" },
  ] as const;

  const folders: Record<string, { id: string }> = {};

  for (const folder of folderData) {
    const existing = await prisma.folder.findFirst({
      where: { userId: user.id, name: folder.name, parentId: null },
    });
    const created = existing ?? await prisma.folder.create({
      data: {
        name: folder.name,
        color: folder.color,
        userId: user.id,
      },
    });
    folders[folder.name] = created;
    console.log(`Created folder: ${folder.name}`);
  }

  // Create tags
  const tagData = [
    { name: "중요", color: "#EF4444" },
    { name: "팔로업 필요", color: "#F97316" },
    { name: "파트너", color: "#06B6D4" },
    { name: "개발자", color: "#6366F1" },
    { name: "디자이너", color: "#EC4899" },
  ] as const;

  const tags: Record<string, { id: string }> = {};

  for (const tag of tagData) {
    const created = await prisma.tag.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name: tag.name,
        },
      },
      update: {},
      create: {
        name: tag.name,
        color: tag.color,
        userId: user.id,
      },
    });
    tags[tag.name] = created;
    console.log(`Created tag: ${tag.name}`);
  }

  // Create business cards with contactDetails (not direct phone/email fields)
  const cardData = [
    {
      name: "김철수",
      company: "ABC테크",
      jobTitle: "CTO",
      contacts: [
        { type: "MOBILE" as const, value: "010-1234-5678", isPrimary: true },
        { type: "EMAIL" as const, value: "cs.kim@abctech.com", isPrimary: true },
      ],
      folderName: "비즈니스",
      tagNames: ["중요", "개발자"],
    },
    {
      name: "이영희",
      company: "XYZ디자인",
      jobTitle: "수석디자이너",
      contacts: [
        { type: "MOBILE" as const, value: "010-2345-6789", isPrimary: true },
        { type: "EMAIL" as const, value: "yh.lee@xyzdesign.com", isPrimary: true },
      ],
      folderName: "비즈니스",
      tagNames: ["디자이너"],
    },
    {
      name: "박지성",
      company: "스타트업허브",
      jobTitle: "대표",
      contacts: [
        { type: "MOBILE" as const, value: "010-3456-7890", isPrimary: true },
        { type: "EMAIL" as const, value: "js.park@startuphub.kr", isPrimary: true },
      ],
      folderName: "비즈니스",
      tagNames: ["중요", "파트너"],
    },
    {
      name: "최민수",
      company: "프리랜서",
      jobTitle: "개발자",
      contacts: [
        { type: "MOBILE" as const, value: "010-4567-8901", isPrimary: true },
        { type: "EMAIL" as const, value: "ms.choi@gmail.com", isPrimary: true },
      ],
      folderName: "기술",
      tagNames: ["개발자", "팔로업 필요"],
    },
    {
      name: "정수연",
      company: undefined,
      jobTitle: undefined,
      contacts: [
        { type: "MOBILE" as const, value: "010-5678-9012", isPrimary: true },
      ],
      folderName: "개인",
      tagNames: [] as string[],
    },
  ];

  // Delete existing cards for this user to allow re-seeding
  await prisma.businessCard.deleteMany({ where: { userId: user.id } });

  for (const card of cardData) {
    const created = await prisma.businessCard.create({
      data: {
        name: card.name,
        company: card.company,
        jobTitle: card.jobTitle,
        folderId: folders[card.folderName]!.id,
        userId: user.id,
        contactDetails: {
          create: card.contacts.map((c) => ({
            type: c.type,
            value: c.value,
            isPrimary: c.isPrimary,
          })),
        },
        tags: {
          create: card.tagNames.map((tagName) => ({
            tag: {
              connect: { id: tags[tagName]!.id },
            },
          })),
        },
      },
    });
    console.log(`Created business card: ${created.name}`);
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
