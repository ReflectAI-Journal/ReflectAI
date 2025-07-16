import React, { useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Shield, Check, Star } from 'lucide-react';
import { useLocation } from 'wouter';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
}

interface EmbeddedCheckoutFormProps {
  plan: SubscriptionPlan;
  clientSecret?: string;
  onSuccess?: () => void;
}

export default function EmbeddedCheckoutForm({ plan, clientSecret, onSuccess }: EmbeddedCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [, navigate] = useLocation();
  
  // Form state for billing information
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    dateOfBirth: '',
    agreeToTerms: false,
    subscribeToNewsletter: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Validate age (must be 13+)
    if (formData.dateOfBirth) {
      const age = calculateAge(formData.dateOfBirth);
      if (age < 13) {
        toast({
          title: 'Age Requirement',
          description: 'You must be at least 13 years old to create an account.',
          variant: 'destructive',
        });
        return;
      }
    }

    // Validate terms agreement
    if (!formData.agreeToTerms) {
      toast({
        title: 'Terms Agreement Required',
        description: 'Please agree to the Terms and Conditions to continue.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements?.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
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
      });

      if (error) {
        throw error;
      }

      // Create subscription on the backend
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          planId: plan.id,
          customerInfo: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            subscribeToNewsletter: formData.subscribeToNewsletter,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subscription');
      }

      const result = await response.json();

      toast({
        title: 'Payment Successful!',
        description: 'Your subscription has been activated.',
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/checkout-success?plan=' + plan.id);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background p-0 m-0">
      {/* Trust Header */}
      <div className="text-center py-6 px-6 bg-background border-b-2 border-border">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Shield className="h-6 w-6 text-green-500" />
          <h1 className="text-2xl font-bold text-foreground">Secure Checkout</h1>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
          <span>Powered by</span>
          <div className="text-lg font-bold text-primary tracking-wide">stripe</div>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-green-500 mb-3">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>256-bit SSL encryption</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span>PCI DSS compliant</span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">Your payment information is encrypted and secure</p>
      </div>



      {/* Main Content - Full Width Two Column Layout */}
      <div className="w-full max-w-none p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
          
          {/* Left Column - Plan Summary */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="sticky top-6">
              {/* Plan Header */}
              <div className="bg-gradient-to-br from-primary to-violet-600 text-white p-6 rounded-t-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-5 w-5 text-yellow-300" />
                  <h2 className="text-xl font-semibold">
                    {plan.name} Plan
                  </h2>
                </div>
                <div className="mb-4">
                  <div className="text-3xl font-bold mb-1">
                    ${plan.price}
                    <span className="text-lg font-normal text-primary-foreground/80">/{plan.interval}</span>
                  </div>
                  <div className="bg-green-500/20 text-green-100 px-3 py-1 rounded-full text-sm font-medium inline-block">
                    7-day free trial included
                  </div>
                </div>
                <p className="text-primary-foreground/90 text-sm">
                  Free for 7 days, then ${plan.price}/{plan.interval}
                </p>
              </div>

              {/* Plan Features */}
              <div className="bg-card border-2 border-border rounded-b-xl p-6">
                <h3 className="font-semibold text-foreground mb-4">
                  What's included:
                </h3>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <div className="w-5 h-5 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-green-500" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Billing Info */}
                <div className="mt-6 pt-4 border-t-2 border-border">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="text-foreground">${plan.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Free trial:</span>
                      <span className="text-green-600">-${plan.price}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base pt-2 border-t-2 border-border">
                      <span>Total today:</span>
                      <span>$0.00</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      You'll be charged ${plan.price} after your 7-day trial ends.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Checkout Form */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-card border-2 border-border rounded-xl p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary text-sm font-semibold">1</span>
                    </div>
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-foreground">First Name *</Label>
                      <Input
                        id="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="mt-1 bg-background border-border text-foreground"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-foreground">Last Name *</Label>
                      <Input
                        id="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="mt-1 bg-background border-border text-foreground"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label htmlFor="email" className="text-foreground">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-1 bg-background border-border text-foreground"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="dateOfBirth" className="text-foreground">Date of Birth * (Must be 13+ years old)</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="mt-1 bg-background border-border text-foreground"
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Billing Address */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary text-sm font-semibold">2</span>
                    </div>
                    Billing Address
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address" className="text-foreground">Street Address *</Label>
                      <Input
                        id="address"
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="mt-1 bg-background border-border text-foreground"
                        placeholder="Enter your street address"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-foreground">City *</Label>
                        <Input
                          id="city"
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="mt-1 bg-background border-border text-foreground"
                          placeholder="Enter your city"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-foreground">State/Province</Label>
                        <Input
                          id="state"
                          type="text"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          className="mt-1 bg-background border-border text-foreground"
                          placeholder="Enter your state"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="zipCode" className="text-foreground">Zip/Postal Code *</Label>
                        <Input
                          id="zipCode"
                          type="text"
                          required
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange('zipCode', e.target.value)}
                          className="mt-1 bg-background border-border text-foreground"
                          placeholder="Enter your zip code"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country" className="text-foreground">Country *</Label>
                        <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                          <SelectTrigger className="mt-1 bg-background border-border text-foreground">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="GB">United Kingdom</SelectItem>
                            <SelectItem value="AU">Australia</SelectItem>
                            <SelectItem value="DE">Germany</SelectItem>
                            <SelectItem value="FR">France</SelectItem>
                            <SelectItem value="ES">Spain</SelectItem>
                            <SelectItem value="IT">Italy</SelectItem>
                            <SelectItem value="NL">Netherlands</SelectItem>
                            <SelectItem value="SE">Sweden</SelectItem>
                            <SelectItem value="NO">Norway</SelectItem>
                            <SelectItem value="DK">Denmark</SelectItem>
                            <SelectItem value="FI">Finland</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary text-sm font-semibold">3</span>
                    </div>
                    Payment Method
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="card-element" className="text-foreground">Card Details *</Label>
                      <div id="card-element" className="mt-1 p-4 border-2 border-border rounded-lg bg-background hover:border-gray-400 focus-within:border-primary transition-colors duration-200 min-h-[56px] flex items-center cursor-text">
                        <CardElement
                          options={{
                            style: {
                              base: {
                                fontSize: '16px',
                                color: 'hsl(var(--foreground))',
                                backgroundColor: 'hsl(var(--background))',
                                '::placeholder': {
                                  color: 'hsl(var(--muted-foreground))',
                                },
                                fontFamily: 'Inter, system-ui, sans-serif',
                                fontWeight: '400',
                                lineHeight: '24px',
                              },
                              invalid: {
                                color: '#ef4444',
                                iconColor: '#ef4444',
                              },
                              complete: {
                                color: '#059669',
                                iconColor: '#059669',
                              },
                              focus: {
                                color: 'hsl(var(--foreground))',
                              },
                            },
                            hidePostalCode: true,
                          }}
                          onReady={() => {
                            console.log('CardElement is ready');
                          }}
                          onChange={(event) => {
                            console.log('CardElement changed:', event);
                            if (event.error) {
                              console.error('Card error:', event.error);
                            }
                          }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enter your card number, expiry date (MM/YY), and CVC code
                      </p>
                    </div>
                    
                    {/* Security indicators */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        SSL Secured
                      </div>
                      <div className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        PCI Compliant
                      </div>
                      <div className="flex items-center gap-1">
                        Powered by Stripe
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Preferences */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
                      className="mt-1"
                    />
                    <label htmlFor="agreeToTerms" className="text-sm text-foreground leading-relaxed">
                      I agree to the{' '}
                      <a href="/terms-of-service" target="_blank" className="text-primary hover:underline">
                        Terms & Conditions
                      </a>{' '}
                      and{' '}
                      <a href="/privacy-policy" target="_blank" className="text-primary hover:underline">
                        Privacy Policy
                      </a>
                      . *
                    </label>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="subscribeToNewsletter"
                      checked={formData.subscribeToNewsletter}
                      onCheckedChange={(checked) => handleInputChange('subscribeToNewsletter', checked)}
                      className="mt-1"
                    />
                    <label htmlFor="subscribeToNewsletter" className="text-sm text-muted-foreground leading-relaxed">
                      Subscribe to our newsletter for updates and mental wellness tips (optional)
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="space-y-4">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-700 text-white font-semibold text-lg"
                    disabled={!stripe || isProcessing || !formData.agreeToTerms}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5 mr-2" />
                        Start Free Trial
                      </>
                    )}
                  </Button>

                  <div className="text-center space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Your payment is secured by Stripe. We never store your payment information.
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        <span>SSL Secured</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        <span>PCI Compliant</span>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}