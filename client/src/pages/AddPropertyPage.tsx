import { ArrowLeft, ImagePlus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { BecomeOwnerButton } from '@/components/dashboard/BecomeOwnerButton';
import { FormSection } from '@/components/shared/FormSection';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateProperty } from '@/hooks/queries/use-properties';
import { uploadToCloudinary } from '@/hooks/queries/use-upload';
import { apiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import {
  LISTING_TYPES,
  PROPERTY_TYPES,
  type ListingType,
  type PropertyType,
} from '@/types/property';

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs leading-5 text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function AddPropertyPage(): React.JSX.Element {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const createProperty = useCreateProperty();
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<PropertyType>('apartment');
  const [listingType, setListingType] = useState<ListingType>('sale');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const canCreate = role === 'owner' || role === 'admin';

  const handleImageUpload = async (files: FileList | null): Promise<void> => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map((file) => uploadToCloudinary(file)));
      setUploadedImages((prev) => [...prev, ...urls]);
      toast.success(`${urls.length} image${urls.length > 1 ? 's' : ''} uploaded`);
    } catch {
      toast.error('Image upload failed. Check Cloudinary config or paste URLs manually.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string): void => {
    setUploadedImages((prev) => prev.filter((u) => u !== url));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    const num = (k: string): number => Number(f.get(k));

    const manualUrls = String(f.get('images') ?? '')
      .split(/[\n,]/)
      .map((u) => u.trim())
      .filter(Boolean);

    const allImages = [...uploadedImages, ...manualUrls];

    createProperty.mutate(
      {
        title: String(f.get('title')),
        description: String(f.get('description')),
        type,
        listingType,
        price: num('price'),
        location: {
          address: String(f.get('address')),
          city: String(f.get('city')),
          area: String(f.get('area')),
        },
        beds: num('beds'),
        baths: num('baths'),
        sizeSqft: num('sizeSqft'),
        amenities: String(f.get('amenities'))
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
        images: allImages,
      },
      {
        onSuccess: () => {
          toast.success('Listing submitted for admin review');
          navigate('/dashboard');
        },
        onError: (err) => setError(apiErrorMessage(err, 'Could not create the listing')),
      },
    );
  };

  return (
    <div className="container max-w-3xl py-8 md:py-12">
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-6 gap-2 text-muted-foreground">
        <Link to="/dashboard">
          <ArrowLeft size={16} strokeWidth={1.75} aria-hidden />
          Back to dashboard
        </Link>
      </Button>

      <PageHeader
        eyebrow="New listing"
        title="Add a property"
        description="New listings are submitted for review and go live once an admin approves them."
      />

      {!canCreate && (
        <div className="mt-6 space-y-3 rounded-xl border border-warning/35 bg-warning/[0.07] px-4 py-4 text-sm leading-6">
          <p>
            Only owner accounts can list properties. You're signed in as{' '}
            <span className="font-medium">{role ?? 'a guest'}</span>. Upgrade your account to start
            listing — it's instant.
          </p>
          <BecomeOwnerButton label="Become an owner" />
        </div>
      )}

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/35 bg-destructive/[0.07] px-4 py-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <FormSection title="The basics" description="What are you listing, and how is it offered?">
          <Field id="title" label="Title">
            <Input
              id="title"
              name="title"
              required
              maxLength={150}
              placeholder="Sunlit 3-bed apartment in Gulshan 2"
            />
          </Field>

          <Field id="description" label="Description">
            <Textarea
              id="description"
              name="description"
              required
              rows={5}
              placeholder="Describe the property, its condition, and what makes it stand out."
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="type" label="Property type">
              <Select value={type} onValueChange={(v) => setType(v as PropertyType)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field id="listingType" label="Listing type">
              <Select value={listingType} onValueChange={(v) => setListingType(v as ListingType)}>
                <SelectTrigger id="listingType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LISTING_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t === 'sale' ? 'For sale' : 'For rent'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </FormSection>

        <FormSection title="Price & size">
          <Field
            id="price"
            label="Price (৳)"
            hint={listingType === 'rent' ? 'Monthly rent in taka.' : 'Total price in taka.'}
          >
            <Input id="price" name="price" type="number" min={1} required placeholder="32500000" />
          </Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field id="beds" label="Bedrooms">
              <Input id="beds" name="beds" type="number" min={0} defaultValue={0} required />
            </Field>
            <Field id="baths" label="Bathrooms">
              <Input id="baths" name="baths" type="number" min={0} defaultValue={0} required />
            </Field>
            <Field id="sizeSqft" label="Size (sqft)">
              <Input id="sizeSqft" name="sizeSqft" type="number" min={0} defaultValue={0} required />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Location">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field id="address" label="Address">
              <Input id="address" name="address" required placeholder="Road 55" />
            </Field>
            <Field id="area" label="Area">
              <Input id="area" name="area" required placeholder="Gulshan" />
            </Field>
            <Field id="city" label="City">
              <Input id="city" name="city" required placeholder="Dhaka" />
            </Field>
          </div>

          <Field
            id="amenities"
            label="Amenities"
            hint="Comma-separated, e.g. Elevator, Parking, Generator."
          >
            <Input id="amenities" name="amenities" placeholder="Elevator, Parking, Generator" />
          </Field>
        </FormSection>

        <FormSection
          title="Photography"
          description="Listings with five or more photos get noticeably more interest."
        >
          <div className="space-y-3">
            <Label>Property images</Label>
            <div className="flex flex-wrap gap-3">
              {uploadedImages.map((url) => (
                <div key={url} className="group relative">
                  <img
                    src={url}
                    alt=""
                    className="h-24 w-24 rounded-lg border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    aria-label="Remove image"
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background opacity-0 shadow-xs transition-opacity focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
                  >
                    <X size={13} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploading || !canCreate}
                className="flex h-24 w-24 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-surface text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? (
                  <span className="text-xs">Uploading…</span>
                ) : (
                  <>
                    <ImagePlus size={18} strokeWidth={1.75} />
                    <span className="text-xs">Upload</span>
                  </>
                )}
              </button>
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => void handleImageUpload(e.target.files)}
            />
            <p className="text-xs leading-5 text-muted-foreground">
              Upload images directly via Cloudinary, or paste URLs below.
            </p>
          </div>

          <Field
            id="images"
            label="Image URLs (optional)"
            hint="Paste extra image URLs here, one per line."
          >
            <Textarea id="images" name="images" rows={2} placeholder="https://…/photo1.jpg" />
          </Field>
        </FormSection>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" disabled={!canCreate || createProperty.isPending || uploading}>
            {createProperty.isPending ? 'Submitting…' : 'Submit listing'}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link to="/dashboard">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
