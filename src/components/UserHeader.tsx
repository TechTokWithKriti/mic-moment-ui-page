
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const UserHeader = () => {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Welcome,</span>
          <span className="text-sm font-medium text-gray-900">{user.email}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default UserHeader;
