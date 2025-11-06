import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Plus, AlertCircle } from 'lucide-react';

const Step9Invite = () => {
  const [emails, setEmails] = useState(['']);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboarding();

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

  const handleFinish = async () => {
    const validEmails = emails.filter(email => email.trim());
    setError('');
    setSaving(true);

    try {
      await completeOnboarding({ inviteEmails: validEmails });
      // Navigate to dashboard or project view
      navigate('/login');
    } catch (err) {
      console.error('Complete error:', err);
      setError(err.response?.data?.message || 'Failed to complete onboarding. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setError('');
    setSaving(true);

    try {
      await completeOnboarding({ inviteEmails: [] });
      navigate('/login');
    } catch (err) {
      console.error('Complete error:', err);
      setError(err.response?.data?.message || 'Failed to complete onboarding. Please try again.');
    } finally {
      setSaving(false);
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

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
                disabled={saving}
              />
              {emails.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveEmail(index)}
                  disabled={saving}
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
          disabled={saving}
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
          disabled={saving}
        >
          Back
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={handleSkip}
          disabled={saving}
        >
          Skip
        </Button>
        <Button
          type="button"
          onClick={handleFinish}
          className="flex-1"
          disabled={saving}
        >
          {saving ? 'Finishing...' : 'Finish'}
        </Button>
      </div>
    </div>
  );
};

export default Step9Invite;
