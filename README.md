# Modern E-Commerce Platform

A full-stack, production-ready e-commerce platform built with Next.js, NestJS, PostgreSQL, and modern web technologies.

## 🚀 Features

### Frontend (Next.js)
- **Modern UI/UX**: Built with TailwindCSS and shadcn/ui components
- **Authentication**: Email/phone login, social login (Google), OTP verification
- **Product Catalog**: Advanced search, filtering, sorting, and pagination
- **Shopping Cart**: Real-time cart management with persistent storage
- **Checkout System**: Multi-step checkout with address and payment forms
- **Seller Dashboard**: Comprehensive seller management interface
- **Responsive Design**: Mobile-first approach with dark/light mode support

### Backend (NestJS)
- **RESTful API**: Well-structured API with Swagger documentation
- **Authentication & Authorization**: JWT-based auth with refresh tokens
- **Database**: PostgreSQL with TypeORM for robust data management
- **Payment Integration**: Midtrans and Stripe support with escrow system
- **File Upload**: Secure file handling for product images
- **Caching**: Redis integration for improved performance
- **Security**: Rate limiting, CORS, helmet, input validation

### Infrastructure
- **Containerization**: Docker and Docker Compose setup
- **Load Balancing**: Nginx reverse proxy configuration
- **Database**: PostgreSQL with proper indexing and relationships
- **Caching**: Redis for session management and caching
- **Security**: Comprehensive security headers and middleware

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: React Query + Context API
- **Authentication**: NextAuth.js
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Charts**: Recharts

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis
- **Authentication**: Passport.js + JWT
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **File Upload**: Multer
- **Payment**: Midtrans + Stripe

### DevOps & Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **Process Management**: PM2 (optional)
- **Environment**: Environment-based configuration

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL (if running locally)
- Redis (if running locally)

### Quick Start with Docker

1. **Clone the repository**
```bash
git clone <repository-url>
cd Website
```

2. **Environment Setup**
```bash
# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env

# Update environment variables in both files
```

3. **Start with Docker Compose**
```bash
docker-compose up -d
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api

### Local Development Setup

1. **Install dependencies**
```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

2. **Database Setup**
```bash
# Start PostgreSQL and Redis
docker-compose up postgres redis -d

# Run migrations (if any)
cd backend
npm run migration:run
```

3. **Start development servers**
```bash
# Frontend (Terminal 1)
npm run dev

# Backend (Terminal 2)
cd backend
npm run start:dev
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Backend (backend/.env)
```env
NODE_ENV=development
PORT=3001

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=ecommerce
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Payment Gateways
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Email & SMS
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone
```

## 📚 API Documentation

The API documentation is automatically generated using Swagger and available at:
- Development: http://localhost:3001/api
- Production: https://your-domain.com/api

### Key Endpoints

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/google` - Google OAuth login
- `POST /auth/verify-email` - Email verification
- `POST /auth/verify-phone` - Phone verification

#### Products
- `GET /products` - Get products with filtering
- `GET /products/:id` - Get product details
- `POST /products` - Create product (seller only)
- `PUT /products/:id` - Update product (seller only)

#### Orders & Payments
- `POST /orders` - Create order
- `GET /orders` - Get user orders
- `POST /payments` - Create payment
- `POST /payments/webhook/midtrans` - Midtrans webhook

#### Seller Dashboard
- `GET /sellers/dashboard` - Get seller analytics
- `GET /sellers/products` - Get seller products
- `GET /sellers/orders` - Get seller orders

## 🏗 Architecture

### Database Schema
The application uses a comprehensive database schema with the following main entities:
- **Users**: User accounts with authentication
- **Products**: Product catalog with variants and images
- **Orders**: Order management with items and payments
- **Sellers**: Seller accounts and marketplace features
- **Payments**: Payment processing with escrow support
- **Categories**: Product categorization
- **Reviews**: Product reviews and ratings

### Security Features
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: TypeORM query builder
- **XSS Protection**: Input sanitization
- **CORS Configuration**: Cross-origin request handling
- **Security Headers**: Helmet.js integration
- **JWT Security**: Secure token handling

### Performance Optimizations
- **Database Indexing**: Optimized database queries
- **Redis Caching**: Session and data caching
- **Image Optimization**: Next.js image optimization
- **Code Splitting**: Automatic code splitting
- **Compression**: Gzip compression
- **CDN Ready**: Static asset optimization

## 🚀 Deployment

### Production Deployment

1. **Build the application**
```bash
# Frontend
npm run build

# Backend
cd backend
npm run build
```

2. **Deploy with Docker**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. **Set up SSL (recommended)**
```bash
# Use Let's Encrypt with Certbot
certbot --nginx -d your-domain.com
```

### Environment-specific Configurations
- **Development**: Hot reloading, detailed logging
- **Staging**: Production-like environment for testing
- **Production**: Optimized builds, security headers, SSL

## 🧪 Testing

```bash
# Frontend tests
npm run test

# Backend tests
cd backend
npm run test
npm run test:e2e
```

## 📈 Monitoring & Analytics

### Built-in Analytics
- **Seller Dashboard**: Revenue, orders, product performance
- **Admin Dashboard**: Platform-wide analytics
- **User Behavior**: Order tracking, conversion rates

### Logging
- **Request Logging**: All API requests logged
- **Error Tracking**: Comprehensive error handling
- **Performance Monitoring**: Response time tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API documentation at `/api`

## 🔮 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Advanced inventory management
- [ ] AI-powered product recommendations
- [ ] Real-time chat support
- [ ] Advanced shipping integrations
- [ ] Subscription-based products

---

Built with ❤️ using modern web technologies
