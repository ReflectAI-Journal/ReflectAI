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



  const isFormValid = () => {
    return formData.firstName && formData.lastName && formData.email && 
           formData.address && formData.city && formData.state && formData.zipCode;
  };

  const handleContinue = () => {
    // Store form data in sessionStorage for the next step
    sessionStorage.setItem('checkoutPersonalInfo', JSON.stringify(formData));
    
    // Get plan from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan');
    
    navigate(`/checkout-step2?plan=${plan}`);
  };

  // US States array
  const US_STATES = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' },
    { value: 'DC', label: 'District of Columbia' }
  ];

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
            Step 2 of 3: Tell us about yourself
          </p>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-full flex items-center justify-center font-bold">1</div>
              <span className="font-medium text-gray-500">Choose Plan</span>
            </div>
            <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <span className="font-medium text-blue-600">Personal Info</span>
            </div>
            <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-full flex items-center justify-center font-bold">3</div>
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
          
          <CardContent className="checkout-form space-y-8">

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
                  <Label htmlFor="state" className="text-base font-medium">State*</Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger className="mt-2 h-12 text-base">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {US_STATES.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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