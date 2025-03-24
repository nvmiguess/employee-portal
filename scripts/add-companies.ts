import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addCompanies() {
  try {
    // Create or update Cstar
    const existingCstar = await prisma.company.findFirst({
      where: { name: 'Cstar' }
    });

    await prisma.company.upsert({
      where: { id: existingCstar?.id ?? -1 },
      update: {
        name: "Cstar",
        description: "A leading technology company focused on innovation",
        website: "https://cstar.example.com"
      },
      create: {
        name: "Cstar",
        description: "A leading technology company focused on innovation",
        website: "https://cstar.example.com"
      }
    });
    
    // Create or update DTAL
    const existingDTAL = await prisma.company.findFirst({
      where: { name: 'DTAL' }
    });

    await prisma.company.upsert({
      where: { id: existingDTAL?.id ?? -1 },
      update: {
        name: "DTAL",
        description: "Digital Transformation and Analytics Leader",
        website: "https://dtal.example.com"
      },
      create: {
        name: "DTAL",
        description: "Digital Transformation and Analytics Leader",
        website: "https://dtal.example.com"
      }
    });
    
    console.log('Companies added successfully!');
  } catch (error) {
    console.error('Error adding companies:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCompanies();