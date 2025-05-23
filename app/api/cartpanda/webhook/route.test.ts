import { POST } from "./route";
import { db } from "@/lib/db/drizzle";
import { users, orders } from "@/lib/db/schema";
import { NextRequest } from "next/server";
import { cartpanda } from "@/lib/cartpanda/instance";
import { eq } from "drizzle-orm";
import readline from "readline";

async function promptUser(message: string): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(message, () => {
      rl.close();
      resolve();
    });
  });
}

// Correctly mock the cartpanda instance
jest.mock("@/lib/cartpanda/instance", () => ({
  cartpanda: {
    getOrder: jest.fn(), // Mock the getOrder method
    getCustomers: jest.fn(), // Mock the getCustomers method
  },
}));

describe("POST /api/cartpanda/webhook", () => {
  let productId: string;

  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, process.env.SEND_TO_EMAIL!));
    // Insert a user for testing (customerId is required)
    await db.insert(users).values({
      email: process.env.SEND_TO_EMAIL!,
      name: "Test User",
      customerId: "456",
    });
  });

  beforeEach(async () => {
    // Always get the first product from the db before each test
    const product = await db.query.products.findFirst();
    if (!product) throw new Error("No product found in database");
    productId = product.id;
  });

  afterEach(async () => {
    // Clean up the database after each test
    await db.execute("DELETE FROM orders");
  });

  afterAll(async () => {
    try {
      await db.execute("DELETE FROM users");
      await db.$client.end(); // Close the database connection
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  });

  it("handles order.paid event correctly", async () => {
    // Mock CartPanda API responses
    const mockGetOrder = cartpanda.getOrder as jest.Mock;
    mockGetOrder.mockResolvedValue({
      order: {
        id: "123",
        token: "order-token",
        customer_id: 456,
        customer: { email: process.env.SEND_TO_EMAIL! },
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-02T00:00:00Z",
        line_items: [
          {
            product_id: productId,
            title: "Sample Product",
            name: "Sample Product",
          },
        ],
        status_id: "Paid",
      },
    });

    const mockGetCustomers = cartpanda.getCustomers as jest.Mock;
    mockGetCustomers.mockResolvedValue({
      customers: [
        {
          id: 456,
          email: process.env.SEND_TO_EMAIL!,
          first_name: "John",
          last_name: "Doe",
        },
      ],
      meta: { total: 1, count: 1, per_page: 10, current_page: 1, last_page: 1 },
    });

    // Mock request payload
    const req = new NextRequest("http://localhost/api/cartpanda/webhook", {
      method: "POST",
      body: JSON.stringify({
        event: "order.paid",
        order: {
          id: "123",
          line_items: [{ product_id: productId, title: "Sample Product" }],
          customer: { email: process.env.SEND_TO_EMAIL! },
        },
      }),
    });

    // Call the POST handler
    const res = await POST(req);

    // Assertions
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });

    // Verify database interactions
    const order = await db.query.orders.findFirst({
      where: (orders, { eq }) => eq(orders.id, "123"),
    });
    expect(order).toBeDefined();
    expect(order?.status).toBe("paid");
  });

  it(
    "handles order.paid event correctly and pauses for manual verification",
    async () => {
      // Mock CartPanda API responses
      const mockGetOrder = cartpanda.getOrder as jest.Mock;
      mockGetOrder.mockResolvedValue({
        order: {
          id: "123",
          token: "order-token",
          customer_id: 456,
          customer: { email: process.env.SEND_TO_EMAIL! },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          line_items: [
            {
              product_id: productId,
              title: "Sample Product",
              name: "Sample Product",
            },
          ],
          status_id: "Paid",
        },
      });

      const mockGetCustomers = cartpanda.getCustomers as jest.Mock;
      mockGetCustomers.mockResolvedValue({
        customers: [
          {
            id: 456,
            email: process.env.SEND_TO_EMAIL!,
            first_name: "John",
            last_name: "Doe",
          },
        ],
        meta: {
          total: 1,
          count: 1,
          per_page: 10,
          current_page: 1,
          last_page: 1,
        },
      });

      // Mock request payload
      const req = new NextRequest("http://localhost/api/cartpanda/webhook", {
        method: "POST",
        body: JSON.stringify({
          event: "order.paid",
          order: {
            id: "123",
            line_items: [{ product_id: productId, title: "Sample Product" }],
            customer: { email: process.env.SEND_TO_EMAIL! },
          },
        }),
      });

      // Call the POST handler
      const res = await POST(req);

      // Assertions
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true });

      // Verify database interactions
      const order = await db.query.orders.findFirst({
        where: (orders, { eq }) => eq(orders.id, "123"),
      });
      expect(order).toBeDefined();
      expect(order?.status).toBe("paid");

      // Pause for manual verification
      console.log(
        "A magic link email should have been sent to test@example.com."
      );
      console.log("Please verify the email and the link before continuing.");
      await promptUser("Press Enter to continue...");

      // Clean up the database
      await db.execute("DELETE FROM orders");
    },
    40 * 60000 // Set timeout to 40 minutes
  );

  it("returns 400 if the order is missing in the payload", async () => {
    // Mock request payload without the `order` field
    const req = new NextRequest("http://localhost/api/cartpanda/webhook", {
      method: "POST",
      body: JSON.stringify({
        event: "order.paid",
      }),
    });

    // Call the POST handler
    const res = await POST(req);

    // Assertions
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "Invalid payload: order is required",
    });
  });

  it("returns 400 for unsupported event types", async () => {
    // Mock request payload with an unsupported event type
    const req = new NextRequest("http://localhost/api/cartpanda/webhook", {
      method: "POST",
      body: JSON.stringify({
        event: "order.cancelled",
        order: {
          id: "123",
          line_items: [{ product_id: productId, title: "Sample Product" }],
          customer: { email: process.env.SEND_TO_EMAIL! },
        },
      }),
    });

    // Call the POST handler
    const res = await POST(req);

    // Assertions
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Unsupported event type" });
  });

  it("updates an existing order if it already exists", async () => {
    // Insert an existing order into the database
    await db.insert(orders).values({
      id: "123",
      customerId: "456", // Convert number to string
      productId: productId,
      createdAt: new Date("2023-01-01T00:00:00Z"),
      updatedAt: new Date("2023-01-01T00:00:00Z"),
      orderToken: "order-token",
      status: "unpaid", // Changed to a valid status
      refunded: false,
    });

    // Mock request payload
    const req = new NextRequest("http://localhost/api/cartpanda/webhook", {
      method: "POST",
      body: JSON.stringify({
        event: "order.paid",
        order: {
          id: "123",
          line_items: [{ product_id: productId, title: "Sample Product" }],
          customer: { email: process.env.SEND_TO_EMAIL! },
        },
      }),
    });

    // Call the POST handler
    const res = await POST(req);

    // Assertions
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });

    // Verify the order was updated
    const order = await db.query.orders.findFirst({
      where: (orders, { eq }) => eq(orders.id, "123"),
    });
    expect(order).toBeDefined();
    expect(order?.status).toBe("paid");
    expect(order?.updatedAt).not.toEqual(new Date("2023-01-01T00:00:00Z")); // Ensure updated_at was changed
  });

  it("returns 500 if a database error occurs", async () => {
    // Mock a database error
    jest.spyOn(db, "insert").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    // Mock request payload
    const req = new NextRequest("http://localhost/api/cartpanda/webhook", {
      method: "POST",
      body: JSON.stringify({
        event: "order.paid",
        order: {
          id: "123",
          line_items: [{ product_id: productId, title: "Sample Product" }],
          customer: { email: process.env.SEND_TO_EMAIL! },
        },
      }),
    });

    // Call the POST handler
    const res = await POST(req);

    // Assertions
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Internal server error" });
  });
});
