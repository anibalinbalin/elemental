import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";

// Drizzle schema for the MICROCORE subscription (Mercado Pago preapproval).
// Source of truth for the `subscribers` / `subscription_charges` tables —
// keep in sync with the migrations pushed via `drizzle-kit push`.

export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  preapprovalId: text("preapproval_id").unique(),
  email: text("email").notNull(),
  status: text("status").notNull().default("pending"), // pending | active | paused | cancelled
  nextChargeAt: timestamp("next_charge_at", { withTimezone: true }),
  shippingName: text("shipping_name").notNull(),
  shippingPhone: text("shipping_phone").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  shippingCity: text("shipping_city").notNull(),
  shippingDepartment: text("shipping_department").notNull(),
  shippingNotes: text("shipping_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subscriptionCharges = pgTable("subscription_charges", {
  id: uuid("id").primaryKey().defaultRandom(),
  subscriberId: uuid("subscriber_id")
    .notNull()
    .references(() => subscribers.id),
  mpPaymentId: text("mp_payment_id").unique(),
  amount: integer("amount"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Subscriber = typeof subscribers.$inferSelect;
export type NewSubscriber = typeof subscribers.$inferInsert;
export type SubscriptionCharge = typeof subscriptionCharges.$inferSelect;
export type NewSubscriptionCharge = typeof subscriptionCharges.$inferInsert;
