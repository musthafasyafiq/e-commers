import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SellersService } from './sellers.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';

@ApiTags('sellers')
@Controller('sellers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Post()
  @ApiOperation({ summary: 'Create seller account' })
  @ApiResponse({ status: 201, description: 'Seller account created successfully' })
  @ApiResponse({ status: 400, description: 'User already has a seller account' })
  async createSeller(@Body() createSellerDto: CreateSellerDto, @Request() req) {
    return this.sellersService.createSeller(createSellerDto, req.user.id);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get seller profile' })
  @ApiResponse({ status: 200, description: 'Seller profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Seller account not found' })
  async getSellerProfile(@Request() req) {
    return this.sellersService.getSellerByUserId(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update seller profile' })
  @ApiResponse({ status: 200, description: 'Seller profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Seller not found' })
  async updateSellerProfile(
    @Body() updateSellerDto: UpdateSellerDto,
    @Request() req,
  ) {
    const seller = await this.sellersService.getSellerByUserId(req.user.id);
    return this.sellersService.updateSeller(seller.id, updateSellerDto);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get seller dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  async getDashboard(@Request() req) {
    return this.sellersService.getSellerDashboard(req.user.id);
  }

  @Get('products')
  @ApiOperation({ summary: 'Get seller products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async getSellerProducts(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.sellersService.getSellerProducts(req.user.id, page, limit);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get seller orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async getSellerOrders(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.sellersService.getSellerOrders(req.user.id, page, limit);
  }

  @Put('orders/:orderId/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: string,
    @Request() req,
  ) {
    await this.sellersService.updateOrderStatus(req.user.id, orderId, status);
    return { message: 'Order status updated successfully' };
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get seller analytics' })
  @ApiResponse({ status: 200, description: 'Analytics data retrieved successfully' })
  async getAnalytics(
    @Request() req,
    @Query('timeRange') timeRange: string = '30d',
  ) {
    return this.sellersService.getSellerAnalytics(req.user.id, timeRange);
  }
}
