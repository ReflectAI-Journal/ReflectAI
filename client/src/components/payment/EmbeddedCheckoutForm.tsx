import React, { useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements,
  PaymentElement
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Lock, MapPin, Calendar, Shield, Check, Star } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Trust Header with Stripe Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-green-500" />
            <h1 className="text-2xl font-bold text-foreground">Secure Checkout</h1>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
            <span>Powered by</span>
            <div className="text-lg font-bold text-primary tracking-wide">stripe</div>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-green-500 mb-4">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>256-bit SSL encryption</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              <span>PCI DSS compliant</span>
            </div>
          </div>
          <p className="text-muted-foreground">Your payment information is encrypted and secure</p>
        </div>

        <Card className="shadow-2xl border bg-card/90 backdrop-blur-sm">
          <CardHeader className="text-center bg-gradient-to-r from-primary to-violet-600 text-white rounded-t-lg p-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-300" />
              <CardTitle className="text-xl font-semibold">
                Subscribe to {plan.name}
              </CardTitle>
            </div>
            <CardDescription className="text-primary-foreground/90 text-lg">
              ${plan.price}/{plan.interval} • 7-day free trial included
            </CardDescription>
            <div className="bg-green-500/20 text-green-100 px-3 py-1 rounded-full text-sm font-medium mt-3 inline-block">
              Free for 7 days, then ${plan.price}/{plan.interval}
            </div>
          </CardHeader>
        
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
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

                <div className="grid grid-cols-2 gap-4">
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

                <div className="grid grid-cols-2 gap-4">
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
                
                <div className="border rounded-lg p-6 bg-background">
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
                            spacingUnit: '4px',
                            borderRadius: '6px'
                          }
                        }
                      }}
                    />
                  ) : (
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}