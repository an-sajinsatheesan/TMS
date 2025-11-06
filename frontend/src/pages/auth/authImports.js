// Common imports for all auth pages
export { useState } from 'react';
export { useForm } from 'react-hook-form';
export { yupResolver } from '@hookform/resolvers/yup';
export { useNavigate, useLocation } from 'react-router-dom';
export { useAuth } from '../../contexts/AuthContext';
export { InputText } from 'primereact/inputtext';
export { Password } from 'primereact/password';
export { Button } from 'primereact/button';
export { Message } from 'primereact/message';
export { classNames } from 'primereact/utils';
export { default as axios } from 'axios';

// PrimeReact styles - Import once in main file
import 'primereact/resources/themes/lara-light-teal/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
