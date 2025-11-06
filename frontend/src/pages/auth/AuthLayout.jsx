import PropTypes from 'prop-types';
import Logo from '../../components/common/Logo';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import Footer from '../../components/common/Footer';

const AuthLayout = ({ children }) => {
    return (
        <div className="min-h-screen h-screen flex flex-col bg-white overflow-hidden">
            {/* Header with Logo and Language Switcher */}
            <header className="flex items-center justify-between px-8 py-6">
                <Logo />
                <LanguageSwitcher />
            </header>

            {/* Main Content - Centered Form */}
            <main className="flex-1 flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="pb-8 px-4">
                <Footer />
            </footer>
        </div>
    );
};

AuthLayout.propTypes = {
    children: PropTypes.node.isRequired
};

export default AuthLayout;
