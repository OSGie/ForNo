import { index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const visitors = mysqlTable("poc_visitors", {
  id: int("id").autoincrement().primaryKey(),
  visitorId: varchar("visitorId", { length: 100 }).notNull().unique(),
  persona: varchar("persona", { length: 20 }),
  firstTouch: json("firstTouch").$type<Record<string, string>>(),
  lastTouch: json("lastTouch").$type<Record<string, string>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const trackingEvents = mysqlTable("poc_tracking_events", {
  id: int("id").autoincrement().primaryKey(),
  eventId: varchar("eventId", { length: 100 }).notNull().unique(),
  eventName: varchar("eventName", { length: 80 }).notNull(),
  visitorId: varchar("visitorId", { length: 100 }).notNull(),
  sessionId: varchar("sessionId", { length: 100 }).notNull(),
  pagePath: varchar("pagePath", { length: 250 }).notNull(),
  persona: varchar("persona", { length: 20 }),
  uiContext: varchar("uiContext", { length: 120 }),
  consentAnalytics: int("consentAnalytics").notNull().default(0),
  consentMarketing: int("consentMarketing").notNull().default(0),
  firstTouch: json("firstTouch").$type<Record<string, string>>(),
  lastTouch: json("lastTouch").$type<Record<string, string>>(),
  properties: json("properties").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("poc_events_name_created_idx").on(table.eventName, table.createdAt), index("poc_events_visitor_idx").on(table.visitorId)]);

export const leads = mysqlTable("poc_leads", {
  id: int("id").autoincrement().primaryKey(),
  contactId: varchar("contactId", { length: 60 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  visitorId: varchar("visitorId", { length: 100 }).notNull(),
  source: varchar("source", { length: 80 }).notNull(),
  marketingOptIn: int("marketingOptIn").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const orders = mysqlTable("poc_orders", {
  id: int("id").autoincrement().primaryKey(),
  orderId: varchar("orderId", { length: 60 }).notNull().unique(),
  visitorId: varchar("visitorId", { length: 100 }).notNull(),
  persona: varchar("persona", { length: 20 }).notNull(),
  customerName: varchar("customerName", { length: 120 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  planSku: varchar("planSku", { length: 40 }).notNull(),
  planName: varchar("planName", { length: 120 }).notNull(),
  addonSkus: json("addonSkus").$type<string[]>().notNull(),
  billingCycle: varchar("billingCycle", { length: 20 }).notNull(),
  subtotalPiastres: int("subtotalPiastres").notNull(),
  discountPiastres: int("discountPiastres").notNull(),
  vatPiastres: int("vatPiastres").notNull(),
  totalPiastres: int("totalPiastres").notNull(),
  status: mysqlEnum("status", ["PENDING_DEMO", "PAID_DEMO"]).notNull().default("PENDING_DEMO"),
  paymentTokenHash: varchar("paymentTokenHash", { length: 128 }).notNull().unique(),
  paymentExpiresAt: timestamp("paymentExpiresAt").notNull(),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("poc_orders_status_created_idx").on(table.status, table.createdAt)]);

export const contracts = mysqlTable("poc_contracts", {
  id: int("id").autoincrement().primaryKey(),
  contractId: varchar("contractId", { length: 60 }).notNull().unique(),
  orderId: varchar("orderId", { length: 60 }).notNull().unique(),
  contractNumber: varchar("contractNumber", { length: 40 }).notNull().unique(),
  html: text("html").notNull(),
  checksum: varchar("checksum", { length: 128 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [uniqueIndex("poc_contract_order_idx").on(table.orderId)]);
