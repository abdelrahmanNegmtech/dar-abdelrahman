export type ActivityEvent = {
  id: string;
  label: string;
  description: string;
  createdAt: string;
};

export type TravelerProfile = {
  id: string;
  fullName: string;
  displayName: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;
  avatarUrl: string;
  accountType: "guest" | "owner";
  role: "traveler";
  dateOfBirth: string;
  nationality: string;
  preferredLanguage: string;
  preferredCurrency: string;
  city: string;
  country: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  completion: number;
  activity: ActivityEvent[];
};

export type PropertyType = "apartment" | "studio" | "villa" | "duplex" | "hotel";

export type TravelerProperty = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  type: PropertyType;
  city: string;
  area: string;
  country: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  areaSize: number;
  pricePerNight: number;
  currency: string;
  ratingAverage: number;
  reviewsCount: number;
  status: "published" | "pending" | "archived";
  imageUrl: string;
  imagePosition: string;
  amenities: string[];
  isSaved: boolean;
  isFeatured?: boolean;
};

export type BookingStatus = "confirmed" | "pending" | "completed" | "cancelled";
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

export type TravelerBooking = {
  id: string;
  reference: string;
  travelerId: string;
  property: TravelerProperty;
  owner: {
    id: string;
    name: string;
    avatarUrl: string;
    rating: number;
    responseTime: string;
    isSuperhost: boolean;
  };
  checkIn: string;
  checkOut: string;
  checkInTime: string;
  checkOutTime: string;
  guestsCount: number;
  roomsCount: number;
  nightsCount: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  totalAmount: number;
  currency: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethodLabel: string;
  cancellationPolicy: string;
  createdAt: string;
};

export type TravelerNotificationType =
  | "booking"
  | "payment"
  | "approval"
  | "message"
  | "support"
  | "system";

export type TravelerNotification = {
  id: string;
  type: TravelerNotificationType;
  title: string;
  body: string;
  entityLabel: string;
  href: string;
  isRead: boolean;
  createdAt: string;
};

export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export type MessageAttachment = {
  id: string;
  name: string;
  size: string;
  sizeBytes: number;
  url: string;
  type: "image" | "pdf" | "file";
};

export type TravelerMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string;
  body: string;
  attachment?: MessageAttachment;
  isOwn: boolean;
  isDeleted: boolean;
  messageType: "text" | "image" | "file" | "system";
  replyTo?: {
    id: string;
    senderName: string;
    body: string;
  } | null;
  createdAt: string;
  readAt?: string;
  status?: MessageStatus;
};

export type TravelerConversation = {
  id: string;
  bookingId: string;
  property: TravelerProperty;
  participant: {
    id: string;
    name: string;
    role: "owner" | "support";
    avatarUrl: string;
    isOnline: boolean;
    verified: boolean;
  };
  unreadCount: number;
  updatedAt: string;
  messages: TravelerMessage[];
  isTyping?: boolean;
};

export type TravelerReview = {
  id: string;
  bookingId: string;
  property: TravelerProperty;
  travelerName: string;
  travelerAvatarUrl: string;
  hostName: string;
  rating: number;
  cleanlinessRating: number;
  accuracyRating: number;
  communicationRating: number;
  locationRating: number;
  valueRating: number;
  comment: string;
  ownerResponse?: string;
  status: "pending" | "submitted";
  createdAt: string;
};

export type PaymentMethod = {
  id: string;
  provider: "visa" | "mastercard" | "instapay" | "vodafone_cash";
  methodType: "card" | "wallet" | "bank";
  brand: string;
  lastFour: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
};

export type PaymentTransaction = {
  id: string;
  bookingId?: string;
  date: string;
  description: string;
  type: "payment" | "refund" | "cashback" | "top_up";
  amount: number;
  balance: number;
  currency: string;
  status: "paid" | "pending" | "completed" | "failed";
};

export type WalletSummary = {
  balance: number;
  currency: string;
  totalCashback: number;
  totalRefunds: number;
  totalPaid: number;
  pendingPayments: number;
};

export type SupportTicketStatus =
  | "open"
  | "awaiting_dar"
  | "awaiting_you"
  | "in_progress"
  | "resolved"
  | "closed"
  | "escalated";

export type SupportTicketPriority = "low" | "medium" | "high";

export type SupportTicketMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "traveler" | "support";
  senderAvatarUrl: string;
  message: string;
  createdAt: string;
  attachments: {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: string;
    fileUrl: string;
  }[];
};

export type SupportTicket = {
  id: string;
  reference: string;
  subject: string;
  category: string;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  booking?: TravelerBooking;
  assignedAgent?: {
    id: string;
    name: string;
    avatarUrl: string;
    title: string;
  };
  expectedReplyAt: string;
  createdAt: string;
  updatedAt: string;
  messages: SupportTicketMessage[];
};

export type UserSettings = {
  emailNotifications: boolean;
  pushNotifications: boolean;
  bookingUpdates: boolean;
  messageNotifications: boolean;
  marketingNotifications: boolean;
  darkMode: boolean;
};

export type TravelerData = {
  profile: TravelerProfile;
  properties: TravelerProperty[];
  bookings: TravelerBooking[];
  conversations: TravelerConversation[];
  notifications: TravelerNotification[];
  reviews: TravelerReview[];
  paymentMethods: PaymentMethod[];
  transactions: PaymentTransaction[];
  tickets: SupportTicket[];
  wallet: WalletSummary;
  settings: UserSettings;
};

export type ActionResult = {
  message: string;
  ok: boolean;
};
