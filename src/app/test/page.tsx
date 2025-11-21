import getSession from '@/lib/auth/actions/session';
import TestPageClient from './_page-client';

export default async function TestPage() {
	const session = await getSession();

	return (
		<div>
			{session ? <TestPageClient session={session} /> : 'Not logged in'}
		</div>
	);
}
