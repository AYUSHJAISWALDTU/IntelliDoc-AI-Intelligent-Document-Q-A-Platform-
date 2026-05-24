from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import structlog

logger = structlog.get_logger()


class AppException(HTTPException):
    pass


class NotFoundError(AppException):
    def __init__(self, resource: str = "Resource"):
        super().__init__(status_code=404, detail=f"{resource} not found")


class ForbiddenError(AppException):
    def __init__(self, msg: str = "Access denied"):
        super().__init__(status_code=403, detail=msg)


class UnauthorizedError(AppException):
    def __init__(self, msg: str = "Not authenticated"):
        super().__init__(status_code=401, detail=msg)


class ConflictError(AppException):
    def __init__(self, msg: str = "Resource already exists"):
        super().__init__(status_code=409, detail=msg)


class ValidationError(AppException):
    def __init__(self, msg: str):
        super().__init__(status_code=422, detail=msg)


class StorageLimitError(AppException):
    def __init__(self):
        super().__init__(status_code=413, detail="Storage limit exceeded for this space")


class FileTooLargeError(AppException):
    def __init__(self, max_mb: int):
        super().__init__(status_code=413, detail=f"File exceeds maximum size of {max_mb}MB")


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning("validation_error", errors=exc.errors(), path=str(request.url))
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": str(exc.body)},
    )


async def generic_exception_handler(request: Request, exc: Exception):
    logger.error("unhandled_exception", error=str(exc), path=str(request.url), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )
