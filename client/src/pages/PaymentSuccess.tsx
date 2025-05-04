import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { useStripe } from '@stripe/react-stripe-js';
import { useToast } from '@/hooks/use-toast';

export default function PaymentSuccess() {
  const stripe = useStripe();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Retrieve the "payment_intent_client_secret" query parameter
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    // Retrieve the PaymentIntent using clientSecret
    if (clientSecret) {
      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        if (paymentIntent) {
          switch (paymentIntent.status) {
            case 'succeeded':
              toast({
                title: 'Payment Successful',
                description: 'Thank you for your purchase!',
              });
              break;
            case 'processing':
              toast({
                title: 'Payment Processing',
                description: 'Your payment is processing...',
              });
              break;
            case 'requires_payment_method':
              toast({
                title: 'Payment Failed',
                description: 'Please try another payment method',
                variant: 'destructive',
              });
              // Redirect back to checkout page after a delay
              setTimeout(() => setLocation('/subscription'), 3000);
              break;
            default:
              toast({
                title: 'Something went wrong',
                description: 'Please contact support',
                variant: 'destructive',
              });
              break;
          }
        }
      });
    }
  }, [stripe, toast, setLocation]);

  return (
    <div className="container max-w-md mx-auto p-4 flex flex-col items-center justify-center min-h-[80vh]">
      <Card className="w-full border border-slate-700 bg-slate-800/40 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-blue-400 to-emerald-500 bg-clip-text text-transparent">
            Payment Successful!
          </CardTitle>
          <CardDescription>
            Thank you for subscribing to ReflectAI Premium
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="p-4 mb-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <p className="text-slate-300">
              Your premium features have been activated. You now have access to all the advanced features and benefits of ReflectAI Premium.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Link to="/">
            <Button variant="default" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Return to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}