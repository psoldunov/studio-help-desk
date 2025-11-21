'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth/client';

export default function TestPageClient({
	session,
}: {
	session: {
		session: {
			id: string;
			createdAt: Date;
			updatedAt: Date;
			userId: string;
			expiresAt: Date;
			token: string;
			ipAddress?: string | null | undefined;
			userAgent?: string | null | undefined;
		};
		user: {
			id: string;
			createdAt: Date;
			updatedAt: Date;
			email: string;
			emailVerified: boolean;
			name: string;
			image?: string | null | undefined;
		};
	};
}) {
	const router = useRouter();

	return (
		<div>
			{`Logged in as ${session.user.email}`}
			<Button
				onClick={async () =>
					await signOut({
						fetchOptions: {
							onSuccess: () => {
								router.push('/');
							},
						},
					})
				}
			>
				Sign Out
			</Button>
		</div>
	);
}
