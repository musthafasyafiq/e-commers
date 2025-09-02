import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Product } from '../../entities/product.entity';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { Payment } from '../../entities/payment.entity';
import { Category } from '../../entities/category.entity';
import { Seller } from '../../entities/seller.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Seller)
    private sellerRepository: Repository<Seller>,
  ) {}

  async getDashboardOverview(timeRange: string = '30d'): Promise<any> {
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;

    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    }

    // Current period stats
    const [totalRevenue, totalOrders, totalUsers, totalProducts] = await Promise.all([
      this.getTotalRevenue(startDate, now),
      this.getTotalOrders(startDate, now),
      this.getTotalUsers(startDate, now),
      this.getTotalProducts(),
    ]);

    // Previous period stats for growth calculation
    const [prevRevenue, prevOrders, prevUsers] = await Promise.all([
      this.getTotalRevenue(previousStartDate, startDate),
      this.getTotalOrders(previousStartDate, startDate),
      this.getTotalUsers(previousStartDate, startDate),
    ]);

    // Calculate growth percentages
    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const ordersGrowth = prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0;
    const usersGrowth = prevUsers > 0 ? ((totalUsers - prevUsers) / prevUsers) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      ordersGrowth: Math.round(ordersGrowth * 100) / 100,
      usersGrowth: Math.round(usersGrowth * 100) / 100,
      productsGrowth: 0, // Products don't have time-based growth in this context
    };
  }

  async getRevenueAnalytics(timeRange: string = '30d'): Promise<any[]> {
    const now = new Date();
    let startDate: Date;
    let groupBy: string;

    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        groupBy = 'week';
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        groupBy = 'month';
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
    }

    const payments = await this.paymentRepository.find({
      where: {
        status: 'completed',
        createdAt: Between(startDate, now),
      },
      order: { createdAt: 'ASC' },
    });

    return this.groupRevenueByPeriod(payments, groupBy, startDate, now);
  }

  async getCategoryAnalytics(): Promise<any[]> {
    const categories = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.products', 'product')
      .leftJoin('product.orderItems', 'orderItem')
      .select('category.name', 'name')
      .addSelect('COUNT(orderItem.id)', 'sales')
      .addSelect('SUM(orderItem.totalPrice)', 'revenue')
      .groupBy('category.id')
      .addGroupBy('category.name')
      .orderBy('SUM(orderItem.totalPrice)', 'DESC')
      .getRawMany();

    const totalRevenue = categories.reduce((sum, cat) => sum + parseFloat(cat.revenue || 0), 0);

    return categories.map(category => ({
      name: category.name,
      value: totalRevenue > 0 ? Math.round((parseFloat(category.revenue || 0) / totalRevenue) * 100) : 0,
      sales: parseInt(category.sales || 0),
      revenue: parseFloat(category.revenue || 0),
    }));
  }

  async getTopProducts(limit: number = 10): Promise<any[]> {
    return this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoin('orderItem.product', 'product')
      .select('product.id', 'id')
      .addSelect('product.name', 'name')
      .addSelect('COUNT(orderItem.id)', 'sales')
      .addSelect('SUM(orderItem.totalPrice)', 'revenue')
      .addSelect('AVG(product.rating)', 'rating')
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('SUM(orderItem.totalPrice)', 'DESC')
      .limit(limit)
      .getRawMany()
      .then(results => 
        results.map(result => ({
          id: result.id,
          name: result.name,
          sales: parseInt(result.sales),
          revenue: parseFloat(result.revenue),
          rating: parseFloat(result.rating || 0),
        }))
      );
  }

  async getRecentOrders(limit: number = 10): Promise<any[]> {
    const orders = await this.orderRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return orders.map(order => ({
      id: order.id,
      customer: `${order.user.firstName} ${order.user.lastName}`,
      amount: order.totalAmount,
      status: order.status,
      date: order.createdAt.toISOString(),
    }));
  }

  async getUsers(page: number = 1, limit: number = 10): Promise<any> {
    const [users, total] = await this.userRepository.findAndCount({
      relations: ['orders'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orderCount = await this.orderRepository.count({
          where: { user: { id: user.id } },
        });

        const totalSpent = await this.orderRepository
          .createQueryBuilder('order')
          .select('SUM(order.totalAmount)', 'total')
          .where('order.userId = :userId', { userId: user.id })
          .andWhere('order.status = :status', { status: 'completed' })
          .getRawOne()
          .then(result => parseFloat(result.total || 0));

        const isSeller = await this.sellerRepository.findOne({
          where: { user: { id: user.id } },
        });

        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: isSeller ? 'seller' : 'customer',
          status: user.isActive ? 'active' : 'inactive',
          orders: orderCount,
          totalSpent,
          createdAt: user.createdAt,
        };
      })
    );

    return {
      users: usersWithStats,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getInventoryStatus(): Promise<any> {
    const [lowStock, outOfStock, wellStocked] = await Promise.all([
      this.productRepository.count({
        where: { stock: Between(1, 10) },
      }),
      this.productRepository.count({
        where: { stock: 0 },
      }),
      this.productRepository.count({
        where: { stock: Between(11, 999999) },
      }),
    ]);

    return {
      lowStock,
      outOfStock,
      wellStocked,
      total: lowStock + outOfStock + wellStocked,
    };
  }

  private async getTotalRevenue(startDate: Date, endDate: Date): Promise<number> {
    const result = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: 'completed' })
      .andWhere('payment.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    return parseFloat(result.total || 0);
  }

  private async getTotalOrders(startDate: Date, endDate: Date): Promise<number> {
    return this.orderRepository.count({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });
  }

  private async getTotalUsers(startDate: Date, endDate: Date): Promise<number> {
    return this.userRepository.count({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });
  }

  private async getTotalProducts(): Promise<number> {
    return this.productRepository.count();
  }

  private groupRevenueByPeriod(payments: any[], groupBy: string, startDate: Date, endDate: Date): any[] {
    const grouped = new Map<string, { revenue: number; orders: number }>();

    // Initialize periods
    const current = new Date(startDate);
    while (current <= endDate) {
      let key: string;
      
      if (groupBy === 'day') {
        key = current.toISOString().split('T')[0];
        current.setDate(current.getDate() + 1);
      } else if (groupBy === 'week') {
        key = `${current.getFullYear()}-W${Math.ceil(current.getDate() / 7)}`;
        current.setDate(current.getDate() + 7);
      } else {
        key = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}`;
        current.setMonth(current.getMonth() + 1);
      }

      grouped.set(key, { revenue: 0, orders: 0 });
    }

    // Group payments
    payments.forEach(payment => {
      let key: string;
      const date = new Date(payment.createdAt);
      
      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        key = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
      } else {
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      }

      if (grouped.has(key)) {
        const current = grouped.get(key)!;
        current.revenue += payment.amount;
        current.orders += 1;
      }
    });

    return Array.from(grouped.entries()).map(([period, data]) => ({
      period,
      revenue: data.revenue,
      orders: data.orders,
    }));
  }
}
