/**
 * @jest-environment node
 */
import { testApiHandler } from 'next-test-api-route-handler';
import * as userByIdHandler from '@/app/api/users/[id]/route';
import { prisma } from '@/lib/db';
import { faker } from '@faker-js/faker';

// Helper function to clean database
async function cleanDatabase() {
    await prisma.task.deleteMany();
    await prisma.category.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();
}

describe('/api/users/[id]', () => {
    // Clean database before each test to ensure isolation
    beforeEach(async () => {
        await cleanDatabase();
    });

    // Clean up after all tests complete
    afterAll(async () => {
        await cleanDatabase();
        await prisma.$disconnect();
    });

    describe('GET /api/users/[id]', () => {
        it('should return user by valid ID', async () => {
            const user = await prisma.user.create({
                data: {
                    email: faker.internet.email(),
                    name: faker.person.fullName(),
                },
            });

            await testApiHandler({
                appHandler: userByIdHandler,
                params: { id: user.id },
                test: async ({ fetch }) => {
                    const response = await fetch({ method: 'GET' });
                    const json = await response.json();

                    expect(response.status).toBe(200);
                    expect(json.success).toBe(true);
                    expect(json.data.id).toBe(user.id);
                    expect(json.data.email).toBe(user.email);
                    expect(json.data.name).toBe(user.name);
                    expect(json.data.profiles).toEqual([]); // No profiles created yet
                },
            });
        });

        it('should return user with profiles when they exist', async () => {
            const user = await prisma.user.create({
                data: {
                    email: faker.internet.email(),
                    name: faker.person.fullName(),
                    profiles: {
                        create: [
                            {
                                name: 'Work Profile',
                                color: '#3B82F6',
                            },
                            {
                                name: 'Personal Profile',
                                color: '#10B981',
                            },
                        ],
                    },
                },
            });

            await testApiHandler({
                appHandler: userByIdHandler,
                params: { id: user.id },
                test: async ({ fetch }) => {
                    const response = await fetch({ method: 'GET' });
                    const json = await response.json();

                    expect(response.status).toBe(200);
                    expect(json.success).toBe(true);
                    expect(json.data.id).toBe(user.id);
                    expect(json.data.profiles).toHaveLength(2);
                    expect(json.data.profiles[0].name).toBe('Work Profile');
                },
            });
        });

        it('should return 404 for non-existent user', async () => {
            const nonExistentId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

            await testApiHandler({
                appHandler: userByIdHandler,
                params: { id: nonExistentId },
                test: async ({ fetch }) => {
                    const response = await fetch({ method: 'GET' });
                    const json = await response.json();

                    expect(response.status).toBe(404);
                    expect(json.success).toBe(false);
                    expect(json.error).toBe('User not found');
                },
            });
        });

        it('should return 400 for invalid UUID format', async () => {
            await testApiHandler({
                appHandler: userByIdHandler,
                params: { id: 'invalid-uuid' },
                test: async ({ fetch }) => {
                    const response = await fetch({ method: 'GET' });
                    const json = await response.json();

                    expect(response.status).toBe(400);
                    expect(json.success).toBe(false);
                    expect(json.error).toBe('Invalid user ID format');
                },
            });
        });
    });

    describe('PUT /api/users/[id]', () => {
        it('should update user with valid data', async () => {
            // Create a user to update
            const user = await prisma.user.create({
                data: {
                    email: faker.internet.email(),
                    name: faker.person.fullName(),
                },
            });

            const updateData = {
                name: 'Updated Name',
                email: faker.internet.email(),
            };

            await testApiHandler({
                appHandler: userByIdHandler,
                params: { id: user.id },
                test: async ({ fetch }) => {
                    const response = await fetch({
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updateData),
                    });
                    const json = await response.json();

                    expect(response.status).toBe(200);
                    expect(json.success).toBe(true);
                    expect(json.message).toBe('User updated successfully');
                    expect(json.data.name).toBe(updateData.name);
                    expect(json.data.email).toBe(updateData.email);

                    // Verify user was actually updated in database
                    const dbUser = await prisma.user.findUnique({
                        where: { id: user.id },
                    });
                    expect(dbUser?.name).toBe(updateData.name);
                    expect(dbUser?.email).toBe(updateData.email);
                },
            });
        });

        it('should update user with partial data', async () => {
            const user = await prisma.user.create({
                data: {
                    email: faker.internet.email(),
                    name: 'Original Name',
                },
            });

            const updateData = { name: 'Only Name Updated' };

            await testApiHandler({
                appHandler: userByIdHandler,
                params: { id: user.id },
                test: async ({ fetch }) => {
                    const response = await fetch({
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updateData),
                    });
                    const json = await response.json();

                    expect(response.status).toBe(200);
                    expect(json.success).toBe(true);
                    expect(json.data.name).toBe(updateData.name);
                    expect(json.data.email).toBe(user.email); // Should remain unchanged

                    // Verify in database
                    const dbUser = await prisma.user.findUnique({
                        where: { id: user.id },
                    });
                    expect(dbUser?.name).toBe(updateData.name);
                    expect(dbUser?.email).toBe(user.email);
                },
            });
        });

        it('should reject duplicate email in update', async () => {
            const user1 = await prisma.user.create({
                data: {
                    email: 'user1@example.com',
                    name: 'User 1',
                },
            });

            const user2 = await prisma.user.create({
                data: {
                    email: 'user2@example.com',
                    name: 'User 2',
                },
            });

            // Try to update user2 with user1's email
            await testApiHandler({
                appHandler: userByIdHandler,
                params: { id: user2.id },
                test: async ({ fetch }) => {
                    const response = await fetch({
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: user1.email }),
                    });
                    const json = await response.json();

                    expect(response.status).toBe(500);
                    expect(json.success).toBe(false);
                    expect(json.error).toContain('Failed to update user');
                },
            });
        });

        it('should reject invalid email format in update', async () => {
            const user = await prisma.user.create({
                data: {
                    email: faker.internet.email(),
                    name: faker.person.fullName(),
                },
            });

            await testApiHandler({
                appHandler: userByIdHandler,
                params: { id: user.id },
                test: async ({ fetch }) => {
                    const response = await fetch({
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: 'invalid-email' }),
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

        it('should return 404 when updating non-existent user', async () => {
            const nonExistentId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

            await testApiHandler({
                appHandler: userByIdHandler,
                params: { id: nonExistentId },
                test: async ({ fetch }) => {
                    const response = await fetch({
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: 'Test Name' }),
                    });
                    const json = await response.json();

                    expect(response.status).toBe(500);
                    expect(json.success).toBe(false);
                    expect(json.error).toContain('Failed to update user');
                },
            });
        });
    });

    describe('DELETE /api/users/[id]', () => {
        it('should delete user successfully', async () => {
            const user = await prisma.user.create({
                data: {
                    email: faker.internet.email(),
                    name: faker.person.fullName(),
                },
            });

            await testApiHandler({
                appHandler: userByIdHandler,
                params: { id: user.id },
                test: async ({ fetch }) => {
                    const response = await fetch({ method: 'DELETE' });
                    const json = await response.json();

                    expect(response.status).toBe(200);
                    expect(json.success).toBe(true);
                    expect(json.message).toBe('User deleted successfully');
                    expect(json.data.id).toBe(user.id);

                    // Verify user was actually deleted from database
                    const dbUser = await prisma.user.findUnique({
                        where: { id: user.id },
                    });
                    expect(dbUser).toBeNull();
                },
            });
        });

        it('should delete user and cascade to profiles/tasks', async () => {
            const user = await prisma.user.create({
                data: {
                    email: faker.internet.email(),
                    name: faker.person.fullName(),
                    profiles: {
                        create: {
                            name: 'Test Profile',
                            categories: {
                                create: {
                                    name: 'Test Category',
                                },
                            },
                            tasks: {
                                create: {
                                    title: 'Test Task',
                                    description: 'Test task description',
                                },
                            },
                        },
                    },
                },
            });

            await testApiHandler({
                appHandler: userByIdHandler,
                params: { id: user.id },
                test: async ({ fetch }) => {
                    const response = await fetch({ method: 'DELETE' });
                    const json = await response.json();

                    expect(response.status).toBe(200);
                    expect(json.success).toBe(true);

                    // Verify cascade deletion worked
                    const dbUser = await prisma.user.findUnique({
                        where: { id: user.id },
                    });
                    const profiles = await prisma.profile.findMany({
                        where: { userId: user.id },
                    });
                    const tasks = await prisma.task.findMany({
                        where: { profile: { userId: user.id } },
                    });

                    expect(dbUser).toBeNull();
                    expect(profiles).toHaveLength(0);
                    expect(tasks).toHaveLength(0);
                },
            });
        });

        it('should return 404 when deleting non-existent user', async () => {
            const nonExistentId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

            await testApiHandler({
                appHandler: userByIdHandler,
                params: { id: nonExistentId },
                test: async ({ fetch }) => {
                    const response = await fetch({ method: 'DELETE' });
                    const json = await response.json();

                    expect(response.status).toBe(500);
                    expect(json.success).toBe(false);
                    expect(json.error).toContain('Failed to delete user');
                },
            });
        });

        it('should return 400 for invalid UUID in delete', async () => {
            await testApiHandler({
                appHandler: userByIdHandler,
                params: { id: 'invalid-uuid' },
                test: async ({ fetch }) => {
                    const response = await fetch({ method: 'DELETE' });
                    const json = await response.json();

                    expect(response.status).toBe(400);
                    expect(json.success).toBe(false);
                    expect(json.error).toBe('Invalid user ID format');
                },
            });
        });
    });
});
