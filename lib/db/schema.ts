import { relations } from 'drizzle-orm';
import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  int,
  mysqlEnum,
  boolean,
  primaryKey,
} from 'drizzle-orm/mysql-core';

export const products = mysqlTable('products', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  thumbnail: varchar('thumbnail', { length: 255 }).notNull(),
  description: text('description'),
  status: mysqlEnum('status', ['active', 'inactive'])
    .notNull()
    .default('active'),
  images: text('images'),
});

export const users = mysqlTable('users', {
  customerId: varchar('customer_id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const orders = mysqlTable('orders', {
  id: varchar('id', { length: 20 }),
  customerId: varchar('customer_id', { length: 255 })
    .notNull()
    .references(() => users.customerId),
  productId: varchar('product_id', { length: 255 })
    .notNull()
    .references(() => products.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  orderToken: varchar('order_token', { length: 255 }),
  status: mysqlEnum('status', [
    'paid',
    'unpaid',
    'no_payment_required',
  ]).notNull(),
  refunded: boolean('refunded').notNull().default(false),
}, (table) => [
  primaryKey({ columns: [table.id, table.productId] })
]);

export const modules = mysqlTable('modules', {
  id: varchar('id', { length: 255 }).primaryKey(),
  productId: varchar('product_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  order: int('order').notNull(),
  isExtraContent: boolean('is_extra_content').notNull().default(false),
  level: varchar('level', { length: 50 }),
});

export const lessons = mysqlTable('lessons', {
  id: varchar('id', { length: 255 }).primaryKey(),
  moduleId: varchar('module_id', { length: 255 })
    .notNull()
    .references(() => modules.id),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  contentType: mysqlEnum('content_types', [
    'MDX',
    'VIDEO',
    'DOCUMENT',
  ]).notNull(),
  content: text('content').notNull(),
  order: int('order').notNull(),
});

export const productsRelations = relations(products, ({ many }) => {
  return {
    buyRecord: many(orders),
    modules: many(modules),
  };
});

export const usersRelations = relations(users, ({ many }) => {
  return {
    buyRecord: many(orders),
  };
});

export const buyRecordRelations = relations(orders, ({ one }) => {
  return {
    user: one(users, {
      fields: [orders.customerId],
      references: [users.customerId],
    }),
    product: one(products, {
      fields: [orders.productId],
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
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type Module = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;
export type ModuleLesson = typeof lessons.$inferSelect;
export type NewModuleLesson = typeof lessons.$inferInsert;

export enum ContentType {
  MDX = 'MDX',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
}
