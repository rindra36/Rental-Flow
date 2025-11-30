import { getRentalData } from "@/app/actions";
import { RentalApp } from "@/components/rental/rental-app";

// Revalidate the page every time it's visited
export const revalidate = 0;

export default async function RentalDashboardPage() {
  const { apartments, leases, payments } = await getRentalData();

  return <RentalApp apartments={apartments} leases={leases} payments={payments} />;
}
