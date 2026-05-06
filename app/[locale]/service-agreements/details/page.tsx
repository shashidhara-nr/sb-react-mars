import { redirect } from 'next/navigation';

export default function ServiceAgreementsDetailsPage() {
  // Redirect to default view without specific ID
  // In a real app, you might redirect to a list view instead
  redirect('/service-agreements');
}

