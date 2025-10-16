# Banking Platform Frontend

Modern Next.js frontend for the Mini Banking Platform with React 18 and Tailwind CSS.

## Features

- ✅ **User Authentication**: Login and registration
- ✅ **Dashboard**: Real-time account balances and recent transactions
- ✅ **Money Transfer**: Transfer funds to other users
- ✅ **Currency Exchange**: Exchange between USD and EUR
- ✅ **Transaction History**: View all transactions with filters and pagination
- ✅ **Responsive Design**: Mobile-friendly interface
- ✅ **Real-time Updates**: Balance updates after transactions

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Language**: TypeScript

## Prerequisites

- Node.js 18+ or 20+
- Backend API running on port 3001

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm run start
```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Dashboard page
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── transactions/      # Transaction history
│   ├── transfer/          # Transfer & exchange forms
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (redirects)
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Select.tsx
│   └── Layout.tsx        # Main layout with navigation
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
└── lib/                  # Utilities and API
    ├── api.ts            # API client and endpoints
    └── utils.ts          # Helper functions
```

## Pages

### Authentication

- **Login** (`/login`): User login with test credentials displayed
- **Register** (`/register`): Create new account (receives $1000 USD + €500 EUR)

### Main Application

- **Dashboard** (`/dashboard`): 
  - Account balances (USD and EUR)
  - Quick action buttons
  - Recent 5 transactions
  
- **Transfer** (`/transfer`):
  - Transfer money to other users (same currency)
  - Exchange currency between your accounts
  - Real-time exchange rate calculation
  - Balance validation
  
- **Transactions** (`/transactions`):
  - Complete transaction history
  - Filter by type (Transfer/Exchange)
  - Pagination
  - Transaction details with status

## Key Features

### Authentication Flow

1. User logs in with email/password
2. JWT token stored in localStorage
3. Token automatically added to API requests
4. Automatic redirect on 401 errors

### Transfer Flow

1. Select recipient from dropdown
2. Choose currency (USD or EUR)
3. Enter amount (validated against balance)
4. Add optional description
5. Confirm transfer
6. Success message and redirect to dashboard

### Exchange Flow

1. Select source currency
2. Enter amount
3. See real-time converted amount
4. Exchange rate displayed (1 USD = 0.92 EUR)
5. Confirm exchange
6. Balance updates immediately

### Error Handling

- Form validation with error messages
- API error handling with user-friendly messages
- Insufficient funds validation
- Network error handling
- Automatic auth error handling (redirect to login)

## API Integration

The frontend communicates with the backend API using Axios:

```typescript
// Example API calls
await authApi.login({ email, password });
await accountsApi.getAccounts();
await transactionsApi.transfer({ toUserId, currency, amount });
await transactionsApi.exchange({ fromCurrency, toCurrency, amount });
```

All API requests automatically include the JWT token from localStorage.

## Styling

The application uses Tailwind CSS with a custom design system:

- **Colors**: Blue primary, with semantic colors for success/error
- **Components**: Card-based layout with consistent spacing
- **Icons**: Lucide React icons throughout
- **Responsive**: Mobile-first design approach

## State Management

- **Auth State**: Managed via React Context (AuthContext)
- **Component State**: Local state with useState
- **Data Fetching**: useEffect hooks with async/await
- **No external state library needed** for this scope

## Test Users

Use these credentials to test the application:

- alice@example.com / password123
- bob@example.com / password123
- charlie@example.com / password123

Each user starts with $1,000 USD and €500 EUR.

## Development Notes

### Adding New Pages

1. Create page in `src/app/[pagename]/page.tsx`
2. Add route to navigation in `Layout.tsx`
3. Protect route with auth check using `useAuth()` hook

### Adding New API Endpoints

1. Add endpoint function to `src/lib/api.ts`
2. Use the configured axios instance
3. Types are automatically included

### Styling Components

Use Tailwind utility classes with the `cn()` helper for conditional styling:

```tsx
<div className={cn('base-classes', condition && 'conditional-classes')}>
```

## Performance Considerations

- Next.js automatic code splitting
- Image optimization (if images added)
- Client-side navigation (no full page reloads)
- Lazy loading for routes

## Security

- JWT tokens in localStorage
- Automatic token refresh handling
- CORS configuration
- XSS protection via React
- Input validation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Known Limitations

- No offline support
- Token stored in localStorage (consider httpOnly cookies for production)
- No refresh token mechanism
- Limited error recovery options

## Future Enhancements

- [ ] Dark mode support
- [ ] Transaction search
- [ ] Export transactions to CSV
- [ ] Real-time notifications (WebSockets)
- [ ] Profile management
- [ ] Multi-language support
- [ ] Advanced filtering options
- [ ] Transaction receipts/PDFs

## Troubleshooting

### API Connection Issues

If you see "Network Error":
1. Ensure backend is running on port 3001
2. Check `.env.local` has correct API URL
3. Verify CORS is enabled on backend

### Authentication Issues

If logged out unexpectedly:
1. Check backend JWT configuration
2. Verify token hasn't expired
3. Check browser console for errors

### Build Issues

If build fails:
1. Clear `.next` folder: `rm -rf .next`
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Check TypeScript errors: `npm run lint`

## Contributing

This is an assessment project. For production use, consider:
- Adding comprehensive tests
- Implementing error boundaries
- Adding loading states everywhere
- Improving accessibility (ARIA labels)
- Adding analytics
- Implementing proper SEO

## License

MIT
