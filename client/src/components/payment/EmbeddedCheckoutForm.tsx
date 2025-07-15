import React, { useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements,
  PaymentElement
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Lock, MapPin, Shield, Check, Star } from 'lucide-react';
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
      toast({
        title: 'Payment Error',
        description: 'Payment system not ready. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.address || !formData.city || !formData.zipCode || 
        !formData.dateOfBirth || !formData.agreeToTerms) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields and agree to terms.',
        variant: 'destructive',
      });
      return;
    }

    // Validate age requirement (13+)
    const age = calculateAge(formData.dateOfBirth);
    if (age < 13) {
      toast({
        title: 'Age Requirement',
        description: 'You must be at least 13 years old to create an account.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      if (clientSecret) {
        // Use Payment Element for embedded checkout
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/checkout-success`,
            payment_method_data: {
              billing_details: {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                address: {
                  line1: formData.address,
                  city: formData.city,
                  state: formData.state,
                  postal_code: formData.zipCode,
                  country: formData.country,
                }
              }
            }
          },
          redirect: 'if_required'
        });

        if (error) {
          throw new Error(error.message);
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
          toast({
            title: 'Payment Successful!',
            description: 'Your subscription has been activated.',
          });
          
          if (onSuccess) {
            onSuccess();
          } else {
            navigate('/app/counselor');
          }
        }
      } else {
        // Fallback to creating payment intent
        const response = await fetch('/api/create-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            planId: plan.id,
            billingDetails: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              address: {
                line1: formData.address,
                city: formData.city,
                state: formData.state,
                postal_code: formData.zipCode,
                country: formData.country,
              }
            },
            subscribeToNewsletter: formData.subscribeToNewsletter
          })
        });

        if (!response.ok) {
          throw new Error(`Payment failed: ${response.statusText}`);
        }

        const { clientSecret: newClientSecret } = await response.json();

        if (newClientSecret) {
          const { error, paymentIntent } = await stripe.confirmCardPayment(newClientSecret, {
            payment_method: {
              card: elements.getElement(CardElement)!,
              billing_details: {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                address: {
                  line1: formData.address,
                  city: formData.city,
                  state: formData.state,
                  postal_code: formData.zipCode,
                  country: formData.country,
                }
              }
            }
          });

          if (error) {
            throw new Error(error.message);
          }

          toast({
            title: 'Payment Successful!',
            description: 'Your subscription has been activated.',
          });
          
          if (onSuccess) {
            onSuccess();
          } else {
            navigate('/app/counselor');
          }
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Trust Header with Stripe Branding */}
      <div className="text-center py-6 px-6 bg-background border-b border-border">
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

      {/* Two Column Layout */}
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
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
              <div className="bg-white dark:bg-gray-900 border border-border rounded-b-xl p-6">
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
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="text-foreground">${plan.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Free trial:</span>
                      <span className="text-green-600">-${plan.price}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
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
            <div className="bg-white dark:bg-gray-900 border border-border rounded-xl p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-border">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                  </div>
              
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-foreground">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="mt-1 h-11"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-foreground">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="mt-1 h-11"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1 h-11"
                  required
                />
              </div>

              <div>
                <Label htmlFor="dateOfBirth" className="text-sm font-medium text-foreground">
                  Date of Birth * <span className="text-xs text-muted-foreground">(Must be 13+ years old)</span>
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="mt-1 h-11"
                  required
                />
              </div>
            </div>

            {/* Billing Address */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="w-8 h-8 bg-violet-600/10 rounded-full flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-violet-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Billing Address</h3>
              </div>
              
              <div>
                <Label htmlFor="address" className="text-sm font-medium text-foreground">Street Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="mt-1 h-11"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-foreground">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="mt-1 h-11"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-sm font-medium text-foreground">State/Province</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="mt-1 h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipCode" className="text-sm font-medium text-foreground">ZIP/Postal Code *</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="mt-1 h-11"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="text-sm font-medium text-foreground">Country</Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                    <SelectTrigger className="mt-1 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Payment Information</h3>
              </div>
              
              <div className="w-full">
                {clientSecret ? (
                  <PaymentElement 
                    options={{
                      layout: 'accordion',
                      paymentMethodOrder: ['card'],
                      fields: {
                        billingDetails: 'never'
                      },
                      appearance: {
                        theme: 'night',
                        variables: {
                          colorPrimary: 'hsl(var(--primary))',
                          colorBackground: 'hsl(var(--background))',
                          colorText: 'hsl(var(--foreground))',
                          colorDanger: 'hsl(var(--destructive))',
                          fontFamily: 'Inter, system-ui, sans-serif',
                          spacingUnit: '6px',
                          borderRadius: '8px',
                          colorTextSecondary: 'hsl(var(--muted-foreground))',
                          colorTextPlaceholder: 'hsl(var(--muted-foreground))',
                          colorInputBackground: 'hsl(var(--background))',
                          colorInputBorder: 'hsl(var(--border))',
                          colorInputText: 'hsl(var(--foreground))'
                        },
                        rules: {
                          '.Input': {
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            color: 'hsl(var(--foreground))',
                            padding: '12px'
                          },
                          '.Input:focus': {
                            borderColor: 'hsl(var(--primary))',
                            boxShadow: '0 0 0 1px hsl(var(--primary))'
                          },
                          '.Tab': {
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            color: 'hsl(var(--foreground))'
                          },
                          '.Tab--selected': {
                            backgroundColor: 'hsl(var(--primary))',
                            borderColor: 'hsl(var(--primary))',
                            color: 'white'
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="p-6 bg-background border border-border rounded-lg">
                    <CardElement 
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: 'hsl(var(--foreground))',
                            fontFamily: 'Inter, system-ui, sans-serif',
                            backgroundColor: 'hsl(var(--background))',
                            '::placeholder': {
                              color: 'hsl(var(--muted-foreground))',
                            },
                          },
                        },
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Terms and Newsletter */}
            <div className="space-y-4 bg-muted/30 p-6 rounded-lg border">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed text-foreground">
                  I agree to the{' '}
                  <a href="/terms-of-service" target="_blank" className="text-primary hover:underline font-medium">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="/terms-of-service" target="_blank" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </a>{' '}
                  *
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="newsletter"
                  checked={formData.subscribeToNewsletter}
                  onCheckedChange={(checked) => handleInputChange('subscribeToNewsletter', checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="newsletter" className="text-sm leading-relaxed text-foreground">
                  Subscribe to our newsletter for updates and wellness tips (optional)
                </Label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-700 text-white font-semibold text-lg btn-hover-lift"
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