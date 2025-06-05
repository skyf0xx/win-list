'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ProfileCreateForm } from './profile-create-form';
import { useCreateProfile } from '@/hooks/api';

interface ProfileCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onSuccess?: (profileId: string) => void;
}

export function ProfileCreationModal({
    isOpen,
    onClose,
    userId,
    onSuccess,
}: ProfileCreationModalProps) {
    const createProfileMutation = useCreateProfile();

    const handleSubmit = async (data: { name: string; color?: string }) => {
        try {
            const newProfile = await createProfileMutation.mutateAsync({
                userId,
                name: data.name,
                color: data.color,
            });

            onSuccess?.(newProfile.id);
            onClose();
        } catch (error) {
            console.error('Failed to create profile:', error);
        }
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Create New Profile</DialogTitle>
                    <DialogDescription>
                        Create a new profile to organize your tasks by context
                        like Work, Personal, etc.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <ProfileCreateForm
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        loading={createProfileMutation.isPending}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
