const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // First, delete all existing employees
  await prisma.employee.deleteMany({});

  const employees = [
    {
      name: 'John Doe',
      position: 'Software Engineer',
      department: 'Engineering',
      email: 'john@example.com',
      hireDate: '2023-01-15',
      salary: 85000,
      status: 'Active'
    },
    {
      name: 'Jane Smith',
      position: 'Marketing Manager',
      department: 'Marketing',
      email: 'jane@example.com',
      hireDate: '2023-02-20',
      salary: 75000,
      status: 'Active'
    }
  ];

  for (const employee of employees) {
    await prisma.employee.create({
      data: employee
    });
  }

  console.log('Seed data inserted successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 