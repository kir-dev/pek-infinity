import { Navbar } from '@/components/navbar';
import { ProfilePageComponent } from '@/components/profile-page';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <>
      <Navbar />
      <ProfilePageComponent />
    </>
  );
}
