/**
 * Create Action page - Multi-step form for creating Blinch actions
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { InputField, AddressInput, AmountInput, ParameterBuilder } from '@/components/forms';
import { PaymentRequiredModal } from '@/components/tiers';
import type { ActionParameter } from '@/components/forms';
import { createActionFromRequest, saveAction } from '@/lib/storage';
import { isPaymentRequired, getPaymentRequirement } from '@/lib/tierApi';

type FormStep = 1 | 2 | 3 | 4;

interface FormData {
  // Step 1: Basic Info
  title: string;
  description: string;
  iconUrl: string;

  // Step 2: Fund Details
  recipientAddress: string;
  amount: string;
  customAmount: boolean;

  // Step 3: Customize
  actionType: string;
  parameters: ActionParameter[];
  creatorAddress: string;
}

const DEFAULT_FORM_DATA: FormData = {
  title: '',
  description: '',
  iconUrl: 'https://blinch.network/assets/icon.png',
  recipientAddress: '',
  amount: '0.01',
  customAmount: false,
  actionType: '',
  parameters: [],
  creatorAddress: '',
};

const ICON_PRESETS = [
  'https://blinch.network/assets/icon.png',
  'https://blinch.network/assets/tip-icon.png',
  'https://blinch.network/assets/donate-icon.png',
];

export default function CreateActionPage() {
  const router = useRouter();
  const [step, setStep] = useState<FormStep>(1);
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentRequirement, setPaymentRequirement] = useState<any>(null);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    // Clear error for updated field
    Object.keys(updates).forEach((key) => {
      if (key in errors) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[key as keyof FormData];
          return newErrors;
        });
      }
    });
  };

  const validateStep = (currentStep: FormStep): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (currentStep === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
      } else if (formData.title.length > 100) {
        newErrors.title = 'Title must be 100 characters or less';
      }

      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      } else if (formData.description.length > 500) {
        newErrors.description = 'Description must be 500 characters or less';
      }
    }

    if (currentStep === 2) {
      if (!formData.recipientAddress.trim()) {
        newErrors.recipientAddress = 'Recipient address is required';
      }

      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        newErrors.amount = 'Amount must be greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4) as FormStep);
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1) as FormStep);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setIsSubmitting(true);

    try {
      const actionRequest = {
        title: formData.title,
        description: formData.description,
        recipientAddress: formData.recipientAddress,
        amount: formData.amount,
        iconUrl: formData.iconUrl !== 'https://blinch.network/assets/icon.png' ? formData.iconUrl : undefined,
        actionType: formData.actionType || undefined,
        parameters: formData.parameters.length > 0 ? formData.parameters : undefined,
        creatorAddress: formData.creatorAddress || undefined,
      };

      // Call backend API
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actionRequest),
      });

      // Handle 402 Payment Required
      if (isPaymentRequired(response)) {
        const paymentReq = await getPaymentRequirement(response.clone());
        setIsSubmitting(false);
        setPaymentRequirement(paymentReq);
        setShowPaymentModal(true);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create action');
      }

      const data = await response.json();
      const actionId = data.id;

      // Save to localStorage for local management
      const action = createActionFromRequest(actionRequest, actionId);
      saveAction(action);

      // Navigate to success page with the actual ID from backend
      router.push(`/create/success?id=${actionId}`);
    } catch (error) {
      console.error('Failed to create action:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create action';
      alert(`Error: ${errorMessage}`);
      setIsSubmitting(false);
      setShowPaymentModal(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Basic Information</h3>
              <p className="text-gray-400">Tell users what your action does</p>
            </div>

            <InputField
              label="Action Title"
              name="title"
              placeholder="e.g., Coffee Tip Jar"
              required
              error={errors.title}
              helperText="A short, descriptive name for your action (max 100 characters)"
              maxLength={100}
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
            />

            <InputField
              label="Description"
              name="description"
              type="textarea"
              placeholder="e.g., Send me a tip for my coffee content!"
              required
              error={errors.description}
              helperText="Describe what this action is for (max 500 characters)"
              maxLength={500}
              rows={4}
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
            />

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">Icon (optional)</label>
              <div className="flex gap-3 flex-wrap">
                {ICON_PRESETS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => updateFormData({ iconUrl: icon })}
                    className={`
                      w-16 h-16 rounded-lg border-2 transition-all
                      ${formData.iconUrl === icon
                        ? 'border-primary bg-primary/20'
                        : 'border-white/10 hover:border-white/30'
                      }
                    `}
                  >
                    <img src={icon} alt="Icon" className="w-full h-full rounded-lg" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Fund Details</h3>
              <p className="text-gray-400">Where should payments go?</p>
            </div>

            <AddressInput
              label="Recipient Address"
              name="recipientAddress"
              required
              error={errors.recipientAddress}
              helperText="The Bitcoin Cash address that will receive the funds"
              value={formData.recipientAddress}
              onChange={(address) => updateFormData({ recipientAddress: address })}
            />

            <AmountInput
              label="Default Amount"
              name="amount"
              required
              error={errors.amount}
              helperText="Suggested amount for users (can be changed during execution)"
              defaultValue={formData.amount}
              allowCustom
              onChange={(e) => updateFormData({ amount: e.target.value })}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Customize (Optional)</h3>
              <p className="text-gray-400">Add custom parameters or an action type</p>
            </div>

            <InputField
              label="Action Type"
              name="actionType"
              placeholder="e.g., tip, donation, payment"
              helperText="A short identifier for your action type (optional)"
              value={formData.actionType}
              onChange={(e) => updateFormData({ actionType: e.target.value })}
            />

            <ParameterBuilder
              value={formData.parameters}
              onChange={(parameters) => updateFormData({ parameters })}
            />

            <details className="glass rounded-lg p-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-300">
                Advanced: Creator Verification
              </summary>
              <div className="mt-4 space-y-3">
                <p className="text-xs text-gray-500">
                  Add your BCH address to prove ownership and enable future editing/deletion of this action.
                </p>
                <AddressInput
                  label="Your Address (Optional)"
                  name="creatorAddress"
                  helperText="Used to verify ownership for edits/deletions"
                  value={formData.creatorAddress}
                  onChange={(address) => updateFormData({ creatorAddress: address })}
                />
              </div>
            </details>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Preview & Generate</h3>
              <p className="text-gray-400">Review your action before creating</p>
            </div>

            <div className="glass-strong rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                <img
                  src={formData.iconUrl}
                  alt="Icon"
                  className="w-16 h-16 rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="text-xl font-bold">{formData.title || 'Untitled'}</h4>
                  <p className="text-gray-400">{formData.description || 'No description'}</p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Recipient:</span>
                  <span className="font-mono text-accent">{formData.recipientAddress || 'Not set'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Amount:</span>
                  <span className="font-medium">{formData.amount || '0'} BCH</span>
                </div>
                {formData.actionType && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Type:</span>
                    <span className="font-medium">{formData.actionType}</span>
                  </div>
                )}
                {formData.parameters.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Parameters:</span>
                    <span className="font-medium">{formData.parameters.length}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                <strong>Note:</strong> This action will include the Blinch protocol identifier
                <code className="mx-1 px-2 py-0.5 rounded bg-black/30 text-accent">464c4f5701</code>
                in every transaction.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all
                      ${step >= stepNum
                        ? 'bg-primary text-white'
                        : 'bg-white/10 text-gray-500'
                      }
                    `}
                  >
                    {stepNum}
                  </div>
                  {stepNum < 4 && (
                    <div
                      className={`
                        w-16 h-1 mx-2 rounded transition-all
                        ${step > stepNum ? 'bg-primary' : 'bg-white/10'}
                      `}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 px-1">
              <span>Basic Info</span>
              <span>Fund Details</span>
              <span>Customize</span>
              <span>Preview</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="glass rounded-xl p-6 md:p-8">
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className="px-6 py-2.5 rounded-lg glass hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Back
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity font-medium"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-accent to-primary hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create Action'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Payment Required Modal */}
      {showPaymentModal && paymentRequirement && (
        <PaymentRequiredModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentRequirement(null);
          }}
          reason={paymentRequirement.message || paymentRequirement.error?.message || 'Premium upgrade required'}
          paymentDetails={paymentRequirement}
        />
      )}
    </div>
  );
}
