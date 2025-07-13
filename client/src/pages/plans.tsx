import { Suspense } from 'react'
import { Plan } from './plan'

export async function Plans() {
  const allPlans = await db.select().from(plans)

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