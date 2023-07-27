import { prisma } from '../../src/db/prisma';

const run = async () => {
  await prisma.user.createMany({
    data: [
      {
        email: 'test1@test.com',
        password: 'password1',
      },
      {
        email: 'test2@test.com',
        password: 'password2',
      },
      {
        email: 'test3@test.com',
        password: 'password3',
      },
    ],
  });
};

// Auto-run if main script (not imported)
if (require.main === module) {
  run().then(() => {
    console.log('Data seed complete');
    process.exit();
  });
}
