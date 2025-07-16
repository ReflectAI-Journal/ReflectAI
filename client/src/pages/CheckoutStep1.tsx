import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation } from 'wouter';
import { ArrowRight, User, MapPin, Mail } from 'lucide-react';
import BackButton from '@/components/ui/back-button';

export default function CheckoutStep1() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoogleAutofill = () => {
    // Mock Google autofill - in real implementation, this would use Google's Address API
    setFormData({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@gmail.com',
      address: '123 Main Street',
      city: 'San Francisco',
      state: 'California',
      zipCode: '94102'
    });
  };

  const handleContinue = () => {
    // Store form data in sessionStorage for the next step
    sessionStorage.setItem('checkoutPersonalInfo', JSON.stringify(formData));
    
    // Get plan from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan');
    
    navigate(`/checkout-step2?plan=${plan}`);
  };

  const isFormValid = () => {
    return formData.firstName && formData.lastName && formData.email && 
           formData.address && formData.city && formData.state && formData.zipCode;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20">
      <div className="max-w-4xl mx-auto p-8 py-16">
        <BackButton />
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Personal Information
          </h1>
          <p className="text-xl text-muted-foreground">
            Step 1 of 2: Tell us about yourself
          </p>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <span className="font-medium text-blue-600">Personal Info</span>
            </div>
            <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-full flex items-center justify-center font-bold">2</div>
              <span className="font-medium text-gray-500">Payment</span>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="max-w-2xl mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-2 border-gray-200 dark:border-gray-700 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <User className="h-6 w-6 text-blue-500" />
              </div>
              Your Information
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Google Autofill Option */}
            <div className="text-center">
              <Button
                onClick={handleGoogleAutofill}
                variant="outline"
                className="bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Fill with Google
              </Button>
              <p className="text-sm text-muted-foreground mt-2">Quick signup with your Google account</p>
              
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                <span className="text-sm text-muted-foreground">or fill manually</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Personal Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName" className="text-base font-medium">First name*</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="mt-2 h-12 text-base"
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName" className="text-base font-medium">Last name*</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="mt-2 h-12 text-base"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email" className="text-base font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email address*
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-2 h-12 text-base"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold">Billing Address</h3>
              </div>
              
              <div>
                <Label htmlFor="address" className="text-base font-medium">Street address*</Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="mt-2 h-12 text-base"
                  placeholder="123 Main Street"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="city" className="text-base font-medium">City*</Label>
                  <Input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="mt-2 h-12 text-base"
                    placeholder="City"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="state" className="text-base font-medium">State/Province*</Label>
                  <Input
                    id="state"
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="mt-2 h-12 text-base"
                    placeholder="State/Province"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="zipCode" className="text-base font-medium">Postal code*</Label>
                  <Input
                    id="zipCode"
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="mt-2 h-12 text-base"
                    placeholder="ZIP/Postal"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <div className="pt-6">
              <Button
                onClick={handleContinue}
                disabled={!isFormValid()}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Continue to Payment
                <ArrowRight className="h-5 w-5 ml-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}