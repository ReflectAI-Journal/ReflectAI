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



      {/* Main Content - Clean Two Column Layout */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Payment Form */}
          <div className="lg:col-span-2 order-1">
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-semibold text-foreground mb-8">Payment method</h1>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Card Payment Section */}
                  <div className="border-2 border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-4 h-4 bg-primary rounded-full"></div>
                      <span className="font-medium text-foreground">Card</span>
                      <div className="flex gap-1 ml-auto">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAzMiAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iIzAwNTFBNSIvPgo8cGF0aCBkPSJNMTMuNzcgMTMuNzQzSDEyLjEzOEwxMS4yOTIgOS4xMThDMTEuMjM4IDguODk2IDExLjEyIDguNzQ4IDEwLjg5OCA4LjYzQzEwLjQ1NCA4LjQwNiA5Ljg5NiA4LjIzNCA5LjMzOCA4LjExNlY3LjgzOEgxMi4zNjRDMTIuNjQgNy44MzggMTIuODY0IDguMDA0IDEyLjkyIDguMjhMMTMuNDUyIDEwLjkwOEwxNS4wODQgNy44MzhIMTYuODM2TDE0LjMwNCAxMy43NDNIMTMuNzdaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K" alt="Visa" className="h-4" />
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAzMiAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iI0VCMDAxQiIvPgo8cGF0aCBkPSJNMTEuMzc2IDEzLjc0M0g5Ljc0NEw4Ljg5OCAxMC41NjNDOC44NDQgMTAuMzQxIDguNzI2IDEwLjE5MyA4LjUwNCAxMC4wNzVDOC4wNiA5Ljg1MSA3LjUwMiA5LjY3OSA2Ljk0NCA5LjU2MVY5LjI4M0gxMC4wMkMxMC4yOTYgOS4yODMgMTAuNTIgOS40NDkgMTAuNTc2IDkuNzI1TDExLjEwOCAxMi4zNTNMMTIuNzQgOS4yODNIMTQuNDkyTDExLjk2IDEzLjc0M0gxMS4zNzZaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K" alt="Mastercard" className="h-4" />
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAzMiAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iIzAwNjNEMCIvPgo8L3N2Zz4K" alt="Amex" className="h-4" />
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-6">
                      The bank may temporarily hold and release a small amount to verify your card.
                    </p>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="card-element" className="text-sm text-muted-foreground mb-2 block">Card number*</Label>
                        <div 
                          id="card-element" 
                          className="p-4 border border-border rounded-lg bg-background hover:border-ring focus-within:border-ring transition-colors duration-200 min-h-[50px] cursor-text"
                        >
                          <CardElement
                            options={{
                              style: {
                                base: {
                                  fontSize: '16px',
                                  color: 'hsl(var(--foreground))',
                                  backgroundColor: 'hsl(var(--background))',
                                  fontFamily: 'Inter, system-ui, sans-serif',
                                  fontWeight: '400',
                                  lineHeight: '1.5',
                                  '::placeholder': {
                                    color: 'hsl(var(--muted-foreground))',
                                  },
                                },
                                invalid: {
                                  color: '#ef4444',
                                  iconColor: '#ef4444',
                                },
                                complete: {
                                  color: '#059669',
                                  iconColor: '#059669',
                                },
                              },
                              hidePostalCode: true,
                              iconStyle: 'solid',
                            }}
                            onReady={() => {
                              console.log('CardElement ready');
                            }}
                            onChange={(event) => {
                              console.log('Card changed:', event.complete);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-6">Enter your name and address</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullName" className="text-sm text-muted-foreground">Full name*</Label>
                        <Input
                          id="fullName"
                          type="text"
                          value={`${formData.firstName} ${formData.lastName}`.trim()}
                          onChange={(e) => {
                            const names = e.target.value.split(' ');
                            setFormData(prev => ({
                              ...prev,
                              firstName: names[0] || '',
                              lastName: names.slice(1).join(' ') || ''
                            }));
                          }}
                          className="mt-1"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="country" className="text-sm text-muted-foreground">Country*</Label>
                          <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="US">🇺🇸 USA</SelectItem>
                              <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                              <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                              <SelectItem value="AU">🇦🇺 Australia</SelectItem>
                              <SelectItem value="DE">🇩🇪 Germany</SelectItem>
                              <SelectItem value="FR">🇫🇷 France</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="state" className="text-sm text-muted-foreground">State/Region*</Label>
                          <Input
                            id="state"
                            type="text"
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            className="mt-1"
                            placeholder="Enter state"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city" className="text-sm text-muted-foreground">City*</Label>
                          <Input
                            id="city"
                            type="text"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            className="mt-1"
                            placeholder="Enter city"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="zipCode" className="text-sm text-muted-foreground">Zip/Postal code*</Label>
                          <Input
                            id="zipCode"
                            type="text"
                            value={formData.zipCode}
                            onChange={(e) => handleInputChange('zipCode', e.target.value)}
                            className="mt-1"
                            placeholder="Enter zip code"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="address" className="text-sm text-muted-foreground">Address line 1*</Label>
                        <Input
                          id="address"
                          type="text"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="mt-1"
                          placeholder="Enter street address"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email" className="text-sm text-muted-foreground">Email*</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="mt-1"
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
                        className="mt-1"
                      />
                      <label htmlFor="agreeToTerms" className="text-sm text-muted-foreground leading-relaxed">
                        I authorize ReflectAI to charge me automatically until I cancel my subscription. I have read and agree to{' '}
                        <a href="/terms-of-service" target="_blank" className="text-primary hover:underline">
                          Terms of Use
                        </a>{' '}
                        and{' '}
                        <a href="/privacy-policy" target="_blank" className="text-primary hover:underline">
                          Privacy Policy
                        </a>
                        .
                      </label>
                    </div>
                  </div>

                  {/* Complete Purchase Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base"
                    disabled={!stripe || isProcessing || !formData.agreeToTerms}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Complete your purchase'
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1 order-2">
            <div className="space-y-6">
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">{plan.name} plan</h3>
                <div className="text-right text-lg font-semibold">${plan.price}</div>
                <p className="text-sm text-blue-600 hover:underline cursor-pointer">
                  Have a promo code?
                </p>
              </div>
              
              <div className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${plan.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>US ${plan.price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Billed every {plan.interval}.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}