import UserProfile from '@/features/post_connexion/Accueils/components/UserProfile';

export default async function UserProfilePage({ 
  params 
}: { 
  params: Promise<{ userId: string }> 
}) {
  const { userId } = await params;
  
  return <UserProfile userId={userId} />;
}