import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Step9Invite = () => {
  const [email1, setEmail1] = useState('');
  const [email2, setEmail2] = useState('');
  const [email3, setEmail3] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboarding();
  const { refreshOnboardingStatus } = useAuth();

  const handleComplete = async () => {
    setError('');
    setLoading(true);

    try {
      const validEmails = [email1, email2, email3].filter(email => email.trim() !== '');
      const response = await completeOnboarding({ inviteEmails: validEmails });
      // Refresh onboarding status to mark it as complete
      await refreshOnboardingStatus();
      // Redirect to first project if available, otherwise dashboard
      const redirectPath = response?.redirectTo || '/dashboard';
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await completeOnboarding({ inviteEmails: [] });
      // Refresh onboarding status to mark it as complete
      await refreshOnboardingStatus();
      // Redirect to first project if available, otherwise dashboard
      const redirectPath = response?.redirectTo || '/dashboard';
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Invite Your Team</h2>
        <p className="text-gray-600">
          Invite team members to collaborate with you. You can also do this later.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-3">
          Email Addresses
        </label>
        <div className="space-y-3">
          <Input
            type="email"
            value={email1}
            onChange={(e) => setEmail1(e.target.value)}
            placeholder="teammate1@example.com"
          />
          <Input
            type="email"
            value={email2}
            onChange={(e) => setEmail2(e.target.value)}
            placeholder="teammate2@example.com"
          />
          <Input
            type="email"
            value={email3}
            onChange={(e) => setEmail3(e.target.value)}
            placeholder="teammate3@example.com"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/onboarding/step8')}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleSkip}
          disabled={loading}
        >
          Skip for now
        </Button>
        <Button
          type="button"
          onClick={handleComplete}
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Completing...' : 'Complete Setup'}
        </Button>
      </div>
    </div>
  );
};

export default Step9Invite;
