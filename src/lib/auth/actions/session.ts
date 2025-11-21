import { headers } from 'next/headers';
import auth from '..';

export default async function getSession() {
	return await auth.api.getSession({
		headers: await headers(),
	});
}
