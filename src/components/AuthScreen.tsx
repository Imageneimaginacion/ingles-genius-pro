import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import {
    User, Mail, Lock, Eye, EyeOff, Check, Star, Sparkles,
    ArrowLeft, Rocket, Shield, AlertCircle
} from 'lucide-react';

interface AuthScreenProps {
    mode: 'adult' | 'kid';
    authMode: 'signin' | 'signup';
    setAuthMode: (mode: 'signin' | 'signup') => void;
    onBack: () => void;
    onSubmit: (data: any) => void;
    initialValues?: {
        name?: string;
        email?: string;
        age?: string;
    };
}

const AuthScreen: React.FC<AuthScreenProps> = ({ mode, authMode, setAuthMode, onBack, onSubmit, initialValues }) => {
    const isAdult = mode === 'adult';

    // Form State
    const [formData, setFormData] = useState({
        name: initialValues?.name || '',
        email: initialValues?.email || '',
        password: '',
        confirmPassword: '',
        age: initialValues?.age || '12',
        termsAccepted: false
    });

    // Update form if initialValues change (though unlikely to change while mounted)
    useEffect(() => {
        if (initialValues) {
            setFormData(prev => ({
                ...prev,
                name: initialValues.name || prev.name,
                email: initialValues.email || prev.email,
                age: initialValues.age || prev.age
            }));
        }
    }, [initialValues]);

    const [showPassword, setShowPassword] = useState(false);
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validation
    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (authMode === 'signup') {
            if (!formData.name.trim()) newErrors.name = isAdult ? "El nombre es obligatorio" : "¡Necesitamos tu nombre!";
            if (parseInt(formData.age) < 5) newErrors.age = "Edad inválida";

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = isAdult ? "Las contraseñas no coinciden" : "Las contraseñas no coinciden";
            }
            if (!formData.termsAccepted) {
                newErrors.termsAccepted = isAdult ? "Debes aceptar los términos" : "Debes aceptar ser un buen cadete";
            }
        }

        if (authMode === 'signin' || (authMode === 'signup' && formData.email)) {
            if (!formData.email.trim()) {
                newErrors.email = isAdult ? "El correo es obligatorio" : "El correo es necesario";
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = isAdult ? "Formato de correo inválido" : "Correo inválido";
            }
        }

        if (!formData.password) {
            newErrors.password = isAdult ? "La contraseña es obligatoria" : "Contraseña necesaria";
        } else if (authMode === 'signup' && formData.password.length < 6) {
            newErrors.password = isAdult ? "Mínimo 6 caracteres" : "Mínimo 6 caracteres";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        validate();
    }, [formData, authMode]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleSubmit = () => {
        setTouched({
            name: true, email: true, password: true, confirmPassword: true, age: true, termsAccepted: true
        });

        if (validate()) {
            setIsSubmitting(true);
            onSubmit(formData);
            setTimeout(() => setIsSubmitting(false), 2000);
        }
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1, y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        },
        exit: { opacity: 0, scale: 0.95 }
    };

    const inputClasses = (hasError: boolean) => `
        w-full pl-12 pr-4 py-3.5 rounded-xl outline-none transition-all duration-200 border-2
        ${isAdult
            ? `bg-[#1f2937] text-white placeholder-gray-500 border-gray-700 
               ${hasError ? 'border-red-500/50 focus:border-red-500' : 'focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'}`
            : `bg-white text-gray-900 placeholder-purple-300 font-medium
               ${hasError ? 'border-red-300 focus:border-red-400' : 'border-purple-100 focus:border-purple-400 focus:ring-4 focus:ring-purple-200'}`
        }
    `;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={authMode}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`
                    relative w-full max-w-lg mx-auto p-4 my-8 md:my-16
                    ${!isAdult && 'rotate-1 hover:rotate-0 transition-transform duration-300'}
                `}
            >
                {/* Kids Mode Decorative Elements */}
                {!isAdult && (
                    <div className="absolute inset-0 z-0 transform scale-105 pointer-events-none">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-6 -right-6 text-yellow-400"
                        >
                            <Star size={40} fill="currentColor" />
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute -bottom-4 -left-4 text-purple-400"
                        >
                            <Sparkles size={32} />
                        </motion.div>
                    </div>
                )}

                {/* Main Card */}
                <div className={`
                    relative z-10 overflow-hidden rounded-3xl shadow-2xl backdrop-blur-sm
                    ${isAdult
                        ? 'bg-space-card/90 border border-white/10 shadow-black/50'
                        : 'bg-white/95 border-4 border-white shadow-purple-500/20'
                    }
                `}>
                    {/* Header Section */}
                    <div className={`
                        p-8 pb-0 text-center relative
                        ${isAdult ? '' : 'bg-gradient-to-b from-purple-50 to-transparent'}
                    `}>
                        <button
                            onClick={onBack}
                            className={`
                                absolute top-6 left-6 p-2 rounded-full transition-colors
                                ${isAdult
                                    ? 'text-gray-400 hover:text-white hover:bg-white/5'
                                    : 'text-purple-400 hover:text-purple-600 hover:bg-purple-50'
                                }
                            `}
                        >
                            <ArrowLeft size={20} className="stroke-[3]" />
                        </button>

                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className={`
                                w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg
                                ${isAdult
                                    ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-brand-primary/20'
                                    : 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-orange-400/30'
                                }
                            `}
                        >
                            <Rocket size={40} className={`text-white ${!isAdult && 'animate-bounce'}`} />
                        </motion.div>

                        {/* Branding */}
                        <div className="mb-6">
                            <h1 className={`text-2xl font-black tracking-tight ${isAdult ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500'}`}>
                                Inglés Genius Pro
                            </h1>
                        </div>

                        <h2 className={`text-3xl font-bold mb-2 ${isAdult ? 'text-white font-heading' : 'text-purple-900 font-black'}`}>
                            {authMode === 'signin'
                                ? (isAdult ? 'Bienvenido de Nuevo' : '¡Hola de Nuevo!')
                                : (isAdult ? 'Crear Cuenta' : '¡Únete al Equipo!')}
                        </h2>
                        <p className={`text-sm ${isAdult ? 'text-gray-400' : 'text-purple-500 font-medium'}`}>
                            {authMode === 'signin'
                                ? (isAdult ? 'Ingresa tus credenciales para acceder' : 'Ingresa tus datos para continuar tu misión')
                                : (isAdult ? 'Comienza tu viaje de aprendizaje hoy' : 'Prepárate para despegar hacia el conocimiento')}
                        </p>
                    </div>

                    {/* Form Section */}
                    <div className="p-8 space-y-5">
                        {/* Name Input (SignUp only) */}
                        {authMode === 'signup' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-1">
                                <div className="relative group">
                                    <User className={`absolute top-4 left-4 w-5 h-5 transition-colors ${isAdult ? 'text-gray-500' : 'text-purple-300'}`} />
                                    <input
                                        type="text"
                                        placeholder={isAdult ? "Nombre Completo" : "Tu Nombre de Cadete"}
                                        value={formData.name}
                                        onChange={e => handleChange('name', e.target.value)}
                                        className={inputClasses(!!(touched.name && errors.name))}
                                    />
                                </div>
                                {touched.name && errors.name && (
                                    <p className="text-red-500 text-xs pl-2 flex items-center gap-1">
                                        <AlertCircle size={10} /> {errors.name}
                                    </p>
                                )}
                            </motion.div>
                        )}

                        {/* Email Input */}
                        <div className="space-y-1">
                            <div className="relative group">
                                <Mail className={`absolute top-4 left-4 w-5 h-5 transition-colors ${isAdult ? 'text-gray-500' : 'text-purple-300'}`} />
                                <input
                                    type="email"
                                    placeholder={isAdult ? "Correo Electrónico" : "Correo Electrónico"}
                                    value={formData.email}
                                    onChange={e => handleChange('email', e.target.value)}
                                    className={inputClasses(!!(touched.email && errors.email))}
                                />
                            </div>
                            {touched.email && errors.email && (
                                <p className="text-red-500 text-xs pl-2 flex items-center gap-1">
                                    <AlertCircle size={10} /> {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1">
                            <div className="relative group">
                                <Lock className={`absolute top-4 left-4 w-5 h-5 transition-colors ${isAdult ? 'text-gray-500' : 'text-purple-300'}`} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder={isAdult ? "Contraseña" : "Contraseña Secreta"}
                                    value={formData.password}
                                    onChange={e => handleChange('password', e.target.value)}
                                    className={inputClasses(!!(touched.password && errors.password))}
                                />
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute top-4 right-4 transition-colors ${isAdult ? 'text-gray-500 hover:text-white' : 'text-purple-300 hover:text-purple-500'}`}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {touched.password && errors.password && (
                                <p className="text-red-500 text-xs pl-2 flex items-center gap-1">
                                    <AlertCircle size={10} /> {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password (SignUp only) */}
                        {authMode === 'signup' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-1">
                                <div className="relative group">
                                    <Lock className={`absolute top-4 left-4 w-5 h-5 transition-colors ${isAdult ? 'text-gray-500' : 'text-purple-300'}`} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder={isAdult ? "Confirmar Contraseña" : "Confirmar Contraseña"}
                                        value={formData.confirmPassword}
                                        onChange={e => handleChange('confirmPassword', e.target.value)}
                                        className={inputClasses(!!(touched.confirmPassword && errors.confirmPassword))}
                                    />
                                </div>
                                {touched.confirmPassword && errors.confirmPassword && (
                                    <p className="text-red-500 text-xs pl-2 flex items-center gap-1">
                                        <AlertCircle size={10} /> {errors.confirmPassword}
                                    </p>
                                )}
                            </motion.div>
                        )}

                        {/* Age Slider (SignUp only) */}
                        {authMode === 'signup' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className={`p-4 rounded-xl border ${isAdult ? 'bg-space-dark/30 border-space-border' : 'bg-purple-50 border-purple-100'}`}
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <label className={`text-xs font-bold uppercase ${isAdult ? 'text-gray-400' : 'text-purple-600'}`}>
                                        {isAdult ? 'Edad' : 'Tu Edad'}
                                    </label>
                                    <span className={`text-xl font-bold ${isAdult ? 'text-brand-primary' : 'text-purple-600'}`}>
                                        {formData.age}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="80"
                                    value={formData.age}
                                    onChange={(e) => handleChange('age', e.target.value)}
                                    className={`
                                        w-full h-2 rounded-lg appearance-none cursor-pointer
                                        ${isAdult ? 'bg-space-light/20 accent-brand-primary' : 'bg-purple-200 accent-purple-500'}
                                    `}
                                />
                            </motion.div>
                        )}

                        {/* Terms Checkbox (SignUp only) */}
                        {authMode === 'signup' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="flex items-start gap-3 cursor-pointer group"
                                onClick={() => handleChange('termsAccepted', !formData.termsAccepted)}
                            >
                                <div className={`
                                    w-5 h-5 mt-0.5 rounded flex-shrink-0 flex items-center justify-center transition-all duration-200 border-2
                                    ${formData.termsAccepted
                                        ? (isAdult ? 'bg-brand-primary border-brand-primary text-white' : 'bg-green-400 border-green-400 text-white transform rotate-3')
                                        : (isAdult ? 'border-gray-600 group-hover:border-gray-400 bg-transparent' : 'border-purple-200 bg-white group-hover:border-purple-300')
                                    }
                                `}>
                                    {formData.termsAccepted && <Check size={14} strokeWidth={4} />}
                                </div>
                                <div className="space-y-0.5">
                                    <p className={`text-sm ${isAdult ? 'text-gray-400' : 'text-purple-800'}`}>
                                        {isAdult ? "Acepto los Términos y Política de Privacidad" : "Prometo portarme bien y aprender mucho"}
                                    </p>
                                    {touched.termsAccepted && errors.termsAccepted && (
                                        <p className="text-red-500 text-xs">{errors.termsAccepted}</p>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`
                                w-full py-4 rounded-xl font-bold text-lg shadow-lg relative overflow-hidden group
                                ${isAdult
                                    ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-brand-primary/25 hover:shadow-brand-primary/40'
                                    : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-orange-400/30 hover:shadow-orange-400/50'
                                }
                                disabled:opacity-70 disabled:cursor-not-allowed
                            `}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isSubmitting
                                    ? 'Procesando...'
                                    : (authMode === 'signin'
                                        ? (isAdult ? 'Iniciar Sesión' : '¡Entrar!')
                                        : (isAdult ? 'Crear Cuenta' : '¡Crear Cuenta!'))
                                }
                                {!isSubmitting && <ArrowLeft className="rotate-180" size={20} />}
                            </span>
                        </motion.button>

                        {/* Google Auth Divider */}
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className={`w-full border-t ${isAdult ? 'border-gray-700' : 'border-purple-100'}`}></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className={`px-2 ${isAdult ? 'bg-space-card text-gray-500' : 'bg-white text-purple-400'}`}>
                                    O continúa con
                                </span>
                            </div>
                        </div>

                        {/* Google Button */}
                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={credentialResponse => {
                                    if (credentialResponse.credential) {
                                        onSubmit({ google: true, token: credentialResponse.credential });
                                    }
                                }}
                                onError={() => alert("Google Login Failed")}
                                theme={isAdult ? 'filled_blue' : 'filled_black'}
                                shape="circle"
                                width="200px" // Adjusted to be compact or fit
                            />
                        </div>

                        {/* Toggle Mode Link */}
                        <p className="text-center mt-4">
                            <button
                                onClick={() => {
                                    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                                    setTouched({});
                                    setErrors({});
                                }}
                                className={`text-sm font-semibold hover:underline ${isAdult ? 'text-brand-accent' : 'text-purple-600'}`}
                            >
                                {authMode === 'signin'
                                    ? (isAdult ? "¿No tienes cuenta? Regístrate" : "¿No tienes cuenta? Registrate aquí")
                                    : (isAdult ? "¿Ya tienes cuenta? Inicia Sesión" : "¿Ya tienes cuenta? Entra aquí")
                                }
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AuthScreen;
