'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle } from 'lucide-react';
import { MagneticElement } from '@/components/animations/MagneticElement';
import { cn } from '@/lib/utils';

const contactSchema = z.object({
  name: z.string().min(2, 'At least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  serviceType: z.enum(['mobile', 'web', 'saas', 'design', 'other']),
  budget: z.string().optional(),
  message: z.string().min(20, 'At least 20 characters').max(2000),
});

type ContactData = z.infer<typeof contactSchema>;

type Status = 'idle' | 'loading' | 'success' | 'error';

const inputClass = cn(
  'w-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3',
  'text-[var(--color-text-1)] placeholder:text-[var(--color-text-3)]',
  'transition-colors duration-200 focus:border-[var(--color-accent)] focus:outline-none',
);

const errorClass = 'mt-1.5 text-xs text-red-400';

export function ContactForm() {
  const t = useTranslations('contact.form');
  const [status, setStatus] = useState<Status>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactData) => {
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Server error');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-start gap-4 py-12"
          >
            <CheckCircle
              size={40}
              className="text-[var(--color-accent-2)]"
              aria-hidden="true"
            />
            <p className="font-serif text-2xl text-[var(--color-text-1)]">{t('success')}</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-label="Contact form"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Name */}
              <div>
                <label htmlFor="cf-name" className="mb-2 block text-sm text-[var(--color-text-2)]">
                  {t('name')} <span aria-hidden="true">*</span>
                </label>
                <input
                  id="cf-name"
                  type="text"
                  placeholder={t('namePlaceholder')}
                  autoComplete="name"
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'cf-name-error' : undefined}
                  className={inputClass}
                  {...register('name')}
                />
                {errors.name && (
                  <p id="cf-name-error" className={errorClass} role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="cf-email" className="mb-2 block text-sm text-[var(--color-text-2)]">
                  {t('email')} <span aria-hidden="true">*</span>
                </label>
                <input
                  id="cf-email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  autoComplete="email"
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'cf-email-error' : undefined}
                  className={inputClass}
                  {...register('email')}
                />
                {errors.email && (
                  <p id="cf-email-error" className={errorClass} role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Service type */}
              <div>
                <label
                  htmlFor="cf-service"
                  className="mb-2 block text-sm text-[var(--color-text-2)]"
                >
                  {t('serviceType')} <span aria-hidden="true">*</span>
                </label>
                <select
                  id="cf-service"
                  aria-required="true"
                  aria-invalid={!!errors.serviceType}
                  aria-describedby={errors.serviceType ? 'cf-service-error' : undefined}
                  className={cn(inputClass, 'cursor-pointer')}
                  {...register('serviceType')}
                >
                  <option value="">{t('serviceTypeOptions.placeholder')}</option>
                  <option value="mobile">{t('serviceTypeOptions.mobile')}</option>
                  <option value="web">{t('serviceTypeOptions.web')}</option>
                  <option value="saas">{t('serviceTypeOptions.saas')}</option>
                  <option value="design">{t('serviceTypeOptions.design')}</option>
                  <option value="other">{t('serviceTypeOptions.other')}</option>
                </select>
                {errors.serviceType && (
                  <p id="cf-service-error" className={errorClass} role="alert">
                    {errors.serviceType.message}
                  </p>
                )}
              </div>

              {/* Budget */}
              <div>
                <label
                  htmlFor="cf-budget"
                  className="mb-2 block text-sm text-[var(--color-text-2)]"
                >
                  {t('budget')}
                </label>
                <select
                  id="cf-budget"
                  className={cn(inputClass, 'cursor-pointer')}
                  {...register('budget')}
                >
                  <option value="">{t('budgetOptions.placeholder')}</option>
                  <option value="under10k">{t('budgetOptions.under10k')}</option>
                  <option value="10k25k">{t('budgetOptions.10k25k')}</option>
                  <option value="25k50k">{t('budgetOptions.25k50k')}</option>
                  <option value="50k100k">{t('budgetOptions.50k100k')}</option>
                  <option value="over100k">{t('budgetOptions.over100k')}</option>
                </select>
              </div>

              {/* Message */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="cf-message"
                  className="mb-2 block text-sm text-[var(--color-text-2)]"
                >
                  {t('message')} <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="cf-message"
                  rows={6}
                  placeholder={t('messagePlaceholder')}
                  aria-required="true"
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'cf-message-error' : undefined}
                  className={cn(inputClass, 'resize-none')}
                  {...register('message')}
                />
                {errors.message && (
                  <p id="cf-message-error" className={errorClass} role="alert">
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* Honeypot — hidden from humans, caught on server */}
              <div className="hidden" aria-hidden="true">
                <input type="text" name="_honeypot" tabIndex={-1} autoComplete="off" />
              </div>
            </div>

            {/* Submit */}
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <MagneticElement>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className={cn(
                    'border border-[var(--color-accent)] px-8 py-3',
                    'text-sm font-medium text-[var(--color-accent)]',
                    'transition-colors duration-200 hover:bg-[var(--color-accent)] hover:text-white',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                >
                  {status === 'loading' ? t('submitting') : t('submit')}
                </button>
              </MagneticElement>

              {status === 'error' && (
                <p className="text-sm text-red-400" role="alert" aria-live="polite">
                  {t('error')}
                </p>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
