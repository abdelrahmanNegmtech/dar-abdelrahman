// Re-exported from the unified design system for backward compatibility.
// New code should import directly from "@/features/design-system".
export {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  IconButton,
  Input,
  SearchInput,
  Select,
  Separator,
  Skeleton,
  StatusBadge,
  Tabs,
  Textarea,
} from "@/features/design-system/primitives";

export type {
  BadgeTone,
  ButtonSize,
  ButtonVariant,
  CardTone,
  CardVariant,
  StatusVariant,
  TabItem,
} from "@/features/design-system/types";

// Legacy icon re-exports for backward compatibility.
// New code should import from "lucide-react" directly.
export {
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Bath as BathIcon,
  Bed as BedIcon,
  Bell as BellIcon,
  Building2 as BuildingIcon,
  Calendar as CalendarIcon,
  Camera as CameraIcon,
  CheckCircle as CheckCircleIcon,
  Check as CheckIcon,
  ChevronDown as ChevronDownIcon,
  X as CloseIcon,
  Copy as CopyIcon,
  CreditCard as CreditCardIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Flag as FlagIcon,
  Gift as GiftIcon,
  Globe as GlobeIcon,
  Grid3x3 as GridIcon,
  Headphones as HeadphonesIcon,
  Heart as HeartIcon,
  Home as HouseIcon,
  Info as InfoIcon,
  Link as LinkIcon,
  List as ListIcon,
  Lock as LockIcon,
  Mail as MailIcon,
  Map as MapIcon,
  MapPin as MapPinIcon,
  Maximize2 as ExpandIcon,
  Menu as MenuIcon,
  MessageSquare as MessageIcon,
  Minus as MinusIcon,
  Moon as MoonIcon,
  MoreHorizontal as MoreHorizontalIcon,
  Phone as PhoneIcon,
  Play as PlayIcon,
  Plus as PlusIcon,
  RefreshCw as RefreshCwIcon,
  Ruler as RulerIcon,
  Search as SearchIcon,
  Send as PaperPlaneIcon,
  Share2 as ShareIcon,
  Shield as ShieldIcon,
  SlidersHorizontal as SlidersIcon,
  Smartphone as SmartphoneIcon,
  Smile as SmileIcon,
  Star as StarIcon,
  Sun as SunIcon,
  Tag as TagIcon,
  Tv as TvIcon,
  User as UserIcon,
  Wifi as WifiIcon,
  Zap as ZapIcon,
} from "lucide-react";

// Custom icons that don't exist in lucide-react
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function ElevatorIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="20"
      {...props}
    >
      <rect x="3" y="2" width="18" height="20" rx="2" />
      <path d="M9 10l3-3 3 3" />
      <path d="M9 14l3 3 3-3" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      height="20"
      viewBox="0 0 24 24"
      width="20"
      {...props}
    >
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="20"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function MessengerIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="20"
      {...props}
    >
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8z" />
    </svg>
  );
}

export function WashingMachineIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="20"
      {...props}
    >
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8" />
      <circle cx="12" cy="13" r="4" />
      <path d="M10 13l2 2 2-2" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      height="20"
      viewBox="0 0 24 24"
      width="20"
      {...props}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ButtonLink - needed by Renad's legacy owner portal components
import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/features/design-system/lib/cn";
import { buttonVariants } from "@/features/design-system/lib/variants";

type ButtonLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  children: ReactNode;
  href: string;
  variant?: import("@/features/design-system/types").ButtonVariant;
  size?: import("@/features/design-system/types").ButtonSize;
};

export function ButtonLink({
  children,
  className,
  href,
  variant,
  size,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </Link>
  );
}

// TextInput - legacy wrapper for backward compatibility
import type { InputHTMLAttributes } from "react";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  compact?: boolean;
  endIcon?: ReactNode;
  icon?: ReactNode;
  label: string;
};

export function TextInput({
  className = "",
  compact = false,
  endIcon,
  icon,
  id,
  label,
  ...props
}: TextInputProps) {
  const inputId = id ?? `text-input-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="space-y-2">
      <label
        className="block text-[13px] font-semibold text-[var(--foreground)]"
        htmlFor={inputId}
      >
        {label}
      </label>
      <div
        className={`group flex items-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] transition duration-200 hover:border-[var(--border-strong)] focus-within:border-[var(--brand)] focus-within:shadow-[var(--shadow-focus)] ${
          compact ? "h-[44px] gap-3 px-[14px]" : "h-[54px] gap-[14px] px-[18px]"
        }`}
      >
        {icon ? <span className="shrink-0 text-[var(--foreground-muted)]">{icon}</span> : null}
        <input
          className={`min-w-0 flex-1 bg-transparent text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-muted)] ${
            compact ? "text-[14px]" : "text-[16px]"
          } ${className}`}
          id={inputId}
          {...props}
        />
        {endIcon ? <span className="shrink-0 text-[var(--foreground-muted)]">{endIcon}</span> : null}
      </div>
    </div>
  );
}
