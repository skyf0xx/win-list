import { profileService, categoryService, taskService } from '@/lib/db';

export async function createSampleData(userId: string) {
    try {
        const workProfile = await profileService.create({
            user: { connect: { id: userId } },
            name: 'Work',
            color: '#3B82F6',
        });

        const personalProfile = await profileService.create({
            user: { connect: { id: userId } },
            name: 'Personal',
            color: '#10B981',
        });

        const workCategories = await Promise.all([
            categoryService.create({
                profile: { connect: { id: workProfile.id } },
                name: 'Meetings',
                color: '#8B5CF6',
            }),
            categoryService.create({
                profile: { connect: { id: workProfile.id } },
                name: 'Development',
                color: '#F59E0B',
            }),
        ]);

        const personalCategories = await Promise.all([
            categoryService.create({
                profile: { connect: { id: personalProfile.id } },
                name: 'Health',
                color: '#EF4444',
            }),
            categoryService.create({
                profile: { connect: { id: personalProfile.id } },
                name: 'Shopping',
                color: '#EC4899',
            }),
        ]);

        const sampleTasks = [
            // Work tasks
            {
                profile: { connect: { id: workProfile.id } },
                category: { connect: { id: workCategories[0].id } }, // Meetings
                title: 'Team standup meeting',
                description: 'Daily standup with the development team',
                status: 'PENDING' as const,
                priority: 'MEDIUM' as const,
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
                sortOrder: 1,
            },
            {
                profile: { connect: { id: workProfile.id } },
                category: { connect: { id: workCategories[1].id } }, // Development
                title: 'Complete user authentication feature',
                description:
                    'Implement OAuth login and user session management',
                status: 'IN_PROGRESS' as const,
                priority: 'HIGH' as const,
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
                sortOrder: 2,
            },
            {
                profile: { connect: { id: workProfile.id } },
                category: { connect: { id: workCategories[1].id } }, // Development
                title: 'Code review for PR #123',
                description:
                    'Review and provide feedback on the new API endpoints',
                status: 'PENDING' as const,
                priority: 'MEDIUM' as const,
                dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
                sortOrder: 3,
            },
            // Personal tasks
            {
                profile: { connect: { id: personalProfile.id } },
                category: { connect: { id: personalCategories[0].id } }, // Health
                title: 'Schedule dentist appointment',
                description: 'Annual cleaning and checkup',
                status: 'PENDING' as const,
                priority: 'LOW' as const,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
                sortOrder: 1,
            },
            {
                profile: { connect: { id: personalProfile.id } },
                category: { connect: { id: personalCategories[1].id } }, // Shopping
                title: 'Buy groceries for the week',
                description: 'Milk, bread, fruits, vegetables, and protein',
                status: 'COMPLETED' as const,
                priority: 'MEDIUM' as const,
                dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday (completed)
                sortOrder: 2,
            },
        ];

        // Create all tasks
        const createdTasks = await Promise.all(
            sampleTasks.map((task) => taskService.create(task))
        );

        return {
            profiles: [workProfile, personalProfile],
            categories: [...workCategories, ...personalCategories],
            tasks: createdTasks,
        };
    } catch (error) {
        console.error('Error creating sample data:', error);
        throw error;
    }
}
