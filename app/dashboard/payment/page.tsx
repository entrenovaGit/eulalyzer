import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PaymentPage() {
  return (
    <div>
      <div className="p-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Payment Management</CardTitle>
            <CardDescription>
              Payment features are currently unavailable in development mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Payment management features will be available once the application is deployed with proper environment variables configured.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
