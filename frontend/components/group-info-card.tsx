import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@radix-ui/react-tooltip';
import { UserIcon } from 'lucide-react';
import { Button } from './ui/button';

type GroupInfoCardProps = {
  Title: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  content: string;
  color: string;
};

export default function GroupInfoCard(props: GroupInfoCardProps) {
  return (
    <div className={`flex items-center justify-between bg-${props.color}-100 rounded-lg p-4`}>
      <div className='flex items-center space-x-2'>
        <UserIcon className={`h-6 w-6 text-${props.color}-600`} />
        <span className={`text-sm font-medium text-${props.color}-800`}>{props.Title}</span>
      </div>
      <span className={`text-2xl font-bold text-${props.color}-600`}>{props.content}</span>
    </div>
  );
}
