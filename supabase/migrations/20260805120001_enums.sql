do $$
begin
  if not exists (select 1 from pg_type where typname = 'account_type') then
    create type public.account_type as enum ('guest', 'owner', 'admin', 'support_staff');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'verification_status') then
    create type public.verification_status as enum (
      'not_started',
      'draft',
      'submitted',
      'under_review',
      'approved',
      'rejected',
      'expired'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'owner_verification_type') then
    create type public.owner_verification_type as enum ('individual', 'business');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'verification_rejection_reason') then
    create type public.verification_rejection_reason as enum (
      'document_missing',
      'document_unreadable',
      'name_mismatch',
      'address_mismatch',
      'business_record_invalid',
      'tax_record_invalid',
      'duplicate_submission',
      'manual_review_required',
      'other'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'verification_document_type') then
    create type public.verification_document_type as enum (
      'national_id_front',
      'national_id_back',
      'passport',
      'selfie',
      'property_deed',
      'rental_authorization',
      'utility_bill',
      'business_registration',
      'tax_document',
      'other'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'document_review_status') then
    create type public.document_review_status as enum ('pending', 'approved', 'rejected', 'needs_resubmission');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'property_type') then
    create type public.property_type as enum ('apartment', 'studio', 'villa', 'duplex', 'hotel');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'property_moderation_status') then
    create type public.property_moderation_status as enum (
      'draft',
      'submitted',
      'under_review',
      'approved',
      'rejected',
      'suspended'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'property_publication_status') then
    create type public.property_publication_status as enum ('unpublished', 'published', 'archived');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'location_precision') then
    create type public.location_precision as enum ('approximate', 'exact_private', 'exact_public');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'property_photo_category') then
    create type public.property_photo_category as enum (
      'cover',
      'living_room',
      'bedroom',
      'bathroom',
      'kitchen',
      'balcony',
      'exterior',
      'amenity',
      'other'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'availability_status') then
    create type public.availability_status as enum ('available', 'blocked', 'booked');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'availability_reason') then
    create type public.availability_reason as enum (
      'owner_blocked',
      'maintenance',
      'booking_hold',
      'confirmed_booking',
      'system_rule'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'pricing_rule_type') then
    create type public.pricing_rule_type as enum (
      'seasonal_override',
      'weekend_override',
      'date_range_discount',
      'date_range_markup',
      'minimum_stay_override',
      'custom'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'booking_status') then
    create type public.booking_status as enum (
      'pending_payment_verification',
      'pending_owner_approval',
      'confirmed',
      'declined',
      'cancelled',
      'completed',
      'expired',
      'refunded'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'booking_payment_status') then
    create type public.booking_payment_status as enum (
      'pending',
      'under_review',
      'authorized',
      'paid',
      'failed',
      'refunded',
      'partially_refunded'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'conversation_type') then
    create type public.conversation_type as enum ('traveler_owner', 'system');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'conversation_member_role') then
    create type public.conversation_member_role as enum ('traveler', 'owner', 'system');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'message_type') then
    create type public.message_type as enum ('text', 'image', 'file', 'system');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type public.notification_type as enum (
      'booking',
      'payment',
      'approval',
      'message',
      'support',
      'review',
      'system',
      'payout'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'notification_entity_type') then
    create type public.notification_entity_type as enum (
      'booking',
      'property',
      'conversation',
      'message',
      'support_ticket',
      'review',
      'payout',
      'verification'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'review_status') then
    create type public.review_status as enum ('pending', 'submitted', 'hidden', 'removed');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_method_type') then
    create type public.payment_method_type as enum (
      'card',
      'wallet',
      'bank_transfer',
      'cash_collection',
      'pay_on_arrival'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_provider') then
    create type public.payment_provider as enum (
      'visa',
      'mastercard',
      'meeza',
      'instapay',
      'vodafone_cash',
      'fawry',
      'bank',
      'paymob',
      'cash'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_method_verification_status') then
    create type public.payment_method_verification_status as enum (
      'unverified',
      'pending',
      'verified',
      'failed'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'payout_status') then
    create type public.payout_status as enum (
      'pending',
      'scheduled',
      'processing',
      'paid',
      'failed',
      'on_hold',
      'cancelled'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'payout_method') then
    create type public.payout_method as enum ('bank_transfer', 'instapay', 'vodafone_cash', 'cash_pickup');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'support_ticket_status') then
    create type public.support_ticket_status as enum (
      'open',
      'awaiting_customer',
      'awaiting_support',
      'in_progress',
      'resolved',
      'closed',
      'escalated'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'support_ticket_priority') then
    create type public.support_ticket_priority as enum ('low', 'medium', 'high', 'urgent');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'support_ticket_category') then
    create type public.support_ticket_category as enum (
      'payment_issue',
      'booking_issue',
      'refund_request',
      'property_issue',
      'account_issue',
      'verification_issue',
      'technical_issue',
      'other'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'support_sender_role') then
    create type public.support_sender_role as enum ('traveler', 'owner', 'support_staff', 'system');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'audit_actor_type') then
    create type public.audit_actor_type as enum ('profile', 'system');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'audit_entity_type') then
    create type public.audit_entity_type as enum (
      'profile',
      'owner_verification',
      'property',
      'booking',
      'conversation',
      'message',
      'review',
      'payment_method',
      'payout',
      'support_ticket'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'audit_action_type') then
    create type public.audit_action_type as enum (
      'created',
      'updated',
      'submitted',
      'approved',
      'rejected',
      'published',
      'unpublished',
      'suspended',
      'cancelled',
      'resolved',
      'processed',
      'deleted'
    );
  end if;
end
$$;

