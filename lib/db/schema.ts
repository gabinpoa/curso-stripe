import { relations } from "drizzle-orm";
import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  int,
  mysqlEnum,
  boolean,
} from "drizzle-orm/mysql-core";

export const products = mysqlTable("products", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  defaultPriceId: varchar("default_price_id", { length: 255 }).notNull(),
  thumbnail: varchar("thumbnail", { length: 255 }).notNull(),
  description: text("description"),
  duration: varchar("duration", { length: 50 }),
  level: varchar("level", { length: 50 }),
  instructor: varchar("instructor", { length: 100 }),
  checkoutUrl: varchar("checkout_url", { length: 255 }),
});

export const users = mysqlTable("users", {
  customerId: varchar("customer_id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("member"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const buyRecords = mysqlTable("buy_record", {
  id: serial("id").primaryKey(),
  customerId: varchar("customer_id", { length: 255 })
    .notNull()
    .references(() => users.customerId), // references to customer in stripe
  productId: varchar("product_id", { length: 255 })
    .notNull()
    .references(() => products.id), // references to product in stripe
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  paymentIntentId: varchar("payment_intent_id", { length: 255 }),
  status: mysqlEnum("status", [
    "paid",
    "unpaid",
    "no_payment_required",
  ]).notNull(),
  refunded: boolean("refunded").notNull().default(false),
});

export const modules = mysqlTable("modules", {
  id: varchar("id", { length: 255 }).primaryKey(),
  productId: varchar("product_id", { length: 255 }).notNull(), // references to product in stripe
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  order: int("order").notNull(),
  isExtraContent: boolean("is_extra_content").notNull().default(false),
  level: varchar("level", { length: 50 }),
});

export const lessons = mysqlTable("lessons", {
  id: varchar("id", { length: 255 }).primaryKey(),
  moduleId: varchar("module_id", { length: 255 })
    .notNull()
    .references(() => modules.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  contentType: mysqlEnum("content_types", [
    "MDX",
    "VIDEO",
    "DOCUMENT",
  ]).notNull(),
  content: text("content").notNull(),
  order: int("order").notNull(),
});

export const productsRelations = relations(products, ({ many }) => {
  return {
    buyRecord: many(buyRecords),
    modules: many(modules),
  };
});

export const usersRelations = relations(users, ({ many }) => {
  return {
    buyRecord: many(buyRecords),
  };
});

export const buyRecordRelations = relations(buyRecords, ({ one }) => {
  return {
    user: one(users, {
      fields: [buyRecords.customerId],
      references: [users.customerId],
    }),
    product: one(products, {
      fields: [buyRecords.productId],
      references: [products.id],
    }),
  };
});

export const modulesRelations = relations(modules, ({ many, one }) => ({
  lessons: many(lessons),
  products: one(products, {
    fields: [modules.productId],
    references: [products.id],
  }),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type BuyRecord = typeof buyRecords.$inferSelect;
export type NewBuyRecord = typeof buyRecords.$inferInsert;
export type Module = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;
export type ModuleLesson = typeof lessons.$inferSelect;
export type NewModuleLesson = typeof lessons.$inferInsert;

export enum ContentType {
  MDX = "MDX",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT",
}
