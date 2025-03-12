import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addCompanies() {
  try {
    // Create Cstar
    await prisma.company.upsert({
      where: { name: 'Cstar' },
      update: {},
      create: {
        name: "Cstar",
        description: "A leading technology company focused on innovation",
        website: "https://cstar.example.com"
      }
    });
    
    // Create DTAL
    await prisma.company.upsert({
      where: { name: 'DTAL' },
      update: {},
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