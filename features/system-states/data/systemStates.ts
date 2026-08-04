import type { ToastInput } from "../types";

export const trustStripItems = [
  {
    description: "Your data and payments are always protected.",
    title: "Secure by design",
  },
  {
    description: "Owners and properties go through a strict verification process.",
    title: "Verified platform",
  },
  {
    description: "Safe bookings, secure payments and 24/7 support.",
    title: "Guest protection",
  },
  {
    description: "Our team is here to help you anytime, anywhere.",
    title: "24/7 support",
  },
];

export const toastExamples: ToastInput[] = [
  {
    description: "We will notify you once the owner responds.",
    title: "Booking request sent.",
    type: "success",
  },
  {
    description: "You will be notified soon.",
    title: "Property submitted for review.",
    type: "info",
  },
  {
    description: "Your payment is being verified by DAR.",
    title: "Payment receipt uploaded.",
    type: "warning",
  },
  {
    description: "Your changes have been saved successfully.",
    title: "Profile updated.",
    type: "success",
  },
];
