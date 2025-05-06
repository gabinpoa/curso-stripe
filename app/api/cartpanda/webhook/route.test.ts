import { POST } from './route';
import { db } from '@/lib/db/drizzle';
import { products, modules, lessons, users, orders } from '@/lib/db/schema';
import { NextRequest } from 'next/server';
import { nanoid } from 'nanoid';
import { cartpanda } from '@/lib/cartpanda/instance';
import { eq } from 'drizzle-orm';

// Correctly mock the cartpanda instance
jest.mock('@/lib/cartpanda/instance', () => ({
    cartpanda: {
        getOrder: jest.fn(), // Mock the getOrder method
        getCustomers: jest.fn(), // Mock the getCustomers method
    },
}));

describe('POST /api/cartpanda/webhook', () => {
    beforeAll(async () => {
        await db.delete(users).where(eq(users.email, 'test@example.com'));
        // Insert a product into the database
        await db.insert(products).values({
            id: 'prod_001',
            name: 'Sample Product',
            thumbnail: 'https://example.com/thumbnail.jpg',
            description: 'This is a sample product description.',
            status: 'active',
            images: JSON.stringify([
                { src: 'https://example.com/image1.jpg' },
                { src: 'https://example.com/image2.jpg' },
            ]),
        });

        // Insert modules associated with the product
        await db.insert(modules).values([
            {
                id: 'mod_001',
                productId: 'prod_001',
                name: 'Module 1',
                description: 'This is the first module.',
                order: 1,
                isExtraContent: false,
            },
            {
                id: 'mod_002',
                productId: 'prod_001',
                name: 'Module 2',
                description: 'This is the second module.',
                order: 2,
                isExtraContent: false,
            },
        ]);

        // Insert lessons associated with the modules
        await db.insert(lessons).values([
            {
                id: nanoid(),
                moduleId: 'mod_001',
                name: 'Lesson 1',
                description: 'This is the first lesson of Module 1.',
                contentType: 'MDX',
                content: 'Lesson 1 content here.',
                order: 1,
            },
            {
                id: nanoid(),
                moduleId: 'mod_001',
                name: 'Lesson 2',
                description: 'This is the second lesson of Module 1.',
                contentType: 'VIDEO',
                content: 'Lesson 2 content here.',
                order: 2,
            },
            {
                id: nanoid(),
                moduleId: 'mod_002',
                name: 'Lesson 1',
                description: 'This is the first lesson of Module 2.',
                contentType: 'DOCUMENT',
                content: 'Lesson 1 content here.',
                order: 1,
            },
            {
                id: nanoid(),
                moduleId: 'mod_002',
                name: 'Lesson 2',
                description: 'This is the second lesson of Module 2.',
                contentType: 'MDX',
                content: 'Lesson 2 content here.',
                order: 2,
            },
        ]);
    });

    afterEach(async () => {
        // Clean up the database after each test
        await db.execute('DELETE FROM orders');
    });

    afterAll(async () => {
        // Clean up the database after all tests
        await db.execute('DELETE FROM lessons');
        await db.execute('DELETE FROM modules');
        await db.execute('DELETE FROM products');
        await db.execute('DELETE FROM users');
        // Close database connections or other resources
        await db.$client.end();
    });

    it('handles order.paid event correctly', async () => {
        // Mock CartPanda API responses
        const mockGetOrder = cartpanda.getOrder as jest.Mock;
        mockGetOrder.mockResolvedValue({
            order: {
                id: '123',
                token: 'order-token',
                customer_id: 456,
                customer: { email: 'test@example.com' },
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-02T00:00:00Z',
                line_items: [
                    { product_id: 'prod_001', title: 'Sample Product', name: 'Sample Product' },
                ],
                status_id: 'Paid',
            },
        });

        const mockGetCustomers = cartpanda.getCustomers as jest.Mock;
        mockGetCustomers.mockResolvedValue({
            customers: [
                {
                    id: 456,
                    email: 'test@example.com',
                    first_name: 'John',
                    last_name: 'Doe',
                },
            ],
            meta: { total: 1, count: 1, per_page: 10, current_page: 1, last_page: 1 },
        });

        // Mock request payload
        const req = new NextRequest('http://localhost/api/cartpanda/webhook', {
            method: 'POST',
            body: JSON.stringify({
                event: 'order.paid',
                order: {
                    id: '123',
                    line_items: [{ product_id: 'prod_001', title: 'Sample Product' }],
                    customer: { email: 'test@example.com' },
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
            where: (orders, { eq }) => eq(orders.id, '123'),
        });
        expect(order).toBeDefined();
        expect(order?.status).toBe('paid');
    });

    it('returns 400 if the order is missing in the payload', async () => {
        // Mock request payload without the `order` field
        const req = new NextRequest('http://localhost/api/cartpanda/webhook', {
            method: 'POST',
            body: JSON.stringify({
                event: 'order.paid',
            }),
        });

        // Call the POST handler
        const res = await POST(req);

        // Assertions
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: 'Invalid payload: order is required' });
    });

    it('returns 400 for unsupported event types', async () => {
        // Mock request payload with an unsupported event type
        const req = new NextRequest('http://localhost/api/cartpanda/webhook', {
            method: 'POST',
            body: JSON.stringify({
                event: 'order.cancelled',
                order: {
                    id: '123',
                    line_items: [{ product_id: 'prod_001', title: 'Sample Product' }],
                    customer: { email: 'test@example.com' },
                },
            }),
        });

        // Call the POST handler
        const res = await POST(req);

        // Assertions
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: 'Unsupported event type' });
    });

    it('updates an existing order if it already exists', async () => {
        // Insert an existing order into the database
        await db.insert(orders).values({
            id: '123',
            customerId: '456', // Convert number to string
            productId: 'prod_001',
            createdAt: new Date('2023-01-01T00:00:00Z'),
            updatedAt: new Date('2023-01-01T00:00:00Z'),
            orderToken: 'order-token',
            status: 'unpaid', // Changed to a valid status
            refunded: false,
        });

        // Mock request payload
        const req = new NextRequest('http://localhost/api/cartpanda/webhook', {
            method: 'POST',
            body: JSON.stringify({
                event: 'order.paid',
                order: {
                    id: '123',
                    line_items: [{ product_id: 'prod_001', title: 'Sample Product' }],
                    customer: { email: 'test@example.com' },
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
            where: (orders, { eq }) => eq(orders.id, '123'),
        });
        expect(order).toBeDefined();
        expect(order?.status).toBe('paid');
        expect(order?.updatedAt).not.toEqual(new Date('2023-01-01T00:00:00Z')); // Ensure updated_at was changed
    });

    it('returns 500 if a database error occurs', async () => {
        // Mock a database error
        jest.spyOn(db, 'insert').mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        // Mock request payload
        const req = new NextRequest('http://localhost/api/cartpanda/webhook', {
            method: 'POST',
            body: JSON.stringify({
                event: 'order.paid',
                order: {
                    id: '123',
                    line_items: [{ product_id: 'prod_001', title: 'Sample Product' }],
                    customer: { email: 'test@example.com' },
                },
            }),
        });

        // Call the POST handler
        const res = await POST(req);

        // Assertions
        expect(res.status).toBe(500);
        expect(await res.json()).toEqual({ error: 'Internal server error' });
    });
});