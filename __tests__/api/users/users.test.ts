/**
 * @jest-environment node
 */
import { testApiHandler } from 'next-test-api-route-handler';
import * as usersHandler from '@/app/api/users/route';
import { prisma } from '@/lib/db';
import { faker } from '@faker-js/faker';

// Helper function to clean database
async function cleanDatabase() {
    await prisma.task.deleteMany();
    await prisma.category.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();
}

describe('/api/users', () => {
    // Clean database before each test to ensure isolation
    beforeEach(async () => {
        await cleanDatabase();
    });

    // Clean up after all tests complete
    afterAll(async () => {
        await cleanDatabase();
        await prisma.$disconnect();
    });

    describe('GET /api/users', () => {
        it('should return empty array when no users exist', async () => {
            await testApiHandler({
                appHandler: usersHandler,
                test: async ({ fetch }) => {
                    const response = await fetch({ method: 'GET' });
                    const json = await response.json();

                    expect(response.status).toBe(200);
                    expect(json.success).toBe(true);
                    expect(json.data).toEqual([]);
                },
            });
        });

        it('should return all users successfully', async () => {
            // Create test users directly in database
            const user1 = await prisma.user.create({
                data: {
                    email: faker.internet.email(),
                    name: faker.person.fullName(),
                },
            });

            const user2 = await prisma.user.create({
                data: {
                    email: faker.internet.email(),
                    name: faker.person.fullName(),
                },
            });

            await testApiHandler({
                appHandler: usersHandler,
                test: async ({ fetch }) => {
                    const response = await fetch({ method: 'GET' });
                    const json = await response.json();

                    expect(response.status).toBe(200);
                    expect(json.success).toBe(true);
                    expect(json.data).toHaveLength(2);

                    // Check that both users are returned
                    const userIds = json.data.map(
                        (user: { id: string }) => user.id
                    );
                    expect(userIds).toContain(user1.id);
                    expect(userIds).toContain(user2.id);
                },
            });
        });

        it('should return users with their profiles', async () => {
            // Create user with profiles
            await prisma.user.create({
                data: {
                    email: faker.internet.email(),
                    name: faker.person.fullName(),
                    profiles: {
                        create: [
                            {
                                name: 'Work Profile',
                                color: '#3B82F6',
                            },
                        ],
                    },
                },
            });

            await testApiHandler({
                appHandler: usersHandler,
                test: async ({ fetch }) => {
                    const response = await fetch({ method: 'GET' });
                    const json = await response.json();

                    expect(response.status).toBe(200);
                    expect(json.success).toBe(true);
                    expect(json.data).toHaveLength(1);
                    expect(json.data[0].profiles).toHaveLength(1);
                    expect(json.data[0].profiles[0].name).toBe('Work Profile');
                },
            });
        });
    });

    describe('POST /api/users', () => {
        it('should create a new user with valid data', async () => {
            const userData = {
                email: faker.internet.email(),
                name: faker.person.fullName(),
            };

            await testApiHandler({
                appHandler: usersHandler,
                test: async ({ fetch }) => {
                    const response = await fetch({
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(userData),
                    });
                    const json = await response.json();

                    expect(response.status).toBe(201);
                    expect(json.success).toBe(true);
                    expect(json.message).toBe('User created successfully');
                    expect(json.data.email).toBe(userData.email);
                    expect(json.data.name).toBe(userData.name);
                    expect(json.data.id).toBeDefined();
                    expect(json.data.profiles).toEqual([]);

                    // Verify user was actually created in database
                    const dbUser = await prisma.user.findUnique({
                        where: { id: json.data.id },
                    });
                    expect(dbUser).toBeTruthy();
                    expect(dbUser?.email).toBe(userData.email);
                    expect(dbUser?.name).toBe(userData.name);
                },
            });
        });

        it('should reject duplicate email addresses', async () => {
            const email = faker.internet.email();

            // Create user with this email first
            await prisma.user.create({
                data: {
                    email,
                    name: faker.person.fullName(),
                },
            });

            // Try to create another user with same email
            await testApiHandler({
                appHandler: usersHandler,
                test: async ({ fetch }) => {
                    const response = await fetch({
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email,
                            name: faker.person.fullName(),
                        }),
                    });
                    const json = await response.json();

                    expect(response.status).toBe(500);
                    expect(json.success).toBe(false);
                    expect(json.error).toContain('Failed to create user');
                },
            });
        });

        it('should reject invalid email format', async () => {
            await testApiHandler({
                appHandler: usersHandler,
                test: async ({ fetch }) => {
                    const response = await fetch({
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: 'invalid-email',
                            name: faker.person.fullName(),
                        }),
                    });
                    const json = await response.json();

                    expect(response.status).toBe(400);
                    expect(json.success).toBe(false);
                    expect(json.error).toBe('Validation failed');
                    expect(json.details?.email).toContain(
                        'Invalid email address'
                    );
                },
            });
        });

        it('should reject missing required fields', async () => {
            await testApiHandler({
                appHandler: usersHandler,
                test: async ({ fetch }) => {
                    const response = await fetch({
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: faker.internet.email() }), // Missing name
                    });
                    const json = await response.json();

                    expect(response.status).toBe(400);
                    expect(json.success).toBe(false);
                    expect(json.error).toBe('Validation failed');
                    expect(json.details?.name).toBe('Required');
                },
            });
        });

        it('should reject empty name', async () => {
            await testApiHandler({
                appHandler: usersHandler,
                test: async ({ fetch }) => {
                    const response = await fetch({
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: faker.internet.email(),
                            name: '',
                        }),
                    });
                    const json = await response.json();

                    expect(response.status).toBe(400);
                    expect(json.success).toBe(false);
                    expect(json.error).toBe('Validation failed');
                    expect(json.details?.name).toContain('Name is required');
                },
            });
        });

        it('should reject name that is too long', async () => {
            const longName = 'a'.repeat(101); // 101 characters, exceeds 100 limit

            await testApiHandler({
                appHandler: usersHandler,
                test: async ({ fetch }) => {
                    const response = await fetch({
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: faker.internet.email(),
                            name: longName,
                        }),
                    });
                    const json = await response.json();

                    expect(response.status).toBe(400);
                    expect(json.success).toBe(false);
                    expect(json.error).toBe('Validation failed');
                    expect(json.details?.name).toContain(
                        'at most 100 characters'
                    );
                },
            });
        });

        it('should reject email that is too long', async () => {
            const longEmail = 'a'.repeat(250) + '@example.com'; // Exceeds 255 limit

            await testApiHandler({
                appHandler: usersHandler,
                test: async ({ fetch }) => {
                    const response = await fetch({
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: longEmail,
                            name: faker.person.fullName(),
                        }),
                    });
                    const json = await response.json();

                    expect(response.status).toBe(400);
                    expect(json.success).toBe(false);
                    expect(json.error).toBe('Validation failed');
                    expect(json.details?.email).toContain(
                        'at most 255 characters'
                    );
                },
            });
        });
    });
});
