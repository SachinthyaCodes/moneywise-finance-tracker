// backend/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      email: 'userfdfsdf@example.com',
      password: 'hashgfsfged_password', // Don't forget to hash the password in real life!
      subscriptions: {
        create: {
          name: 'Netgfgffslix Subscription',
          amount: 12.99,
          billingCycle: 'monthly',
          startDate: new Date(),
          dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Next month
          paymentMethod: 'Credit Card',
          autoPay: true,
        },
      },
    },
  });

  console.log('User and subscription created:', user);
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
