import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Seller } from '../../entities/seller.entity';
import { User } from '../../entities/user.entity';
import { Product } from '../../entities/product.entity';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';

@Injectable()
export class SellersService {
  constructor(
    @InjectRepository(Seller)
    private sellerRepository: Repository<Seller>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  async createSeller(createSellerDto: CreateSellerDto, userId: string): Promise<Seller> {
    // Check if user already has a seller account
    const existingSeller = await this.sellerRepository.findOne({
      where: { user: { id: userId } },
    });

    if (existingSeller) {
      throw new BadRequestException('User already has a seller account');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const seller = this.sellerRepository.create({
      ...createSellerDto,
      user,
      status: 'pending' as any,
      commissionRate: 0.05, // 5% default commission
    });

    return this.sellerRepository.save(seller);
  }

  async getSellerByUserId(userId: string): Promise<Seller> {
    const seller = await this.sellerRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!seller) {
      throw new NotFoundException('Seller account not found');
    }

    return seller;
  }

  async updateSeller(sellerId: string, updateSellerDto: UpdateSellerDto): Promise<Seller> {
    const seller = await this.sellerRepository.findOne({
      where: { id: sellerId },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    Object.assign(seller, updateSellerDto);
    return this.sellerRepository.save(seller);
  }

  async getSellerDashboard(userId: string): Promise<any> {
    const seller = await this.getSellerByUserId(userId);

    // Get date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get products count
    const totalProducts = await this.productRepository.count({
      where: { seller: { id: seller.id } },
    });

    // Get orders for this seller
    const orderItems = await this.orderItemRepository.find({
      where: {
        seller: { id: seller.id },
        createdAt: Between(thirtyDaysAgo, now),
      },
      relations: ['order', 'product'],
    });

    const lastMonthOrderItems = await this.orderItemRepository.find({
      where: {
        seller: { id: seller.id },
        createdAt: Between(lastMonth, lastMonthEnd),
      },
    });

    // Calculate metrics
    const totalRevenue = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const lastMonthRevenue = lastMonthOrderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalOrders = orderItems.length;
    const lastMonthOrders = lastMonthOrderItems.length;

    // Get pending orders
    const pendingOrderItems = await this.orderItemRepository.find({
      where: {
        seller: { id: seller.id },
        order: { status: 'pending' as any },
      },
      relations: ['order'],
    });

    // Calculate revenue by day for chart
    const revenueByDay = this.calculateDailyRevenue(orderItems, thirtyDaysAgo, now);

    // Get top products
    const topProducts = await this.getTopProducts(seller.id);

    // Get recent orders
    const recentOrders = await this.getRecentOrders(seller.id);

    return {
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        averageRating: seller.averageRating || 0,
        conversionRate: seller.conversionRate || 0,
        pendingOrders: pendingOrderItems.length,
        revenueGrowth: lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0,
        ordersGrowth: lastMonthOrders > 0 ? ((totalOrders - lastMonthOrders) / lastMonthOrders) * 100 : 0,
      },
      revenueData: revenueByDay,
      topProducts,
      recentOrders,
    };
  }

  private calculateDailyRevenue(orderItems: OrderItem[], startDate: Date, endDate: Date): any[] {
    const dailyRevenue = new Map<string, number>();

    // Initialize all days with 0
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      dailyRevenue.set(dateKey, 0);
    }

    // Aggregate revenue by day
    orderItems.forEach(item => {
      const dateKey = item.createdAt.toISOString().split('T')[0];
      const currentRevenue = dailyRevenue.get(dateKey) || 0;
      dailyRevenue.set(dateKey, currentRevenue + item.totalPrice);
    });

    // Convert to array format
    return Array.from(dailyRevenue.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  }

  private async getTopProducts(sellerId: string): Promise<any[]> {
    const products = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .select('product.id', 'id')
      .addSelect('product.name', 'name')
      .addSelect('SUM(orderItem.quantity)', 'sales')
      .addSelect('SUM(orderItem.totalPrice)', 'revenue')
      .innerJoin('orderItem.product', 'product')
      .where('orderItem.seller.id = :sellerId', { sellerId })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('SUM(orderItem.totalPrice)', 'DESC')
      .limit(5)
      .getRawMany();

    return products.map(product => ({
      id: product.id,
      name: product.name,
      sales: parseInt(product.sales),
      revenue: parseFloat(product.revenue),
    }));
  }

  private async getRecentOrders(sellerId: string): Promise<any[]> {
    const orderItems = await this.orderItemRepository.find({
      where: { seller: { id: sellerId } },
      relations: ['order', 'order.user', 'product'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return orderItems.map(item => ({
      id: item.order.id,
      customer: `${item.order.user.firstName} ${item.order.user.lastName}`,
      product: item.product.name,
      amount: item.totalPrice,
      status: item.order.status,
      date: item.createdAt.toISOString(),
    }));
  }

  async getSellerProducts(userId: string, page: number = 1, limit: number = 10): Promise<any> {
    const seller = await this.getSellerByUserId(userId);

    const [products, total] = await this.productRepository.findAndCount({
      where: { seller: { id: seller.id } },
      relations: ['category', 'images'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSellerOrders(userId: string, page: number = 1, limit: number = 10): Promise<any> {
    const seller = await this.getSellerByUserId(userId);

    const [orderItems, total] = await this.orderItemRepository.findAndCount({
      where: { seller: { id: seller.id } },
      relations: ['order', 'order.user', 'product'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const orders = orderItems.map(item => ({
      id: item.order.id,
      customer: `${item.order.user.firstName} ${item.order.user.lastName}`,
      product: item.product.name,
      quantity: item.quantity,
      amount: item.totalPrice,
      status: item.order.status,
      date: item.createdAt,
    }));

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateOrderStatus(userId: string, orderId: string, status: string): Promise<void> {
    const seller = await this.getSellerByUserId(userId);

    const orderItem = await this.orderItemRepository.findOne({
      where: {
        order: { id: orderId },
        seller: { id: seller.id },
      },
      relations: ['order'],
    });

    if (!orderItem) {
      throw new NotFoundException('Order not found');
    }

    orderItem.order.status = status as any;
    await this.orderRepository.save(orderItem.order);
  }

  async getSellerAnalytics(userId: string, timeRange: string = '30d'): Promise<any> {
    const seller = await this.getSellerByUserId(userId);

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const orderItems = await this.orderItemRepository.find({
      where: {
        seller: { id: seller.id },
        createdAt: Between(startDate, now),
      },
      relations: ['order', 'product'],
    });

    // Calculate metrics
    const totalRevenue = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalOrders = orderItems.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Product performance
    const productPerformance = this.calculateProductPerformance(orderItems);

    // Revenue trends
    const revenueTrends = this.calculateDailyRevenue(orderItems, startDate, now);

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      productPerformance,
      revenueTrends,
    };
  }

  private calculateProductPerformance(orderItems: OrderItem[]): any[] {
    const productMap = new Map<string, any>();

    orderItems.forEach(item => {
      const productId = item.product.id;
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          id: productId,
          name: item.product.name,
          sales: 0,
          revenue: 0,
          quantity: 0,
        });
      }

      const product = productMap.get(productId);
      product.sales += 1;
      product.revenue += item.totalPrice;
      product.quantity += item.quantity;
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }
}
