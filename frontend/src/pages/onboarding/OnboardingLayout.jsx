import { Outlet } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import Logo from '../../components/common/Logo';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';

const OnboardingLayout = () => {
  const { currentStep } = useOnboarding();

  return (
    <div className="min-h-screen h-screen flex overflow-hidden bg-white">
      {/* Left section - 35% width */}
      <div className="w-full lg:w-[35%] flex flex-col">
        {/* Header with Logo and Language Switcher */}
        <header className="flex items-center justify-between px-8 py-6">
          <Logo />
          <LanguageSwitcher />
        </header>

        {/* Progress Bar - Full width of left section */}
        <div className="px-8 mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / 9) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content Area - Start right after progress bar */}
        <div className="flex-1 px-8 overflow-y-auto">
          <Outlet />
        </div>
      </div>

      {/* Right section - 65% width - Image/Preview Area */}
      <div className="hidden lg:flex w-[65%] bg-pink-50 items-center justify-center p-12">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p className="text-lg">Preview Area</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
