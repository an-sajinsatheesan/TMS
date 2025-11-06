// Common imports for all onboarding pages
export { useState, useEffect } from 'react';
export { useNavigate } from 'react-router-dom';
export { useOnboarding } from '../../contexts/OnboardingContext';
export { InputText } from 'primereact/inputtext';
export { Button } from 'primereact/button';
export { Dropdown } from 'primereact/dropdown';
export { MultiSelect } from 'primereact/multiselect';
export { Chips } from 'primereact/chips';
export { Message } from 'primereact/message';
export { classNames } from 'primereact/utils';

// PrimeReact styles - Import once in main file
import 'primereact/resources/themes/lara-light-teal/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
