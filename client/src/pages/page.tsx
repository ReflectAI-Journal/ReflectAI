// src/components/dashboard/billing/plans/plans.tsx
import { Suspense } from 'react'
import { Plan } from './plan'
import { db } from '@/db/index'

export async function Plans() {
  let allPlans: NewPlan[] = await db.select().from(plans)

  if (!allPlans.length) {
    return <p>No plans available.</p>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Available Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allPlans.map((plan, index) => (
          <Plan key={`plan-${index}`} plan={plan} />
        ))}
      </div>
    </div>
  )
}
// src/components/dashboard/billing/plans/plan.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getCheckoutURL } from '@/app/actions'

export function Plan({ plan }: { plan: NewPlan }) {
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setLoading(true)
    try {
      const checkoutUrl = await getCheckoutURL(plan.variantId)
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Error creating checkout:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{plan.productName}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">${plan.price}</p>
        <p className="text-sm text-muted-foreground">
          {plan.interval} ({plan.intervalCount})
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSignup}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Loading...' : 'Sign up'}
        </Button>
      </CardFooter>
    </Card>
  )
}