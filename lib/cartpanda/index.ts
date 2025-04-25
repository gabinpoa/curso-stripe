import { buildQueryParams } from "./utils";
import { ValidEventObject, Webhook } from "./webhook-types";
export class CartPanda {
  private accessToken: string;
  private shopSlug: string;
  private apiBaseUrl: string;

  constructor(accessToken: string, shopSlug: string) {
    this.accessToken = accessToken;
    this.shopSlug = shopSlug;
    this.apiBaseUrl = `https://accounts.cartpanda.com/api/v3/${shopSlug}/`;
  }

  private async request<T>(
    endpoint: string,
    method: string = "GET",
    body?: unknown
  ): Promise<T> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.accessToken}`,
      Accept: "application/json",
    };

    if (method !== "GET") {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  async getProducts(
    params?: Record<string, string | number | boolean>
  ): Promise<{ products: Product[]; meta: Meta }> {
    const queryString = buildQueryParams(params);
    return this.request<{ products: Product[]; meta: Meta }>(
      `/products${queryString}`
    );
  }

  async getProduct(productId: string): Promise<Product> {
    return this.request<Product>(`/products/${productId}`);
  }

  async getOrders(
    params?: Record<string, string | number>
  ): Promise<{ orders: Order[]; meta: Meta }> {
    const queryString = buildQueryParams(params);
    return this.request<{ orders: Order[]; meta: Meta }>(
      `/orders${queryString}`
    );
  }

  async getOrder(orderId: string): Promise<{ order: Order }> {
    return this.request<{ order: Order }>(`/orders/${orderId}`);
  }

  async getCustomer(customerId: string): Promise<{ customer: Customer }> {
    return this.request<{ customer: Customer }>(`/customers/${customerId}`);
  }

  async getCustomers(
    params?: Record<string, string | number>
  ): Promise<{ customers: Customer[]; meta: Meta }> {
    const queryString = buildQueryParams(params);
    return this.request<{ customers: Customer[]; meta: Meta }>(
      `/customers${queryString}`
    );
  }

  async createCustomer(
    customer: CreateCustomerBody
  ): Promise<CreateCustomerResponse> {
    return this.request<CreateCustomerResponse>(`/customers`, "POST", customer);
  }

  async createWebhook(webhook: {
    endpoint: string;
    events: ValidEventObject[];
  }): Promise<{ webhooks: Webhook[] }> {
    return this.request<{ webhooks: Webhook[] }>(`/webhooks`, "POST", webhook);
  }
}

export type CreateCustomerBody = {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  cpf?: string;
  cpn?: string;
  house_number?: string;
  tags?: string;
  notes?: string;
};

type CreateCustomerResponse = {
  customer: {
    id: number;
    email: string;
    accepts_marketing: number;
    first_name: string;
    last_name: string;
    shop_id: number;
    cpf: string;
    cpn: string;
    source: string;
    house_number: string;
    note: unknown;
    tax_exempt: number;
    phone: string;
    tags: unknown;
    created_at: string;
    updated_at: string;
    address: object[];
    default_address: object;
  };
};

export type Customer = {
  id: number;
  email: string;
  accepts_marketing: number;
  first_name: string;
  last_name: string;
  shop_id: number;
  cpf: string;
  cpn: string;
  source: string;
  house_number: string;
  note: unknown;
  tax_exempt: number;
  phone: string;
  tags: unknown;
  created_at: string;
  updated_at: string;
  address: {
    id: number;
    customer_id: number;
    first_name: string;
    last_name: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone: string;
    name: string;
    province_code: string;
    country_code: string;
    country_name: string;
    default: boolean;
  }[];
  default_address: {
    id: number;
    customer_id: number;
    first_name: string;
    last_name: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone: string;
    name: string;
    province_code: string;
    country_code: string;
    country_name: string;
    default: boolean;
  };
};

type Product = {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  vendor_id: number;
  handle: string;
  product_type: string;
  product_type_id: number;
  published_at: string;
  template_suffix: string;
  published_scope: string;
  status: string;
  tags: string[];
  options: {
    id: number;
    product_id: number;
    name: string;
    position: number;
    values: Record<string, unknown>[];
  }[];
  created_at: string;
  updated_at: string;
  variants: {
    id: number;
    product_id: number;
    default: number;
    title: string;
    price: string;
    compare_at_price: string;
    cost_per_item: string;
    sku: string;
    position: number;
    inventory_policy: number;
    quantity: number;
    prevent_out_of_stock_selling: number;
    taxable: number;
    barcode: string;
    swatches: string;
    length: string;
    width: string;
    height: string;
    dimension_unit: string;
    weight: number;
    weight_unit: string;
    requires_shipping: number;
    has_digital_attachment: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  }[];
  images: {
    id: number;
    product_id: number;
    position: number;
    alt: string;
    src: string;
    created_at: string;
    updated_at: string;
    url: string;
  }[];
  product_default_variant: {
    id: number;
    product_id: number;
    default: number;
    title: string;
    price: string;
    compare_at_price: string;
    cost_per_item: string;
    sku: string;
    position: number;
    inventory_policy: number;
    quantity: number;
    prevent_out_of_stock_selling: number;
    taxable: number;
    barcode: string;
    swatches: string;
    length: string;
    width: string;
    height: string;
    dimension_unit: string;
    weight: number;
    weight_unit: string;
    requires_shipping: number;
    has_digital_attachment: number;
    created_at: string;
    updated_at: string;
    deleted_at: string;
  };
  shop_id: number;
  seo_title: string;
  seo_description: string;
  price: number;
  compare_at_price: number;
  cost_per_item: number;
  sku: string;
  taxable: number;
  barcode: string;
  weight: number;
  weight_unit: string;
  requires_shipping: number;
  inventory_policy: number;
  quantity: number;
  added_via: string;
  deleted_at: string;
  active: number;
  active_for_bots: number;
  google_merchant_status: string;
  collections: {
    id: number;
    title: string;
    body_html: string;
    handle: string;
    published: boolean;
    template_suffix: string;
    published_at: string;
    updated_at: string;
    seo_title: string;
    seo_description: string;
    type: string;
  }[];
};

type Meta = {
  total: number;
  count: number;
  per_page: string;
  current_page: number;
  last_page: number;
  path: string;
};

export type Order = {
  id: number;
  browser_ip: string | null;
  buyer_accepts_marketing: number;
  cancel_reason: string | null;
  cancelled_at: string | null;
  cart_token: string | null;
  client_details: string | null;
  closed_at: string | null;
  contact_email: string | null;
  created_at: string;
  currency: string;
  current_total_discounts: string;
  current_total_discounts_set: string;
  current_total_price: string;
  current_total_price_set: string;
  current_subtotal_price: string;
  current_subtotal_price_set: string;
  current_total_tax: string;
  current_total_tax_set: string;
  customer_locale: string | null;
  discount_codes: {
    code: string;
    value: number;
    type: string;
    amount: number;
    allocation_method: string;
    discount_category: string;
    description: string;
    target_selection: string;
    target_type: string;
    title: string;
  }[];
  email: string | null;
  financial_status: number;
  fulfillment_status: string | null;
  landing_site: string | null;
  location_id: number | null;
  name: string;
  note: string | null;
  note_attributes: {
    name: string;
    value: string;
  };
  number: number;
  order_number: string;
  order_status_url: string | null;
  payment_gateway_names: Record<string, unknown>[];
  phone: string | null;
  presentment_currency: string;
  processed_at: string;
  processing_method: string | null;
  referring_site: string | null;
  source_name: string | null;
  subtotal_price: string;
  subtotal_price_set: string;
  tags: string | null;
  tax_lines: number;
  taxes_included: number;
  test: number;
  token: string;
  total_discounts: string;
  total_discounts_set: string;
  total_line_items_price: string;
  total_line_items_price_set: string;
  total_price: string;
  total_price_set: string;
  total_tax: string;
  total_tax_set: string;
  total_price_without_tax: string;
  total_tip_received: string;
  total_weight: number;
  updated_at: string;
  user_id: number | null;
  billing_address: {
    address1: string;
    address2: string | null;
    city: string;
    company: string | null;
    country: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    province: string | null;
    zip: string;
    name: string;
    province_code: string | null;
    country_code: string;
    latitude: string | null;
    longitude: string | null;
  };
  customer: {
    id: number;
    email: string;
    accepts_marketing: number;
    created_at: string;
    updated_at: string;
    first_name: string;
    last_name: string;
    note: string | null;
    phone: string | null;
    tags: string | null;
    cpf: string | null;
    cpn: null;
    source: string | null;
  };
  discount_applications: string;
  fulfillments: {
    id: number;
    created_at: string;
    name: string;
    order_id: number;
    service: string | null;
    shipment_status: string | null;
    status: number;
    tracking_company: string | null;
    tracking_number: string | null;
    tracking_numbers: Record<string, unknown>[];
    tracking_url: string | null;
    tracking_urls: Record<string, unknown>[];
    updated_at: string;
    variant_inventory_management: string | null;
  }[];
  line_items: {
    id: number;
    fulfillable_quantity: number;
    fulfillment_service: string | null;
    fulfillment_status: number | null;
    gift_card: number;
    grams: number;
    name: string;
    price: number;
    product_id: number;
    quantity: number;
    requires_shipping: number;
    sku: string | null;
    taxable: number;
    title: string;
    total_discount: number;
    total_discount_set: number;
    variant_id: number;
    variant_inventory_management: number | null;
    variant_title: string | null;
    vendor: string | null;
    discount_allocations: number;
    inventory_sync: number;
    shipping_method: string | null;
    total_cost_of_order: string | null;
    status_id: number;
    is_ocu: number;
    custom_options: string | null;
    is_digital: number;
    up_sell_id: number | null;
    up_sell_type: string | null;
    offer_id: string | null;
    is_refunded: number;
    refunded_quantity: number;
  }[];
  payment_details: string | null;
  refunds: {
    id: number;
    order_id: number;
    created_at: string;
    note: string | null;
    processed_at: string | null;
    total_amount: number;
    sub_total: number;
    status_id: number;
    updated_at: string;
  }[];
  shipping_address: {
    address1: string;
    address2: string | null;
    city: string;
    company: string | null;
    country: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    province: string | null;
    zip: string;
    name: string;
    province_code: string | null;
    country_code: string;
    latitude: string | null;
    longitude: string | null;
  };
  shipping_lines: {
    id: number;
    order_id: number;
    shop_id: number;
    code: string | null;
    price: number;
    actual_price_paid: string | null;
    paid_by_client: number;
    discounted_price: number;
    source: string | null;
    title: string | null;
    delivery_category: string | null;
    carrier_identifier: string | null;
    requested_fulfillment_service_id: string | null;
    label_url: string | null;
    created_at: string;
    updated_at: string;
    melhor_envio_id: string | null;
    melhor_envio_service: string | null;
    shipping_gateway: string | null;
    correios_shipping_method_code: string | null;
    frenet_service: string | null;
  };
  transactions: {
    authorizationCode: string | null;
    gateway: string | null;
    seller_split_amount: string | null;
  }[];
  shop_id: number;
  customer_id: number;
  dsers_batch_id: string | null;
  processed_in_dsers: string | null;
  no_of_installments: number | null;
  installments_rate: number | null;
  is_archived: number;
  billing_address_id: number | null;
  shipping_address_id: number | null;
  customer_token: string | null;
  status_id: string | null;
  chargeback_received: number;
  boleto_email_sent: number;
  order_comment: string | null;
  is_cartx_test: number;
  boleto_code: string | null;
  boleto_link: string | null;
  boleto_limit_date: string | null;
  thank_you_page: string | null;
  is_sync: number;
  payment_status: number;
  shop: {
    id: number;
    name: string;
    slug: string;
    phone_ext: string | null;
    phone: string | null;
    country: string;
    country_code: string;
    timezone: string;
    website: string | null;
    owner_id: number;
    revenue_per_month: string | null;
    onboarding_status: number;
    status: number;
    wrong_order_email_count: number;
    enable_checkout: number;
    block_script: number;
    min_cart_quantity: number;
    platform_for: string | null;
    current_platform: string | null;
    operations_type: string | null;
    cartxpayments_mode: string | null;
    redirection_enable: string | null;
    redirection_url: string | null;
    password_enable: string | null;
    password: string | null;
    oktapay_enabled: number;
    password_page_message: string | null;
    created_at: string;
    updated_at: string;
    domain: {
      id: number;
      shop_id: number;
      name: string;
      status: string;
      is_primary: number;
      created_at: string;
      updated_at: string;
      certificate_path: string | null;
      certificate_expiry_date: string | null;
    };
  };
  checkout_link: string | null;
  conversion_summary: {
    parameter_name: string;
    parameter_value: string;
  }[];
  afid: string | null;
  affiliate_amount: string | null;
};
