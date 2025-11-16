import {
    Controller,
    Post,
    Get,
    Patch,
    Body,
    Param,
    HttpCode,
    HttpStatus,
    Query,
} from '@nestjs/common';
import { CreateProductUseCase, FindProductUseCase, ListProductsUseCase, UpdateProductUseCase, SearchProductsUseCase } from '../application/usecases';
import { DisableProductUseCase } from '../application/usecases/products/disable-product.usecase';
import { UpdateProductDto } from '../application/dtos/products/updateProduct.dto';
import { OrganizationId } from 'src/common/decorators/organization-id.decorator';
import { CreateProductDto } from '../application/dtos/products/createProduct.dto';
import { SearchProductsDto } from '../application/dtos/search-products.dto';
import { Public } from 'src/common/decorators/public.decorator';


@Controller('products')
export class ProductController {
    constructor(
        private readonly createProductUseCase: CreateProductUseCase,
        private readonly findProductUseCase: FindProductUseCase,
        private readonly listProductsUseCase: ListProductsUseCase,
        private readonly updateProductUseCase: UpdateProductUseCase,
        private readonly disableProductUseCase: DisableProductUseCase,
        private readonly searchProductsUseCase: SearchProductsUseCase,
    ) {}

    @Get('catalog')
    @HttpCode(HttpStatus.OK)
    @Public()
    async catalog(@Query('limit') limit?: number, @Query('offset') offset?: number) {
        return this.listProductsUseCase.executeCatalog(limit || 10, offset || 0);
    }

    @Get('search')
    @HttpCode(HttpStatus.OK)
    @Public()
    async search(@Query() dto: SearchProductsDto) {
        return this.searchProductsUseCase.execute(dto);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body() dto: CreateProductDto,
        @OrganizationId() organizationId: string,
    ) {
        const product = await this.createProductUseCase.execute({
            organizationId,
            ...dto,
        });
        return product;
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateProductDto,
        @OrganizationId() organizationId: string,
    ) {
        const product = await this.updateProductUseCase.execute({
            id,
            organizationId,
            product: dto,
        });

        return product;
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAllOrganization(@OrganizationId() organizationId: string) {
        return this.listProductsUseCase.execute(organizationId);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOneOrganization(@Param('id') id: string, @OrganizationId() organizationId: string) {
        return this.findProductUseCase.execute({ id, organizationId });
    }
    
    @Patch(':id/disable')
    @HttpCode(HttpStatus.OK)
    async disable(
        @Param('id') id: string,
        @OrganizationId() organizationId: string,
    ) {
        await this.disableProductUseCase.execute(
            id,
            organizationId,
        );
    }
}
