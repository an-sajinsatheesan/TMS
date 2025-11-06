import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Step3Profile = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { setCurrentStep, saveProfile } = useOnboarding();

  const handleContinue = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name');
      return;
    }

    setError('');
    setSaving(true);

    try {
      await saveProfile({ firstName, lastName });
      setCurrentStep(4);
      navigate('/onboarding/step4');
    } catch (err) {
      console.error('Save error:', err);
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Tell us about yourself</h2>
        <p className="text-gray-600">
          Let's personalize your experience.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6 mb-8">
        <div className="flex flex-col gap-2">
          <label htmlFor="firstName" className="block text-sm font-semibold">
            First Name *
          </label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            disabled={saving}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="lastName" className="block text-sm font-semibold">
            Last Name *
          </label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            disabled={saving}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/onboarding/step2')}
          disabled={saving}
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!firstName.trim() || !lastName.trim() || saving}
          className="flex-1"
        >
          {saving ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default Step3Profile;
