import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { completeOnboarding, clearError } from '../../store/slices/onboardingSlice';
import { refreshOnboardingStatus } from '../../store/slices/authSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '../../hooks/useToast.jsx';

const Step9Invite = () => {
  const [emails, setEmails] = useState(['']);
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error: reduxError } = useSelector((state) => state.onboarding);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleAddEmail = () => {
    setEmails([...emails, '']);
  };

  const handleRemoveEmail = (index) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  const handleEmailChange = (index, value) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleFinish = async (e) => {
    e.preventDefault();
    setLocalError('');

    const validEmails = emails.filter(email => email.trim());

    try {
      const response = await dispatch(completeOnboarding({ inviteEmails: validEmails })).unwrap();
      await dispatch(refreshOnboardingStatus());

      toast.success('Onboarding completed successfully!');

      // Navigate to dashboard with proper parameters
      const project = response?.project;
      const userId = user?.id;

      if (project?.id && userId) {
        navigate(`/dashboard/${userId}/${project.id}/board`, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      toast.error('Failed to complete onboarding', {
        description: err || 'Please try again'
      });
      setLocalError(err || 'Failed to complete onboarding. Please try again.');
    }
  };

  const handleSkip = async (e) => {
    e.preventDefault();
    setLocalError('');

    try {
      const response = await dispatch(completeOnboarding({ inviteEmails: [] })).unwrap();
      await dispatch(refreshOnboardingStatus());

      toast.success('Onboarding completed successfully!');

      // Navigate to dashboard with proper parameters
      const project = response?.project;
      const userId = user?.id;

      if (project?.id && userId) {
        navigate(`/dashboard/${userId}/${project.id}/board`, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      toast.error('Failed to complete onboarding', {
        description: err || 'Please try again'
      });
      setLocalError(err || 'Failed to complete onboarding. Please try again.');
    }
  };

  return (
    <div className="mb-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Invite your team</h2>
        <p className="text-gray-600">
          Collaborate better by inviting your team members.
        </p>
      </div>

      {(localError || reduxError) && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{localError || reduxError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleFinish}>
        <div className="space-y-6 mb-8">
          <div className="space-y-2">
            {emails.map((email, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                  placeholder="teammate@example.com"
                  className="flex-1"
                  disabled={loading}
                />
                {emails.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveEmail(index)}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            onClick={handleAddEmail}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Email
          </Button>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/onboarding/step7')}
            disabled={loading}
          >
            Back
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleSkip}
            disabled={loading}
          >
            {loading ? 'Skipping...' : 'Skip'}
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Finishing...' : 'Finish'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Step9Invite;
