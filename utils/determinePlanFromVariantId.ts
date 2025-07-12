export function determinePlanFromVariantId(id: number): 'pro' | 'unlimited' | null {
  switch (id) {
    case 895829: // Pro Monthly
    case 895830: // Pro Yearly
      return 'pro';
    case 895831: // Unlimited Monthly
    case 895832: // Unlimited Yearly
      return 'unlimited';
    default:
      return null;
  }
}
