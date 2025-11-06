import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useAuth } from '../../contexts/AuthContext';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import 'primereact/resources/themes/lara-light-teal/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

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
    <div className="card p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Invite Your Team</h2>
        <p className="text-gray-600">
          Invite team members to collaborate with you. You can also do this later.
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Message severity="error" text={error} className="w-full" />
        </div>
      )}

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-semibold mb-3">
          Email Addresses
        </label>
        <div className="space-y-3">
          <InputText
            type="email"
            value={email1}
            onChange={(e) => setEmail1(e.target.value)}
            className="w-full"
            placeholder="teammate1@example.com"
          />
          <InputText
            type="email"
            value={email2}
            onChange={(e) => setEmail2(e.target.value)}
            className="w-full"
            placeholder="teammate2@example.com"
          />
          <InputText
            type="email"
            value={email3}
            onChange={(e) => setEmail3(e.target.value)}
            className="w-full"
            placeholder="teammate3@example.com"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => navigate('/onboarding/step8')}
          disabled={loading}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSkip}
          disabled={loading}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Skip for now
        </button>
        <button
          type="button"
          onClick={handleComplete}
          disabled={loading}
          className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Completing...' : 'Complete Setup'}
        </button>
      </div>
    </div>
  );
};

export default Step9Invite;
