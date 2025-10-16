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
      email: 'o.olaniran@minibank.com',
      password: 'password123',
      firstName: 'Oluwatosin',
      lastName: 'Olaniran',
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

        // Create initial accounts with custom balances for test user
        await accountsService.createInitialAccounts(user.id, 25000.00, 25000.00);
        console.log(`💰 Created accounts for ${user.email} (USD: $25,000.00, EUR: €25,000.00)`);
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }

    console.log('\n🎉 Database seeding completed!');
    console.log('\n📝 Test user created:');
    console.log('   Email: o.olaniran@minibank.com | Password: password123');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await app.close();
  }
}

seed();
