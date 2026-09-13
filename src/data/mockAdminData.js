export const mockOrders = [
  {
    id: 'ORD-2023-1042',
    date: '2023-10-24T14:30:00Z',
    status: 'Shipped',
    customer: {
      name: 'Sarah Jenkins',
      email: 'sarah.j@example.com',
      phone: '+1 555-0192',
      address: '123 Maple Street, NY 10001',
    },
    paymentMethod: 'Credit Card',
    items: [
      { name: 'Ceramic Table Lamp', price: 120, quantity: 1 },
      { name: 'Linen Throw Pillow', price: 45, quantity: 2 },
    ],
    total: 210,
  },
  {
    id: 'ORD-2023-1043',
    date: '2023-10-25T09:15:00Z',
    status: 'Pending',
    customer: {
      name: 'Michael Ross',
      email: 'm.ross@example.com',
      phone: '+1 555-0844',
      address: '456 Oak Ave, CA 94102',
    },
    paymentMethod: 'PayPal',
    items: [
      { name: 'Minimalist Wall Clock', price: 85, quantity: 1 },
    ],
    total: 85,
  },
  {
    id: 'ORD-2023-1044',
    date: '2023-10-25T11:45:00Z',
    status: 'Delivered',
    customer: {
      name: 'Emily Chen',
      email: 'emily.chen@example.com',
      phone: '+1 555-0231',
      address: '789 Pine Rd, WA 98101',
    },
    paymentMethod: 'Apple Pay',
    items: [
      { name: 'Velvet Armchair', price: 450, quantity: 1 },
      { name: 'Brass Floor Lamp', price: 210, quantity: 1 },
    ],
    total: 660,
  },
];

export const mockTransactions = [
  {
    id: 'TXN-984210',
    orderId: 'ORD-2023-1042',
    customer: 'Sarah Jenkins',
    method: 'Stripe (Visa)',
    amount: 210,
    status: 'Settled',
    date: '2023-10-24T14:32:00Z',
  },
  {
    id: 'TXN-984211',
    orderId: 'ORD-2023-1043',
    customer: 'Michael Ross',
    method: 'PayPal',
    amount: 85,
    status: 'Pending',
    date: '2023-10-25T09:16:00Z',
  },
  {
    id: 'TXN-984212',
    orderId: 'ORD-2023-1044',
    customer: 'Emily Chen',
    method: 'Apple Pay',
    amount: 660,
    status: 'Settled',
    date: '2023-10-25T11:46:00Z',
  },
];

export const mockMessages = [
  {
    id: 'MSG-001',
    sender: 'David Kim',
    email: 'dkim@example.com',
    subject: 'Question about custom sizing',
    body: 'Hi, I was wondering if the velvet armchair comes in a wider size? I love the color but need something a bit broader.',
    date: '2023-10-25T08:30:00Z',
    isRead: false,
  },
  {
    id: 'MSG-002',
    sender: 'Anna Smith',
    email: 'asmith@example.com',
    subject: 'Shipping to Canada',
    body: 'Do you ship to Toronto? I tried checking out but wasn\'t sure if the duties were included in the shipping fee.',
    date: '2023-10-24T16:20:00Z',
    isRead: true,
  },
];

export const mockUsers = [
  {
    id: 'USR-001',
    name: 'Admin User',
    email: 'admin@livingspacehub.com',
    role: 'Administrator',
    joined: '2023-01-15T00:00:00Z',
  },
  {
    id: 'USR-002',
    name: 'Jane Doe',
    email: 'jane@livingspacehub.com',
    role: 'Store Manager',
    joined: '2023-03-22T00:00:00Z',
  },
  {
    id: 'USR-003',
    name: 'Mark Taylor',
    email: 'mark@livingspacehub.com',
    role: 'Support Agent',
    joined: '2023-06-10T00:00:00Z',
  },
];

export const mockSalesData = [
  { name: 'Mon', revenue: 4000, orders: 24 },
  { name: 'Tue', revenue: 3000, orders: 18 },
  { name: 'Wed', revenue: 5500, orders: 32 },
  { name: 'Thu', revenue: 4500, orders: 27 },
  { name: 'Fri', revenue: 6000, orders: 35 },
  { name: 'Sat', revenue: 8000, orders: 48 },
  { name: 'Sun', revenue: 7500, orders: 42 },
];
