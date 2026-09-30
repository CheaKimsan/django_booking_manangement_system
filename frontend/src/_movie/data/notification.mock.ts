type Notification = {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
};

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'New booking',
    description: 'Sok Dara booked Heart of the Beast',
    time: '2m ago',
    unread: true,
  },
  {
    id: '2',
    title: 'Payment received',
    description: '$48.00 from John Doe',
    time: '18m ago',
    unread: true,
  },
  {
    id: '3',
    title: 'Movie added',
    description: 'Forgotten Island is now live',
    time: '1h ago',
    unread: true,
  },
  {
    id: '4',
    title: 'System update',
    description: 'Scheduled maintenance tonight',
    time: '3h ago',
    unread: false,
  },
];
