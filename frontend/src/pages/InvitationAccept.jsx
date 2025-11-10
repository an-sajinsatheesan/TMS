import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, Building2, Users } from 'lucide-react';
import { invitationService } from '../api/invitation.service';

const InvitationAccept = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [inviteDetails, setInviteDetails] = useState(null);

  useEffect(() => {
    verifyInvitation();
  }, [token]);

  const verifyInvitation = async () => {
    try {
      const response = await invitationService.getInvitationDetails(token);
      setInviteDetails(response.data.invitation);
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.response?.data?.message || 'Invalid or expired invitation link');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setAccepting(true);
    setError('');

    try {
      const response = await invitationService.acceptInvitation(token);
      const { user, tenant, project, type } = response.data;

      // Check if user needs to complete profile (new user without password)
      if (!user.isEmailVerified) {
        // New user - redirect to complete profile with invitation token
        navigate('/complete-profile', {
          state: {
            email: user.email,
            fromInvitation: true,
            invitationToken: token, // Pass the token for later authentication
            invitationData: {
              userId: user.id,
              tenantId: tenant.id,
              tenantName: tenant.name,
              projectId: project?.id,
              projectName: project?.name,
              type
            }
          },
          replace: true
        });
      } else {
        // Existing user with password - redirect to login with context
        navigate('/login', {
          state: {
            message: `Successfully joined ${type === 'PROJECT' ? `project "${project.name}"` : `workspace "${tenant.name}"`}`,
            email: user.email,
            fromInvitation: true,
            redirectTo: type === 'PROJECT'
              ? `/workspace/${tenant.id}/project/${project.id}`
              : `/workspace/${tenant.id}`
          },
          replace: true
        });
      }
    } catch (err) {
      console.error('Accept error:', err);
      setError(err.response?.data?.message || 'Failed to accept invitation');
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        {error ? (
          <>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </>
        ) : inviteDetails ? (
          <>
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                {inviteDetails.type === 'PROJECT' ? (
                  <Users className="h-8 w-8 text-blue-600" />
                ) : (
                  <Building2 className="h-8 w-8 text-blue-600" />
                )}
              </div>
              <h1 className="text-2xl font-bold mb-2">You've been invited!</h1>
              <p className="text-gray-600 mb-4">
                {inviteDetails.inviter?.fullName || inviteDetails.inviter?.email} invited you to join
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-500 mb-1">
                  {inviteDetails.type === 'PROJECT' ? 'Project' : 'Workspace'}
                </p>
                <p className="font-semibold text-gray-900">
                  {inviteDetails.type === 'PROJECT'
                    ? inviteDetails.project?.name
                    : inviteDetails.tenant?.name}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Role: {inviteDetails.type === 'PROJECT' ? inviteDetails.projectRole : inviteDetails.role}
                </p>
              </div>

              <p className="text-sm text-gray-500">
                Email: <span className="font-medium text-gray-700">{inviteDetails.email}</span>
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleAccept}
                className="w-full"
                disabled={accepting}
              >
                {accepting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {accepting ? 'Accepting...' : 'Accept Invitation'}
              </Button>
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="w-full"
                disabled={accepting}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default InvitationAccept;
