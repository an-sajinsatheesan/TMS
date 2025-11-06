import PropTypes from 'prop-types';

const Footer = ({ className = "" }) => {
  return (
    <footer className={`text-center text-sm text-gray-600 ${className}`}>
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <a
          href="https://asana.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-900 transition-colors"
        >
          Asana.com
        </a>
        <span className="text-gray-400">•</span>
        <a
          href="#"
          className="hover:text-gray-900 transition-colors"
        >
          Support
        </a>
        <span className="text-gray-400">•</span>
        <a
          href="#"
          className="hover:text-gray-900 transition-colors"
        >
          Integrations
        </a>
        <span className="text-gray-400">•</span>
        <a
          href="#"
          className="hover:text-gray-900 transition-colors"
        >
          Forum
        </a>
        <span className="text-gray-400">•</span>
        <a
          href="#"
          className="hover:text-gray-900 transition-colors"
        >
          Developers & API
        </a>
        <span className="text-gray-400">•</span>
        <a
          href="#"
          className="hover:text-gray-900 transition-colors"
        >
          Resources
        </a>
        <span className="text-gray-400">•</span>
        <a
          href="#"
          className="hover:text-gray-900 transition-colors"
        >
          Guide
        </a>
        <span className="text-gray-400">•</span>
        <a
          href="#"
          className="hover:text-gray-900 transition-colors"
        >
          Templates
        </a>
        <span className="text-gray-400">•</span>
        <a
          href="#"
          className="hover:text-gray-900 transition-colors"
        >
          Pricing
        </a>
        <span className="text-gray-400">•</span>
        <a
          href="#"
          className="hover:text-gray-900 transition-colors"
        >
          Terms
        </a>
        <span className="text-gray-400">•</span>
        <a
          href="#"
          className="hover:text-gray-900 transition-colors"
        >
          Privacy
        </a>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        This site is protected by reCAPTCHA and the Google{' '}
        <a href="#" className="underline hover:text-gray-700">
          Privacy Policy
        </a>{' '}
        and{' '}
        <a href="#" className="underline hover:text-gray-700">
          Terms of Service
        </a>{' '}
        apply.
      </div>
    </footer>
  );
};

Footer.propTypes = {
  className: PropTypes.string
};

export default Footer;
