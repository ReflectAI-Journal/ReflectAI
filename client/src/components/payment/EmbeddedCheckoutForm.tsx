import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { Loader2, CreditCard, Shield, Calendar } from 'lucide-react';

interface EmbeddedCheckoutFormProps {
  planId: string;
  planName: string;
  planPrice: string;
  isAnnual: boolean;
}

const EmbeddedCheckoutForm: React.FC<EmbeddedCheckoutFormProps> = ({ 
  planId, 
  planName, 
  planPrice, 
  isAnnual 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    agreeToTerms: false,
    subscribeToNewsletter: false
  });

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#0f172a',
        fontFamily: 'Inter, system-ui, sans-serif',
        lineHeight: '1.5',
        backgroundColor: '#ffffff',
        padding: '12px 16px',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        '::placeholder': {
          color: '#64748b',
        },
      },
      invalid: {
        color: '#dc2626',
        iconColor: '#dc2626',
      },
      complete: {
        color: '#059669',
        iconColor: '#059669',
      },
    },
    hidePostalCode: false,
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Payment system not ready",
        description: "Please wait a moment and try again.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.dateOfBirth || !formData.address || !formData.city || 
        !formData.state || !formData.zipCode) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate age
    if (calculateAge(formData.dateOfBirth) < 13) {
      toast({
        title: "Age restriction",
        description: "You must be at least 13 years old to subscribe.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the Terms and Conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create subscription with payment method
      const response = await apiRequest('POST', '/api/create-subscription', {
        planId,
        isAnnual,
        customerInfo: formData,
        newsletterOptIn: formData.subscribeToNewsletter
      });

      const { clientSecret, subscriptionId } = await response.json();

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            address: {
              line1: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipCode,
              country: formData.country,
            },
          },
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        toast({
          title: "Payment failed",
          description: error.message || "Your payment could not be processed.",
          variant: "destructive",
        });
      } else if (paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment successful!",
          description: `Welcome to ${planName}! Your subscription is now active.`,
        });
        
        // Navigate to app after successful payment
        setTimeout(() => {
          navigate('/app');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription failed",
        description: error.message || "Unable to create subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-xl shadow-lg border border-border/40 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Secure Checkout</h2>
          </div>
          <p className="text-blue-100">
            Subscribe to {planName} - {planPrice} {isAnnual ? 'annually' : 'monthly'}
          </p>
          <div className="flex items-center gap-2 mt-2 text-sm text-blue-100">
            <Calendar className="h-4 w-4" />
            <span>7-day free trial included</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div>
            <h3 className="text-lg font-medium mb-4">Billing Address</h3>
            
            <div className="mb-4">
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-medium mb-4">Payment Information</h3>
            <div className="relative">
              <div className="border border-input rounded-md px-3 py-4 bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 min-h-[56px] flex items-center">
                <CardElement 
                  options={cardElementOptions}
                  className="w-full"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Your payment information is encrypted and secure.
            </p>
          </div>

          {/* Terms and Newsletter */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked === true)}
                required
              />
              <Label htmlFor="agreeToTerms" className="text-sm">
                I agree to the{' '}
                <button 
                  type="button"
                  onClick={() => window.open('/terms-of-service', '_blank')}
                  className="text-blue-600 hover:underline"
                >
                  Terms and Conditions
                </button>{' '}
                and{' '}
                <button 
                  type="button"
                  onClick={() => window.open('/privacy-policy', '_blank')}
                  className="text-blue-600 hover:underline"
                >
                  Privacy Policy
                </button>
                *
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="subscribeToNewsletter"
                checked={formData.subscribeToNewsletter}
                onCheckedChange={(checked) => handleInputChange('subscribeToNewsletter', checked === true)}
              />
              <Label htmlFor="subscribeToNewsletter" className="text-sm">
                Subscribe to our newsletter for updates and tips
              </Label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!stripe || isProcessing || !formData.agreeToTerms}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                Start 7-Day Free Trial
              </>
            )}
          </Button>

          {/* Stripe Trust Badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-6 mb-4">
            <Shield className="h-4 w-4" />
            <span>Secured by</span>
            <div className="flex items-center gap-1">
              <svg className="h-5 w-auto" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M59.5 12.5c0-6.904-5.596-12.5-12.5-12.5S34.5 5.596 34.5 12.5 40.096 25 47 25s12.5-5.596 12.5-12.5zM47 22.727c5.657 0 10.227-4.57 10.227-10.227S52.657 2.273 47 2.273 36.773 6.843 36.773 12.5 41.343 22.727 47 22.727z" fill="#635BFF"/>
                <path d="M25.51 4.35c-4.51 0-7.56 2.47-7.56 6.16 0 2.73 1.66 4.53 4.43 5.42l1.07.35c1.66.54 2.47 1.04 2.47 1.89 0 .85-.81 1.35-2.12 1.35-1.43 0-2.58-.58-3.42-1.73l-1.85 1.85c1.15 1.54 2.96 2.35 5.23 2.35 4.93 0 7.87-2.47 7.87-6.35 0-2.96-1.85-4.7-4.7-5.61l-1.04-.35c-1.43-.46-2.16-.92-2.16-1.73 0-.77.69-1.27 1.73-1.27 1.2 0 2.12.46 2.85 1.39l1.77-1.77C29.41 5.23 27.68 4.35 25.51 4.35zM13.78 4.7v15.61h3.62v-5.96h2.35c4.39 0 7.29-2.73 7.29-6.85 0-4.08-2.9-6.8-7.29-6.8H13.78zm3.62 3.08h2.27c2.16 0 3.35 1.12 3.35 2.96 0 1.85-1.19 2.96-3.35 2.96h-2.27V7.78z" fill="#635BFF"/>
              </svg>
            </div>
          </div>
          
          {/* Additional Trust Indicators */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>PCI Compliant</span>
            </div>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            You won't be charged until your 7-day free trial ends.
          </p>
        </form>
      </div>
    </div>
  );
};

export default EmbeddedCheckoutForm;