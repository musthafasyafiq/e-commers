import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard overview' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  async getDashboardOverview(@Query('timeRange') timeRange: string = '30d') {
    return this.adminService.getDashboardOverview(timeRange);
  }

  @Get('analytics/revenue')
  @ApiOperation({ summary: 'Get revenue analytics' })
  @ApiResponse({ status: 200, description: 'Revenue analytics retrieved successfully' })
  async getRevenueAnalytics(@Query('timeRange') timeRange: string = '30d') {
    return this.adminService.getRevenueAnalytics(timeRange);
  }

  @Get('analytics/categories')
  @ApiOperation({ summary: 'Get category analytics' })
  @ApiResponse({ status: 200, description: 'Category analytics retrieved successfully' })
  async getCategoryAnalytics() {
    return this.adminService.getCategoryAnalytics();
  }

  @Get('products/top')
  @ApiOperation({ summary: 'Get top performing products' })
  @ApiResponse({ status: 200, description: 'Top products retrieved successfully' })
  async getTopProducts(@Query('limit') limit: number = 10) {
    return this.adminService.getTopProducts(limit);
  }

  @Get('orders/recent')
  @ApiOperation({ summary: 'Get recent orders' })
  @ApiResponse({ status: 200, description: 'Recent orders retrieved successfully' })
  async getRecentOrders(@Query('limit') limit: number = 10) {
    return this.adminService.getRecentOrders(limit);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get users list' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.adminService.getUsers(page, limit);
  }

  @Get('inventory/status')
  @ApiOperation({ summary: 'Get inventory status' })
  @ApiResponse({ status: 200, description: 'Inventory status retrieved successfully' })
  async getInventoryStatus() {
    return this.adminService.getInventoryStatus();
  }
}
