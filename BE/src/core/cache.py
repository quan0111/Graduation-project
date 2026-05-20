import functools
import json
import logging
from typing import Optional, Callable, Any, Union

from src.core.redis import RedisClient

logger = logging.getLogger(__name__)
CACHE_FORMAT_VERSION = 1
CACHE_PAYLOAD_VERSION_FIELD = "__cache_format_version"
CACHE_PAYLOAD_DATA_FIELD = "data"


def cache_result(
    key_prefix: str,
    expire_seconds: int = 3600,
    include_args: bool = True,
    exclude_args: Optional[list] = None,
):
    """
    Decorator to cache function results in Redis.
    
    Args:
        key_prefix: Prefix for the cache key
        expire_seconds: Cache expiration time in seconds (default: 1 hour)
        include_args: Whether to include function arguments in cache key
        exclude_args: List of argument names to exclude from cache key
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = key_prefix
            
            if include_args:
                # Get function signature to map args to names
                import inspect
                sig = inspect.signature(func)
                bound_args = sig.bind(*args, **kwargs)
                bound_args.apply_defaults()
                
                # Filter out excluded args
                filtered_args = {
                    k: v for k, v in bound_args.arguments.items()
                    if exclude_args is None or k not in exclude_args
                }
                
                # Create hash of arguments
                args_str = json.dumps(filtered_args, sort_keys=True, default=str)
                import hashlib
                args_hash = hashlib.md5(args_str.encode()).hexdigest()[:8]
                cache_key = f"{key_prefix}:{args_hash}"
            
            # Try to get from cache
            cached_value = await RedisClient.get(cache_key)
            if cached_value is not None:
                try:
                    payload = json.loads(cached_value)
                except json.JSONDecodeError:
                    payload = cached_value

                if (
                    isinstance(payload, dict)
                    and payload.get(CACHE_PAYLOAD_VERSION_FIELD) == CACHE_FORMAT_VERSION
                    and CACHE_PAYLOAD_DATA_FIELD in payload
                ):
                    return payload[CACHE_PAYLOAD_DATA_FIELD]

                logger.info(f"Ignoring legacy cache payload for key: {cache_key}")
                await RedisClient.delete(cache_key)
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            
            # Cache the result
            try:
                await RedisClient.set(
                    cache_key,
                    {
                        CACHE_PAYLOAD_VERSION_FIELD: CACHE_FORMAT_VERSION,
                        CACHE_PAYLOAD_DATA_FIELD: result,
                    },
                    expire_seconds,
                )
                logger.debug(f"Cached result for key: {cache_key}")
            except Exception as e:
                logger.error(f"Failed to cache result for key {cache_key}: {e}")
            
            return result
        
        return wrapper
    return decorator


def cache_invalidate(key_pattern: str):
    """
    Decorator to invalidate cache keys matching pattern after function execution.
    
    Args:
        key_pattern: Pattern to match cache keys for invalidation (supports wildcards)
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            result = await func(*args, **kwargs)
            
            # Invalidate matching cache keys
            try:
                deleted_count = await RedisClient.delete_pattern(key_pattern)
                if deleted_count > 0:
                    logger.info(f"Invalidated {deleted_count} cache keys matching: {key_pattern}")
            except Exception as e:
                logger.error(f"Failed to invalidate cache keys for pattern {key_pattern}: {e}")
            
            return result
        
        return wrapper
    return decorator


class CacheManager:
    """Helper class for common caching operations."""
    
    # Cache key patterns
    PRODUCT_LIST = "product:list"
    PRODUCT_DETAIL = "product:detail"
    CATEGORY_LIST = "category:list"
    CATEGORY_DETAIL = "category:detail"
    SHOP_PRODUCTS = "shop:products"
    USER_CART = "user:cart"
    
    # Cache expiration times (in seconds)
    SHORT_TTL = 300  # 5 minutes
    MEDIUM_TTL = 1800  # 30 minutes
    LONG_TTL = 3600  # 1 hour
    VERY_LONG_TTL = 86400  # 24 hours
    
    @staticmethod
    async def invalidate_product_cache(product_id: Optional[int] = None):
        """Invalidate product-related cache keys."""
        patterns = [
            f"{CacheManager.PRODUCT_LIST}*",
            f"{CacheManager.PRODUCT_DETAIL}*",
            f"{CacheManager.SHOP_PRODUCTS}*",
        ]
        
        if product_id:
            patterns.append(f"{CacheManager.PRODUCT_DETAIL}:{product_id}")
        
        for pattern in patterns:
            await RedisClient.delete_pattern(pattern)
        logger.info(f"Invalidated product cache for product_id: {product_id}")
    
    @staticmethod
    async def invalidate_category_cache(category_id: Optional[int] = None):
        """Invalidate category-related cache keys."""
        patterns = [
            f"{CacheManager.CATEGORY_LIST}*",
        ]
        
        if category_id:
            patterns.append(f"{CacheManager.CATEGORY_DETAIL}:{category_id}")
        
        for pattern in patterns:
            await RedisClient.delete_pattern(pattern)
        logger.info(f"Invalidated category cache for category_id: {category_id}")
    
    @staticmethod
    async def invalidate_user_cart(user_id: int):
        """Invalidate user cart cache."""
        cache_key = f"{CacheManager.USER_CART}:{user_id}"
        await RedisClient.delete(cache_key)
        logger.info(f"Invalidated cart cache for user_id: {user_id}")
    
    @staticmethod
    async def invalidate_shop_cache(shop_id: int):
        """Invalidate shop-related cache keys."""
        patterns = [
            f"{CacheManager.SHOP_PRODUCTS}:{shop_id}*",
        ]
        
        for pattern in patterns:
            await RedisClient.delete_pattern(pattern)
        logger.info(f"Invalidated shop cache for shop_id: {shop_id}")
    
    @staticmethod
    def generate_cache_key(prefix: str, *args) -> str:
        """Generate a cache key from prefix and arguments."""
        if not args:
            return prefix
        
        import hashlib
        args_str = ":".join(str(arg) for arg in args)
        args_hash = hashlib.md5(args_str.encode()).hexdigest()[:8]
        return f"{prefix}:{args_hash}"
