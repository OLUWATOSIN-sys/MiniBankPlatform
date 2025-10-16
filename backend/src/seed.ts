import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { AccountsService } from './accounts/accounts.service';
import { RegisterDto } from './auth/dto/register.dto';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const accountsService = app.get(AccountsService);

  console.log('🌱 Starting database seeding...');

  const testUsers: RegisterDto[] = [
    {
      email: 'alice@example.com',
      password: 'password123',
      firstName: 'Alice',
      lastName: 'Johnson',
    },
    {
      email: 'bob@example.com',
      password: 'password123',
      firstName: 'Bob',
      lastName: 'Smith',
    },
    {
      email: 'charlie@example.com',
      password: 'password123',
      firstName: 'Charlie',
      lastName: 'Brown',
    },
  ];

  try {
    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await usersService.findByEmail(userData.email);
        if (existingUser) {
          console.log(`⏭️  User ${userData.email} already exists, skipping...`);
          continue;
        }

        // Create user
        const user = await usersService.create(userData);
        console.log(`✅ Created user: ${user.email}`);

        // Create initial accounts
        await accountsService.createInitialAccounts(user._id.toString());
        console.log(`💰 Created accounts for ${user.email} (USD: $1000.00, EUR: €500.00)`);
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }

    console.log('\n🎉 Database seeding completed!');
    console.log('\n📝 Test users created:');
    console.log('   Email: alice@example.com | Password: password123');
    console.log('   Email: bob@example.com | Password: password123');
    console.log('   Email: charlie@example.com | Password: password123');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await app.close();
  }
}

seed();
