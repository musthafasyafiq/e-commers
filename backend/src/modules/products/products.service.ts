import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between, Not } from 'typeorm';

import { Product, ProductStatus } from '../../entities/product.entity';
import { ProductVariant } from '../../entities/product-variant.entity';
import { ProductImage } from '../../entities/product-image.entity';
import { Category } from '../../entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private variantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductImage)
    private imageRepository: Repository<ProductImage>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto, sellerId: string) {
    const { categoryId, variants, images, ...productData } = createProductDto;

    // Verify category exists
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Generate slug
    const slug = this.generateSlug(productData.name);

    // Create product
    const product = this.productRepository.create({
      ...productData,
      slug,
      sellerId,
      categoryId,
    });

    const savedProduct = await this.productRepository.save(product);

    // Create variants if provided
    if (variants && variants.length > 0) {
      const productVariants = variants.map(variant =>
        this.variantRepository.create({
          ...variant,
          productId: savedProduct.id,
        })
      );
      await this.variantRepository.save(productVariants);
    }

    // Create images if provided
    if (images && images.length > 0) {
      const productImages = images.map((image, index) =>
        this.imageRepository.create({
          ...image,
          productId: savedProduct.id,
          sortOrder: index,
          isPrimary: index === 0,
        })
      );
      await this.imageRepository.save(productImages);
    }

    return this.findOne(savedProduct.id);
  }

  async findAll(query: ProductQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      sellerId,
      minPrice,
      maxPrice,
      status = ProductStatus.ACTIVE,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      isFeatured,
    } = query;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.seller', 'seller')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.variants', 'variants')
      .where('product.status = :status', { status });

    // Search filter
    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search OR product.tags && :searchArray)',
        {
          search: `%${search}%`,
          searchArray: [search],
        }
      );
    }

    // Category filter
    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    // Seller filter
    if (sellerId) {
      queryBuilder.andWhere('product.sellerId = :sellerId', { sellerId });
    }

    // Price range filter
    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Featured filter
    if (isFeatured !== undefined) {
      queryBuilder.andWhere('product.isFeatured = :isFeatured', { isFeatured });
    }

    // Sorting
    queryBuilder.orderBy(`product.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [products, total] = await queryBuilder.getManyAndCount();

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: [
        'category',
        'seller',
        'images',
        'variants',
        'reviews',
        'relatedProducts',
      ],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Increment view count
    await this.productRepository.increment({ id }, 'viewCount', 1);

    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: [
        'category',
        'seller',
        'images',
        'variants',
        'reviews',
        'relatedProducts',
      ],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Increment view count
    await this.productRepository.increment({ id: product.id }, 'viewCount', 1);

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, sellerId?: string) {
    const product = await this.findOne(id);

    // Check if seller owns the product (if sellerId provided)
    if (sellerId && product.sellerId !== sellerId) {
      throw new BadRequestException('You can only update your own products');
    }

    const { variants, images, ...productData } = updateProductDto;

    // Update slug if name changed
    if (productData.name && productData.name !== product.name) {
      productData.slug = this.generateSlug(productData.name);
    }

    await this.productRepository.update(id, productData);

    // Update variants if provided
    if (variants) {
      // Remove existing variants
      await this.variantRepository.delete({ productId: id });
      
      // Create new variants
      if (variants.length > 0) {
        const productVariants = variants.map(variant =>
          this.variantRepository.create({
            ...variant,
            productId: id,
          })
        );
        await this.variantRepository.save(productVariants);
      }
    }

    // Update images if provided
    if (images) {
      // Remove existing images
      await this.imageRepository.delete({ productId: id });
      
      // Create new images
      if (images.length > 0) {
        const productImages = images.map((image, index) =>
          this.imageRepository.create({
            ...image,
            productId: id,
            sortOrder: index,
            isPrimary: index === 0,
          })
        );
        await this.imageRepository.save(productImages);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string, sellerId?: string) {
    const product = await this.findOne(id);

    // Check if seller owns the product (if sellerId provided)
    if (sellerId && product.sellerId !== sellerId) {
      throw new BadRequestException('You can only delete your own products');
    }

    await this.productRepository.remove(product);
    return { message: 'Product deleted successfully' };
  }

  async getFeaturedProducts(limit: number = 8) {
    return this.productRepository.find({
      where: {
        isFeatured: true,
        status: ProductStatus.ACTIVE,
      },
      relations: ['category', 'seller', 'images'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getRelatedProducts(productId: string, limit: number = 4) {
    const product = await this.findOne(productId);
    
    return this.productRepository.find({
      where: {
        categoryId: product.categoryId,
        status: ProductStatus.ACTIVE,
        id: Not(productId),
      },
      relations: ['category', 'seller', 'images'],
      order: { salesCount: 'DESC' },
      take: limit,
    });
  }

  async updateStock(productId: string, variantId: string | null, quantity: number) {
    if (variantId) {
      await this.variantRepository.decrement({ id: variantId }, 'stock', quantity);
    } else {
      await this.productRepository.decrement({ id: productId }, 'stock', quantity);
    }
  }

  async updateSalesCount(productId: string, quantity: number) {
    await this.productRepository.increment({ id: productId }, 'salesCount', quantity);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
