import SignIn from '@/components/auth/sign-in';
import SignUp from '@/components/auth/sign-up';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
	return (
		<div className='flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black'>
			<main className='flex min-h-screen w-full max-w-3xl flex-col items-center justify-between bg-white px-16 py-32 sm:items-start dark:bg-black'>
				<Tabs defaultValue='signin' className='w-full'>
					<TabsList>
						<TabsTrigger value='signin'>Sign In</TabsTrigger>
						<TabsTrigger value='signup'>Sign Up</TabsTrigger>
					</TabsList>
					<TabsContent value='signin'>
						<SignIn />
					</TabsContent>
					<TabsContent value='signup'>
						<SignUp />
					</TabsContent>
				</Tabs>
			</main>
		</div>
	);
}
