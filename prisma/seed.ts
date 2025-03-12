import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create companies if they don't exist
  const cstarExists = await prisma.company.findFirst({ where: { name: 'Cstar' } });
  if (!cstarExists) {
    await prisma.company.create({
      data: {
        name: "Cstar",
        description: "A leading technology company focused on innovation",
        website: "https://cstar.example.com"
      }
    });
  }
  
  const dtalExists = await prisma.company.findFirst({ where: { name: 'DTAL' } });
  if (!dtalExists) {
    await prisma.company.create({
      data: {
        name: "DTAL",
        description: "Digital Transformation and Analytics Leader",
        website: "https://dtal.example.com"
      }
    });
  }
  
  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 