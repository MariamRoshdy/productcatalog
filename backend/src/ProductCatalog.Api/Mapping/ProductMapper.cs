using ProductCatalog.Api.Domain;
using ProductCatalog.Api.Dtos;

namespace ProductCatalog.Api.Mapping;

public static class ProductMapper
{
    public static ProductDto ToDto(this Product product) =>
        new(
            product.Id,
            product.Name,
            product.Description,
            product.Price,
            product.StockQuantity,
            product.CreatedAt,
            product.UpdatedAt);

    public static Product ToEntity(this CreateProductDto dto) =>
        new()
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            StockQuantity = dto.StockQuantity
        };

    public static void ApplyChanges(this UpdateProductDto dto, Product product)
    {
        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.StockQuantity = dto.StockQuantity;
    }
}
