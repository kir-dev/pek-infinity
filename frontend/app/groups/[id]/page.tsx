import { GroupHeader } from '@/components/groups/group-header';
import { GroupInfo } from '@/components/groups/group-info';
import { GroupMembers } from '@/components/groups/group-members';
import { Navbar } from '@/components/navbar';

export default function Page() {
  return (
    <>
      <Navbar />
      <GroupHeader />
      <GroupInfo />
      <GroupMembers />
    </>
  );
}
