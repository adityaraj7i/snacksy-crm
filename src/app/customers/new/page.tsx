"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCustomerAction, findLikelyDuplicatesAction } from "@/server/services/customer.actions";
import { AlertCircle, UserCheck, ShieldAlert, Check } from "lucide-react";

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Duplicate Check Banner state
  const [duplicateWarning, setDuplicateWarning] = useState<any[]>([]);

  async function handlePhoneOrEmailChange(phoneVal: string, emailVal?: string) {
    if (phoneVal.length >= 9 || (emailVal && emailVal.includes("@"))) {
      const matches = await findLikelyDuplicatesAction(phoneVal, emailVal);
      setDuplicateWarning(matches);
    } else {
      setDuplicateWarning([]);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get("firstName")?.toString() || "",
      lastName: formData.get("lastName")?.toString(),
      phone: formData.get("phone")?.toString() || "",
      email: formData.get("email")?.toString(),
      gender: formData.get("gender")?.toString(),
      dateOfBirth: formData.get("dateOfBirth")?.toString(),
      city: formData.get("city")?.toString() || "Kathmandu",
      address: formData.get("address")?.toString(),
      acquisitionSource: formData.get("acquisitionSource")?.toString() || "WALK_IN",
      favoriteFood: formData.get("favoriteFood")?.toString(),
      favoriteDrink: formData.get("favoriteDrink")?.toString(),
      spicePreference: formData.get("spicePreference")?.toString(),
      seatingPreference: formData.get("seatingPreference")?.toString(),
      allergies: formData.get("allergies")?.toString() ? formData.get("allergies")!.toString().split(",").map(s => s.trim()) : [],
      consentSms: formData.get("consentSms") === "on",
      consentEmail: formData.get("consentEmail") === "on",
      consentWhatsApp: formData.get("consentWhatsApp") === "on",
    };

    try {
      const customer = await createCustomerAction(data);
      router.push(`/customers/${customer.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create customer.");
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Register New Customer"
        description="Add a new customer profile to Snacksy Cafe And Restro CRM."
        breadcrumbs={[{ label: "Customers", href: "/customers" }, { label: "New Customer" }]}
      />

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Duplicate Detection Banner */}
        {duplicateWarning.length > 0 && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-600">
              <ShieldAlert className="h-4 w-4" /> Potential Duplicate Customer Found!
            </div>
            <p className="text-muted-foreground">
              A customer with matching contact details already exists:
            </p>
            <div className="space-y-1 pl-2 border-l-2 border-amber-500">
              {duplicateWarning.map((dup) => (
                <div key={dup.id} className="font-semibold text-foreground">
                  • {dup.firstName} {dup.lastName} ({dup.phone} / {dup.email || "No email"})
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Please double check before creating a new duplicate profile.
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-xs font-medium">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Identity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">1. Customer Identity</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="font-semibold">First Name *</label>
                <Input name="firstName" placeholder="e.g. Aarav" required className="mt-1" />
              </div>
              <div>
                <label className="font-semibold">Last Name</label>
                <Input name="lastName" placeholder="e.g. Sharma" className="mt-1" />
              </div>
              <div>
                <label className="font-semibold">Gender (Optional)</label>
                <select name="gender" className="w-full h-9 rounded-md border bg-background px-3 mt-1 text-xs">
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other / Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="font-semibold">Date of Birth</label>
                <Input name="dateOfBirth" type="date" className="mt-1" />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Contact Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">2. Contact & Location</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="font-semibold">Phone Number (+977) *</label>
                <Input
                  name="phone"
                  placeholder="9841234567"
                  required
                  className="mt-1"
                  onChange={(e) => handlePhoneOrEmailChange(e.target.value)}
                />
              </div>
              <div>
                <label className="font-semibold">Email Address</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="aarav@example.com"
                  className="mt-1"
                  onChange={(e) => handlePhoneOrEmailChange((e.target.form as any)?.phone?.value || "", e.target.value)}
                />
              </div>
              <div>
                <label className="font-semibold">City</label>
                <Input name="city" defaultValue="Kathmandu" className="mt-1" />
              </div>
              <div>
                <label className="font-semibold">Acquisition Source</label>
                <select name="acquisitionSource" className="w-full h-9 rounded-md border bg-background px-3 mt-1 text-xs">
                  <option value="WALK_IN">Walk-In Guest</option>
                  <option value="INSTAGRAM">Instagram Campaign</option>
                  <option value="WORD_OF_MOUTH">Word of Mouth / Referral</option>
                  <option value="GOOGLE_MAPS">Google Maps / Review</option>
                  <option value="PARTNER_POS">POS Partner Integration</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Preferences & Allergies */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">3. Guest Preferences & Allergies</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="font-semibold">Favorite Food Item</label>
                <Input name="favoriteFood" placeholder="e.g. Chicken Momo, Pizza" className="mt-1" />
              </div>
              <div>
                <label className="font-semibold">Favorite Drink</label>
                <Input name="favoriteDrink" placeholder="e.g. Iced Latte, Peach Tea" className="mt-1" />
              </div>
              <div>
                <label className="font-semibold">Spice Level Preference</label>
                <select name="spicePreference" className="w-full h-9 rounded-md border bg-background px-3 mt-1 text-xs">
                  <option value="MEDIUM">Medium Spice</option>
                  <option value="MILD">Mild / Non-Spicy</option>
                  <option value="SPICY">Spicy</option>
                  <option value="EXTRA_SPICY">Extra Spicy</option>
                </select>
              </div>
              <div>
                <label className="font-semibold">Seating Preference</label>
                <select name="seatingPreference" className="w-full h-9 rounded-md border bg-background px-3 mt-1 text-xs">
                  <option value="MAIN_HALL">Main Dining Hall</option>
                  <option value="ROOFTOP">Rooftop Terrace</option>
                  <option value="WINDOW">Window Side</option>
                  <option value="QUIET_CORNER">Quiet Corner Table</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold text-destructive">Food Allergies (Comma Separated)</label>
                <Input name="allergies" placeholder="e.g. Peanut, Dairy, Shellfish" className="mt-1 border-destructive/30" />
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Communication Consent */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">4. Marketing Communication Consent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="consentSms" defaultChecked className="rounded border-gray-300" />
                <span>Customer granted SMS marketing opt-in consent</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="consentEmail" defaultChecked className="rounded border-gray-300" />
                <span>Customer granted Email marketing opt-in consent</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="consentWhatsApp" defaultChecked className="rounded border-gray-300" />
                <span>Customer granted WhatsApp promotional message consent</span>
              </label>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="font-semibold">
              {loading ? "Creating Profile..." : "Create Customer Profile"}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
