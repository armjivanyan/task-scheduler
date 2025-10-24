import 'reflect-metadata';
import dataSource from '../ormconfig';
import { User } from '../modules/users/user.entity';
import * as bcrypt from 'bcryptjs';


async function run() {
  await dataSource.initialize();
  const userRepo = dataSource.getRepository(User);


  // Seed admin user
  const admin = await userRepo.findOne({ where: { email: 'admin@example.com' } });
  if (!admin) {
    const password = await bcrypt.hash('Admin123!', 10);
    await userRepo.save(userRepo.create({
      name: 'Admin',
      email: 'admin@example.com',
      password,
    }));
    console.log('Seeded admin user: admin@example.com / Admin123!');
  } else {
    console.log('Admin already exists.');
  }

  // Seed test users
  const testUsers = [
    { name: 'John', email: 'user1@example.com' },
    { name: 'Jack', email: 'user2@example.com' },
    { name: 'Lily', email: 'user3@example.com' },
  ];
  for (const u of testUsers) {
    const exists = await userRepo.findOne({ where: { email: u.email } });
    if (!exists) {
      const password = await bcrypt.hash('Test123!', 10);
      await userRepo.save(userRepo.create({
        name: u.name,
        email: u.email,
        password,
      }));
      console.log(`Seeded test user: ${u.email} / Test123!`);
    } else {
      console.log(`Test user already exists: ${u.email}`);
    }
  }

  await dataSource.destroy();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});