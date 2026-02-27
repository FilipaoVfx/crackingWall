import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, Mail, User, MessageSquare, Terminal } from 'lucide-react';

// Supabase Edge Function URL — set in .env as PUBLIC_CONTACT_FUNCTION_URL
const CONTACT_URL = import.meta.env.PUBLIC_CONTACT_FUNCTION_URL as string;

const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

const ContactForm: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        company: '', // honeypot anti-bot (hidden field, must stay empty)
    });

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            const response = await fetch(CONTACT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok && result.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', subject: '', message: '', company: '' });
            } else {
                setErrorMessage(result.error || result.message || 'Something went wrong. Please try again.');
                setStatus('error');
            }
        } catch {
            setErrorMessage('Network error. Please check your connection.');
            setStatus('error');
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-brutal-dark-deeper border-4 border-brutal-black shadow-brutal p-8 relative overflow-hidden group"
            >
                {/* Cyberpunk terminal header */}
                <div className="flex items-center gap-2 mb-8 border-b-2 border-brutal-black pb-4">
                    <Terminal className="text-brutal-neon-cyan w-6 h-6" />
                    <h2 className="text-2xl font-brutal font-black uppercase tracking-tighter text-brutal-white">
                        Establish Connection
                    </h2>
                    <div className="flex-1" />
                    <div className="flex gap-2">
                        <div className="w-3 h-3 bg-brutal-red" />
                        <div className="w-3 h-3 bg-brutal-yellow" />
                        <div className="w-3 h-3 bg-brutal-lime" />
                    </div>
                </div>

                <div className="mb-8 p-4 bg-brutal-dark-bg border-l-4 border-brutal-neon-cyan italic text-sm font-mono text-gray-400">
                    <p className="mb-1 text-brutal-neon-cyan font-bold uppercase tracking-widest text-xs">// Sophisticated Channel</p>
                    <p>For high-priority inquiries: <span className="text-brutal-neon-cyan decoration-double underline">contact@crackingwall.art</span></p>
                </div>

                <AnimatePresence mode="wait">
                    {status === 'success' ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="py-12 flex flex-col items-center text-center"
                        >
                            <CheckCircle2 className="w-20 h-20 text-brutal-neon-green mb-4" />
                            <h3 className="text-2xl font-brutal font-black uppercase text-brutal-white mb-2">Transmission Received</h3>
                            <p className="text-gray-400 mb-8 max-w-sm">
                                Your message has been encrypted and sent through our secure channels. We will respond shortly.
                            </p>
                            <button
                                onClick={() => setStatus('idle')}
                                className="px-8 py-3 bg-brutal-neon-green text-black font-brutal font-black uppercase border-4 border-black shadow-brutal hover:shadow-none translate-y-[-4px] hover:translate-y-0 transition-all"
                            >
                                Send Another
                            </button>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Honeypot anti-bot: hidden from real users, bots fill it */}
                            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    tabIndex={-1}
                                    autoComplete="off"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-brutal font-black uppercase text-brutal-neon-pink flex items-center gap-2">
                                        <User size={14} /> Identity
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Subject Name"
                                        className="w-full bg-black border-2 border-brutal-dark-border p-3 text-white focus:border-brutal-neon-pink outline-none transition-colors font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-brutal font-black uppercase text-brutal-neon-cyan flex items-center gap-2">
                                        <Mail size={14} /> Return Signal
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="user@network.com"
                                        className="w-full bg-black border-2 border-brutal-dark-border p-3 text-white focus:border-brutal-neon-cyan outline-none transition-colors font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-sm font-brutal font-black uppercase text-brutal-neon-yellow flex items-center gap-2">
                                    <Terminal size={14} /> Subject Protocol
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="Inquiry / Feedback / Partnership"
                                    className="w-full bg-black border-2 border-brutal-dark-border p-3 text-white focus:border-brutal-neon-yellow outline-none transition-colors font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-brutal font-black uppercase text-brutal-neon-purple flex items-center gap-2">
                                    <MessageSquare size={14} /> Payload
                                </label>
                                <textarea
                                    required
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={5}
                                    placeholder="Enter your message here..."
                                    className="w-full bg-black border-2 border-brutal-dark-border p-3 text-white focus:border-brutal-neon-purple outline-none transition-colors font-mono resize-none"
                                />
                            </div>

                            {status === 'error' && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-2 p-4 bg-red-900/30 border-2 border-brutal-red text-brutal-red text-sm font-mono"
                                >
                                    <AlertCircle size={16} />
                                    {errorMessage}
                                </motion.div>
                            )}

                            <button
                                disabled={status === 'loading'}
                                type="submit"
                                className={`w-full py-4 relative group flex items-center justify-center gap-2 font-brutal font-black uppercase text-lg border-4 border-black shadow-brutal transition-all ${status === 'loading'
                                    ? 'bg-gray-600 cursor-wait'
                                    : 'bg-brutal-neon-cyan text-black hover:shadow-none hover:translate-x-1 hover:translate-y-1'
                                    }`}
                            >
                                {status === 'loading' ? (
                                    <>Encrypting...</>
                                ) : (
                                    <>
                                        Initialize Transfer
                                        <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </AnimatePresence>

                {/* Decorative elements */}
                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-brutal-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-brutal-neon-pink/5 rounded-full blur-3xl pointer-events-none" />
            </motion.div>
        </div>
    );
};

export default ContactForm;
